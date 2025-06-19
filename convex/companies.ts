import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    industry: v.string(),
    size: v.string(),
    description: v.string(),
    website: v.optional(v.string()),
    headquarters: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if company already exists for this user
    const existingCompany = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingCompany) {
      throw new Error("Company already exists for this user");
    }

    const companyId = await ctx.db.insert("companies", {
      userId,
      name: args.name,
      industry: args.industry,
      size: args.size,
      description: args.description,
      website: args.website,
      headquarters: args.headquarters,
      country: args.country,
      isVerified: false,
      createdAt: Date.now(),
    });

    return companyId;
  },
});

export const update = mutation({
  args: {
    name: v.string(),
    industry: v.string(),
    size: v.string(),
    description: v.string(),
    website: v.optional(v.string()),
    headquarters: v.string(),
    country: v.string(),
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

    await ctx.db.patch(company._id, {
      name: args.name,
      industry: args.industry,
      size: args.size,
      description: args.description,
      website: args.website,
      headquarters: args.headquarters,
      country: args.country,
    });

    return company._id;
  },
});

export const deleteProfile = mutation({
  args: {},
  handler: async (ctx) => {
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

    // Delete related data
    // 1. Remove company association from employees
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .collect();
    
    for (const employee of employees) {
      await ctx.db.patch(employee._id, {
        companyId: undefined,
        isVerified: false,
      });
    }

    // 2. Delete job swaps
    const jobSwaps = await ctx.db
      .query("jobSwaps")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .collect();
    
    for (const jobSwap of jobSwaps) {
      await ctx.db.delete(jobSwap._id);
    }

    // 3. Delete exchanges
    const exchanges = await ctx.db
      .query("exchanges")
      .filter((q) => 
        q.or(
          q.eq(q.field("fromCompanyId"), company._id),
          q.eq(q.field("toCompanyId"), company._id)
        )
      )
      .collect();
    
    for (const exchange of exchanges) {
      await ctx.db.delete(exchange._id);
    }

    // 4. Delete notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // 5. Delete the company profile
    await ctx.db.delete(company._id);

    return null;
  },
});

export const getMyCompany = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return company;
  },
});

export const getAllCompanies = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    return companies;
  },
});

// Alias for backward compatibility
export const getAll = getAllCompanies;
