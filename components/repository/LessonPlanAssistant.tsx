import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, CloseIcon, PrinterIcon } from '../icons/Icons';
import { ResourceRepositoryItem } from '../../types';

interface LessonPlanAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveToRepository: (resource: ResourceRepositoryItem) => void;
    currentUser: any;
}

const LessonPlanAssistant: React.FC<LessonPlanAssistantProps> = ({ isOpen, onClose, onSaveToRepository, currentUser }) => {
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [duration, setDuration] = useState('40 min');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!topic || !subject) return;
        setIsLoading(true);
        
        const prompt = `
            Actúa como un experto pedagogo curricular. Crea un plan de clase detallado para:
            - Asignatura: ${subject}
            - Tema: ${topic}
            - Grado/Nivel: ${grade}
            - Duración: ${duration}

            Formato requerido (Markdown):
            # [Título de la Clase]
            **Objetivo de Aprendizaje:** ...
            
            ## Estructura de la Clase
            1. **Inicio (10%):** Actividad de motivación y conocimientos previos.
            2. **Desarrollo (70%):** Explicación, actividad práctica y trabajo colaborativo. (Incluir enfoque DUA).
            3. **Cierre (20%):** Reflexión y evaluación formativa.

            ## Recursos Necesarios
            - Lista de materiales...

            ## Evaluación
            - Técnica e instrumento sugerido.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
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
            title: `Plan de Clase: ${topic}`,
            description: generatedPlan, // Store the markdown content
            level: 'EGB', // Default, user can edit later
            type: 'Activity',
            dcdIds: [],
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
                    <title>Plan de Clase - ${topic}</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; padding: 40px; color: #333; }
                        h1 { color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                        h2 { color: #2d3748; margin-top: 20px; border-bottom: 1px solid #edf2f7; padding-bottom: 5px; }
                        strong { color: #4a5568; }
                        p, li { line-height: 1.6; font-size: 14px; }
                        ul { margin-bottom: 15px; }
                        .header { text-align: center; margin-bottom: 30px; font-size: 12px; color: #718096; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <p>Generado por Amauta AI Assistant</p>
                        <p>${new Date().toLocaleDateString()}</p>
                    </div>
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-yellow-300" /> 
                        Asistente de Planificación con IA
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><CloseIcon className="h-6 w-6" /></button>
                </header>

                <div className="p-6 overflow-y-auto flex-grow flex flex-col md:flex-row gap-6">
                    {/* Inputs */}
                    <div className="w-full md:w-1/3 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tema de la Clase</label>
                            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Ej: Ciclo del Agua"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Asignatura</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Ej: Ciencias Naturales"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Grado / Nivel</label>
                            <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-2 border rounded-md">
                                <option value="">Seleccionar</option>
                                <option value="EGB Elemental (2-4)">EGB Elemental (2-4)</option>
                                <option value="EGB Media (5-7)">EGB Media (5-7)</option>
                                <option value="EGB Superior (8-10)">EGB Superior (8-10)</option>
                                <option value="Bachillerato">Bachillerato</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Duración</label>
                            <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 border rounded-md">
                                <option value="40 min">40 min (1 hora pedagógica)</option>
                                <option value="80 min">80 min (2 horas pedagógicas)</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading || !topic || !subject}
                            className="w-full py-2 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading ? 'Generando...' : <><SparklesIcon className="h-4 w-4"/> Generar Plan</>}
                        </button>
                    </div>

                    {/* Output */}
                    <div className="w-full md:w-2/3 bg-gray-50 border rounded-lg p-4 flex flex-col">
                        <h3 className="font-bold text-gray-700 mb-2">Plan Generado:</h3>
                        <div className="flex-grow overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 font-serif leading-relaxed border p-2 bg-white rounded">
                            {generatedPlan || <span className="text-gray-400 italic">Aquí aparecerá tu plan de clase generado por IA...</span>}
                        </div>
                    </div>
                </div>

                <footer className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300">Cerrar</button>
                    {/* Print Button */}
                    <button 
                        onClick={handlePrint} 
                        disabled={!generatedPlan}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:bg-gray-300"
                    >
                        <PrinterIcon className="h-4 w-4" /> Imprimir / PDF
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={!generatedPlan}
                        className="px-6 py-2 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 disabled:bg-gray-300"
                    >
                        Guardar en Banco
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default LessonPlanAssistant;