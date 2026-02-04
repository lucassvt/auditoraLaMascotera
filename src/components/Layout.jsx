import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileSearch,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Search,
  LogOut,
  Settings
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Vista general y KPIs'
    },
    {
      path: '/auditorias',
      icon: ClipboardCheck,
      label: 'Auditorias',
      description: 'Gestionar auditorias'
    },
    {
      path: '/checklist',
      icon: FileSearch,
      label: 'Checklist',
      description: 'Listas de control'
    },
    {
      path: '/reportes',
      icon: FileText,
      label: 'Reportes',
      description: 'Hallazgos e informes'
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-mascotera-dark flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } bg-mascotera-darker border-r border-mascotera-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-mascotera-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mascotera-accent/20 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-mascotera-accent" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-display text-lg font-semibold text-mascotera-text">
                  AUDITORIA
                </h1>
                <p className="text-xs text-mascotera-text-muted">La Mascotera</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={active ? 'nav-item-active' : 'nav-item'}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <div>
                    <span className="font-medium">{item.label}</span>
                    <p className="text-xs text-mascotera-text-muted mt-0.5">
                      {item.description}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-mascotera-border">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 text-mascotera-text-muted hover:text-mascotera-accent transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Colapsar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-mascotera-darker border-b border-mascotera-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-mascotera-text-muted" />
              <input
                type="text"
                placeholder="Buscar auditorias, reportes..."
                className="input-mascotera pl-10 w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-mascotera-text-muted hover:text-mascotera-accent transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-mascotera-danger rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 text-mascotera-text-muted hover:text-mascotera-accent transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-mascotera-border">
              <div className="text-right">
                <p className="text-sm font-medium text-mascotera-text">Auditor</p>
                <p className="text-xs text-mascotera-text-muted">Administrador</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-mascotera-accent/20 flex items-center justify-center">
                <User className="w-5 h-5 text-mascotera-accent" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
