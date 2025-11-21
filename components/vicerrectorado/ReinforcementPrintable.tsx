
import React, { useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { ReinforcementPlan, Student, User, Subject, Class } from '../../types';

interface ReinforcementPrintableProps {
    plan: ReinforcementPlan;
    student: Student;
    teacher: User;
    tutor: User;
    subject: Subject;
    classInfo: Class;
    type: 'planning' | 'notification' | 'report';
}

const ReinforcementPrintable: React.FC<ReinforcementPrintableProps> = ({ plan, student, teacher, tutor, subject, classInfo, type }) => {
    const { institution } = useContext(InstitutionContext);

    const Header = () => (
        <header className="flex items-start justify-between border-b-2 border-red-800 pb-2 mb-4">
            <div className="w-1/5">
                {/* Logo Placeholder - replicating the Quito logo position */}
                <div className="text-xs font-bold text-blue-800">Secretaría de Educación</div>
                <div className="text-2xl font-black text-blue-900 leading-none">Quito</div>
                <div className="text-[8px] text-gray-600">Alcaldía Metropolitana</div>
            </div>
            <div className="w-3/5 text-center">
                <h1 className="text-sm font-bold uppercase">{institution?.name}</h1>
                <h2 className="text-xs font-bold">VICERRECTORADO JORNADA MATUTINA</h2>
                <h3 className="text-xs">AÑO LECTIVO {plan.academicYear}</h3>
            </div>
            <div className="w-1/5 flex justify-end">
                 {institution && <img src={institution.logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-full" />}
            </div>
        </header>
    );

    if (type === 'planning') {
        return (
            <div className="bg-white p-8 font-serif text-xs text-gray-900 max-w-[21cm] mx-auto">
                <Header />
                <h2 className="text-center font-bold text-sm my-4 uppercase">FICHA DE PLANIFICACIÓN DE REFUERZO ACADÉMICO</h2>
                <p className="mb-2"><strong>LUGAR Y FECHA:</strong> Quito, {new Date(plan.nominationDate).toLocaleDateString()}</p>
                
                <div className="mb-4">
                    <h3 className="font-bold mb-1">1.- DATOS DE IDENTIFICACIÓN</h3>
                    <table className="w-full border-collapse border-none">
                        <tbody>
                            <tr>
                                <td className="py-1"><strong>Alumno/a:</strong> {student.name}</td>
                                <td className="py-1"><strong>Grado o curso:</strong> {classInfo.name}</td>
                            </tr>
                            <tr>
                                <td className="py-1"><strong>Tutor/a:</strong> {tutor.name}</td>
                                <td className="py-1"><strong>Profesor/a de refuerzo:</strong> {teacher.name}</td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="py-1"><strong>Áreas a reforzar:</strong> {subject.name}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-4">
                    <h3 className="font-bold mb-1">2.- MODALIDAD DE REFUERZO:</h3>
                    <div className="flex gap-8 ml-4">
                        <div>
                            <p>a) ( {plan.modalidad === 'inside_class' ? 'X' : ' '} ) Dentro del aula</p>
                            <p className="ml-4">( {plan.modalidad === 'extra_class' ? 'X' : ' '} ) Extra clase</p>
                        </div>
                        <div>
                             <p>( {plan.groupType === 'small_group' ? 'X' : ' '} ) Pequeño grupo</p>
                             <p>( {plan.groupType === 'individual' ? 'X' : ' '} ) Individual</p>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                        <p><strong>Horario:</strong> {plan.schedule || 'Por definir'}</p>
                        <p><strong>Duración prevista:</strong> {plan.duration || 'Por definir'}</p>
                        <p><strong>Fecha de inicio:</strong> {plan.startDate || 'Por definir'}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <p><strong>3. OBJETIVO:</strong> {plan.generalObjective}</p>
                </div>

                <table className="w-full border-collapse border border-gray-800 text-[10px] mb-4">
                    <thead className="bg-blue-200">
                        <tr>
                            <th className="border border-gray-800 p-2 text-white bg-blue-500">DESTREZAS CON CRITERIO DE DESEMPEÑO</th>
                            <th className="border border-gray-800 p-2 text-white bg-blue-500">ESTRATEGIAS METODOLÓGICAS</th>
                            <th className="border border-gray-800 p-2 text-white bg-blue-500">RECURSOS</th>
                            <th className="border border-gray-800 p-2 text-white bg-blue-500">EVALUACIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plan.topics.map((topic, idx) => (
                            <tr key={idx}>
                                <td className="border border-gray-800 p-2 align-top">{topic.dcd}</td>
                                <td className="border border-gray-800 p-2 align-top">{topic.strategies}</td>
                                <td className="border border-gray-800 p-2 align-top">{topic.resources}</td>
                                <td className="border border-gray-800 p-2 align-top">{topic.evaluationCriteria}</td>
                            </tr>
                        ))}
                        {/* Empty rows filler */}
                        {[...Array(Math.max(0, 4 - plan.topics.length))].map((_, i) => (
                             <tr key={`empty-${i}`}><td className="border border-gray-800 p-4">&nbsp;</td><td className="border border-gray-800 p-4"></td><td className="border border-gray-800 p-4"></td><td className="border border-gray-800 p-4"></td></tr>
                        ))}
                    </tbody>
                </table>

                <div className="mb-8">
                    <p><strong>OBSERVACIONES:</strong> {plan.nominationObservations}</p>
                    <div className="border-b border-dotted border-gray-400 mt-4"></div>
                </div>

                <div className="flex justify-around mt-16 text-center">
                    <div>
                        <div className="border-t border-black w-48 mx-auto mb-1"></div>
                        <p className="font-bold">VICERRECTOR/A</p>
                    </div>
                    <div>
                        <div className="border-t border-black w-48 mx-auto mb-1"></div>
                        <p className="font-bold">DOCENTE/TUTOR</p>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'notification') {
         return (
            <div className="bg-white p-8 font-serif text-xs text-gray-900 max-w-[21cm] mx-auto flex flex-col h-full">
                <Header />
                
                <div className="flex-grow">
                    <h2 className="text-center font-bold text-sm my-6 uppercase">NOTIFICACIÓN A LOS PADRES DE FAMILIA PARA ASISTENCIA A RECUPERACIÓN PEDAGÓGICA</h2>
                    
                    <p className="mb-4"><strong>LUGAR Y FECHA:</strong> Quito, {new Date(plan.notificationDate || Date.now()).toLocaleDateString()}</p>
                    
                    <div className="leading-loose mb-6">
                        <p>Señor representante del estudiante <strong>{student.name}</strong> del <strong>{classInfo.name}</strong>.</p>
                        <p>Por medio de la presente comunico a usted que su representado/a debe asistir al Refuerzo Académico en la asignatura de <strong>{subject.name}</strong>, de acuerdo al siguiente horario:</p>
                    </div>

                    <table className="w-full border-collapse border border-gray-800 mb-12">
                        <thead className="bg-blue-500 text-white">
                            <tr>
                                <th className="border border-gray-800 p-2">Asignatura</th>
                                <th className="border border-gray-800 p-2">Día (s)</th>
                                <th className="border border-gray-800 p-2">Hora (s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-800 p-4 text-center">{subject.name}</td>
                                <td className="border border-gray-800 p-4 text-center">{plan.schedule}</td>
                                <td className="border border-gray-800 p-4 text-center">{plan.duration}</td>
                            </tr>
                        </tbody>
                    </table>

                     <div className="flex justify-center mt-12 text-center">
                        <div>
                            <div className="border-t border-black w-64 mx-auto mb-1"></div>
                            <p className="font-bold">f) Docente Responsable</p>
                            <p>{teacher.name}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-400 pt-8 mt-8">
                    <p className="text-center italic font-bold mb-6">Por favor, COMPLETE, RECORTE Y DEVUELVA esta parte de la notificación:</p>
                    
                    <div className="space-y-4 text-sm">
                        <p>Nombre del padre de familia o representante legal: __________________________________________________________</p>
                        <p>Nombre del estudiante: <strong>{student.name}</strong></p>
                        <p>Grado o curso: <strong>{classInfo.name}</strong></p>
                        
                        <p className="my-6 text-justify">
                            Estoy de acuerdo con las actividades planificadas para el refuerzo académico de mi hijo o representado.
                        </p>

                        <div className="flex justify-between items-end mt-12">
                            <div className="text-center">
                                <div className="border-t border-black w-64 mb-1"></div>
                                <p>f) Padre, Madre o Representante</p>
                            </div>
                            <p>Fecha: __________________________</p>
                        </div>
                    </div>
                </div>
            </div>
         );
    }

    if (type === 'report') {
        return (
            <div className="bg-white p-8 font-serif text-xs text-gray-900 max-w-[21cm] mx-auto">
                <Header />
                <h2 className="text-center font-bold text-sm my-6 uppercase">INFORME INDIVIDUAL DE AVANCES DEL APRENDIZAJE</h2>
                
                <p className="mb-4"><strong>LUGAR Y FECHA:</strong> Quito, {new Date().toLocaleDateString()}</p>
                
                <p className="mb-6 text-justify">
                    El tutor/a y el profesor/a de refuerzo, emiten el presente informe individual para los padres referente a los avances logrados en el proceso de enseñanza aprendizaje por parte de su hijo/a dentro del plan de refuerzo académico.
                </p>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6 space-y-2">
                    <p><strong>Apellidos y nombres del estudiante:</strong> {student.name}</p>
                    <div className="flex gap-8">
                        <p><strong>Grado o curso:</strong> {classInfo.name}</p>
                        <p><strong>Paralelo:</strong> A</p>
                    </div>
                    <p><strong>Tutor:</strong> {tutor.name}</p>
                    <p><strong>Profesor/a de refuerzo:</strong> {teacher.name}</p>
                    <p><strong>Asignatura:</strong> {subject.name}</p>
                    <p><strong>N° de clases a las que asistió:</strong> {plan.sessions.filter(s => s.attendance).length}</p>
                </div>

                <div className="space-y-6 mb-12">
                    <div className="border p-4 rounded min-h-[80px]">
                        <h3 className="font-bold mb-2">a) LOGROS</h3>
                        <p>{plan.finalReport?.achievements || 'No reportado'}</p>
                    </div>
                    <div className="border p-4 rounded min-h-[80px]">
                        <h3 className="font-bold mb-2">b) DIFICULTADES</h3>
                         <p>{plan.finalReport?.difficulties || 'No reportado'}</p>
                    </div>
                    <div className="border p-4 rounded min-h-[80px]">
                        <h3 className="font-bold mb-2">c) SUGERENCIAS</h3>
                         <p>{plan.finalReport?.suggestions || 'No reportado'}</p>
                    </div>
                </div>

                <div className="flex justify-around mt-16 text-center">
                    <div>
                        <div className="border-t border-black w-48 mx-auto mb-1"></div>
                        <p className="font-bold">f) Docente / Tutor</p>
                    </div>
                    <div>
                        <div className="border-t border-black w-48 mx-auto mb-1"></div>
                        <p className="font-bold">f) Padre o Representante Legal</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default ReinforcementPrintable;
