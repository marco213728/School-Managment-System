
import React, { useState, useEffect } from 'react';
import { Institution, User, Role, Dcd, EvaluationCriterion, EvaluationIndicator, Subject } from '../types';
import { PlusIcon, EditIcon, TrashIcon, ChartBarIcon, UsersIcon, SparklesIcon, ClipboardDocumentCheckIcon, ArchiveBoxIcon } from '../components/icons/Icons';
import InstitutionForm from '../components/management/InstitutionForm';
import EducationalQualityAudit from '../components/superadmin/EducationalQualityAudit';
import PeiAudit from '../components/superadmin/PeiAudit';
import ResourceRepositoryPage from './ResourceRepositoryPage';
import CurriculumRepositoryPage from './CurriculumRepositoryPage';
import { saveDocument, deleteDocument } from '../lib/firebase';

interface SuperAdminPageProps {
    institutions: Institution[];
    onUpdateInstitutions?: (institutions: Institution[]) => void;
    users: User[];
    // Estas props deben venir de App.tsx
    dcds: Dcd[];
    evaluationCriteria: EvaluationCriterion[];
    evaluationIndicators: EvaluationIndicator[];
    subjects: Subject[];
    onUpdateDcds: (items: Dcd[]) => void;
    onUpdateEvaluationCriteria: (items: EvaluationCriterion[]) => void;
    onUpdateEvaluationIndicators: (items: EvaluationIndicator[]) => void;
}

const SuperAdminPage: React.FC<SuperAdminPageProps> = (props) => {
    const { 
        institutions: initialInstitutions, onUpdateInstitutions, users, 
        dcds, evaluationCriteria, evaluationIndicators, subjects,
        onUpdateDcds, onUpdateEvaluationCriteria, onUpdateEvaluationIndicators 
    } = props;
    
    const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions);
    const [view, setView] = useState<'institutions' | 'quality' | 'resources' | 'pei_audit' | 'curriculum_master'>('institutions');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

    useEffect(() => {
        setInstitutions(initialInstitutions);
    }, [initialInstitutions]);

    const handleAddNew = () => {
        setEditingInstitution(null);
        setIsModalOpen(true);
    };

    const handleEdit = (institution: Institution) => {
        setEditingInstitution(institution);
        setIsModalOpen(true);
    };

    const handleDelete = async (institutionId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta institución? Esta acción no se puede deshacer.')) {
            const updated = institutions.filter(inst => inst.id !== institutionId);
            setInstitutions(updated);
            if (onUpdateInstitutions) onUpdateInstitutions(updated);
            await deleteDocument('institutions', institutionId);
        }
    };

    const handleSave = async (institutionData: Omit<Institution, 'id'> & { id?: string }) => {
        let savedInst: Institution;
        let updatedList: Institution[];
        if (institutionData.id) {
            const prevInst = institutions.find(inst => inst.id === institutionData.id);
            savedInst = { ...prevInst, ...institutionData } as Institution;
            updatedList = institutions.map(inst => inst.id === institutionData.id ? savedInst : inst);
        } else {
            savedInst = {
                ...institutionData,
                id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
                logoUrl: institutionData.logoUrl || 'https://placehold.co/150x150/cccccc/333333?text=Logo',
                activeModules: institutionData.activeModules || { dece: false, health: false },
            } as Institution;
            updatedList = [...institutions, savedInst];
        }
        setInstitutions(updatedList);
        if (onUpdateInstitutions) onUpdateInstitutions(updatedList);
        await saveDocument('institutions', savedInst.id, savedInst);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Consola de Control Global</h2>
                <nav className="flex bg-gray-200 p-1 rounded-xl overflow-x-auto no-scrollbar">
                    <button onClick={() => setView('institutions')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap transition-all ${view === 'institutions' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}>
                        <UsersIcon className="h-4 w-4"/> Instituciones
                    </button>
                    <button onClick={() => setView('curriculum_master')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap transition-all ${view === 'curriculum_master' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}>
                        <ArchiveBoxIcon className="h-4 w-4"/> Malla Maestra
                    </button>
                    <button onClick={() => setView('pei_audit')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap transition-all ${view === 'pei_audit' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}>
                        <ClipboardDocumentCheckIcon className="h-4 w-4"/> Auditoría PEI
                    </button>
                    <button onClick={() => setView('quality')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap transition-all ${view === 'quality' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}>
                        <ChartBarIcon className="h-4 w-4"/> Estándares
                    </button>
                    <button onClick={() => setView('resources')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap transition-all ${view === 'resources' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}>
                        <SparklesIcon className="h-4 w-4"/> Banco Global
                    </button>
                </nav>
            </div>

            {view === 'institutions' && (
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wide">Centros Educativos Federados</h3>
                        <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-black rounded-xl hover:bg-primary-700 shadow-lg text-sm">
                            <PlusIcon className="h-5 w-5" />
                            Nueva Institución
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Contacto</th>
                                    <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest">AMIE</th>
                                    <th className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {institutions.map(inst => (
                                    <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full object-cover border" src={inst.logoUrl} alt={`Logo de ${inst.name}`} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{inst.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{inst.contact.email}</div>
                                            <div className="font-mono text-xs">{inst.contact.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono font-bold uppercase">{inst.codeAMIE}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(inst)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"><EditIcon className="h-5 w-5" /></button>
                                            <button onClick={() => handleDelete(inst.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'curriculum_master' && (
                <div className="animate-fade-in">
                    <CurriculumRepositoryPage 
                        dcds={dcds}
                        evaluationCriteria={evaluationCriteria}
                        evaluationIndicators={evaluationIndicators}
                        subjects={subjects}
                        onUpdateDcds={onUpdateDcds}
                        onUpdateEvaluationCriteria={onUpdateEvaluationCriteria}
                        onUpdateEvaluationIndicators={onUpdateEvaluationIndicators}
                        readOnly={false} // El SuperAdmin sí puede editar
                    />
                </div>
            )}

            {view === 'pei_audit' && <PeiAudit />}

            {view === 'quality' && <EducationalQualityAudit institutions={institutions} />}

            {view === 'resources' && (
                <div className="animate-fade-in">
                    <ResourceRepositoryPage 
                        dcds={dcds} 
                        rubrics={[]} 
                        onUpdateRubrics={() => {}} 
                        subjects={subjects} 
                    />
                </div>
            )}

            {isModalOpen && (
                <InstitutionForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    institutionToEdit={editingInstitution}
                    allUsers={users}
                />
            )}
        </div>
    );
};

export default SuperAdminPage;
