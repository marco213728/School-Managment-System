
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { PeiDimensionAnalysis, StandardDimension, PeiFodaEntry, PeiStrategy } from '../../types';
import { PlusIcon, TrashIcon, SparklesIcon, CheckCircleIcon, AlertTriangleIcon, CloseIcon } from '../icons/Icons';

interface PeiFodaMatrixProps {
    dimensionAnalysis: PeiDimensionAnalysis;
    onUpdate: (updatedAnalysis: PeiDimensionAnalysis) => void;
}

const PeiFodaMatrix: React.FC<PeiFodaMatrixProps> = ({ dimensionAnalysis, onUpdate }) => {
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [newEntryText, setNewEntryText] = useState('');
    const [entryType, setEntryType] = useState<PeiFodaEntry['type']>('Fortaleza');

    const handleAddEntry = () => {
        if (!newEntryText.trim()) return;
        const newEntry: PeiFodaEntry = {
            id: `entry-${Date.now()}`,
            type: entryType,
            description: newEntryText.trim()
        };
        onUpdate({
            ...dimensionAnalysis,
            entries: [...dimensionAnalysis.entries, newEntry]
        });
        setNewEntryText('');
    };

    const handleRemoveEntry = (id: string) => {
        onUpdate({
            ...dimensionAnalysis,
            entries: dimensionAnalysis.entries.filter(e => e.id !== id),
            strategies: dimensionAnalysis.strategies.filter(s => !s.description.includes(id)) // Simplified cleanup
        });
    };

    const handleAddStrategy = (type: PeiStrategy['type']) => {
        const desc = prompt(`Ingrese la nueva Estrategia ${type}:`);
        if (!desc) return;
        
        const newStrategy: PeiStrategy = {
            id: `strat-${Date.now()}`,
            type,
            description: desc,
            magnitude: 2,
            gravity: 2,
            capacity: 2,
            benefit: 2,
            priorityScore: 8 // default mid
        };
        
        onUpdate({
            ...dimensionAnalysis,
            strategies: [...dimensionAnalysis.strategies, newStrategy]
        });
    };

    const handleUpdateStrategy = (id: string, field: keyof PeiStrategy, value: any) => {
        const updatedStrategies = dimensionAnalysis.strategies.map(s => {
            if (s.id === id) {
                const updated = { ...s, [field]: value };
                // Calculate priority score: Sum of criteria
                updated.priorityScore = updated.magnitude + updated.gravity + updated.capacity + updated.benefit;
                return updated;
            }
            return s;
        });
        onUpdate({ ...dimensionAnalysis, strategies: updatedStrategies });
    };

    const handleSuggestStrategies = async () => {
        if (dimensionAnalysis.entries.length < 2) {
            alert("Agregue al menos un factor interno y uno externo para sugerir estrategias.");
            return;
        }
        
        setIsLoadingAi(true);
        const factors = dimensionAnalysis.entries.map(e => `[${e.type}] ${e.description}`).join('\n');
        const prompt = `
            Actúa como experto en planificación estratégica educativa.
            Analiza el siguiente FODA de la dimensión "${dimensionAnalysis.dimension}" y sugiere 4 estrategias estratégicas cruzadas (una de cada tipo: FO, FA, DO, DA).
            
            FACTORES:
            ${factors}
            
            REQUISITO: Devuelve un JSON estrictamente con este formato:
            {
                "FO": "Descripción estrategia FO...",
                "FA": "Descripción estrategia FA...",
                "DO": "Descripción estrategia DO...",
                "DA": "Descripción estrategia DA..."
            }
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            const suggestions = JSON.parse(response.text || '{}');
            
            const newStrats: PeiStrategy[] = Object.entries(suggestions).map(([type, desc]: [any, any]) => ({
                id: `strat-ai-${Date.now()}-${type}`,
                type: type as any,
                description: `(IA) ${desc}`,
                magnitude: 2, gravity: 2, capacity: 2, benefit: 2, priorityScore: 8
            }));

            onUpdate({ ...dimensionAnalysis, strategies: [...dimensionAnalysis.strategies, ...newStrats] });
        } catch (e) {
            console.error(e);
            alert("Error al conectar con la IA.");
        } finally {
            setIsLoadingAi(false);
        }
    };

    const FactorBox = ({ type, color, title }: { type: PeiFodaEntry['type'], color: string, title: string }) => (
        <div className={`p-4 rounded-xl border-2 ${color} min-h-[200px] flex flex-col`}>
            <h4 className="font-bold text-sm uppercase mb-3 flex justify-between items-center">
                {title}
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border">Interno</span>
            </h4>
            <div className="flex-grow space-y-2">
                {dimensionAnalysis.entries.filter(e => e.type === type).map(e => (
                    <div key={e.id} className="group bg-white p-2 rounded shadow-sm text-xs flex justify-between items-start">
                        <span>{e.description}</span>
                        <button onClick={() => handleRemoveEntry(e.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                            <CloseIcon className="h-3 w-3"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Input Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-3 items-end">
                <div className="flex-grow">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nuevo Factor Identificado</label>
                    <input 
                        type="text" 
                        value={newEntryText} 
                        onChange={e => setNewEntryText(e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                        placeholder="Describa el factor aquí..."
                    />
                </div>
                <div className="w-48">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                    <select 
                        value={entryType} 
                        onChange={e => setEntryType(e.target.value as any)}
                        className="w-full p-2 border rounded-md text-sm bg-white"
                    >
                        <option>Fortaleza</option>
                        <option>Oportunidad</option>
                        <option>Debilidad</option>
                        <option>Amenaza</option>
                    </select>
                </div>
                <button 
                    onClick={handleAddEntry}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md font-bold text-sm hover:bg-indigo-700"
                >
                    Añadir
                </button>
            </div>

            {/* FODA GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FactorBox type="Fortaleza" color="border-green-200 bg-green-50/30" title="Fortalezas (F)" />
                <FactorBox type="Debilidad" color="border-rose-200 bg-rose-50/30" title="Debilidades (D)" />
                <FactorBox type="Oportunidad" color="border-blue-200 bg-blue-50/30" title="Oportunidades (O)" />
                <FactorBox type="Amenaza" color="border-amber-200 bg-amber-50/30" title="Amenazas (A)" />
            </div>

            {/* STRATEGY SECTION */}
            <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Estrategias de Intervención (Cruce FODA)</h3>
                        <p className="text-sm text-gray-500 italic">Determine cómo usar sus fortalezas y oportunidades para mitigar riesgos.</p>
                    </div>
                    <button 
                        onClick={handleSuggestStrategies}
                        disabled={isLoadingAi}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 shadow-md transition-all animate-pulse"
                    >
                        {isLoadingAi ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <SparklesIcon className="h-5 w-5" />}
                        Sugerir con Gemini AI
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Strategy Grid by Type */}
                    {(['FO', 'FA', 'DO', 'DA'] as const).map(type => (
                        <div key={type} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                                <span className="font-black text-indigo-700">{type} <span className="text-[10px] font-normal text-gray-500 uppercase ml-2">
                                    {type === 'FO' ? 'Estrategias de Crecimiento' : type === 'FA' ? 'Estrategias de Reactividad' : type === 'DO' ? 'Estrategias de Adaptación' : 'Estrategias de Supervivencia'}
                                </span></span>
                                <button onClick={() => handleAddStrategy(type)} className="text-xs text-primary-600 font-bold hover:underline">+ Añadir</button>
                            </div>
                            <div className="p-4 space-y-4">
                                {dimensionAnalysis.strategies.filter(s => s.type === type).map(strat => (
                                    <div key={strat.id} className="border rounded-lg p-4 bg-white hover:border-indigo-300 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <p className="text-sm font-medium text-gray-800 flex-grow pr-4">{strat.description}</p>
                                            <button onClick={() => handleUpdateStrategy(strat.id, 'description', '')} className="text-red-400 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                                        </div>
                                        
                                        {/* Prioritization Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Magnitud</label>
                                                <select value={strat.magnitude} onChange={e => handleUpdateStrategy(strat.id, 'magnitude', parseInt(e.target.value))} className="w-full text-xs p-1 border rounded">
                                                    <option value={3}>Alto (Toda la comunidad)</option>
                                                    <option value={2}>Medio</option>
                                                    <option value={1}>Bajo (Grupal)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Gravedad</label>
                                                <select value={strat.gravity} onChange={e => handleUpdateStrategy(strat.id, 'gravity', parseInt(e.target.value))} className="w-full text-xs p-1 border rounded">
                                                    <option value={3}>Crítico</option>
                                                    <option value={2}>Moderado</option>
                                                    <option value={1}>Leve</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Capacidad</label>
                                                <select value={strat.capacity} onChange={e => handleUpdateStrategy(strat.id, 'capacity', parseInt(e.target.value))} className="w-full text-xs p-1 border rounded">
                                                    <option value={3}>Alta (Recursos listos)</option>
                                                    <option value={2}>Media</option>
                                                    <option value={1}>Baja (Faltan recursos)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Beneficio</label>
                                                <select value={strat.benefit} onChange={e => handleUpdateStrategy(strat.id, 'benefit', parseInt(e.target.value))} className="w-full text-xs p-1 border rounded">
                                                    <option value={3}>Transformacional</option>
                                                    <option value={2}>Incremental</option>
                                                    <option value={1}>Mantenimiento</option>
                                                </select>
                                            </div>
                                            <div className="bg-indigo-50 p-2 rounded text-center border border-indigo-100">
                                                <p className="text-[10px] font-bold text-indigo-500 uppercase">Puntos</p>
                                                <p className="text-lg font-black text-indigo-700">{strat.priorityScore}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PeiFodaMatrix;
