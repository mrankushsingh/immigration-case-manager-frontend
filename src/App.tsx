import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Users as UsersIcon, LayoutDashboard, Menu, X, LogOut, UserCog, Shield } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Templates from './components/Templates';
import Clients from './components/Clients';
import Users from './components/Users';
import Notifications from './components/Notifications';
import ClientDetailsModal from './components/ClientDetailsModal';
import Login from './components/Login';
import Logo from './components/Logo';
import LanguageSelector from './components/LanguageSelector';
import { ToastContainer, subscribeToToasts, Toast } from './components/Toast';
import { onAuthChange, logout as firebaseLogout, isFirebaseAvailable } from './utils/firebase';
import { Client } from './types';
import { t } from './utils/i18n';
import { api } from './utils/api';

type View = 'dashboard' | 'templates' | 'clients' | 'users';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // Loading state for auth check
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [, forceUpdate] = useState({});
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'user' | null>(null);

  // Sync route with currentView (only for dashboard - other views use state)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const path = location.pathname;
    // Only sync dashboard route - other views don't have routes
    if (path === '/dashboard' && currentView !== 'dashboard') {
      setCurrentView('dashboard');
    } else if (path === '/' || path === '/login') {
      navigate('/dashboard', { replace: true });
    }
    // Don't change currentView for other paths - they use state-based navigation
  }, [location.pathname, isAuthenticated, navigate]);

  // Sync currentView with route (only for dashboard - other views use state)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Only navigate to /dashboard if currentView is dashboard
    // Other views (templates, clients, users) use state-based navigation and don't change URL
    if (currentView === 'dashboard' && location.pathname !== '/dashboard') {
      navigate('/dashboard', { replace: true });
    }
    // Don't navigate for other views - they use state-based navigation only
  }, [currentView, navigate, location.pathname, isAuthenticated]);

  useEffect(() => {
    // Check if Firebase is available
    if (!isFirebaseAvailable()) {
      console.error('Firebase Authentication is not configured. Please set Firebase environment variables.');
      // Don't set authenticated - user must configure Firebase
      setIsAuthChecking(false);
      return;
    }

    let isFirstAuthCheck = true;

    // Listen to Firebase auth state changes (async)
    // This is the reliable way to check auth state - it waits for Firebase to restore session
    const unsubscribe = onAuthChange((user) => {
      setIsAuthenticated(!!user);
      if (user) {
        loadCurrentUserRole();
      } else {
        setCurrentUserRole(null);
      }
      
      // Auth check is complete after first auth state change
      // This ensures we wait for Firebase to restore the session before showing login/dashboard
      if (isFirstAuthCheck) {
        isFirstAuthCheck = false;
        setIsAuthChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadCurrentUserRole = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUserRole(user.role);
    } catch (error) {
      console.error('Failed to load current user role:', error);
      setCurrentUserRole(null);
    }
  };

  useEffect(() => {
    // Subscribe to toast notifications
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Listen for language changes to force re-render
    const handleLanguageChange = () => {
      forceUpdate({});
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  // Redirect away from users view if not admin
  useEffect(() => {
    if (currentView === 'users' && currentUserRole !== 'admin' && currentUserRole !== null) {
      setCurrentView('dashboard');
    }
  }, [currentView, currentUserRole]);

  const handleCloseToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    await loadCurrentUserRole();
    // Redirect to dashboard after successful login
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = async () => {
    if (!isFirebaseAvailable()) {
      console.error('Firebase is not configured');
      setIsAuthenticated(false);
      navigate('/', { replace: true });
      return;
    }

    try {
      await firebaseLogout();
      setIsAuthenticated(false);
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still set authenticated to false even if logout fails
    setIsAuthenticated(false);
      navigate('/', { replace: true });
    }
  };

  // Auth Guard: Redirect unauthenticated users trying to access protected routes
  useEffect(() => {
    if (!isAuthenticated) {
      // If user is not authenticated and trying to access dashboard, show login
      if (location.pathname === '/dashboard') {
        // Login component will be shown by the guard below
        return;
      }
      return;
    }
    
    // Authenticated users: redirect root to dashboard
    if (location.pathname === '/' || location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, isAuthenticated, navigate]);

  // Show loading state while checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white/70 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth Guard: Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(17, 24, 39, 0.98) 25%, rgba(0, 0, 0, 0.95) 50%, rgba(17, 24, 39, 0.98) 75%, rgba(0, 0, 0, 0.95) 100%)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 40px rgba(0, 0, 0, 0.3)',
          position: 'relative',
        }}
      >
        {/* Shine effect overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.03) 25%, transparent 50%, rgba(255, 255, 255, 0.05) 75%, transparent 100%)',
            backgroundSize: '200% 200%',
            animation: 'shine 3s ease-in-out infinite',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Logo size="md" animated={true} />
              <div className="hidden sm:block">
                <p className="text-xs text-white/70 font-medium uppercase tracking-wider">Immigration Case Manager</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              <nav className="flex space-x-2 bg-black/30 backdrop-blur-sm p-1.5 rounded-xl border border-white/10">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    currentView === 'dashboard'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-900 shadow-lg shadow-yellow-500/30 scale-105'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t('common.dashboard')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setCurrentView('templates')}
                  className={`px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    currentView === 'templates'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-900 shadow-lg shadow-yellow-500/30 scale-105'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>{t('common.templates')}</span>
                  </div>
                </button>
                <button
                  onClick={() => setCurrentView('clients')}
                  className={`px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    currentView === 'clients'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-900 shadow-lg shadow-yellow-500/30 scale-105'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="w-4 h-4" />
                    <span>{t('common.clients')}</span>
                  </div>
                </button>
                {currentUserRole === 'admin' && (
                  <button
                    onClick={() => setCurrentView('users')}
                    className={`px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      currentView === 'users'
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-900 shadow-lg shadow-yellow-500/30 scale-105'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                      <UserCog className="w-4 h-4" />
                      <span>{t('users.title')}</span>
                  </div>
                </button>
                )}
              </nav>
              <LanguageSelector />
              <Notifications 
                onClientClick={setSelectedClient}
                onReminderClick={() => {
                  setCurrentView('dashboard');
                  // Trigger opening RECORDATORIO modal via custom event
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('openRecordatorioModal'));
                  }, 100);
                }}
              />
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                title={t('common.signOut')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSelector />
              <Notifications 
                onClientClick={setSelectedClient}
                onReminderClick={() => {
                  setCurrentView('dashboard');
                  setMobileMenuOpen(false);
                  // Trigger opening RECORDATORIO modal via custom event
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('openRecordatorioModal'));
                  }, 100);
                }}
              />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
                  <div className="md:hidden border-t border-white/10 pt-4 pb-4 animate-fade-in">
              <nav className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 text-left ${
                    currentView === 'dashboard'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-900 shadow-lg'
                            : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <LayoutDashboard className="w-5 h-5" />
                          <span>{t('common.dashboard')}</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('templates');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 text-left ${
                    currentView === 'templates'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-900 shadow-lg'
                            : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5" />
                          <span>{t('common.templates')}</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('clients');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 text-left ${
                    currentView === 'clients'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-900 shadow-lg'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <UsersIcon className="w-5 h-5" />
                          <span>{t('common.clients')}</span>
                        </div>
                      </button>
                  {currentUserRole === 'admin' && (
                    <button
                      onClick={() => {
                        setCurrentView('users');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 text-left ${
                        currentView === 'users'
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-900 shadow-lg'
                          : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                        <UserCog className="w-5 h-5" />
                        <span>{t('users.title')}</span>
                  </div>
                </button>
                  )}
                      <div className="pt-2 border-t border-white/10 mt-2">
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                          className="w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 text-left text-red-300 hover:bg-red-900/30 flex items-center space-x-3"
                  >
                    <LogOut className="w-5 h-5" />
                          <span>{t('common.signOut')}</span>
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="animate-fade-in">
          <Routes>
            <Route 
              path="/dashboard" 
              element={
                currentView === 'dashboard' ? (
                  <Dashboard onNavigate={setCurrentView} />
                ) : (
                  <>
                    {currentView === 'templates' && <Templates />}
                    {currentView === 'clients' && <Clients />}
                    {currentView === 'users' && currentUserRole === 'admin' && <Users />}
                    {currentView === 'users' && currentUserRole !== 'admin' && (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('users.accessDenied')}</h2>
                          <p className="text-gray-600">{t('users.adminOnly')}</p>
                        </div>
                      </div>
                    )}
                  </>
                )
              } 
            />
            <Route path="*" element={
              <>
          {currentView === 'templates' && <Templates />}
          {currentView === 'clients' && <Clients />}
                {currentView === 'users' && currentUserRole === 'admin' && <Users />}
                {currentView === 'users' && currentUserRole !== 'admin' && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('users.accessDenied')}</h2>
                      <p className="text-gray-600">{t('users.adminOnly')}</p>
                    </div>
                  </div>
                )}
              </>
            } />
          </Routes>
        </div>
      </main>

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onSuccess={() => {
            setSelectedClient(null);
          }}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />
    </div>
  );
}

export default App;

