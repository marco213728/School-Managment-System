
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Dcd, Subject, GradeLevel, EvaluationCriterion, EvaluationIndicator, Competency, CurricularInsertion } from '../types';
import { GRADE_LEVELS, COMPETENCIES, CURRICULAR_INSERTIONS } from '../constants';
import { UserContext } from '../contexts/UserContext';
import { PlusIcon, EditIcon, TrashIcon, CloseIcon, UploadIcon, SearchIcon } from '../components/icons/Icons';

// #region FORMS (Internos para gestión)
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
    const [formData, setFormData] = useState({ id: undefined as string | undefined, code: '', description: '', subjectId: '', gradeLevel: 'EGB Superior' as GradeLevel, criterionId: '', competencies: [] as Competency[], curricularInsertions: [] as CurricularInsertion[], isDisaggregated: false, refCode: '' });
    useEffect(() => {
        setFormData(itemToEdit ? { ...itemToEdit, curricularInsertions: itemToEdit.curricularInsertions || [], isDisaggregated: itemToEdit.isDisaggregated || false, refCode: itemToEdit.refCode || '' } : { id: undefined, code: '', description: '', subjectId: '', gradeLevel: 'EGB Superior', criterionId: '', competencies: [], curricularInsertions: [], isDisaggregated: false, refCode: '' });
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
                    <div className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <input type="checkbox" id="isDisaggregated" name="isDisaggregated" checked={formData.isDisaggregated} onChange={(e) => setFormData(p => ({ ...p, isDisaggregated: e.target.checked }))} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                        <label htmlFor="isDisaggregated" className="ml-2 block text-sm text-gray-900">Es una destreza desagregada</label>
                    </div>
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

interface ImportModalProps {
    isOpen: boolean; onClose: () => void; onImport: (type: 'ce' | 'dcd' | 'ie', data: any[]) => void;
}
const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [importType, setImportType] = useState<'ce' | 'dcd' | 'ie'>('ce');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    if (!isOpen) return null;
    const handleImport = () => {
        if (!file) return;
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const headers = lines.shift()?.split(',').map(h => h.trim()) || [];
            const data = lines.map(line => {
                const values = line.split(',');
                const obj: any = {};
                headers.forEach((h, i) => obj[h] = values[i]?.trim());
                return obj;
            });
            onImport(importType, data);
            setIsProcessing(false);
            onClose();
        };
        reader.readAsText(file);
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">Importación Masiva</h2>
                <select value={importType} onChange={(e) => setImportType(e.target.value as any)} className="w-full p-2 border rounded-md mb-4">
                    <option value="ce">Criterios (CE)</option>
                    <option value="dcd">Destrezas (DCD)</option>
                    <option value="ie">Indicadores (IE)</option>
                </select>
                <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full mb-4" />
                <div className="flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button><button onClick={handleImport} disabled={!file || isProcessing} className="px-4 py-2 bg-primary-600 text-white rounded">Importar</button></div>
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
    readOnly?: boolean; // Prop para modo referencial
}

const CurriculumRepositoryPage: React.FC<CurriculumRepositoryPageProps> = (props) => {
    const { dcds, onUpdateDcds, subjects, evaluationCriteria, onUpdateEvaluationCriteria, evaluationIndicators, onUpdateEvaluationIndicators, readOnly = false } = props;
    const { user: currentUser } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState<'ce' | 'dcd' | 'ie'>('ce');
    const [searchTerm, setSearchTerm] = useState('');

    const [isCeModalOpen, setIsCeModalOpen] = useState(false);
    const [isDcdModalOpen, setIsDcdModalOpen] = useState(false);
    const [isIeModalOpen, setIsIeModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    const criterionMap = useMemo(() => new Map(evaluationCriteria.map(c => [c.id, c.code])), [evaluationCriteria]);

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (activeTab === 'ce') return evaluationCriteria.filter(i => i.code.toLowerCase().includes(term) || i.description.toLowerCase().includes(term));
        if (activeTab === 'dcd') return dcds.filter(i => i.code.toLowerCase().includes(term) || i.description.toLowerCase().includes(term));
        return evaluationIndicators.filter(i => i.code.toLowerCase().includes(term) || i.description.toLowerCase().includes(term));
    }, [activeTab, evaluationCriteria, dcds, evaluationIndicators, searchTerm]);

    const handleSave = (type: 'ce' | 'dcd' | 'ie', data: any) => {
        const institutionId = currentUser!.institutionId || 'GLOBAL';
        const newItem = { ...data, id: data.id || `${type}-${Date.now()}`, institutionId };
        if (type === 'ce') onUpdateEvaluationCriteria(data.id ? evaluationCriteria.map(i => i.id === data.id ? newItem : i) : [...evaluationCriteria, newItem]);
        else if (type === 'dcd') onUpdateDcds(data.id ? dcds.map(i => i.id === data.id ? newItem : i) : [...dcds, newItem]);
        else onUpdateEvaluationIndicators(data.id ? evaluationIndicators.map(i => i.id === data.id ? newItem : i) : [...evaluationIndicators, newItem]);
    };
    
    const handleDelete = (type: 'ce' | 'dcd' | 'ie', id: string) => {
        if (!window.confirm('¿Seguro que desea eliminar este elemento?')) return;
        if (type === 'ce') onUpdateEvaluationCriteria(evaluationCriteria.filter(i => i.id !== id));
        if (type === 'dcd') onUpdateDcds(dcds.filter(i => i.id !== id));
        if (type === 'ie') onUpdateEvaluationIndicators(evaluationIndicators.filter(i => i.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{readOnly ? 'Consulta de Malla Curricular' : 'Repositorio Curricular Maestro'}</h2>
                        <p className="text-sm text-gray-500">{readOnly ? 'Base de datos referencial de destrezas e indicadores.' : 'Gestión global de contenidos curriculares para todas las sedes.'}</p>
                    </div>
                    {!readOnly && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold"><UploadIcon className="h-4 w-4" />Importar</button>
                            <button onClick={() => { setEditingItem(null); if(activeTab==='ce') setIsCeModalOpen(true); else if(activeTab==='dcd') setIsDcdModalOpen(true); else setIsIeModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-semibold"><PlusIcon className="h-4 w-4" />Nuevo</button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <nav className="flex bg-gray-100 p-1 rounded-lg self-start">
                        <button onClick={() => setActiveTab('ce')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'ce' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}>Criterios (CE)</button>
                        <button onClick={() => setActiveTab('dcd')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'dcd' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}>Destrezas (DCD)</button>
                        <button onClick={() => setActiveTab('ie')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'ie' ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}>Indicadores (IE)</button>
                    </nav>
                    <div className="relative flex-grow">
                        <input type="text" placeholder="Buscar por código o descripción..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm" />
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Código</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Descripción</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">{activeTab === 'ie' ? 'Criterio Ref.' : 'Asignatura'}</th>
                                {!readOnly && <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono font-bold text-primary-700">{item.code}</td>
                                    <td className="px-4 py-3 text-gray-700 max-w-xl">{item.description}</td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {activeTab === 'ie' ? criterionMap.get(item.criterionId) : subjectMap.get(item.subjectId)}
                                    </td>
                                    {!readOnly && (
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button onClick={() => { setEditingItem(item); if(activeTab==='ce') setIsCeModalOpen(true); else if(activeTab==='dcd') setIsDcdModalOpen(true); else setIsIeModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><EditIcon className="h-4 w-4"/></button>
                                            <button onClick={() => handleDelete(activeTab, item.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><TrashIcon className="h-4 w-4"/></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modales solo se activan si no es readOnly */}
            {!readOnly && (
                <>
                    <EvaluationCriterionForm isOpen={isCeModalOpen} onClose={() => setIsCeModalOpen(false)} onSave={d => handleSave('ce', d)} itemToEdit={editingItem} subjects={subjects} />
                    <DcdForm isOpen={isDcdModalOpen} onClose={() => setIsDcdModalOpen(false)} onSave={d => handleSave('dcd', d)} itemToEdit={editingItem} subjects={subjects} criteria={evaluationCriteria} />
                    <EvaluationIndicatorForm isOpen={isIeModalOpen} onClose={() => setIsIeModalOpen(false)} onSave={d => handleSave('ie', d)} itemToEdit={editingItem} criteria={evaluationCriteria} />
                    <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleSave} />
                </>
            )}
        </div>
    );
};

export default CurriculumRepositoryPage;
