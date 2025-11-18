
import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MOCK_STUDENTS, MOCK_CLASSES } from '../constants';
import { AttendanceStatus, AttendanceRecord, Student, AcademicCalendarEvent, Class, TimeSlot, Timetable, User, Subject, ScheduleEntry, Gradebook } from '../types';
import PieChart from '../components/reports/PieChart';
import { DownloadIcon, PrinterIcon } from '../components/icons/Icons';
import StudentComprehensiveReport from '../components/reports/StudentComprehensiveReport';
import AttendanceMatrixReport from '../components/reports/AttendanceMatrixReport';
import DailyAttendanceBehavioralReport from '../components/reports/DailyAttendanceBehavioralReport';
import StudentReportCard from '../components/reports/StudentReportCard';

const attendanceColors: Record<AttendanceStatus, string> = {
    [AttendanceStatus.Present]: '#4ade80', // green-400
    [AttendanceStatus.Tardy]: '#facc15', // yellow-400
    [AttendanceStatus.Unexcused]: '#f87171', // red-400
    [AttendanceStatus.Excused]: '#60a5fa', // blue-400
    [AttendanceStatus.Absent]: '#fb923c', // orange-400
    [AttendanceStatus.JustificationPending]: '#c084fc', // purple-400
};

type DetailedAttendanceRecord = AttendanceRecord & { studentName: string };

interface ReportsPageProps {
    attendanceRecords: AttendanceRecord[];
    academicCalendarEvents: AcademicCalendarEvent[];
    students: Student[];
    classes: Class[];
    schedule: ScheduleEntry[];
    timeSlots: TimeSlot[];
    timetables: Timetable[];
    users: User[];
    subjects: Subject[];
    gradebooks?: Gradebook[];
}

const ReportsPage: React.FC<ReportsPageProps> = (props) => {
    const { attendanceRecords, academicCalendarEvents, students, classes, schedule, timeSlots, timetables, users, subjects, gradebooks = [] } = props;
    const { user } = useContext(UserContext);
    const [reportType, setReportType] = useState<'student' | 'class' | 'comprehensive_student' | 'attendance_matrix' | 'daily_attendance_behavior' | 'student_report_card' | ''>('');
    const [selectedId, setSelectedId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [excludeWeekends, setExcludeWeekends] = useState(false);
    
    const [attendanceReportData, setAttendanceReportData] = useState<{ 
        name: string; 
        data: { label: string; value: number; color: string; }[];
        records: DetailedAttendanceRecord[];
    } | null>(null);
    const [comprehensiveReportStudentId, setComprehensiveReportStudentId] = useState<string | null>(null);
    const [matrixReportData, setMatrixReportData] = useState<{
        students: Student[];
        records: AttendanceRecord[];
        className: string;
    } | null>(null);
    const [dailyReportData, setDailyReportData] = useState<{ classId: string; date: string } | null>(null);
    const [studentReportCardId, setStudentReportCardId] = useState<string | null>(null);

    const institutionStudents = useMemo(() => students.filter(s => s.institutionId === user?.institutionId), [user, students]);
    const institutionClasses = useMemo(() => classes.filter(c => c.institutionId === user?.institutionId), [user, classes]);
    const institutionAttendance = useMemo(() => attendanceRecords.filter(a => a.institutionId === user?.institutionId), [user, attendanceRecords]);

    const resetReports = () => {
        setAttendanceReportData(null);
        setComprehensiveReportStudentId(null);
        setMatrixReportData(null);
        setDailyReportData(null);
        setStudentReportCardId(null);
    };
    
    const handleGenerateReport = () => {
        resetReports();
        if (!selectedId && reportType !== 'daily_attendance_behavior' && reportType !== 'student_report_card') return;
        if (reportType === 'daily_attendance_behavior' && !selectedId) return; // selectedId holds classId here
        if (reportType === 'student_report_card' && !selectedId) return;

        if (reportType === 'student') {
            const student = institutionStudents.find(s => s.id === selectedId);
            if (student) {
                // Generate chart data
                const studentRecords = institutionAttendance.filter(r => r.studentId === selectedId);
                const counts = studentRecords.reduce((acc, curr) => {
                    acc[curr.status] = (acc[curr.status] || 0) + 1;
                    return acc;
                }, {} as Record<AttendanceStatus, number>);
                
                const data = Object.entries(counts).map(([status, value]) => ({
                    label: status,
                    value,
                    color: attendanceColors[status as AttendanceStatus]
                }));

                const detailedRecords = studentRecords.map(r => ({...r, studentName: student.name}));
                setAttendanceReportData({ name: student.name, data, records: detailedRecords });
            }
        } else if (reportType === 'class') {
            const cls = institutionClasses.find(c => c.id === selectedId);
            if (cls) {
                 // Generate chart data for class
                 const studentIds = cls.studentIds;
                 const classRecords = institutionAttendance.filter(r => studentIds.includes(r.studentId));
                  const counts = classRecords.reduce((acc, curr) => {
                    acc[curr.status] = (acc[curr.status] || 0) + 1;
                    return acc;
                }, {} as Record<AttendanceStatus, number>);

                const data = Object.entries(counts).map(([status, value]) => ({
                    label: status,
                    value,
                    color: attendanceColors[status as AttendanceStatus]
                }));
                
                 const detailedRecords = classRecords.map(r => {
                     const s = institutionStudents.find(st => st.id === r.studentId);
                     return {...r, studentName: s?.name || 'Desconocido'};
                 });

                 setAttendanceReportData({ name: cls.name, data, records: detailedRecords });
            }
        } else if (reportType === 'comprehensive_student') {
             setComprehensiveReportStudentId(selectedId);
        } else if (reportType === 'attendance_matrix') {
            const cls = institutionClasses.find(c => c.id === selectedId);
            if (cls) {
                const studentsInClass = institutionStudents.filter(s => s.classId === cls.id).sort((a,b) => (a.listNumber || 0) - (b.listNumber || 0));
                const records = institutionAttendance.filter(r => studentsInClass.some(s => s.id === r.studentId));
                
                setMatrixReportData({
                    students: studentsInClass,
                    records: records,
                    className: cls.name
                });
            }
        } else if (reportType === 'daily_attendance_behavior') {
            setDailyReportData({ classId: selectedId, date: reportDate });
        } else if (reportType === 'student_report_card') {
            setStudentReportCardId(selectedId);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informes y Estadísticas</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-md no-print">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Informe</label>
                        <select 
                            value={reportType} 
                            onChange={e => { setReportType(e.target.value as any); setSelectedId(''); resetReports(); }} 
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Seleccionar Tipo</option>
                            <option value="student">Asistencia por Estudiante (Gráfico)</option>
                            <option value="class">Asistencia por Clase (Gráfico)</option>
                            <option value="attendance_matrix">Matriz de Asistencia (Mensual/Periodo)</option>
                            <option value="daily_attendance_behavior">Reporte Diario de Asistencia y Comportamiento</option>
                            <option value="comprehensive_student">Informe Integral del Estudiante (DECE, Salud, etc.)</option>
                            <option value="student_report_card">Boletín de Calificaciones</option>
                        </select>
                    </div>
                    
                    {reportType && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {['student', 'comprehensive_student', 'student_report_card'].includes(reportType) ? 'Seleccionar Estudiante' : 'Seleccionar Clase'}
                            </label>
                            <select 
                                value={selectedId} 
                                onChange={e => setSelectedId(e.target.value)} 
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="">Seleccionar...</option>
                                {['student', 'comprehensive_student', 'student_report_card'].includes(reportType) 
                                    ? institutionStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                    : institutionClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                }
                            </select>
                        </div>
                    )}
                </div>
                
                {reportType === 'attendance_matrix' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                             <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded-md" />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={excludeWeekends} onChange={e => setExcludeWeekends(e.target.checked)} className="mr-2 h-4 w-4 text-primary-600 rounded" />
                                Excluir fines de semana
                            </label>
                        </div>
                    </div>
                )}

                {reportType === 'daily_attendance_behavior' && (
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Reporte</label>
                        <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                )}

                <div className="flex justify-end">
                    <button 
                        onClick={handleGenerateReport} 
                        disabled={!selectedId || (reportType === 'attendance_matrix' && (!startDate || !endDate))}
                        className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Generar Informe
                    </button>
                </div>
            </div>

            {attendanceReportData && (
                <div className="bg-white p-6 rounded-xl shadow-md mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Informe de Asistencia: {attendanceReportData.name}</h3>
                    <PieChart data={attendanceReportData.data} />
                </div>
            )}

            {comprehensiveReportStudentId && (
                <StudentComprehensiveReport studentId={comprehensiveReportStudentId} />
            )}

            {matrixReportData && startDate && endDate && (
                <AttendanceMatrixReport
                    students={matrixReportData.students}
                    attendanceRecords={matrixReportData.records}
                    startDate={startDate}
                    endDate={endDate}
                    className={matrixReportData.className}
                    academicCalendarEvents={academicCalendarEvents}
                    excludeWeekends={excludeWeekends}
                />
            )}

            {dailyReportData && (
                <DailyAttendanceBehavioralReport 
                    classId={dailyReportData.classId}
                    date={dailyReportData.date}
                    students={institutionStudents}
                    classes={institutionClasses}
                    attendanceRecords={attendanceRecords}
                    timeSlots={timeSlots}
                    timetables={timetables}
                    users={users}
                    subjects={subjects}
                    schedule={schedule}
                />
            )}

            {studentReportCardId && (
                 <StudentReportCard 
                    student={institutionStudents.find(s => s.id === studentReportCardId)!}
                    gradebooks={gradebooks}
                    subjects={subjects}
                    classInfo={institutionClasses.find(c => c.id === institutionStudents.find(s => s.id === studentReportCardId)?.classId)}
                 />
            )}
        </div>
    );
};

export default ReportsPage;
