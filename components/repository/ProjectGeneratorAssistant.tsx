
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, CloseIcon, PlusIcon, TrashIcon, CheckCircleIcon, ArchiveBoxIcon } from '../icons/Icons';
import { ResourceRepositoryItem, Subject, ResourcePhase, Competency, CurricularInsertion } from '../../types';
import { GRADE_LEVELS, AREAS_OF_KNOWLEDGE, COMPETENCIES, CURRICULAR_INSERTIONS } from '../../constants';

interface ProjectGeneratorAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveProject: (resource: ResourceRepositoryItem) => void;
    currentUser: any;
    subjects: Subject[];
}

const ProjectGeneratorAssistant: React.FC<ProjectGeneratorAssistantProps> = ({ isOpen, onClose, onSaveProject, currentUser, subjects }) => {
    const [topic, setTopic] = useState('');
    const [gradeLevel, setGradeLevel] = useState('EGB Superior');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [finalProduct, setFinalProduct] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedData, setGeneratedData] = useState<any>(null);

    const handleSubjectToggle = (id: string) => {
        setSelectedSubjects(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const handleGenerate = async () => {
        if (!topic || selectedSubjects.length === 0) {
            alert("Por favor ingrese un tema y seleccione al menos una asignatura.");
            return;
        }
        setIsLoading(true);

        const subjectsNames = selectedSubjects.map(id => subjects.find(s => s.id === id)?.name).join(', ');

        const prompt = `
            Actúa como un experto en metodologías activas y diseño curricular. 
            Crea un Proyecto Interdisciplinario (ABP) completo.
            
            DATOS DEL PROYECTO:
            - Tópico Generativo (Idea Central): ${topic}
            - Nivel Educativo: ${gradeLevel}
            - Asignaturas Integradas: ${subjectsNames}
            - Producto Final Sugerido: ${finalProduct || 'Sugerido por la IA'}

            REQUISITO DE FORMATO JSON (estricto):
            Devuelve un objeto JSON con la siguiente estructura:
            {
                "title": "Nombre creativo del proyecto",
                "description": "Descripción general y justificación pedagógica",
                "objectives": "Objetivos de aprendizaje integradores",
                "finalProduct": "Definición detallada del producto final",
                "phases": [
                    { "name": "Fase 1: Lanzamiento/Exploración", "trimester": 1, "description": "Actividades iniciales" },
                    { "name": "Fase 2: Investigación", "trimester": 1, "description": "Actividades de búsqueda de info" },
                    { "name": "Fase 3: Desarrollo/Prototipado", "trimester": 2, "description": "Construcción del producto" },
                    { "name": "Fase 4: Comunicación/Exhibición", "trimester": 3, "description": "Presentación final" }
                ],
                "dua": {
                    "representation": "Estrategias DUA de representación",
                    "actionExpression": "Estrategias DUA de acción y expresión",
                    "engagement": "Estrategias DUA de implicación"
                }
            }
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            
            const json = JSON.parse(response.text || '{}');
            setGeneratedData(json);
        } catch (e) {
            console.error(e);
            alert('Error al generar el proyecto con IA.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!generatedData) return;

        const newResource: ResourceRepositoryItem = {
            id: `proj-ai-${Date.now()}`,
            institutionId: currentUser?.institutionId || '',
            authorId: currentUser?.id || '',
            title: generatedData.title,
            description: generatedData.description,
            level: 'EGB', // Genérico
            gradeLevel: gradeLevel as any,
            type: 'Project',
            isInterdisciplinary: true,
            generativeTopic: topic,
            finalProduct: generatedData.finalProduct,
            phases: generatedData.phases,
            duaRepresentation: generatedData.dua.representation,
            duaActionExpression: generatedData.dua.actionExpression,
            duaEngagement: generatedData.dua.engagement,
            linkedSubjectIds: selectedSubjects,
            dcdIds: [],
            curricularInsertions: [],
            competencies: [],
            shared: true,
            creationDate: new Date().toISOString()
        };

        onSaveProject(newResource);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                <header className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-700 to-blue-700 text-white">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-yellow-300" />
                        <h2 className="text-xl font-bold">Generador de Proyectos Interdisciplinarios (IA)</h2>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white/10 p-1 rounded-full"><CloseIcon className="h-6 w-6" /></button>
                </header>

                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    {/* INPUT SIDEBAR */}
                    <div className="w-full md:w-1/3 bg-gray-50 p-6 border-r overflow-y-auto space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tópico Generativo (Idea Central)</label>
                            <input 
                                type="text" 
                                value={topic} 
                                onChange={e => setTopic(e.target.value)}
                                className="w-full p-2 border rounded-md" 
                                placeholder="Ej: El cambio climático en mi ciudad"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nivel</label>
                            <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="w-full p-2 border rounded-md">
                                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Asignaturas Integradas</label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded bg-white">
                                {subjects.map(s => (
                                    <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedSubjects.includes(s.id)} 
                                            onChange={() => handleSubjectToggle(s.id)}
                                            className="rounded text-primary-600"
                                        />
                                        <span className="truncate">{s.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Producto Final Esperado (Opcional)</label>
                            <input 
                                type="text" 
                                value={finalProduct} 
                                onChange={e => setFinalProduct(e.target.value)}
                                className="w-full p-2 border rounded-md" 
                                placeholder="Ej: Maqueta funcional, Revista digital..."
                            />
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading || !topic || selectedSubjects.length === 0}
                            className="w-full py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:bg-gray-300 flex justify-center items-center gap-2 shadow-lg"
                        >
                            {isLoading ? 'Diseñando Proyecto...' : <><SparklesIcon className="h-5 w-5"/> Generar Estructura</>}
                        </button>
                    </div>

                    {/* PREVIEW AREA */}
                    <div className="w-full md:w-2/3 p-8 overflow-y-auto bg-white">
                        {generatedData ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className="border-b pb-4">
                                    <h3 className="text-3xl font-black text-gray-800">{generatedData.title}</h3>
                                    <p className="text-sm text-gray-500 mt-2 italic">{generatedData.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <h4 className="font-bold text-blue-800 mb-2">Objetivo Integrador</h4>
                                        <p className="text-sm text-gray-700">{generatedData.objectives}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                        <h4 className="font-bold text-emerald-800 mb-2">Producto Final</h4>
                                        <p className="text-sm text-gray-700">{generatedData.finalProduct}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <ArchiveBoxIcon className="h-5 w-5 text-gray-400" /> Cronograma de Fases
                                    </h4>
                                    <div className="space-y-3">
                                        {generatedData.phases.map((phase: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50">
                                                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-black shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-gray-800">{phase.name} <span className="text-[10px] text-gray-400 ml-2">T{phase.trimester}</span></h5>
                                                    <p className="text-xs text-gray-600">{phase.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                    <h4 className="font-bold text-orange-800 mb-2">Estrategias DUA (Inclusión)</h4>
                                    <div className="grid grid-cols-1 gap-2 text-xs text-orange-900">
                                        <p><strong>Representación:</strong> {generatedData.dua.representation}</p>
                                        <p><strong>Acción y Expresión:</strong> {generatedData.dua.actionExpression}</p>
                                        <p><strong>Implicación:</strong> {generatedData.dua.engagement}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                <ArchiveBoxIcon className="h-24 w-24 mb-4 opacity-20" />
                                <h3 className="text-xl font-bold">Listo para diseñar un proyecto</h3>
                                <p className="text-sm text-center max-w-xs mt-2">Complete el tópico generativo y las asignaturas integradas a la izquierda.</p>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium">Cerrar</button>
                    <button 
                        onClick={handleSave}
                        disabled={!generatedData}
                        className="px-8 py-2 bg-emerald-600 text-white font-bold rounded-md hover:bg-emerald-700 disabled:bg-gray-300 flex items-center gap-2"
                    >
                        <CheckCircleIcon className="h-5 w-5" /> Guardar en el Banco de Recursos
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ProjectGeneratorAssistant;
