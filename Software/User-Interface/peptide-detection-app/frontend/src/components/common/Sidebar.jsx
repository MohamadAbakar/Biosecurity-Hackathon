import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/analysis',
    label: 'Analysis',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5H9z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="14 3 14 8 19 8" />
        <line x1="8" y1="13" x2="16" y2="13" strokeLinecap="round" />
        <line x1="8" y1="17" x2="12" y2="17" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/database',
    label: 'Peptide Database',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path strokeLinecap="round" d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path strokeLinecap="round" d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
      </svg>
    ),
  },
];

const Sidebar = () => (
  <aside className="w-52 bg-sidebar border-r border-sidebar-border flex-shrink-0 flex flex-col py-3 gap-0.5 px-2">
    {navItems.map(({ to, label, icon }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
            isActive
              ? 'bg-sidebar-accent text-sidebar-foreground'
              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
          }`
        }
      >
        {icon}
        {label}
      </NavLink>
    ))}
  </aside>
);

export default Sidebar;
