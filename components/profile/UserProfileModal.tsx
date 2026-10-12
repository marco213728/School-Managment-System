import React, { useState, useContext, useEffect } from 'react';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { User, Role } from '../../types';
import { 
  CloseIcon, 
  LockClosedIcon, 
  CheckCircleIcon,
  SparklesIcon
} from '../icons/Icons';
import { auth, updatePassword, sendPasswordResetEmail } from '../../lib/firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile?: (updatedUser: User) => Promise<boolean> | void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const { user, updateCurrentUser, updateUserPassword } = useContext(UserContext);
  const { institution } = useContext(InstitutionContext);

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cedula, setCedula] = useState('');
  const [tituloProfesional, setTituloProfesional] = useState('');
  const [especialidadRegistrada, setEspecialidadRegistrada] = useState('');
  const [accessPin, setAccessPin] = useState('');

  // Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCedula(user.cedula || '');
      setTituloProfesional(user.tituloProfesional || '');
      setEspecialidadRegistrada(user.especialidadRegistrada || '');
      setAccessPin(user.accessPin || '');
      setNewPassword('');
      setConfirmPassword('');
      setProfileMessage(null);
      setPasswordMessage(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const isGoogleLinked = !!(auth.currentUser?.providerData?.some(p => p.providerId === 'google.com'));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setSavingProfile(true);

    try {
      const updatedData: Partial<User> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        cedula: cedula.trim(),
        tituloProfesional: tituloProfesional.trim(),
        especialidadRegistrada: especialidadRegistrada.trim(),
        accessPin: accessPin.trim(),
      };

      const fullUpdatedUser: User = {
        ...user,
        ...updatedData,
      };

      if (onSaveProfile) {
        await onSaveProfile(fullUpdatedUser);
      } else if (updateCurrentUser) {
        await updateCurrentUser(updatedData);
      }

      setProfileMessage({
        type: 'success',
        text: '¡Perfil actualizado correctamente!',
      });
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err: any) {
      console.error("Error al actualizar perfil:", err);
      setProfileMessage({
        type: 'error',
        text: err?.message || 'Error al guardar los cambios del perfil.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden. Por favor verifica.',
      });
      return;
    }

    setSavingPassword(true);
    try {
      if (updateUserPassword) {
        const result = await updateUserPassword(newPassword);
        if (!result.success) {
          throw new Error(result.error || 'No se pudo actualizar la contraseña.');
        }
      } else if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      }

      setPasswordMessage({
        type: 'success',
        text: '¡Contraseña actualizada con éxito! Utiliza tu nueva clave la próxima vez que inicies sesión.',
      });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 5000);
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err);
      let errMsg = 'Error al actualizar la contraseña.';
      if (err?.code === 'auth/requires-recent-login') {
        errMsg = 'Por seguridad de Firebase, debes volver a iniciar sesión antes de modificar tu contraseña.';
      } else if (err?.message) {
        errMsg = err.message;
      }
      setPasswordMessage({
        type: 'error',
        text: errMsg,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user.email) return;
    setSendingReset(true);
    setPasswordMessage(null);
    try {
      await sendPasswordResetEmail(auth, user.email.trim());
      setPasswordMessage({
        type: 'success',
        text: `Enlace de restablecimiento enviado a ${user.email}. Revisa tu bandeja de entrada o spam.`,
      });
    } catch (err: any) {
      console.error("Error al enviar email de restablecimiento:", err);
      setPasswordMessage({
        type: 'error',
        text: 'No se pudo enviar el correo de recuperación en este momento.',
      });
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600/80 border-2 border-white/20 flex items-center justify-center font-bold text-lg text-white shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-xl font-bold leading-tight">
                {user.name || 'Mi Perfil'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
                <span className="bg-blue-500/30 px-2 py-0.5 rounded-full font-medium text-blue-200 border border-blue-400/20">
                  {user.role}
                </span>
                {institution?.name && (
                  <span className="text-slate-400">· {institution.name}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
            aria-label="Cerrar modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>👤 Datos Personales</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LockClosedIcon className="w-4 h-4" />
            <span>Seguridad y Contraseña</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileMessage && (
                <div
                  className={`p-3 rounded-xl text-sm border ${
                    profileMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {profileMessage.type === 'success' ? '✓ ' : '⚠ '}
                  {profileMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Cédula / Documento de Identidad
                  </label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ej. 1718293041"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Teléfono / Celular
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +593 99 123 4567"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Dirección Domiciliaria
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, Número, Ciudad"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Título Profesional
                  </label>
                  <input
                    type="text"
                    value={tituloProfesional}
                    onChange={(e) => setTituloProfesional(e.target.value)}
                    placeholder="Ej. Licenciado en Ciencias de la Educación"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Especialidad Registrada
                  </label>
                  <input
                    type="text"
                    value={especialidadRegistrada}
                    onChange={(e) => setEspecialidadRegistrada(e.target.value)}
                    placeholder="Ej. Matemáticas, Lengua y Literatura"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    PIN de Acceso Rápido (4-6 dígitos)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={accessPin}
                    onChange={(e) => setAccessPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Rol en el Sistema
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.role}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {savingProfile ? 'Guardando cambios...' : 'Guardar Información'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {passwordMessage && (
                <div
                  className={`p-3 rounded-xl text-sm border ${
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {passwordMessage.type === 'success' ? '✓ ' : '⚠ '}
                  {passwordMessage.text}
                </div>
              )}

              {/* Authentication Status Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-blue-600" />
                  Método de Autenticación
                </h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Acceso mediante Google:</span>
                  {isGoogleLinked ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      ✓ Vinculado con Google
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Credenciales estándar (Correo y contraseña)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Puedes actualizar tu contraseña en cualquier momento para iniciar sesión directamente con tu correo electrónico.
                </p>
              </div>

              {/* Password update form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <LockClosedIcon className="w-4 h-4 text-slate-700" />
                  Cambiar Contraseña
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Confirmar Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={sendingReset || !user.email}
                    className="text-xs text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                  >
                    {sendingReset ? 'Enviando...' : 'Enviar enlace de recuperación por email'}
                  </button>

                  <button
                    type="submit"
                    disabled={savingPassword || !newPassword || !confirmPassword}
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {savingPassword ? 'Actualizando clave...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
