import React, { useMemo } from 'react';
import { AttendanceRecord, AttendanceStatus, Student, Class } from '../../types';
import { ArrowLeftIcon } from '../icons/Icons';

interface JustificationManagementProps {
    attendanceRecords: AttendanceRecord[];
    onUpdateAttendance: (records: AttendanceRecord[]) => void;
    students: Student[];
    classes: Class[];
    onBack: () => void;
}

const JustificationManagement: React.FC<JustificationManagementProps> = ({ attendanceRecords, onUpdateAttendance, students, classes, onBack }) => {

    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
    const classMap = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
    
    const pendingJustifications = useMemo(() => {
        return attendanceRecords
            .filter(rec => rec.status === AttendanceStatus.JustificationPending)
            .map(rec => ({
                ...rec,
                student: studentMap.get(rec.studentId),
            }))
            .filter(rec => !!rec.student); // Ensure student data exists
    }, [attendanceRecords, studentMap]);

    const handleApprove = (recordId: string) => {
        const updated = attendanceRecords.map(rec => 
            rec.id === recordId ? { ...rec, status: AttendanceStatus.Excused } : rec
        );
        onUpdateAttendance(updated);
    };
    
    const handleReject = (recordId: string) => {
        const reason = prompt("Por favor, ingrese el motivo del rechazo (opcional):");
        const updated = attendanceRecords.map(rec => 
            rec.id === recordId ? { ...rec, status: AttendanceStatus.Unexcused, justificationNotes: `Rechazado: ${reason || 'Sin motivo.'}` } : rec
        );
        onUpdateAttendance(updated);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4" />
                Volver al Dashboard de Inspección
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gestionar Justificaciones de Ausencia</h2>
            
            <div className="overflow-x-auto">
                {pendingJustifications.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo del Padre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingJustifications.map(rec => (
                                <tr key={rec.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-medium text-gray-900">{rec.student!.name}</p>
                                        <p className="text-xs text-gray-500">{classMap.get(rec.student!.classId) || 'Sin clase'}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={rec.justificationNotes}>{rec.justificationNotes}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {rec.justificationDocumentUrl ? (
                                            <a href={rec.justificationDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Documento</a>
                                        ) : (
                                            <span className="text-gray-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleApprove(rec.id)} className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-xs font-semibold">Aprobar</button>
                                        <button onClick={() => handleReject(rec.id)} className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-xs font-semibold">Rechazar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
                        <p>No hay justificaciones pendientes de revisión.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JustificationManagement;