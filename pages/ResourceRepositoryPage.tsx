import React, { useState, useContext, useMemo } from 'react';
import { ResourceRepositoryItem, Dcd, Rubric, Subject, User } from '../types';
import { MOCK_REPOSITORY_ITEMS } from '../constants';
import { UserContext } from '../contexts/UserContext';
import ResourceForm from '../components/repository/ResourceForm';
import { PlusIcon, SearchIcon, EditIcon, UsersIcon, CheckCircleIcon, SparklesIcon, ArchiveBoxIcon } from '../components/icons/Icons';
import LessonPlanAssistant from '../components/repository/LessonPlanAssistant';
import RubricGeneratorAssistant from '../components/repository/RubricGeneratorAssistant'; // Import

interface ResourceRepositoryPageProps {
    dcds: Dcd[];
    rubrics: Rubric[];
    onUpdateRubrics: (rubrics: Rubric[]) => void; // Add this prop
    subjects: Subject[];
}

const ResourceRepositoryPage: React.FC<ResourceRepositoryPageProps> = ({ dcds, rubrics, onUpdateRubrics, subjects }) => {
    const { user } = useContext(UserContext);
    const [resources, setResources] = useState<ResourceRepositoryItem[]>(MOCK_REPOSITORY_ITEMS);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<ResourceRepositoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('All');
    
    // AI Modal States
    const [isAiPlanOpen, setIsAiPlanOpen] = useState(false);
    const [isAiRubricOpen, setIsAiRubricOpen] = useState(false); // State for Rubric Generator

    const [viewMode, setViewMode] = useState<'resources' | 'ai_tools'>('resources');

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

    const handleSaveNewRubric = (newRubric: Rubric) => {
        onUpdateRubrics([...rubrics, newRubric]);
        alert('Rúbrica guardada exitosamente. Ahora está disponible para asignar a actividades.');
        // Optionally switch view or do something else
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
                <div className="flex gap-2">
                     <button onClick={() => setViewMode('resources')} className={`px-4 py-2 rounded-md font-medium text-sm ${viewMode === 'resources' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Explorar Recursos
                    </button>
                    <button onClick={() => setViewMode('ai_tools')} className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-1 ${viewMode === 'ai_tools' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <SparklesIcon className="h-4 w-4"/> Herramientas IA
                    </button>
                </div>
            </div>

            {viewMode === 'resources' ? (
                <>
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
                        <button onClick={() => { setEditingResource(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 whitespace-nowrap">
                            <PlusIcon className="h-5 w-5" /> Nuevo Recurso
                        </button>
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
                </>
            ) : (
                /* AI TOOLS SECTION */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                        onClick={() => setIsAiPlanOpen(true)}
                        className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <SparklesIcon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Asistente de Planificación</h3>
                        <p className="text-purple-100 text-sm">
                            Genera planes de clase completos, estructurados con inicio, desarrollo y cierre, alineados a tu tema y nivel educativo.
                        </p>
                        <div className="mt-4 text-xs font-semibold bg-white/20 inline-block px-2 py-1 rounded">
                            Potenciado por Gemini AI
                        </div>
                    </div>

                    <div 
                        onClick={() => setIsAiRubricOpen(true)}
                        className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <ArchiveBoxIcon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Generador de Rúbricas</h3>
                        <p className="text-emerald-100 text-sm">
                            Crea matrices de evaluación detalladas al instante. Define criterios, niveles y descripciones con ayuda de IA.
                        </p>
                        <div className="mt-4 text-xs font-semibold bg-white/20 inline-block px-2 py-1 rounded">
                            Potenciado por Gemini AI
                        </div>
                    </div>
                     <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center text-gray-400">
                        <span className="text-2xl font-bold mb-2">Creador de Evaluaciones</span>
                        <span className="text-xs">Próximamente</span>
                    </div>
                </div>
            )}

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
            
            {isAiPlanOpen && (
                <LessonPlanAssistant 
                    isOpen={isAiPlanOpen}
                    onClose={() => setIsAiPlanOpen(false)}
                    onSaveToRepository={(res) => {
                        handleSave(res);
                        setViewMode('resources'); 
                    }}
                    currentUser={user}
                />
            )}

            {isAiRubricOpen && (
                <RubricGeneratorAssistant
                    isOpen={isAiRubricOpen}
                    onClose={() => setIsAiRubricOpen(false)}
                    onSaveRubric={handleSaveNewRubric}
                    currentUser={user}
                />
            )}
        </div>
    );
};

export default ResourceRepositoryPage;