import React, { useState, useContext, useMemo } from 'react';
import { ResourceRepositoryItem, Dcd, Rubric, Subject, User } from '../types';
import { MOCK_REPOSITORY_ITEMS } from '../constants';
import { UserContext } from '../contexts/UserContext';
import ResourceForm from '../components/repository/ResourceForm';
import { PlusIcon, SearchIcon, EditIcon, UsersIcon, CheckCircleIcon } from '../components/icons/Icons';

interface ResourceRepositoryPageProps {
    dcds: Dcd[];
    rubrics: Rubric[];
    subjects: Subject[];
}

const ResourceRepositoryPage: React.FC<ResourceRepositoryPageProps> = ({ dcds, rubrics, subjects }) => {
    const { user } = useContext(UserContext);
    const [resources, setResources] = useState<ResourceRepositoryItem[]>(MOCK_REPOSITORY_ITEMS);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<ResourceRepositoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('All');

    const handleSave = (resource: ResourceRepositoryItem) => {
        if (resources.some(r => r.id === resource.id)) {
            setResources(prev => prev.map(r => r.id === resource.id ? resource : r));
        } else {
            setResources(prev => [...prev, resource]);
        }
        setIsFormOpen(false);
    };
    
    const handleEdit = (res: ResourceRepositoryItem) => {
        setEditingResource(res);
        setIsFormOpen(true);
    };

    const handleDuplicate = (res: ResourceRepositoryItem) => {
        const copy = { 
            ...res, 
            id: `res-${Date.now()}`, 
            title: `${res.title} (Copia)`,
            authorId: user?.id || '',
            clonedFromId: res.id,
            creationDate: new Date().toISOString()
        };
        setResources(prev => [copy, ...prev]);
    };

    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  res.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || res.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [resources, searchTerm, filterType]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Banco de Recursos y Proyectos</h2>
                    <p className="text-sm text-gray-500">Repositorio de actividades reutilizables alineadas al currículo.</p>
                </div>
                <button onClick={() => { setEditingResource(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    <PlusIcon className="h-5 w-5" /> Nuevo Recurso
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4 items-center">
                <div className="relative flex-grow">
                    <input 
                        type="text" 
                        placeholder="Buscar por título, descripción, DCD..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md"
                    />
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border rounded-md w-48">
                    <option value="All">Todos los Tipos</option>
                    <option value="Activity">Actividades</option>
                    <option value="Project">Proyectos</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(res => (
                    <div key={res.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col">
                        <div className="p-5 flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${res.type === 'Project' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {res.type}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(res.creationDate).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{res.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{res.description}</p>
                            
                            <div className="space-y-2">
                                {res.isInterdisciplinary && (
                                    <div className="text-xs bg-orange-50 text-orange-800 p-1 rounded border border-orange-100 text-center font-semibold">
                                        Proyecto Interdisciplinario
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-1">
                                    {res.curricularInsertions?.slice(0, 2).map(ins => (
                                        <span key={ins} className="text-[10px] bg-green-50 text-green-700 px-1 rounded border border-green-100">{ins}</span>
                                    ))}
                                    {res.curricularInsertions && res.curricularInsertions.length > 2 && <span className="text-[10px] text-gray-500">+{res.curricularInsertions.length - 2}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 border-t flex justify-between items-center rounded-b-xl">
                             <div className="text-xs text-gray-500 flex items-center gap-1">
                                {res.dcdIds.length} DCDs vinculadas
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => handleEdit(res)} className="text-xs text-blue-600 hover:underline">Editar</button>
                                <button onClick={() => handleDuplicate(res)} className="text-xs text-primary-600 hover:underline">Clonar</button>
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            {isFormOpen && (
                <ResourceForm 
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                    resourceToEdit={editingResource}
                    currentUser={user}
                    dcds={dcds}
                    rubrics={rubrics}
                    subjects={subjects}
                />
            )}
        </div>
    );
};

export default ResourceRepositoryPage;