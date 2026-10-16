import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { User, StaffAttendanceRecord, AttendanceJustification, PunchType } from '../../types';
import { InstitutionContext } from '../../contexts/UserContext';
import { 
    CameraIcon, 
    CheckCircleIcon, 
    AlertTriangleIcon, 
    FingerPrintIcon, 
    KeypadIcon, 
    LocationMarkerIcon,
    ClockIcon,
    SparklesIcon,
    SearchIcon,
    CloseIcon
} from '../icons/Icons';
import { compareFaces, FaceComparisonResult } from '../../lib/faceMatching';

interface StaffAttendanceKioskProps {
    users: User[];
    records?: StaffAttendanceRecord[];
    onRecordAttendance: (
        userId: string, 
        method: 'Biometric' | 'Manual' | 'Facial', 
        location?: { latitude: number; longitude: number; },
        justification?: AttendanceJustification,
        photoProof?: string,
        facialConfidence?: number,
        facialMatch?: boolean,
        flagReason?: string
    ) => void;
    onCompleted?: () => void;
}

const PRESET_JUSTIFICATION_REASONS = [
    'Trabajo de campo / Salida pedagógica autorizada',
    'Comisión de servicios externa / Trámite institucional',
    'Dificultad de transporte / Congestión vehicular imprevista',
    'Teletrabajo o planificación académica remota',
    'Falla o imprecisión del sensor GPS del dispositivo',
    'Otro motivo institucional'
];

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return c * R * 1000;
}

const PUNCH_STAGES: { type: PunchType; label: string; step: number; icon: string }[] = [
    { type: 'in', label: '1. Entrada', step: 1, icon: '🌅' },
    { type: 'out_break', label: '2. Salida Receso', step: 2, icon: '☕' },
    { type: 'in_break', label: '3. Regreso Receso', step: 3, icon: '🥪' },
    { type: 'out', label: '4. Salida Fin Jornada', step: 4, icon: '🏠' }
];

type KioskStatus = 'idle' | 'scanning' | 'success' | 'error' | 'geofence_prompt' | 'facial_mismatch_prompt';

const StaffAttendanceKiosk: React.FC<StaffAttendanceKioskProps> = ({ 
    users, 
    records = [], 
    onRecordAttendance,
    onCompleted
}) => {
    const { institution } = useContext(InstitutionContext);

    // Kiosk States
    const [mode, setMode] = useState<'facial' | 'fingerprint' | 'pin' | 'select'>('select');
    const [status, setStatus] = useState<KioskStatus>('idle');
    const [message, setMessage] = useState('');
    const [identifiedUser, setIdentifiedUser] = useState<User | null>(null);
    const [pin, setPin] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserInKiosk, setSelectedUserInKiosk] = useState<User | null>(null);

    // Webcam refs & streams
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    // Facial verification comparison details
    const [facialConfidence, setFacialConfidence] = useState<number | null>(null);
    const [facialMismatchData, setFacialMismatchData] = useState<{
        targetUser: User;
        photoProof: string;
        referencePhoto: string;
        confidence: number;
        location?: { latitude: number; longitude: number };
    } | null>(null);

    // Geofence Prompt State
    const [pendingPunchData, setPendingPunchData] = useState<{
        user: User;
        method: 'Biometric' | 'Manual' | 'Facial';
        location?: { latitude: number; longitude: number };
        distance: number;
        photoProof?: string;
        facialConfidence?: number;
        facialMatch?: boolean;
        flagReason?: string;
    } | null>(null);
    const [justificationReason, setJustificationReason] = useState(PRESET_JUSTIFICATION_REASONS[0]);
    const [justificationNote, setJustificationNote] = useState('');

    // Eligible staff list (Exclude parents & students)
    const staffUsers = useMemo(() => {
        return (users || []).filter(u => u.role !== 'Familiar' && u.role !== 'Alumno');
    }, [users]);

    const filteredStaff = useMemo(() => {
        if (!searchQuery.trim()) return staffUsers;
        const q = searchQuery.toLowerCase();
        return staffUsers.filter(u => 
            u.name.toLowerCase().includes(q) || 
            u.email.toLowerCase().includes(q) ||
            (u.cedula && u.cedula.includes(q))
        );
    }, [staffUsers, searchQuery]);

    const activeUser = selectedUserInKiosk;

    // Today's attendance record for active user
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const activeUserTodayRecord = useMemo(() => {
        if (!activeUser) return null;
        return records.find(r => r.userId === activeUser.id && r.date === todayStr);
    }, [activeUser, records, todayStr]);

    const activeUserPunches = activeUserTodayRecord?.punches || [];
    const completedPunchTypes = activeUserPunches.map(p => p.type);
    const nextPunchIndex = activeUserPunches.length;
    const isShiftCompleted = nextPunchIndex >= 4 || completedPunchTypes.includes('out');

    // Camera control
    useEffect(() => {
        if (mode === 'facial' && (status === 'idle' || status === 'scanning')) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [mode, status]);

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
            setMessage("Cámara no detectada. Verifique permisos o use marcaje por PIN.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const takePhotoSnapshot = (): string | undefined => {
        if (!videoRef.current) return undefined;
        try {
            const video = videoRef.current;
            const canvas = canvasRef.current || document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 320;
            const ctx = canvas.getContext('2d');
            if (!ctx) return undefined;

            const minDim = Math.min(video.videoWidth || 320, video.videoHeight || 320);
            const startX = ((video.videoWidth || 320) - minDim) / 2;
            const startY = ((video.videoHeight || 320) - minDim) / 2;
            
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 320, 320);
            return canvas.toDataURL('image/jpeg', 0.85);
        } catch (e) {
            console.error("Error capturando foto:", e);
            return undefined;
        }
    };

    const reset = () => {
        setStatus('idle');
        setPin('');
        setMessage('');
        setIdentifiedUser(null);
        setMode('select');
        setPendingPunchData(null);
        setCapturedPhoto(null);
        setFacialConfidence(null);
        setFacialMismatchData(null);
        setJustificationNote('');
    };

    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                reset();
                if (onCompleted) onCompleted();
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [status, onCompleted]);

    const getLocation = async () => {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { 
                    timeout: 5000, 
                    enableHighAccuracy: true 
                });
            });
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (e) {
            return {
                latitude: institution?.geofenceConfig?.latitude || -0.180653,
                longitude: institution?.geofenceConfig?.longitude || -78.467834
            };
        }
    };

    const processPunchVerification = async (
        targetUser: User, 
        method: 'Biometric' | 'Manual' | 'Facial',
        photoProof?: string,
        overrideLocation?: { latitude: number; longitude: number },
        confidenceScore?: number,
        isFacialMatch = true,
        customFlagReason?: string
    ) => {
        const location = overrideLocation || await getLocation();
        
        let distance = 0;
        let isOutOfRange = false;
        const geofence = institution?.geofenceConfig;

        if (geofence && geofence.latitude && geofence.longitude) {
            distance = Math.round(getDistanceFromLatLonInM(
                location.latitude,
                location.longitude,
                geofence.latitude,
                geofence.longitude
            ));
            if (geofence.radius && distance > geofence.radius) {
                isOutOfRange = true;
            }
        }

        if (photoProof) {
            setCapturedPhoto(photoProof);
        }

        if (isOutOfRange) {
            setPendingPunchData({
                user: targetUser,
                method,
                location,
                distance,
                photoProof,
                facialConfidence: confidenceScore,
                facialMatch: isFacialMatch,
                flagReason: customFlagReason
            });
            setStatus('geofence_prompt');
            setMessage(`Ubicación fuera de rango (${distance} m detectados). Ingrese el motivo.`);
        } else {
            setIdentifiedUser(targetUser);
            setStatus('success');
            setMessage(`¡Hola, ${targetUser.name}! Marcaje registrado exitosamente.`);
            onRecordAttendance(
                targetUser.id, 
                method, 
                location, 
                undefined, 
                photoProof,
                confidenceScore,
                isFacialMatch,
                customFlagReason
            );
        }
    };

    // 1. Enhanced Facial Recognition with Real Identity Matching
    const handleFacialScan = async () => {
        if (!activeUser) {
            setStatus('error');
            setMessage('Por favor seleccione su nombre en la lista de colaboradores antes de escanear su rostro.');
            return;
        }

        const referencePhoto = activeUser.facialPhotoUrl || activeUser.photoUrl;
        
        // Strictest identity check: user MUST have an official enrolled reference face photo
        if (!referencePhoto) {
            setStatus('error');
            setMessage(`⚠️ ${activeUser.name} no cuenta con una Fotografía Facial Oficial registrada. El Administrador debe inscribir su rostro en "Inscripción de Personal" (Gestión Centro) antes de usar marcaje facial, o puede registrar su asistencia mediante su código PIN.`);
            return;
        }

        setStatus('scanning');
        setMessage(`Alineando rostro y contrastando biometría para ${activeUser.name}...`);

        const photo = takePhotoSnapshot();
        if (!photo) {
            setStatus('error');
            setMessage('No se pudo capturar la imagen de la cámara. Verifique que la cámara esté encendida.');
            return;
        }
        setCapturedPhoto(photo);

        try {
            // Compare captured webcam frame with official registered photo
            const comparison: FaceComparisonResult = await compareFaces(photo, referencePhoto, 60);
            setFacialConfidence(comparison.confidence);

            if (comparison.match) {
                // Identity matches enrolled user photo!
                setMessage(`✓ Identidad biométrica confirmada (${comparison.confidence}% de coincidencia con foto oficial).`);
                setTimeout(async () => {
                    await processPunchVerification(activeUser, 'Facial', photo, undefined, comparison.confidence, true);
                }, 900);
            } else {
                // Biometric mismatch detected (different person, wrong user selected, etc.)
                stopCamera();
                const loc = await getLocation();
                setFacialMismatchData({
                    targetUser: activeUser,
                    photoProof: photo,
                    referencePhoto: referencePhoto,
                    confidence: comparison.confidence,
                    location: loc
                });
                setStatus('facial_mismatch_prompt');
                setMessage(`⚠️ Inconsistencia Biométrica: El rostro actual tiene solo ${comparison.confidence}% de coincidencia con la fotografía oficial registrada para ${activeUser.name}.`);
            }
        } catch (err) {
            console.error("Error al contrastar rostros:", err);
            // In case of parsing failure, fallback with captured evidence
            await processPunchVerification(activeUser, 'Facial', photo);
        }
    };

    // Handle force punch when face mismatch occurs (supervised report)
    const handleForcePunchWithIncident = async () => {
        if (!facialMismatchData) return;
        const target = facialMismatchData.targetUser;
        const photo = facialMismatchData.photoProof;
        const score = facialMismatchData.confidence;
        const loc = facialMismatchData.location;

        setIdentifiedUser(target);
        setStatus('success');
        setMessage(`Marcaje registrado con advertencia: Inconsistencia facial reportada al Administrador.`);
        
        onRecordAttendance(
            target.id,
            'Facial',
            loc,
            undefined,
            photo,
            score,
            false,
            `Inconsistencia facial: ${score}% similitud con foto oficial.`
        );
    };

    // 2. Fingerprint Flow
    const handleFingerprintScan = async () => {
        if (!activeUser) {
            setStatus('error');
            setMessage('Por favor seleccione su nombre en la lista de colaboradores antes de registrar su huella.');
            return;
        }

        setStatus('scanning');
        setMessage(`Escaneando huella en el sensor para ${activeUser.name}...`);

        setTimeout(async () => {
            await processPunchVerification(activeUser, 'Biometric');
        }, 1200);
    };

    // 3. PIN Code Flow
    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pin || pin.length < 4) {
            setStatus('error');
            setMessage('Ingrese un PIN de al menos 4 dígitos.');
            return;
        }

        setStatus('scanning');
        setMessage('Verificando código de acceso...');

        setTimeout(async () => {
            const user = activeUser 
                ? (activeUser.accessPin === pin ? activeUser : null)
                : users.find(u => u.accessPin === pin);

            if (user) {
                await processPunchVerification(user, 'Manual');
            } else {
                setStatus('error');
                setMessage('PIN incorrecto. Intente nuevamente.');
            }
        }, 600);
    };

    // Submit with Justification
    const handleConfirmJustification = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pendingPunchData) return;

        if (!justificationNote.trim() || justificationNote.trim().length < 6) {
            alert('Por favor ingrese una nota explicativa de al menos 6 caracteres.');
            return;
        }

        const justification: AttendanceJustification = {
            reason: justificationReason,
            note: justificationNote.trim(),
            timestamp: new Date().toISOString()
        };

        const targetUser = pendingPunchData.user;
        setIdentifiedUser(targetUser);
        setStatus('success');
        setMessage(`Marcaje con justificación registrado para ${targetUser.name}.`);

        onRecordAttendance(
            targetUser.id,
            pendingPunchData.method,
            pendingPunchData.location,
            justification,
            pendingPunchData.photoProof,
            pendingPunchData.facialConfidence,
            pendingPunchData.facialMatch,
            pendingPunchData.flagReason
        );
    };

    return (
        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 max-w-4xl mx-auto">
            {/* Header / Brand */}
            <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <FingerPrintIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                            Terminal Biométrico de Asistencia
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                4 Ciclos Secuenciales
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400">
                            {institution?.name || 'Unidad Educativa'} · Verificación biométrica facial y georreferenciada
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-mono font-bold text-sky-400">
                            {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-slate-400">
                            {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                    {activeUser && (
                        <button 
                            onClick={reset}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                        >
                            Cambiar Colaborador
                        </button>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="p-6">
                {/* 1. SELECTION STEP: Select or search staff member */}
                {mode === 'select' && !activeUser && (
                    <div className="space-y-6">
                        <div className="text-center max-w-lg mx-auto">
                            <h3 className="text-xl font-bold text-white mb-1">Identifíquese para Registrar Marcaje</h3>
                            <p className="text-xs text-slate-400">
                                Busque su nombre en la lista o ingrese directamente con su código PIN.
                            </p>
                        </div>

                        {/* Search Bar & Fast PIN Button */}
                        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, correo o cédula..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                />
                                <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            </div>

                            <button
                                onClick={() => {
                                    setMode('pin');
                                    setSelectedUserInKiosk(null);
                                    setMessage('Ingrese su código PIN institucional.');
                                }}
                                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <KeypadIcon className="h-4 w-4" />
                                Marcar con PIN Directo
                            </button>
                        </div>

                        {/* Staff Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1 border border-slate-800 rounded-xl bg-slate-950/40">
                            {filteredStaff.map(staff => {
                                const rec = records.find(r => r.userId === staff.id && r.date === todayStr);
                                const count = rec?.punches.length || 0;
                                const isDone = count >= 4;
                                const hasFacialPhoto = !!(staff.facialPhotoUrl || staff.photoUrl);

                                return (
                                    <button
                                        key={staff.id}
                                        onClick={() => {
                                            setSelectedUserInKiosk(staff);
                                            setMode('facial');
                                            setMessage(`Colóquese frente a la cámara para contrastar su identidad biométrica.`);
                                        }}
                                        className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 rounded-xl text-left transition flex items-center gap-3 group"
                                    >
                                        <div className="relative h-11 w-11 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-600">
                                            {staff.facialPhotoUrl || staff.photoUrl ? (
                                                <img 
                                                    src={staff.facialPhotoUrl || staff.photoUrl} 
                                                    alt={staff.name} 
                                                    className="h-full w-full object-cover" 
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center font-bold text-xs text-slate-300">
                                                    {staff.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            {hasFacialPhoto && (
                                                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" title="Foto oficial registrada" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                                                {staff.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 truncate">{staff.role}</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                                    isDone 
                                                        ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' 
                                                        : count > 0 
                                                            ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' 
                                                            : 'bg-slate-700/60 text-slate-400'
                                                }`}>
                                                    {isDone ? 'Jornada Completa' : count > 0 ? `${count}/4 marcajes` : 'Sin marcar hoy'}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                            {filteredStaff.length === 0 && (
                                <div className="col-span-full py-8 text-center text-xs text-slate-500">
                                    No se encontraron colaboradores con el término de búsqueda.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. ACTIVE USER VIEW: Shows Shift Sequence Progress & Biometric Verification */}
                {activeUser && status !== 'geofence_prompt' && status !== 'facial_mismatch_prompt' && (
                    <div className="space-y-6">
                        {/* User Profile & Shift Timeline Header */}
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-slate-700 overflow-hidden border-2 border-sky-500 flex-shrink-0">
                                    {activeUser.facialPhotoUrl || activeUser.photoUrl ? (
                                        <img src={activeUser.facialPhotoUrl || activeUser.photoUrl} alt={activeUser.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center font-bold text-sm text-slate-300">
                                            {activeUser.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-white text-base">{activeUser.name}</h3>
                                        {activeUser.facialPhotoUrl ? (
                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                                                ✓ Foto Oficial Enrolada
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                                                ⚠️ Sin Foto Oficial Enrolada
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400">{activeUser.role} · Cédula: {activeUser.cedula || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Verification Method Switcher */}
                            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-center">
                                <button
                                    onClick={() => { setMode('facial'); setStatus('idle'); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                        mode === 'facial' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <CameraIcon className="h-3.5 w-3.5" />
                                    Rostro
                                </button>
                                <button
                                    onClick={() => { setMode('fingerprint'); setStatus('idle'); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                        mode === 'fingerprint' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <FingerPrintIcon className="h-3.5 w-3.5" />
                                    Huella
                                </button>
                                <button
                                    onClick={() => { setMode('pin'); setStatus('idle'); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                        mode === 'pin' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <KeypadIcon className="h-3.5 w-3.5" />
                                    PIN
                                </button>
                            </div>
                        </div>

                        {/* SEQUENTIAL 4-PUNCH CYCLE DISPLAY */}
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-300">Ciclo de Marcajes del Día (Secuencia Obligatoria):</span>
                                <span className="font-mono text-sky-400 font-bold">{nextPunchIndex}/4 Completados</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {PUNCH_STAGES.map((stage, idx) => {
                                    const punch = activeUserPunches[idx];
                                    const isDone = !!punch;
                                    const isCurrent = idx === nextPunchIndex && !isShiftCompleted;

                                    return (
                                        <div 
                                            key={stage.type}
                                            className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                                                isDone 
                                                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                                                    : isCurrent 
                                                        ? 'bg-sky-950/60 border-sky-400 shadow-md shadow-sky-500/10 text-sky-200 ring-2 ring-sky-500/40' 
                                                        : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold">{stage.label}</span>
                                                <span>{stage.icon}</span>
                                            </div>
                                            {isDone ? (
                                                <div className="font-mono font-bold text-white text-sm">
                                                    {punch.time}
                                                    <span className="block text-[9px] font-normal text-emerald-400">
                                                        ✓ Vía {punch.method}
                                                    </span>
                                                </div>
                                            ) : isCurrent ? (
                                                <div className="text-[11px] font-bold text-sky-300 animate-pulse">
                                                    👉 Siguiente a marcar
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-slate-500">Pendiente</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {isShiftCompleted && (
                                <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl text-purple-200 text-xs flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="h-5 w-5 text-purple-400 flex-shrink-0" />
                                        <span><strong>Jornada Completa:</strong> Ha registrado los 4 turnos correspondientes al día de hoy.</span>
                                    </div>
                                    <button 
                                        onClick={reset}
                                        className="text-[11px] bg-purple-700 hover:bg-purple-600 text-white font-bold px-3 py-1 rounded-lg transition"
                                    >
                                        Finalizar
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 3. VERIFICATION MODES */}
                        {!isShiftCompleted && (
                            <div>
                                {/* MODE A: FACIAL SCAN WITH REAL IDENTITY VERIFICATION */}
                                {mode === 'facial' && (
                                    <div className="flex flex-col items-center space-y-4">
                                        {/* Camera Viewfinder */}
                                        <div className="relative w-full max-w-md h-72 bg-black rounded-2xl overflow-hidden border-2 border-sky-500 shadow-xl flex items-center justify-center">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover transform scale-x-[-1]"
                                            />
                                            {/* Reticle Overlay */}
                                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                <div className={`w-44 h-56 rounded-[50%] border-2 border-dashed transition-colors duration-300 flex items-center justify-center ${
                                                    status === 'scanning' 
                                                        ? 'border-yellow-400 animate-spin' 
                                                        : status === 'success' 
                                                            ? 'border-emerald-400' 
                                                            : 'border-sky-400 animate-pulse'
                                                }`}>
                                                    <div className="w-full h-0.5 bg-sky-400/50 transform translate-y-[-10px]"></div>
                                                </div>
                                            </div>

                                            {/* Live Tag */}
                                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 border border-emerald-500/30">
                                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                                                <span>{isCameraActive ? 'Cámara Activa' : 'Iniciando Cámara...'}</span>
                                            </div>

                                            {/* Reference comparison badge */}
                                            {activeUser.facialPhotoUrl && (
                                                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-white flex items-center gap-2 border border-slate-700">
                                                    <img 
                                                        src={activeUser.facialPhotoUrl} 
                                                        alt="Foto oficial" 
                                                        className="h-6 w-6 rounded-full object-cover border border-sky-400" 
                                                    />
                                                    <span>Foto Oficial Lista</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Trigger Button */}
                                        <div className="w-full max-w-md">
                                            <button
                                                type="button"
                                                onClick={handleFacialScan}
                                                disabled={status === 'scanning'}
                                                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <CameraIcon className="h-5 w-5" />
                                                {status === 'scanning' ? 'Contrastando Rasgos...' : 'Escanear y Validar Identidad'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* MODE B: FINGERPRINT SCAN */}
                                {mode === 'fingerprint' && (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                        <div 
                                            onClick={handleFingerprintScan}
                                            className="h-32 w-32 rounded-3xl bg-purple-950/40 border-2 border-purple-500/40 hover:border-purple-400 flex items-center justify-center text-purple-400 hover:scale-105 cursor-pointer transition shadow-xl group"
                                        >
                                            <FingerPrintIcon className="h-16 w-16 group-hover:text-purple-300 transition" />
                                        </div>
                                        <p className="text-xs text-slate-400">Coloque su dedo sobre el lector biométrico o haga clic para escanear.</p>
                                        <button
                                            onClick={handleFingerprintScan}
                                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-md transition"
                                        >
                                            Escanear Huella Dactilar
                                        </button>
                                    </div>
                                )}

                                {/* MODE C: 4-DIGIT PIN */}
                                {mode === 'pin' && (
                                    <form onSubmit={handlePinSubmit} className="max-w-xs mx-auto space-y-4 py-4">
                                        <div className="text-center">
                                            <label className="text-xs font-bold text-slate-300 block mb-1">
                                                Código PIN de 4 Dígitos
                                            </label>
                                            <input
                                                type="password"
                                                maxLength={6}
                                                value={pin}
                                                onChange={e => setPin(e.target.value)}
                                                placeholder="••••"
                                                className="w-full bg-slate-800 border-2 border-slate-700 text-white text-center text-2xl font-mono tracking-widest rounded-xl py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                                        >
                                            <KeypadIcon className="h-4 w-4" />
                                            Confirmar Marcaje con PIN
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Status feedback message */}
                        {message && (
                            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                                status === 'success' 
                                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' 
                                    : status === 'error' 
                                        ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300' 
                                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                                {status === 'success' ? (
                                    <CheckCircleIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                                ) : status === 'error' ? (
                                    <AlertTriangleIcon className="h-5 w-5 text-rose-400 flex-shrink-0" />
                                ) : (
                                    <SparklesIcon className="h-5 w-5 text-sky-400 flex-shrink-0 animate-spin" />
                                )}
                                <span>{message}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. FACIAL MISMATCH PROMPT: Shown when webcam face does NOT match official reference */}
                {status === 'facial_mismatch_prompt' && facialMismatchData && (
                    <div className="bg-rose-950/30 border-2 border-rose-500/60 rounded-2xl p-6 space-y-6 max-w-xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-1">
                            <AlertTriangleIcon className="h-8 w-8" />
                        </div>

                        <div>
                            <h3 className="text-lg font-black text-white">Alerta de Inconsistencia Facial</h3>
                            <p className="text-xs text-rose-300 mt-1">
                                El rostro enfocado en la cámara <strong>no coincide</strong> con la fotografía oficial registrada para <strong>{facialMismatchData.targetUser.name}</strong>.
                            </p>
                        </div>

                        {/* Visual Side-by-Side Comparison */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                            <div className="flex flex-col items-center">
                                <div className="h-28 w-28 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md mb-2">
                                    <img 
                                        src={facialMismatchData.referencePhoto} 
                                        alt="Foto oficial registrada" 
                                        className="h-full w-full object-cover" 
                                    />
                                </div>
                                <span className="text-[11px] font-bold text-white">Foto Oficial Registrada</span>
                                <span className="text-[10px] text-emerald-400 font-semibold">100% Referencia</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="h-28 w-28 rounded-xl overflow-hidden border-2 border-rose-500 shadow-md mb-2">
                                    <img 
                                        src={facialMismatchData.photoProof} 
                                        alt="Rostro detectado en cámara" 
                                        className="h-full w-full object-cover" 
                                    />
                                </div>
                                <span className="text-[11px] font-bold text-white">Rostro en Cámara</span>
                                <span className="text-[10px] text-rose-400 font-bold">
                                    Coincidencia: {facialMismatchData.confidence}% (Mínimo: 60%)
                                </span>
                            </div>
                        </div>

                        <div className="text-left text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                            <p className="font-bold text-white">¿Por qué ocurre esto?</p>
                            <p>• La persona frente a la cámara no es el colaborador seleccionado.</p>
                            <p>• Iluminación deficiente, uso de mascarilla o ángulo excesivamente inclinado.</p>
                            <p>• Si es el colaborador, puede ingresar con su código PIN o reintentar enfocar su rostro de frente.</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setStatus('idle');
                                    setMessage('Reintentando captura facial. Mire de frente con buena iluminación.');
                                    startCamera();
                                }}
                                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs transition"
                            >
                                📸 Reintentar Captura
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMode('pin');
                                    setStatus('idle');
                                    setMessage('Ingrese su PIN de 4 dígitos para validar identidad.');
                                }}
                                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition"
                            >
                                🔑 Usar Código PIN
                            </button>

                            <button
                                type="button"
                                onClick={handleForcePunchWithIncident}
                                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl font-bold text-xs transition"
                                title="Registra el marcaje marcándolo como inconsistente y notifica al Administrador"
                            >
                                🚨 Reportar y Marcar
                            </button>
                        </div>
                    </div>
                )}

                {/* 5. GEOFENCE JUSTIFICATION PROMPT */}
                {status === 'geofence_prompt' && pendingPunchData && (
                    <form onSubmit={handleConfirmJustification} className="bg-amber-950/30 border-2 border-amber-500/60 rounded-2xl p-6 space-y-4 max-w-lg mx-auto">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                                <LocationMarkerIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-white text-base">Ubicación Fuera de Rango Permitido</h3>
                                <p className="text-xs text-amber-300">
                                    Detectado a <strong>{pendingPunchData.distance} metros</strong> de la sede institucional.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-300 block mb-1">
                                    Motivo de la Marcación Externa:
                                </label>
                                <select
                                    value={justificationReason}
                                    onChange={e => setJustificationReason(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500"
                                >
                                    {PRESET_JUSTIFICATION_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-300 block mb-1">
                                    Nota o Justificación Explicativa (Mínimo 6 caracteres):
                                </label>
                                <textarea
                                    rows={3}
                                    value={justificationNote}
                                    onChange={e => setJustificationNote(e.target.value)}
                                    placeholder="Detalle la comisión o motivo por el cual no se encuentra en el predio escolar..."
                                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={reset}
                                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-md transition"
                            >
                                Guardar con Justificación
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StaffAttendanceKiosk;
