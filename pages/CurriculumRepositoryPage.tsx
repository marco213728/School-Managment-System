import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Dcd, Subject, GradeLevel, EvaluationCriterion, EvaluationIndicator, Competency, CurricularInsertion } from '../types';
import { GRADE_LEVELS, COMPETENCIES, CURRICULAR_INSERTIONS } from '../constants';
import { UserContext } from '../contexts/UserContext';
import { PlusIcon, EditIcon, TrashIcon, CloseIcon, UploadIcon } from '../components/icons/Icons';

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
    const [formData, setFormData] = useState({ id: undefined as string | undefined, code: '', description: '', subjectId: '', gradeLevel: 'EGB Superior' as GradeLevel, criterionId: '', competencies: [] as Competency[], curricularInsertions: [] as CurricularInsertion[] });
    useEffect(() => {
        setFormData(itemToEdit ? { ...itemToEdit, curricularInsertions: itemToEdit.curricularInsertions || [] } : { id: undefined, code: '', description: '', subjectId: '', gradeLevel: 'EGB Superior', criterionId: '', competencies: [], curricularInsertions: [] });
    }, [itemToEdit, isOpen]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleCompetencyChange = (c: Competency) => setFormData(p => ({ ...p, competencies: p.competencies.includes(c) ? p.competencies.filter(x => x !== c) : [...p.competencies, c] }));
    const handleCurricularInsertionChange = (c: CurricularInsertion) => setFormData(p => ({ ...p, curricularInsertions: p.curricularInsertions.includes(c) ? p.curricularInsertions.filter(x => x !== c) : [...p.curricularInsertions, c] }));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">{itemToEdit ? 'Editar' : 'Añadir'} Destreza (DCD)</h2>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
                    <input type="text" name="code" value={formData.code} onChange={handleChange} required className="w-full p-2 border rounded-md" placeholder="Código (Ej: M.4.1.1.)"/>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full p-2 border rounded-md" placeholder="Descripción"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="subjectId" value={formData.subjectId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white"><option value="">Asignatura</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                        <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white"><option value="">Nivel</option>{GRADE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                    </div>
                    <select name="criterionId" value={formData.criterionId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white"><option value="">Criterio de Evaluación Asociado</option>{criteria.map(c => <option key={c.id} value={c.id}>{c.code} {c.description.substring(0, 50)}...</option>)}</select>
                    <fieldset><legend className="text-sm font-medium text-gray-700 mb-2">Competencias Priorizadas</legend><div className="flex flex-wrap gap-x-4 gap-y-2">{COMPETENCIES.map(c => <label key={c} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.competencies.includes(c)} onChange={() => handleCompetencyChange(c)}/>{c}</label>)}</div></fieldset>
                    <fieldset><legend className="text-sm font-medium text-gray-700 mb-2">Inserciones Curriculares</legend><div className="flex flex-wrap gap-x-4 gap-y-2">{CURRICULAR_INSERTIONS.map(c => <label key={c} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={formData.curricularInsertions.includes(c)} onChange={() => handleCurricularInsertionChange(c)}/>{c}</label>)}</div></fieldset>
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

// #region Import Modal
interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (type: 'ce' | 'dcd' | 'ie', data: any[]) => void;
}
const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [importType, setImportType] = useState<'ce' | 'dcd' | 'ie'>('ce');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const instructions = {
        ce: "CSV con columnas: code, description, subjectId, gradeLevel",
        dcd: "CSV con columnas: code, description, subjectId, gradeLevel, criterionId, competencies (separadas por '|'), curricularInsertions (separadas por '|')",
        ie: "CSV con columnas: code, description, criterionId",
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleImport = () => {
        if (!file) {
            setError("Por favor, seleccione un archivo CSV.");
            return;
        }
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split('\n').filter(line => line.trim() !== '');
                const headers = lines.shift()?.split(',').map(h => h.trim()) || [];
                const data = lines.map(line => {
                    const values = line.split(',');
                    const obj: any = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index]?.trim();
                    });
                    
                    if (importType === 'dcd') {
                        if (obj.competencies) {
                            obj.competencies = obj.competencies.split('|').map((c: string) => c.trim()) as Competency[];
                        }
                        if (obj.curricularInsertions) {
                             obj.curricularInsertions = obj.curricularInsertions.split('|').map((c: string) => c.trim()) as CurricularInsertion[];
                        }
                    }
                    
                    return obj;
                });
                onImport(importType, data);
                onClose();
            } catch (err) {
                setError("Error al procesar el archivo. Asegúrese de que el formato sea correcto.");
                console.error(err);
            } finally {
                setIsProcessing(false);
            }
        };
        reader.onerror = () => {
            setError("No se pudo leer el archivo.");
            setIsProcessing(false);
        };
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">Importación Masiva de Datos</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Dato a Importar</label>
                        <select value={importType} onChange={(e) => setImportType(e.target.value as any)} className="w-full p-2 border rounded-md bg-white">
                            <option value="ce">Criterios de Evaluación (CE)</option>
                            <option value="dcd">Destrezas con Criterios de Desempeño (DCD)</option>
                            <option value="ie">Indicadores de Evaluación (IE)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Formato Requerido</label>
                        <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded-md font-mono">{instructions[importType]}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Archivo CSV</label>
                        <input type="file" accept=".csv" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                        {file && <p className="text-xs text-gray-500 mt-1">Seleccionado: {file.name}</p>}
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
                <div className="flex justify-end gap-4 pt-6 mt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                    <button type="button" onClick={handleImport} disabled={isProcessing} className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:bg-gray-400">
                        {isProcessing ? 'Procesando...' : 'Importar'}
                    </button>
                </div>
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
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
    
    const handleImportData = (type: 'ce' | 'dcd' | 'ie', data: any[]) => {
        const institutionId = currentUser!.institutionId!;
        const newItems = data.map(item => ({ ...item, id: `${type}-${Date.now()}-${Math.random()}`, institutionId }));

        if (type === 'ce') onUpdateEvaluationCriteria([...evaluationCriteria, ...newItems]);
        if (type === 'dcd') onUpdateDcds([...dcds, ...newItems]);
        if (type === 'ie') onUpdateEvaluationIndicators([...evaluationIndicators, ...newItems]);
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
                    {activeTab === 'dcd' && <tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Metadata Curricular</th><th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th></tr>}
                    {activeTab === 'ie' && <tr><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th><th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Criterio</th><th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th></tr>}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {activeTab === 'ce' && evaluationCriteria.map(item => <tr key={item.id}><td className="px-3 py-2.5 text-sm font-mono">{item.code}</td><td className="px-3 py-2.5 text-sm text-slate-700 max-w-lg">{item.description}</td><td className="px-3 py-2.5 text-sm">{subjectMap.get(item.subjectId)}</td><td className="px-3 py-2.5 text-sm">{item.gradeLevel}</td><td className="px-3 py-2.5 text-sm text-right"><button onClick={() => { setEditingCe(item); setIsCeModalOpen(true); }} className="p-1"><EditIcon className="h-5 w-5 text-gray-500 hover:text-blue-600"/></button><button onClick={() => handleDelete('ce', item.id)} className="p-1"><TrashIcon className="h-5 w-5 text-gray-500 hover:text-red-600"/></button></td></tr>)}
                    {activeTab === 'dcd' && dcds.map(item => <tr key={item.id}><td className="px-3 py-2.5 text-sm font-mono align-top">{item.code}</td><td className="px-3 py-2.5 text-sm text-slate-700 max-w-md align-top">{item.description}</td><td className="px-3 py-2.5 text-xs align-top"><div className="space-y-1.5"><p><strong className="font-semibold">Criterio:</strong> {criterionMap.get(item.criterionId)}</p><p><strong className="font-semibold">Asignatura:</strong> {subjectMap.get(item.subjectId)}</p><p><strong className="font-semibold">Nivel:</strong> {item.gradeLevel}</p><div><strong className="font-semibold block">Competencias:</strong><div className="flex flex-wrap gap-1 mt-0.5">{item.competencies.map(c => <span key={c} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">{c}</span>)}</div></div>{item.curricularInsertions && item.curricularInsertions.length > 0 && <div><strong className="font-semibold block">Inserciones:</strong><div className="flex flex-wrap gap-1 mt-0.5">{item.curricularInsertions.map(c => <span key={c} className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded">{c}</span>)}</div></div>}</div></td><td className="px-3 py-2.5 text-sm text-right align-top"><button onClick={() => { setEditingDcd(item); setIsDcdModalOpen(true); }} className="p-1"><EditIcon className="h-5 w-5 text-gray-500 hover:text-blue-600"/></button><button onClick={() => handleDelete('dcd', item.id)} className="p-1"><TrashIcon className="h-5 w-5 text-gray-500 hover:text-red-600"/></button></td></tr>)}
                    {activeTab === 'ie' && evaluationIndicators.map(item => <tr key={item.id}><td className="px-3 py-2.5 text-sm font-mono">{item.code}</td><td className="px-3 py-2.5 text-sm text-slate-700 max-w-lg">{item.description}</td><td className="px-3 py-2.5 text-sm">{criterionMap.get(item.criterionId)}</td><td className="px-3 py-2.5 text-sm text-right"><button onClick={() => { setEditingIe(item); setIsIeModalOpen(true); }} className="p-1"><EditIcon className="h-5 w-5 text-gray-500 hover:text-blue-600"/></button><button onClick={() => handleDelete('ie', item.id)} className="p-1"><TrashIcon className="h-5 w-5 text-gray-500 hover:text-red-600"/></button></td></tr>)}
                </tbody>
            </table>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Repositorio Curricular</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"><UploadIcon className="h-5 w-5" />Importar Datos</button>
                        {activeTab === 'ce' && <button onClick={() => { setEditingCe(null); setIsCeModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><PlusIcon className="h-5 w-5" />Añadir Criterio (CE)</button>}
                        {activeTab === 'dcd' && <button onClick={() => { setEditingDcd(null); setIsDcdModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><PlusIcon className="h-5 w-5" />Añadir Destreza (DCD)</button>}
                        {activeTab === 'ie' && <button onClick={() => { setEditingIe(null); setIsIeModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"><PlusIcon className="h-5 w-5" />Añadir Indicador (IE)</button>}
                    </div>
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
            <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImportData} />
        </div>
    );
};

export default CurriculumRepositoryPage;