import React, { useState, useContext } from 'react';
import { User, Role } from '../types';
import { InstitutionContext } from '../contexts/UserContext';
import { MOCK_USERS } from '../constants';
import { 
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  FIRESTORE_CONSOLE_URL, 
  FIRESTORE_DATABASE_ID, 
  FIREBASE_PROJECT_ID, 
  seedInitialFirestoreData 
} from '../lib/firebase';

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean;
  onGoogleLogin?: () => Promise<void>;
  isLoading?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoogleLogin, isLoading = false }) => {
  const { institution } = useContext(InstitutionContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim();

    try {
      // 1. First attempt native Firebase Authentication (Cloud Auth)
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
      console.error(err);
      setError(err?.message || 'Error al autenticar con Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSyncFirestore = async () => {
    setSyncing(true);
    setSyncStatus("Sincronizando registros a Firestore...");
    try {
      const res = await seedInitialFirestoreData();
      setSyncStatus(`¡Listo! Se guardaron ${res.institutionsCount} instituciones y ${res.usersCount} usuarios en Firestore.`);
    } catch (err: any) {
      setSyncStatus("Error al sincronizar datos.");
    } finally {
      setSyncing(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string = 'password') => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
    setResetMessage(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-5 bg-white rounded-2xl shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="text-center">
          {institution?.logoUrl ? (
            <img 
              src={institution.logoUrl} 
              alt="Logo de la Institución" 
              className="w-16 h-16 mx-auto mb-3 rounded-full object-cover shadow-sm border border-slate-200" 
            />
          ) : (
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
              AM
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-800">{institution?.name || 'Amauta'}</h1>
          <p className="mt-1 text-sm text-slate-600">Sistema Integral de Gestión Educativa</p>
        </div>

        {/* Firebase Live Database Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Base Firestore Conectada</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
              En línea
            </span>
          </div>

          <div className="text-[11px] text-slate-600 space-y-1">
            <p><strong>Proyecto:</strong> <code className="text-slate-800 font-mono">{FIREBASE_PROJECT_ID}</code></p>
            <p><strong>Base de Datos:</strong> <code className="text-slate-800 font-mono break-all">{FIRESTORE_DATABASE_ID}</code></p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a
              href={FIRESTORE_CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition shadow-sm"
            >
              Ver en Firebase Console ↗
            </a>
            <button
              type="button"
              onClick={handleSyncFirestore}
              disabled={syncing}
              className="flex-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded-lg transition disabled:opacity-50"
            >
              {syncing ? 'Guardando...' : 'Sincronizar a BD'}
            </button>
          </div>

          {syncStatus && (
            <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 p-1.5 rounded border border-emerald-200">
              {syncStatus}
            </p>
          )}

          <p className="text-[10px] text-slate-500 leading-tight">
            * Nota: En Firebase Console, selecciona la base <span className="font-semibold text-slate-700 font-mono">{FIRESTORE_DATABASE_ID}</span> en el desplegable superior de Firestore.
          </p>
        </div>

        {/* Google Sign-In */}
        {onGoogleLogin && (
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition shadow-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              {googleLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">o accede con credenciales</span>
              </div>
            </div>
          </div>
        )}

        {/* Regular Login Form */}
        <form className="space-y-3.5" onSubmit={handleSubmit}>
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
              placeholder="ejemplo@school.com"
              className="w-full px-3 py-2 mt-1 text-slate-900 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              className="w-full px-3 py-2 mt-1 text-slate-900 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          {resetMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs leading-relaxed" role="status">
              ✓ {resetMessage}
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed" role="alert">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={!email || !password || isLoading || isSubmitting}
              className="w-full px-4 py-2 font-semibold text-sm text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
            >
              {isSubmitting || isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        {/* Demo Credentials Section */}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Credenciales Rápidas
            </span>
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showDemoAccounts ? 'Ocultar' : 'Ver roles'}
            </button>
          </div>
          
          {showDemoAccounts && (
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1 text-xs">
              <p className="text-[11px] text-slate-500 mb-1">
                Haz clic en cualquier rol (contraseña: <code className="bg-slate-100 px-1 rounded">password</code>):
              </p>
              {MOCK_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => fillCredentials(u.email, u.password || 'password')}
                  className="w-full text-left p-1.5 rounded hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-between transition group"
                >
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 group-hover:text-blue-600">{u.name}</span>
                    <span className="text-slate-500 ml-1.5 font-normal">({u.role})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover:text-blue-500 flex-shrink-0 ml-1">
                    Cargar
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
