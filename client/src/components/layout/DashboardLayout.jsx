import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";

const DashboardLayout = ({ children, tabs = [], activeTab, onTabChange, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Top bar */}
      <div className="glass-strong border-b border-dark-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{title}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-sm">{user?.name}</p>
                  <Badge status={user?.role} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/search")}
                className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-gray-400 border border-dark-border rounded-lg hover:bg-white/5 transition-colors"
              >
                Browse Site
              </button>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          {tabs.length > 0 && (
            <div className="flex gap-1 mt-4 overflow-x-auto pb-1 -mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`
                    px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all whitespace-nowrap
                    ${activeTab === tab.key
                      ? "bg-dark-card text-white border-t border-x border-blue-500/30"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }
                  `}
                >
                  {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500/80 text-white rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
