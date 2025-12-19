
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { ResourceRepositoryItem, ResourceType, SubjectLevel, GradeLevel, CurricularInsertion, Competency, Dcd, Rubric, Subject } from '../../types';
import { SUBJECT_LEVELS, GRADE_LEVELS, CURRICULAR_INSERTIONS, COMPETENCIES } from '../../constants';
import { CloseIcon, PlusIcon, TrashIcon } from '../icons/Icons';
import { InstitutionContext } from '../../contexts/UserContext';

interface ResourceFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (resource: ResourceRepositoryItem) => void;
    resourceToEdit?: ResourceRepositoryItem | null;
    currentUser: any;
    dcds: Dcd[];
    rubrics: Rubric[];
    subjects: Subject[];
}

const ResourceForm: React.FC<ResourceFormProps> = ({ isOpen, onClose, onSave, resourceToEdit, currentUser, dcds, rubrics, subjects }) => {
    const { institution } = useContext(InstitutionContext);
    const [formData, setFormData] = useState<Partial<ResourceRepositoryItem>>({
        type: 'Activity',
        level: 'Todos',
        shared: true,
        dcdIds: [],
        curricularInsertions: [],
        competencies: [],
        phases: [],
        resourceLinks: []
    });
    
    // Helper state for DCD search
    const [dcdSearch, setDcdSearch] = useState('');
    
    useEffect(() => {
        if (resourceToEdit) {
            setFormData(JSON.parse(JSON.stringify(resourceToEdit)));
        }
    }, [resourceToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleCheckboxGroup = (field: keyof ResourceRepositoryItem, value: string) => {
        const currentList = (formData[field] as string[]) || [];
        const newList = currentList.includes(value) 
            ? currentList.filter(i => i !== value)
            : [...currentList, value];
        setFormData(p => ({ ...p, [field]: newList }));
    };

    const handlePhaseChange = (index: number, field: string, value: any) => {
        const newPhases = [...(formData.phases || [])];
        newPhases[index] = { ...newPhases[index], [field]: value };
        setFormData(p => ({ ...p, phases: newPhases }));
    };

    const addPhase = () => {
        setFormData(p => ({ ...p, phases: [...(p.phases || []), { name: '', trimester: 1, description: '' }] }));
    };
    
    const removePhase = (index: number) => setFormData(p => ({...p, phases: p.phases?.filter((_, i) => i !== index)}));

    const filteredDcds = useMemo(() => {
        if (!dcdSearch) return [];
        return dcds.filter(d => d.code.toLowerCase().includes(dcdSearch.toLowerCase()) || d.description.toLowerCase().includes(dcdSearch.toLowerCase())).slice(0, 5);
    }, [dcds, dcdSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newResource: ResourceRepositoryItem = {
            id: resourceToEdit?.id || `res-${Date.now()}`,
            institutionId: currentUser.institutionId,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorInstitutionName: institution?.name || 'Institución Desconocida',
            creationDate: resourceToEdit?.creationDate || new Date().toISOString(),
            ...formData as ResourceRepositoryItem
        };
        onSave(newResource);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">{resourceToEdit ? 'Editar Recurso' : 'Nuevo Recurso / Proyecto'}</h2>
                    <button onClick={onClose}><CloseIcon className="h-6 w-6 text-gray-500" /></button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700">Título</label>
                            <input type="text" name="title" value={formData.title || ''} onChange={handleChange} required className="w-full p-2 border rounded" placeholder="Ej: Proyecto Huerto Escolar" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Recurso</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="Activity">Actividad Disciplinar</option>
                                <option value="Project">Proyecto Interdisciplinario</option>
                                <option value="ABP">Aprendizaje Basado en Proyectos (ABP)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nivel</label>
                            <select name="level" value={formData.level} onChange={handleChange} className="w-full p-2 border rounded">
                                {SUBJECT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className="w-full p-2 border rounded" placeholder="Descripción general..." required></textarea>

                    {/* DUA Section */}
                    <div className="bg-blue-50 p-4 rounded border border-blue-100">
                        <h3 className="font-bold text-blue-800 mb-3 text-sm">Estructura DUA (Diseño Universal para el Aprendizaje)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase">1. Representación (El Qué)</label>
                                <textarea name="duaRepresentation" value={formData.duaRepresentation || ''} onChange={handleChange} rows={3} className="w-full p-2 text-sm border rounded" placeholder="Recursos visuales, auditivos..."></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase">2. Acción/Expresión (El Cómo)</label>
                                <textarea name="duaActionExpression" value={formData.duaActionExpression || ''} onChange={handleChange} rows={3} className="w-full p-2 text-sm border rounded" placeholder="Opciones de entrega..."></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase">3. Implicación (El Porqué)</label>
                                <textarea name="duaEngagement" value={formData.duaEngagement || ''} onChange={handleChange} rows={3} className="w-full p-2 text-sm border rounded" placeholder="Estrategia de motivación..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Visibility & Sharing */}
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded">
                        <h3 className="font-bold text-orange-800 mb-3 text-sm flex items-center gap-2">
                             Compartir Recurso
                        </h3>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={formData.shared} 
                                onChange={e => setFormData({...formData, shared: e.target.checked})}
                                className="h-4 w-4 text-primary-600 rounded"
                            />
                            <span className="text-sm font-medium text-orange-900">Hacer este recurso accesible para todas las instituciones (Banco Global)</span>
                        </label>
                        <p className="text-xs text-orange-700 mt-1 ml-6">Al compartirlo, aparecerá con su nombre y el de su institución en la red global Amauta.</p>
                    </div>

                    {/* Taxonomy Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <fieldset className="border p-3 rounded">
                            <legend className="text-sm font-bold text-gray-700">Inserciones Curriculares</legend>
                            <div className="flex flex-wrap gap-2">
                                {CURRICULAR_INSERTIONS.map(ins => (
                                    <label key={ins} className="inline-flex items-center text-xs bg-gray-50 px-2 py-1 rounded border cursor-pointer hover:bg-green-50">
                                        <input type="checkbox" checked={formData.curricularInsertions?.includes(ins)} onChange={() => handleCheckboxGroup('curricularInsertions', ins)} className="mr-1"/>
                                        {ins}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <fieldset className="border p-3 rounded">
                            <legend className="text-sm font-bold text-gray-700">Competencias</legend>
                            <div className="flex flex-wrap gap-2">
                                {COMPETENCIES.map(comp => (
                                    <label key={comp} className="inline-flex items-center text-xs bg-gray-50 px-2 py-1 rounded border cursor-pointer hover:bg-blue-50">
                                        <input type="checkbox" checked={formData.competencies?.includes(comp)} onChange={() => handleCheckboxGroup('competencies', comp)} className="mr-1"/>
                                        {comp}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    </div>

                    {/* Project Specifics */}
                    {(formData.type === 'Project' || formData.type === 'ABP') && (
                        <div className="bg-purple-50 p-4 rounded border border-purple-100">
                            <h3 className="font-bold text-purple-800 mb-3 text-sm">Configuración de Proyecto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input type="text" name="generativeTopic" value={formData.generativeTopic || ''} onChange={handleChange} placeholder="Tópico Generativo (Gran Tema)" className="w-full p-2 border rounded" />
                                <input type="text" name="finalProduct" value={formData.finalProduct || ''} onChange={handleChange} placeholder="Producto Final (Ej. Feria, Revista)" className="w-full p-2 border rounded" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Fases del Proyecto (Trimestrales)</label>
                                {formData.phases?.map((phase, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input type="text" value={phase.name} onChange={e => handlePhaseChange(idx, 'name', e.target.value)} placeholder="Nombre Fase" className="flex-1 p-1 border rounded text-sm"/>
                                        <select value={phase.trimester} onChange={e => handlePhaseChange(idx, 'trimester', parseInt(e.target.value))} className="w-20 p-1 border rounded text-sm"><option value="1">Trim 1</option><option value="2">Trim 2</option><option value="3">Trim 3</option></select>
                                        <input type="text" value={phase.description} onChange={e => handlePhaseChange(idx, 'description', e.target.value)} placeholder="Descripción breve" className="flex-1 p-1 border rounded text-sm"/>
                                        <button type="button" onClick={() => removePhase(idx)} className="text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addPhase} className="text-xs text-primary-600 font-semibold flex items-center gap-1"><PlusIcon className="h-3 w-3"/> Añadir Fase</button>
                            </div>
                        </div>
                    )}

                    {/* Link DCDs and Rubric */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border p-3 rounded">
                            <label className="block text-sm font-bold mb-2">Vincular Destrezas (DCDs)</label>
                            <input type="text" placeholder="Buscar DCD por código..." value={dcdSearch} onChange={e => setDcdSearch(e.target.value)} className="w-full p-1 border rounded text-sm mb-2"/>
                            {dcdSearch && (
                                <ul className="text-xs space-y-1 mb-2">
                                    {filteredDcds.map(d => (
                                        <li key={d.id} className="cursor-pointer hover:bg-gray-100 p-1 rounded" onClick={() => handleCheckboxGroup('dcdIds', d.id)}>
                                            + <strong>{d.code}</strong> {d.description.substring(0, 30)}...
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="flex flex-wrap gap-1">
                                {formData.dcdIds?.map(id => (
                                    <span key={id} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                                        {dcds.find(d => d.id === id)?.code || id}
                                        <button type="button" onClick={() => handleCheckboxGroup('dcdIds', id)} className="text-red-500 font-bold">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                             <label className="block text-sm font-bold mb-2">Instrumento de Evaluación</label>
                             <select name="rubricId" value={formData.rubricId || ''} onChange={handleChange} className="w-full p-2 border rounded">
                                 <option value="">-- Seleccionar Rúbrica --</option>
                                 {rubrics.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                             </select>
                             <p className="text-xs text-gray-500 mt-1">Seleccione una rúbrica existente del banco.</p>
                        </div>
                    </div>
                </form>
                
                <footer className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-primary-600 text-white rounded-md font-bold hover:bg-primary-700">Guardar Recurso</button>
                </footer>
            </div>
        </div>
    );
};

export default ResourceForm;
