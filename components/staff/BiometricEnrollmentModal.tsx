import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { 
    CloseIcon, 
    FingerPrintIcon, 
    CameraIcon, 
    KeypadIcon, 
    CheckCircleIcon, 
    AlertTriangleIcon,
    SparklesIcon,
    ClockIcon
} from '../icons/Icons';

interface BiometricEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSaveUser: (updatedData: Partial<User>) => void;
}

const BiometricEnrollmentModal: React.FC<BiometricEnrollmentModalProps> = ({ 
    isOpen, 
    onClose, 
    user, 
    onSaveUser 
}) => {
    const [activeTab, setActiveTab] = useState<'facial' | 'fingerprint' | 'pin' | 'parameters'>('facial');
    
    // Facial State
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(user.facialPhotoUrl || user.photoUrl || null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Fingerprint State
    const [consentGiven, setConsentGiven] = useState(false);
    const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);
    const [fingerprintProgress, setFingerprintProgress] = useState(0);
    const [fingerprintDone, setFingerprintDone] = useState(!!user.biometricRegistered);

    // PIN State
    const [pin, setPin] = useState(user.accessPin || '');
    
    // Municipal Labor Parameters (Dirección de Talento Humano)
    const isFDDefault = user.tipoFuncionario === 'FD' || user.role === 'Rector' || user.role === 'Vicerrector' || user.role === 'Inspector General';
    const [tipoFuncionario, setTipoFuncionario] = useState<'FD' | 'OTROS'>(isFDDefault ? 'FD' : (user.tipoFuncionario || 'OTROS'));
    const [allowedLunchMinutes, setAllowedLunchMinutes] = useState<number>(user.allowedLunchMinutes ?? 30);
    const [grupoOcupacional, setGrupoOcupacional] = useState<string>(user.grupoOcupacional || (user.role.includes('Profesor') ? 'DOCENTE CATEGORIA E' : 'ADMINISTRATIVO'));

    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCapturedPhoto(user.facialPhotoUrl || user.photoUrl || null);
            setFingerprintDone(!!user.biometricRegistered);
            setPin(user.accessPin || '');
            const isFD = user.tipoFuncionario === 'FD' || user.role === 'Rector' || user.role === 'Vicerrector' || user.role === 'Inspector General';
            setTipoFuncionario(isFD ? 'FD' : (user.tipoFuncionario || 'OTROS'));
            setAllowedLunchMinutes(user.allowedLunchMinutes ?? 30);
            setGrupoOcupacional(user.grupoOcupacional || (user.role.includes('Profesor') ? 'DOCENTE CATEGORIA E' : 'ADMINISTRATIVO'));
            setSuccessMessage('');
        }
    }, [isOpen, user]);

    // Handle Camera for Facial tab
    useEffect(() => {
        if (isOpen && activeTab === 'facial') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen, activeTab]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
        } catch (err) {
            console.warn("Cámara no accesible:", err);
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minDim = Math.min(video.videoWidth || 320, video.videoHeight || 320);
        const startX = ((video.videoWidth || 320) - minDim) / 2;
        const startY = ((video.videoHeight || 320) - minDim) / 2;

        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 320, 320);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(dataUrl);
    };

    const handleSaveFacial = () => {
        if (!capturedPhoto) return;
        onSaveUser({
            facialRegistered: true,
            facialPhotoUrl: capturedPhoto,
            photoUrl: capturedPhoto,
            biometricEnrolledAt: new Date().toISOString()
        });
        setSuccessMessage('¡Fotografía facial oficial guardada con éxito!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleFingerprintScan = () => {
        if (!consentGiven) return;
        setIsScanningFingerprint(true);
        setFingerprintProgress(0);

        const interval = setInterval(() => {
            setFingerprintProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsScanningFingerprint(false);
                    setFingerprintDone(true);
                    onSaveUser({
                        biometricRegistered: true,
                        biometricEnrolledAt: new Date().toISOString()
                    });
                    setSuccessMessage('¡Huella dactilar vinculada y encriptada exitosamente!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    return 100;
                }
                return prev + 20;
            });
        }, 250);
    };

    const handleSavePin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length < 4) {
            alert('El código PIN debe tener 4 dígitos.');
            return;
        }
        onSaveUser({
            accessPin: pin.trim()
        });
        setSuccessMessage('¡Código PIN de marcaje actualizado correctamente!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleSaveParameters = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveUser({
            tipoFuncionario,
            allowedLunchMinutes: Number(allowedLunchMinutes),
            grupoOcupacional: grupoOcupacional.trim()
        });
        setSuccessMessage('¡Parámetros de jornada y almuerzo guardados correctamente!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const generateRandomPin = () => {
        const rand = Math.floor(1000 + Math.random() * 9000).toString();
        setPin(rand);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[120] flex justify-center items-center p-3 sm:p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                <canvas ref={canvasRef} className="hidden" />

                {/* Header */}
                <header className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Credenciales Biométricas y Marcaje</h2>
                        <p className="text-xs text-slate-500">
                            Colaborador: <strong>{user.name}</strong> ({user.role})
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </header>

                {/* Status Badges Header */}
                <div className="bg-slate-100/70 px-4 py-2.5 flex items-center justify-around border-b border-slate-200 text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-600">Rostro:</span>
                        {user.facialRegistered || user.facialPhotoUrl ? (
                            <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">✓ Registrado</span>
                        ) : (
                            <span className="text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Sin Foto</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-600">Huella:</span>
                        {user.biometricRegistered ? (
                            <span className="text-purple-700 bg-purple-100 font-bold px-2 py-0.5 rounded-full">✓ Vinculada</span>
                        ) : (
                            <span className="text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Sin Huella</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-600">PIN:</span>
                        {user.accessPin ? (
                            <span className="text-sky-700 bg-sky-100 font-bold px-2 py-0.5 rounded-full font-mono">{user.accessPin}</span>
                        ) : (
                            <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Sin PIN</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-600">Tipo:</span>
                        <span className="text-indigo-700 bg-indigo-100 font-bold px-2 py-0.5 rounded-full">{tipoFuncionario}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-white flex-wrap">
                    <button
                        onClick={() => setActiveTab('facial')}
                        className={`flex-1 min-w-[110px] py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                            activeTab === 'facial' 
                                ? 'border-sky-600 text-sky-600 bg-sky-50/40' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <CameraIcon className="h-4 w-4" />
                        1. Rostro
                    </button>
                    <button
                        onClick={() => setActiveTab('fingerprint')}
                        className={`flex-1 min-w-[110px] py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                            activeTab === 'fingerprint' 
                                ? 'border-purple-600 text-purple-600 bg-purple-50/40' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FingerPrintIcon className="h-4 w-4" />
                        2. Huella
                    </button>
                    <button
                        onClick={() => setActiveTab('pin')}
                        className={`flex-1 min-w-[90px] py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                            activeTab === 'pin' 
                                ? 'border-slate-800 text-slate-800 bg-slate-50' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <KeypadIcon className="h-4 w-4" />
                        3. PIN
                    </button>
                    <button
                        onClick={() => setActiveTab('parameters')}
                        className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                            activeTab === 'parameters' 
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <ClockIcon className="h-4 w-4" />
                        4. Almuerzo & FD
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-5 overflow-y-auto space-y-4">
                    {successMessage && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Facial Tab */}
                    {activeTab === 'facial' && (
                        <div className="flex flex-col items-center space-y-4">
                            <p className="text-xs text-slate-600 text-center">
                                Capture una fotografía nítida del rostro de <strong>{user.name}</strong> para que el Kiosk pueda reconocerlo y contrastar su asistencia.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                                {/* Live Camera Viewfinder */}
                                <div className="relative w-48 h-48 bg-black rounded-xl overflow-hidden border-2 border-sky-500 shadow-md">
                                    <video 
                                        ref={videoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        className="w-full h-full object-cover transform scale-x-[-1]" 
                                    />
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="w-32 h-40 rounded-[50%] border-2 border-sky-400 border-dashed animate-pulse"></div>
                                    </div>
                                    <div className="absolute bottom-1.5 left-0 right-0 text-center">
                                        <span className="text-[9px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded-full">
                                            {isCameraActive ? 'En vivo' : 'Iniciando cámara...'}
                                        </span>
                                    </div>
                                </div>

                                {/* Captured Reference Photo */}
                                <div className="flex flex-col items-center">
                                    <div className="w-48 h-48 rounded-xl border-2 border-slate-300 bg-slate-100 flex items-center justify-center overflow-hidden">
                                        {capturedPhoto ? (
                                            <img src={capturedPhoto} alt="Rostro de referencia" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-3 text-slate-400">
                                                <CameraIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                                                <p className="text-xs font-medium">Sin foto capturada</p>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 mt-1">
                                        Foto Oficial Registrada
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                                <button
                                    type="button"
                                    onClick={capturePhoto}
                                    className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <CameraIcon className="h-4 w-4" />
                                    Tomar con Cámara
                                </button>
                                
                                <label className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center">
                                    <span>📁 Subir desde Archivo</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const res = event.target?.result as string;
                                                if (res) setCapturedPhoto(res);
                                            };
                                            reader.readAsDataURL(file);
                                        }} 
                                    />
                                </label>

                                {capturedPhoto && (
                                    <button
                                        type="button"
                                        onClick={handleSaveFacial}
                                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Guardar Foto Oficial
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Fingerprint Tab */}
                    {activeTab === 'fingerprint' && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                                <p className="font-bold text-slate-800 mb-1">Consentimiento de Biometría Institucional</p>
                                <p>Los datos biométricos de huella dactilar se encriptan bajo estándares institucionales para uso estricto en el control de presencia laboral.</p>
                            </div>

                            <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                                <input 
                                    type="checkbox" 
                                    checked={consentGiven} 
                                    onChange={e => setConsentGiven(e.target.checked)} 
                                    className="mt-0.5 h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-xs text-slate-700">
                                    El colaborador otorga su consentimiento expreso para el registro de su huella dactilar.
                                </span>
                            </label>

                            <div className="flex flex-col items-center justify-center py-3">
                                <div className={`relative p-6 rounded-full border-4 transition-all duration-300 ${
                                    isScanningFingerprint 
                                        ? 'border-purple-500 bg-purple-50 shadow-md scale-105' 
                                        : fingerprintDone
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-slate-200'
                                }`}>
                                    <FingerPrintIcon className={`h-16 w-16 ${
                                        isScanningFingerprint ? 'text-purple-600 animate-pulse' : fingerprintDone ? 'text-emerald-600' : 'text-slate-400'
                                    }`} />
                                    {isScanningFingerprint && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-purple-700">{fingerprintProgress}%</span>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-3 text-xs font-semibold text-slate-600">
                                    {isScanningFingerprint 
                                        ? 'Registrando huella en el lector...' 
                                        : fingerprintDone 
                                            ? '✓ Huella dactilar activa en el sistema' 
                                            : 'Presione iniciar escaneo para registrar huella'}
                                </p>
                            </div>

                            <button 
                                type="button"
                                onClick={handleFingerprintScan} 
                                disabled={!consentGiven || isScanningFingerprint} 
                                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {fingerprintDone ? 'Volver a Escanear Huella' : 'Iniciar Escaneo Biométrico'}
                            </button>
                        </div>
                    )}

                    {/* PIN Tab */}
                    {activeTab === 'pin' && (
                        <form onSubmit={handleSavePin} className="space-y-4">
                            <p className="text-xs text-slate-600">
                                El código PIN permite al colaborador marcar asistencia rápidamente en el Kiosk introduciendo 4 dígitos personales si no dispone de cámara o lector biométrico.
                            </p>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                    Código PIN Personal (4 Dígitos):
                                </label>
                                <input 
                                    type="text" 
                                    value={pin} 
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                        setPin(val);
                                    }} 
                                    className="w-40 text-center text-2xl tracking-[0.4em] p-2 border-b-2 border-slate-300 focus:border-slate-800 focus:outline-none bg-white rounded-md mx-auto block font-mono font-bold"
                                    placeholder="••••"
                                    maxLength={4}
                                    required
                                />
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={generateRandomPin}
                                        className="text-xs text-sky-600 hover:underline font-semibold"
                                    >
                                        🎲 Generar PIN aleatorio
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                            >
                                Guardar Código PIN
                            </button>
                        </form>
                    )}

                    {/* Municipal Labor & Lunch Parameters Tab */}
                    {activeTab === 'parameters' && (
                        <form onSubmit={handleSaveParameters} className="space-y-4">
                            <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-xs text-indigo-900">
                                <p className="font-bold flex items-center gap-1.5 mb-1">
                                    <ClockIcon className="h-4 w-4 text-indigo-700" />
                                    Parámetros Oficiales - Dirección Metropolitana de Talento Humano
                                </p>
                                <p className="text-[11px] text-indigo-800">
                                    Configure el régimen de control de asistencia para la determinación de novedades (FD vs. OTROS) y el tiempo autorizado de almuerzo.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Tipo de Funcionario (Control de Jornada):
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                                            tipoFuncionario === 'FD' 
                                                ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 font-bold' 
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}>
                                            <input 
                                                type="radio" 
                                                name="tipoFuncionario" 
                                                value="FD"
                                                checked={tipoFuncionario === 'FD'} 
                                                onChange={() => setTipoFuncionario('FD')}
                                                className="text-indigo-600 focus:ring-indigo-500" 
                                            />
                                            <div>
                                                <p className="text-xs">FD (Funcionario Directivo)</p>
                                                <p className="text-[10px] text-slate-500 font-normal">Jornada 8.5h mínima flexible</p>
                                            </div>
                                        </label>

                                        <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                                            tipoFuncionario === 'OTROS' 
                                                ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 font-bold' 
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}>
                                            <input 
                                                type="radio" 
                                                name="tipoFuncionario" 
                                                value="OTROS"
                                                checked={tipoFuncionario === 'OTROS'} 
                                                onChange={() => setTipoFuncionario('OTROS')}
                                                className="text-indigo-600 focus:ring-indigo-500" 
                                            />
                                            <div>
                                                <p className="text-xs">OTROS (Docente / Administrativo)</p>
                                                <p className="text-[10px] text-slate-500 font-normal">Entrada y salida por horario fijo</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Tiempo de Almuerzo Autorizado (Minutos):
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                min={0}
                                                max={120}
                                                step={5}
                                                value={allowedLunchMinutes}
                                                onChange={e => setAllowedLunchMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                                                minutos
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5 mt-1.5">
                                            {[20, 30, 45, 60].map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setAllowedLunchMinutes(m)}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                                                        allowedLunchMinutes === m 
                                                            ? 'bg-indigo-600 text-white border-indigo-600' 
                                                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {m} min
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Grupo Ocupacional:
                                        </label>
                                        <input 
                                            type="text" 
                                            value={grupoOcupacional}
                                            onChange={e => setGrupoOcupacional(e.target.value)}
                                            placeholder="DOCENTE CATEGORIA E"
                                            className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white font-semibold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Ej: DOCENTE CATEGORIA E, ADMINISTRATIVO, SERVICIOS
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors mt-2"
                            >
                                Guardar Parámetros de Jornada y Almuerzo
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <footer className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                    >
                        Cerrar Ventana
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default BiometricEnrollmentModal;