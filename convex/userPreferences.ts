import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    userType: v.union(v.literal("company"), v.literal("employee")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if preference already exists
    const existingPreference = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingPreference) {
      // Update existing preference
      await ctx.db.patch(existingPreference._id, {
        userType: args.userType,
      });
      return existingPreference._id;
    }

    // Create new preference
    const preferenceId = await ctx.db.insert("userPreferences", {
      userId,
      userType: args.userType,
      createdAt: Date.now(),
    });

    return preferenceId;
  },
});

export const getMyPreference = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const preference = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return preference;
  },
});

export const deletePreference = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const preference = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (preference) {
      await ctx.db.delete(preference._id);
    }

    return null;
  },
});
