
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, CloseIcon, PlusIcon, TrashIcon, CheckCircleIcon } from '../icons/Icons';
import { Rubric, RubricCriteria, RubricLevel, RubricDescriptor } from '../../types';
import { GRADE_LEVELS } from '../../constants';

interface RubricGeneratorAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveRubric: (rubric: Rubric) => void;
    currentUser: any;
}

const RubricGeneratorAssistant: React.FC<RubricGeneratorAssistantProps> = ({ isOpen, onClose, onSaveRubric, currentUser }) => {
    const [gradeLevel, setGradeLevel] = useState('EGB Superior');
    const [description, setDescription] = useState('');
    const [customCriteria, setCustomCriteria] = useState<string[]>(['']);
    const [levelCount, setLevelCount] = useState<string>('4');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedRubric, setGeneratedRubric] = useState<Rubric | null>(null);

    const handleAddCriterion = () => setCustomCriteria([...customCriteria, '']);
    const handleCriterionChange = (index: number, value: string) => {
        const newCriteria = [...customCriteria];
        newCriteria[index] = value;
        setCustomCriteria(newCriteria);
    };
    const handleRemoveCriterion = (index: number) => {
        setCustomCriteria(customCriteria.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!description) return;
        setIsLoading(true);

        const criteriaPrompt = customCriteria.filter(c => c.trim() !== '').length > 0 
            ? `Incluye obligatoriamente estos criterios: ${customCriteria.filter(c => c.trim() !== '').join(', ')}.` 
            : 'Sugiere los criterios de evaluación más adecuados para esta actividad.';

        const prompt = `
            Actúa como un experto pedagogo. Genera una rúbrica de evaluación detallada.
            
            Contexto:
            - Nivel Educativo: ${gradeLevel}
            - Descripción de la Actividad: ${description}
            - Número de Niveles de Desempeño: ${levelCount}
            - Notas Adicionales: ${notes}
            - ${criteriaPrompt}

            Requisito de Formato JSON:
            Devuelve SOLO un objeto JSON con la siguiente estructura, sin texto adicional:
            {
                "title": "Título sugerido para la rúbrica",
                "levels": [
                    { "label": "Nombre del Nivel (ej. Experto, Novato)", "value": 10 } // Value should descend from 10 based on level count
                ],
                "criteria": [
                    {
                        "title": "Nombre del Criterio",
                        "weight": 25, // Suggested percentage weight
                        "descriptors": [
                            "Descripción del desempeño para este criterio en el nivel 1",
                            "Descripción del desempeño para este criterio en el nivel 2",
                            // ... match number of levels
                        ]
                    }
                ]
            }
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            
            const json = JSON.parse(response.text || '{}');
            parseAiResponse(json);

        } catch (e) {
            console.error(e);
            alert('Error al generar la rúbrica con IA.');
        } finally {
            setIsLoading(false);
        }
    };

    const parseAiResponse = (json: any) => {
        const rubricId = `rub-ai-${Date.now()}`;
        
        // Map Levels
        const levels: RubricLevel[] = json.levels.map((l: any, idx: number) => ({
            id: `lvl-${idx}`,
            rubricId,
            label: l.label,
            value: l.value || (10 - (idx * (10 / json.levels.length))), // Fallback calculation
            order: json.levels.length - idx,
            color: idx === 0 ? 'bg-green-100' : idx === json.levels.length - 1 ? 'bg-red-100' : 'bg-blue-50'
        }));

        const criteria: RubricCriteria[] = [];
        const descriptors: RubricDescriptor[] = [];

        json.criteria.forEach((c: any, cIdx: number) => {
            const critId = `crit-${cIdx}`;
            criteria.push({
                id: critId,
                rubricId,
                description: c.title,
                weight: c.weight || (100 / json.criteria.length)
            });

            c.descriptors.forEach((descText: string, dIdx: number) => {
                if (levels[dIdx]) {
                    descriptors.push({
                        criteriaId: critId,
                        levelId: levels[dIdx].id,
                        description: descText
                    });
                }
            });
        });

        const newRubric: Rubric = {
            id: rubricId,
            institutionId: currentUser?.institutionId || '',
            title: json.title,
            description: `Generada por IA para: ${description.substring(0, 50)}...`,
            scaleType: 'Quantitative',
            levels,
            criteria,
            descriptors
        };

        setGeneratedRubric(newRubric);
    };

    const handleSave = () => {
        if (generatedRubric) {
            onSaveRubric(generatedRubric);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="flex flex-col h-full bg-white">
                <header className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-xl">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <SparklesIcon className="h-6 w-6 text-yellow-300" /> 
                        Generador de Rúbricas con IA
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><CloseIcon className="h-6 w-6" /></button>
                </header>

                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    {/* INPUTS COLUMN */}
                    <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r bg-gray-50 space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nivel Educativo</label>
                            <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción de la Actividad</label>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                rows={4} 
                                className="w-full p-2 border rounded-md"
                                placeholder="Ej: Escribir un ensayo argumentativo sobre el cambio climático..."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">Cuantos más detalles, mejor será la rúbrica.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Criterios Específicos (Opcional)</label>
                            {customCriteria.map((crit, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        value={crit} 
                                        onChange={e => handleCriterionChange(idx, e.target.value)}
                                        className="flex-grow p-2 border rounded-md text-sm"
                                        placeholder={`Criterio ${idx + 1}`}
                                    />
                                    {customCriteria.length > 1 && (
                                        <button onClick={() => handleRemoveCriterion(idx)} className="text-red-400 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
                                    )}
                                </div>
                            ))}
                            <button onClick={handleAddCriterion} className="text-xs text-primary-600 font-semibold flex items-center gap-1 hover:underline">
                                <PlusIcon className="h-3 w-3" /> Añadir otro criterio
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Niveles</label>
                                <select value={levelCount} onChange={e => setLevelCount(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                    <option value="3">3 Niveles</option>
                                    <option value="4">4 Niveles</option>
                                    <option value="5">5 Niveles</option>
                                </select>
                            </div>
                        </div>

                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Notas Adicionales</label>
                            <input 
                                type="text" 
                                value={notes} 
                                onChange={e => setNotes(e.target.value)} 
                                className="w-full p-2 border rounded-md" 
                                placeholder="Ej: Usar lenguaje sencillo..."
                            />
                        </div>

                        <button 
                            onClick={handleGenerate} 
                            disabled={isLoading || !description}
                            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md"
                        >
                            {isLoading ? 'Generando...' : <><SparklesIcon className="h-5 w-5"/> Generar con IA</>}
                        </button>
                    </div>

                    {/* PREVIEW COLUMN */}
                    <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-white">
                        {generatedRubric ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-800">{generatedRubric.title}</h3>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Generado por IA</span>
                                </div>
                                <p className="text-sm text-gray-500">{generatedRubric.description}</p>
                                
                                <div className="border rounded-lg overflow-hidden text-sm">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="p-2 bg-gray-100 border text-left w-1/4">Criterio / Peso</th>
                                                {generatedRubric.levels.map(l => (
                                                    <th key={l.id} className="p-2 bg-gray-50 border text-center w-1/4">
                                                        <div className="font-bold">{l.label}</div>
                                                        <div className="text-xs text-gray-500">{l.value} pts</div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {generatedRubric.criteria.map(crit => (
                                                <tr key={crit.id}>
                                                    <td className="p-3 border align-top">
                                                        <p className="font-bold text-gray-800">{crit.description}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Peso: {crit.weight}%</p>
                                                    </td>
                                                    {generatedRubric.levels.map(lvl => {
                                                        const desc = generatedRubric.descriptors.find(d => d.criteriaId === crit.id && d.levelId === lvl.id);
                                                        return (
                                                            <td key={lvl.id} className="p-3 border align-top text-xs text-gray-600 bg-white">
                                                                {desc?.description}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10 border-2 border-dashed border-gray-200 rounded-xl">
                                <SparklesIcon className="h-16 w-16 mb-4 text-gray-300" />
                                <p className="text-lg font-medium">Listo para crear tu rúbrica</p>
                                <p className="text-sm">Completa los datos a la izquierda y deja que la IA haga el trabajo pesado.</p>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300">Cerrar</button>
                    <button 
                        onClick={handleSave} 
                        disabled={!generatedRubric}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <CheckCircleIcon className="h-5 w-5" /> Importar para Editar
                    </button>
                </footer>
        </div>
    );
};

export default RubricGeneratorAssistant;
