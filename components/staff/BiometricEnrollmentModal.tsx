
import React, { useState } from 'react';
import { CloseIcon, FingerPrintIcon, CheckCircleIcon } from '../icons/Icons';

interface BiometricEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEnroll: (success: boolean) => void;
    userName: string;
}

const BiometricEnrollmentModal: React.FC<BiometricEnrollmentModalProps> = ({ isOpen, onClose, onEnroll, userName }) => {
    const [consentGiven, setConsentGiven] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [enrollmentComplete, setEnrollmentComplete] = useState(false);

    const handleScan = () => {
        if (!consentGiven) return;
        setIsScanning(true);
        setScanProgress(0);

        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsScanning(false);
                    setEnrollmentComplete(true);
                    return 100;
                }
                return prev + 10;
            });
        }, 200); // Simulate 2 seconds scan
    };

    const handleFinish = () => {
        onEnroll(true);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <CloseIcon className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Registro Biométrico</h2>
                <p className="text-sm text-gray-600 mb-6">Configuración de huella dactilar para {userName}</p>

                {!enrollmentComplete ? (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-800">
                            <p className="font-bold mb-1">Consentimiento Informado</p>
                            <p>Sus datos biométricos (huella dactilar) serán procesados únicamente para el control de asistencia y seguridad. Estos datos serán encriptados y almacenados de forma segura. Usted tiene derecho a retirar este consentimiento en cualquier momento y optar por un método alternativo (PIN).</p>
                        </div>

                        <label className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                            <input 
                                type="checkbox" 
                                checked={consentGiven} 
                                onChange={e => setConsentGiven(e.target.checked)} 
                                className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">
                                Doy mi consentimiento explícito para el registro y uso de mi huella dactilar para fines de control de asistencia.
                            </span>
                        </label>

                        <div className="flex flex-col items-center justify-center py-4">
                            <div className={`relative p-6 rounded-full border-4 transition-all duration-500 ${isScanning ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                                <FingerPrintIcon className={`h-16 w-16 ${isScanning ? 'text-primary-600 animate-pulse' : 'text-gray-400'}`} />
                                {isScanning && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-bold text-primary-700">{scanProgress}%</span>
                                    </div>
                                )}
                            </div>
                            <p className="mt-4 text-sm font-medium text-gray-500">
                                {isScanning ? 'Escaneando...' : 'Coloque su dedo en el sensor'}
                            </p>
                        </div>

                        <button 
                            onClick={handleScan} 
                            disabled={!consentGiven || isScanning} 
                            className="w-full py-2 px-4 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Iniciar Escaneo
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-6 py-6">
                        <div className="inline-flex p-4 bg-green-100 rounded-full text-green-600">
                            <CheckCircleIcon className="h-12 w-12" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">¡Registro Exitoso!</h3>
                            <p className="text-gray-600 mt-2">Su huella dactilar ha sido encriptada y almacenada correctamente.</p>
                        </div>
                        <button onClick={handleFinish} className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                            Finalizar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BiometricEnrollmentModal;
