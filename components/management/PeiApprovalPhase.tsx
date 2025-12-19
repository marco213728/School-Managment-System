
import React, { useState, useMemo } from 'react';
import { PeiProfile, PeiStatus, PeiApprovalActa, User } from '../../types';
import { CheckCircleIcon, PrinterIcon, SparklesIcon, UsersIcon, ClipboardDocumentCheckIcon, AlertTriangleIcon, PlusIcon, CloseIcon } from '../icons/Icons';

interface PeiApprovalPhaseProps {
    pei: PeiProfile;
    onUpdate: (updatedPei: PeiProfile) => void;
    staff: User[];
}

const PeiApprovalPhase: React.FC<PeiApprovalPhaseProps> = ({ pei, onUpdate, staff }) => {
    const [isActaFormOpen, setIsActaFormOpen] = useState(false);
    const [newActa, setNewActa] = useState<Partial<PeiApprovalActa>>({
        type: 'Final_Approval',
        meetingDate: new Date().toISOString().split('T')[0],
        summary: '',
        participants: []
    });

    // VALIDATION LOGIC
    const validationItems = useMemo(() => [
        { name: 'Identidad Institucional', status: !!(pei.identity.mission && pei.identity.vision), detail: 'Misión y Visión completas' },
        { name: 'Autoevaluación (FODA)', status: pei.diagnostics.length >= 2, detail: `${pei.diagnostics.length} dimensiones analizadas` },
        { name: 'Planificación Estratégica', status: pei.strategicObjectives.length > 0 && pei.strategicObjectives.every(o => o.goals.length > 0), detail: 'Objetivos y metas definidos' },
        { name: 'Planes de Mejora', status: pei.improvementPlans.length > 0, detail: `${pei.improvementPlans.length} proyectos operativos` },
    ], [pei]);

    const isReadyForApproval = validationItems.every(i => i.status);

    const handleAddActa = (e: React.FormEvent) => {
        e.preventDefault();
        const acta: PeiApprovalActa = {
            id: `acta-${Date.now()}`,
            type: newActa.type as any,
            meetingDate: newActa.meetingDate!,
            summary: newActa.summary!,
            participants: newActa.participants || []
        };

        const updatedApproval = {
            ...(pei.approvalData || { actas: [] }),
            actas: [...(pei.approvalData?.actas || []), acta]
        };

        onUpdate({ ...pei, approvalData: updatedApproval });
        setIsActaFormOpen(false);
        setNewActa({ type: 'Final_Approval', meetingDate: new Date().toISOString().split('T')[0], summary: '', participants: [] });
    };

    const handleFinalApproval = () => {
        if (!isReadyForApproval) {
            alert("Debe completar todas las fases previas antes de la aprobación final.");
            return;
        }

        const now = new Date();
        const expiry = new Date();
        expiry.setFullYear(now.getFullYear() + 5);

        const updatedApproval = {
            ...pei.approvalData!,
            approvalMeetingDate: now.toISOString(),
            ratificationDate: now.toISOString(),
            expiryDate: expiry.toISOString()
        };

        onUpdate({ 
            ...pei, 
            status: PeiStatus.Approved, 
            approvalData: updatedApproval,
            progress: 100 
        });

        alert("¡PEI Ratificado Exitosamente! Se ha establecido una vigencia de 5 años.");
    };

    const getActaLabel = (type: string) => {
        switch(type) {
            case 'Identity': return 'Socialización de Identidad';
            case 'Diagnostic': return 'Análisis Situacional (FODA)';
            case 'Action_Plan': return 'Planes de Mejora';
            case 'Final_Approval': return 'Acta de Aprobación Final';
            default: return type;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Validation Checklist */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6 text-indigo-500" />
                    Checklist de Validación Técnica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {validationItems.map((item, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${item.status ? 'bg-green-50 border-green-200' : 'bg-rose-50 border-rose-200'}`}>
                            <div className="flex items-center gap-3">
                                {item.status ? <CheckCircleIcon className="h-5 w-5 text-green-600" /> : <AlertTriangleIcon className="h-5 w-5 text-rose-600" />}
                                <div>
                                    <p className={`font-bold text-sm ${item.status ? 'text-green-900' : 'text-rose-900'}`}>{item.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-medium">{item.detail}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.status ? 'bg-green-200 text-green-800' : 'bg-rose-200 text-rose-800'}`}>
                                {item.status ? 'LISTO' : 'PENDIENTE'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Registration Bridge */}
            <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-yellow-400" />
                        Registro Externo y Ratificación
                    </h3>
                    <p className="text-sm text-indigo-100 mb-6 max-w-2xl">
                        Una vez aprobado internamente, el PEI debe registrarse en el portal ministerial para su validez legal ante el Distrito Educativo.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                            <p className="text-[10px] font-bold uppercase opacity-60">Educar Ecuador</p>
                            <p className="text-xs font-medium mt-1">Carga de archivo digital (.pdf)</p>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                            <p className="text-[10px] font-bold uppercase opacity-60">Código Convivencia</p>
                            <p className="text-xs font-medium mt-1">Ratificación distrital requerida</p>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                            <p className="text-[10px] font-bold uppercase opacity-60">Autonomía</p>
                            <p className="text-xs font-medium mt-1">Válido con firma del Rector</p>
                        </div>
                    </div>
                </div>
                <SparklesIcon className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5" />
            </div>

            {/* Actas Section */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h4 className="font-bold text-gray-700 uppercase text-xs tracking-wider flex items-center gap-2">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-600" />
                        Actas de Socialización y Acuerdos
                    </h4>
                    <button 
                        onClick={() => setIsActaFormOpen(true)}
                        className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-full font-bold hover:bg-indigo-700 shadow-sm"
                    >
                        + Nueva Acta
                    </button>
                </div>
                
                <div className="p-6">
                    {pei.approvalData?.actas && pei.approvalData.actas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pei.approvalData.actas.map(acta => (
                                <div key={acta.id} className="p-4 border rounded-xl hover:border-indigo-300 transition-all bg-slate-50 flex justify-between items-center group">
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase">{getActaLabel(acta.type)}</p>
                                        <h5 className="font-bold text-gray-800 text-sm mt-1">Reunión del {new Date(acta.meetingDate).toLocaleDateString()}</h5>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><UsersIcon className="h-3 w-3"/> {acta.participants.length} Participantes</p>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-indigo-600 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PrinterIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-2xl text-gray-400">
                            <p className="text-sm italic">No hay actas registradas para este proceso.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FINAL APPROVAL SEAL */}
            {pei.status === PeiStatus.Approved ? (
                <div className="p-8 bg-emerald-50 border-4 border-double border-emerald-500 rounded-3xl text-center relative">
                    <div className="mx-auto h-24 w-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                        <CheckCircleIcon className="h-16 w-16" />
                    </div>
                    <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">PEI INSTITUCIONAL RATIFICADO</h2>
                    <p className="text-emerald-700 font-bold mt-2">Vigencia: {new Date(pei.approvalData?.ratificationDate!).getFullYear()} - {new Date(pei.approvalData?.expiryDate!).getFullYear()}</p>
                    <div className="mt-6 flex justify-center gap-4">
                        <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">
                            <PrinterIcon className="h-5 w-5" /> Descargar PEI Final
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2 bg-white text-emerald-700 border-2 border-emerald-200 font-bold rounded-xl hover:bg-emerald-100">
                            Ver Sello de Autonomía
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Ratificación Final</h4>
                    <p className="text-sm text-gray-600 mb-6">Al ratificar el PEI, el sistema cerrará el proceso de construcción y establecerá la vigencia legal de 5 años.</p>
                    <button 
                        onClick={handleFinalApproval}
                        disabled={!isReadyForApproval}
                        className={`px-12 py-4 rounded-2xl font-black text-xl shadow-2xl transition-all transform active:scale-95 ${isReadyForApproval ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        RATIFICAR PEI INSTITUCIONAL
                    </button>
                    {!isReadyForApproval && <p className="text-xs text-rose-600 font-bold mt-4 animate-pulse">Debe completar todas las fases previas antes de ratificar.</p>}
                </div>
            )}

            {/* Acta Form Modal */}
            {isActaFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <header className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                            <h4 className="font-bold">Registrar Acta de Socialización</h4>
                            <button onClick={() => setIsActaFormOpen(false)}><CloseIcon className="h-6 w-6"/></button>
                        </header>
                        <form onSubmit={handleAddActa} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hito Socializado</label>
                                <select 
                                    className="w-full p-2 border rounded-xl bg-slate-50 text-sm"
                                    value={newActa.type}
                                    onChange={e => setNewActa({...newActa, type: e.target.value as any})}
                                >
                                    <option value="Identity">Identidad (Misión/Visión)</option>
                                    <option value="Diagnostic">Diagnóstico (FODA)</option>
                                    <option value="Action_Plan">Planes de Mejora</option>
                                    <option value="Final_Approval">Aprobación Final PEI</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Reunión</label>
                                <input type="date" className="w-full p-2 border rounded-xl text-sm" value={newActa.meetingDate} onChange={e => setNewActa({...newActa, meetingDate: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resumen y Acuerdos</label>
                                <textarea className="w-full p-2 border rounded-xl text-sm h-32" value={newActa.summary} onChange={e => setNewActa({...newActa, summary: e.target.value})} required placeholder="Describa los aportes de la comunidad educativa..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Participantes (mantener Ctrl para selección múltiple)</label>
                                <select 
                                    multiple 
                                    className="w-full p-2 border rounded-xl text-sm h-32 bg-slate-50"
                                    value={newActa.participants}
                                    onChange={e => {
                                        const values = Array.from(e.target.selectedOptions, (o: any) => o.value);
                                        setNewActa({...newActa, participants: values});
                                    }}
                                >
                                    {staff.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Guardar Acta</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeiApprovalPhase;
