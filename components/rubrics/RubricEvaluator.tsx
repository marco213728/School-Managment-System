import React, { useState, useMemo, useEffect } from 'react';
import { Rubric } from '../../types';

interface RubricEvaluatorProps {
    rubric: Rubric;
    onCalculate: (score: number) => void;
    initialScore?: number; // Optional: to preload logic if needed, though usually we preload selections
}

const RubricEvaluator: React.FC<RubricEvaluatorProps> = ({ rubric, onCalculate }) => {
    // Map criteriaId -> levelId
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [totalScore, setTotalScore] = useState(0);

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
                    // Logic: (LevelValue / MaxLevelValue) * (Weight/100) * MaxTotalPoints(usually 10)
                    // Simplified: Value * (Weight / 100) if Value is already scaled to 10.
                    // Assuming Level Value is e.g. 10, 8, 5.
                    
                    // Direct calculation: Value * Weight%
                    // E.g. 10 * 0.5 (50%) = 5 points.
                    score += level.value * (crit.weight / 100);
                }
            }
            totalWeight += crit.weight;
        });

        // Normalize if weight doesn't sum to 100 (fallback)
        if (totalWeight > 0 && totalWeight !== 100) {
            score = (score / totalWeight) * 100; // Normalize to 100 scale then /10
            score = score / 10; 
        }
        
        setTotalScore(parseFloat(score.toFixed(2)));
        onCalculate(parseFloat(score.toFixed(2)));

    }, [selections, rubric]);

    const getDescriptor = (criteriaId: string, levelId: string) => {
        return rubric.descriptors.find(d => d.criteriaId === criteriaId && d.levelId === levelId)?.description || '';
    };

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex justify-between items-center sticky top-0 z-10">
                <h4 className="font-bold text-blue-800 text-sm">Evaluación por Rúbrica: {rubric.title}</h4>
                <div className="text-xl font-bold text-blue-900 bg-white px-3 py-1 rounded shadow-sm border border-blue-100">
                    Nota: {totalScore}
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                {rubric.criteria.map(crit => (
                    <div key={crit.id} className="border-b last:border-b-0">
                        <div className="bg-gray-100 p-2 text-xs font-bold text-gray-700 flex justify-between">
                            <span>{crit.description}</span>
                            <span>Peso: {crit.weight}%</span>
                        </div>
                        <div className="grid grid-cols-4 divide-x">
                            {rubric.levels.sort((a,b) => b.order - a.order).map(level => {
                                const isSelected = selections[crit.id] === level.id;
                                return (
                                    <div 
                                        key={level.id}
                                        onClick={() => handleSelect(crit.id, level.id)}
                                        className={`p-2 cursor-pointer transition-colors text-xs relative ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                                    >
                                        {isSelected && <div className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full"></div>}
                                        <p className="font-bold mb-1 text-gray-900">{level.label} ({level.value})</p>
                                        <p className="text-gray-600 leading-tight">{getDescriptor(crit.id, level.id)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retroalimentación Formativa (Obligatorio)</label>
                <textarea 
                    className="w-full p-2 border rounded-md text-sm focus:ring-primary-500 focus:border-primary-500" 
                    rows={2} 
                    placeholder="Indique fortalezas y sugerencias de mejora..."
                ></textarea>
            </div>
        </div>
    );
};

export default RubricEvaluator;