import React, { useState, useMemo, useEffect } from 'react';
import { Rubric } from '../../types';

interface RubricEvaluatorProps {
    rubric: Rubric;
    onCalculate: (score: number) => void;
    initialScore?: number;
}

const RubricEvaluator: React.FC<RubricEvaluatorProps> = ({ rubric, onCalculate }) => {
    // Map criteriaId -> levelId
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [totalScore, setTotalScore] = useState(0);

    const levels = useMemo(() => rubric.levels.sort((a, b) => b.order - a.order), [rubric.levels]);

    const handleSelect = (criteriaId: string, levelId: string) => {
        setSelections(prev => ({ ...prev, [criteriaId]: levelId }));
    };

    // Auto-calculate score whenever selections change
    useEffect(() => {
        let score = 0;
        let totalWeight = 0;

        rubric.criteria.forEach(crit => {
            const selectedLevelId = selections[crit.id];
            if (selectedLevelId) {
                const level = rubric.levels.find(l => l.id === selectedLevelId);
                if (level) {
                    score += level.value * (crit.weight / 100);
                }
            }
            totalWeight += crit.weight;
        });

        if (totalWeight > 0 && totalWeight !== 100) {
            score = (score / totalWeight) * 100;
            score = score / 10;
        }
        
        setTotalScore(parseFloat(score.toFixed(2)));
        onCalculate(parseFloat(score.toFixed(2)));

    }, [selections, rubric, onCalculate]);

    const getDescriptor = (criteriaId: string, levelId: string) => {
        return rubric.descriptors.find(d => d.criteriaId === criteriaId && d.levelId === levelId)?.description || '';
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex justify-between items-center sticky top-0 z-10 shrink-0">
                <h4 className="font-bold text-blue-800 text-sm">Evaluación por Rúbrica: {rubric.title}</h4>
                <div className="text-xl font-bold text-blue-900 bg-white px-3 py-1 rounded shadow-sm border border-blue-100">
                    Nota: {totalScore}
                </div>
            </div>

            {/* Changed from overflow-hidden to overflow-auto to allow vertical scrolling */}
            <div className="border rounded-lg flex-grow overflow-auto shadow-sm relative bg-white">
                <div className="min-w-[700px]"> {/* Ensures horizontal scroll on small screens if needed */}
                    {rubric.criteria.map(crit => (
                        <div key={crit.id} className="border-b last:border-b-0">
                            {/* Criteria Header Row */}
                            <div className="bg-gray-100 p-3 text-xs font-bold text-gray-700 flex justify-between border-b border-gray-200 sticky left-0">
                                <span className="uppercase tracking-wider">{crit.description}</span>
                                <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-800">Peso: {crit.weight}%</span>
                            </div>
                            
                            {/* Levels Grid */}
                            <div 
                                className="grid divide-x divide-gray-100"
                                style={{
                                    gridTemplateColumns: `repeat(${levels.length}, minmax(140px, 1fr))`
                                }}
                            >
                                {levels.map(level => {
                                    const isSelected = selections[crit.id] === level.id;
                                    return (
                                        <div 
                                            key={level.id}
                                            onClick={() => handleSelect(crit.id, level.id)}
                                            className={`
                                                p-3 cursor-pointer transition-all duration-200 text-xs relative flex flex-col h-full
                                                ${isSelected ? 'bg-blue-50 ring-inset ring-2 ring-blue-500' : 'hover:bg-gray-50 bg-white'}
                                            `}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                            
                                            <div className="mb-2">
                                                <span className={`font-bold text-sm ${isSelected ? 'text-blue-800' : 'text-gray-900'}`}>
                                                    {level.label}
                                                </span>
                                                <span className="ml-1 text-gray-500 text-[10px]">({level.value} pts)</span>
                                            </div>
                                            
                                            <p className={`text-gray-600 leading-relaxed flex-grow ${isSelected ? 'text-blue-900' : ''}`}>
                                                {getDescriptor(crit.id, level.id)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="shrink-0 pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Retroalimentación Formativa (Obligatorio)</label>
                <textarea 
                    className="w-full p-2 border rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 shadow-sm" 
                    rows={2} 
                    placeholder="Indique fortalezas y sugerencias de mejora..."
                ></textarea>
            </div>
        </div>
    );
};

export default RubricEvaluator;