import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, QrCodeIcon } from '../icons/Icons';

interface MobileScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedCode: string, hardwareType: 'BARCODE' | 'NFC' | 'MANUAL') => void;
  title?: string;
  subtitle?: string;
  sampleCodes?: { code: string; label: string; type: 'BARCODE' | 'NFC' }[];
}

export const MobileScannerModal: React.FC<MobileScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Escáner Móvil & Terminal de Lectura',
  subtitle = 'Compatible con cámara de dispositivo móvil, chip NFC y lector USB/Bluetooth',
  sampleCodes = []
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'nfc' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcReading, setNfcReading] = useState(false);
  const [nfcMessage, setNfcMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const manualInputRef = useRef<HTMLInputElement | null>(null);
  const barcodeDetectorRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Play subtle feedback beep on scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext not permitted or blocked
    }
  };

  const handleSuccessfulScan = (code: string, type: 'BARCODE' | 'NFC' | 'MANUAL') => {
    playBeep();
    onScan(code.trim(), type);
    onClose();
  };

  // Check Web NFC support
  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setNfcSupported(false);
    }
  }, []);

  // Handle Camera Stream
  useEffect(() => {
    if (!isOpen || activeMode !== 'camera') {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      // Initialize BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        try {
          barcodeDetectorRef.current = new (window as any).BarcodeDetector({
            formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'qr_code']
          });
        } catch (e) {
          console.warn('BarcodeDetector format init fallback', e);
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        startBarcodeScanningLoop();
      }
    } catch (err: any) {
      console.error('Error al acceder a la cámara:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Permiso denegado para acceder a la cámara. Por favor autoriza el permiso o usa el modo manual.'
          : 'No se detectó una cámara disponible en este equipo. Usa el modo manual o lector USB.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startBarcodeScanningLoop = () => {
    const scanFrame = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && barcodeDetectorRef.current) {
        try {
          const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue) {
              handleSuccessfulScan(rawValue, 'BARCODE');
              return;
            }
          }
        } catch {
          // ignore frame decode hiccups
        }
      }
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  // Start NFC Scan if requested
  const startNfcScan = async () => {
    if (!('NDEFReader' in window)) {
      setNfcMessage('Web NFC no está soportado en este navegador (requiere Chrome en Android con NFC activo).');
      return;
    }

    try {
      setNfcReading(true);
      setNfcMessage('Acerca la tarjeta o etiqueta NFC a la parte trasera del dispositivo móvil...');
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', ({ serialNumber, message }: any) => {
        let payload = serialNumber;
        if (message && message.records && message.records.length > 0) {
          const record = message.records[0];
          const textDecoder = new TextDecoder(record.encoding || 'utf-8');
          payload = textDecoder.decode(record.data) || serialNumber;
        }
        setNfcMessage(`¡NFC detectado! UID: ${payload}`);
        handleSuccessfulScan(payload, 'NFC');
      });

      ndef.addEventListener('readingerror', () => {
        setNfcMessage('Error al leer la etiqueta NFC. Intenta nuevamente.');
      });
    } catch (error: any) {
      console.error('Error iniciando escaneo NFC:', error);
      setNfcReading(false);
      setNfcMessage(`No se pudo activar NFC: ${error.message || 'Permiso denegado'}`);
    }
  };

  // Focus manual input when manual mode is selected
  useEffect(() => {
    if (activeMode === 'manual') {
      setTimeout(() => manualInputRef.current?.focus(), 150);
    }
  }, [activeMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
              <QrCodeIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">{title}</h3>
              <p className="text-xs text-indigo-200">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 p-2 bg-slate-100 gap-1 text-xs font-medium border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveMode('camera')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeMode === 'camera'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📷 Cámara Móvil</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('nfc')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeMode === 'nfc'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📶 Chip NFC</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeMode === 'manual'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⌨️ Manual / Lector USB</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5">
          {activeMode === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700 shadow-inner">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Targeting reticle overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-28 border-2 border-indigo-400/80 rounded-lg relative">
                        <div className="absolute top-0 left-0 -mt-1 -ml-1 w-3 h-3 border-t-2 border-l-2 border-indigo-300" />
                        <div className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 border-t-2 border-r-2 border-indigo-300" />
                        <div className="absolute bottom-0 left-0 -mb-1 -ml-1 w-3 h-3 border-b-2 border-l-2 border-indigo-300" />
                        <div className="absolute bottom-0 right-0 -mb-1 -mr-1 w-3 h-3 border-b-2 border-r-2 border-indigo-300" />
                        {/* Scanning Laser Line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <p className="text-sm font-medium mb-1">Iniciando cámara del dispositivo...</p>
                    <p className="text-xs text-slate-500">Apunta el lente al código de barras del libro</p>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
                  {cameraError}
                </div>
              )}

              <p className="text-xs text-slate-500 text-center">
                Centra el código de barras o código QR en el visor. Si usas un ordenador sin cámara móvil, usa las simulaciones o el modo manual abajo.
              </p>
            </div>
          )}

          {activeMode === 'nfc' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 border-2 border-dashed border-indigo-300 flex items-center justify-center text-3xl animate-pulse">
                📶
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-base">Lector Near Field Communication (NFC)</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Lee directamente etiquetas RFID/NFC tipo NTAG o tarjetas de estudiante con tecnología sin contacto.
                </p>
              </div>

              {nfcSupported ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={startNfcScan}
                    disabled={nfcReading}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50"
                  >
                    {nfcReading ? 'Escuchando sensor NFC activo...' : 'Activar Sensor NFC de este Dispositivo'}
                  </button>
                  {nfcMessage && (
                    <p className="text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 font-mono">
                      {nfcMessage}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 text-left">
                  <p className="font-semibold mb-0.5">Dispositivo en modo Emulación NFC:</p>
                  <p>
                    Web NFC es exclusivo de dispositivos Android con Chrome y hardware NFC. Puedes simular el acercamiento de un chip con los accesos rápidos a continuación.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeMode === 'manual' && (
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código de Barras, UID NFC o Nº de Acceso
                </label>
                <div className="flex space-x-2">
                  <input
                    ref={manualInputRef}
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && manualCode.trim()) {
                        e.preventDefault();
                        handleSuccessfulScan(manualCode.trim(), 'MANUAL');
                      }
                    }}
                    placeholder="Pistolea con lector USB o ingresa el código..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (manualCode.trim()) {
                        handleSuccessfulScan(manualCode.trim(), 'MANUAL');
                      }
                    }}
                    disabled={!manualCode.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium text-xs rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Tip: Los lectores de código de barras USB/Bluetooth en modo 'Keyboard Wedge' disparan un evento Enter automáticamente al leer.
              </p>
            </div>
          )}

          {/* Quick simulation buttons for testing with real mock data */}
          {sampleCodes.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Accesos rápidos de prueba (Simular lectura)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleCodes.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuccessfulScan(sample.code, sample.type)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 rounded-lg text-xs font-mono transition"
                  >
                    <span>{sample.type === 'NFC' ? '📶' : '🏷️'}</span>
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
          >
            Cerrar Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
