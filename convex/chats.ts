import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getDisplayName(ctx: any, userId: string): Promise<string> {
  const employee = await ctx.db
    .query("employees")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();
  
  if (employee) {
    const company = employee.companyId ? await ctx.db.get(employee.companyId) : null;
    return `${employee.firstName} ${employee.lastName}${company ? ` (${company.name})` : ""}`;
  }
  
  const company = await ctx.db
    .query("companies")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();
  
  if (company) {
    return company.name;
  }
  
  const user = await ctx.db.get(userId);
  return user?.name || "Unknown";
}

export const getMyChats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const allChats = await ctx.db.query("chats").collect();
    const chats = allChats.filter(chat => chat.participants.includes(userId));

    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        const exchange = await ctx.db.get(chat.exchangeId);
        const fromSwap = exchange ? await ctx.db.get(exchange.fromSwapId) : null;
        const toSwap = exchange ? await ctx.db.get(exchange.toSwapId) : null;
        const fromCompany = fromSwap ? await ctx.db.get(fromSwap.companyId) : null;
        const toCompany = toSwap ? await ctx.db.get(toSwap.companyId) : null;

        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
          .order("desc")
          .first();

        return {
          ...chat,
          exchange,
          fromSwap,
          toSwap,
          fromCompany,
          toCompany,
          lastMessage,
        };
      })
    );

    return chatsWithDetails.sort((a, b) => 
      (b.lastMessage?.timestamp || b._creationTime) - (a.lastMessage?.timestamp || a._creationTime)
    );
  },
});

export const getMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || !chat.participants.includes(userId)) {
      throw new Error("Not authorized to view this chat");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();

    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        const displayName = await getDisplayName(ctx, message.senderId);
        return {
          ...message,
          sender,
          displayName,
        };
      })
    );

    return messagesWithSenders;
  },
});

export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || !chat.participants.includes(userId)) {
      throw new Error("Not authorized to send messages in this chat");
    }

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: userId,
      content: args.content,
      timestamp: Date.now(),
      isRead: false,
    });

    // Update chat's last message time
    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
    });

    // Create notifications for other participants
    const sender = await ctx.db.get(userId);
    for (const participantId of chat.participants) {
      if (participantId !== userId) {
        await ctx.db.insert("notifications", {
          userId: participantId,
          type: "new_message",
          title: "New Message",
          message: `${sender?.name || "Someone"} sent you a message`,
          isRead: false,
          createdAt: Date.now(),
          relatedId: args.chatId,
        });
      }
    }

    return messageId;
  },
});

export const markMessagesAsRead = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || !chat.participants.includes(userId)) {
      throw new Error("Not authorized");
    }

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .filter((q) => q.neq(q.field("senderId"), userId))
      .collect();

    for (const message of unreadMessages) {
      await ctx.db.patch(message._id, { isRead: true });
    }
  },
});
