
import React, { useState, useMemo } from 'react';
import { Institution, PeiProfile, PeiStatus, Role, StandardDimension } from '../../types';
import { MOCK_PEIS, MOCK_INSTITUTIONS, MOCK_USERS } from '../../constants';
import { SearchIcon, CheckCircleIcon, AlertTriangleIcon, PrinterIcon, EditIcon, ClipboardDocumentCheckIcon, GraduationCapIcon, ClipboardListIcon, ArchiveBoxIcon, SparklesIcon, UsersIcon } from '../icons/Icons';
import PrintableAuditVerdict from './PrintableAuditVerdict';

const PeiAudit: React.FC = () => {
    const [peis, setPeis] = useState<PeiProfile[]>(MOCK_PEIS);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPei, setSelectedPei] = useState<PeiProfile | null>(null);
    const [activeAuditTab, setActiveAuditTab] = useState(1);
    
    // UI state for printing
    const [isPrintVerdictOpen, setIsPrintVerdictOpen] = useState(false);

    const filteredPeis = useMemo(() => {
        return peis.filter(p => {
            const inst = MOCK_INSTITUTIONS.find(i => i.id === p.institutionId);
            return inst?.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [peis, searchTerm]);

    const handleUpdateFeedback = (phase: string, text: string) => {
        if (!selectedPei) return;
        const updatedPei = {
            ...selectedPei,
            auditData: {
                ...(selectedPei.auditData || { phaseFeedback: {} }),
                phaseFeedback: {
                    ...(selectedPei.auditData?.phaseFeedback || {}),
                    [phase]: text
                }
            }
        };
        setSelectedPei(updatedPei);
        setPeis(peis.map(p => p.id === updatedPei.id ? updatedPei : p));
    };

    const handleAction = (status: PeiStatus) => {
        if (!selectedPei) return;
        const updated = peis.map(p => p.id === selectedPei.id ? { ...p, status, lastAuditDate: new Date().toISOString() } : p);
        setPeis(updated);
        setSelectedPei(null);
        alert(`Estado actualizado a: ${status}`);
    };

    const AuditTab = ({ id, label, icon: Icon }: { id: number, label: string, icon: any }) => (
        <button 
            onClick={() => setActiveAuditTab(id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${activeAuditTab === id ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            <Icon className="h-4 w-4" />
            <span className="text-xs uppercase">{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-800">Auditoría Nacional de PEIs</h2>
                    <p className="text-sm text-gray-500">Supervisión y rectificación de la planificación estratégica institucional.</p>
                </div>
                {selectedPei && (
                    <button 
                        onClick={() => setIsPrintVerdictOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 shadow-md"
                    >
                        <PrinterIcon className="h-5 w-5" /> Generar Dictamen Técnico
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Listado de Instituciones */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-md border overflow-hidden">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Buscar institución..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm"
                            />
                            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    <div className="divide-y max-h-[700px] overflow-y-auto">
                        {filteredPeis.map(p => {
                            const inst = MOCK_INSTITUTIONS.find(i => i.id === p.institutionId);
                            return (
                                <div 
                                    key={p.id}
                                    onClick={() => setSelectedPei(p)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedPei?.id === p.id ? 'bg-indigo-50 border-r-4 border-r-indigo-600' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-gray-800 text-sm">{inst?.name}</p>
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${p.status === PeiStatus.Approved ? 'bg-green-100 text-green-700' : p.status === PeiStatus.PendingReview ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Periodo: {p.academicPeriod}</p>
                                    <div className="mt-2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${p.progress}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-right mt-1 font-bold text-gray-400">{p.progress}% Completado</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detalle de Auditoría Faseada */}
                <div className="lg:col-span-3">
                    {selectedPei ? (
                        <div className="bg-white rounded-2xl shadow-md border flex flex-col h-full min-h-[700px]">
                            <div className="p-4 border-b flex gap-4 overflow-x-auto no-scrollbar">
                                <AuditTab id={1} label="Identidad" icon={GraduationCapIcon} />
                                <AuditTab id={2} label="Diagnóstico" icon={ClipboardDocumentCheckIcon} />
                                <AuditTab id={3} label="Planificación" icon={ClipboardListIcon} />
                                <AuditTab id={4} label="Planes Mejora" icon={ArchiveBoxIcon} />
                                <AuditTab id={5} label="Socialización" icon={UsersIcon} />
                            </div>

                            <div className="p-6 flex-grow overflow-y-auto">
                                {activeAuditTab === 1 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-xl border">
                                                <p className="text-xs font-bold text-gray-400 mb-2">MISIÓN INSTITUCIONAL</p>
                                                <p className="text-sm text-gray-800 leading-relaxed italic">"{selectedPei.identity.mission}"</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl border">
                                                <p className="text-xs font-bold text-gray-400 mb-2">VISIÓN INSTITUCIONAL</p>
                                                <p className="text-sm text-gray-800 leading-relaxed italic">"{selectedPei.identity.vision}"</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl border">
                                                <p className="text-xs font-bold text-gray-400 mb-2">IDEARIO / VALORES</p>
                                                <p className="text-sm text-gray-800 leading-relaxed">{selectedPei.identity.ideario}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                            <label className="block text-xs font-bold text-amber-800 uppercase mb-2">Observaciones de Identidad</label>
                                            <textarea 
                                                value={selectedPei.auditData?.phaseFeedback?.identity || ''}
                                                onChange={e => handleUpdateFeedback('identity', e.target.value)}
                                                className="w-full p-3 bg-white border rounded-lg text-sm"
                                                placeholder="Indique si la misión/visión cumple con los estándares..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeAuditTab === 2 && (
                                    <div className="space-y-6 animate-fade-in">
                                        {selectedPei.diagnostics.map(diag => (
                                            <div key={diag.dimension} className="border rounded-xl p-4">
                                                <h4 className="font-bold text-gray-700 mb-3 border-b pb-1 uppercase text-xs">{diag.dimension}</h4>
                                                <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                                                    <div className="bg-green-50 p-2 rounded">
                                                        <p className="font-bold text-green-800 mb-1">Fortalezas:</p>
                                                        <ul className="list-disc pl-4">{diag.entries.filter(e => e.type === 'Fortaleza').map(e => <li key={e.id}>{e.description}</li>)}</ul>
                                                    </div>
                                                    <div className="bg-red-50 p-2 rounded">
                                                        <p className="font-bold text-red-800 mb-1">Debilidades:</p>
                                                        <ul className="list-disc pl-4">{diag.entries.filter(e => e.type === 'Debilidad').map(e => <li key={e.id}>{e.description}</li>)}</ul>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                                    <p className="text-[10px] font-bold text-indigo-800 mb-1">CONCLUSIÓN DEL DIAGNÓSTICO:</p>
                                                    <p className="text-sm">{diag.conclusion}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                            <label className="block text-xs font-bold text-amber-800 uppercase mb-2">Observaciones del Diagnóstico (FODA)</label>
                                            <textarea 
                                                value={selectedPei.auditData?.phaseFeedback?.diagnostic || ''}
                                                onChange={e => handleUpdateFeedback('diagnostic', e.target.value)}
                                                className="w-full p-3 bg-white border rounded-lg text-sm"
                                                placeholder="Evalúe la coherencia entre los hallazgos y las estrategias..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeAuditTab === 3 && (
                                    <div className="space-y-6 animate-fade-in">
                                        {selectedPei.strategicObjectives.map(so => (
                                            <div key={so.dimension} className="p-4 border rounded-xl bg-slate-50">
                                                <h4 className="font-black text-indigo-700 text-sm mb-2">{so.dimension}</h4>
                                                <p className="text-sm font-bold text-gray-800 mb-4">Obj: {so.objective}</p>
                                                <div className="space-y-2">
                                                    {so.goals.map(goal => (
                                                        <div key={goal.id} className="p-3 bg-white border rounded-lg text-xs grid grid-cols-3 gap-2">
                                                            <div className="col-span-2">
                                                                <p className="font-bold">Meta: {goal.description}</p>
                                                                <p className="text-gray-500 mt-1">Indicador: {goal.indicator}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-indigo-600">Meta: {goal.meta}</p>
                                                                <p className="text-[10px] text-gray-400">Responsable: {MOCK_USERS.find(u => u.id === goal.responsibleId)?.name}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                            <label className="block text-xs font-bold text-amber-800 uppercase mb-2">Observaciones de Planificación Estratégica</label>
                                            <textarea 
                                                value={selectedPei.auditData?.phaseFeedback?.planning || ''}
                                                onChange={e => handleUpdateFeedback('planning', e.target.value)}
                                                className="w-full p-3 bg-white border rounded-lg text-sm"
                                                placeholder="Verifique que las metas sean cuantificables (SMART)..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeAuditTab === 4 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedPei.improvementPlans.map(plan => (
                                                <div key={plan.id} className="p-4 border rounded-xl bg-blue-50/30">
                                                    <h5 className="font-bold text-gray-800 text-sm">{plan.title}</h5>
                                                    <p className="text-xs text-gray-500 mt-1 mb-3">Problema: {plan.problem}</p>
                                                    <div className="p-2 bg-white border rounded text-[10px] mb-2">
                                                        <p className="font-bold text-blue-700">Objetivo Anual:</p>
                                                        <p>{plan.objective}</p>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-green-700">Meta: {plan.goal}</span>
                                                        <span className="text-gray-400">Plazo: {plan.deadline}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {selectedPei.improvementPlans.length === 0 && <p className="text-center text-gray-400 text-sm col-span-2 py-8 italic">No hay planes de mejora registrados.</p>}
                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                            <label className="block text-xs font-bold text-amber-800 uppercase mb-2">Observaciones de Planes de Mejora (POA)</label>
                                            <textarea 
                                                value={selectedPei.auditData?.phaseFeedback?.improvement || ''}
                                                onChange={e => handleUpdateFeedback('improvement', e.target.value)}
                                                className="w-full p-3 bg-white border rounded-lg text-sm"
                                                placeholder="Valide el enfoque operativo y los recursos asignados..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeAuditTab === 5 && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedPei.approvalData?.actas.map(acta => (
                                                <div key={acta.id} className="p-4 border rounded-xl bg-green-50/30 relative">
                                                    <p className="text-[10px] font-bold text-green-700 uppercase">{acta.type}</p>
                                                    <h5 className="font-bold text-sm text-gray-800 mt-1">Reunión del {new Date(acta.meetingDate).toLocaleDateString()}</h5>
                                                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{acta.summary}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><UsersIcon className="h-3 w-3"/> {acta.participants.length} firmas registradas</p>
                                                </div>
                                            ))}
                                            {(!selectedPei.approvalData || selectedPei.approvalData.actas.length === 0) && (
                                                <div className="col-span-2 p-10 text-center text-gray-400 italic">No se han cargado evidencias de socialización.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-500 font-medium italic">* La institución recibirá estas observaciones tras cada actualización.</p>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleAction(PeiStatus.AdjustmentRequired)}
                                            className="px-6 py-2 border-2 border-amber-600 text-amber-600 font-black rounded-xl hover:bg-amber-50"
                                        >
                                            Solicitar Rectificación
                                        </button>
                                        <button 
                                            onClick={() => handleAction(PeiStatus.Approved)}
                                            className="px-6 py-2 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 shadow-lg"
                                        >
                                            Aprobar PEI Nacional
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 h-full flex flex-col items-center justify-center text-gray-400 p-20 min-h-[700px]">
                            <ClipboardDocumentCheckIcon className="h-20 w-20 mb-4 opacity-10" />
                            <p className="text-xl font-bold">Consola de Auditoría Estratégica</p>
                            <p className="text-sm max-w-xs text-center mt-2">Seleccione una institución educativa del listado lateral para iniciar el proceso de revisión por fases del PEI.</p>
                        </div>
                    )}
                </div>
            </div>

            {isPrintVerdictOpen && selectedPei && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4">
                    <div id="verdict-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Dictamen de Auditoría PEI</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsPrintVerdictOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                    <PrinterIcon className="h-5 w-5" /> Imprimir Dictamen
                                </button>
                            </div>
                        </header>
                        <div className="overflow-y-auto">
                            <PrintableAuditVerdict 
                                pei={selectedPei}
                                institution={MOCK_INSTITUTIONS.find(i => i.id === selectedPei.institutionId)!}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeiAudit;
