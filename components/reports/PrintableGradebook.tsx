
import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { Gradebook, Student, Class, Subject, Activity } from '../../types';

interface PrintableGradebookProps {
    gradebook: Gradebook;
    students: Student[];
    subject: Subject;
    classInfo: Class;
    activities: Activity[];
}

const PrintableGradebook: React.FC<PrintableGradebookProps> = ({ gradebook, students, subject, classInfo, activities }) => {
    const { institution } = useContext(InstitutionContext);
    
    const activityMap = new Map(activities.map(a => [a.id, a.title]));
    
    const studentsForGradebook = students
        .filter(s => gradebook.records.some(r => r.studentId === s.id))
        .sort((a,b) => (a.listNumber || 0) - (b.listNumber || 0) || a.name.localeCompare(b.name));

    const getTitle = (activityId: string | undefined, defaultTitle: string) => activityMap.get(activityId || '') || defaultTitle;

    return (
        <div className="bg-white p-8 font-sans text-gray-800 text-[10px] w-full">
            <header className="flex items-center justify-between border-b-2 border-gray-700 pb-2 mb-4">
                <div className="flex items-center gap-4">
                    {institution && <img src={institution.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />}
                    <div>
                        <h1 className="text-lg font-bold uppercase">{institution?.name}</h1>
                        <p className="text-xs">REGISTRO DOCENTE DE CALIFICACIONES - Año Lectivo 2024-2025</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-base font-bold">{subject.name}</h2>
                    <p className="text-xs font-semibold">{classInfo.name}</p>
                </div>
            </header>

            <table className="w-full border-collapse border border-black">
                <thead className="bg-gray-100 text-[9px] uppercase">
                    <tr>
                        <th rowSpan={4} className="border border-black p-1 w-48 text-left">Estudiante</th>
                        {([1, 2, 3] as const).map(trim => (
                            <th key={trim} colSpan={8} className="border border-black p-1">TRIMESTRE {trim}</th>
                        ))}
                        <th colSpan={6} className="border border-black p-1">Resumen Final</th>
                    </tr>
                    <tr>
                        {([1, 2, 3] as const).map(trim => (
                            <React.Fragment key={trim}>
                                <th colSpan={5} className="border border-black p-1">Formativa (45%)</th>
                                <th rowSpan={3} className="border border-black p-1 rotate-text-print w-4">Port. (5%)</th>
                                <th rowSpan={3} className="border border-black p-1 rotate-text-print w-4">Sumat. (25%)</th>
                                <th rowSpan={3} className="border border-black p-1 rotate-text-print w-4">Proy. (25%)</th>
                            </React.Fragment>
                        ))}
                        <th rowSpan={3} className="border border-black p-1 w-6">Prom. Final</th>
                        <th rowSpan={3} className="border border-black p-1 w-6">Proy. Final</th>
                        <th rowSpan={3} className="border border-black p-1 w-6">Nota 100%</th>
                        <th rowSpan={3} className="border border-black p-1 w-6">Supletorio</th>
                        <th rowSpan={3} className="border border-black p-1 w-6">Nota Final</th>
                        <th rowSpan={3} className="border border-black p-1 w-8">Estado</th>
                    </tr>
                    <tr>
                        {([1, 2, 3] as const).map(trim => (
                            <React.Fragment key={trim}>
                                {[0, 1, 2, 3, 4].map(idx => (
                                    <th key={idx} className="border border-black p-0.5 w-4">
                                        <div className="truncate w-4" title={getTitle(gradebook.records[0]?.[`trimester${trim}` as 'trimester1'|'trimester2'|'trimester3']?.actividades[idx]?.activityId, `A${idx+1}`)}>A{idx+1}</div>
                                    </th>
                                ))}
                            </React.Fragment>
                        ))}
                    </tr>
                     <tr>
                        {([1, 2, 3] as const).map(trim => (
                            <React.Fragment key={trim}>
                                {[0, 1, 2, 3, 4].map(idx => (
                                    <th key={idx} className="border border-black p-0.5">N</th>
                                ))}
                            </React.Fragment>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {studentsForGradebook.map((student) => {
                        const record = gradebook.records.find(r => r.studentId === student.id);
                        if (!record) return null;
                        return (
                            <tr key={student.id} className="text-center">
                                <td className="border border-black p-1 text-left whitespace-nowrap overflow-hidden text-[9px]">{student.listNumber}. {student.name}</td>
                                {([record.trimester1, record.trimester2, record.trimester3] as const).map((trim, i) => (
                                    <React.Fragment key={i}>
                                        {trim.actividades.map((act, actIndex) => (
                                            <td key={actIndex} className="border border-black p-0.5 bg-white">{act.promedio ? act.promedio.toFixed(1) : '-'}</td>
                                        ))}
                                        <td className="border border-black p-0.5 bg-white">{trim.portafolio.promedio ? trim.portafolio.promedio.toFixed(1) : '-'}</td>
                                        <td className="border border-black p-0.5 bg-white">{trim.evaluacionSumativa.promedio ? trim.evaluacionSumativa.promedio.toFixed(1) : '-'}</td>
                                        <td className="border border-black p-0.5 bg-white font-bold bg-gray-100">{trim.sumaTrimestre.toFixed(2)}</td>
                                    </React.Fragment>
                                ))}
                                <td className="border border-black p-0.5 font-bold">{record.promedioTrimestralFinal.toFixed(2)}</td>
                                <td className="border border-black p-0.5">{record.proyectoFinal10.promedio ? record.proyectoFinal10.promedio.toFixed(2) : '-'}</td>
                                <td className="border border-black p-0.5 font-bold">{record.notaFinal100.toFixed(2)}</td>
                                <td className="border border-black p-0.5">{record.examenSupletorio !== undefined ? record.examenSupletorio : '-'}</td>
                                <td className="border border-black p-0.5 font-bold bg-gray-100">{record.notaFinalConSupletorio?.toFixed(2) || record.notaFinal100.toFixed(2)}</td>
                                <td className="border border-black p-0.5 text-[8px]">{record.observacionFinal === 'Aprobado' ? 'APR' : record.observacionFinal === 'Reprobado' ? 'REP' : 'SUP'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="mt-4 text-[10px]">
                <p><strong>Referencia:</strong> A1-A5: Actividades Formativas, Port: Portafolio, Sumat: Evaluación Sumativa, Proy: Proyecto Integrador.</p>
                <p><strong>Leyenda:</strong> APR: Aprobado, REP: Reprobado, SUP: Supletorio/Pendiente.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-20 mt-16 text-center">
                <div className="border-t border-black pt-2">
                    <p className="font-bold">DOCENTE</p>
                </div>
                <div className="border-t border-black pt-2">
                    <p className="font-bold">VICERRECTORADO</p>
                </div>
            </div>
        </div>
    );
};

export default PrintableGradebook;
