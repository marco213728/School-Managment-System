
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { FingerPrintIcon, CheckCircleIcon, AlertTriangleIcon } from '../icons/Icons';

interface StaffAttendanceKioskProps {
    users: User[];
    onRecordAttendance: (userId: string, method: 'Biometric' | 'Manual') => void;
}

const StaffAttendanceKiosk: React.FC<StaffAttendanceKioskProps> = ({ users, onRecordAttendance }) => {
    const [mode, setMode] = useState<'biometric' | 'pin'>('biometric');
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [pin, setPin] = useState('');
    const [message, setMessage] = useState('');
    const [identifiedUser, setIdentifiedUser] = useState<User | null>(null);

    const reset = () => {
        setStatus('idle');
        setPin('');
        setMessage('');
        setIdentifiedUser(null);
    };

    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(reset, 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleBiometricScan = () => {
        setStatus('scanning');
        setMessage('Escaneando huella...');
        
        // Simulate scan delay and matching
        setTimeout(() => {
            // Simulate a successful match for a random registered user (or fail if none)
            const registeredUsers = users.filter(u => u.biometricRegistered);
            if (registeredUsers.length > 0) {
                // In a real app, the hardware returns an ID. Here we simulate finding a user.
                // For demo purposes, let's pick the first registered user (likely teacher1)
                const match = registeredUsers[0]; 
                setIdentifiedUser(match);
                setStatus('success');
                setMessage(`Bienvenido/a, ${match.name}`);
                onRecordAttendance(match.id, 'Biometric');
            } else {
                setStatus('error');
                setMessage('Huella no reconocida o usuario no registrado.');
            }
        }, 2000);
    };

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.accessPin === pin);
        if (user) {
            setIdentifiedUser(user);
            setStatus('success');
            setMessage(`Bienvenido/a, ${user.name}`);
            onRecordAttendance(user.id, 'Manual');
        } else {
            setStatus('error');
            setMessage('PIN incorrecto.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-100 rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Control de Asistencia Docente</h2>
            <p className="text-slate-500 mb-8">Por favor, identifíquese para registrar su entrada/salida.</p>

            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
                {status === 'success' ? (
                    <div className="animate-fade-in">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                            <CheckCircleIcon className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-green-700 mb-2">Registro Exitoso</h3>
                        <p className="text-gray-600">{message}</p>
                    </div>
                ) : (
                    <>
                        {mode === 'biometric' ? (
                            <div className="space-y-6">
                                <div 
                                    onClick={status !== 'scanning' ? handleBiometricScan : undefined}
                                    className={`mx-auto flex items-center justify-center h-32 w-32 rounded-full border-4 transition-all cursor-pointer ${status === 'scanning' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}`}
                                >
                                    <FingerPrintIcon className={`h-16 w-16 ${status === 'scanning' ? 'text-primary-600 animate-pulse' : 'text-slate-400'}`} />
                                </div>
                                <p className="text-sm font-medium text-slate-600">
                                    {status === 'scanning' ? 'Procesando...' : 'Toque el icono para escanear su huella'}
                                </p>
                                {status === 'error' && <p className="text-sm text-red-600 font-semibold">{message}</p>}
                                
                                <div className="pt-4 border-t">
                                    <button onClick={() => { setMode('pin'); reset(); }} className="text-sm text-primary-600 hover:underline">
                                        Usar PIN (Método Alternativo)
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                                    <AlertTriangleIcon className="h-4 w-4" />
                                    <span>Por higiene, recuerde desinfectar sus manos.</span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handlePinSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingrese su PIN de Acceso</label>
                                    <input 
                                        type="password" 
                                        value={pin} 
                                        onChange={e => setPin(e.target.value)} 
                                        className="w-full text-center text-2xl tracking-widest p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        maxLength={4}
                                        placeholder="****"
                                        autoFocus
                                    />
                                </div>
                                {status === 'error' && <p className="text-sm text-red-600 font-semibold">{message}</p>}
                                <button type="submit" className="w-full py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors">
                                    Verificar
                                </button>
                                <div className="pt-4 border-t">
                                    <button type="button" onClick={() => { setMode('biometric'); reset(); }} className="text-sm text-primary-600 hover:underline">
                                        Usar Huella Digital
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StaffAttendanceKiosk;
