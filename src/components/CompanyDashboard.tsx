import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JobPostings } from "./JobPostings";
import { CompanyEmployees } from "./CompanyEmployees";
import { ExchangeManagement } from "./ExchangeManagement";
import { ChatList } from "./ChatList";
import { CompanySettings } from "./CompanySettings";
import { LegalInformation } from "./LegalInformation";

type Tab = "postings" | "employees" | "exchanges" | "chats" | "legal" | "settings";

export function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("postings");
  const [viewedTabs, setViewedTabs] = useState<Set<Tab>>(new Set(["postings"]));
  
  const exchanges = useQuery(api.companyExchanges.getExchangesForCompany);
  const myChats = useQuery(api.chats.getMyChats);
  const notifications = useQuery(api.notifications.getMyNotifications);
  const verificationRequests = useQuery(api.employees.getVerificationRequests);
  const user = useQuery(api.auth.loggedInUser);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setViewedTabs(prev => new Set([...prev, tab]));
  };

  // Count unread notifications for each tab
  const getTabNotificationCount = (tab: Tab) => {
    switch (tab) {
      case "employees":
        return verificationRequests?.length || 0;
      case "exchanges":
        return exchanges?.filter((ex: any) => ex.status === "mutual_interest").length || 0;
      case "chats":
        return myChats?.filter(chat => 
          chat.lastMessage && 
          chat.lastMessage.senderId !== user?._id &&
          !chat.lastMessage.isRead
        ).length || 0;
      default:
        return 0;
    }
  };

  const shouldShowNotification = (tab: Tab) => {
    return !viewedTabs.has(tab) && getTabNotificationCount(tab) > 0;
  };

  const tabs = [
    { id: "postings" as Tab, label: "Job Postings", icon: "📝" },
    { id: "employees" as Tab, label: "Employees", icon: "👥" },
    { id: "exchanges" as Tab, label: "Exchanges", icon: "🔄" },
    { id: "chats" as Tab, label: "Chats", icon: "💬" },
    { id: "legal" as Tab, label: "Legal Info", icon: "⚖️" },
    { id: "settings" as Tab, label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-[#ffa731] border-opacity-20">
        <div className="border-b border-[#ffa731] border-opacity-20">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm relative ${
                  activeTab === tab.id
                    ? "border-[#ffa731] text-[#ffa731]"
                    : "border-transparent text-gray-500 hover:text-[#1f1f1f] hover:border-[#ffa731] hover:border-opacity-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  {tab.label}
                  {shouldShowNotification(tab.id) && (
                    <span className="absolute -top-1 -right-1 bg-[#ffa731] text-[#2d2d2d] text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {getTabNotificationCount(tab.id)}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "postings" && <JobPostings />}
          {activeTab === "employees" && <CompanyEmployees />}
          {activeTab === "exchanges" && <ExchangeManagement />}
          {activeTab === "chats" && <ChatList />}
          {activeTab === "legal" && <LegalInformation userType="company" />}
          {activeTab === "settings" && <CompanySettings />}
        </div>
      </div>
    </div>
  );
}
