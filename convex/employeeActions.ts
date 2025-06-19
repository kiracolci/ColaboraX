import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const approveVerification = mutation({
  args: {
    requestId: v.id("employeeVerificationRequests"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    const company = await ctx.db.get(request.companyId);
    if (!company || company.userId !== userId) {
      throw new Error("Not authorized");
    }

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: "approved",
      respondedAt: Date.now(),
    });

    // Update the employee to be verified and associate with company
    await ctx.db.patch(request.employeeId, {
      isVerified: true,
      companyId: request.companyId,
    });

    // Create notification for the employee
    const employee = await ctx.db.get(request.employeeId);
    if (employee) {
      await ctx.db.insert("notifications", {
        userId: employee.userId,
        type: "employee_verification",
        title: "Verification Approved!",
        message: `Your employment at ${company.name} has been verified.`,
        isRead: false,
        createdAt: Date.now(),
        relatedId: args.requestId,
      });
    }
  },
});

export const rejectVerification = mutation({
  args: {
    requestId: v.id("employeeVerificationRequests"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    const company = await ctx.db.get(request.companyId);
    if (!company || company.userId !== userId) {
      throw new Error("Not authorized");
    }

    // Update the request status
    await ctx.db.patch(args.requestId, {
      status: "rejected",
      respondedAt: Date.now(),
    });

    // Create notification for the employee
    const employee = await ctx.db.get(request.employeeId);
    if (employee) {
      await ctx.db.insert("notifications", {
        userId: employee.userId,
        type: "employee_verification",
        title: "Verification Rejected",
        message: `Your verification request for ${company.name} has been rejected.`,
        isRead: false,
        createdAt: Date.now(),
        relatedId: args.requestId,
      });
    }
  },
});
