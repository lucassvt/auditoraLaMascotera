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
  MessageSquare,
  ArrowRight,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Package
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
  const { descargos, conteosPendientes, currentUser, loginUser, logoutUser, userDisplayName, isAuditor, isPilaresOnly } = useAudit();

  // Login form state
  const [loginUsuario, setLoginUsuario] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const descargosPendientes = descargos.filter(d => d.estado === 'pendiente');
  const totalNotificaciones = descargosPendientes.length + conteosPendientes.length;

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

  // Redirigir usuarios pilares_only a /checklist si intentan otra ruta
  useEffect(() => {
    if (currentUser && isPilaresOnly && location.pathname !== '/checklist') {
      navigate('/checklist', { replace: true });
    }
  }, [currentUser, isPilaresOnly, location.pathname, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsuario.trim() || !loginPassword) return;

    setLoginLoading(true);
    setLoginError('');

    const result = await loginUser(loginUsuario.trim(), loginPassword);

    if (!result.success) {
      setLoginError(result.error);
    } else {
      setLoginUsuario('');
      setLoginPassword('');
    }
    setLoginLoading(false);
  };

  // Todas las opciones del menú
  const allMenuItems = [
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

  // Filtrar menú según nivel de acceso
  const menuItems = isPilaresOnly
    ? allMenuItems.filter(item => item.path === '/checklist')
    : allMenuItems;

  const isActive = (path) => location.pathname === path;

  const accessLevelLabel = {
    auditor: 'Auditor',
    full: 'Acceso Completo',
    pilares_only: 'Observador'
  };

  // ========== PANTALLA DE LOGIN ==========
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-mascotera-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-mascotera-accent/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-mascotera-accent" />
            </div>
            <h1 className="font-display text-2xl font-bold text-mascotera-text">
              AUDITORIA
            </h1>
            <p className="text-mascotera-text-muted mt-1">La Mascotera</p>
          </div>

          {/* Login Form */}
          <div className="card-mascotera">
            <div className="flex items-center gap-2 mb-6">
              <LogIn className="w-5 h-5 text-mascotera-accent" />
              <h2 className="text-lg font-semibold text-mascotera-text">Iniciar Sesión</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-mascotera-text-muted mb-1.5 block">Usuario</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mascotera-text-muted" />
                  <input
                    type="text"
                    value={loginUsuario}
                    onChange={(e) => { setLoginUsuario(e.target.value); setLoginError(''); }}
                    placeholder="Tu usuario..."
                    className="input-mascotera w-full pl-10"
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-mascotera-text-muted mb-1.5 block">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                    placeholder="Tu contraseña..."
                    className="input-mascotera w-full pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mascotera-text-muted hover:text-mascotera-accent transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-mascotera-danger/10 border border-mascotera-danger/30">
                  <AlertCircle className="w-4 h-4 text-mascotera-danger flex-shrink-0" />
                  <p className="text-sm text-mascotera-danger">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!loginUsuario.trim() || !loginPassword || loginLoading}
                className={`btn-primary w-full flex items-center justify-center gap-2 py-3 ${
                  (!loginUsuario.trim() || !loginPassword || loginLoading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loginLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-mascotera-darker/30 border-t-mascotera-darker rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Ingresar
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-mascotera-text-muted mt-6">
            Solo personal autorizado
          </p>
        </div>
      </div>
    );
  }

  // ========== LAYOUT PRINCIPAL ==========
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

        {/* User Info + Logout */}
        <div className="p-4 border-t border-mascotera-border space-y-3">
          {!sidebarCollapsed && (
            <div className="px-2">
              <p className="text-sm font-medium text-mascotera-text truncate">{userDisplayName}</p>
              <p className="text-[10px] text-mascotera-text-muted">{currentUser.puesto || currentUser.rol}</p>
              <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isAuditor ? 'bg-mascotera-accent/20 text-mascotera-accent' :
                isPilaresOnly ? 'bg-mascotera-info/20 text-mascotera-info' :
                'bg-mascotera-success/20 text-mascotera-success'
              }`}>
                {accessLevelLabel[currentUser.accessLevel] || 'Usuario'}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-mascotera-text-muted hover:text-mascotera-accent transition-colors"
              title={sidebarCollapsed ? 'Expandir' : 'Colapsar'}
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
            <button
              onClick={logoutUser}
              className="p-2 text-mascotera-text-muted hover:text-mascotera-danger transition-colors rounded-lg hover:bg-mascotera-danger/10"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
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
                {totalNotificaciones > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-mascotera-danger text-white text-[10px] font-bold rounded-full px-1">
                    {totalNotificaciones > 99 ? '99+' : totalNotificaciones}
                  </span>
                )}
              </button>

              {/* Dropdown de notificaciones */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-mascotera-card border border-mascotera-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="bg-mascotera-darker px-4 py-3 border-b border-mascotera-border flex items-center justify-between">
                    <h3 className="font-semibold text-mascotera-text text-sm">Notificaciones</h3>
                    {totalNotificaciones > 0 && (
                      <span className="bg-mascotera-danger/20 text-mascotera-danger text-xs font-semibold px-2 py-0.5 rounded-full">
                        {totalNotificaciones} pendiente{totalNotificaciones !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {totalNotificaciones === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="w-8 h-8 text-mascotera-text-muted mx-auto mb-2 opacity-40" />
                        <p className="text-sm text-mascotera-text-muted">No hay notificaciones pendientes</p>
                      </div>
                    ) : (
                      <>
                        {/* Conteos de stock pendientes */}
                        {conteosPendientes.length > 0 && (
                          <>
                            <div className="px-4 py-2 bg-mascotera-accent/5 border-b border-mascotera-border/30">
                              <p className="text-[10px] font-bold text-mascotera-accent uppercase tracking-wider">Control de Stock</p>
                            </div>
                            {conteosPendientes.slice(0, 5).map(conteo => {
                              const sucNombre = conteo.sucursal_nombre
                                ? conteo.sucursal_nombre.replace(/^SUCURSAL\s+/i, '')
                                : `Sucursal #${conteo.sucursal_id}`;
                              const dif = parseFloat(conteo.valorizacion_diferencia) || 0;
                              return (
                                <button
                                  key={`conteo-${conteo.id}`}
                                  onClick={() => {
                                    setNotifOpen(false);
                                    navigate('/auditorias', { state: { openConteos: true } });
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-mascotera-darker/50 transition-colors border-b border-mascotera-border/30"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-mascotera-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <Package className="w-4 h-4 text-mascotera-accent" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-mascotera-text truncate">Conteo de Stock Finalizado</p>
                                        <span className="text-[10px] text-mascotera-text-muted whitespace-nowrap">{formatTimeAgo(conteo.created_at)}</span>
                                      </div>
                                      <p className="text-xs text-mascotera-text-muted mt-0.5">
                                        {conteo.productos_contados} productos · Diferencia: <span className={dif < 0 ? 'text-mascotera-danger' : 'text-mascotera-success'}>${Math.abs(dif).toLocaleString('es-AR')}</span>
                                      </p>
                                      <p className="text-[10px] text-mascotera-accent mt-1">{sucNombre} · {conteo.empleado_nombre}</p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </>
                        )}

                        {/* Descargos pendientes */}
                        {descargosPendientes.length > 0 && (
                          <>
                            <div className="px-4 py-2 bg-mascotera-warning/5 border-b border-mascotera-border/30">
                              <p className="text-[10px] font-bold text-mascotera-warning uppercase tracking-wider">Descargos</p>
                            </div>
                            {descargosPendientes
                              .sort((a, b) => new Date(b.fecha_descargo) - new Date(a.fecha_descargo))
                              .slice(0, 5)
                              .map(descargo => {
                                const sucNombre = descargo.sucursal_nombre
                                  ? descargo.sucursal_nombre.replace(/^SUCURSAL\s+/i, '')
                                  : `Sucursal #${descargo.sucursal_id}`;
                                return (
                                  <button
                                    key={`descargo-${descargo.id}`}
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
                            }
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {totalNotificaciones > 0 && (
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/auditorias', { state: { openDescargos: true } });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-mascotera-darker/50 border-t border-mascotera-border text-sm text-mascotera-accent hover:bg-mascotera-darker transition-colors"
                    >
                      Ver todo
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-mascotera-border">
              <div className="text-right">
                <p className="text-sm font-medium text-mascotera-text">{userDisplayName}</p>
                <p className="text-xs text-mascotera-text-muted">{accessLevelLabel[currentUser.accessLevel] || 'Usuario'}</p>
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
