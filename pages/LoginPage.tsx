import React, { useState, useContext } from 'react';
import { User, Role } from '../types';
// FIX: Corrected import path for InstitutionContext.
import { InstitutionContext } from '../contexts/UserContext';

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { institution } = useContext(InstitutionContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    const success = onLogin(email, password);
    if (!success) {
      setError('Email o contraseña incorrectos. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          {institution && <img src={institution.logoUrl} alt="Logo de la Institución" className="w-20 h-20 mx-auto mb-4 rounded-full" />}
          <h1 className="text-2xl font-bold text-slate-800">{institution?.name}</h1>
          <p className="mt-2 text-slate-600">Bienvenido a la plataforma de gestión escolar</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-slate-900 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-slate-900 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={!email || !password}
              className="w-full px-4 py-2.5 font-semibold text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;