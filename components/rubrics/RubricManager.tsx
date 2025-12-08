import React, { useState } from 'react';
import { Rubric, RubricCriteria, RubricLevel, RubricDescriptor } from '../../types';
import { PlusIcon, TrashIcon, CloseIcon } from '../icons/Icons';

interface RubricManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rubric: Rubric) => void;
    rubricToEdit?: Rubric | null;
    institutionId: string;
}

const RubricManager: React.FC<RubricManagerProps> = ({ isOpen, onClose, onSave, rubricToEdit, institutionId }) => {
    const [formData, setFormData] = useState<Partial<Rubric>>({
        title: '',
        description: '',
        scaleType: 'Quantitative',
        levels: [
            { id: 'l1', rubricId: '', label: 'Excelente', value: 10, order: 4, color: 'bg-green-100' },
            { id: 'l2', rubricId: '', label: 'Muy Bueno', value: 8, order: 3, color: 'bg-blue-100' },
            { id: 'l3', rubricId: '', label: 'Bueno', value: 6, order: 2, color: 'bg-yellow-100' },
            { id: 'l4', rubricId: '', label: 'Regular', value: 4, order: 1, color: 'bg-red-100' }
        ],
        criteria: [{ id: `c-${Date.now()}`, rubricId: '', description: 'Criterio 1', weight: 100 }],
        descriptors: []
    });

    // Initialize state if editing
    React.useEffect(() => {
        if (rubricToEdit) {
            setFormData(JSON.parse(JSON.stringify(rubricToEdit)));
        }
    }, [rubricToEdit, isOpen]);

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
        const newCritId = `c-${Date.now()}`;
        setFormData({
            ...formData,
            criteria: [...(formData.criteria || []), { id: newCritId, rubricId: '', description: 'Nuevo Criterio', weight: 0 }]
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
        const totalWeight = formData.criteria?.reduce((sum, c) => sum + c.weight, 0) || 0;
        if (Math.abs(totalWeight - 100) > 0.1) {
            alert(`El peso total de los criterios debe ser 100%. Actual: ${totalWeight}%`);
            return;
        }

        const newRubric: Rubric = {
            id: rubricToEdit?.id || `rub-${Date.now()}`,
            institutionId,
            title: formData.title || 'Nueva Rúbrica',
            description: formData.description,
            scaleType: formData.scaleType as any,
            levels: formData.levels as any[],
            criteria: formData.criteria as any[],
            descriptors: formData.descriptors as any[]
        };
        onSave(newRubric);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col" 
                onClick={e => e.stopPropagation()} // CRITICAL FIX: Stop propagation here
            >
                <header className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">Diseñador de Rúbricas</h2>
                    <button onClick={onClose}><CloseIcon className="h-6 w-6 text-gray-500" /></button>
                </header>
                
                <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    {/* Basic Info */}
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
                    </div>

                    {/* Levels Configuration */}
                    <div className="border p-4 rounded bg-slate-50">
                        <h3 className="font-bold text-sm mb-2 text-slate-700">Niveles de Desempeño (Columnas)</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {formData.levels?.sort((a,b) => b.order - a.order).map((level, idx) => (
                                <div key={level.id} className={`p-2 rounded border ${level.color || 'bg-white'}`}>
                                    <input 
                                        className="w-full text-xs font-bold bg-transparent border-b border-transparent focus:border-gray-400 mb-1" 
                                        value={level.label} 
                                        onChange={e => handleLevelChange(idx, 'label', e.target.value)}
                                    />
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500">Valor:</span>
                                        <input 
                                            type="number" 
                                            className="w-12 text-xs p-1 border rounded" 
                                            value={level.value} 
                                            onChange={e => handleLevelChange(idx, 'value', parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Matrix Editor */}
                    <div>
                        <h3 className="font-bold text-sm mb-2 text-slate-700">Matriz de Evaluación</h3>
                        <table className="w-full border-collapse text-sm">
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
                                            <textarea 
                                                className="w-full p-1 border rounded text-sm mb-2" 
                                                rows={2} 
                                                value={criterion.description}
                                                onChange={e => handleCriteriaChange(idx, 'description', e.target.value)}
                                                placeholder="Descripción del criterio..."
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-600">Peso %:</span>
                                                <input 
                                                    type="number" 
                                                    className="w-16 p-1 border rounded text-xs" 
                                                    value={criterion.weight}
                                                    onChange={e => handleCriteriaChange(idx, 'weight', parseFloat(e.target.value))}
                                                />
                                            </div>
                                        </td>
                                        {formData.levels?.sort((a,b) => b.order - a.order).map(level => (
                                            <td key={level.id} className="border p-2 align-top">
                                                <textarea 
                                                    className="w-full h-full min-h-[80px] p-1 border-0 focus:ring-1 focus:ring-blue-300 text-xs resize-none" 
                                                    placeholder={`Descriptor para ${level.label}...`}
                                                    value={getDescriptor(criterion.id, level.id)}
                                                    onChange={e => handleDescriptorChange(criterion.id, level.id, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                        <td className="border p-2 text-center align-middle">
                                            <button onClick={() => removeCriteria(idx)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={addCriteria} className="mt-2 flex items-center gap-1 text-primary-600 text-sm font-semibold hover:underline">
                            <PlusIcon className="h-4 w-4"/> Añadir Criterio
                        </button>
                    </div>
                </div>

                <footer className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-primary-600 text-white rounded-md font-bold hover:bg-primary-700">Guardar Rúbrica</button>
                </footer>
            </div>
        </div>
    );
};

export default RubricManager;