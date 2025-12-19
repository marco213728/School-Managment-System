
import React, { useState } from 'react';
import { Institution, User, Role } from '../types';
import { PlusIcon, EditIcon, TrashIcon, ChartBarIcon, UsersIcon, SparklesIcon, ClipboardDocumentCheckIcon } from '../components/icons/Icons';
import InstitutionForm from '../components/management/InstitutionForm';
import EducationalQualityAudit from '../components/superadmin/EducationalQualityAudit';
import PeiAudit from '../components/superadmin/PeiAudit';
import ResourceRepositoryPage from './ResourceRepositoryPage';

interface SuperAdminPageProps {
    institutions: Institution[];
    users: User[];
}

const SuperAdminPage: React.FC<SuperAdminPageProps> = ({ institutions: initialInstitutions, users }) => {
    const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions);
    const [view, setView] = useState<'institutions' | 'quality' | 'resources' | 'pei_audit'>('institutions');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

    const handleAddNew = () => {
        setEditingInstitution(null);
        setIsModalOpen(true);
    };

    const handleEdit = (institution: Institution) => {
        setEditingInstitution(institution);
        setIsModalOpen(true);
    };

    const handleDelete = (institutionId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta institución? Esta acción no se puede deshacer.')) {
            setInstitutions(prev => prev.filter(inst => inst.id !== institutionId));
        }
    };

    const handleSave = (institutionData: Omit<Institution, 'id'> & { id?: string }) => {
        if (institutionData.id) {
            setInstitutions(prev => prev.map(inst => 
                inst.id === institutionData.id 
                ? { ...inst, ...institutionData } as Institution 
                : inst
            ));
        } else {
            const newInstitution: Institution = {
                ...institutionData,
                id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                logoUrl: institutionData.logoUrl || 'https://placehold.co/150x150/cccccc/333333?text=Logo',
                activeModules: institutionData.activeModules || { dece: false, health: false },
            } as Institution;
            setInstitutions(prev => [...prev, newInstitution]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-800">Panel Central de Control</h2>
                <nav className="flex bg-gray-200 p-1 rounded-lg">
                    <button 
                        onClick={() => setView('institutions')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${view === 'institutions' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}
                    >
                        <UsersIcon className="h-4 w-4"/> Instituciones
                    </button>
                    <button 
                        onClick={() => setView('pei_audit')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${view === 'pei_audit' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}
                    >
                        <ClipboardDocumentCheckIcon className="h-4 w-4"/> Auditoría PEI
                    </button>
                    <button 
                        onClick={() => setView('quality')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${view === 'quality' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}
                    >
                        <ChartBarIcon className="h-4 w-4"/> Estándares
                    </button>
                    <button 
                        onClick={() => setView('resources')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${view === 'resources' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'}`}
                    >
                        <SparklesIcon className="h-4 w-4"/> Banco Global
                    </button>
                </nav>
            </div>

            {view === 'institutions' && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-700">Listado Maestro de Centros Educativos</h3>
                        <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                            <PlusIcon className="h-5 w-5" />
                            Nueva Institución
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {institutions.map(inst => (
                                    <tr key={inst.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full object-cover" src={inst.logoUrl} alt={`Logo de ${inst.name}`} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{inst.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{inst.contact.email}</div>
                                            <div>{inst.contact.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{inst.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(inst)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100" aria-label={`Editar ${inst.name}`}>
                                                <EditIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleDelete(inst.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100" aria-label={`Eliminar ${inst.name}`}>
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'pei_audit' && (
                <PeiAudit />
            )}

            {view === 'quality' && (
                <EducationalQualityAudit institutions={institutions} />
            )}

            {view === 'resources' && (
                <div className="animate-fade-in">
                    <ResourceRepositoryPage 
                        dcds={[]} 
                        rubrics={[]} 
                        onUpdateRubrics={() => {}} 
                        subjects={[]} 
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
