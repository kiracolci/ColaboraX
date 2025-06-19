import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getExchangesForCompany = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) return [];

    const fromExchanges = await ctx.db
      .query("exchanges")
      .withIndex("by_from_company", (q) => q.eq("fromCompanyId", company._id))
      .collect();

    const toExchanges = await ctx.db
      .query("exchanges")
      .withIndex("by_to_company", (q) => q.eq("toCompanyId", company._id))
      .collect();

    const allExchanges = [...fromExchanges, ...toExchanges];

    return await Promise.all(
      allExchanges.map(async (exchange) => {
        const fromSwap = await ctx.db.get(exchange.fromSwapId);
        const toSwap = await ctx.db.get(exchange.toSwapId);
        const fromCompany = fromSwap ? await ctx.db.get(fromSwap.companyId) : null;
        const toCompany = toSwap ? await ctx.db.get(toSwap.companyId) : null;
        const fromEmployee = await ctx.db.get(exchange.fromEmployeeId);
        const toEmployee = exchange.toEmployeeId ? await ctx.db.get(exchange.toEmployeeId) : null;
        
        return {
          ...exchange,
          fromSwap,
          toSwap,
          fromCompany,
          toCompany,
          fromEmployee,
          toEmployee,
        };
      })
    );
  },
});
