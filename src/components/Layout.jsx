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
  LogOut,
  Settings,
  MessageSquare,
  ArrowRight,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Package,
  Users,
  X
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import { API_BASE } from '../config';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessUsers, setAccessUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const notifRef = useRef(null);
  const settingsRef = useRef(null);
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

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar usuarios con acceso al sistema
  const fetchAccessUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      const data = await res.json();
      setAccessUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
    setLoadingUsers(false);
  };

  // Cambiar nivel de acceso de un usuario
  const updateUserRole = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_level: newRole })
      });
      if (res.ok) {
        setAccessUsers(prev => prev.map(u => u.id === userId ? { ...u, accessLevel: newRole } : u));
      }
    } catch (err) {
      console.error('Error actualizando rol:', err);
    }
    setUpdatingRole(null);
  };

  // Abrir modal de gestión de accesos
  const openAccessModal = () => {
    setSettingsOpen(false);
    setAccessModalOpen(true);
    fetchAccessUsers();
  };

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

            {/* Settings */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 text-mascotera-text-muted hover:text-mascotera-accent transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-mascotera-card border border-mascotera-border rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="bg-mascotera-darker px-4 py-3 border-b border-mascotera-border">
                    <h3 className="font-semibold text-mascotera-text text-sm">Configuraci&oacute;n</h3>
                  </div>

                  <div className="py-1">
                    {isAuditor && (
                      <button
                        onClick={openAccessModal}
                        className="w-full text-left px-4 py-3 hover:bg-mascotera-darker/50 transition-colors flex items-center gap-3"
                      >
                        <Users className="w-4 h-4 text-mascotera-accent" />
                        <div>
                          <p className="text-sm font-medium text-mascotera-text">Gestionar Accesos</p>
                          <p className="text-[10px] text-mascotera-text-muted">Niveles de acceso del sistema</p>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSettingsOpen(false);
                        logoutUser();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-mascotera-danger/10 transition-colors flex items-center gap-3 border-t border-mascotera-border/30"
                    >
                      <LogOut className="w-4 h-4 text-mascotera-danger" />
                      <div>
                        <p className="text-sm font-medium text-mascotera-danger">Cerrar Sesi&oacute;n</p>
                        <p className="text-[10px] text-mascotera-text-muted">{userDisplayName}</p>
                      </div>
                    </button>
                  </div>
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

      {/* Modal Gestión de Accesos */}
      {accessModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-mascotera-dark border border-mascotera-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-mascotera-darker px-6 py-4 border-b border-mascotera-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-mascotera-accent/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-mascotera-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-mascotera-text">Gesti&oacute;n de Accesos</h2>
                  <p className="text-xs text-mascotera-text-muted">Usuarios con permiso al sistema de Auditor&iacute;a</p>
                </div>
              </div>
              <button
                onClick={() => setAccessModalOpen(false)}
                className="p-2 text-mascotera-text-muted hover:text-mascotera-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Leyenda de niveles */}
            <div className="px-6 py-3 bg-mascotera-darker/50 border-b border-mascotera-border/30 flex items-center gap-4 flex-wrap flex-shrink-0">
              <span className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-mascotera-accent"></span>
                <span className="text-mascotera-text-muted">Auditor</span>
                <span className="text-mascotera-text-muted opacity-50">- Acceso total + control</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-mascotera-success"></span>
                <span className="text-mascotera-text-muted">Completo</span>
                <span className="text-mascotera-text-muted opacity-50">- Todos los m&oacute;dulos</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-mascotera-info"></span>
                <span className="text-mascotera-text-muted">Observador</span>
                <span className="text-mascotera-text-muted opacity-50">- Solo pilares</span>
              </span>
            </div>

            {/* Lista de usuarios */}
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-2 border-mascotera-accent/30 border-t-mascotera-accent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-mascotera-text-muted">Cargando usuarios...</p>
                </div>
              ) : accessUsers.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="w-10 h-10 text-mascotera-text-muted mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-mascotera-text-muted">No se encontraron usuarios</p>
                </div>
              ) : (
                <div className="divide-y divide-mascotera-border/30">
                  {accessUsers.map(user => {
                    const isCurrentUser = user.id === currentUser.id;
                    const nombre = `${user.nombre} ${user.apellido}`.replace(/\b\w+/g, w => w.charAt(0) + w.slice(1).toLowerCase());
                    return (
                      <div key={user.id} className={`px-6 py-4 flex items-center justify-between gap-4 ${!user.activo ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            user.accessLevel === 'auditor' ? 'bg-mascotera-accent/20' :
                            user.accessLevel === 'pilares_only' ? 'bg-mascotera-info/20' :
                            'bg-mascotera-success/20'
                          }`}>
                            <User className={`w-4 h-4 ${
                              user.accessLevel === 'auditor' ? 'text-mascotera-accent' :
                              user.accessLevel === 'pilares_only' ? 'text-mascotera-info' :
                              'text-mascotera-success'
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-mascotera-text truncate">{nombre}</p>
                              {isCurrentUser && (
                                <span className="text-[10px] bg-mascotera-accent/20 text-mascotera-accent px-1.5 py-0.5 rounded font-bold">T&uacute;</span>
                              )}
                              {!user.activo && (
                                <span className="text-[10px] bg-mascotera-danger/20 text-mascotera-danger px-1.5 py-0.5 rounded font-bold">Inactivo</span>
                              )}
                            </div>
                            <p className="text-[11px] text-mascotera-text-muted truncate">
                              {user.puesto || user.rol}{user.sucursal ? ` · ${user.sucursal}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0 relative">
                          {updatingRole === user.id ? (
                            <div className="w-5 h-5 border-2 border-mascotera-accent/30 border-t-mascotera-accent rounded-full animate-spin"></div>
                          ) : (
                            <select
                              value={user.accessLevel}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              disabled={isCurrentUser}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border appearance-none pr-7 cursor-pointer ${
                                user.accessLevel === 'auditor'
                                  ? 'bg-mascotera-accent/10 border-mascotera-accent/30 text-mascotera-accent'
                                  : user.accessLevel === 'pilares_only'
                                  ? 'bg-mascotera-info/10 border-mascotera-info/30 text-mascotera-info'
                                  : 'bg-mascotera-success/10 border-mascotera-success/30 text-mascotera-success'
                              } ${isCurrentUser ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-80'}`}
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                            >
                              <option value="auditor">Auditor</option>
                              <option value="full">Acceso Completo</option>
                              <option value="pilares_only">Observador</option>
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-mascotera-darker border-t border-mascotera-border flex items-center justify-between flex-shrink-0">
              <p className="text-[11px] text-mascotera-text-muted">
                {accessUsers.length} usuario{accessUsers.length !== 1 ? 's' : ''} con acceso
              </p>
              <button
                onClick={() => setAccessModalOpen(false)}
                className="px-4 py-2 bg-mascotera-card text-mascotera-text text-sm font-medium rounded-lg hover:bg-mascotera-border transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
