
import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { JuntaDeCurso, SubjectReport, Student, User, Class } from '../../types';

interface PrintableJuntaActaProps {
    junta: JuntaDeCurso;
    reports: SubjectReport[];
    students: Student[];
    users: User[];
    classInfo: Class;
}

const PrintableJuntaActa: React.FC<PrintableJuntaActaProps> = ({ junta, reports, students, users, classInfo }) => {
    const { institution } = useContext(InstitutionContext);
    const tutor = users.find(u => u.id === classInfo.tutorId);

    return (
        <div className="bg-white p-8 font-serif text-xs text-gray-900 max-w-[21cm] mx-auto">
            {/* Header */}
             <header className="flex items-start justify-between border-b-2 border-gray-800 pb-2 mb-4">
                <div className="w-1/5">
                    {/* Logo Placeholder - replicating the Quito logo position */}
                    <div className="text-xs font-bold text-blue-800">Secretaría de Educación</div>
                    <div className="text-2xl font-black text-blue-900 leading-none">Quito</div>
                    <div className="text-[8px] text-gray-600">Alcaldía Metropolitana</div>
                </div>
                <div className="w-3/5 text-center">
                    <h1 className="text-sm font-bold uppercase">{institution?.name}</h1>
                    <h2 className="text-xs font-bold">VICERRECTORADO JORNADA MATUTINA</h2>
                    <h3 className="text-xs">AÑO LECTIVO {junta.academicYear}</h3>
                    <h3 className="text-sm font-bold mt-2 border-t border-gray-300 pt-1">ACTA DE LA JUNTA TRIMESTRAL DE DOCENTES DE GRADO</h3>
                </div>
                <div className="w-1/5 flex justify-end">
                     {institution && <img src={institution.logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-full" />}
                </div>
            </header>

            {/* 1. Datos Informativos */}
            <section className="mb-4 border border-black">
                <h4 className="bg-gray-200 font-bold border-b border-black p-1 pl-2">1. DATOS INFORMATIVOS</h4>
                <table className="w-full text-xs">
                    <tbody>
                        <tr>
                            <td className="p-1 border-r border-b border-black font-bold w-[20%]">DOCENTE TUTOR:</td>
                            <td className="p-1 border-r border-b border-black w-[40%]">{tutor?.name || 'N/A'}</td>
                            <td className="p-1 border-r border-b border-black font-bold w-[15%]">HORA INICIO:</td>
                            <td className="p-1 border-b border-black">{junta.startTime || '00:00'}</td>
                        </tr>
                        <tr>
                            <td className="p-1 border-r border-b border-black font-bold">CURSO / NIVEL:</td>
                            <td className="p-1 border-r border-b border-black">{classInfo.name}</td>
                            <td className="p-1 border-r border-b border-black font-bold">HORA FIN:</td>
                            <td className="p-1 border-b border-black">{junta.endTime || '00:00'}</td>
                        </tr>
                         <tr>
                            <td className="p-1 border-r border-black font-bold">FECHA:</td>
                            <td className="p-1 border-r border-black">{new Date(junta.date).toLocaleDateString()}</td>
                            <td className="p-1 border-r border-black font-bold">TIPO:</td>
                            <td className="p-1 border-black">ORDINARIA</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* 2. Orden del Día */}
            <section className="mb-4 border border-black">
                <h4 className="bg-gray-200 font-bold border-b border-black p-1 pl-2">2. ORDEN DEL DÍA</h4>
                 <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-black p-1 text-left w-[70%]">PUNTOS TRATADOS</th>
                            <th className="border border-black p-1">SÍ</th>
                            <th className="border border-black p-1">NO</th>
                            <th className="border border-black p-1 w-[20%]">OBSERVACIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="border border-black p-1">1. Constatación del quórum</td><td className="border border-black p-1 text-center">X</td><td className="border border-black p-1"></td><td className="border border-black p-1"></td></tr>
                        <tr><td className="border border-black p-1">2. Informe general del docente Tutor</td><td className="border border-black p-1 text-center">X</td><td className="border border-black p-1"></td><td className="border border-black p-1"></td></tr>
                        <tr><td className="border border-black p-1">3. Informe de docentes por asignaturas</td><td className="border border-black p-1 text-center">X</td><td className="border border-black p-1"></td><td className="border border-black p-1"></td></tr>
                        <tr><td className="border border-black p-1">4. Lectura de estudiantes con nota &lt; 7</td><td className="border border-black p-1 text-center">X</td><td className="border border-black p-1"></td><td className="border border-black p-1"></td></tr>
                        <tr><td className="border border-black p-1">5. Presentación de actas de compromiso</td><td className="border border-black p-1 text-center">X</td><td className="border border-black p-1"></td><td className="border border-black p-1"></td></tr>
                        <tr><td className="border border-black p-1">6. Informe del DECE e Inspección</td><td className="border border-black p-1 text-center">X</td><td className="border border-black p-1"></td><td className="border border-black p-1"></td></tr>
                        <tr><td className="border border-black p-1">7. Análisis de estímulos</td><td className="border border-black p-1 text-center">X</td><td className="border border-black p-1"></td><td className="border border-black p-1"></td></tr>
                        <tr><td className="border border-black p-1">8. Resoluciones</td><td className="border border-black p-1 text-center">X</td><td className="border border-black p-1"></td><td className="border border-black p-1"></td></tr>
                    </tbody>
                </table>
            </section>

            {/* 3. Asistentes (Implicit based on user list or could be explicit) */}
            
            {/* 4. Desarrollo - Analisis */}
            <section className="mb-4 border border-black">
                <h4 className="bg-gray-200 font-bold border-b border-black p-1 pl-2">5. DESARROLLO - ANÁLISIS DE RENDIMIENTO</h4>
                
                {/* Aggregate Difficulties */}
                <div className="p-2">
                    <p className="font-bold mb-2">5.1 Estudiantes con Rendimiento Menor a 7 (Reporte Consolidado)</p>
                    <table className="w-full text-[10px] border-collapse border border-gray-400">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-400 p-1">Estudiante</th>
                                <th className="border border-gray-400 p-1">Asignatura</th>
                                <th className="border border-gray-400 p-1">Dificultad Reportada</th>
                                <th className="border border-gray-400 p-1">Promedio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.flatMap(r => r.difficulties.map(d => ({...d, subjectName: 'Asignatura'}))).map((diff, idx) => { // Mock subject name lookup for brevity
                                const studentName = students.find(s => s.id === diff.studentId)?.name || 'N/A';
                                // Find report to get subject name properly if possible
                                const report = reports.find(r => r.difficulties.includes(diff as any)); // Simplified linkage check
                                // In real app, we'd pass subjects array to look up report.subjectId
                                return (
                                    <tr key={idx}>
                                        <td className="border border-gray-400 p-1">{studentName}</td>
                                        <td className="border border-gray-400 p-1">...</td> 
                                        <td className="border border-gray-400 p-1">{diff.difficulty}</td>
                                        <td className="border border-gray-400 p-1 text-center">{diff.minGrade}</td>
                                    </tr>
                                );
                            })}
                            {reports.every(r => r.difficulties.length === 0) && <tr><td colSpan={4} className="border border-gray-400 p-1 text-center">Sin novedades académicas mayores reportadas.</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="p-2 border-t border-black">
                     <p className="font-bold mb-1">5.2 Informes Adicionales</p>
                     <p>{junta.generatedDeceReport || 'Informe DECE: Sin novedades.'}</p>
                     <p>{junta.generatedInspectionReport || 'Informe Inspección: Sin novedades.'}</p>
                </div>

                <div className="p-2 border-t border-black">
                     <p className="font-bold mb-1">5.4 Estímulo Académico (Top 3)</p>
                     {junta.stimulusAwards && junta.stimulusAwards.length > 0 ? (
                         <ul className="list-decimal list-inside">
                             {junta.stimulusAwards.map((s, i) => (
                                 <li key={i}>{students.find(st => st.id === s.studentId)?.name} - {s.reason}</li>
                             ))}
                         </ul>
                     ) : <p>Pendiente de cálculo.</p>}
                </div>
            </section>

             {/* 6. Resoluciones */}
             <section className="mb-8 border border-black">
                <h4 className="bg-gray-200 font-bold border-b border-black p-1 pl-2">6. RESOLUCIONES</h4>
                <div className="p-2 min-h-[60px] whitespace-pre-wrap">
                    {junta.resolutions || 'Se aprueban los informes presentados y se establecen los compromisos de refuerzo académico.'}
                </div>
            </section>

            {/* Firmas */}
             <footer className="grid grid-cols-2 gap-16 mt-12 text-center">
                <div>
                    <div className="border-t border-black w-2/3 mx-auto pt-1"></div>
                    <p className="font-bold">{tutor?.name}</p>
                    <p>DOCENTE TUTOR</p>
                </div>
                <div>
                    <div className="border-t border-black w-2/3 mx-auto pt-1"></div>
                    <p className="font-bold">SECRETARIO/A</p>
                </div>
            </footer>
        </div>
    );
};

export default PrintableJuntaActa;
