import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ChatInterfaceProps {
  chatId: string;
  onBack: () => void;
}

export function ChatInterface({ chatId, onBack }: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery(api.chats.getMessages, { chatId: chatId as any });
  const sendMessage = useMutation(api.chats.sendMessage);
  const markAsRead = useMutation(api.chats.markMessagesAsRead);
  const user = useQuery(api.auth.loggedInUser);
  const employee = useQuery(api.employees.getMyProfile);
  const company = useQuery(api.companies.getMyCompany);

  useEffect(() => {
    if (messages) {
      markAsRead({ chatId: chatId as any });
    }
  }, [messages, markAsRead, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        chatId: chatId as any,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  const getDisplayName = (senderId: string) => {
    if (senderId === user?._id) {
      if (employee) {
        return `${employee.firstName} ${employee.lastName}`;
      } else if (company) {
        return company.name;
      }
    }
    
    // For other participants, we'll use the sender info from the message
    return null;
  };

  if (!messages) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
        <h3 className="text-lg font-semibold">Exchange Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.senderId === user?._id;
            const displayName = message.displayName || getDisplayName(message.senderId) || "Unknown";
            
            return (
              <div
                key={message._id}
                className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMyMessage
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {displayName}
                  </div>
                  <div>{message.content}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
