
import React, { useState, useContext, useMemo } from 'react';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { PeiProfile, StandardDimension, PeiStatus, PeiDimensionAnalysis, Role } from '../../types';
import { MOCK_PEIS, MOCK_USERS } from '../../constants';
import { CheckCircleIcon, SparklesIcon, EditIcon, PlusIcon, CloseIcon, ClipboardDocumentCheckIcon, ArrowLeftIcon, PrinterIcon, GraduationCapIcon, AlertTriangleIcon, ClipboardListIcon, ArchiveBoxIcon } from '../icons/Icons';
import PeiFodaMatrix from './PeiFodaMatrix';
import PeiStrategicPlanning from './PeiStrategicPlanning';
import PeiImprovementPlans from './PeiImprovementPlans';
import PeiApprovalPhase from './PeiApprovalPhase';
import PrintablePeiDocument from '../reports/PrintablePeiDocument';

const PeiBuilder: React.FC = () => {
    const { user } = useContext(UserContext);
    const { institution } = useContext(InstitutionContext);
    const [pei, setPei] = useState<PeiProfile>(MOCK_PEIS[0]);
    const [currentStep, setCurrentStep] = useState(1);
    const [activeDimension, setActiveDimension] = useState<StandardDimension>(StandardDimension.Pedagogical);
    
    // Printing state
    const [isPrintPeiOpen, setIsPrintPeiOpen] = useState(false);

    const steps = [
        { id: 1, name: 'Identidad', description: 'Misión, Visión e Ideario' },
        { id: 2, name: 'Autoevaluación', description: 'Matriz FODA y Estrategias' },
        { id: 3, name: 'Planificación', description: 'Objetivos y Metas PEI' },
        { id: 4, name: 'Mejora', description: 'Proyectos Operativos Anuales' },
        { id: 5, name: 'Aprobación', description: 'Actas y Validación' }
    ];

    const institutionStaff = useMemo(() => {
        return MOCK_USERS.filter(u => u.institutionId === institution?.id && u.role !== Role.Parent && u.role !== Role.Student);
    }, [institution]);

    const progress = useMemo(() => {
        let score = 0;
        if (pei.identity.mission && pei.identity.vision) score += 20;
        if (pei.diagnostics.length > 0) score += 20;
        if (pei.strategicObjectives.length > 0 && pei.strategicObjectives.every(so => so.goals.length > 0)) score += 20;
        if (pei.improvementPlans.length > 0) score += 20;
        if (pei.status === PeiStatus.Approved) score += 20;
        return score;
    }, [pei]);

    const handleUpdateDimensionAnalysis = (updatedAnalysis: PeiDimensionAnalysis) => {
        const updatedDiagnostics = pei.diagnostics.some(d => d.dimension === updatedAnalysis.dimension)
            ? pei.diagnostics.map(d => d.dimension === updatedAnalysis.dimension ? updatedAnalysis : d)
            : [...pei.diagnostics, updatedAnalysis];
        
        setPei({ ...pei, diagnostics: updatedDiagnostics });
    };

    const handleUpdatePei = (updatedPei: PeiProfile) => {
        setPei(updatedPei);
    };

    const currentDimensionAnalysis = useMemo(() => {
        return pei.diagnostics.find(d => d.dimension === activeDimension) || {
            dimension: activeDimension,
            entries: [],
            strategies: [],
            conclusion: ''
        };
    }, [pei, activeDimension]);

    const handleSavePhase = () => {
        if (currentStep < 5) setCurrentStep(currentStep + 1);
        else alert('Proceso de PEI guardado exitosamente.');
    };

    const handleSubmitForReview = () => {
        setPei({ ...pei, status: PeiStatus.PendingReview });
        alert('PEI enviado a revisión del Super Administrador.');
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            {/* Header PEI */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-t-indigo-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800">Constructor de PEI {pei.academicPeriod}</h2>
                        <p className="text-sm text-gray-500 mt-1">Institución: {institution?.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {pei.status === PeiStatus.Approved && (
                            <button 
                                onClick={() => setIsPrintPeiOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 shadow-md"
                            >
                                <PrinterIcon className="h-5 w-5" /> Imprimir Documento PEI
                            </button>
                        )}
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
                                Estado: <span className={`px-2 py-0.5 rounded-full font-black ${pei.status === PeiStatus.Approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{pei.status}</span>
                            </div>
                            <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-[10px] font-bold text-indigo-600 mt-1">{progress}% Completado</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stepper Vertical */}
                <div className="lg:col-span-1 space-y-2">
                    {steps.map(step => {
                        const isLocked = step.id > 1 && !pei.identity.mission;
                        const isLocked3 = step.id > 2 && pei.diagnostics.length === 0;
                        const isLocked4 = step.id > 3 && pei.strategicObjectives.length === 0;

                        return (
                            <button
                                key={step.id}
                                disabled={isLocked || isLocked3 || isLocked4}
                                onClick={() => setCurrentStep(step.id)}
                                className={`w-full text-left p-4 rounded-xl transition-all border-2 ${currentStep === step.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 hover:border-indigo-200 text-gray-600'} ${(isLocked || isLocked3 || isLocked4) ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === step.id ? 'bg-white text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {step.id}
                                    </span>
                                    <div>
                                        <p className="font-bold text-sm">{step.name}</p>
                                        <p className={`text-[10px] leading-tight ${currentStep === step.id ? 'text-indigo-100' : 'text-gray-400'}`}>{step.description}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                    
                    {pei.status === PeiStatus.Draft && progress >= 80 && (
                        <button 
                            onClick={handleSubmitForReview}
                            className="w-full mt-6 py-3 bg-green-600 text-white font-black rounded-xl shadow-lg hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                            <CheckCircleIcon className="h-5 w-5" /> Enviar a Auditoría
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 min-h-[600px] flex flex-col">
                        <div className="p-8 flex-grow">
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <GraduationCapIcon className="h-6 w-6 text-indigo-500" />
                                        Fase 1: Identidad Institucional
                                    </h3>
                                    <p className="text-sm text-gray-600 italic">"Define quiénes son, hacia dónde sueñan ir y qué valores guían su camino."</p>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Misión (Propósito)</label>
                                            <textarea 
                                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 text-sm"
                                                value={pei.identity.mission}
                                                onChange={e => setPei({...pei, identity: {...pei.identity, mission: e.target.value}})}
                                                placeholder="Ej: Formar líderes honestos y capaces..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Visión (Sueño)</label>
                                            <textarea 
                                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 text-sm"
                                                value={pei.identity.vision}
                                                onChange={e => setPei({...pei, identity: {...pei.identity, vision: e.target.value}})}
                                                placeholder="Ej: Para el 2029 seremos una institución líder en biotecnología..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Ideario (Principios y Valores)</label>
                                            <textarea 
                                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 text-sm"
                                                value={pei.identity.ideario}
                                                onChange={e => setPei({...pei, identity: {...pei.identity, ideario: e.target.value}})}
                                                placeholder="Liste los valores institucionales y principios éticos..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <ClipboardDocumentCheckIcon className="h-6 w-6 text-indigo-500" />
                                        Fase 2: Autoevaluación y Matriz FODA
                                    </h3>
                                    
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {Object.values(StandardDimension).map(dim => (
                                            <button 
                                                key={dim}
                                                onClick={() => setActiveDimension(dim)}
                                                className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-md transition-all ${activeDimension === dim ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                {dim.split(' ')[1] || dim.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>

                                    <PeiFodaMatrix 
                                        dimensionAnalysis={currentDimensionAnalysis}
                                        onUpdate={handleUpdateDimensionAnalysis}
                                    />
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <ClipboardListIcon className="h-6 w-6 text-indigo-500" />
                                        Fase 3: Planificación Estratégica (Metas)
                                    </h3>
                                    <p className="text-sm text-gray-600 italic">"Transforme sus hallazgos en metas concretas e indicadores de gestión."</p>
                                    
                                    <PeiStrategicPlanning 
                                        pei={pei}
                                        onUpdate={handleUpdatePei}
                                        staff={institutionStaff}
                                    />
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <ArchiveBoxIcon className="h-6 w-6 text-indigo-500" />
                                        Fase 4: Planes de Mejora (POA)
                                    </h3>
                                    <p className="text-sm text-gray-600 italic">"Acciones prioritarias de corto plazo para elevar la calidad educativa."</p>
                                    
                                    <PeiImprovementPlans 
                                        pei={pei}
                                        onUpdate={handleUpdatePei}
                                        staff={institutionStaff}
                                    />
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                                        Fase 5: Aprobación y Ratificación
                                    </h3>
                                    <p className="text-sm text-gray-600 italic">"El paso final para legalizar su planificación estratégica institucional."</p>
                                    
                                    <PeiApprovalPhase 
                                        pei={pei}
                                        onUpdate={handleUpdatePei}
                                        staff={institutionStaff}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex justify-between items-center rounded-b-2xl">
                            <p className="text-xs text-gray-500">Los cambios se guardan automáticamente como borrador.</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleSavePhase}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md"
                                >
                                    Guardar y Continuar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {pei.auditComments && pei.status !== PeiStatus.Approved && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-4">
                    <AlertTriangleIcon className="h-6 w-6 text-amber-600 shrink-0" />
                    <div>
                        <h4 className="font-bold text-amber-800">Observaciones del Auditor (Super Administrador)</h4>
                        <p className="text-sm text-amber-700 mt-1">{pei.auditComments}</p>
                    </div>
                </div>
            )}

            {isPrintPeiOpen && pei && institution && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4">
                    <div id="pei-document-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Documento Oficial PEI</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsPrintPeiOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                    <PrinterIcon className="h-5 w-5" /> Imprimir / Exportar PDF
                                </button>
                            </div>
                        </header>
                        <div className="overflow-y-auto">
                            <PrintablePeiDocument 
                                pei={pei}
                                institution={institution}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeiBuilder;
