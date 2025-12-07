import React, { useState, useMemo } from 'react';
import { StaffAttendanceRecord, User } from '../../types';
import { FingerPrintIcon, ClipboardListIcon, SearchIcon, LocationMarkerIcon } from '../icons/Icons';

interface StaffAttendanceReportProps {
    records: StaffAttendanceRecord[];
    users: User[];
}

const StaffAttendanceReport: React.FC<StaffAttendanceReportProps> = ({ records, users }) => {
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Safety check: ensure users is an array
    const safeUsers = users || [];
    const userMap = useMemo(() => new Map(safeUsers.map(u => [u.id, u])), [safeUsers]);

    // FIX: Process raw attendance records to derive 'checkInTime', 'status', and 'method' properties.
    const processedRecords = useMemo(() => {
        // CRITICAL FIX: Return empty array if records is undefined/null
        if (!records || !Array.isArray(records)) return [];

        return records.map(record => {
            // Safety check for punches array
            const punches = record.punches || [];
            const firstInPunch = punches.find(p => p.type === 'in');
            const checkInTime = firstInPunch?.time || 'N/A';
            
            // Get user's specific work schedule for the day
            const user = userMap.get(record.userId);
            const dayOfWeek = new Date(record.date).toLocaleDateString('es-ES', { weekday: 'long' });
            // Safe access to nested properties
            const daySchedule = user?.workSchedule?.[dayOfWeek as keyof typeof user.workSchedule];
            const expectedStart = daySchedule?.startTime || '08:00'; // Default if not set
            
            const status = (firstInPunch && checkInTime > expectedStart) ? 'Late' : 'OnTime';
            const method = firstInPunch?.method || 'N/A';
            const location = firstInPunch?.location;

            // Generate daily summary string
            const punchSummary = punches.map(p => {
                const typeMap: Record<string, string> = { 'in': 'Entrada', 'out_break': 'Descanso (Inicio)', 'in_break': 'Descanso (Fin)', 'out': 'Salida' };
                return `${typeMap[p.type] || p.type}: ${p.time}`;
            }).join(' | ');

            return {
                ...record,
                checkInTime,
                status,
                method,
                punchSummary,
                location
            };
        });
    }, [records, userMap]);

    const filteredRecords = useMemo(() => {
        // Safety check again, though processedRecords should be safe now
        if (!processedRecords) return [];

        return processedRecords.filter(record => {
            const user = userMap.get(record.userId);
            const nameMatch = user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const dateMatch = filterDate ? record.date === filterDate : true;
            return nameMatch && dateMatch;
        }).sort((a, b) => {
            const timeA = a.checkInTime === 'N/A' ? 0 : new Date(a.date + 'T' + a.checkInTime).getTime();
            const timeB = b.checkInTime === 'N/A' ? 0 : new Date(b.date + 'T' + b.checkInTime).getTime();
            return timeB - timeA;
        });
    }, [processedRecords, searchTerm, filterDate, userMap]);

    const stats = useMemo(() => {
        const total = filteredRecords.length;
        const late = filteredRecords.filter(r => r.status === 'Late').length;
        const biometric = filteredRecords.filter(r => r.method === 'Biometric').length;
        const manual = filteredRecords.filter(r => r.method === 'Manual').length;
        return { total, late, biometric, manual };
    }, [filteredRecords]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Resumen de Asistencia del Personal</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg text-center border">
                        <p className="text-2xl font-bold text-slate-700">{stats.total}</p>
                        <p className="text-xs text-slate-500 uppercase">Registros Totales</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg text-center border border-amber-100">
                        <p className="text-2xl font-bold text-amber-700">{stats.late}</p>
                        <p className="text-xs text-amber-600 uppercase">Atrasos</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
                        <p className="text-2xl font-bold text-blue-700">{stats.biometric}</p>
                        <p className="text-xs text-blue-600 uppercase">Vía Biometría</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
                        <p className="text-2xl font-bold text-gray-700">{stats.manual}</p>
                        <p className="text-xs text-gray-600 uppercase">Vía Manual (PIN)</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar personal..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md text-sm"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hora Entrada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registros del Día</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecords.map(record => (
                                <tr key={record.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userMap.get(record.userId)?.name || 'Desconocido'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{record.checkInTime}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" title={record.punchSummary}>{record.punchSummary}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {record.location ? (
                                            <a 
                                                href={`https://www.google.com/maps?q=${record.location.latitude},${record.location.longitude}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Ver en Mapa"
                                            >
                                                <LocationMarkerIcon className="h-5 w-5 mx-auto" />
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.status === 'OnTime' ? 'bg-green-100 text-green-800' : record.status === 'Late' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                            {record.status === 'OnTime' ? 'Puntual' : record.status === 'Late' ? 'Atraso' : 'Ausente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">No se encontraron registros.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StaffAttendanceReport;