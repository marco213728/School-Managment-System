import React, { useState, useContext } from 'react';
import { InstitutionContext } from '../contexts/UserContext';
import { 
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  FIREBASE_PROJECT_ID,
} from '../lib/firebase';

import AmautaLogo from '../components/branding/AmautaLogo';

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean;
  onGoogleLogin?: () => Promise<void>;
  isLoading?: boolean;
  initialError?: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoogleLogin, isLoading = false, initialError = null }) => {
  const { institution } = useContext(InstitutionContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError || null);

  React.useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<{ domain: string; consoleUrl: string } | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim();

    try {
      // 1. First attempt native Firebase Authentication
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      // App.tsx's onAuthStateChanged listener handles session state automatically
    } catch (fbErr: any) {
      console.warn("Firebase Auth sign-in attempted, checking local fallback:", fbErr);

      // 2. If Firebase Auth did not match, check local/mock credentials
      const localSuccess = onLogin(cleanEmail, password);
      if (!localSuccess) {
        let msg = 'Email o contraseña incorrectos. Por favor, verifica tus datos.';
        if (fbErr?.code === 'auth/invalid-credential' || fbErr?.code === 'auth/wrong-password') {
          msg = 'Contraseña o correo incorrectos.';
        } else if (fbErr?.code === 'auth/user-not-found') {
          msg = 'No existe una cuenta registrada con este correo.';
        } else if (fbErr?.code === 'auth/too-many-requests') {
          msg = 'Demasiados intentos fallidos. Por favor, espera un momento o restablece tu contraseña.';
        } else if (fbErr?.code === 'auth/network-request-failed') {
          msg = 'Error de conexión con los servidores de autenticación.';
        }
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Por favor escribe tu correo electrónico en el campo para enviarte el enlace de restablecimiento.');
      return;
    }
    setError(null);
    setResetMessage(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetMessage(`Te hemos enviado un correo con instrucciones para restablecer tu contraseña a ${email.trim()}.`);
    } catch (err: any) {
      console.error("Error al enviar email de restablecimiento:", err);
      if (err.code === 'auth/user-not-found') {
        setError('No existe una cuenta registrada en Firebase con este correo.');
      } else {
        setError('No se pudo enviar el correo de recuperación. Verifica la dirección ingresada.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!onGoogleLogin) return;
    try {
      setError(null);
      setResetMessage(null);
      setGoogleLoading(true);
      await onGoogleLogin();
    } catch (err: any) {
      console.error("Error al autenticar con Google:", err);
      let msg = 'Error al autenticar con Google. Por favor, inténtalo nuevamente.';
      if (err?.code === 'auth/unauthorized-domain') {
        const currentHost = typeof window !== 'undefined' ? (window.location.hostname || 'amautaapp.com') : 'amautaapp.com';
        setUnauthorizedDomain({
          domain: currentHost,
          consoleUrl: `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`,
        });
        msg = `El dominio "${currentHost}" no está autorizado en Firebase Authentication.`;
      } else {
        setUnauthorizedDomain(null);
        if (err?.code === 'auth/popup-closed-by-user') {
          msg = 'Se cerró la ventana emergente de Google antes de completar el inicio de sesión.';
        } else if (err?.code === 'auth/popup-blocked') {
          msg = 'Tu navegador bloqueó la ventana emergente de Google. Por favor, permite ventanas emergentes para este sitio e inténtalo de nuevo.';
        } else if (err?.code === 'auth/cancelled-popup-request') {
          msg = 'La solicitud de inicio de sesión con Google fue cancelada.';
        } else if (err?.code === 'auth/account-exists-with-different-credential') {
          msg = 'Ya existe una cuenta con este correo registrada mediante contraseña. Ingresa tu correo y contraseña en el formulario para acceder.';
        } else if (err?.message) {
          msg = err.message;
        }
      }
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <AmautaLogo className="h-16 w-auto drop-shadow-xs" mode="light" />
          </div>
          {institution && institution.name !== 'Amauta' && institution.logoUrl && !institution.logoUrl.includes('placehold') && !institution.logoUrl.startsWith('data:image/svg+xml') && (
            <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-100">
              <img 
                src={institution.logoUrl} 
                alt={institution.name} 
                className="w-7 h-7 rounded-full object-cover border border-slate-200" 
              />
              <span className="text-xs font-semibold text-slate-700">{institution.name}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 font-medium">Sistema Integral de Gestión Educativa</p>
        </div>

        {/* Google Sign-In */}
        {onGoogleLogin && (
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition shadow-xs disabled:opacity-50"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Iniciando sesión con Google...' : 'Continuar con Google'}</span>
            </button>
            <p className="mt-1.5 text-[11px] text-center text-slate-500 font-medium">
              Acceso exclusivo para miembros registrados en su colegio (Docentes, Estudiantes, Padres y Personal).
            </p>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2.5 text-slate-500 font-medium">o accede con credenciales</span>
              </div>
            </div>
          </div>
        )}

        {/* Regular Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@escuela.com"
              className="w-full px-3.5 py-2.5 mt-1 text-slate-900 bg-slate-50 border border-slate-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:bg-white"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Contraseña
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 mt-1 text-slate-900 bg-slate-50 border border-slate-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm focus:bg-white"
            />
          </div>
          
          {resetMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs leading-relaxed" role="status">
              ✓ {resetMessage}
            </div>
          )}

          {unauthorizedDomain && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-2 text-amber-900 leading-relaxed shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 text-sm">
                <span>🔐</span>
                <span>Configurar Dominio en Firebase</span>
              </div>
              <p>
                Para habilitar <strong>Continuar con Google</strong> en <strong>{unauthorizedDomain.domain}</strong>, se debe registrar este dominio en Firebase Authentication:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-amber-800">
                <li>
                  Abre la configuración de Firebase Authentication:
                  <a 
                    href={unauthorizedDomain.consoleUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ml-1 text-blue-600 underline font-semibold hover:text-blue-800 break-all"
                  >
                    Abrir Configuración de Firebase ↗
                  </a>
                </li>
                <li>Ve a la pestaña <strong>Settings (Configuración)</strong> → <strong>Authorized domains (Dominios autorizados)</strong>.</li>
                <li>Haz clic en <strong>Add domain (Agregar dominio)</strong> e ingresa: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-950">{unauthorizedDomain.domain}</code></li>
              </ol>
              <p className="text-[11px] text-slate-600 pt-1 border-t border-amber-200">
                💡 Mientras tanto, puedes iniciar sesión ingresando tu correo y contraseña aquí abajo.
              </p>
            </div>
          )}

          {error && !unauthorizedDomain && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs leading-relaxed" role="alert">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={!email || !password || isLoading || isSubmitting}
              className="w-full px-4 py-2.5 font-semibold text-sm text-white bg-blue-600 rounded-xl shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
            >
              {isSubmitting || isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;
