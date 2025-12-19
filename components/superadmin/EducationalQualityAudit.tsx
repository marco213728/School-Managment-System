
import React, { useState, useMemo } from 'react';
import { Institution, StandardCompliance, StandardIndicator, StandardDimension, StandardLevel, Role } from '../../types';
import { OFFICIAL_STANDARDS, MOCK_STANDARDS_COMPLIANCE } from '../../constants';
// Added UploadIcon to the imports below to fix the "Cannot find name 'UploadIcon'" error on line 156.
import { ChartBarIcon, CheckCircleIcon, AlertTriangleIcon, SearchIcon, LocationMarkerIcon, ExternalLinkIcon, ClipboardDocumentCheckIcon, ChatBubbleIcon, UploadIcon } from '../icons/Icons';

interface EducationalQualityAuditProps {
    institutions: Institution[];
}

const EducationalQualityAudit: React.FC<EducationalQualityAuditProps> = ({ institutions }) => {
    const [selectedInstId, setSelectedInstId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [complianceData, setComplianceData] = useState<StandardCompliance[]>(MOCK_STANDARDS_COMPLIANCE);
    
    // State for providing feedback
    const [feedbackingId, setFeedbackingId] = useState<string | null>(null);
    const [feedbackText, setFeedbackText] = useState('');

    const institutionCompliance = useMemo(() => {
        return institutions.map(inst => {
            const schoolRecords = complianceData.filter(c => c.institutionId === inst.id);
            const avgLevel = schoolRecords.length > 0 
                ? schoolRecords.reduce((acc, curr) => acc + curr.level, 0) / schoolRecords.length 
                : 0;
            
            // Semaforización
            let status: 'Red' | 'Yellow' | 'Green' = 'Red';
            if (avgLevel >= 3) status = 'Green';
            else if (avgLevel >= 2) status = 'Yellow';

            return { ...inst, avgLevel, status, recordsCount: schoolRecords.length };
        }).filter(inst => inst.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [institutions, complianceData, searchTerm]);

    const handleVerify = (recordId: string) => {
        setComplianceData(prev => prev.map(r => r.id === recordId ? { ...r, verifiedBySuperAdmin: true } : r));
        alert('Indicador verificado correctamente.');
    };

    const handleSaveFeedback = (recordId: string) => {
        setComplianceData(prev => prev.map(r => r.id === recordId ? { ...r, auditFeedback: feedbackText, verifiedBySuperAdmin: false } : r));
        setFeedbackingId(null);
        setFeedbackText('');
        alert('Retroalimentación enviada a la institución.');
    };

    const getLevelText = (level: number) => {
        switch(level) {
            case 4: return 'Destacado';
            case 3: return 'Satisfactorio';
            case 2: return 'En Proceso';
            default: return 'No Cumple / Pendiente';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Auditoría Global de Estándares</h2>
                    <p className="text-sm text-gray-500">Supervisión nacional de la Gestión Escolar y Medios de Verificación.</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-center p-2 border rounded-lg bg-green-50">
                        <p className="text-xl font-bold text-green-700">{institutionCompliance.filter(i => i.status === 'Green').length}</p>
                        <p className="text-[10px] font-bold text-green-600 uppercase">Óptimo</p>
                    </div>
                    <div className="text-center p-2 border rounded-lg bg-yellow-50">
                        <p className="text-xl font-bold text-yellow-700">{institutionCompliance.filter(i => i.status === 'Yellow').length}</p>
                        <p className="text-[10px] font-bold text-yellow-600 uppercase">En Riesgo</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* School List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-md border overflow-hidden">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Filtrar institución..."
                                className="w-full pl-9 pr-4 py-2 border rounded-md text-sm"
                            />
                            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    <ul className="divide-y max-h-[600px] overflow-y-auto">
                        {institutionCompliance.map(inst => (
                            <li 
                                key={inst.id} 
                                onClick={() => setSelectedInstId(inst.id)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between ${selectedInstId === inst.id ? 'bg-primary-50' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${inst.status === 'Green' ? 'bg-green-500' : inst.status === 'Yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800 line-clamp-1">{inst.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase">{inst.recordsCount} Indicadores con Evidencia</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-primary-600">{inst.avgLevel.toFixed(1)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Audit Detail Area */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedInstId ? (
                        <div className="bg-white rounded-xl shadow-md border p-6">
                            <div className="flex justify-between items-start mb-6 border-b pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{institutions.find(i => i.id === selectedInstId)?.name}</h3>
                                    <p className="text-sm text-gray-500">Revisión de Portafolio de Gestión Institucional</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {Object.values(StandardDimension).map(dim => {
                                    const dimIndicators = OFFICIAL_STANDARDS.filter(s => s.dimension === dim);
                                    return (
                                        <div key={dim}>
                                            <h4 className="font-bold text-gray-700 text-xs uppercase tracking-widest bg-slate-100 p-2 rounded mb-4 flex items-center gap-2">
                                                <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                                {dim}
                                            </h4>
                                            <div className="space-y-6">
                                                {dimIndicators.map(indicator => {
                                                    const compliance = complianceData.find(c => c.institutionId === selectedInstId && c.indicatorId === indicator.id);
                                                    return (
                                                        <div key={indicator.id} className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-4">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-grow">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-bold font-mono text-blue-700">{indicator.code}</span>
                                                                        <h5 className="font-bold text-gray-800">{indicator.name}</h5>
                                                                    </div>
                                                                    <p className="text-xs text-gray-600 italic">{indicator.requirement}</p>
                                                                </div>
                                                                {compliance && (
                                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${compliance.level >= 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                        Autoeval: {compliance.level}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {compliance ? (
                                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                    <div className="flex justify-between items-start gap-4">
                                                                        <div className="space-y-3 flex-grow">
                                                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                                                <UploadIcon className="h-4 w-4 text-gray-400" />
                                                                                Evidencia: <span className="text-blue-600 font-bold">{compliance.evidenceName || 'documento_evidencia.pdf'}</span>
                                                                                <a href={compliance.evidenceUrl} target="_blank" rel="noreferrer" className="ml-2 text-indigo-600 hover:underline flex items-center gap-1">
                                                                                    <ExternalLinkIcon className="h-3 w-3" /> Ver Archivo
                                                                                </a>
                                                                            </div>
                                                                            <div className="text-xs text-gray-600 bg-white p-2 border rounded">
                                                                                <strong>Justificación Institucional:</strong> {compliance.observations || 'Sin comentarios adicionales.'}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="flex flex-col gap-2 shrink-0">
                                                                            {compliance.verifiedBySuperAdmin ? (
                                                                                <div className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md text-xs font-bold shadow-sm">
                                                                                    <CheckCircleIcon className="h-4 w-4"/> VERIFICADO
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <button 
                                                                                        onClick={() => handleVerify(compliance.id)}
                                                                                        className="px-4 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 shadow-sm"
                                                                                    >
                                                                                        Verificar Estándar
                                                                                    </button>
                                                                                    <button 
                                                                                        onClick={() => { setFeedbackingId(compliance.id); setFeedbackText(compliance.auditFeedback || ''); }}
                                                                                        className="px-4 py-1.5 bg-white border border-amber-300 text-amber-700 rounded text-xs font-bold hover:bg-amber-50"
                                                                                    >
                                                                                        Dejar Observación
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {feedbackingId === compliance.id && (
                                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                                            <label className="block text-xs font-bold text-amber-800 mb-1 uppercase">Retroalimentación / Solicitud de Ajuste</label>
                                                                            <textarea 
                                                                                value={feedbackText}
                                                                                onChange={e => setFeedbackText(e.target.value)}
                                                                                className="w-full p-2 border-2 border-amber-200 rounded text-sm focus:ring-amber-500 focus:border-amber-500"
                                                                                rows={2}
                                                                                placeholder="Indique qué falta o qué debe corregir la institución..."
                                                                            />
                                                                            <div className="flex justify-end gap-2 mt-2">
                                                                                <button onClick={() => setFeedbackingId(null)} className="text-xs text-gray-500">Cancelar</button>
                                                                                <button onClick={() => handleSaveFeedback(compliance.id)} className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-bold">Enviar Retroalimentación</button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {compliance.auditFeedback && feedbackingId !== compliance.id && (
                                                                        <div className="mt-3 text-[10px] text-amber-800 font-medium flex items-start gap-1">
                                                                            <ChatBubbleIcon className="h-3 w-3 mt-0.5" />
                                                                            <span><strong>Comentario Auditoría:</strong> {compliance.auditFeedback}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-red-500 italic flex items-center gap-1"><AlertTriangleIcon className="h-3 w-3"/> La institución aún no ha reportado evidencia para este estándar.</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md border h-full flex flex-col items-center justify-center text-gray-400 p-10">
                            <ChartBarIcon className="h-16 w-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-bold">Panel de Auditoría de Calidad</h3>
                            <p className="text-sm text-center max-w-xs mt-2">Seleccione una institución del listado lateral para revisar su cumplimiento normativo y medios de verificación.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EducationalQualityAudit;
