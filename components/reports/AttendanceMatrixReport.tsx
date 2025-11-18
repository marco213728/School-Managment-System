import React, { useMemo, useContext } from 'react';
import { Student, AttendanceRecord, AttendanceStatus, AcademicCalendarEvent } from '../../types';
import { InstitutionContext } from '../../contexts/UserContext';
import { PrinterIcon } from '../icons/Icons';

interface AttendanceMatrixReportProps {
    students: Student[];
    attendanceRecords: AttendanceRecord[];
    startDate: string;
    endDate: string;
    className: string;
    academicCalendarEvents: AcademicCalendarEvent[];
    excludeWeekends: boolean;
}

const AttendanceMatrixReport: React.FC<AttendanceMatrixReportProps> = ({ students, attendanceRecords, startDate, endDate, className, academicCalendarEvents, excludeWeekends }) => {
    const { institution } = useContext(InstitutionContext);

    const dateRangeWithInfo = useMemo(() => {
        const dates: { date: Date; isOff: boolean; reason: string }[] = [];
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
        let current = new Date(start);

        const offDayEvents = new Map<string, string>();
        academicCalendarEvents.forEach(event => {
            let d = new Date(event.startDate + 'T00:00:00');
            const endEvent = new Date(event.endDate + 'T00:00:00');
            while (d <= endEvent) {
                offDayEvents.set(d.toISOString().split('T')[0], event.name);
                d.setDate(d.getDate() + 1);
            }
        });

        while (current <= end) {
            const currentDateString = current.toISOString().split('T')[0];
            const dayOfWeek = current.getDay();
            const holidayName = offDayEvents.get(currentDateString);
            
            let isOff = false;
            let reason = '';

            if (holidayName) {
                isOff = true;
                reason = holidayName;
            } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
                isOff = true;
                reason = 'FIN DE SEMANA';
            }

            dates.push({ date: new Date(current), isOff, reason });
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }, [startDate, endDate, academicCalendarEvents]);

    const displayDates = useMemo(() => {
        if (excludeWeekends) {
            return dateRangeWithInfo.filter(d => d.reason !== 'FIN DE SEMANA');
        }
        return dateRangeWithInfo;
    }, [dateRangeWithInfo, excludeWeekends]);

    const workingDays = useMemo(() => {
        return dateRangeWithInfo.filter(d => !d.isOff);
    }, [dateRangeWithInfo]);

    const workingDayNumberMap = useMemo(() => {
        const map = new Map<string, number>();
        workingDays.forEach((day, index) => {
            map.set(day.date.toISOString().split('T')[0], index + 1);
        });
        return map;
    }, [workingDays]);

    const totalWorkingDays = workingDays.length;

    const groupedDates = useMemo(() => {
        return displayDates.reduce<Record<string, { date: Date; isOff: boolean; reason: string }[]>>((acc, dayInfo) => {
            const month = dayInfo.date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(dayInfo);
            return acc;
        }, {});
    }, [displayDates]);

    const studentSummaries = useMemo(() => {
        return students.map(student => {
            const studentRecords = attendanceRecords.filter(rec => rec.studentId === student.id);
            const summary = {
                [AttendanceStatus.Unexcused]: studentRecords.filter(r => r.status === AttendanceStatus.Unexcused).length,
                [AttendanceStatus.Excused]: studentRecords.filter(r => r.status === AttendanceStatus.Excused).length,
                [AttendanceStatus.Tardy]: studentRecords.filter(r => r.status === AttendanceStatus.Tardy).length,
            };
            return { studentId: student.id, summary };
        });
    }, [students, attendanceRecords]);

    const getDayInitial = (date: Date) => {
        const day = date.toLocaleDateString('es-ES', { weekday: 'narrow' }).toUpperCase();
        return day === 'X' ? 'X' : day.charAt(0); // Use X for Miércoles
    };
    
    const handlePrint = () => {
        window.print();
    };

    const summaryHeaders = [
        { key: AttendanceStatus.Excused, label: 'FALTAS JUSTIFICADAS' },
        { key: AttendanceStatus.Unexcused, label: 'FALTAS INJUSTIFICADAS' },
        { key: AttendanceStatus.Tardy, label: 'ATRASOS' },
    ];

    return (
        <div id="attendance-matrix-section" className="bg-white p-6 rounded-xl shadow-md mt-6">
            <header className="no-print flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Registro Matricial de Asistencia - {className}</h2>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    <PrinterIcon className="h-5 w-5" />
                    Imprimir / PDF
                </button>
            </header>
            
            <div className="print-only mb-4 hidden">
                 <h1 className="text-xl font-bold text-center">{institution?.name}</h1>
                 <h2 className="text-lg font-semibold text-center">REGISTRO INASISTENCIAS Y ATRASOS (Total Días Lectivos: {totalWorkingDays})</h2>
                 <h3 className="text-md font-semibold text-center">CLASE: {className}</h3>
                 <p className="text-center text-sm">PERIODO: {startDate} al {endDate}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-400 text-xs">
                    <thead>
                         <tr>
                            <th className="border border-gray-300 p-1" rowSpan={4}>Nº</th>
                            <th className="border border-gray-300 p-1" rowSpan={4}>APELLIDOS Y NOMBRES</th>
                            {Object.entries(groupedDates).map(([month, days]) => (
                                <th key={month} colSpan={(days as any[]).length} className="border border-gray-300 p-1 font-semibold">{month}</th>
                            ))}
                            <th colSpan={3} className="border border-gray-300 p-1 font-semibold" rowSpan={2}>RESUMEN</th>
                        </tr>
                        <tr>
                             {displayDates.map(dayInfo => (
                                <th key={dayInfo.date.toISOString()} className="border border-gray-300 p-1 font-normal text-green-600">
                                    {workingDayNumberMap.get(dayInfo.date.toISOString().split('T')[0]) || ''}
                                </th>
                             ))}
                        </tr>
                        <tr>
                             {displayDates.map(dayInfo => <th key={dayInfo.date.toISOString()} className="border border-gray-300 p-1 font-normal">{getDayInitial(dayInfo.date)}</th>)}
                            <th className="border border-gray-300 p-1 align-bottom">
                                <div className="rotate-text" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap'}}>FALTAS JUSTIFICADAS</div>
                            </th>
                            <th className="border border-gray-300 p-1 align-bottom">
                                <div className="rotate-text" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap'}}>FALTAS INJUSTIFICADAS</div>
                            </th>
                            <th className="border border-gray-300 p-1 align-bottom">
                                <div className="rotate-text" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap'}}>ATRASOS</div>
                            </th>
                        </tr>
                        <tr>
                             {displayDates.map(dayInfo => <th key={dayInfo.date.toISOString()} className="border border-gray-300 p-1 font-normal">{dayInfo.date.getDate()}</th>)}
                             <th className="border border-gray-300 p-1 font-bold">J</th>
                             <th className="border border-gray-300 p-1 font-bold">F</th>
                             <th className="border border-gray-300 p-1 font-bold">A</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => {
                            const summaryData = studentSummaries.find(s => s.studentId === student.id)?.summary;
                            return (
                                <tr key={student.id}>
                                    <td className="border border-gray-300 p-1 text-center">{index + 1}</td>
                                    <td className="border border-gray-300 p-1 whitespace-nowrap">{student.name}</td>
                                    {displayDates.map(dayInfo => {
                                        if (dayInfo.isOff) {
                                            return (
                                                <td key={dayInfo.date.toISOString()} className="border border-gray-300 p-1 text-center holiday-cell">
                                                    <div className="rotate-text">{dayInfo.reason}</div>
                                                </td>
                                            );
                                        }
                                        const dateString = dayInfo.date.toISOString().split('T')[0];
                                        const record = attendanceRecords.find(rec => rec.studentId === student.id && rec.date === dateString);
                                        
                                        let mark = '';
                                        if (record) {
                                            switch (record.status) {
                                                case AttendanceStatus.Unexcused: mark = 'F'; break;
                                                case AttendanceStatus.Excused: mark = 'J'; break;
                                                case AttendanceStatus.Tardy: mark = 'A'; break;
                                                default: mark = '';
                                            }
                                            
                                            const obs = record.observations;
                                            if (obs && obs.length > 0) {
                                                mark += `, ${obs.join(', ')}`;
                                            }
                                        }

                                        return (
                                            <td key={dayInfo.date.toISOString()} className="border border-gray-300 p-1 text-center text-red-600 font-bold">
                                                {mark}
                                            </td>
                                        );
                                    })}
                                    <td className="border border-gray-300 p-1 text-center font-bold">{summaryData?.[AttendanceStatus.Excused] || 0}</td>
                                    <td className="border border-gray-300 p-1 text-center font-bold">{summaryData?.[AttendanceStatus.Unexcused] || 0}</td>
                                    <td className="border border-gray-300 p-1 text-center font-bold">{summaryData?.[AttendanceStatus.Tardy] || 0}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceMatrixReport;