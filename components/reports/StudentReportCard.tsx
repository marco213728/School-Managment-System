
import React, { useContext, useMemo } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { Student, Gradebook, Subject, Class, User } from '../../types';

interface StudentReportCardProps {
    student: Student;
    gradebooks: Gradebook[];
    subjects: Subject[];
    classInfo: Class | undefined;
}

const StudentReportCard: React.FC<StudentReportCardProps> = ({ student, gradebooks, subjects, classInfo }) => {
    const { institution } = useContext(InstitutionContext);

    const reportData = useMemo(() => {
        const studentGrades = gradebooks.map(gb => {
            const record = gb.records.find(r => r.studentId === student.id);
            const subject = subjects.find(s => s.id === gb.subjectId);
            
            if (!record || !subject) return null;

            return {
                subjectName: subject.name,
                area: subject.areaOfKnowledge,
                trimester1: record.trimester1.sumaTrimestre,
                trimester2: record.trimester2.sumaTrimestre,
                trimester3: record.trimester3.sumaTrimestre,
                finalAverage: record.notaFinal100,
                observation: record.observacionFinal
            };
        }).filter(Boolean) as {
            subjectName: string;
            area: string;
            trimester1: number;
            trimester2: number;
            trimester3: number;
            finalAverage: number;
            observation: string;
        }[];
        
        // Sort by Area then Subject Name
        return studentGrades.sort((a, b) => {
            if (a.area !== b.area) return a.area.localeCompare(b.area);
            return a.subjectName.localeCompare(b.subjectName);
        });
    }, [student, gradebooks, subjects]);

    const generalAverage = useMemo(() => {
        if (reportData.length === 0) return 0;
        const sum = reportData.reduce((acc, curr) => acc + curr.finalAverage, 0);
        return sum / reportData.length;
    }, [reportData]);

    return (
        <div className="bg-white p-8 font-serif text-gray-800">
            <header className="flex flex-col items-center border-b-2 border-gray-700 pb-4 mb-6">
                <div className="flex items-center gap-4 mb-2">
                    {institution && <img src={institution.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />}
                    <div className="text-center">
                        <h1 className="text-xl font-bold uppercase">{institution?.name}</h1>
                        <p className="text-sm font-bold">BOLETÍN DE CALIFICACIONES - AÑO LECTIVO 2024-2025</p>
                    </div>
                </div>
            </header>

            <section className="mb-6 text-sm">
                <div className="grid grid-cols-2 gap-4 border p-2 rounded">
                    <p><strong>Estudiante:</strong> {student.name}</p>
                    <p><strong>Cédula:</strong> {student.nationalId}</p>
                    <p><strong>Curso:</strong> {classInfo?.name || 'N/A'}</p>
                    <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString()}</p>
                </div>
            </section>

            <table className="w-full border-collapse border border-black text-xs">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border border-black p-2 text-left w-1/3">ASIGNATURA</th>
                        <th className="border border-black p-2 w-[10%]">TRIM 1</th>
                        <th className="border border-black p-2 w-[10%]">TRIM 2</th>
                        <th className="border border-black p-2 w-[10%]">TRIM 3</th>
                        <th className="border border-black p-2 w-[10%] font-bold">NOTA FINAL</th>
                        <th className="border border-black p-2 w-[20%]">OBSERVACIÓN</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.map((row, index) => (
                        <tr key={index} className="text-center">
                            <td className="border border-black p-2 text-left">{row.subjectName}</td>
                            <td className="border border-black p-2">{row.trimester1.toFixed(2)}</td>
                            <td className="border border-black p-2">{row.trimester2.toFixed(2)}</td>
                            <td className="border border-black p-2">{row.trimester3.toFixed(2)}</td>
                            <td className="border border-black p-2 font-bold bg-gray-50">{row.finalAverage.toFixed(2)}</td>
                            <td className="border border-black p-2">{row.observation}</td>
                        </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                        <td className="border border-black p-2 text-right">PROMEDIO GENERAL:</td>
                        <td className="border border-black p-2" colSpan={3}></td>
                        <td className="border border-black p-2">{generalAverage.toFixed(2)}</td>
                        <td className="border border-black p-2"></td>
                    </tr>
                </tbody>
            </table>

            <div className="grid grid-cols-2 gap-20 mt-24 text-center text-sm">
                <div className="border-t border-black pt-2">
                    <p className="font-bold">RECTOR/A</p>
                </div>
                <div className="border-t border-black pt-2">
                    <p className="font-bold">SECRETARIA/O</p>
                </div>
            </div>
            
            <div className="mt-8 text-xs text-gray-500 text-center">
                 <p>Este documento es informativo y no constituye documento legal sin sello y firmas autorizadas.</p>
            </div>
        </div>
    );
};

export default StudentReportCard;
