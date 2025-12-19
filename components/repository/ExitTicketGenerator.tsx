
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { TicketIcon, CloseIcon, PrinterIcon, CheckCircleIcon } from '../icons/Icons';
import { ResourceRepositoryItem, User } from '../../types';

interface ExitTicketGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (resource: ResourceRepositoryItem) => void;
    currentUser: User | null;
}

const ExitTicketGenerator: React.FC<ExitTicketGeneratorProps> = ({ isOpen, onClose, onSave, currentUser }) => {
    const [gradeLevel, setGradeLevel] = useState('');
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!gradeLevel || !topic) {
            setError('Por favor complete todos los campos.');
            return;
        }
        setIsLoading(true);
        setError('');

        const prompt = `
            Actúa como un profesor experto. Crea un "Exit Ticket" (Boleto de Salida) para evaluar la comprensión de una clase.
            
            Datos:
            - Nivel/Grado: ${gradeLevel}
            - Tema de la clase: ${topic}

            Genera 3 preguntas breves y concisas:
            1. Una pregunta de opción múltiple (con la respuesta correcta indicada).
            2. Una pregunta de respuesta corta para explicar un concepto clave.
            3. Una pregunta de metacognición (ej. ¿Qué fue lo más difícil?, ¿Qué aprendiste hoy?).

            Formato de salida deseado: Markdown limpio, listo para imprimir.
        `;

        try {
            // Updated GoogleGenAI initialization and fixed model name
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: prompt 
            });
            setGeneratedContent(response.text || 'No se pudo generar el contenido.');
        } catch (e) {
            console.error(e);
            setError('Error al conectar con la IA. Verifique su conexión o intente más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToBank = () => {
        if (!generatedContent || !currentUser) return;

        const newResource: ResourceRepositoryItem = {
            id: `res-et-${Date.now()}`,
            institutionId: currentUser.institutionId || '',
            authorId: currentUser.id,
            title: `Exit Ticket: ${topic}`,
            description: generatedContent,
            level: 'EGB', // Default generic level
            gradeLevel: undefined, // Specific grade level string from dropdown if mapped
            type: 'Activity',
            dcdIds: [],
            curricularInsertions: [],
            competencies: [],
            creationDate: new Date().toISOString(),
            shared: true
        };
        
        onSave(newResource);
        onClose();
    };

    const handlePrint = () => {
        if (!generatedContent) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const htmlContent = `
                <html>
                <head>
                    <title>Exit Ticket (Boleto de salida)- ${topic}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; max-width: 800px; mx-auto; }
                        .ticket { border: 2px dashed #ccc; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
                        h1 { font-size: 18px; margin-top: 0; text-align: center; text-transform: uppercase; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px; }
                        p, li { font-size: 14px; line-height: 1.5; }
                        .lines { border-bottom: 1px solid #000; display: inline-block; width: 100%; height: 20px; margin-top: 5px; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <h1>Exit Ticket (Boleto de Salida)</h1>
                        <div class="header">
                            <div><strong>Nombre:</strong> __________________________</div>
                            <div><strong>Fecha:</strong> ____________</div>
                        </div>
                        <div class="header">
                            <div><strong>Tema:</strong> ${topic}</div>
                        </div>
                        <hr/>
                        ${generatedContent.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                    </div>
                    <p style="text-align: center; font-size: 10px; color: #999;">Generado por Amauta</p>
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header matching the purple theme */}
                <div className="bg-purple-100 p-6 rounded-t-xl text-center border-b border-purple-200 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-purple-400 hover:text-purple-700">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                    <div className="mx-auto w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                        <TicketIcon className="h-8 w-8 text-black" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Exit Ticket</h2>
                    <p className="text-slate-600 text-sm mt-1">Crea evaluaciones rápidas al final de la lección para verificar la comprensión de los estudiantes.</p>
                </div>

                <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    {!generatedContent ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Grade level*</label>
                                <select 
                                    value={gradeLevel} 
                                    onChange={e => setGradeLevel(e.target.value)} 
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">Select one...</option>
                                    <option value="EGB Elemental (2-4)">EGB Elemental (2-4)</option>
                                    <option value="EGB Media (5-7)">EGB Media (5-7)</option>
                                    <option value="EGB Superior (8-10)">EGB Superior (8-10)</option>
                                    <option value="Bachillerato">Bachillerato</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Lesson topic or learning objective*</label>
                                <input 
                                    type="text" 
                                    value={topic} 
                                    onChange={e => setTopic(e.target.value)} 
                                    placeholder="e.g., Average rate of change of polynomials" 
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <button 
                                onClick={handleGenerate} 
                                disabled={isLoading || !gradeLevel || !topic}
                                className="w-full py-3 bg-gray-400 text-white font-bold rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                style={{ backgroundColor: isLoading || !gradeLevel || !topic ? '#9ca3af' : '#a855f7' }} // Purple when active
                            >
                                {isLoading ? 'Generating...' : 'Start'}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm whitespace-pre-wrap font-serif leading-relaxed">
                                {generatedContent}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setGeneratedContent(null)} 
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handlePrint}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex justify-center items-center gap-2"
                                >
                                    <PrinterIcon className="h-4 w-4" /> Print
                                </button>
                                <button 
                                    onClick={handleSaveToBank}
                                    className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex justify-center items-center gap-2"
                                >
                                    <CheckCircleIcon className="h-4 w-4" /> Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExitTicketGenerator;
