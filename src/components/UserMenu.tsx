"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

interface UserMenuProps {
  avatarUrl?: string;
  onSignOut: () => void;
}

export function UserMenu({ avatarUrl, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500/30 hover:border-emerald-400 transition-colors"
        aria-label="Menu do usuário"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-emerald-400 text-sm font-bold">U</span>
          </div>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 bg-gray-900 rounded-xl shadow-lg border border-gray-700 py-1 w-40">
            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
