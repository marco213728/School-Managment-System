import React, { useState, useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MOCK_STUDENTS, MOCK_CLASSES } from '../constants';
import { AttendanceStatus, AttendanceRecord, Student, AcademicCalendarEvent, Class, TimeSlot, Timetable, User, Subject, ScheduleEntry } from '../types';
import PieChart from '../components/reports/PieChart';
import { DownloadIcon, PrinterIcon } from '../components/icons/Icons';
import StudentComprehensiveReport from '../components/reports/StudentComprehensiveReport';
import AttendanceMatrixReport from '../components/reports/AttendanceMatrixReport';
import DailyAttendanceBehavioralReport from '../components/reports/DailyAttendanceBehavioralReport';

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
}

const ReportsPage: React.FC<ReportsPageProps> = (props) => {
    const { attendanceRecords, academicCalendarEvents, students, classes, schedule, timeSlots, timetables, users, subjects } = props;
    const { user } = useContext(UserContext);
    const [reportType, setReportType] = useState<'student' | 'class' | 'comprehensive_student' | 'attendance_matrix' | 'daily_attendance_behavior' | ''>('');
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

    const institutionStudents = useMemo(() => students.filter(s => s.institutionId === user?.institutionId), [user, students]);
    const institutionClasses = useMemo(() => classes.filter(c => c.institutionId === user?.institutionId), [user, classes]);
    const institutionAttendance = useMemo(() => attendanceRecords.filter(a => a.institutionId === user?.institutionId), [user, attendanceRecords]);

    const resetReports = () => {
        setAttendanceReportData(null);
        setComprehensiveReportStudentId(null);
        setMatrixReportData(null);
        setDailyReportData(null);
    };

    const handleGenerateReport = () => {
        resetReports();

        if (!reportType || !selectedId) return;
        
        if (reportType === 'daily_attendance_behavior') {
            if (!selectedId || !reportDate) {
                alert('Por favor, seleccione una clase y una fecha.');
                return;
            }
            setDailyReportData({ classId: selectedId, date: reportDate });
            return;
        }

        if (reportType === 'comprehensive_student') {
            setComprehensiveReportStudentId(selectedId);
            return;
        }

        if (reportType === 'attendance_matrix') {
            if (!startDate || !endDate) {
                alert('Por favor, seleccione un rango de fechas.');
                return;
            }
            const classStudents = institutionStudents.filter(s => s.classId === selectedId);
            const studentIdsInClass = classStudents.map(s => s.id);
            const records = institutionAttendance.filter(rec => {
                const isStudentInClass = studentIdsInClass.includes(rec.studentId);
                if (!isStudentInClass) return false;
                
                const recordDate = new Date(rec.date);
                const start = new Date(startDate + 'T00:00:00');
                const end = new Date(endDate + 'T23:59:59');
                return recordDate >= start && recordDate <= end;
            });

            setMatrixReportData({
                students: classStudents,
                records: records,
                className: institutionClasses.find(c => c.id === selectedId)?.name || ''
            });
            return;
        }
        
        let baseAttendanceRecords: AttendanceRecord[] = [];
        let reportName = '';
        const studentMap: Map<string, string> = new Map(institutionStudents.map(s => [s.id, s.name]));

        if (reportType === 'student') {
            baseAttendanceRecords = institutionAttendance.filter(att => att.studentId === selectedId);
            reportName = institutionStudents.find(s => s.id === selectedId)?.name || 'Estudiante Desconocido';
        } else if (reportType === 'class') {
            const studentIdsInClass = institutionStudents.filter(s => s.classId === selectedId).map(s => s.id);
            baseAttendanceRecords = institutionAttendance.filter(att => studentIdsInClass.includes(att.studentId));
            reportName = institutionClasses.find(c => c.id === selectedId)?.name || 'Clase Desconocida';
        }

        const filteredByDate = baseAttendanceRecords.filter(record => {
            const recordDate = new Date(record.date);
            const start = startDate ? new Date(startDate + 'T00:00:00') : null;
            const end = endDate ? new Date(endDate + 'T23:59:59') : null;
            if (start && recordDate < start) return false;
            if (end && recordDate > end) return false;
            return true;
        });
        
        const detailedRecords: DetailedAttendanceRecord[] = filteredByDate.map(rec => ({
            ...rec,
            studentName: studentMap.get(rec.studentId) || 'Desconocido',
        })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const stats = detailedRecords.reduce((acc, record) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
        }, {} as Record<AttendanceStatus, number>);

        const chartData = Object.entries(stats)
            .filter(([, value]) => value > 0)
            .map(([status, value]) => ({
                label: status,
                value,
                color: attendanceColors[status as AttendanceStatus],
            }));
        
        const dateRange = startDate && endDate ? ` de ${startDate} a ${endDate}` : '';
        setAttendanceReportData({ name: `Informe de Asistencia para ${reportName}${dateRange}`, data: chartData, records: detailedRecords });
    };

    const handleDownloadXML = () => {
        if (!attendanceReportData || attendanceReportData.records.length === 0) return;

        const toCdata = (text: string) => `<![CDATA[${text}]]>`;

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<report name="${attendanceReportData.name}">\n`;
        xml += `  <summary>\n`;
        attendanceReportData.data.forEach(item => {
            xml += `    <category name="${item.label}" count="${item.value}" />\n`;
        });
        xml += `  </summary>\n`;
        xml += `  <records>\n`;
        attendanceReportData.records.forEach(rec => {
            xml += `    <record id="${rec.id}">\n`;
            xml += `      <studentId>${rec.studentId}</studentId>\n`;
            xml += `      <studentName>${toCdata(rec.studentName)}</studentName>\n`;
            xml += `      <date>${rec.date}</date>\n`;
            xml += `      <timeSlot>${rec.timeSlot}</timeSlot>\n`;
            xml += `      <status>${rec.status}</status>\n`;
            xml += `      <notes>${rec.notes ? toCdata(rec.notes) : ''}</notes>\n`;
            xml += `    </record>\n`;
        });
        xml += `  </records>\n`;
        xml += `</report>`;

        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_asistencia_${new Date().toISOString().split('T')[0]}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setReportType(e.target.value as any);
        setSelectedId('');
        resetReports();
    }

    const showClassSelector = reportType === 'class' || reportType === 'attendance_matrix' || reportType === 'daily_attendance_behavior';
    const showStudentSelector = reportType === 'student' || reportType === 'comprehensive_student';

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md no-print">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Generador de Informes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">Tipo de Informe</label>
                        <select 
                            id="report-type" 
                            value={reportType}
                            onChange={handleReportTypeChange}
                            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">-- Seleccione --</option>
                            <option value="student">Asistencia por Alumno</option>
                            <option value="class">Asistencia por Clase</option>
                            <option value="attendance_matrix">Registro Matricial de Asistencia</option>
                            <option value="daily_attendance_behavior">Informe Diario de Asistencia</option>
                            <option value="comprehensive_student">Informe Integral del Alumno</option>
                        </select>
                    </div>

                    <div className={`${!reportType ? 'invisible' : ''}`}>
                        <label htmlFor="select-id" className="block text-sm font-medium text-gray-700">
                           {showClassSelector && 'Clase'}
                           {showStudentSelector && 'Alumno'}
                        </label>
                        {(showClassSelector || showStudentSelector) && (
                            <select 
                                id="select-id" 
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">-- Seleccione --</option>
                                {(showClassSelector ? institutionClasses : institutionStudents).map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    
                    {reportType === 'daily_attendance_behavior' && (
                        <div>
                            <label htmlFor="report-date" className="block text-sm font-medium text-gray-700">Fecha del Informe</label>
                            <input type="date" id="report-date" value={reportDate} onChange={e => setReportDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                    )}

                    {(reportType === 'student' || reportType === 'class' || reportType === 'attendance_matrix') && (
                        <>
                            <div>
                                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                                <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                                <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                            </div>
                        </>
                    )}
                </div>
                 {reportType === 'attendance_matrix' && (
                    <div className="mt-4 flex items-center">
                        <input 
                            type="checkbox" 
                            id="exclude-weekends" 
                            checked={excludeWeekends} 
                            onChange={e => setExcludeWeekends(e.target.checked)} 
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="exclude-weekends" className="ml-2 block text-sm text-gray-900">
                            Excluir fines de semana
                        </label>
                    </div>
                )}
                <div className="mt-6 text-right">
                    <button 
                        onClick={handleGenerateReport} 
                        disabled={!reportType || !selectedId}
                        className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Generar Informe
                    </button>
                </div>
            </div>

            {attendanceReportData && (
                 <div id="report-section" className="bg-white p-6 rounded-xl shadow-md space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <h3 className="text-lg font-semibold text-gray-700">{attendanceReportData.name}</h3>
                        <div className="flex-shrink-0 flex items-center gap-2 no-print">
                            <button onClick={handlePrintPDF} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                                <PrinterIcon className="h-4 w-4" />
                                Imprimir / PDF
                            </button>
                            <button onClick={handleDownloadXML} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <DownloadIcon className="h-4 w-4" />
                                Download XML
                            </button>
                        </div>
                    </div>

                    <PieChart data={attendanceReportData.data} />
                    
                    <div>
                        <h4 className="text-md font-semibold text-gray-700 mb-2">Registros Detallados</h4>
                        <div className="overflow-auto border rounded-lg max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        {reportType === 'class' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Franja Horaria</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {attendanceReportData.records.length > 0 ? (
                                        attendanceReportData.records.map(record => (
                                            <tr key={record.id}>
                                                {reportType === 'class' && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.studentName}</td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.timeSlot}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.status}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.notes || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={reportType === 'class' ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                                                No se encontraron registros para el período seleccionado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
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
                <div className="bg-white p-6 rounded-xl shadow-md mt-6">
                    <div className="no-print flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Informe Diario de Asistencia y Comportamiento</h3>
                        <button onClick={handlePrintPDF} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            <PrinterIcon className="h-4 w-4" />
                            Imprimir / PDF
                        </button>
                    </div>
                    <DailyAttendanceBehavioralReport 
                        classId={dailyReportData.classId}
                        date={dailyReportData.date}
                        students={institutionStudents}
                        classes={institutionClasses}
                        attendanceRecords={institutionAttendance}
                        timeSlots={timeSlots}
                        timetables={timetables}
                        users={users}
                        subjects={subjects}
                        schedule={schedule}
                    />
                </div>
            )}
        </div>
    );
};

export default ReportsPage;