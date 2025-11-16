import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, UploadIcon, CloseIcon } from '../icons/Icons';

interface OcrUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => void;
}

const OcrUploadModal: React.FC<OcrUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
    const [view, setView] = useState<'select' | 'camera' | 'preview'>('select');
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // This effect handles the camera stream lifecycle.
        let stream: MediaStream | null = null;
        let active = true; // Flag to prevent state updates if the effect is cleaned up.

        if (view === 'camera' && videoRef.current) {
            setCameraError(null); // Reset previous errors on retry
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(s => {
                    if (!active) {
                        // If effect was cleaned up before stream started, stop the tracks.
                        s.getTracks().forEach(track => track.stop());
                        return;
                    }
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch((err: any) => {
                    if (!active) return;
                    console.error("Error accessing camera:", err);
                    // Provide specific, helpful error messages.
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        setCameraError("Permiso para acceder a la cámara denegado. Por favor, habilite el acceso en la configuración de su navegador y vuelva a intentarlo.");
                    } else {
                        setCameraError("No se pudo acceder a la cámara. Asegúrese de que no esté siendo utilizada por otra aplicación.");
                    }
                    setView('select');
                });
        }
        
        return () => {
            // Cleanup function to stop the camera stream.
            active = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [view]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setImageSrc(dataUrl);
            canvas.toBlob(blob => {
                if (blob) {
                    setFile(new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' }));
                }
            }, 'image/jpeg');
            setView('preview');
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setCameraError(null); // Clear camera error if user uploads a file instead.
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImageSrc(ev.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
            setView('preview');
        }
    };
    
    const handleSubmit = () => {
        if (file) {
            onUpload(file);
            handleClose();
        }
    };
    
    const handleClose = () => {
        setView('select');
        setImageSrc(null);
        setFile(null);
        setCameraError(null); // Clear error when closing the modal
        onClose();
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch (view) {
            case 'camera':
                return (
                    <div>
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-md bg-gray-900"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <div className="mt-4 flex justify-center">
                            <button onClick={handleCapture} className="p-4 bg-primary-600 rounded-full text-white hover:bg-primary-700">
                                <CameraIcon className="h-6 w-6"/>
                            </button>
                        </div>
                    </div>
                );
            case 'preview':
                return (
                    <div>
                        {imageSrc && <img src={imageSrc} alt="Preview" className="max-h-96 w-auto mx-auto rounded-md" />}
                        <p className="text-center text-sm text-gray-600 mt-2">{file?.name}</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => { setView('select'); setImageSrc(null); setFile(null); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Volver</button>
                            <button onClick={handleSubmit} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Subir para Procesar</button>
                        </div>
                    </div>
                );
            case 'select':
            default:
                return (
                    <>
                        {cameraError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm" role="alert">
                                <p className="font-bold">Error de Cámara</p>
                                <p>{cameraError}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => setView('camera')} className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors">
                                <CameraIcon className="h-12 w-12 mb-2" />
                                <span className="font-semibold">Tomar Foto</span>
                            </button>
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors cursor-pointer">
                                <UploadIcon className="h-12 w-12 mb-2" />
                                <span className="font-semibold">Subir Archivo</span>
                                <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={handleClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
                    <CloseIcon className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold mb-4">Cargar Hoja de Asistencia</h2>
                {renderContent()}
            </div>
        </div>
    );
};

export default OcrUploadModal;