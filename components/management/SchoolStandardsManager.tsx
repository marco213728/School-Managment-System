
import React, { useState, useContext, useMemo } from 'react';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { StandardCompliance, StandardIndicator, StandardDimension, StandardLevel, Role } from '../../types';
import { OFFICIAL_STANDARDS, MOCK_STANDARDS_COMPLIANCE } from '../../constants';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, CheckCircleIcon, AlertTriangleIcon, ClipboardDocumentCheckIcon, CloseIcon, ChatBubbleIcon } from '../icons/Icons';

const SchoolStandardsManager: React.FC = () => {
    const { user } = useContext(UserContext);
    const { institution } = useContext(InstitutionContext);
    const [complianceRecords, setComplianceRecords] = useState<StandardCompliance[]>(MOCK_STANDARDS_COMPLIANCE);
    const [editingRecord, setEditingRecord] = useState<Partial<StandardCompliance> | null>(null);

    const institutionRecords = useMemo(() => 
        complianceRecords.filter(r => r.institutionId === institution?.id),
    [complianceRecords, institution]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRecord || !institution) return;

        const finalRecord: StandardCompliance = {
            id: editingRecord.id || `sc-${Date.now()}`,
            institutionId: institution.id,
            indicatorId: editingRecord.indicatorId!,
            level: editingRecord.level || StandardLevel.EnProceso,
            evidenceName: editingRecord.evidenceName,
            evidenceUrl: editingRecord.evidenceUrl || 'https://example.com/evidence-placeholder.pdf', // Mock URL
            lastUpdated: new Date().toISOString().split('T')[0],
            observations: editingRecord.observations,
            auditFeedback: editingRecord.auditFeedback,
            verifiedBySuperAdmin: false,
        };

        if (editingRecord.id) {
            setComplianceRecords(prev => prev.map(r => r.id === finalRecord.id ? finalRecord : r));
        } else {
            setComplianceRecords(prev => [...prev, finalRecord]);
        }
        setEditingRecord(null);
    };

    const getStatusColor = (indicatorId: string) => {
        const record = institutionRecords.find(r => r.indicatorId === indicatorId);
        if (!record) return 'border-gray-200 bg-white opacity-60';
        if (record.verifiedBySuperAdmin) return 'border-green-400 bg-green-50 ring-2 ring-green-200';
        if (record.level >= 3) return 'border-blue-300 bg-blue-50';
        if (record.level === 2) return 'border-yellow-300 bg-yellow-50';
        return 'border-red-300 bg-red-50';
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-l-4 border-l-indigo-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Garantía de la Calidad Educativa</h2>
                        <p className="text-sm text-gray-600 mt-1">Gestión de estándares institucionales y medios de verificación para auditoría externa.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-indigo-600 uppercase">Estado Global</span>
                        <p className="text-lg font-black text-indigo-900">
                            {Math.round((institutionRecords.filter(r => r.verifiedBySuperAdmin).length / OFFICIAL_STANDARDS.length) * 100)}% Verificado
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {Object.values(StandardDimension).map(dim => (
                    <section key={dim} className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2 border-b pb-2">
                            <ClipboardDocumentCheckIcon className="h-6 w-6 text-indigo-500" />
                            Dimensión: {dim}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {OFFICIAL_STANDARDS.filter(s => s.dimension === dim).map(indicator => {
                                const record = institutionRecords.find(r => r.indicatorId === indicator.id);
                                return (
                                    <div key={indicator.id} className={`p-4 border rounded-lg transition-all flex flex-col justify-between ${getStatusColor(indicator.id)}`}>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-500 font-mono">{indicator.code}</span>
                                                    <h4 className="font-bold text-gray-800 text-sm">{indicator.name}</h4>
                                                </div>
                                                <button 
                                                    onClick={() => setEditingRecord(record || { indicatorId: indicator.id })}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-full"
                                                    title="Reportar Evidencia"
                                                >
                                                    <EditIcon className="h-4 w-4"/>
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2 mb-3">{indicator.description}</p>
                                            
                                            <div className="bg-white/50 p-2 rounded border border-gray-200 mb-3">
                                                <p className="text-[9px] font-bold text-gray-500 uppercase">Medio de Verificación:</p>
                                                <p className="text-[10px] text-gray-700 italic">{indicator.requirement}</p>
                                            </div>

                                            {record?.auditFeedback && (
                                                <div className="bg-amber-100 p-2 rounded border border-amber-200 mb-3 flex items-start gap-2">
                                                    <ChatBubbleIcon className="h-3 w-3 text-amber-600 mt-0.5" />
                                                    <div className="text-[10px] text-amber-800">
                                                        <span className="font-bold">Retroalimentación de Auditoría:</span> {record.auditFeedback}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {record?.verifiedBySuperAdmin ? (
                                                    <span className="text-[10px] font-bold text-green-700 flex items-center gap-1">
                                                        <CheckCircleIcon className="h-3 w-3"/> Verificado
                                                    </span>
                                                ) : record ? (
                                                    <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                                                        <UploadIcon className="h-3 w-3"/> Evidencia Cargada
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 font-medium italic">Sin reportar</span>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase ${record?.level ? 'text-gray-700' : 'text-gray-400'}`}>
                                                {record?.level ? `Nivel: ${record.level}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>

            {editingRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Reportar Evidencia de Estándar</h3>
                            <button onClick={() => setEditingRecord(null)}><CloseIcon className="h-6 w-6 text-gray-400"/></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                                <label className="block text-xs font-bold text-indigo-700 mb-1 uppercase tracking-wider">Documentación Requerida</label>
                                <p className="text-sm italic text-indigo-900">
                                    {OFFICIAL_STANDARDS.find(s => s.id === editingRecord.indicatorId)?.requirement}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Autoevaluación</label>
                                    <select 
                                        className="w-full p-2 border rounded text-sm bg-white" 
                                        value={editingRecord.level || 1}
                                        onChange={e => setEditingRecord({...editingRecord, level: parseInt(e.target.value)})}
                                    >
                                        <option value={1}>1. No Cumple</option>
                                        <option value={2}>2. En Proceso</option>
                                        <option value={3}>3. Satisfactorio</option>
                                        <option value={4}>4. Destacado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre Archivo</label>
                                    <input 
                                        type="text" 
                                        value={editingRecord.evidenceName || ''} 
                                        onChange={e => setEditingRecord({...editingRecord, evidenceName: e.target.value})}
                                        className="w-full p-2 border rounded text-sm"
                                        placeholder="Ej: Acta_Socializacion.pdf"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subir Evidencia Digital</label>
                                <div className="mt-1 border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-indigo-400 transition-colors">
                                    <UploadIcon className="mx-auto h-10 w-10 text-gray-400 mb-2"/>
                                    <p className="text-xs text-gray-500">Cargar PDF, JPG o PNG con el medio de verificación firmado.</p>
                                    <input type="file" className="hidden" id="evidence-upload"/>
                                    <label htmlFor="evidence-upload" className="mt-4 inline-block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md font-bold text-xs cursor-pointer hover:bg-indigo-100">
                                        Seleccionar Archivo
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Observaciones de la Institución</label>
                                <textarea 
                                    className="w-full p-2 border rounded text-sm" 
                                    rows={3} 
                                    value={editingRecord.observations || ''}
                                    onChange={e => setEditingRecord({...editingRecord, observations: e.target.value})}
                                    placeholder="Explique cómo la institución cumple con este estándar..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={() => setEditingRecord(null)} className="px-4 py-2 text-gray-600 font-medium">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-md shadow-sm hover:bg-indigo-700">Reportar y Enviar a Auditoría</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolStandardsManager;
