
import React, { useState, useMemo } from 'react';
import { PeiProfile, StandardDimension, PeiGoal, User } from '../../types';
import { PlusIcon, TrashIcon, CheckCircleIcon, UsersIcon, ClipboardListIcon } from '../icons/Icons';

interface PeiStrategicPlanningProps {
    pei: PeiProfile;
    onUpdate: (updatedPei: PeiProfile) => void;
    staff: User[];
}

const PeiStrategicPlanning: React.FC<PeiStrategicPlanningProps> = ({ pei, onUpdate, staff }) => {
    const [activeDim, setActiveDim] = useState<StandardDimension>(StandardDimension.Pedagogical);

    const currentStrategicObjective = useMemo(() => {
        return pei.strategicObjectives.find(so => so.dimension === activeDim) || {
            dimension: activeDim,
            objective: '',
            goals: []
        };
    }, [pei, activeDim]);

    const handleUpdateObjective = (text: string) => {
        const updatedObjectives = pei.strategicObjectives.some(so => so.dimension === activeDim)
            ? pei.strategicObjectives.map(so => so.dimension === activeDim ? { ...so, objective: text } : so)
            : [...pei.strategicObjectives, { dimension: activeDim, objective: text, goals: [] }];
        
        onUpdate({ ...pei, strategicObjectives: updatedObjectives });
    };

    const handleAddGoal = () => {
        const newGoal: PeiGoal = {
            id: `goal-${Date.now()}`,
            description: '',
            indicator: '',
            meta: '',
            responsibleId: ''
        };

        const updatedObjectives = pei.strategicObjectives.some(so => so.dimension === activeDim)
            ? pei.strategicObjectives.map(so => so.dimension === activeDim ? { ...so, goals: [...so.goals, newGoal] } : so)
            : [...pei.strategicObjectives, { dimension: activeDim, objective: '', goals: [newGoal] }];

        onUpdate({ ...pei, strategicObjectives: updatedObjectives });
    };

    const handleUpdateGoal = (goalId: string, field: keyof PeiGoal, value: string) => {
        const updatedObjectives = pei.strategicObjectives.map(so => {
            if (so.dimension === activeDim) {
                return {
                    ...so,
                    goals: so.goals.map(g => g.id === goalId ? { ...g, [field]: value } : g)
                };
            }
            return so;
        });
        onUpdate({ ...pei, strategicObjectives: updatedObjectives });
    };

    const handleRemoveGoal = (goalId: string) => {
        const updatedObjectives = pei.strategicObjectives.map(so => {
            if (so.dimension === activeDim) {
                return {
                    ...so,
                    goals: so.goals.filter(g => g.id !== goalId)
                };
            }
            return so;
        });
        onUpdate({ ...pei, strategicObjectives: updatedObjectives });
    };

    // Resumen del FODA para referencia
    const fodaSummary = useMemo(() => {
        const diag = pei.diagnostics.find(d => d.dimension === activeDim);
        if (!diag) return null;
        return diag.strategies.filter(s => s.priorityScore >= 10);
    }, [pei, activeDim]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Dimension Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
                {Object.values(StandardDimension).map(dim => (
                    <button 
                        key={dim}
                        onClick={() => setActiveDim(dim)}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-md transition-all ${activeDim === dim ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {dim.split(' ')[1] || dim.split(' ')[0]}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* References Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <h4 className="text-xs font-bold text-amber-800 uppercase mb-3 flex items-center gap-2">
                            <ClipboardListIcon className="h-4 w-4" /> Estrategias Priorizadas (FODA)
                        </h4>
                        {fodaSummary && fodaSummary.length > 0 ? (
                            <ul className="space-y-3">
                                {fodaSummary.map(s => (
                                    <li key={s.id} className="text-xs text-amber-900 bg-white/50 p-2 rounded border border-amber-100">
                                        <span className="font-bold mr-1">[{s.type}]</span> {s.description}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-amber-600 italic">No hay estrategias de alta prioridad en esta dimensión.</p>
                        )}
                        <p className="text-[10px] text-amber-700 mt-4 leading-tight">* Use estas estrategias como base para redactar sus objetivos y metas.</p>
                    </div>
                </div>

                {/* Planning Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Strategic Objective */}
                    <div className="bg-white p-6 rounded-xl border-2 border-indigo-100 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Objetivo Estratégico de la Dimensión</label>
                        <textarea 
                            value={currentStrategicObjective.objective}
                            onChange={e => handleUpdateObjective(e.target.value)}
                            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-gray-800"
                            placeholder="Ej: Elevar la calidad del aprendizaje mediante la innovación pedagógica..."
                            rows={3}
                        />
                    </div>

                    {/* Goals Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                            <h4 className="text-sm font-bold text-gray-700 uppercase">Metas e Indicadores de Gestión</h4>
                            <button 
                                onClick={handleAddGoal}
                                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-bold hover:bg-indigo-700 flex items-center gap-1"
                            >
                                <PlusIcon className="h-3 w-3" /> Añadir Meta
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            {currentStrategicObjective.goals.map((goal, idx) => (
                                <div key={goal.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                                    <button 
                                        onClick={() => handleRemoveGoal(goal.id)}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Descripción de la Meta</label>
                                            <input 
                                                type="text"
                                                value={goal.description}
                                                onChange={e => handleUpdateGoal(goal.id, 'description', e.target.value)}
                                                className="w-full p-2 border rounded text-sm"
                                                placeholder="Ej: Capacitar a todos los docentes..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Indicador de Logro</label>
                                            <input 
                                                type="text"
                                                value={goal.indicator}
                                                onChange={e => handleUpdateGoal(goal.id, 'indicator', e.target.value)}
                                                className="w-full p-2 border rounded text-sm"
                                                placeholder="Ej: % de docentes certificados"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Meta Cuantitativa</label>
                                            <input 
                                                type="text"
                                                value={goal.meta}
                                                onChange={e => handleUpdateGoal(goal.id, 'meta', e.target.value)}
                                                className="w-full p-2 border rounded text-sm"
                                                placeholder="Ej: 100%"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                                                <UsersIcon className="h-3 w-3" /> Responsable
                                            </label>
                                            <select 
                                                value={goal.responsibleId}
                                                onChange={e => handleUpdateGoal(goal.id, 'responsibleId', e.target.value)}
                                                className="w-full p-2 border rounded text-sm bg-white"
                                            >
                                                <option value="">Seleccionar responsable...</option>
                                                {staff.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {currentStrategicObjective.goals.length === 0 && (
                                <p className="text-center py-8 text-gray-400 text-sm italic">Haga clic en "Añadir Meta" para comenzar el desglose operativo.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PeiStrategicPlanning;
