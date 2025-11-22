

import React, { useState, useMemo } from 'react';
import { StaffAttendanceRecord, User } from '../../types';
import { FingerPrintIcon, ClipboardListIcon, SearchIcon } from '../icons/Icons';

interface StaffAttendanceReportProps {
    records: StaffAttendanceRecord[];
    users: User[];
}

const StaffAttendanceReport: React.FC<StaffAttendanceReportProps> = ({ records, users }) => {
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    // FIX: Process records to derive properties needed for the report.
    const processedRecords = useMemo(() => {
        return records.map(record => {
            const firstInPunch = record.punches.find(p => p.type === 'in');
            const checkInTime = firstInPunch?.time || 'N/A';
            const status = (firstInPunch && checkInTime > '08:00:00') ? 'Late' : 'OnTime';
            const method = firstInPunch?.method || 'N/A';

            return {
                ...record,
                checkInTime,
                status,
                method,
            };
        });
    }, [records]);

    const filteredRecords = useMemo(() => {
        // FIX: Use processedRecords which have the derived properties.
        return processedRecords.filter(record => {
            const user = userMap.get(record.userId);
            const nameMatch = user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const dateMatch = filterDate ? record.date === filterDate : true;
            return nameMatch && dateMatch;
            // FIX: Correctly sort based on the derived checkInTime.
        }).sort((a, b) => {
            const timeA = a.checkInTime === 'N/A' ? 0 : new Date(a.date + 'T' + a.checkInTime).getTime();
            const timeB = b.checkInTime === 'N/A' ? 0 : new Date(b.date + 'T' + b.checkInTime).getTime();
            return timeB - timeA;
        });
    }, [processedRecords, searchTerm, filterDate, userMap]);

    const stats = useMemo(() => {
        const total = filteredRecords.length;
        // FIX: Use 'status' and 'method' from filtered records.
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
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Método</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecords.map(record => (
                                <tr key={record.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userMap.get(record.userId)?.name || 'Desconocido'}</td>
                                    {/* FIX: Use derived checkInTime */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{record.checkInTime}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {/* FIX: Use derived method */}
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${record.method === 'Biometric' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {record.method === 'Biometric' ? <FingerPrintIcon className="h-3 w-3" /> : <ClipboardListIcon className="h-3 w-3" />}
                                            {record.method === 'Biometric' ? 'Huella' : 'PIN'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {/* FIX: Use derived status */}
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.status === 'OnTime' ? 'bg-green-100 text-green-800' : record.status === 'Late' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                            {record.status === 'OnTime' ? 'Puntual' : record.status === 'Late' ? 'Atraso' : 'Ausente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">No se encontraron registros.</td>
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
