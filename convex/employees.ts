import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    jobTitle: v.string(),
    experience: v.string(),
    skills: v.array(v.string()),
    languages: v.array(v.object({
      language: v.string(),
      proficiency: v.union(v.literal("native"), v.literal("fluent"), v.literal("conversational"), v.literal("basic"))
    })),
    bio: v.string(),
    desiredDestinations: v.array(v.object({
      country: v.string(),
      priority: v.number()
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if employee already exists
    const existingEmployee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingEmployee) {
      throw new Error("Employee profile already exists");
    }

    const employeeId = await ctx.db.insert("employees", {
      userId,
      firstName: args.firstName,
      lastName: args.lastName,
      jobTitle: args.jobTitle,
      experience: args.experience,
      skills: args.skills,
      languages: args.languages,
      bio: args.bio,
      desiredDestinations: args.desiredDestinations,
      isVerified: false,
      companyId: undefined,
      createdAt: Date.now(),
    });

    return employeeId;
  },
});

export const update = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    jobTitle: v.string(),
    experience: v.string(),
    skills: v.array(v.string()),
    languages: v.array(v.object({
      language: v.string(),
      proficiency: v.union(v.literal("native"), v.literal("fluent"), v.literal("conversational"), v.literal("basic"))
    })),
    bio: v.string(),
    desiredDestinations: v.array(v.object({
      country: v.string(),
      priority: v.number()
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) {
      throw new Error("Employee profile not found");
    }

    await ctx.db.patch(employee._id, {
      firstName: args.firstName,
      lastName: args.lastName,
      jobTitle: args.jobTitle,
      experience: args.experience,
      skills: args.skills,
      languages: args.languages,
      bio: args.bio,
      desiredDestinations: args.desiredDestinations,
    });

    return employee._id;
  },
});

export const deleteProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) {
      throw new Error("Employee profile not found");
    }

    // Delete related data
    // 1. Delete job swaps
    const jobSwaps = await ctx.db
      .query("jobSwaps")
      .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
      .collect();
    
    for (const jobSwap of jobSwaps) {
      await ctx.db.delete(jobSwap._id);
    }

    // 2. Delete exchanges
    const exchanges = await ctx.db
      .query("exchanges")
      .filter((q) => 
        q.or(
          q.eq(q.field("fromEmployeeId"), employee._id),
          q.eq(q.field("toEmployeeId"), employee._id)
        )
      )
      .collect();
    
    for (const exchange of exchanges) {
      await ctx.db.delete(exchange._id);
    }

    // 3. Delete notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // 4. Delete the employee profile
    await ctx.db.delete(employee._id);

    return null;
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return employee;
  },
});

export const getMyEmployees = query({
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

    const employees = await ctx.db
      .query("employees")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) => q.eq(q.field("isVerified"), true))
      .collect();

    return employees;
  },
});

export const getVerificationRequests = query({
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

    const employees = await ctx.db
      .query("employees")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .filter((q) => q.eq(q.field("isVerified"), false))
      .collect();

    return employees;
  },
});

export const requestVerification = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) {
      throw new Error("Employee profile not found");
    }

    if (employee.companyId && employee.isVerified) {
      throw new Error("Employee is already verified with a company. Please remove current verification first.");
    }

    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    await ctx.db.patch(employee._id, {
      companyId: args.companyId,
      isVerified: false, // Reset verification status when changing companies
    });

    // Notify the company about the verification request
    await ctx.db.insert("notifications", {
      userId: company.userId,
      type: "verification_request",
      title: "New Employee Verification Request",
      message: `${employee.firstName} ${employee.lastName} has requested to join your company`,
      isRead: false,
      createdAt: Date.now(),
      relatedId: employee._id,
    });

    return null;
  },
});

export const changeVerificationCompany = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) {
      throw new Error("Employee profile not found");
    }

    if (employee.isVerified) {
      throw new Error("Cannot change company while verified. Please remove verification first.");
    }

    const company = await ctx.db.get(args.companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    await ctx.db.patch(employee._id, {
      companyId: args.companyId,
    });

    // Notify the new company about the verification request
    await ctx.db.insert("notifications", {
      userId: company.userId,
      type: "verification_request",
      title: "New Employee Verification Request",
      message: `${employee.firstName} ${employee.lastName} has requested to join your company`,
      isRead: false,
      createdAt: Date.now(),
      relatedId: employee._id,
    });

    return null;
  },
});

export const removeMyVerification = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) {
      throw new Error("Employee profile not found");
    }

    if (!employee.companyId) {
      throw new Error("No company association to remove");
    }

    const company = employee.companyId ? await ctx.db.get(employee.companyId) : null;

    // Deactivate any active job swaps for this employee
    const jobSwaps = await ctx.db
      .query("jobSwaps")
      .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const jobSwap of jobSwaps) {
      await ctx.db.patch(jobSwap._id, { isActive: false });
    }

    // Remove company association and verification
    await ctx.db.patch(employee._id, {
      companyId: undefined,
      isVerified: false,
    });

    // Notify the company if they were verified
    if (company && employee.isVerified) {
      await ctx.db.insert("notifications", {
        userId: company.userId,
        type: "employee_removed",
        title: "Employee Left Company",
        message: `${employee.firstName} ${employee.lastName} has removed their verification and left your company`,
        isRead: false,
        createdAt: Date.now(),
        relatedId: employee._id,
      });
    }

    return null;
  },
});

export const verifyEmployee = mutation({
  args: {
    employeeId: v.id("employees"),
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

    const employee = await ctx.db.get(args.employeeId);
    if (!employee || employee.companyId !== company._id) {
      throw new Error("Employee not found or not associated with your company");
    }

    await ctx.db.patch(args.employeeId, {
      isVerified: true,
    });

    // Notify the employee about verification
    await ctx.db.insert("notifications", {
      userId: employee.userId,
      type: "verification_approved",
      title: "Verification Approved",
      message: `Your employment with ${company.name} has been verified`,
      isRead: false,
      createdAt: Date.now(),
      relatedId: company._id,
    });

    return null;
  },
});

export const rejectEmployee = mutation({
  args: {
    employeeId: v.id("employees"),
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

    const employee = await ctx.db.get(args.employeeId);
    if (!employee || employee.companyId !== company._id) {
      throw new Error("Employee not found or not associated with your company");
    }

    await ctx.db.patch(args.employeeId, {
      companyId: undefined,
    });

    // Notify the employee about rejection
    await ctx.db.insert("notifications", {
      userId: employee.userId,
      type: "verification_rejected",
      title: "Verification Rejected",
      message: `Your verification request to ${company.name} has been rejected`,
      isRead: false,
      createdAt: Date.now(),
      relatedId: company._id,
    });

    return null;
  },
});

export const removeEmployee = mutation({
  args: {
    employeeId: v.id("employees"),
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

    const employee = await ctx.db.get(args.employeeId);
    if (!employee || employee.companyId !== company._id) {
      throw new Error("Employee not found or not associated with your company");
    }

    // Remove company association and verification
    await ctx.db.patch(args.employeeId, {
      companyId: undefined,
      isVerified: false,
    });

    // Deactivate any active job swaps for this employee
    const jobSwaps = await ctx.db
      .query("jobSwaps")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const jobSwap of jobSwaps) {
      await ctx.db.patch(jobSwap._id, { isActive: false });
    }

    // Notify the employee
    await ctx.db.insert("notifications", {
      userId: employee.userId,
      type: "employee_removed",
      title: "Removed from Company",
      message: `You have been removed from ${company.name}`,
      isRead: false,
      createdAt: Date.now(),
      relatedId: company._id,
    });

    return null;
  },
});

export const getAllEmployees = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const employees = await ctx.db.query("employees").collect();
    
    const employeesWithCompanies = await Promise.all(
      employees.map(async (employee) => {
        const company = employee.companyId ? await ctx.db.get(employee.companyId) : null;
        return { ...employee, company };
      })
    );

    return employeesWithCompanies;
  },
});
