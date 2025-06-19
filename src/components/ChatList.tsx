import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChatInterface } from "./ChatInterface";

export function ChatList() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const chats = useQuery(api.chats.getMyChats);

  if (selectedChatId) {
    return (
      <ChatInterface
        chatId={selectedChatId}
        onBack={() => setSelectedChatId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Your Exchange Chats</h2>
      
      {!chats?.length ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No active chats yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Chats are created when both companies approve an exchange.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChatId(chat._id)}
              className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Exchange: {chat.fromCompany?.name} ↔ {chat.toCompany?.name}
                  </h3>
                  <div className="text-sm text-gray-600 mb-2">
                    <p><strong>Positions:</strong> {chat.fromSwap?.title} ↔ {chat.toSwap?.title}</p>
                    <p><strong>Locations:</strong> {chat.fromSwap?.location} ↔ {chat.toSwap?.location}</p>
                  </div>
                  {chat.lastMessage && (
                    <div className="text-sm text-gray-500">
                      <strong>Last message:</strong> {chat.lastMessage.content.substring(0, 50)}
                      {chat.lastMessage.content.length > 50 ? "..." : ""}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {chat.lastMessage 
                    ? new Date(chat.lastMessage.timestamp).toLocaleDateString()
                    : new Date(chat._creationTime).toLocaleDateString()
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
