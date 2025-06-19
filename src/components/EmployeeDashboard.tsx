import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JobOpportunities } from "./JobOpportunities";
import { MySwapRequests } from "./MySwapRequests";
import { IncomingApplications } from "./CompanyVerification";
import { ChatList } from "./ChatList";
import { EmployeeSettings } from "./EmployeeSettings";
import { CompanyVerification } from "./CompanyVerification";
import { LegalInformation } from "./LegalInformation";

type Tab = "opportunities" | "my-requests" | "incoming" | "chats" | "verification" | "legal" | "settings";

export function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("opportunities");
  const [viewedTabs, setViewedTabs] = useState<Set<Tab>>(new Set(["opportunities"]));
  
  const incomingApplications = useQuery(api.exchanges.getIncomingApplications);
  const myChats = useQuery(api.chats.getMyChats);
  const notifications = useQuery(api.notifications.getMyNotifications);
  const user = useQuery(api.auth.loggedInUser);
  const employee = useQuery(api.employees.getMyProfile);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setViewedTabs(prev => new Set([...prev, tab]));
  };

  // Count unread notifications for each tab
  const getTabNotificationCount = (tab: Tab) => {
    switch (tab) {
      case "incoming":
        return incomingApplications?.length || 0;
      case "chats":
        return myChats?.filter(chat => 
          chat.lastMessage && 
          chat.lastMessage.senderId !== user?._id &&
          !chat.lastMessage.isRead
        ).length || 0;
      case "my-requests":
        // Count exchanges with status changes
        return notifications?.filter(n => 
          !n.isRead && 
          (n.type === "exchange_completed" || n.type === "exchange_rejected")
        ).length || 0;
      case "verification":
        // Show notification if not verified
        return (!employee?.isVerified && !employee?.companyId) ? 1 : 0;
      default:
        return 0;
    }
  };

  const shouldShowNotification = (tab: Tab) => {
    return !viewedTabs.has(tab) && getTabNotificationCount(tab) > 0;
  };

  const tabs = [
    { id: "opportunities" as Tab, label: "Job Opportunities", icon: "🌍" },
    { id: "my-requests" as Tab, label: "My Applications", icon: "📋" },
    { id: "incoming" as Tab, label: "Incoming Requests", icon: "📥" },
    { id: "chats" as Tab, label: "Chats", icon: "💬" },
    { id: "verification" as Tab, label: "Company Verification", icon: "✅" },
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
          {activeTab === "opportunities" && <JobOpportunities />}
          {activeTab === "my-requests" && <MySwapRequests />}
          {activeTab === "incoming" && <IncomingApplications />}
          {activeTab === "chats" && <ChatList />}
          {activeTab === "verification" && <CompanyVerification />}
          {activeTab === "legal" && <LegalInformation userType="employee" />}
          {activeTab === "settings" && <EmployeeSettings />}
        </div>
      </div>
    </div>
  );
}
