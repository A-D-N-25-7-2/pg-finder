import { createContext, useContext, useState, useCallback, useRef } from "react";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboardTabs, setDashboardTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [onTabChange, setOnTabChange] = useState(null);
  const pendingTab = useRef(null);

  const registerDashboard = useCallback((tabs, currentTab, changeHandler) => {
    setDashboardTabs(tabs);
    setActiveTab(currentTab);
    setOnTabChange(() => changeHandler);

    // If there's a pending tab from a navbar click before this dashboard mounted, apply it now
    if (pendingTab.current) {
      const tab = pendingTab.current;
      pendingTab.current = null;
      // Small delay to let the dashboard finish mounting
      setTimeout(() => changeHandler(tab), 0);
    }
  }, []);

  const unregisterDashboard = useCallback(() => {
    setDashboardTabs([]);
    setActiveTab("");
    setOnTabChange(null);
  }, []);

  const updateActiveTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Called by Navbar when clicking a tab while NOT on a dashboard page
  const setPendingTab = useCallback((tab) => {
    pendingTab.current = tab;
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        dashboardTabs,
        activeTab,
        onTabChange,
        registerDashboard,
        unregisterDashboard,
        updateActiveTab,
        setPendingTab,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
