"use client";

import { Home, BarChart3, Bell } from "lucide-react";

type Tab = "home" | "dashboard" | "alerts";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "home" as Tab, label: "Início", icon: Home },
    { id: "dashboard" as Tab, label: "Dashboard", icon: BarChart3 },
    { id: "alerts" as Tab, label: "Alertas", icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-[9999]" style={{ position: 'fixed' }}>
      <div className="max-w-md mx-auto flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-emerald-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              aria-label={tab.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
