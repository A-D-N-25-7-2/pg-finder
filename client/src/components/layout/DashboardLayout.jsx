import { useEffect } from "react";
import { useDashboard } from "../../context/DashboardContext";

const DashboardLayout = ({ children, tabs = [], activeTab, onTabChange }) => {
  const { registerDashboard, unregisterDashboard, updateActiveTab } =
    useDashboard();

  // Register tabs with context so Navbar can display them
  useEffect(() => {
    registerDashboard(tabs, activeTab, onTabChange);
    return () => unregisterDashboard();
  }, [tabs.length]); // Only re-register when tabs array changes

  // Keep context's activeTab in sync
  useEffect(() => {
    updateActiveTab(activeTab);
  }, [activeTab, updateActiveTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-base">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
