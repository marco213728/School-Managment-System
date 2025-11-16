import React, { useContext } from 'react';
import { Class, LeccionarioEntry, ScheduleEntry, Subject, TimeSlot, User } from '../../types';
import { InstitutionContext } from '../../contexts/UserContext';

interface PrintableLeccionarioProps {
    leccionarioEntries: LeccionarioEntry[];
    selectedClass: Class;
    selectedDate: Date;
    scheduleForDay: (ScheduleEntry & { subjectName: string; teacherName: string; timeSlot: TimeSlot })[];
}

const PrintableLeccionario: React.FC<PrintableLeccionarioProps> = ({ leccionarioEntries, selectedClass, selectedDate, scheduleForDay }) => {
    const { institution } = useContext(InstitutionContext);
    
    // Fallback for class name parsing if it doesn't have 3 parts
    const classNameParts = selectedClass.name.split(' ');
    const curso = classNameParts[0] || '';
    const egb = classNameParts[1] || '';
    const paralelo = classNameParts[2] || 'C';

    return (
        <div className="bg-white p-8 font-serif text-xs text-gray-800">
            <h1 className="text-center font-bold text-base">UNIDAD EDUCATIVA MUNICIPAL "{institution?.name.replace('Unidad Educativa Municipal ', '')}"</h1>
            <h2 className="text-center font-bold text-sm mt-2">EDUCACIÓN GENERAL BÁSICA ELEMENTAL (1°, 2°, 3°, 4°)</h2>
            
            <div className="mt-4 border-2 border-black p-1">
                <table className="w-full border-collapse">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1"><strong>CURSO:</strong> {curso} {egb}</td>
                            <td className="border border-black p-1"><strong>PARALELO:</strong> {paralelo}</td>
                            <td className="border border-black p-1"><strong>FECHA:</strong> DIA: {selectedDate.getDate()} MES: {selectedDate.getMonth() + 1} AÑO: {selectedDate.getFullYear()}</td>
                            <td className="border border-black p-1"><strong>No. Leccionario:</strong> {Math.floor(Math.random() * 100)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <table className="w-full border-collapse border-2 border-black mt-2 text-center">
                <thead>
                    <tr className="font-bold">
                        <td className="border border-black p-1 w-[10%]">HORAS</td>
                        <td className="border border-black p-1 w-[15%]">ASIGNATURAS</td>
                        <td className="border border-black p-1 w-[15%]">NOMBRE DEL DOCENTE</td>
                        <td className="border border-black p-1 w-[10%]">CÓDIGO DE DESTREZA</td>
                        <td className="border border-black p-1 w-[20%]">TEMAS</td>
                        <td className="border border-black p-1 w-[20%]">TAREAS</td>
                        <td className="border border-black p-1 w-[10%]">FIRMA</td>
                    </tr>
                </thead>
                <tbody>
                    {scheduleForDay.map((item) => {
                        const entry = leccionarioEntries.find(e => e.timeSlotId === item.timeSlotId);
                        return (
                            <tr key={item.timeSlotId}>
                                <td className="border border-black p-1 h-16">{item.timeSlot.startTime} - {item.timeSlot.endTime}</td>
                                <td className="border border-black p-1">{item.subjectName}</td>
                                <td className="border border-black p-1">{item.teacherName}</td>
                                <td className="border border-black p-1">{entry?.skillCode || ''}</td>
                                <td className="border border-black p-1">{entry?.topics || ''}</td>
                                <td className="border border-black p-1">{entry?.tasks || ''}</td>
                                <td className="border border-black p-1"></td>
                            </tr>
                        );
                    })}
                    {/* Add empty rows if less than 6 lessons */}
                    {Array.from({ length: Math.max(0, 6 - scheduleForDay.length) }).map((_, index) => (
                         <tr key={`empty-${index}`}>
                            <td className="border border-black p-1 h-16">&nbsp;</td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="grid grid-cols-2 mt-2 gap-x-2">
                <div className="border-2 border-black p-1">
                    <p><strong>AULA LIMPIA AL INICIO DE LA JORNADA:</strong> SI ✓ NO __</p>
                </div>
                <div className="border-2 border-black p-1">
                    <p><strong>OBSERVACIONES:</strong></p>
                    <div className="h-12"></div>
                </div>
            </div>

            <div className="grid grid-cols-4 mt-20 text-center text-xs">
                <div className="pt-8 border-t-2 border-black mx-4"><p>INSPECTOR DE CURSO</p></div>
                <div className="pt-8 border-t-2 border-black mx-4"><p>SUB-INSPECTOR GENERAL</p></div>
                <div className="pt-8 border-t-2 border-black mx-4"><p>VICERRECTORADO</p></div>
                <div className="pt-8 border-t-2 border-black mx-4"><p>RESPONSABLE DE CURSO</p></div>
            </div>
        </div>
    );
};

export default PrintableLeccionario;
