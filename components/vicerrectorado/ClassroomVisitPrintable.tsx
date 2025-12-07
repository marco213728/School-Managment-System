import React, { useContext, useMemo } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { ClassroomVisit, User } from '../../types';
import { DEFAULT_RUBRIC_CRITERIA } from '../../constants';

interface ClassroomVisitPrintableProps {
    visit: ClassroomVisit;
    teacher: User;
    observer: User;
}

const ClassroomVisitPrintable: React.FC<ClassroomVisitPrintableProps> = ({ visit, teacher, observer }) => {
    const { institution } = useContext(InstitutionContext);

    // Helper to get criterion description
    const getCriterion = (id: string) => DEFAULT_RUBRIC_CRITERIA.find(c => c.id === id);

    return (
        <div className="bg-white p-8 font-serif text-xs text-gray-900 max-w-[21cm] mx-auto">
            {/* HEADER */}
            <header className="flex items-start justify-between border-b-2 border-gray-800 pb-2 mb-4">
                <div className="w-1/5">
                    <div className="text-xs font-bold text-blue-800">Ministerio de Educación</div>
                    <div className="text-2xl font-black text-blue-900 leading-none">Ecuador</div>
                </div>
                <div className="w-3/5 text-center">
                    <h1 className="text-sm font-bold uppercase">{institution?.name}</h1>
                    <h2 className="text-xs font-bold">VICERRECTORADO / COORDINACIÓN ACADÉMICA</h2>
                    <h3 className="text-sm font-bold mt-2">ACTA DE ACOMPAÑAMIENTO ÁULICO</h3>
                </div>
                <div className="w-1/5 flex justify-end">
                    {institution && <img src={institution.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />}
                </div>
            </header>

            {/* DATOS INFORMATIVOS */}
            <section className="mb-4 border border-black">
                <h4 className="bg-gray-200 text-center font-bold border-b border-black p-1">1. DATOS INFORMATIVOS</h4>
                <table className="w-full text-xs">
                    <tbody>
                        <tr>
                            <td className="p-1 border-r border-b border-black font-bold w-[15%]">DOCENTE:</td>
                            <td className="p-1 border-r border-b border-black w-[35%]">{teacher.name}</td>
                            <td className="p-1 border-r border-b border-black font-bold w-[15%]">OBSERVADOR:</td>
                            <td className="p-1 border-b border-black w-[35%]">{observer.name}</td>
                        </tr>
                        <tr>
                            <td className="p-1 border-r border-b border-black font-bold">FECHA:</td>
                            <td className="p-1 border-r border-b border-black">{new Date(visit.date).toLocaleDateString('es-ES')}</td>
                            <td className="p-1 border-r border-b border-black font-bold">HORA:</td>
                            <td className="p-1 border-b border-black">{visit.startTime}</td>
                        </tr>
                        <tr>
                            <td className="p-1 border-r border-black font-bold">CLASE/CURSO:</td>
                            <td className="p-1 border-r border-black">{visit.className}</td>
                            <td className="p-1 border-r border-black font-bold">ASIGNATURA:</td>
                            <td className="p-1 border-black">{visit.subject}</td>
                        </tr>
                        <tr>
                             <td className="p-1 border-t border-r border-black font-bold">TEMA:</td>
                             <td colSpan={3} className="p-1 border-t border-black">{visit.topic}</td>
                        </tr>
                         <tr>
                             <td className="p-1 border-t border-r border-black font-bold">ENFOQUE:</td>
                             <td colSpan={3} className="p-1 border-t border-black">{visit.focus}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* RÚBRICA */}
            <section className="mb-4 border border-black">
                <h4 className="bg-gray-200 text-center font-bold border-b border-black p-1">2. DESARROLLO DE LA OBSERVACIÓN (RÚBRICA)</h4>
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-1 w-[30%] text-left">CRITERIO / INDICADOR</th>
                            <th className="border border-black p-1 w-[10%] text-center">VALORACIÓN (1-4)</th>
                            <th className="border border-black p-1 w-[60%] text-left">EVIDENCIAS / OBSERVACIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visit.scores?.map((score, index) => {
                            const criteria = getCriterion(score.criteriaId);
                            return (
                                <tr key={index}>
                                    <td className="border border-black p-2 align-top">
                                        <p className="font-bold">{criteria?.category}</p>
                                        <p className="text-[10px] italic">{criteria?.description}</p>
                                    </td>
                                    <td className="border border-black p-2 text-center font-bold align-top text-sm">
                                        {score.score}
                                    </td>
                                    <td className="border border-black p-2 align-top whitespace-pre-wrap">
                                        {score.evidence || 'Sin evidencia registrada.'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="p-2 border-t border-black flex justify-end items-center gap-2">
                    <span className="font-bold">CALIFICACIÓN PROMEDIO FINAL:</span>
                    <span className="border border-black px-4 py-1 font-bold bg-gray-100 text-lg">{visit.rating?.toFixed(2)} / 4.00</span>
                </div>
            </section>

            {/* CONCLUSIONES */}
            <section className="mb-8 border border-black">
                <h4 className="bg-gray-200 text-center font-bold border-b border-black p-1">3. CONCLUSIONES Y ACUERDOS</h4>
                
                <div className="border-b border-black">
                    <h5 className="p-1 font-bold text-xs bg-gray-50 border-b border-gray-300">FORTALEZAS DESTACADAS:</h5>
                    <div className="p-2 min-h-[60px] whitespace-pre-wrap">{visit.strengths || 'No se registraron fortalezas.'}</div>
                </div>

                <div className="border-b border-black">
                    <h5 className="p-1 font-bold text-xs bg-gray-50 border-b border-gray-300">DEBILIDADES / OPORTUNIDADES DE MEJORA:</h5>
                    <div className="p-2 min-h-[60px] whitespace-pre-wrap">{visit.weaknesses || 'No se registraron debilidades.'}</div>
                </div>

                 <div>
                    <h5 className="p-1 font-bold text-xs bg-gray-50 border-b border-gray-300">ACUERDOS Y COMPROMISOS DE MEJORA:</h5>
                    <div className="p-2 min-h-[60px] whitespace-pre-wrap">{visit.agreements || 'No se establecieron acuerdos.'}</div>
                </div>
            </section>

            {/* FIRMAS */}
            <footer className="grid grid-cols-2 gap-16 mt-12 text-center">
                <div>
                    <div className="border-t border-black w-2/3 mx-auto pt-1"></div>
                    <p className="font-bold">{observer.name}</p>
                    <p>OBSERVADOR / VICERRECTOR</p>
                    <p className="text-[10px] mt-1">CC:</p>
                </div>
                <div>
                    <div className="border-t border-black w-2/3 mx-auto pt-1"></div>
                    <p className="font-bold">{teacher.name}</p>
                    <p>DOCENTE</p>
                    <p className="text-[10px] mt-1">CI:</p>
                </div>
            </footer>
            
            <div className="mt-8 text-[9px] text-center text-gray-500">
                <p>Generado automáticamente por la plataforma de gestión escolar Amauta. {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
};

export default ClassroomVisitPrintable;