import { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { loginWithEmail, isFirebaseAvailable } from '../utils/firebase';
import Logo from './Logo';
import LanguageSelector from './LanguageSelector';
import { t } from '../utils/i18n';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [, forceUpdate] = useState({});

  // Check if Firebase is configured on mount
  useEffect(() => {
    if (!isFirebaseAvailable()) {
      setError(t('login.firebaseNotConfigured'));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if Firebase is configured
    if (!isFirebaseAvailable()) {
      setError(t('login.firebaseNotConfigured'));
      setLoading(false);
      return;
    }

    try {
      // Sign in with Firebase
      await loginWithEmail(email.trim(), password);
      // Success - Firebase auth state will be handled by App.tsx
      onLoginSuccess();
    } catch (err: any) {
      // Handle Firebase auth errors
      let errorMessage = t('login.invalidCredentials');
      
      if (err.message.includes('auth/user-not-found')) {
        errorMessage = t('login.noAccount');
      } else if (err.message.includes('auth/wrong-password')) {
        errorMessage = t('login.wrongPassword');
      } else if (err.message.includes('auth/invalid-email')) {
        errorMessage = t('login.invalidEmail');
      } else if (err.message.includes('auth/too-many-requests')) {
        errorMessage = t('login.tooManyAttempts');
      } else if (err.message.includes('Firebase is not configured')) {
        errorMessage = t('login.firebaseNotConfigured');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4 relative overflow-hidden">
      {/* Animated gold background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/20 via-amber-500/15 to-yellow-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-500/15 via-amber-600/10 to-yellow-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-400/5 via-amber-500/5 to-yellow-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Premium Glass Card */}
        <div 
          className="relative rounded-3xl p-8 sm:p-10 backdrop-blur-2xl border border-yellow-500/20 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(20, 20, 20, 0.8) 50%, rgba(0, 0, 0, 0.7) 100%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 215, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Gold accent border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 opacity-50 blur-xl"></div>
          
          {/* Logo and Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="absolute top-4 right-4">
              <LanguageSelector />
            </div>
            <div className="flex justify-center mb-5">
              <Logo size="lg" animated={true} />
            </div>
            <p className="text-gray-400 text-sm font-medium">{t('login.subtitle')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-start space-x-3 backdrop-blur-sm" style={{ boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)' }}>
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm flex-1 font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
                 <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                   <div>
                     <label className="block text-sm font-semibold text-gray-300 mb-2.5 tracking-wide">
                       {t('login.email')}
                     </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <div className="relative">
                    {/* Icon glow effect */}
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-lg blur-md group-focus-within:bg-yellow-500/30 transition-all"></div>
                    {/* Icon container */}
                    <div className="relative bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-lg p-2.5 group-focus-within:border-yellow-500/50 group-focus-within:bg-gradient-to-br group-focus-within:from-yellow-500/30 group-focus-within:to-amber-600/30 transition-all backdrop-blur-sm"
                         style={{ boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)' }}>
                      <Mail className="w-5 h-5 text-yellow-400 group-focus-within:text-yellow-300 transition-colors" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-16 pr-4 py-3.5 bg-black/40 border border-yellow-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-yellow-500/70 focus:bg-black/50 transition-all duration-200 backdrop-blur-sm font-medium"
                  style={{ 
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                         placeholder={t('login.emailPlaceholder')}
                  disabled={loading}
                  autoComplete="email"
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 215, 0, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)';
                  }}
                />
              </div>
            </div>

                   <div>
                     <label className="block text-sm font-semibold text-gray-300 mb-2.5 tracking-wide">
                       {t('login.password')}
                     </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <div className="relative">
                    {/* Icon glow effect */}
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-lg blur-md group-focus-within:bg-yellow-500/30 transition-all"></div>
                    {/* Icon container */}
                    <div className="relative bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-lg p-2.5 group-focus-within:border-yellow-500/50 group-focus-within:bg-gradient-to-br group-focus-within:from-yellow-500/30 group-focus-within:to-amber-600/30 transition-all backdrop-blur-sm"
                         style={{ boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)' }}>
                      <Lock className="w-5 h-5 text-yellow-400 group-focus-within:text-yellow-300 transition-colors" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-16 pr-12 py-3.5 bg-black/40 border border-yellow-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-yellow-500/70 focus:bg-black/50 transition-all duration-200 backdrop-blur-sm font-medium"
                  style={{ 
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                         placeholder={t('login.passwordPlaceholder')}
                  disabled={loading}
                  autoComplete="current-password"
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 215, 0, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-yellow-500/70 hover:text-yellow-400 transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-black font-bold rounded-xl shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 relative overflow-hidden group"
              style={{ boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)' }}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                     {loading ? (
                       <>
                         <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                         <span className="relative z-10">{t('login.signingIn')}</span>
                       </>
                     ) : (
                       <span className="relative z-10 tracking-wide">{t('login.signIn')}</span>
                     )}
            </button>
          </form>

                 {/* Footer */}
                 <p className="mt-8 text-center text-xs text-gray-500 font-medium relative z-10">
                   {t('login.secureAccess')}
                 </p>
        </div>
      </div>
    </div>
  );
}

