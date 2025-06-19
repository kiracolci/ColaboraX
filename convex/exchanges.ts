import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const cancelApplication = mutation({
  args: {
    exchangeId: v.id("exchanges"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const exchange = await ctx.db.get(args.exchangeId);
    if (!exchange) {
      throw new Error("Exchange not found");
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee || exchange.fromEmployeeId !== employee._id) {
      throw new Error("Not authorized to cancel this application");
    }

    await ctx.db.patch(args.exchangeId, {
      status: "cancelled",
    });

    return null;
  },
});

export const create = mutation({
  args: {
    toSwapId: v.id("jobSwaps"),
    message: v.optional(v.string()),
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

    if (!employee || !employee.isVerified || !employee.companyId) {
      throw new Error("Employee not verified or not associated with a company");
    }

    // Get the target job swap
    const toSwap = await ctx.db.get(args.toSwapId);
    if (!toSwap) {
      throw new Error("Target job swap not found");
    }

    // Get the applying employee's job swap (must exist since employee assignment is required)
    const fromSwap = await ctx.db
      .query("jobSwaps")
      .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!fromSwap) {
      throw new Error("You must have an active job posting to apply for exchanges");
    }

    // Check if there's already a pending exchange for this job swap
    const existingExchange = await ctx.db
      .query("exchanges")
      .withIndex("by_from_employee", (q) => q.eq("fromEmployeeId", employee._id))
      .filter((q) => q.eq(q.field("toSwapId"), args.toSwapId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .filter((q) => q.neq(q.field("status"), "rejected_by_from_company"))
      .filter((q) => q.neq(q.field("status"), "rejected_by_to_company"))
      .filter((q) => q.neq(q.field("status"), "rejected_by_to_employee"))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .first();

    if (existingExchange) {
      throw new Error("You already have a pending exchange for this job swap");
    }

    const company = await ctx.db.get(employee.companyId!);
    if (!company) {
      throw new Error("Company not found");
    }

    const targetEmployee = await ctx.db.get(toSwap.employeeId);
    if (!targetEmployee) {
      throw new Error("Target employee not found");
    }

    const exchangeId = await ctx.db.insert("exchanges", {
      fromSwapId: fromSwap._id,
      toSwapId: args.toSwapId,
      fromEmployeeId: employee._id,
      toEmployeeId: toSwap.employeeId,
      fromCompanyId: employee.companyId!,
      toCompanyId: toSwap.companyId,
      status: "pending_target_response",
      message: args.message,
      createdAt: Date.now(),
    });

    // Notify the target employee about the swap request
    await ctx.db.insert("notifications", {
      userId: targetEmployee.userId,
      type: "swap_interest",
      title: "Someone Wants to Swap with You",
      message: `${employee.firstName} ${employee.lastName} from ${company.name} wants to swap positions with you. Check your incoming applications!`,
      isRead: false,
      createdAt: Date.now(),
      relatedId: exchangeId,
    });

    return exchangeId;
  },
});

// This query is now used for employees to see incoming swap requests
export const getIncomingApplications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee || !employee.isVerified) return [];

    const exchanges = await ctx.db
      .query("exchanges")
      .withIndex("by_to_employee", (q) => q.eq("toEmployeeId", employee._id))
      .filter((q) => q.eq(q.field("status"), "pending_target_response"))
      .collect();

    return await Promise.all(
      exchanges.map(async (exchange) => {
        const fromSwap = await ctx.db.get(exchange.fromSwapId);
        const fromCompany = fromSwap ? await ctx.db.get(fromSwap.companyId) : null;
        const fromEmployee = await ctx.db.get(exchange.fromEmployeeId);
        
        return { ...exchange, fromSwap, fromCompany, fromEmployee };
      })
    );
  },
});

export const respondToSwapRequest = mutation({
  args: {
    exchangeId: v.id("exchanges"),
    response: v.union(v.literal("accept"), v.literal("decline")),
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
      throw new Error("Employee not found");
    }

    const exchange = await ctx.db.get(args.exchangeId);
    if (!exchange || exchange.toEmployeeId !== employee._id) {
      throw new Error("Exchange not found or not authorized");
    }

    if (args.response === "accept") {
      // Update status to mutual interest - now both companies need to approve
      await ctx.db.patch(args.exchangeId, {
        status: "mutual_interest",
      });

      // Notify both companies about the mutual interest
      const fromCompany = await ctx.db.get(exchange.fromCompanyId);
      const toCompany = await ctx.db.get(exchange.toCompanyId);

      if (fromCompany) {
        await ctx.db.insert("notifications", {
          userId: fromCompany.userId,
          type: "exchange_request",
          title: "Mutual Swap Interest - Approval Needed",
          message: `Both employees want to swap positions. Please review and approve the exchange in your Exchanges tab.`,
          isRead: false,
          createdAt: Date.now(),
          relatedId: args.exchangeId,
        });
      }

      if (toCompany) {
        await ctx.db.insert("notifications", {
          userId: toCompany.userId,
          type: "exchange_request",
          title: "Mutual Swap Interest - Approval Needed",
          message: `Both employees want to swap positions. Please review and approve the exchange in your Exchanges tab.`,
          isRead: false,
          createdAt: Date.now(),
          relatedId: args.exchangeId,
        });
      }
    } else {
      // Decline the swap request
      await ctx.db.patch(args.exchangeId, {
        status: "rejected_by_to_employee",
      });

      // Notify the requesting employee
      const fromEmployee = await ctx.db.get(exchange.fromEmployeeId);
      if (fromEmployee) {
        await ctx.db.insert("notifications", {
          userId: fromEmployee.userId,
          type: "exchange_rejected",
          title: "Swap Request Declined",
          message: `${employee.firstName} ${employee.lastName} has declined your swap request.`,
          isRead: false,
          createdAt: Date.now(),
          relatedId: args.exchangeId,
        });
      }
    }

    return null;
  },
});

// This query shows all applications made by the current employee
export const getMyExchanges = query({
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

    if (!employee) {
      return [];
    }

    // Get all exchanges where this employee is either the applicant OR the target
    const fromExchanges = await ctx.db
      .query("exchanges")
      .withIndex("by_from_employee", (q) => q.eq("fromEmployeeId", employee._id))
      .collect();
    
    const toExchanges = await ctx.db
      .query("exchanges")
      .withIndex("by_to_employee", (q) => q.eq("toEmployeeId", employee._id))
      .filter((q) => q.neq(q.field("status"), "pending_target_response")) // Exclude pending requests (those go to incoming)
      .collect();
    
    const exchanges = [...fromExchanges, ...toExchanges];

    // Get job swap and company details
    const exchangesWithDetails = await Promise.all(
      exchanges.map(async (exchange) => {
        const isFromEmployee = exchange.fromEmployeeId === employee._id;
        
        if (isFromEmployee) {
          const toSwap = await ctx.db.get(exchange.toSwapId);
          const toCompany = toSwap ? await ctx.db.get(toSwap.companyId) : null;
          const toEmployee = exchange.toEmployeeId ? await ctx.db.get(exchange.toEmployeeId) : null;
          
          return { ...exchange, toSwap, toCompany, toEmployee, isFromEmployee: true };
        } else {
          const fromSwap = await ctx.db.get(exchange.fromSwapId);
          const fromCompany = fromSwap ? await ctx.db.get(fromSwap.companyId) : null;
          const fromEmployee = await ctx.db.get(exchange.fromEmployeeId);
          
          return { ...exchange, fromSwap, fromCompany, fromEmployee, isFromEmployee: false };
        }
      })
    );

    return exchangesWithDetails;
  },
});

export const respondToExchange = mutation({
  args: {
    exchangeId: v.id("exchanges"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const exchange = await ctx.db.get(args.exchangeId);
    if (!exchange) {
      throw new Error("Exchange not found");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!company) {
      throw new Error("Company not found");
    }

    const isFromCompany = exchange.fromCompanyId === company._id;
    const isToCompany = exchange.toCompanyId === company._id;

    if (!isFromCompany && !isToCompany) {
      throw new Error("Not authorized to respond to this exchange");
    }

    if (args.status === "approved") {
      if (exchange.status === "mutual_interest") {
        if (isFromCompany && !exchange.fromCompanyApprovedAt) {
          await ctx.db.patch(args.exchangeId, {
            fromCompanyApprovedAt: Date.now(),
          });
          
          // Check if both companies have approved
          if (exchange.toCompanyApprovedAt) {
            // Both companies approved - complete the exchange and create chat
            await ctx.db.patch(args.exchangeId, {
              status: "completed",
            });
            
            await createExchangeChat(ctx, exchange, args.exchangeId);
          }
        } else if (isToCompany && !exchange.toCompanyApprovedAt) {
          await ctx.db.patch(args.exchangeId, {
            toCompanyApprovedAt: Date.now(),
          });
          
          // Check if both companies have approved
          if (exchange.fromCompanyApprovedAt) {
            // Both companies approved - complete the exchange and create chat
            await ctx.db.patch(args.exchangeId, {
              status: "completed",
            });
            
            await createExchangeChat(ctx, exchange, args.exchangeId);
          }
        }
      }
    } else {
      // Rejected
      const rejectionStatus = isFromCompany ? "rejected_by_from_company" : "rejected_by_to_company";
      await ctx.db.patch(args.exchangeId, {
        status: rejectionStatus,
      });

      // Notify the employees
      const fromEmployee = await ctx.db.get(exchange.fromEmployeeId);
      const toEmployee = exchange.toEmployeeId ? await ctx.db.get(exchange.toEmployeeId) : null;
      
      if (fromEmployee) {
        await ctx.db.insert("notifications", {
          userId: fromEmployee.userId,
          type: "exchange_rejected",
          title: "Exchange Rejected",
          message: `Your exchange request has been rejected by ${company.name}`,
          isRead: false,
          createdAt: Date.now(),
          relatedId: args.exchangeId,
        });
      }

      if (toEmployee) {
        await ctx.db.insert("notifications", {
          userId: toEmployee.userId,
          type: "exchange_rejected",
          title: "Exchange Rejected",
          message: `The exchange request has been rejected by ${company.name}`,
          isRead: false,
          createdAt: Date.now(),
          relatedId: args.exchangeId,
        });
      }
    }
  },
});

async function createExchangeChat(ctx: any, exchange: any, exchangeId: string) {
    // Get all the details for the chat
    const fromSwap = await ctx.db.get(exchange.fromSwapId);
    const toSwap = await ctx.db.get(exchange.toSwapId);
    const fromCompany = fromSwap ? await ctx.db.get(fromSwap.companyId) : null;
    const toCompany = toSwap ? await ctx.db.get(toSwap.companyId) : null;
    const fromEmployee = await ctx.db.get(exchange.fromEmployeeId);
    const toEmployee = exchange.toEmployeeId ? await ctx.db.get(exchange.toEmployeeId) : null;

    // IMPORTANT: Deactivate both job postings since the exchange is now completed
    if (fromSwap) {
      await ctx.db.patch(fromSwap._id, {
        isActive: false,
      });
    }
    
    if (toSwap) {
      await ctx.db.patch(toSwap._id, {
        isActive: false,
      });
    }

    // Create participants list: both employees + hosting company
    const participants = [];
    if (fromEmployee) participants.push(fromEmployee.userId);
    if (toEmployee) participants.push(toEmployee.userId);
    if (toCompany) participants.push(toCompany.userId); // Hosting company

    await ctx.db.insert("chats", {
      exchangeId: exchangeId,
      participants,
      isActive: true,
    });

    // Notify all participants about the completed exchange
    for (const participantId of participants) {
      await ctx.db.insert("notifications", {
        userId: participantId,
        type: "exchange_completed",
        title: "Exchange Approved & Chat Created!",
        message: "Both companies have approved the exchange. Your job postings have been archived and you can now chat with all parties to coordinate the swap.",
        isRead: false,
        createdAt: Date.now(),
        relatedId: exchangeId,
      });
    }
}
