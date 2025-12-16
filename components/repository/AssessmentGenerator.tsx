import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AssessmentIcon, CloseIcon, PrinterIcon, CheckCircleIcon, SparklesIcon, SearchIcon } from '../icons/Icons';
import { ResourceRepositoryItem, User, Dcd, Subject } from '../../types';

interface AssessmentGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (resource: ResourceRepositoryItem) => void;
    currentUser: User | null;
    dcds: Dcd[];
    subjects: Subject[];
}

const AssessmentGenerator: React.FC<AssessmentGeneratorProps> = ({ isOpen, onClose, onSave, currentUser, dcds, subjects }) => {
    // A. Curricular Parameters
    const [subjectId, setSubjectId] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [topic, setTopic] = useState(''); // Specific Topic
    
    // DCD Search State
    const [dcdCode, setDcdCode] = useState(''); // The final selected code/text
    const [dcdSearchTerm, setDcdSearchTerm] = useState('');
    const [isDcdDropdownOpen, setIsDcdDropdownOpen] = useState(false);

    const [indicator, setIndicator] = useState('');
    const [learningObjective, setLearningObjective] = useState('');
    const [curricularInsertions, setCurricularInsertions] = useState<string[]>([]);

    // B. Design Parameters
    const [assessmentType, setAssessmentType] = useState('Formativa');
    const [taxonomy, setTaxonomy] = useState('Aplicar');
    const [itemFormat, setItemFormat] = useState('Selección Múltiple');

    // C. Inclusion Parameters
    const [includeDua, setIncludeDua] = useState(false);
    const [adaptationGrade, setAdaptationGrade] = useState(''); 

    // App State
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Filter DCDs based on search term and selected subject
    const filteredDcds = useMemo(() => {
        if (!dcdSearchTerm) return [];
        return dcds.filter(d => {
            const matchesSearch = d.code.toLowerCase().includes(dcdSearchTerm.toLowerCase()) || 
                                  d.description.toLowerCase().includes(dcdSearchTerm.toLowerCase());
            const matchesSubject = subjectId ? d.subjectId === subjectId : true;
            return matchesSearch && matchesSubject;
        }).slice(0, 5); // Limit to 5 suggestions
    }, [dcds, dcdSearchTerm, subjectId]);

    const handleSelectDcd = (dcd: Dcd) => {
        setDcdCode(`${dcd.code} - ${dcd.description}`);
        setDcdSearchTerm('');
        setIsDcdDropdownOpen(false);
        // Auto-set grade level if available in DCD
        if(dcd.gradeLevel) setGradeLevel(dcd.gradeLevel);
    };

    const handleGenerate = async () => {
        if (!topic || !dcdCode) {
            setError('Los campos Tema y Destreza (DCD) son obligatorios.');
            return;
        }
        setIsLoading(true);
        setError('');

        const selectedSubjectName = subjects.find(s => s.id === subjectId)?.name || 'General';

        const prompt = `
            Actúa como un experto en evaluación educativa del sistema ecuatoriano. Tu tarea es diseñar un instrumento de evaluación alineado al Currículo Nacional Priorizado.
            
            1. CONTEXTO CURRICULAR:
            - Asignatura: ${selectedSubjectName}
            - Tema Específico: ${topic}
            - Nivel/Subnivel: ${gradeLevel}
            - Destreza con Criterio de Desempeño (DCD): ${dcdCode}
            - Objetivo de Aprendizaje: ${learningObjective || 'Evaluar el dominio de la destreza seleccionada.'}
            
            2. PARÁMETROS DE DISEÑO:
            - Tipo de Evaluación: ${assessmentType}
            - Nivel Taxonómico (Bloom): ${taxonomy}
            - Formato de Preguntas: ${itemFormat}

            3. INCLUSIÓN Y DUA:
            - Aplicar DUA: ${includeDua ? 'SÍ (Incluir apoyos visuales, redacción simplificada)' : 'NO'}
            - Adaptación Curricular: ${adaptationGrade ? `Grado ${adaptationGrade}` : 'Ninguna'}

            INSTRUCCIONES DE SALIDA (FORMATO HTML):
            Genera el contenido EXCLUSIVAMENTE en código HTML válido (sin etiquetas <html>, <head> o <body>, solo el contenido del cuerpo).
            
            REGLA CRÍTICA PARA GRÁFICOS E IMÁGENES:
            NO uses imágenes externas ni descripciones de texto como "![Imagen de un círculo...]".
            Si una pregunta requiere un gráfico (ej. fracciones, figuras geométricas, conjuntos, rectas numéricas), **GENERA CÓDIGO <svg> EN LÍNEA** para dibujar la figura.
            - Los SVGs deben ser sencillos, con colores claros (blanco/negro/gris) y tamaños adecuados (max-width: 200px).
            
            ESTRUCTURA DEL HTML:
            <div class="evaluation-container">
                <div class="header">
                    <h3>Evaluación de ${selectedSubjectName}</h3>
                    <p><strong>Instrucciones:</strong> [Instrucciones claras para el estudiante]</p>
                </div>
                
                <div class="questions">
                    [Generar 5 ítems. Usa <div class="question-item"> para cada uno. Si es opción múltiple, usa listas <ul> u <ol>.]
                </div>
                
                <hr />
                
                <div class="teacher-key" style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px;">
                    <h4>Solucionario Docente</h4>
                    [Clave de respuestas y justificación]
                    ${includeDua ? '<p><em>Nota DUA: Se han incluido representaciones visuales SVG para apoyar la comprensión.</em></p>' : ''}
                </div>
            </div>
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: prompt 
            });
            
            // Clean up Markdown code blocks if present
            const cleanText = response.text?.replace(/```html/g, '').replace(/```/g, '') || 'Error al generar contenido.';
            setGeneratedContent(cleanText);
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
            id: `res-eval-${Date.now()}`,
            institutionId: currentUser.institutionId || '',
            authorId: currentUser.id,
            title: `Evaluación: ${topic} (${assessmentType})`,
            description: `Evaluación generada automáticamente sobre ${topic}. Formato HTML.`, // Note it's HTML
            level: 'Todos', 
            type: 'Activity',
            dcdIds: [], 
            curricularInsertions: curricularInsertions as any,
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
                    <title>Evaluación - ${topic}</title>
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; max-width: 800px; mx-auto; }
                        h1, h2, h3 { color: #1a202c; margin-bottom: 10px; }
                        .header-main { border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 30px; }
                        .header-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                        .question-item { margin-bottom: 20px; page-break-inside: avoid; }
                        svg { display: block; margin: 10px 0; max-width: 250px; height: auto; border: 1px solid #eee; padding: 5px; }
                        ul { list-style-type: none; padding-left: 0; }
                        li { margin-bottom: 5px; }
                        .watermark { position: fixed; bottom: 10px; right: 10px; color: #ccc; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header-main">
                        <div style="text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 20px;">EVALUACIÓN DE APRENDIZAJES</div>
                        <div class="header-row">
                            <span><strong>Asignatura:</strong> ${subjects.find(s => s.id === subjectId)?.name || 'General'}</span>
                            <span><strong>Fecha:</strong> _______________</span>
                        </div>
                        <div class="header-row">
                            <span><strong>Estudiante:</strong> ___________________________________</span>
                            <span><strong>Nivel:</strong> ${gradeLevel}</span>
                        </div>
                         <div><strong>Destreza Evaluada:</strong> ${dcdCode}</div>
                    </div>
                    
                    <div class="content">
                        ${generatedContent}
                    </div>
                    
                    <div class="watermark">Generado por Amauta AI</div>
                    <script>window.print();</script>
                </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        }
    };

    const toggleInsertion = (insertion: string) => {
        if (curricularInsertions.includes(insertion)) {
            setCurricularInsertions(curricularInsertions.filter(i => i !== insertion));
        } else {
            setCurricularInsertions([...curricularInsertions, insertion]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-indigo-600 p-4 rounded-t-xl text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <AssessmentIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Creador de Evaluaciones</h2>
                            <p className="text-xs text-indigo-100">Basado en Normativa LOEI y DUA</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-hidden flex flex-col md:flex-row">
                    {/* Left Sidebar: Configuration */}
                    <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto p-5 space-y-6">
                        
                        {/* Section A: Curricular */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">A. Parámetros Curriculares</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Asignatura</label>
                                    <select 
                                        value={subjectId} 
                                        onChange={e => setSubjectId(e.target.value)} 
                                        className="w-full p-2 border rounded text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">-- Seleccionar Asignatura --</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Tema a Evaluar *</label>
                                    <input 
                                        type="text" 
                                        value={topic} 
                                        onChange={e => setTopic(e.target.value)} 
                                        className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500" 
                                        placeholder="Ej: Suma de fracciones, La Guerra Fría" 
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-xs font-medium text-gray-700">Destreza (DCD) *</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={dcdCode || dcdSearchTerm} 
                                            onChange={e => { setDcdSearchTerm(e.target.value); setDcdCode(''); setIsDcdDropdownOpen(true); }}
                                            onFocus={() => setIsDcdDropdownOpen(true)}
                                            className="w-full p-2 pl-8 border rounded text-sm focus:ring-2 focus:ring-indigo-500" 
                                            placeholder="Buscar código o descripción..." 
                                        />
                                        <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                    
                                    {/* Searchable Dropdown Results */}
                                    {isDcdDropdownOpen && dcdSearchTerm && (
                                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                                            {filteredDcds.length > 0 ? (
                                                filteredDcds.map(d => (
                                                    <div 
                                                        key={d.id} 
                                                        onClick={() => handleSelectDcd(d)}
                                                        className="p-2 hover:bg-indigo-50 cursor-pointer text-xs border-b last:border-0"
                                                    >
                                                        <span className="font-bold text-indigo-700">{d.code}</span>
                                                        <p className="text-gray-600 truncate">{d.description}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-2 text-xs text-gray-500">No se encontraron destrezas.</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Nivel / Subnivel</label>
                                    <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="w-full p-2 border rounded text-sm bg-white">
                                        <option value="">Seleccionar...</option>
                                        <option value="EGB Elemental">EGB Elemental</option>
                                        <option value="EGB Media">EGB Media</option>
                                        <option value="EGB Superior">EGB Superior</option>
                                        <option value="Bachillerato">Bachillerato</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section B: Design */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-t pt-3">B. Diseño de la Prueba</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Tipo de Evaluación</label>
                                    <select value={assessmentType} onChange={e => setAssessmentType(e.target.value)} className="w-full p-2 border rounded text-sm">
                                        <option value="Formativa">Formativa (Proceso)</option>
                                        <option value="Sumativa">Sumativa (Final)</option>
                                        <option value="Diagnóstica">Diagnóstica (Previa)</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Taxonomía</label>
                                        <select value={taxonomy} onChange={e => setTaxonomy(e.target.value)} className="w-full p-2 border rounded text-sm">
                                            <option value="Recordar">Recordar</option>
                                            <option value="Comprender">Comprender</option>
                                            <option value="Aplicar">Aplicar</option>
                                            <option value="Analizar">Analizar</option>
                                            <option value="Evaluar">Evaluar</option>
                                            <option value="Crear">Crear</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Formato</label>
                                        <select value={itemFormat} onChange={e => setItemFormat(e.target.value)} className="w-full p-2 border rounded text-sm">
                                            <option value="Selección Múltiple">Sel. Múltiple</option>
                                            <option value="Verdadero/Falso">V / F</option>
                                            <option value="Completamiento">Completar</option>
                                            <option value="Pregunta Abierta">Abierta</option>
                                            <option value="Mixta">Mixta</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section C: Inclusion */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-t pt-3">C. Inclusión (DUA/NEE)</h3>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-2 cursor-pointer p-2 border rounded transition-colors ${includeDua ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-white'}`}>
                                    <input type="checkbox" checked={includeDua} onChange={e => setIncludeDua(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Aplicar Perfil DUA</span>
                                        <p className="text-[10px] text-gray-500">Añade apoyos visuales (SVGs) y simplificación.</p>
                                    </div>
                                </label>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Adaptación Curricular</label>
                                    <select value={adaptationGrade} onChange={e => setAdaptationGrade(e.target.value)} className="w-full p-2 border rounded text-sm">
                                        <option value="">Ninguna</option>
                                        <option value="1">Grado 1 (De Acceso)</option>
                                        <option value="2">Grado 2 (No significativa)</option>
                                        <option value="3">Grado 3 (Significativa)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2 shadow-md"
                        >
                            {isLoading ? (
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                                <><SparklesIcon className="h-5 w-5" /> Generar Evaluación</>
                            )}
                        </button>
                        {error && <p className="text-red-500 text-xs mt-2 p-2 bg-red-50 rounded border border-red-100">{error}</p>}
                    </div>

                    {/* Right Panel: Output */}
                    <div className="w-full md:w-2/3 p-6 bg-white overflow-y-auto">
                        {generatedContent ? (
                            <div className="space-y-4 h-full flex flex-col">
                                <div 
                                    className="flex-grow p-6 bg-gray-50 border rounded-lg overflow-y-auto font-serif text-sm leading-relaxed shadow-inner"
                                    dangerouslySetInnerHTML={{ __html: generatedContent }}
                                />
                                <div className="flex gap-3 pt-2 shrink-0 border-t mt-2">
                                    <button 
                                        onClick={() => setGeneratedContent(null)} 
                                        className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                                    >
                                        Volver / Editar
                                    </button>
                                    <button 
                                        onClick={handlePrint}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex justify-center items-center gap-2"
                                    >
                                        <PrinterIcon className="h-4 w-4" /> Imprimir
                                    </button>
                                    <button 
                                        onClick={handleSaveToBank}
                                        className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex justify-center items-center gap-2"
                                    >
                                        <CheckCircleIcon className="h-4 w-4" /> Guardar en Banco
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                                    <AssessmentIcon className="h-10 w-10 text-indigo-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-600">Asistente de Evaluación</h3>
                                <p className="text-sm max-w-md text-center mt-3 text-gray-500 leading-relaxed">
                                    Define la asignatura, el tema y la destreza (DCD) en el panel izquierdo. 
                                    La IA generará un instrumento de evaluación completo, incluyendo gráficos SVG y adaptaciones DUA.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentGenerator;