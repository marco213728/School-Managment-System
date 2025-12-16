
import React, { useState, useContext, useMemo } from 'react';
import { ResourceRepositoryItem, Dcd, Rubric, Subject, User } from '../types';
import { MOCK_REPOSITORY_ITEMS, GRADE_LEVELS, AREAS_OF_KNOWLEDGE } from '../constants';
import { UserContext } from '../contexts/UserContext';
import ResourceForm from '../components/repository/ResourceForm';
import { PlusIcon, SearchIcon, EditIcon, UsersIcon, CheckCircleIcon, SparklesIcon, ArchiveBoxIcon, TicketIcon, AssessmentIcon, DownloadIcon } from '../components/icons/Icons';
import LessonPlanAssistant from '../components/repository/LessonPlanAssistant';
import RubricGeneratorAssistant from '../components/repository/RubricGeneratorAssistant';
import ExitTicketGenerator from '../components/repository/ExitTicketGenerator'; 
import AssessmentGenerator from '../components/repository/AssessmentGenerator'; 

interface ResourceRepositoryPageProps {
    dcds: Dcd[];
    rubrics: Rubric[];
    onUpdateRubrics: (rubrics: Rubric[]) => void;
    subjects: Subject[];
}

const ResourceRepositoryPage: React.FC<ResourceRepositoryPageProps> = ({ dcds, rubrics, onUpdateRubrics, subjects }) => {
    const { user } = useContext(UserContext);
    const [resources, setResources] = useState<ResourceRepositoryItem[]>(MOCK_REPOSITORY_ITEMS);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<ResourceRepositoryItem | null>(null);
    
    // FILTERS & SORT
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('All');
    const [filterGrade, setFilterGrade] = useState<string>('All');
    const [filterArea, setFilterArea] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
    
    // AI Modal States
    const [isAiPlanOpen, setIsAiPlanOpen] = useState(false);
    const [isAiRubricOpen, setIsAiRubricOpen] = useState(false);
    const [isAiTicketOpen, setIsAiTicketOpen] = useState(false);
    const [isAiAssessmentOpen, setIsAiAssessmentOpen] = useState(false); 

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
    };

    const filteredResources = useMemo(() => {
        let filtered = resources.filter(res => {
            const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  res.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || res.type === filterType;
            const matchesGrade = filterGrade === 'All' || res.gradeLevel === filterGrade;
            const matchesArea = filterArea === 'All' || res.areaOfKnowledge === filterArea;
            
            return matchesSearch && matchesType && matchesGrade && matchesArea;
        });

        if (sortBy === 'date') {
            filtered.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        } else {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }
        
        return filtered;
    }, [resources, searchTerm, filterType, filterGrade, filterArea, sortBy]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                    {/* FILTERS BAR */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-grow w-full">
                            <input 
                                type="text" 
                                placeholder="Buscar por título, descripción, DCD..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-md"
                            />
                            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        
                        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="p-2 border rounded-md text-sm min-w-[120px]">
                                <option value="All">Nivel: Todos</option>
                                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>

                            <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="p-2 border rounded-md text-sm min-w-[140px]">
                                <option value="All">Área: Todas</option>
                                {AREAS_OF_KNOWLEDGE.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>

                            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border rounded-md text-sm min-w-[120px]">
                                <option value="All">Tipo: Todos</option>
                                <option value="Activity">Actividades</option>
                                <option value="Project">Proyectos</option>
                            </select>

                             <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="p-2 border rounded-md text-sm">
                                <option value="date">Más Recientes</option>
                                <option value="title">A-Z</option>
                            </select>
                        </div>
                        
                        <button onClick={() => { setEditingResource(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 whitespace-nowrap">
                            <PlusIcon className="h-5 w-5" /> Nuevo Recurso
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredResources.map(res => (
                            <div key={res.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col overflow-hidden h-full group">
                                {/* Card Image */}
                                <div className="h-32 w-full bg-gray-200 relative overflow-hidden">
                                    <img 
                                        src={res.coverImageUrl || `https://placehold.co/800x450/e2e8f0/64748b?text=${res.type}`} 
                                        alt="Cover" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 left-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm ${res.type === 'Project' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {res.type}
                                        </span>
                                    </div>
                                    {res.areaOfKnowledge && (
                                        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-tl-lg">
                                            {res.areaOfKnowledge}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 flex-grow flex flex-col">
                                    <h3 className="text-md font-bold text-gray-800 mb-1 line-clamp-2 leading-tight">{res.title}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{res.gradeLevel || res.level}</p>
                                    <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-grow">{res.description}</p>
                                    
                                    <div className="space-y-2 mt-auto">
                                        {res.attachments && res.attachments.length > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 p-1.5 rounded border">
                                                <DownloadIcon className="h-3 w-3" />
                                                <span className="font-semibold">{res.attachments.length}</span> Adjuntos disponibles
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-1">
                                            {res.curricularInsertions?.slice(0, 2).map(ins => (
                                                <span key={ins} className="text-[9px] bg-green-50 text-green-700 px-1 rounded border border-green-100 truncate max-w-[100px]">{ins}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 border-t flex justify-between items-center text-xs">
                                     <span className="text-gray-400">{new Date(res.creationDate).toLocaleDateString()}</span>
                                     <div className="flex gap-3">
                                        <button onClick={() => handleEdit(res)} className="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                                        <button onClick={() => handleDuplicate(res)} className="text-gray-600 hover:text-gray-800">Clonar</button>
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

                    {/* Exit Ticket Generator Card */}
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
                        <div className="mt-4 text-xs font-semibold bg-white/20 inline-block px-2 py-1 rounded">
                            Potenciado por Gemini AI
                        </div>
                    </div>

                    {/* Assessment Generator Card */}
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
                        <div className="mt-4 text-xs font-semibold bg-white/20 inline-block px-2 py-1 rounded">
                            Potenciado por Gemini AI
                        </div>
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
