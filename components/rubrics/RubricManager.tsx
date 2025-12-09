
import React, { useState } from 'react';
import { Rubric, RubricCriteria, RubricLevel, RubricDescriptor, User } from '../../types';
import { PlusIcon, TrashIcon, CloseIcon, EditIcon, PrinterIcon, SparklesIcon, ArrowLeftIcon, CheckCircleIcon } from '../icons/Icons';
import RubricGeneratorAssistant from '../repository/RubricGeneratorAssistant';

interface RubricManagerProps {
    isOpen: boolean;
    onClose: () => void;
    rubrics?: Rubric[]; // List of existing rubrics
    onUpdateRubrics?: (rubrics: Rubric[]) => void; // Handler to update list
    onSave?: (rubric: Rubric) => void; // Legacy/Single save fallback
    rubricToEdit?: Rubric | null; // Legacy prop
    institutionId?: string; // Legacy prop
    currentUser?: User; // New prop for ID generation
}

// Sub-component: Printable View
const PrintableRubric: React.FC<{ rubric: Rubric; onBack: () => void }> = ({ rubric, onBack }) => (
    <div className="flex flex-col h-full bg-gray-100">
        <div className="bg-white border-b p-4 flex justify-between items-center no-print shadow-sm">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm font-semibold">
                <ArrowLeftIcon className="h-4 w-4" /> Volver al Editor
            </button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                <PrinterIcon className="h-5 w-5" /> Imprimir
            </button>
        </div>
        <div className="overflow-auto flex-grow p-8">
            <div className="bg-white p-10 max-w-[29cm] mx-auto shadow-lg print:shadow-none print:p-0">
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                    <h1 className="text-2xl font-bold uppercase">{rubric.title}</h1>
                    <p className="text-gray-600 mt-2 italic">{rubric.description}</p>
                </div>
                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="bg-gray-100 print:bg-gray-200">
                            <th className="border border-black p-2 w-1/4 text-left">Criterios de Evaluación</th>
                            {rubric.levels.sort((a,b) => b.order - a.order).map(l => (
                                <th key={l.id} className="border border-black p-2 text-center w-[15%]">
                                    <div className="font-bold uppercase">{l.label}</div>
                                    <div className="text-xs font-normal">({l.value} pts)</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rubric.criteria.map(crit => (
                            <tr key={crit.id}>
                                <td className="border border-black p-3 bg-gray-50 print:bg-transparent">
                                    <p className="font-bold">{crit.description}</p>
                                    <p className="text-xs mt-1 text-gray-500">Peso: {crit.weight}%</p>
                                </td>
                                {rubric.levels.sort((a,b) => b.order - a.order).map(lvl => {
                                    const desc = rubric.descriptors.find(d => d.criteriaId === crit.id && d.levelId === lvl.id);
                                    return (
                                        <td key={lvl.id} className="border border-black p-3 align-top text-xs">
                                            {desc?.description || '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-8 pt-4 border-t border-black grid grid-cols-2 gap-20 text-center">
                    <div className="mt-16 border-t border-black pt-2 font-bold">Firma Docente</div>
                    <div className="mt-16 border-t border-black pt-2 font-bold">Firma Coordinador/a</div>
                </div>
            </div>
        </div>
    </div>
);

// Sub-component: Rubric Form (Editor)
const RubricForm: React.FC<{ 
    initialData: Partial<Rubric>; 
    onSave: (r: Rubric) => void; 
    onCancel: () => void; 
    onPrint: (r: Rubric) => void;
}> = ({ initialData, onSave, onCancel, onPrint }) => {
    const [formData, setFormData] = useState<Partial<Rubric>>(initialData);

    const handleLevelChange = (index: number, field: keyof RubricLevel, value: any) => {
        const newLevels = [...(formData.levels || [])];
        newLevels[index] = { ...newLevels[index], [field]: value };
        setFormData({ ...formData, levels: newLevels });
    };

    const handleCriteriaChange = (index: number, field: keyof RubricCriteria, value: any) => {
        const newCriteria = [...(formData.criteria || [])];
        newCriteria[index] = { ...newCriteria[index], [field]: value };
        setFormData({ ...formData, criteria: newCriteria });
    };

    const addCriteria = () => {
        setFormData({
            ...formData,
            criteria: [...(formData.criteria || []), { id: `c-${Date.now()}`, rubricId: '', description: 'Nuevo Criterio', weight: 0 }]
        });
    };
    
    const removeCriteria = (index: number) => {
         const newCriteria = [...(formData.criteria || [])];
         newCriteria.splice(index, 1);
         setFormData({ ...formData, criteria: newCriteria });
    };

    const handleDescriptorChange = (criteriaId: string, levelId: string, text: string) => {
        const newDescriptors = [...(formData.descriptors || [])];
        const existingIndex = newDescriptors.findIndex(d => d.criteriaId === criteriaId && d.levelId === levelId);
        
        if (existingIndex >= 0) {
            newDescriptors[existingIndex].description = text;
        } else {
            newDescriptors.push({ criteriaId, levelId, description: text });
        }
        setFormData({ ...formData, descriptors: newDescriptors });
    };

    const getDescriptor = (criteriaId: string, levelId: string) => {
        return formData.descriptors?.find(d => d.criteriaId === criteriaId && d.levelId === levelId)?.description || '';
    };

    const handleSubmit = () => {
        // Validation could go here
        onSave(formData as Rubric);
    };

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{formData.id ? 'Editar Rúbrica' : 'Nueva Rúbrica'}</h2>
                    <p className="text-xs text-gray-500">Defina los criterios y niveles de evaluación.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onPrint(formData as Rubric)} className="p-2 text-gray-600 hover:text-blue-600 bg-white border rounded-md shadow-sm" title="Vista Previa / Imprimir"><PrinterIcon className="h-5 w-5"/></button>
                    <button onClick={onCancel} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-primary-600 text-white rounded-md font-bold hover:bg-primary-700">Guardar</button>
                </div>
            </header>
            
            <div className="p-6 overflow-y-auto flex-grow space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Título de la Rúbrica</label>
                        <input type="text" className="w-full p-2 border rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej: Rúbrica de Debate" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Escala</label>
                        <select className="w-full p-2 border rounded" value={formData.scaleType} onChange={e => setFormData({...formData, scaleType: e.target.value as any})}>
                            <option value="Quantitative">Cuantitativa (Notas)</option>
                            <option value="Qualitative">Cualitativa (Conceptos)</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <input type="text" className="w-full p-2 border rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descripción breve..." />
                    </div>
                </div>

                <div className="border p-4 rounded bg-slate-50">
                    <h3 className="font-bold text-sm mb-2 text-slate-700">Niveles de Desempeño (Columnas)</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {formData.levels?.sort((a,b) => b.order - a.order).map((level, idx) => (
                            <div key={level.id} className={`p-2 rounded border ${level.color || 'bg-white'}`}>
                                <input className="w-full text-xs font-bold bg-transparent border-b border-transparent focus:border-gray-400 mb-1" value={level.label} onChange={e => handleLevelChange(idx, 'label', e.target.value)} />
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-500">Valor:</span>
                                    <input type="number" className="w-12 text-xs p-1 border rounded" value={level.value} onChange={e => handleLevelChange(idx, 'value', parseFloat(e.target.value))} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-sm mb-2 text-slate-700">Matriz de Evaluación</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm min-w-[800px]">
                            <thead>
                                <tr>
                                    <th className="border p-2 w-1/4 bg-gray-100 text-left">Criterio / Peso</th>
                                    {formData.levels?.sort((a,b) => b.order - a.order).map(l => (
                                        <th key={l.id} className={`border p-2 ${l.color} text-center`}>{l.label} ({l.value})</th>
                                    ))}
                                    <th className="border p-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.criteria?.map((criterion, idx) => (
                                    <tr key={criterion.id}>
                                        <td className="border p-2 align-top bg-gray-50">
                                            <textarea className="w-full p-1 border rounded text-sm mb-2" rows={2} value={criterion.description} onChange={e => handleCriteriaChange(idx, 'description', e.target.value)} placeholder="Descripción del criterio..." />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-600">Peso %:</span>
                                                <input type="number" className="w-16 p-1 border rounded text-xs" value={criterion.weight} onChange={e => handleCriteriaChange(idx, 'weight', parseFloat(e.target.value))} />
                                            </div>
                                        </td>
                                        {formData.levels?.sort((a,b) => b.order - a.order).map(level => (
                                            <td key={level.id} className="border p-2 align-top">
                                                <textarea className="w-full h-full min-h-[80px] p-1 border-0 focus:ring-1 focus:ring-blue-300 text-xs resize-none bg-transparent" placeholder={`Descriptor...`} value={getDescriptor(criterion.id, level.id)} onChange={e => handleDescriptorChange(criterion.id, level.id, e.target.value)} />
                                            </td>
                                        ))}
                                        <td className="border p-2 text-center align-middle">
                                            <button onClick={() => removeCriteria(idx)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={addCriteria} className="mt-2 flex items-center gap-1 text-primary-600 text-sm font-semibold hover:underline">
                        <PlusIcon className="h-4 w-4"/> Añadir Criterio
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Component
const RubricManager: React.FC<RubricManagerProps> = ({ isOpen, onClose, rubrics, onUpdateRubrics, onSave, rubricToEdit, institutionId, currentUser }) => {
    const [view, setView] = useState<'list' | 'form' | 'print' | 'ai'>('list');
    const [selectedRubric, setSelectedRubric] = useState<Partial<Rubric> | null>(null);

    // Initial load logic for legacy usage
    React.useEffect(() => {
        if (isOpen) {
            if (rubricToEdit) {
                setSelectedRubric(rubricToEdit);
                setView('form');
            } else if (!rubrics) {
                // If no list provided, assume we are in "Create New" mode directly (Legacy)
                setSelectedRubric({
                    title: '', description: '', scaleType: 'Quantitative',
                    levels: [
                        { id: 'l1', rubricId: '', label: 'Excelente', value: 10, order: 4, color: 'bg-green-100' },
                        { id: 'l2', rubricId: '', label: 'Muy Bueno', value: 8, order: 3, color: 'bg-blue-100' },
                        { id: 'l3', rubricId: '', label: 'Bueno', value: 6, order: 2, color: 'bg-yellow-100' },
                        { id: 'l4', rubricId: '', label: 'Regular', value: 4, order: 1, color: 'bg-red-100' }
                    ],
                    criteria: [{ id: `c-${Date.now()}`, rubricId: '', description: 'Criterio 1', weight: 100 }],
                    descriptors: []
                });
                setView('form');
            } else {
                setView('list');
            }
        }
    }, [isOpen, rubricToEdit, rubrics]);

    const handleCreateNew = () => {
        setSelectedRubric({
            id: `rub-${Date.now()}`,
            institutionId: institutionId || currentUser?.institutionId || '',
            title: '', description: '', scaleType: 'Quantitative',
            levels: [
                { id: 'l1', rubricId: '', label: 'Excelente', value: 10, order: 4, color: 'bg-green-100' },
                { id: 'l2', rubricId: '', label: 'Muy Bueno', value: 8, order: 3, color: 'bg-blue-100' },
                { id: 'l3', rubricId: '', label: 'Bueno', value: 6, order: 2, color: 'bg-yellow-100' },
                { id: 'l4', rubricId: '', label: 'Regular', value: 4, order: 1, color: 'bg-red-100' }
            ],
            criteria: [{ id: `c-${Date.now()}`, rubricId: '', description: 'Criterio 1', weight: 100 }],
            descriptors: []
        });
        setView('form');
    };

    const handleSaveRubric = (rubric: Rubric) => {
        if (onUpdateRubrics && rubrics) {
            const exists = rubrics.some(r => r.id === rubric.id);
            if (exists) {
                onUpdateRubrics(rubrics.map(r => r.id === rubric.id ? rubric : r));
            } else {
                onUpdateRubrics([...rubrics, rubric]);
            }
        }
        if (onSave) onSave(rubric); // Legacy support
        
        // Return to list if managing a list, otherwise close
        if (rubrics) {
            setView('list');
        } else {
            onClose();
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Eliminar esta rúbrica?') && onUpdateRubrics && rubrics) {
            onUpdateRubrics(rubrics.filter(r => r.id !== id));
        }
    };

    if (!isOpen) return null;

    // Render Content Based on View
    const renderContent = () => {
        if (view === 'ai') {
            return (
                <RubricGeneratorAssistant 
                    isOpen={true} 
                    onClose={() => setView('list')} 
                    currentUser={currentUser} 
                    onSaveRubric={(r) => { setSelectedRubric(r); setView('form'); }} 
                />
            );
        }

        if (view === 'print' && selectedRubric) {
            return <PrintableRubric rubric={selectedRubric as Rubric} onBack={() => setView('form')} />;
        }

        if (view === 'form' && selectedRubric) {
            return (
                <RubricForm 
                    initialData={selectedRubric} 
                    onSave={handleSaveRubric} 
                    onCancel={() => rubrics ? setView('list') : onClose()} 
                    onPrint={(r) => { setSelectedRubric(r); setView('print'); }}
                />
            );
        }

        // List View
        return (
            <div className="flex flex-col h-full">
                <header className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Banco de Rúbricas</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6" /></button>
                </header>
                <div className="p-6 overflow-y-auto flex-grow">
                    <div className="flex gap-4 mb-6">
                        <button onClick={handleCreateNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium">
                            <PlusIcon className="h-5 w-5" /> Nueva Rúbrica
                        </button>
                        <button onClick={() => setView('ai')} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium shadow-sm">
                            <SparklesIcon className="h-5 w-5" /> Generar con IA
                        </button>
                    </div>
                    
                    {rubrics && rubrics.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rubrics.map(rubric => (
                                <div key={rubric.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white flex flex-col justify-between h-48 group">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-800 line-clamp-2">{rubric.title}</h3>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border">{rubric.scaleType === 'Quantitative' ? 'Notas' : 'Cualitativa'}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-3">{rubric.description || 'Sin descripción'}</p>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4 pt-2 border-t opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setSelectedRubric(rubric); setView('print'); }} className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50" title="Imprimir"><PrinterIcon className="h-4 w-4"/></button>
                                        <button onClick={() => { setSelectedRubric(rubric); setView('form'); }} className="p-1.5 text-gray-500 hover:text-green-600 rounded hover:bg-green-50" title="Editar"><EditIcon className="h-4 w-4"/></button>
                                        <button onClick={() => handleDelete(rubric.id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-red-50" title="Eliminar"><TrashIcon className="h-4 w-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-xl">
                            <p>No hay rúbricas creadas.</p>
                            <p className="text-sm mt-1">Crea una manualmente o usa la IA para generar una.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                {renderContent()}
            </div>
        </div>
    );
};

export default RubricManager;
