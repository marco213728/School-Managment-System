
import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { QualityGoal, ImprovementPlan } from '../../types';
import { AlertTriangleIcon, CheckCircleIcon } from '../icons/Icons';

interface MetricData {
    name: string;
    value: number;
    target: number;
    status: 'Green' | 'Yellow' | 'Red';
}

interface PerformanceLevel {
    level: string;
    description: string;
    range: string;
    count: number;
    percentage: number;
}

interface PrintableQualityReportProps {
    academicStats: {
        generalAverage: number;
        subjectStats: { name: string; average: number }[];
        performanceLevels: PerformanceLevel[];
    };
    efficiencyStats: {
        retentionRate: number;
        attendanceRate: number;
        passRate: number;
    };
    plans: ImprovementPlan[];
    goals: QualityGoal[];
}

const PrintableQualityReport: React.FC<PrintableQualityReportProps> = ({ academicStats, efficiencyStats, plans, goals }) => {
    const { institution } = useContext(InstitutionContext);
    const date = new Date();

    const getStatusColor = (val: number, target: number) => {
        if (val >= target) return { bg: 'bg-green-100', text: 'text-green-800', label: 'CUMPLE' };
        if (val >= target * 0.9) return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'EN PROCESO' };
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'NO CUMPLE' };
    };

    const scorecardItems = [
        { name: 'Promedio General Académico', value: academicStats.generalAverage, target: goals.find(g => g.category === 'Rendimiento')?.targetValue || 7, isPercentage: false },
        { name: 'Tasa de Asistencia Global', value: efficiencyStats.attendanceRate, target: goals.find(g => g.category === 'Asistencia')?.targetValue || 95, isPercentage: true },
        { name: 'Tasa de Retención Escolar', value: efficiencyStats.retentionRate, target: 100, isPercentage: true }, // Default target 100%
        { name: 'Tasa de Aprobación', value: efficiencyStats.passRate, target: 90, isPercentage: true }, // Default target 90%
    ];

    const findings = scorecardItems.filter(item => item.value < item.target * 0.95); // Strict finding rule

    return (
        <div className="bg-white p-10 font-serif text-gray-900 text-sm max-w-[21cm] mx-auto leading-relaxed">
            {/* HEADER */}
            <header className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-6">
                <div className="flex items-center gap-4">
                    {institution && <img src={institution.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />}
                    <div>
                        <h1 className="text-lg font-bold uppercase">Ministerio de Educación</h1>
                        <h2 className="text-md font-semibold uppercase">{institution?.name}</h2>
                        <p className="text-xs">Departamento de Evaluación y Calidad Educativa</p>
                    </div>
                </div>
                <div className="text-right text-xs">
                    <p><strong>Fecha de Emisión:</strong> {date.toLocaleDateString()}</p>
                    <p><strong>Código AMIE:</strong> {institution?.codeAMIE || 'N/A'}</p>
                    <p><strong>Año Lectivo:</strong> {goals[0]?.academicYear || '2024-2025'}</p>
                </div>
            </header>

            <h2 className="text-center text-xl font-bold mb-6 bg-gray-200 py-1 border border-black uppercase">INFORME ANUAL DE CALIDAD EDUCATIVA</h2>

            {/* SECTION I: INSTITUTIONAL STATUS */}
            <section className="mb-8">
                <h3 className="font-bold border-b border-black mb-4 text-base bg-gray-100 p-1">I. ESTADO SITUACIONAL (SCORECARD)</h3>
                <p className="text-justify mb-4">A continuación se presenta el resumen cuantitativo del cumplimiento de los Estándares de Calidad Educativa definidos en el PEI.</p>
                
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-left">INDICADOR</th>
                            <th className="border border-black p-2 text-center">VALOR ACTUAL</th>
                            <th className="border border-black p-2 text-center">META (PEI)</th>
                            <th className="border border-black p-2 text-center">ESTADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scorecardItems.map((item, idx) => {
                            const status = getStatusColor(item.value, item.target);
                            return (
                                <tr key={idx}>
                                    <td className="border border-black p-2">{item.name}</td>
                                    <td className="border border-black p-2 text-center font-bold">
                                        {item.isPercentage ? `${item.value.toFixed(2)}%` : item.value.toFixed(2)}
                                    </td>
                                    <td className="border border-black p-2 text-center">
                                        {item.isPercentage ? `${item.target}%` : item.target}
                                    </td>
                                    <td className={`border border-black p-2 text-center font-bold ${status.text} bg-opacity-50`}>
                                        {status.label}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {/* Mock Historical Comparison Graph using CSS Bars */}
                <div className="mt-6 border p-4 rounded bg-gray-50">
                    <h4 className="text-xs font-bold mb-2">Comparativa Histórica (Promedio General)</h4>
                    <div className="flex items-end h-24 gap-8 text-xs text-center ml-4">
                        <div className="w-16">
                            <div className="h-16 bg-gray-400 w-full mb-1"></div>
                            <span>2023</span>
                            <span className="block font-bold">7.50</span>
                        </div>
                        <div className="w-16">
                            <div className="bg-primary-600 w-full mb-1 transition-all" style={{ height: `${(academicStats.generalAverage / 10) * 100 * 0.8}px` }}></div>
                            <span>2024</span>
                            <span className="block font-bold">{academicStats.generalAverage.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION II: ACADEMIC ACHIEVEMENT */}
            <section className="mb-8">
                <h3 className="font-bold border-b border-black mb-4 text-base bg-gray-100 p-1">II. LOGROS DE APRENDIZAJE (INEVAL)</h3>
                <p className="mb-4">Distribución de la población estudiantil según los niveles de desempeño estandarizados.</p>
                
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-left">NIVEL DE DESEMPEÑO</th>
                            <th className="border border-black p-2 text-center">ESCALA CUALITATIVA</th>
                            <th className="border border-black p-2 text-center">RANGO</th>
                            <th className="border border-black p-2 text-center">% ESTUDIANTES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {academicStats.performanceLevels.map((level, idx) => (
                            <tr key={idx}>
                                <td className="border border-black p-2 font-bold">{level.level}</td>
                                <td className="border border-black p-2">{level.description}</td>
                                <td className="border border-black p-2 text-center">{level.range}</td>
                                <td className="border border-black p-2 text-center">
                                    <div className="flex items-center gap-2 justify-center">
                                        <span>{level.percentage.toFixed(1)}%</span>
                                        <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-600 h-full" style={{ width: `${level.percentage}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* SECTION III: EFFICIENCY & SOCIAL */}
            <section className="mb-8">
                <h3 className="font-bold border-b border-black mb-4 text-base bg-gray-100 p-1">III. EFICIENCIA INTERNA Y CONVIVENCIA</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="border border-black p-4">
                        <p className="text-xs uppercase text-gray-500">Tasa de Retención</p>
                        <p className="text-xl font-bold">{efficiencyStats.retentionRate.toFixed(2)}%</p>
                    </div>
                    <div className="border border-black p-4">
                        <p className="text-xs uppercase text-gray-500">Tasa de Aprobación</p>
                        <p className="text-xl font-bold">{efficiencyStats.passRate.toFixed(2)}%</p>
                    </div>
                    <div className="border border-black p-4">
                        <p className="text-xs uppercase text-gray-500">Asistencia Promedio</p>
                        <p className="text-xl font-bold">{efficiencyStats.attendanceRate.toFixed(2)}%</p>
                    </div>
                </div>
            </section>

             {/* SECTION IV & V: FINDINGS & IMPROVEMENT PLANS */}
             <section className="mb-8 break-inside-avoid">
                <h3 className="font-bold border-b border-black mb-4 text-base bg-gray-100 p-1">IV. HALLAZGOS Y PLAN DE MEJORA</h3>
                
                {findings.length > 0 ? (
                    <div className="mb-6">
                        <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                            <AlertTriangleIcon className="h-4 w-4"/> Hallazgos Críticos (No Cumple / En Riesgo)
                        </h4>
                        <ul className="list-disc pl-5 space-y-1">
                            {findings.map((f, i) => (
                                <li key={i}>El indicador <strong>{f.name}</strong> presenta un valor de {f.value.toFixed(2)}, inferior a la meta de {f.target}.</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="mb-6 p-2 bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4"/> No se han detectado hallazgos críticos. Se cumplen los estándares mínimos.
                    </div>
                )}

                <h4 className="font-bold text-gray-800 mb-2">Planes de Mejora Institucional Activos</h4>
                {plans.length > 0 ? (
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-2 text-left">PROBLEMA DETECTADO</th>
                                <th className="border border-black p-2 text-left">INTERVENCIÓN</th>
                                <th className="border border-black p-2 text-center">PLAZO</th>
                                <th className="border border-black p-2 text-center">ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map(plan => (
                                <tr key={plan.id}>
                                    <td className="border border-black p-2">{plan.problemDetected}</td>
                                    <td className="border border-black p-2">{plan.proposedIntervention}</td>
                                    <td className="border border-black p-2 text-center">{plan.deadline}</td>
                                    <td className="border border-black p-2 text-center">{plan.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500 italic">No hay planes de mejora registrados actualmente.</p>
                )}
            </section>

            {/* FIRMAS */}
            <footer className="mt-20 grid grid-cols-2 gap-20 text-center">
                <div>
                    <div className="border-t border-black w-full pt-2">
                        <p className="font-bold">VICERRECTOR/A</p>
                        <p className="text-xs">Elaborado por</p>
                    </div>
                </div>
                <div>
                    <div className="border-t border-black w-full pt-2">
                        <p className="font-bold">RECTOR/A</p>
                        <p className="text-xs">Aprobado por</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PrintableQualityReport;
