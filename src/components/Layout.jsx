import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileSearch,
  FileText,
  Printer,
  Building2,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Search,
  LogOut,
  Settings,
  Clock,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
};

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { descargos } = useAudit();

  const descargosPendientes = descargos.filter(d => d.estado === 'pendiente');

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      label: 'Pilares',
      description: 'Pilares de control'
    },
    {
      path: '/reportes',
      icon: FileText,
      label: 'Reportes',
      description: 'Hallazgos e informes'
    },
    {
      path: '/informe',
      icon: Printer,
      label: 'Informe Auditoría',
      description: 'Generar informes PDF'
    },
    {
      path: '/sucursales',
      icon: Building2,
      label: 'Sucursales',
      description: 'Histórico y patrones'
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
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-mascotera-text-muted hover:text-mascotera-accent transition-colors"
              >
                <Bell className="w-5 h-5" />
                {descargosPendientes.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-mascotera-danger text-white text-[10px] font-bold rounded-full px-1">
                    {descargosPendientes.length > 99 ? '99+' : descargosPendientes.length}
                  </span>
                )}
              </button>

              {/* Dropdown de notificaciones */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-mascotera-card border border-mascotera-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="bg-mascotera-darker px-4 py-3 border-b border-mascotera-border flex items-center justify-between">
                    <h3 className="font-semibold text-mascotera-text text-sm">Notificaciones</h3>
                    {descargosPendientes.length > 0 && (
                      <span className="bg-mascotera-danger/20 text-mascotera-danger text-xs font-semibold px-2 py-0.5 rounded-full">
                        {descargosPendientes.length} pendiente{descargosPendientes.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {descargosPendientes.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="w-8 h-8 text-mascotera-text-muted mx-auto mb-2 opacity-40" />
                        <p className="text-sm text-mascotera-text-muted">No hay notificaciones pendientes</p>
                      </div>
                    ) : (
                      descargosPendientes
                        .sort((a, b) => new Date(b.fecha_descargo) - new Date(a.fecha_descargo))
                        .slice(0, 10)
                        .map(descargo => {
                          const sucNombre = descargo.sucursal_nombre
                            ? descargo.sucursal_nombre.replace(/^SUCURSAL\s+/i, '')
                            : `Sucursal #${descargo.sucursal_id}`;
                          return (
                            <button
                              key={descargo.id}
                              onClick={() => {
                                setNotifOpen(false);
                                navigate('/auditorias', { state: { openDescargos: true } });
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-mascotera-darker/50 transition-colors border-b border-mascotera-border/30 last:border-b-0"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-mascotera-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <MessageSquare className="w-4 h-4 text-mascotera-warning" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-mascotera-text truncate">{descargo.titulo}</p>
                                    <span className="text-[10px] text-mascotera-text-muted whitespace-nowrap">{formatTimeAgo(descargo.fecha_descargo)}</span>
                                  </div>
                                  <p className="text-xs text-mascotera-text-muted truncate mt-0.5">{descargo.descripcion}</p>
                                  <p className="text-[10px] text-mascotera-accent mt-1">{sucNombre}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })
                    )}
                  </div>

                  {descargosPendientes.length > 0 && (
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/auditorias', { state: { openDescargos: true } });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-mascotera-darker/50 border-t border-mascotera-border text-sm text-mascotera-accent hover:bg-mascotera-darker transition-colors"
                    >
                      Ver todos los descargos
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

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
