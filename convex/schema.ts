import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userPreferences: defineTable({
    userId: v.id("users"),
    userType: v.union(v.literal("company"), v.literal("employee")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  companies: defineTable({
    name: v.string(),
    headquarters: v.optional(v.string()),
    location: v.optional(v.string()), // Legacy field
    country: v.string(),
    description: v.string(),
    industry: v.string(),
    size: v.optional(v.string()),
    website: v.optional(v.string()),
    userId: v.id("users"), // The user who registered this company
    isVerified: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  employees: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    jobTitle: v.string(),
    experience: v.string(),
    skills: v.array(v.string()),
    languages: v.optional(v.array(v.object({
      language: v.string(),
      proficiency: v.union(
        v.literal("native"),
        v.literal("fluent"),
        v.literal("conversational"),
        v.literal("basic")
      ),
    }))),
    companyId: v.optional(v.id("companies")),
    isVerified: v.boolean(),
    desiredDestinations: v.optional(v.array(v.object({
      country: v.string(),
      priority: v.number(), // 1-5, where 5 is highest preference
    }))),
    countryPreferences: v.optional(v.array(v.object({
      country: v.string(),
      priority: v.number(), // Legacy field for migration
    }))),
    bio: v.string(),
    profileImage: v.optional(v.id("_storage")),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_company", ["companyId"])
    .index("by_job_title", ["jobTitle"]),

  jobSwaps: defineTable({
    companyId: v.id("companies"),
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
    duration: v.string(), // e.g., "6 months", "1 year"
    isActive: v.boolean(),
    employeeId: v.id("employees"), // REQUIRED: employee currently in this position
    benefits: v.array(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  }).index("by_company", ["companyId"])
    .index("by_title", ["title"])
    .index("by_country", ["country"])
    .index("by_employee", ["employeeId"]),

  employeeVerificationRequests: defineTable({
    employeeId: v.id("employees"),
    companyId: v.id("companies"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    requestedAt: v.number(),
    respondedAt: v.optional(v.number()),
  }).index("by_company", ["companyId"])
    .index("by_employee", ["employeeId"]),

  exchanges: defineTable({
    fromSwapId: v.id("jobSwaps"),
    toSwapId: v.id("jobSwaps"),
    fromEmployeeId: v.id("employees"),
    toEmployeeId: v.id("employees"), // Now REQUIRED since all job swaps have employees
    fromCompanyId: v.id("companies"),
    toCompanyId: v.id("companies"),
    status: v.union(
      v.literal("pending_target_response"), // Waiting for target employee to respond
      v.literal("mutual_interest"), // Both employees have agreed - waiting for company approvals
      v.literal("completed"), // Both companies approved - exchange is complete with chat created
      v.literal("rejected_by_from_company"), // From company rejected
      v.literal("rejected_by_to_company"), // To company rejected
      v.literal("rejected_by_to_employee"), // Target employee declined the swap
      v.literal("cancelled"), // Cancelled by requesting employee
      // Legacy statuses for migration compatibility
      v.literal("pending"),
      v.literal("approved_by_from_company"),
      v.literal("approved_by_both_companies"),
      v.literal("accepted_by_from_employee"),
      v.literal("rejected_by_from_employee")
    ),
    message: v.optional(v.string()),
    createdAt: v.number(),
    fromCompanyApprovedAt: v.optional(v.number()),
    toCompanyApprovedAt: v.optional(v.number()),
    fromEmployeeAcceptedAt: v.optional(v.number()),
    toEmployeeAcceptedAt: v.optional(v.number()),
  }).index("by_from_swap", ["fromSwapId"])
    .index("by_to_swap", ["toSwapId"])
    .index("by_from_employee", ["fromEmployeeId"])
    .index("by_to_employee", ["toEmployeeId"])
    .index("by_from_company", ["fromCompanyId"])
    .index("by_to_company", ["toCompanyId"]),

  chats: defineTable({
    exchangeId: v.id("exchanges"),
    participants: v.array(v.id("users")), // Both employees + hosting company
    lastMessageAt: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_exchange", ["exchangeId"])
    .index("by_participants", ["participants"]),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
    isRead: v.boolean(),
  }).index("by_chat", ["chatId"])
    .index("by_sender", ["senderId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("exchange_request"),
      v.literal("exchange_approved"),
      v.literal("exchange_rejected"),
      v.literal("employee_verification"),
      v.literal("new_message"),
      v.literal("exchange_completed"),
      v.literal("swap_interest"), // When someone is interested in swapping
      v.literal("verification_request"),
      v.literal("verification_approved"),
      v.literal("verification_rejected"),
      v.literal("employee_removed")
    ),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
    relatedId: v.optional(v.string()), // ID of related exchange, employee, etc.
  }).index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
