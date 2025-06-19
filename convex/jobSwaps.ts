import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to check language compatibility
function checkLanguageCompatibility(employeeLanguages: any[], requiredLanguages: any[]): boolean {
  if (!requiredLanguages || requiredLanguages.length === 0) {
    return true; // No language requirements
  }
  
  if (!employeeLanguages || employeeLanguages.length === 0) {
    return false; // Employee has no languages but job requires some
  }

  const proficiencyLevels: Record<string, number> = {
    "basic": 1,
    "conversational": 2,
    "fluent": 3,
    "native": 4
  };

  return requiredLanguages.every(required => {
    return employeeLanguages.some(empLang => 
      empLang.language.toLowerCase() === required.language.toLowerCase() &&
      (proficiencyLevels[empLang.proficiency] || 0) >= (proficiencyLevels[required.proficiency] || 0)
    );
  });
}

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    requiredLanguages: v.optional(v.array(v.object({
      language: v.string(),
      proficiency: v.union(
        v.literal("native"),
        v.literal("fluent"),
        v.literal("conversational"),
        v.literal("basic")
      ),
    }))),
    location: v.string(),
    country: v.string(),
    duration: v.string(),
    benefits: v.array(v.string()),
    employeeId: v.id("employees"), // Now REQUIRED
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) {
      throw new Error("Company not found");
    }

    // Verify the employee belongs to this company
    const employee = await ctx.db.get(args.employeeId);
    if (!employee || employee.companyId !== company._id) {
      throw new Error("Employee does not belong to your company");
    }

    // Check if this employee already has an active job posting
    const existingJobSwap = await ctx.db
      .query("jobSwaps")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (existingJobSwap) {
      throw new Error("This employee already has an active job posting");
    }

    return await ctx.db.insert("jobSwaps", {
      ...args,
      companyId: company._id,
      isActive: true,
    });
  },
});

export const getMyCompanyJobSwaps = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) {
      return [];
    }

    const jobSwaps = await ctx.db
      .query("jobSwaps")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .collect();

    // Get employee details for each job swap
    const jobSwapsWithEmployees = await Promise.all(
      jobSwaps.map(async (jobSwap) => {
        const employee = await ctx.db.get(jobSwap.employeeId);
        return {
          ...jobSwap,
          employee,
        };
      })
    );

    return jobSwapsWithEmployees;
  },
});

export const getAvailableOpportunities = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee || !employee.isVerified || !employee.companyId) {
      return [];
    }

    // Get all active job swaps from OTHER companies (not employee's own company)
    const allJobSwaps = await ctx.db
      .query("jobSwaps")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.neq(q.field("companyId"), employee.companyId))
      .collect();

    // Get all exchanges where this employee is involved as the initiator (fromEmployee)
    const outgoingExchanges = await ctx.db
      .query("exchanges")
      .withIndex("by_from_employee", (q) => q.eq("fromEmployeeId", employee._id))
      .filter((q) => q.or(
        q.eq(q.field("status"), "pending_target_response"),
        q.eq(q.field("status"), "mutual_interest"),
        q.eq(q.field("status"), "completed")
      ))
      .collect();

    // Get all exchanges where this employee is the target (toEmployee)
    const incomingExchanges = await ctx.db
      .query("exchanges")
      .withIndex("by_to_employee", (q) => q.eq("toEmployeeId", employee._id))
      .filter((q) => q.or(
        q.eq(q.field("status"), "pending_target_response"),
        q.eq(q.field("status"), "mutual_interest"),
        q.eq(q.field("status"), "completed")
      ))
      .collect();

    // Create sets of job swap IDs that should be filtered out
    const appliedToSwapIds = new Set(outgoingExchanges.map(ex => ex.toSwapId));
    const incomingFromSwapIds = new Set(incomingExchanges.map(ex => ex.fromSwapId));

    // Filter out job swaps that:
    // 1. This employee has already applied to (outgoing applications)
    // 2. Where someone has applied to this employee's position (incoming applications)
    const availableJobSwaps = allJobSwaps.filter(jobSwap => 
      !appliedToSwapIds.has(jobSwap._id) && !incomingFromSwapIds.has(jobSwap._id)
    );

    // Get company and employee details for each job swap and check language compatibility
    const jobSwapsWithDetails = await Promise.all(
      availableJobSwaps.map(async (jobSwap) => {
        const company = await ctx.db.get(jobSwap.companyId);
        const currentEmployee = await ctx.db.get(jobSwap.employeeId);
        
        // Check language compatibility
        const isLanguageCompatible = checkLanguageCompatibility(
          employee.languages || [],
          jobSwap.requiredLanguages || []
        );
        
        return {
          ...jobSwap,
          company,
          currentEmployee,
          isLanguageCompatible,
        };
      })
    );

    return jobSwapsWithDetails;
  },
});

// New query for companies to see all job swaps (read-only)
export const getAllJobSwaps = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Check if user is a company
    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) {
      return [];
    }

    // Get all active job swaps from ALL companies
    const allJobSwaps = await ctx.db
      .query("jobSwaps")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get company and employee details for each job swap
    const jobSwapsWithDetails = await Promise.all(
      allJobSwaps.map(async (jobSwap) => {
        const jobCompany = await ctx.db.get(jobSwap.companyId);
        const currentEmployee = await ctx.db.get(jobSwap.employeeId);
        return {
          ...jobSwap,
          company: jobCompany,
          currentEmployee,
        };
      })
    );

    return jobSwapsWithDetails;
  },
});

export const update = mutation({
  args: {
    id: v.id("jobSwaps"),
    title: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    requiredLanguages: v.optional(v.array(v.object({
      language: v.string(),
      proficiency: v.union(
        v.literal("native"),
        v.literal("fluent"),
        v.literal("conversational"),
        v.literal("basic")
      ),
    }))),
    location: v.string(),
    country: v.string(),
    duration: v.string(),
    benefits: v.array(v.string()),
    employeeId: v.id("employees"), // Now REQUIRED
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) {
      throw new Error("Company not found");
    }

    const jobSwap = await ctx.db.get(args.id);
    if (!jobSwap || jobSwap.companyId !== company._id) {
      throw new Error("Job swap not found or not authorized");
    }

    // Verify the employee belongs to this company
    const employee = await ctx.db.get(args.employeeId);
    if (!employee || employee.companyId !== company._id) {
      throw new Error("Employee does not belong to your company");
    }

    // Check if another employee already has an active job posting (excluding current one)
    if (args.employeeId !== jobSwap.employeeId) {
      const existingJobSwap = await ctx.db
        .query("jobSwaps")
        .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .filter((q) => q.neq(q.field("_id"), args.id))
        .first();

      if (existingJobSwap) {
        throw new Error("This employee already has an active job posting");
      }
    }

    const { id, ...updateData } = args;
    await ctx.db.patch(id, updateData);
    return id;
  },
});

export const delete_ = mutation({
  args: {
    id: v.id("jobSwaps"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) {
      throw new Error("Company not found");
    }

    const jobSwap = await ctx.db.get(args.id);
    if (!jobSwap || jobSwap.companyId !== company._id) {
      throw new Error("Job swap not found or not authorized");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

export const toggleActive = mutation({
  args: {
    id: v.id("jobSwaps"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) {
      throw new Error("Company not found");
    }

    const jobSwap = await ctx.db.get(args.id);
    if (!jobSwap || jobSwap.companyId !== company._id) {
      throw new Error("Job swap not found or not authorized");
    }

    await ctx.db.patch(args.id, { isActive: args.isActive });
    return args.id;
  },
});
