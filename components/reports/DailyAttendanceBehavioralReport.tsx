import React, { useMemo, useContext } from 'react';
import { Student, AttendanceRecord, AttendanceStatus, Class, TimeSlot, Timetable, User, Subject, Role, ScheduleEntry } from '../../types';
import { InstitutionContext } from '../../contexts/UserContext';
import { OBLIGACIONES_ESTUDIANTILES, REGIMEN_DISCIPLINARIO, ATTENDANCE_OBSERVATIONS } from '../../constants';

interface DailyAttendanceBehavioralReportProps {
    classId: string;
    date: string; // YYYY-MM-DD
    students: Student[];
    classes: Class[];
    attendanceRecords: AttendanceRecord[];
    timeSlots: TimeSlot[];
    timetables: Timetable[];
    users: User[];
    subjects: Subject[];
    schedule: ScheduleEntry[];
}

const DailyAttendanceBehavioralReport: React.FC<DailyAttendanceBehavioralReportProps> = (props) => {
    const { classId, date, students, classes, attendanceRecords, timeSlots, timetables, users, subjects, schedule } = props;
    const { institution } = useContext(InstitutionContext);

    const reportData = useMemo(() => {
        const selectedClass = classes.find(c => c.id === classId);
        if (!selectedClass) return null;

        const studentsInClass = students.filter(s => s.classId === classId).sort((a,b) => (a.listNumber || 0) - (b.listNumber || 0) || a.name.localeCompare(b.name));
        
        const timetable = timetables.find(t => t.id === selectedClass.timetableId);
        const dailyTimeSlots = timeSlots
            .filter(ts => ts.timetableId === timetable?.id && !ts.isBreak)
            .sort((a,b) => a.startTime.localeCompare(b.startTime))
            .slice(0, 6);

        // Find a teacher for the class to display on the report
        const scheduleForClass = schedule.filter(s => s.classId === classId);
        let teacherName = 'N/A';
        if (scheduleForClass.length > 0) {
            const firstSubjectId = scheduleForClass[0].subjectId;
            const firstSubject = subjects.find(s => s.id === firstSubjectId);
            if (firstSubject) {
                const teacher = users.find(u => u.id === firstSubject.teacherId);
                if (teacher) teacherName = teacher.name.replace('Prof. ', '');
            }
        }
        
        const absentStudents = new Set<string>();

        const studentRecords = studentsInClass.map(student => {
            const records = dailyTimeSlots.map(slot => {
                const record = attendanceRecords.find(r => 
                    r.studentId === student.id && 
                    r.date === date && 
                    r.timeSlot === `${slot.startTime}-${slot.endTime}`
                );

                if (!record) return null;

                const codes = [];
                switch(record.status) {
                    case AttendanceStatus.Tardy: codes.push('A'); break;
                    case AttendanceStatus.Excused: codes.push('J'); break;
                    case AttendanceStatus.Unexcused:
                    case AttendanceStatus.Absent:
                    case AttendanceStatus.JustificationPending:
                        codes.push('F');
                        absentStudents.add(student.id);
                        break;
                }
                if (record.observations) {
                    codes.push(...record.observations);
                }
                return codes.join(', ');
            });
            return { student, records };
        });

        return {
            className: selectedClass.name,
            teacherName,
            studentRecords,
            dailyTimeSlots,
            totalAbsences: absentStudents.size
        }
    }, [classId, date, students, classes, attendanceRecords, timeSlots, timetables, users, subjects, schedule]);

    if (!reportData) {
        return <div className="p-4">No se pudo generar el informe. Verifique que la clase y fecha sean correctas.</div>;
    }
    
    const { className, teacherName, studentRecords, dailyTimeSlots, totalAbsences } = reportData;

    return (
        <div id="daily-attendance-report-section" className="bg-white p-4 font-sans text-gray-800 text-[6px] leading-tight">
             <header className="flex justify-between items-center mb-2">
                <h1 className="font-bold text-[8px]">CONTROL DE ASISTENCIA Y COMPORTAMENTAL ESTUDIANTIL</h1>
                <div className="text-right font-bold text-[8px]">
                    <p>LIC. {teacherName.toUpperCase()}</p>
                    <p>AULA 1</p>
                </div>
            </header>
            
            <div className="flex gap-2">
                {/* Main Content */}
                <div className="flex-grow">
                    <table className="w-full border-collapse border border-black">
                        <thead>
                            <tr className="font-bold text-center">
                                <td className="border border-black p-0.5 w-[3%]">N.</td>
                                <td className="border border-black p-0.5 w-[30%]">Estudiante</td>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <td key={i} className="border border-black p-0.5 w-[5%]">{i + 1}</td>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {studentRecords.map(({ student, records }, index) => (
                                <tr key={student.id}>
                                    <td className="border border-black p-0.5 text-center">{student.listNumber || index + 1}</td>
                                    <td className="border border-black p-0.5">{student.name}</td>
                                    {records.map((rec, i) => (
                                        <td key={i} className="border border-black p-0.5 text-center font-bold text-red-600">{rec}</td>
                                    ))}
                                </tr>
                            ))}
                            {/* Fill empty rows up to 40 */}
                            {Array.from({ length: 40 - studentRecords.length }).map((_, i) => (
                                 <tr key={`empty-${i}`}>
                                    <td className="border border-black p-0.5 h-3 text-center">{studentRecords.length + i + 1}</td>
                                    <td className="border border-black p-0.5"></td>
                                    <td className="border border-black p-0.5"></td>
                                    <td className="border border-black p-0.5"></td>
                                    <td className="border border-black p-0.5"></td>
                                    <td className="border border-black p-0.5"></td>
                                    <td className="border border-black p-0.5"></td>
                                    <td className="border border-black p-0.5"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-end mt-1">
                        <div className="border border-black p-0.5 font-bold flex">
                            <span>TOTAL DE ESTUDIANTES INASISTENTES:</span>
                            <span className="w-8 text-center">{totalAbsences}</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-[40%] flex-shrink-0 space-y-1">
                    <div className="border border-black p-1">
                        <p className="font-bold">Art. 8.- Obligaciones y Responsabilidades.- <span className="font-normal">Las y los estudiantes tienen las siguientes obligaciones y responsabilidades:</span></p>
                        <ul className="space-y-0.5 mt-0.5">
                            {Object.entries(OBLIGACIONES_ESTUDIANTILES).map(([key, value]) => (
                                <li key={key}><span className="font-bold mr-1">{key}.</span>{value}</li>
                            ))}
                        </ul>
                    </div>
                     <div className="border border-black p-1">
                        <p className="font-bold">Art. 134.- Del régimen disciplinario de las y los estudiantes.- <span className="font-normal">La Junta Distrital de Resolución de Conflictos está en la obligación de aplicar las acciones educativas disciplinarias para las y los estudiantes, siempre y cuando tengan relación con violencia escolar o acoso escolar.</span></p>
                         <ul className="space-y-0.5 mt-0.5">
                            {Object.entries(REGIMEN_DISCIPLINARIO).map(([key, value]) => (
                                <li key={key}><span className="font-bold mr-1">{key}.</span>{value}</li>
                            ))}
                        </ul>
                    </div>
                     <div className="border border-black p-1">
                        <p className="font-bold">Faltas recurrentes de los estudiantes</p>
                         <ul className="space-y-0.5 mt-0.5">
                            {Object.entries(ATTENDANCE_OBSERVATIONS).map(([key, value]) => (
                                <li key={key} className="flex"><span className="font-bold w-4">{key}</span><span>{value}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyAttendanceBehavioralReport;