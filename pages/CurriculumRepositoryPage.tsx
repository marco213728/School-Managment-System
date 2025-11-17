import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Dcd, Subject, GradeLevel, EvaluationCriterion, EvaluationIndicator, Competency } from '../types';
import { GRADE_LEVELS, COMPETENCIES } from '../constants';
import { UserContext } from '../contexts/UserContext';
import { PlusIcon, EditIcon, TrashIcon, CloseIcon } from '../components/icons/Icons';

// #region FORMS
// These would normally be separate files but are included here to meet constraints.

interface EvaluationCriterionFormProps {
    isOpen: boolean; onClose: () => void; onSave: (data: any) => void;
    itemToEdit: EvaluationCriterion | null; subjects: Subject[];
}
const EvaluationCriterionForm: React.FC<EvaluationCriterionFormProps> = ({ isOpen, onClose, onSave, itemToEdit, subjects }) => {
    const [formData, setFormData] = useState({ id: undefined as string | undefined, code: '', description: '', subjectId: '', gradeLevel: 'EGB Superior' as GradeLevel });
    useEffect(() => {
        setFormData(itemToEdit ? { ...itemToEdit } : { id: undefined, code: '', description: '', subjectId: '', gradeLevel: 'EGB Superior' as GradeLevel });
    }, [itemToEdit, isOpen]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">{itemToEdit ? 'Editar' : 'Añadir'} Criterio de Evaluación (CE)</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="code" value={formData.code} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" placeholder="Código (Ej: CE.M.4.1.)" />
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="mt-1 w-full p-2 border rounded-md" placeholder="Descripción del Criterio"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="subjectId" value={formData.subjectId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white"><option value="">Asignatura</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                        <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white"><option value="">Nivel/Subnivel</option>{GRADE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Guardar</button></div>
                </form>
            </div>
        </div>
    );
};

interface DcdFormProps {
    isOpen: boolean; onClose: () => void; onSave: (data: any) => void;
    itemToEdit: Dcd | null; subjects: Subject[]; criteria: EvaluationCriterion[];
}
const DcdForm: React.FC<DcdFormProps> = ({ isOpen, onClose, onSave, itemToEdit, subjects, criteria }) => {
    const [formData, setFormData] = useState({ id: undefined as string | undefined, code: '', description: '', subjectId: '', gradeLevel: 'EGB Superior' as GradeLevel, criterionId: '', competencies: [] as Competency[] });
    useEffect(() => {
        setFormData(itemToEdit ? { ...itemToEdit } : { id: undefined, code: '', description: '', subjectId: '', gradeLevel: 'EGB Superior', criterionId: '', competencies: [] });
    }, [itemToEdit, isOpen]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleCompetencyChange = (c: Competency) => setFormData(p => ({ ...p, competencies: p.competencies.includes(c) ? p.competencies.filter(x => x !== c) : [...p.competencies, c] }));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">{itemToEdit ? 'Editar' : 'Añadir'} Destreza (DCD)</h2>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
                    <input type="text" name="code" value={formData.code} onChange={handleChange} required className="w-full p-2 border rounded-md" placeholder="Código (Ej: M.4.1.1.)"/>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full p-2 border rounded-md" placeholder="Descripción"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="subjectId" value={formData.subjectId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white"><option value="">Asignatura</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                        <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white"><option value="">Nivel</option>{GRADE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                    </div>
                    <select name="criterionId" value={formData.criterionId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white"><option value="">Criterio de Evaluación Asociado</option>{criteria.map(c => <option key={c.id} value={c.id}>{c.code} {c.description.substring(0, 50)}...</option>)}</select>
                    <fieldset><legend className="text-sm font-medium text-gray-700 mb-2">Competencias</legend><div className="flex flex-wrap gap-x-4 gap-y-2">{COMPETENCIES.map(c => <label key={c} className="flex items-center gap-2"><input type="checkbox" checked={formData.competencies.includes(c)} onChange={() => handleCompetencyChange(c)}/>{c}</label>)}</div></fieldset>
                    <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Guardar</button></div>
                </form>
            </div>
        </div>
    );
};

interface EvaluationIndicatorFormProps {
    isOpen: boolean; onClose: () => void; onSave: (data: any) => void;
    itemToEdit: EvaluationIndicator | null; criteria: EvaluationCriterion[];
}
const EvaluationIndicatorForm: React.FC<EvaluationIndicatorFormProps> = ({ isOpen, onClose, onSave, itemToEdit, criteria }) => {
    const [formData, setFormData] = useState({ id: undefined as string | undefined, code: '', description: '', criterionId: '' });
    useEffect(() => {
        setFormData(itemToEdit ? { ...itemToEdit } : { id: undefined, code: '', description: '', criterionId: '' });
    }, [itemToEdit, isOpen]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">{itemToEdit ? 'Editar' : 'Añadir'} Indicador de Evaluación (IE)</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="code" value={formData.code} onChange={handleChange} required className="w-full p-2 border rounded-md" placeholder="Código (Ej: I.M.4.1.1.)"/>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full p-2 border rounded-md" placeholder="Descripción del Indicador"/>
                    <select name="criterionId" value={formData.criterionId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white"><option value="">Criterio de Evaluación Asociado</option>{criteria.map(c => <option key={c.id} value={c.id}>{c.code} {c.description.substring(0, 50)}...</option>)}</select>
                    <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Guardar</button></div>
                </form>
            </div>
        </div>
    );
};

// #endregion

interface CurriculumRepositoryPageProps {
    dcds: Dcd[]; onUpdateDcds: (dcds: Dcd[]) => void;
    subjects: Subject[];
    evaluationCriteria: EvaluationCriterion[]; onUpdateEvaluationCriteria: (criteria: EvaluationCriterion[]) => void;
    evaluationIndicators: EvaluationIndicator[]; onUpdateEvaluationIndicators: (indicators: EvaluationIndicator[]) => void;
}

const CurriculumRepositoryPage: React.FC<CurriculumRepositoryPageProps> = (props) => {
    const { dcds, onUpdateDcds, subjects, evaluationCriteria, onUpdateEvaluationCriteria, evaluationIndicators, onUpdateEvaluationIndicators } = props;
    const { user: currentUser } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState<'ce' | 'dcd' | 'ie'>('ce');

    const [isCeModalOpen, setIsCeModalOpen] = useState(false);
    const [isDcdModalOpen, setIsDcdModalOpen] = useState(false);
    const [isIeModalOpen, setIsIeModalOpen] = useState(false);
    const [editingCe, setEditingCe] = useState<EvaluationCriterion | null>(null);
    const [editingDcd, setEditingDcd] = useState<Dcd | null>(null);
    const [editingIe, setEditingIe] = useState<EvaluationIndicator | null>(null);

    const institutionSubjects = useMemo(() => subjects.filter(s => s.institutionId === currentUser?.institutionId), [subjects, currentUser]);
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    const criterionMap = useMemo(() => new Map(evaluationCriteria.map(c => [c.id, c.code])), [evaluationCriteria]);

    // Save Handlers
    const handleSave = (type: 'ce' | 'dcd' | 'ie', data: any) => {
        const institutionId = currentUser!.institutionId!;
        if (type === 'ce') {
            const items = evaluationCriteria; const setItems = onUpdateEvaluationCriteria;
            const newItem = { ...data, id: data.id || `ce-${Date.now()}`, institutionId };
            setItems(data.id ? items.map(i => i.id === data.id ? newItem : i) : [...items, newItem]);
            setIsCeModalOpen(false);
        } else if (type === 'dcd') {
            const items = dcds; const setItems = onUpdateDcds;
            const newItem = { ...data, id: data.id || `dcd-${Date.now()}`, institutionId };
            setItems(data.id ? items.map(i => i.id === data.id ? newItem : i) : [...items, newItem]);
            setIsDcdModalOpen(false);
        } else {
            const items = evaluationIndicators; const setItems = onUpdateEvaluationIndicators;
            const newItem = { ...data, id: data.id || `ie-${Date.now()}`, institutionId };
            setItems(data.id ? items.map(i => i.id === data.id ? newItem : i) : [...items, newItem]);
            setIsIeModalOpen(false);
        }
    };
    
    // Delete Handlers
    const handleDelete = (type: 'ce' | 'dcd' | 'ie', id: string) => {
        if (!window.confirm('¿Seguro que desea eliminar este elemento?')) return;
        if (type === 'ce') onUpdateEvaluationCriteria(evaluationCriteria.filter(i => i.id !== id));
        if (type === 'dcd') onUpdateDcds(dcds.filter(i => i.id !== id));
        if (type === 'ie') onUpdateEvaluationIndicators(evaluationIndicators.filter(i => i.id !== id));
    };

    const TabButton: React.FC<{ tab: 'ce'|'dcd'|'ie', children: React.ReactNode}> = ({ tab, children }) => {
        const isActive = activeTab === tab;
        return <button onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-3 px-4 font-medium text-sm rounded-t-lg ${isActive ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{children}</button>;
    };

    const renderContent = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    {activeTab === 'ce' && <tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asignatura</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nivel</th><th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th></tr>}
                    {activeTab === 'dcd' && <tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Criterio</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asignatura</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nivel</th><th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th></tr>}
                    {activeTab === 'ie' && <tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Criterio</th><th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th></tr>}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {activeTab === 'ce' && evaluationCriteria.map(item => <tr key={item.id}><td className="px-3 py-2.5 text-sm font-mono">{item.code}</td><td className="px-3 py-2.5 text-sm text-slate-700 max-w-lg">{item.description}</td><td className="px-3 py-2.5 text-sm">{subjectMap.get(item.subjectId)}</td><td className="px-3 py-2.5 text-sm">{item.gradeLevel}</td><td className="px-3 py-2.5 text-sm text-right"><button onClick={() => { setEditingCe(item); setIsCeModalOpen(true); }} className="p-1"><EditIcon className="h-5 w-5 text-gray-500 hover:text-blue-600"/></button><button onClick={() => handleDelete('ce', item.id)} className="p-1"><TrashIcon className="h-5 w-5 text-gray-500 hover:text-red-600"/></button></td></tr>)}
                    {activeTab === 'dcd' && dcds.map(item => <tr key={item.id}><td className="px-3 py-2.5 text-sm font-mono">{item.code}</td><td className="px-3 py-2.5 text-sm text-slate-700 max-w-lg">{item.description}</td><td className="px-3 py-2.5 text-sm">{criterionMap.get(item.criterionId)}</td><td className="px-3 py-2.5 text-sm">{subjectMap.get(item.subjectId)}</td><td className="px-3 py-2.5 text-sm">{item.gradeLevel}</td><td className="px-3 py-2.5 text-sm text-right"><button onClick={() => { setEditingDcd(item); setIsDcdModalOpen(true); }} className="p-1"><EditIcon className="h-5 w-5 text-gray-500 hover:text-blue-600"/></button><button onClick={() => handleDelete('dcd', item.id)} className="p-1"><TrashIcon className="h-5 w-5 text-gray-500 hover:text-red-600"/></button></td></tr>)}
                    {activeTab === 'ie' && evaluationIndicators.map(item => <tr key={item.id}><td className="px-3 py-2.5 text-sm font-mono">{item.code}</td><td className="px-3 py-2.5 text-sm text-slate-700 max-w-lg">{item.description}</td><td className="px-3 py-2.5 text-sm">{criterionMap.get(item.criterionId)}</td><td className="px-3 py-2.5 text-sm text-right"><button onClick={() => { setEditingIe(item); setIsIeModalOpen(true); }} className="p-1"><EditIcon className="h-5 w-5 text-gray-500 hover:text-blue-600"/></button><button onClick={() => handleDelete('ie', item.id)} className="p-1"><TrashIcon className="h-5 w-5 text-gray-500 hover:text-red-600"/></button></td></tr>)}
                </tbody>
            </table>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Repositorio Curricular</h2>
                    {activeTab === 'ce' && <button onClick={() => { setEditingCe(null); setIsCeModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><PlusIcon className="h-5 w-5" />Añadir Criterio (CE)</button>}
                    {activeTab === 'dcd' && <button onClick={() => { setEditingDcd(null); setIsDcdModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><PlusIcon className="h-5 w-5" />Añadir Destreza (DCD)</button>}
                    {activeTab === 'ie' && <button onClick={() => { setEditingIe(null); setIsIeModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><PlusIcon className="h-5 w-5" />Añadir Indicador (IE)</button>}
                </div>
                
                <nav className="flex space-x-2 border-b" aria-label="Tabs">
                    <TabButton tab="ce">Criterios de Evaluación (CE)</TabButton>
                    <TabButton tab="dcd">Destrezas (DCD)</TabButton>
                    <TabButton tab="ie">Indicadores de Evaluación (IE)</TabButton>
                </nav>
                
                <div className="mt-6">{renderContent()}</div>
            </div>

            <EvaluationCriterionForm isOpen={isCeModalOpen} onClose={() => setIsCeModalOpen(false)} onSave={(d) => handleSave('ce', d)} itemToEdit={editingCe} subjects={institutionSubjects} />
            <DcdForm isOpen={isDcdModalOpen} onClose={() => setIsDcdModalOpen(false)} onSave={(d) => handleSave('dcd', d)} itemToEdit={editingDcd} subjects={institutionSubjects} criteria={evaluationCriteria} />
            <EvaluationIndicatorForm isOpen={isIeModalOpen} onClose={() => setIsIeModalOpen(false)} onSave={(d) => handleSave('ie', d)} itemToEdit={editingIe} criteria={evaluationCriteria} />
        </div>
    );
};

export default CurriculumRepositoryPage;