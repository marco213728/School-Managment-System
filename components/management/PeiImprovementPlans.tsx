import React, { useState, useMemo } from 'react';
import { PeiProfile, PeiProject, User, StandardDimension, PeiFodaEntry, PeiProjectAction } from '../../types';
// Added missing ClipboardListIcon import
import { PlusIcon, TrashIcon, CheckCircleIcon, SparklesIcon, CalendarIcon, UsersIcon, AlertTriangleIcon, ArchiveBoxIcon, ClipboardListIcon } from '../icons/Icons';

interface PeiImprovementPlansProps {
    pei: PeiProfile;
    onUpdate: (updatedPei: PeiProfile) => void;
    staff: User[];
}

const PeiImprovementPlans: React.FC<PeiImprovementPlansProps> = ({ pei, onUpdate, staff }) => {
    const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);

    // Obtener todas las debilidades del FODA para priorización
    const weaknesses = useMemo(() => {
        return pei.diagnostics.flatMap(d => 
            d.entries.filter(e => e.type === 'Debilidad').map(e => ({ ...e, dimension: d.dimension }))
        );
    }, [pei]);

    const handleAddProject = () => {
        if (pei.improvementPlans.length >= 3) {
            alert("Se recomienda priorizar un máximo de 3 problemas principales para los Planes de Mejora.");
        }

        const newProject: PeiProject = {
            id: `proj-${Date.now()}`,
            title: 'Nuevo Plan de Mejora',
            problem: '',
            objective: '',
            goal: '',
            actions: [],
            resources: { available: '', needed: '', alliances: '' },
            indicators: '',
            deadline: new Date().toISOString().split('T')[0],
            status: 'Planned'
        };

        onUpdate({ ...pei, improvementPlans: [...pei.improvementPlans, newProject] });
        setSelectedProjectIndex(pei.improvementPlans.length);
    };

    const handleUpdateProject = (index: number, field: keyof PeiProject, value: any) => {
        const updatedPlans = pei.improvementPlans.map((p, i) => i === index ? { ...p, [field]: value } : p);
        onUpdate({ ...pei, improvementPlans: updatedPlans });
    };

    const handleAddAction = (projIndex: number) => {
        const newAction: PeiProjectAction = {
            id: `act-${Date.now()}`,
            description: '',
            startDate: '',
            endDate: '',
            responsibleId: ''
        };
        const project = pei.improvementPlans[projIndex];
        handleUpdateProject(projIndex, 'actions', [...project.actions, newAction]);
    };

    const handleUpdateAction = (projIndex: number, actionId: string, field: keyof PeiProjectAction, value: string) => {
        const project = pei.improvementPlans[projIndex];
        const updatedActions = project.actions.map(a => a.id === actionId ? { ...a, [field]: value } : a);
        handleUpdateProject(projIndex, 'actions', updatedActions);
    };

    const handleRemoveProject = (index: number) => {
        if (window.confirm("¿Seguro que desea eliminar este plan de mejora?")) {
            onUpdate({ ...pei, improvementPlans: pei.improvementPlans.filter((_, i) => i !== index) });
            setSelectedProjectIndex(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <AlertTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold">Enfoque Operativo (Corto Plazo)</p>
                    <p>A diferencia del PEI (5 años), los Planes de Mejora son instrumentos anuales para resolver nudos críticos del aprendizaje y la convivencia.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Proyectos de Mejora</h3>
                        <button onClick={handleAddProject} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-bold hover:bg-indigo-700 flex items-center gap-1">
                            <PlusIcon className="h-3 w-3" /> Añadir
                        </button>
                    </div>
                    
                    <div className="space-y-2">
                        {pei.improvementPlans.map((proj, idx) => (
                            <button
                                key={proj.id}
                                onClick={() => setSelectedProjectIndex(idx)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedProjectIndex === idx ? 'border-indigo-600 bg-white shadow-md' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                            >
                                <p className="font-bold text-sm text-gray-800 truncate">{proj.title || '(Sin título)'}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${proj.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {proj.status}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">{proj.actions.length} acciones</span>
                                </div>
                            </button>
                        ))}
                        {pei.improvementPlans.length === 0 && (
                            <div className="text-center py-10 bg-slate-50 border-2 border-dashed rounded-xl text-gray-400">
                                <p className="text-sm italic">No hay planes de mejora creados.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-2">
                    {selectedProjectIndex !== null ? (
                        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow mr-4">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Título del Proyecto</label>
                                        <input 
                                            type="text" 
                                            value={pei.improvementPlans[selectedProjectIndex].title}
                                            onChange={e => handleUpdateProject(selectedProjectIndex, 'title', e.target.value)}
                                            className="w-full text-xl font-black text-gray-800 border-none p-0 focus:ring-0 placeholder-gray-200"
                                            placeholder="Nombre del Plan de Mejora..."
                                        />
                                    </div>
                                    <button onClick={() => handleRemoveProject(selectedProjectIndex)} className="text-red-400 hover:text-red-600 p-2"><TrashIcon className="h-5 w-5"/></button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">1. Definición del Problema</label>
                                        <select 
                                            value={pei.improvementPlans[selectedProjectIndex].problemId}
                                            onChange={e => {
                                                const weakness = weaknesses.find(w => w.id === e.target.value);
                                                handleUpdateProject(selectedProjectIndex, 'problemId', e.target.value);
                                                if (weakness) handleUpdateProject(selectedProjectIndex, 'problem', weakness.description);
                                            }}
                                            className="w-full p-2 border rounded-md text-sm mb-2 bg-slate-50"
                                        >
                                            <option value="">-- Vincular con FODA (Opcional) --</option>
                                            {weaknesses.map(w => (
                                                <option key={w.id} value={w.id}>[{w.dimension.split(' ')[1] || 'G'}] {w.description.substring(0, 50)}...</option>
                                            ))}
                                        </select>
                                        <textarea 
                                            value={pei.improvementPlans[selectedProjectIndex].problem}
                                            onChange={e => handleUpdateProject(selectedProjectIndex, 'problem', e.target.value)}
                                            className="w-full p-3 border rounded-xl text-sm"
                                            rows={3}
                                            placeholder="Descripción detallada del nudo crítico..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">2. Objetivo y Metas (1 Año)</label>
                                        <textarea 
                                            value={pei.improvementPlans[selectedProjectIndex].objective}
                                            onChange={e => handleUpdateProject(selectedProjectIndex, 'objective', e.target.value)}
                                            className="w-full p-3 border rounded-xl text-sm mb-3"
                                            rows={2}
                                            placeholder="Objetivo estratégico anual..."
                                        />
                                        <input 
                                            type="text"
                                            value={pei.improvementPlans[selectedProjectIndex].goal}
                                            onChange={e => handleUpdateProject(selectedProjectIndex, 'goal', e.target.value)}
                                            className="w-full p-3 border rounded-xl text-sm bg-green-50 border-green-100"
                                            placeholder="Meta cuantificable (ej: +20% aprobación)..."
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2">
                                            <ClipboardListIcon className="h-4 w-4" /> 3. Plan de Acción y Cronograma
                                        </h4>
                                        <button onClick={() => handleAddAction(selectedProjectIndex)} className="text-xs text-primary-600 font-bold hover:underline">+ Añadir Tarea</button>
                                    </div>
                                    <div className="space-y-3">
                                        {pei.improvementPlans[selectedProjectIndex].actions.map((action, aIdx) => (
                                            <div key={action.id} className="p-4 bg-slate-50 border rounded-xl relative group">
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                    <div className="md:col-span-6">
                                                        <input 
                                                            type="text" 
                                                            value={action.description} 
                                                            onChange={e => handleUpdateAction(selectedProjectIndex, action.id, 'description', e.target.value)}
                                                            className="w-full p-2 border rounded text-sm"
                                                            placeholder="Descripción de la tarea..."
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <input 
                                                            type="date" 
                                                            value={action.startDate} 
                                                            onChange={e => handleUpdateAction(selectedProjectIndex, action.id, 'startDate', e.target.value)}
                                                            className="w-full p-2 border rounded text-xs"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <select 
                                                            value={action.responsibleId} 
                                                            onChange={e => handleUpdateAction(selectedProjectIndex, action.id, 'responsibleId', e.target.value)}
                                                            className="w-full p-2 border rounded text-xs bg-white"
                                                        >
                                                            <option value="">Responsable...</option>
                                                            {staff.map(s => <option key={s.id} value={s.id}>{s.name.split(' ')[0]}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                                        <ArchiveBoxIcon className="h-4 w-4" /> 4. Recursos y Alianzas
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase">Recursos Disponibles</label>
                                            <textarea 
                                                value={pei.improvementPlans[selectedProjectIndex].resources.available}
                                                onChange={e => handleUpdateProject(selectedProjectIndex, 'resources', { ...pei.improvementPlans[selectedProjectIndex].resources, available: e.target.value })}
                                                className="w-full p-2 border rounded-lg text-xs" rows={3} placeholder="Humanos, técnicos, materiales..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase">Recursos Faltantes</label>
                                            <textarea 
                                                value={pei.improvementPlans[selectedProjectIndex].resources.needed}
                                                onChange={e => handleUpdateProject(selectedProjectIndex, 'resources', { ...pei.improvementPlans[selectedProjectIndex].resources, needed: e.target.value })}
                                                className="w-full p-2 border rounded-lg text-xs" rows={3} placeholder="Presupuesto, equipos..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase">Alianzas Estratégicas</label>
                                            <textarea 
                                                value={pei.improvementPlans[selectedProjectIndex].resources.alliances}
                                                onChange={e => handleUpdateProject(selectedProjectIndex, 'resources', { ...pei.improvementPlans[selectedProjectIndex].resources, alliances: e.target.value })}
                                                className="w-full p-2 border rounded-lg text-xs" rows={3} placeholder="Empresas, ONG, universidades..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-2xl p-20 bg-white">
                            <SparklesIcon className="h-16 w-16 mb-4 opacity-10" />
                            <p className="font-bold">Selección de Proyecto Prioritario</p>
                            <p className="text-sm text-center max-w-xs">Haga clic en un proyecto existente o cree uno nuevo para comenzar la planificación operativa.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PeiImprovementPlans;