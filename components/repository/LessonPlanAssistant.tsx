
import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, CloseIcon, PrinterIcon, ClipboardDocumentCheckIcon, SearchIcon } from '../icons/Icons';
import { ResourceRepositoryItem, MicroPlan, Subject, Class, Dcd } from '../../types';

interface LessonPlanAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveToRepository: (resource: ResourceRepositoryItem) => void;
    currentUser: any;
    // New props for integration
    microPlans?: MicroPlan[];
    subjects?: Subject[];
    classes?: Class[];
    allDcds?: Dcd[];
    initialPlanId?: string;
}

const LessonPlanAssistant: React.FC<LessonPlanAssistantProps> = ({ 
    isOpen, onClose, onSaveToRepository, currentUser, 
    microPlans = [], subjects = [], classes = [], allDcds = [],
    initialPlanId 
}) => {
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [duration, setDuration] = useState('40 min');
    const [selectedPudId, setSelectedPudId] = useState<string>(initialPlanId || '');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

    // Filter approved PUDs for this teacher
    const availablePuds = useMemo(() => {
        return microPlans.filter(p => p.teacherId === currentUser?.id);
    }, [microPlans, currentUser]);

    // Effect to pre-fill if initialPlanId is provided or selected
    useEffect(() => {
        if (selectedPudId) {
            const pud = microPlans.find(p => p.id === selectedPudId);
            if (pud) {
                const subjectName = subjects.find(s => s.id === pud.subjectId)?.name || '';
                const className = classes.find(c => c.id === pud.classId)?.name || '';
                setTopic(pud.unitTitle);
                setSubject(subjectName);
                setGrade(className);
            }
        }
    }, [selectedPudId, microPlans, subjects, classes]);

    const handleGenerate = async () => {
        if (!topic || !subject) return;
        setIsLoading(true);
        
        let dcdContext = "";
        if (selectedPudId) {
            const pud = microPlans.find(p => p.id === selectedPudId);
            if (pud) {
                const relatedDcds = allDcds.filter(d => pud.dcdIds.includes(d.id));
                dcdContext = relatedDcds.map(d => `- ${d.code}: ${d.description}`).join('\n');
            }
        }

        const prompt = `
            Actúa como un experto pedagogo curricular del sistema educativo ecuatoriano. 
            Crea un plan de clase (Lesson Plan) detallado basado en la Planificación de Unidad (PUD).
            
            CONTEXTO:
            - Asignatura: ${subject}
            - Tema de la Clase: ${topic}
            - Grado/Nivel: ${grade}
            - Duración: ${duration}
            
            ${dcdContext ? `DESTREZAS (DCDs) A DESARROLLAR:\n${dcdContext}` : ''}

            REQUISITOS DEL FORMATO (Markdown):
            1. # [Título Creativo de la Clase]
            2. **Objetivo Específico:** Definir un objetivo que apunte directamente a las destrezas.
            3. ## Estructura Basada en ERCA (Experiencia, Reflexión, Conceptualización, Aplicación):
               - **Experiencia (10%):** Actividad motivadora.
               - **Reflexión (15%):** Preguntas de desequilibrio cognitivo.
               - **Conceptualización (40%):** Desarrollo del contenido técnico (Usar enfoque DUA).
               - **Aplicación (35%):** Actividad práctica evaluativa.
            4. ## Recursos Necesarios
            5. ## Adaptaciones Curriculares (Grado 1 y 2 sugeridas).
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: prompt 
            });
            setGeneratedPlan(response.text || 'No se pudo generar el plan.');
        } catch (e) {
            console.error(e);
            setGeneratedPlan('Error al conectar con la IA. Por favor intente más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!generatedPlan) return;
        
        const newResource: ResourceRepositoryItem = {
            id: `res-ai-${Date.now()}`,
            institutionId: currentUser.institutionId,
            authorId: currentUser.id,
            title: `Guía de Clase: ${topic}`,
            description: generatedPlan,
            level: 'EGB',
            type: 'Activity',
            dcdIds: selectedPudId ? microPlans.find(p => p.id === selectedPudId)?.dcdIds || [] : [],
            curricularInsertions: [],
            competencies: [],
            creationDate: new Date().toISOString(),
            shared: true
        };
        
        onSaveToRepository(newResource);
        onClose();
    };

    const handlePrint = () => {
        if (!generatedPlan) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const htmlContent = `
                <html>
                <head>
                    <title>Guía Docente IA - ${topic}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                        h1 { color: #1e293b; border-bottom: 3px solid #ea580c; padding-bottom: 10px; }
                        h2 { color: #334155; margin-top: 25px; border-bottom: 1px solid #e2e8f0; }
                        .pud-ref { font-size: 12px; color: #64748b; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
                        strong { color: #1e293b; }
                    </style>
                </head>
                <body>
                    <div class="pud-ref">Referencia: Planificación Microcurricular - ${subject}</div>
                    ${generatedPlan.replace(/\n/g, '<br>').replace(/## (.*?)<br>/g, '<h2>$1</h2>').replace(/# (.*?)<br>/g, '<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                    <script>window.print();</script>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-orange-600 to-primary-600 text-white rounded-t-xl">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-yellow-300" /> 
                        Asistente de Clase con IA (Sincronizado con PUD)
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><CloseIcon className="h-6 w-6" /></button>
                </header>

                <div className="p-6 overflow-y-auto flex-grow flex flex-col md:flex-row gap-6">
                    {/* Inputs Section */}
                    <div className="w-full md:w-2/5 space-y-4">
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                            <label className="block text-xs font-bold text-orange-800 uppercase mb-2 flex items-center gap-1">
                                <ClipboardDocumentCheckIcon className="h-4 w-4"/> Importar Contexto de Planificación (PUD)
                            </label>
                            <select 
                                value={selectedPudId} 
                                onChange={e => setSelectedPudId(e.target.value)} 
                                className="w-full p-2 border rounded-md text-sm bg-white focus:ring-primary-500"
                            >
                                <option value="">-- Entrada Manual (Sin PUD) --</option>
                                {availablePuds.map(p => (
                                    <option key={p.id} value={p.id}>{p.unitTitle} ({classes.find(c => c.id === p.classId)?.name})</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-orange-600 mt-2 italic">
                                * Al seleccionar un PUD, la IA usará automáticamente las DCDs y objetivos planificados.
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Asunto / Tema de la Clase</label>
                                <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Ej: Suma de monomios"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Asignatura</label>
                                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Ej: Matemática"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Grado / Curso</label>
                                    <input type="text" value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Ej: 9no EGB"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duración</label>
                                    <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 border rounded-md text-sm">
                                        <option value="40 min">40 min</option>
                                        <option value="80 min">80 min</option>
                                        <option value="120 min">120 min</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading || !topic || !subject}
                            className="w-full py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg transition-all"
                        >
                            {isLoading ? (
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                                <><SparklesIcon className="h-5 w-5"/> Generar Guía con Gemini AI</>
                            )}
                        </button>
                    </div>

                    {/* Preview Section */}
                    <div className="w-full md:w-3/5 bg-slate-50 border rounded-xl p-5 flex flex-col shadow-inner">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-gray-700">Vista Previa de la Guía Docente:</h3>
                            {generatedPlan && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Listas para aplicar</span>}
                        </div>
                        <div className="flex-grow overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 font-serif leading-relaxed bg-white border p-4 rounded-lg shadow-sm">
                            {generatedPlan || (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 italic">
                                    <SparklesIcon className="h-12 w-12 mb-2" />
                                    <p>Configura los parámetros y presiona generar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors">Cerrar</button>
                    <button 
                        onClick={handlePrint} 
                        disabled={!generatedPlan}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                        <PrinterIcon className="h-4 w-4" /> Imprimir / PDF
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={!generatedPlan}
                        className="px-6 py-2 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 disabled:opacity-50"
                    >
                        Guardar en Banco de Recursos
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default LessonPlanAssistant;
