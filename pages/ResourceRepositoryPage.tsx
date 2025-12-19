
import React, { useState, useContext, useMemo } from 'react';
import { ResourceRepositoryItem, Dcd, Rubric, Subject, User, MicroPlan, Class, Role } from '../types';
import { MOCK_REPOSITORY_ITEMS } from '../constants';
import { UserContext } from '../contexts/UserContext';
import ResourceForm from '../components/repository/ResourceForm';
import { PlusIcon, SearchIcon, EditIcon, UsersIcon, CheckCircleIcon, SparklesIcon, ArchiveBoxIcon, TicketIcon, AssessmentIcon, GraduationCapIcon } from '../components/icons/Icons';
import LessonPlanAssistant from '../components/repository/LessonPlanAssistant';
import RubricGeneratorAssistant from '../components/repository/RubricGeneratorAssistant';
import ExitTicketGenerator from '../components/repository/ExitTicketGenerator'; 
import AssessmentGenerator from '../components/repository/AssessmentGenerator'; 
import ProjectGeneratorAssistant from '../components/repository/ProjectGeneratorAssistant';

interface ResourceRepositoryPageProps {
    dcds: Dcd[];
    rubrics: Rubric[];
    onUpdateRubrics: (rubrics: Rubric[]) => void;
    subjects: Subject[];
    microPlans?: MicroPlan[];
    classes?: Class[];
}

const ResourceRepositoryPage: React.FC<ResourceRepositoryPageProps> = ({ dcds, rubrics, onUpdateRubrics, subjects, microPlans = [], classes = [] }) => {
    const { user } = useContext(UserContext);
    const [resources, setResources] = useState<ResourceRepositoryItem[]>(MOCK_REPOSITORY_ITEMS);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<ResourceRepositoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('All');
    
    // AI Modal States
    const [isAiPlanOpen, setIsAiPlanOpen] = useState(false);
    const [isAiRubricOpen, setIsAiRubricOpen] = useState(false);
    const [isAiTicketOpen, setIsAiTicketOpen] = useState(false);
    const [isAiAssessmentOpen, setIsAiAssessmentOpen] = useState(false);
    const [isAiProjectOpen, setIsAiProjectOpen] = useState(false);

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
        const copy: ResourceRepositoryItem = { 
            ...res, 
            id: `res-${Date.now()}`, 
            title: `${res.title} (Copia)`,
            authorId: user?.id || '',
            authorName: user?.name,
            clonedFromId: res.id,
            creationDate: new Date().toISOString(),
            shared: false // Duplicates are local by default
        };
        setResources(prev => [copy, ...prev]);
    };

    const handleSaveNewRubric = (newRubric: Rubric) => {
        onUpdateRubrics([...rubrics, newRubric]);
        alert('Rúbrica guardada exitosamente. Ahora está disponible para asignar a actividades.');
    };

    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            // Visibility Logic:
            // 1. Super Admin sees all.
            // 2. Regular user sees Shared items OR their own institution's items.
            const isSuperAdmin = user?.role === Role.SuperAdmin;
            const isMyResource = res.authorId === user?.id || res.institutionId === user?.institutionId;
            const isShared = res.shared === true;

            const canView = isSuperAdmin || isMyResource || isShared;
            if (!canView) return false;

            const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  res.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || res.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [resources, searchTerm, filterType, user]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {user?.role === Role.SuperAdmin ? 'Banco Global de Recursos Educativos' : 'Banco de Recursos y Proyectos'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {user?.role === Role.SuperAdmin 
                            ? 'Curación y gestión de recursos compartidos por toda la red Amauta.' 
                            : 'Repositorio de actividades reutilizables alineadas al currículo.'}
                    </p>
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
                                placeholder="Buscar por título, descripción, autor..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-md"
                            />
                            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border rounded-md w-48 text-sm">
                            <option value="All">Todos los Tipos</option>
                            <option value="Activity">Actividades</option>
                            <option value="Project">Proyectos</option>
                        </select>
                        <button onClick={() => { setEditingResource(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 whitespace-nowrap text-sm">
                            <PlusIcon className="h-5 w-5" /> Nuevo Recurso
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map(res => {
                            const isGlobal = res.shared && res.institutionId !== user?.institutionId;
                            return (
                                <div key={res.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
                                    {isGlobal && (
                                        <div className="absolute top-0 right-0">
                                            <div className="bg-orange-500 text-white text-[9px] font-bold px-2 py-1 transform rotate-0 rounded-bl-lg shadow-sm flex items-center gap-1">
                                                <SparklesIcon className="h-2 w-2" /> GLOBAL
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-5 flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${res.type === 'Project' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {res.type}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{new Date(res.creationDate).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">{res.title}</h3>
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

                                    {/* Author Indicator */}
                                    <div className="px-5 py-2 bg-slate-50 border-t flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700">
                                            {res.authorName?.charAt(0) || 'A'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-bold text-gray-700 truncate">{res.authorName || 'Autor Desconocido'}</p>
                                            <p className="text-[9px] text-gray-500 truncate">{res.authorInstitutionName || 'Institución'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-3 border-t flex justify-between items-center rounded-b-xl">
                                         <div className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                                            {res.dcdIds.length} DCDs vinculadas
                                         </div>
                                         <div className="flex gap-2">
                                            {(user?.id === res.authorId || user?.role === Role.SuperAdmin) && (
                                                <button onClick={() => handleEdit(res)} className="text-[11px] text-blue-600 font-bold hover:underline">Editar</button>
                                            )}
                                            <button onClick={() => handleDuplicate(res)} className="text-[11px] text-primary-600 font-bold hover:underline">Clonar</button>
                                         </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                        onClick={() => setIsAiPlanOpen(true)}
                        className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <SparklesIcon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Asistente de Clase con IA</h3>
                        <p className="text-purple-100 text-sm">
                            Sincroniza tus DCDs de la planificación microcurricular para generar guías de clase estructuradas.
                        </p>
                    </div>

                    <div 
                        onClick={() => setIsAiProjectOpen(true)}
                        className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <ArchiveBoxIcon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Diseñador de Proyectos ABP</h3>
                        <p className="text-blue-100 text-sm">
                            Genera la estructura completa de proyectos interdisciplinarios con fases, objetivos y producto final.
                        </p>
                    </div>

                    <div 
                        onClick={() => setIsAiRubricOpen(true)}
                        className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <CheckCircleIcon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Generador de Rúbricas</h3>
                        <p className="text-emerald-100 text-sm">
                            Crea matrices de evaluación detalladas al instante para cualquier actividad o proyecto.
                        </p>
                    </div>

                    <div 
                        onClick={() => setIsAiTicketOpen(true)}
                        className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <TicketIcon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Generador de Boletos de salida</h3>
                        <p className="text-purple-100 text-sm">
                            Crea evaluaciones rápidas al final de la lección para verificar la comprensión de los estudiantes.
                        </p>
                    </div>

                    <div 
                        onClick={() => setIsAiAssessmentOpen(true)}
                        className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <AssessmentIcon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Creador de Evaluaciones</h3>
                        <p className="text-indigo-100 text-sm">
                            Diseña pruebas diagnósticas, formativas o sumativas alineadas a DCDs, con soporte DUA y NEE.
                        </p>
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
                    microPlans={microPlans}
                    subjects={subjects}
                    classes={classes}
                    allDcds={dcds}
                />
            )}

            {isAiProjectOpen && (
                <ProjectGeneratorAssistant
                    isOpen={isAiProjectOpen}
                    onClose={() => setIsAiProjectOpen(false)}
                    onSaveProject={(res) => {
                        handleSave(res);
                        setViewMode('resources');
                    }}
                    currentUser={user}
                    subjects={subjects}
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

            {isAiTicketOpen && (
                <ExitTicketGenerator
                    isOpen={isAiTicketOpen}
                    onClose={() => setIsAiTicketOpen(false)}
                    onSave={(res) => {
                        handleSave(res);
                        setViewMode('resources');
                    }}
                    currentUser={user}
                />
            )}

            {isAiAssessmentOpen && (
                <AssessmentGenerator
                    isOpen={isAiAssessmentOpen}
                    onClose={() => setIsAiAssessmentOpen(false)}
                    onSave={(res) => {
                        handleSave(res);
                        setViewMode('resources');
                    }}
                    currentUser={user}
                    dcds={dcds}
                    subjects={subjects}
                />
            )}
        </div>
    );
};

export default ResourceRepositoryPage;
