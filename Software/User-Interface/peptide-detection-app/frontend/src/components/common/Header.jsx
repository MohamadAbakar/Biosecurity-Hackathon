import React from 'react';
import { useAuth } from '../../hooks/useAuth';
const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between flex-shrink-0 z-10">
      {/* Brand */}
      <span className="font-semibold text-sm text-foreground tracking-tight">PepTrace</span>

      {/* Right cluster */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground uppercase">
              {user.username?.[0] ?? '?'}
            </div>
            <div className="hidden sm:block leading-none">
              <div className="text-xs font-medium text-foreground">{user.username}</div>
              <div className="text-[10px] text-muted-foreground capitalize">{user.role}</div>
            </div>
          </div>

          <div className="h-4 w-px bg-border" />

          <button
            onClick={logout}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
