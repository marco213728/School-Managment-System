import React, { useState } from 'react';
import { EnrollmentDocument, DocumentVerificationStatus } from '../../types';
import { 
  CloseIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon, 
  DownloadIcon, 
  EyeIcon, 
  ShieldCheckIcon 
} from '../icons/Icons';

interface DocumentPreviewModalProps {
  document: EnrollmentDocument | null;
  isOpen: boolean;
  onClose: () => void;
  canReview?: boolean;
  onUpdateStatus?: (docId: string, status: DocumentVerificationStatus, comment?: string) => void;
  studentName?: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CEDULA_REPRESENTANTE: 'Cédula del Representante Legal',
  CEDULA_ESTUDIANTE: 'Cédula o Partida del Estudiante',
  PLANILLA_ELECTRICA: 'Planilla de Servicio Eléctrico (Georreferenciación)',
  CERTIFICADO_PROMOCION: 'Histórico de Promoción / Examen Ubicación',
  FICHA_DECE: 'Ficha Socioemocional y Ficha Interna (DECE)',
  FOTO_ESTUDIANTE: 'Fotografía Tamaño Carnet Actualizada',
};

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  canReview = false,
  onUpdateStatus,
  studentName
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<DocumentVerificationStatus>(
    document?.status || 'PENDIENTE'
  );
  const [comment, setComment] = useState<string>(document?.reviewComment || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if document changes
  React.useEffect(() => {
    if (document) {
      setSelectedStatus(document.status);
      setComment(document.reviewComment || '');
      setZoom(100);
      setRotation(0);
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const handleSave = () => {
    if (!onUpdateStatus) return;
    setIsSaving(true);
    onUpdateStatus(document.id, selectedStatus, comment.trim());
    setIsSaving(false);
    onClose();
  };

  const getStatusBadge = (status: DocumentVerificationStatus) => {
    switch (status) {
      case 'VALIDADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Validado Oficial</span>;
      case 'OBSERVADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">⚠ Con Observaciones</span>;
      case 'RECHAZADO':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">✕ Rechazado</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">⌛ Pendiente de Revisión</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-800">
                {DOCUMENT_TYPE_LABELS[document.documentType] || document.name}
              </h3>
              {getStatusBadge(document.status)}
            </div>
            {studentName && (
              <p className="text-xs text-slate-500 mt-0.5">
                Expediente de Matrícula: <strong className="text-slate-700">{studentName}</strong>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const link = window.document.createElement('a');
                link.href = document.fileUrl;
                link.download = document.name;
                link.target = '_blank';
                link.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-2xs"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Descargar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              title="Cerrar"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Viewer Area */}
        <div className="flex-1 bg-slate-900 flex flex-col overflow-hidden relative min-h-[380px]">
          {/* Controls Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 text-white text-xs z-10 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Archivo: {document.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Subido el: {new Date(document.uploadedAt).toLocaleDateString('es-EC')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom(prev => Math.max(50, prev - 25))}
                className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600 font-mono text-xs"
                title="Alejar"
              >
                -
              </button>
              <span className="font-mono text-xs w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(200, prev + 25))}
                className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600 font-mono text-xs"
                title="Acercar"
              >
                +
              </button>
              <button
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600 text-xs ml-1"
                title="Rotar 90 grados"
              >
                ↻ Rotar
              </button>
              <button
                onClick={() => { setZoom(100); setRotation(0); }}
                className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600 text-xs ml-1"
              >
                Restablecer
              </button>
            </div>
          </div>

          {/* Document Content Canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-slate-950">
            <div 
              style={{ 
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="max-w-full shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-white"
            >
              <img
                src={document.fileUrl}
                alt={document.name}
                className="max-h-[500px] w-auto object-contain select-none"
                onError={(e) => {
                  // Fallback to placeholder document preview
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          </div>
        </div>

        {/* Observation History or Review Panel */}
        <div className="p-5 bg-white border-t border-slate-200">
          {canReview ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Dictamen de Validación Institucional (Secretaría General):
                </span>
                <span className="text-xs text-slate-500">
                  Seleccione el estado probatorio para el expediente del estudiante
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('VALIDADO')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                    selectedStatus === 'VALIDADO'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Documento Conforme</p>
                    <p className="text-[11px] text-slate-500">Legible, vigente y cumple con los requisitos del MinEduc.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('OBSERVADO')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                    selectedStatus === 'OBSERVADO'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <AlertTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Observar / Subsanar</p>
                    <p className="text-[11px] text-slate-500">Ilegible, datos desactualizados o requiere reemplazo.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('RECHAZADO')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                    selectedStatus === 'RECHAZADO'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <CloseIcon className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Rechazar Requisito</p>
                    <p className="text-[11px] text-slate-500">Documento no pertenece al estudiante o es inválido.</p>
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones para el Representante Legal (Opcional si es validado):
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ej: La planilla eléctrica adjunta no permite visualizar el CUEN ni la dirección exacta. Favor volver a escanear en buena resolución."
                  rows={2}
                  className="w-full p-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Guardar Dictamen Documental</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estado de Validación:</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {document.status === 'VALIDADO' && 'El documento ha sido revisado y aprobado oficialmente por Secretaría.'}
                    {document.status === 'OBSERVADO' && 'El documento presenta observaciones. Por favor sustitúyalo según las indicaciones de Secretaría.'}
                    {document.status === 'PENDIENTE' && 'El documento se encuentra en cola de revisión por el equipo administrativo.'}
                    {document.status === 'RECHAZADO' && 'El documento fue rechazado por no cumplir con los requisitos reglamentarios.'}
                  </p>
                </div>
              </div>
              {document.reviewComment && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold">Observación de Secretaría: </span>
                  {document.reviewComment}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
