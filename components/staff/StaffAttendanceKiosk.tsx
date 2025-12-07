import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { CameraIcon, CheckCircleIcon, AlertTriangleIcon, FingerPrintIcon, KeypadIcon } from '../icons/Icons';

interface StaffAttendanceKioskProps {
    users: User[];
    onRecordAttendance: (userId: string, method: 'Biometric' | 'Manual' | 'Facial', location?: { latitude: number; longitude: number; }) => void;
}

const StaffAttendanceKiosk: React.FC<StaffAttendanceKioskProps> = ({ users, onRecordAttendance }) => {
    const [mode, setMode] = useState<'facial' | 'fingerprint' | 'pin' | 'select'>('select');
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [pin, setPin] = useState('');
    const [message, setMessage] = useState('');
    const [identifiedUser, setIdentifiedUser] = useState<User | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Control de cámara (solo para modo facial)
    useEffect(() => {
        if (mode === 'facial' && status === 'idle') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [mode, status]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error cámara:", err);
            setMessage("No se pudo acceder a la cámara.");
            setStatus('error');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const reset = () => {
        setStatus('idle');
        setPin('');
        setMessage('');
        setIdentifiedUser(null);
        setMode('select');
    };

    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(reset, 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const getLocation = async () => {
        try {
             const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (e) {
            console.log("No se pudo obtener ubicación.");
            return undefined;
        }
    };

    const handleFacialScan = async () => {
        setStatus('scanning');
        setMessage('Analizando rostro...');
        const location = await getLocation();

        setTimeout(() => {
            // Simulación: Encuentra al usuario actual (asumiendo auto-servicio o primer usuario registrado)
            const targetUser = users.length === 1 ? users[0] : users.find(u => u.biometricRegistered);
            
            if (targetUser) {
                setIdentifiedUser(targetUser);
                setStatus('success');
                setMessage(`¡Hola, ${targetUser.name}!`);
                onRecordAttendance(targetUser.id, 'Facial', location);
            } else {
                setStatus('error');
                setMessage('Rostro no reconocido.');
            }
        }, 1500);
    };

    const handleFingerprintScan = async () => {
        setStatus('scanning');
        setMessage('Escaneando huella...');
        const location = await getLocation();

        setTimeout(() => {
            const targetUser = users.length === 1 ? users[0] : users.find(u => u.biometricRegistered);
             if (targetUser) {
                setIdentifiedUser(targetUser);
                setStatus('success');
                setMessage(`¡Hola, ${targetUser.name}!`);
                onRecordAttendance(targetUser.id, 'Biometric', location); // Mantenemos 'Biometric' para huella
            } else {
                setStatus('error');
                setMessage('Huella no reconocida.');
            }
        }, 1500);
    };

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const location = await getLocation();
        const user = users.find(u => u.accessPin === pin);
        
        if (user) {
            setIdentifiedUser(user);
            setStatus('success');
            setMessage(`¡Hola, ${user.name}!`);
            onRecordAttendance(user.id, 'Manual', location);
        } else {
            setStatus('error');
            setMessage('PIN incorrecto.');
        }
    };

    const SelectionScreen = () => (
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            <button onClick={() => setMode('facial')} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary-500 transition-all group text-left">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100">
                    <CameraIcon className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Reconocimiento Facial</h3>
                    <p className="text-xs text-slate-500">Rápido y sin contacto</p>
                </div>
            </button>

            <button onClick={() => setMode('fingerprint')} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary-500 transition-all group text-left">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100">
                    <FingerPrintIcon className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Huella Dactilar</h3>
                    <p className="text-xs text-slate-500">Requiere sensor biométrico</p>
                </div>
            </button>

            <button onClick={() => setMode('pin')} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary-500 transition-all group text-left">
                <div className="p-3 bg-gray-50 text-gray-600 rounded-full group-hover:bg-gray-100">
                    <KeypadIcon className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Código PIN</h3>
                    <p className="text-xs text-slate-500">Acceso manual alternativo</p>
                </div>
            </button>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-100 rounded-xl border border-slate-200 p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Registro de Asistencia</h2>
            <p className="text-slate-500 mb-8 text-center">Seleccione su método de identificación preferido.</p>

            {status === 'success' ? (
                <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center animate-fade-in">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                        <CheckCircleIcon className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 mb-2">Registro Exitoso</h3>
                    <p className="text-gray-600">{message}</p>
                </div>
            ) : (
                <>
                    {mode === 'select' && <SelectionScreen />}

                    {mode === 'facial' && (
                        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md flex flex-col items-center">
                            <div className="relative w-64 h-64 bg-black rounded-full overflow-hidden border-4 border-slate-200 mb-4">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                {status === 'scanning' && <div className="absolute inset-0 bg-primary-500/20 animate-pulse"></div>}
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-4">{status === 'scanning' ? 'Verificando...' : 'Mire a la cámara'}</p>
                            {status !== 'scanning' && (
                                <button onClick={handleFacialScan} className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold">Escanear Ahora</button>
                            )}
                            <button onClick={reset} className="mt-4 text-sm text-gray-500 hover:text-gray-800">Volver</button>
                        </div>
                    )}

                    {mode === 'fingerprint' && (
                        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
                            <div 
                                onClick={status !== 'scanning' ? handleFingerprintScan : undefined}
                                className={`mx-auto flex items-center justify-center h-32 w-32 rounded-full border-4 transition-all cursor-pointer mb-6 ${status === 'scanning' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-300'}`}
                            >
                                <FingerPrintIcon className={`h-16 w-16 ${status === 'scanning' ? 'text-purple-600 animate-pulse' : 'text-slate-400'}`} />
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-4">{status === 'scanning' ? 'Leyendo huella...' : 'Coloque el dedo en el sensor'}</p>
                            <button onClick={reset} className="mt-2 text-sm text-gray-500 hover:text-gray-800">Volver</button>
                        </div>
                    )}

                    {mode === 'pin' && (
                        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
                            <form onSubmit={handlePinSubmit} className="space-y-6">
                                <div className="text-center">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingrese su PIN</label>
                                    <input 
                                        type="password" 
                                        value={pin} 
                                        onChange={e => setPin(e.target.value)} 
                                        className="w-40 text-center text-3xl tracking-[0.5em] p-2 border-b-2 border-gray-300 focus:border-gray-800 focus:outline-none bg-transparent mx-auto block"
                                        maxLength={4}
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" className="w-full py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900">Verificar</button>
                            </form>
                            <button onClick={reset} className="w-full mt-4 text-sm text-gray-500 hover:text-gray-800">Volver</button>
                        </div>
                    )}

                    {status === 'error' && <p className="mt-4 text-sm text-red-600 font-bold bg-red-50 px-4 py-2 rounded-full">{message}</p>}
                </>
            )}
            
            <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
                <AlertTriangleIcon className="h-3 w-3" />
                <span>Ubicación requerida para validación.</span>
            </div>
        </div>
    );
};

export default StaffAttendanceKiosk;