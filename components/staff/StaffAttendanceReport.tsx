import React, { useState, useMemo } from 'react';
import { StaffAttendanceRecord, User, AttendancePunch } from '../../types';
import { 
    FingerPrintIcon, 
    ClipboardListIcon, 
    SearchIcon, 
    LocationMarkerIcon, 
    CameraIcon, 
    AlertTriangleIcon,
    CloseIcon,
    CheckCircleIcon,
    ClockIcon,
    DownloadIcon,
    PrinterIcon,
    SparklesIcon
} from '../icons/Icons';

interface StaffAttendanceReportProps {
    records: StaffAttendanceRecord[];
    users: User[];
}

const StaffAttendanceReport: React.FC<StaffAttendanceReportProps> = ({ records, users }) => {
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOnlyInconsistencies, setFilterOnlyInconsistencies] = useState(false);
    const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<{
        record: StaffAttendanceRecord;
        user?: User;
    } | null>(null);

    // Safety check: ensure users is an array
    const safeUsers = users || [];
    const userMap = useMemo(() => new Map(safeUsers.map(u => [u.id, u])), [safeUsers]);

    // Process raw attendance records
    const processedRecords = useMemo(() => {
        if (!records || !Array.isArray(records)) return [];

        return records.map(record => {
            const punches = record.punches || [];
            const firstInPunch = punches.find(p => p.type === 'in');
            const checkInTime = firstInPunch?.time || 'N/A';
            
            // Get user's specific work schedule for the day
            const user = userMap.get(record.userId);
            const dayOfWeek = new Date(record.date).toLocaleDateString('es-ES', { weekday: 'long' });
            const daySchedule = user?.workSchedule?.[dayOfWeek as keyof typeof user.workSchedule];
            const expectedStart = daySchedule?.startTime || '08:00';
            
            const status = (firstInPunch && checkInTime > expectedStart) ? 'Late' : 'OnTime';
            const method = firstInPunch?.method || 'N/A';
            const location = firstInPunch?.location;

            // Check if any punch in this record has a flag, justification, facial mismatch or photo
            const hasFlaggedPunch = punches.some(p => 
                p.verificationStatus === 'Flagged' || 
                p.facialMatch === false || 
                !!p.justification || 
                !!p.flagReason
            );
            const hasFacialMismatch = punches.some(p => p.facialMatch === false);
            const hasPhotoProof = punches.some(p => !!p.photoProof);
            const maxDistance = Math.max(0, ...punches.map(p => p.distanceFromInstitution || 0));

            // Generate daily summary string
            const punchSummary = punches.map(p => {
                const typeMap: Record<string, string> = { 
                    'in': 'Entrada', 
                    'out_break': 'Receso (Ini)', 
                    'in_break': 'Receso (Fin)', 
                    'out': 'Salida' 
                };
                return `${typeMap[p.type] || p.type}: ${p.time}`;
            }).join(' | ');

            return {
                ...record,
                checkInTime,
                status,
                method,
                punchSummary,
                location,
                hasFlaggedPunch,
                hasFacialMismatch,
                hasPhotoProof,
                maxDistance
            };
        });
    }, [records, userMap]);

    const filteredRecords = useMemo(() => {
        if (!processedRecords) return [];

        const term = searchTerm.toLowerCase();
        return processedRecords.filter(record => {
            const user = userMap.get(record.userId);
            const nameMatch = (user?.name || '').toLowerCase().includes(term);
            const dateMatch = filterDate ? record.date === filterDate : true;
            const inconsistencyMatch = filterOnlyInconsistencies ? record.hasFlaggedPunch : true;
            return nameMatch && dateMatch && inconsistencyMatch;
        }).sort((a, b) => {
            const timeA = a.checkInTime === 'N/A' ? 0 : new Date(a.date + 'T' + a.checkInTime).getTime();
            const timeB = b.checkInTime === 'N/A' ? 0 : new Date(b.date + 'T' + b.checkInTime).getTime();
            return timeB - timeA;
        });
    }, [processedRecords, searchTerm, filterDate, filterOnlyInconsistencies, userMap]);

    const stats = useMemo(() => {
        const total = filteredRecords.length;
        const late = filteredRecords.filter(r => r.status === 'Late').length;
        const facial = filteredRecords.filter(r => r.punches.some(p => p.method === 'Facial')).length;
        const flagged = filteredRecords.filter(r => r.hasFlaggedPunch).length;
        const facialMismatches = filteredRecords.filter(r => r.hasFacialMismatch).length;
        return { total, late, facial, flagged, facialMismatches };
    }, [filteredRecords]);

    const typeLabels: Record<string, string> = {
        'in': 'Entrada Principal',
        'out_break': 'Salida a Receso / Almuerzo',
        'in_break': 'Retorno de Receso',
        'out': 'Salida Fin de Jornada'
    };

    const handleExportCsv = () => {
        if (filteredRecords.length === 0) {
            alert('No hay registros de asistencia para exportar.');
            return;
        }
        const headers = [
            'Fecha',
            'Colaborador',
            'Rol / Cargo',
            'Cédula',
            'Hora Entrada',
            'Puntualidad',
            'Ciclo de Marcajes',
            'Geocerca / Distancia (m)',
            'Inconsistencia Facial',
            'Confianza Facial (%)',
            'Justificación Motivo',
            'Justificación Detalle'
        ];

        const rows = filteredRecords.map(r => {
            const u = userMap.get(r.userId);
            const flaggedPunch = r.punches.find(p => p.justification || p.facialMatch === false);
            return [
                `"${r.date}"`,
                `"${u?.name || 'Desconocido'}"`,
                `"${u?.role || ''}"`,
                `"${u?.cedula || ''}"`,
                `"${r.checkInTime}"`,
                `"${r.status === 'OnTime' ? 'Puntual' : 'Atraso'}"`,
                `"${r.punchSummary}"`,
                `"${r.maxDistance} m"`,
                `"${flaggedPunch?.facialMatch === false ? 'SI (Discrepancia)' : 'NO'}"`,
                `"${flaggedPunch?.facialConfidence ?? 'N/A'}"`,
                `"${flaggedPunch?.justification?.reason || flaggedPunch?.flagReason || 'N/A'}"`,
                `"${flaggedPunch?.justification?.note || ''}"`
            ].join(',');
        });

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `reporte_asistencia_personal_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header / Summary Cards */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <ClipboardListIcon className="h-6 w-6 text-primary-600" />
                            Reporte General de Asistencia del Personal
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Auditoría de puntualidad, georreferenciación y contrastación biométrica facial de docentes y administrativos.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setFilterOnlyInconsistencies(prev => !prev)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                filterOnlyInconsistencies 
                                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs' 
                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                        >
                            <AlertTriangleIcon className="h-4 w-4" />
                            {filterOnlyInconsistencies ? 'Mostrando Solo Inconsistencias' : 'Filtrar Solo Inconsistencias'}
                        </button>

                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                            title="Exportar registros a archivo CSV"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            Exportar CSV
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                            title="Imprimir informe oficial"
                        >
                            <PrinterIcon className="h-4 w-4" />
                            Imprimir
                        </button>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl text-center border border-slate-200">
                        <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                        <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">Registros</p>
                    </div>
                    <div className="p-3.5 bg-amber-50 rounded-xl text-center border border-amber-200">
                        <p className="text-2xl font-bold text-amber-700">{stats.late}</p>
                        <p className="text-[11px] text-amber-700 uppercase font-semibold mt-1">Atrasos</p>
                    </div>
                    <div className="p-3.5 bg-sky-50 rounded-xl text-center border border-sky-200">
                        <p className="text-2xl font-bold text-sky-700">{stats.facial}</p>
                        <p className="text-[11px] text-sky-700 uppercase font-semibold mt-1">Con Rostro</p>
                    </div>
                    <div 
                        onClick={() => setFilterOnlyInconsistencies(prev => !prev)}
                        className="p-3.5 bg-orange-50 hover:bg-orange-100 cursor-pointer rounded-xl text-center border border-orange-200 transition"
                    >
                        <p className="text-2xl font-bold text-orange-700">{stats.flagged}</p>
                        <p className="text-[11px] text-orange-700 uppercase font-semibold mt-1">Fuera de Rango</p>
                    </div>
                    <div 
                        onClick={() => setFilterOnlyInconsistencies(prev => !prev)}
                        className="p-3.5 bg-rose-50 hover:bg-rose-100 cursor-pointer rounded-xl text-center border border-rose-200 transition"
                    >
                        <p className="text-2xl font-bold text-rose-700">{stats.facialMismatches}</p>
                        <p className="text-[11px] text-rose-700 uppercase font-semibold mt-1">Inconsistencias Faciales</p>
                    </div>
                </div>
            </div>

            {/* Table and Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
                    <div className="relative w-full md:w-80">
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre de colaborador..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filtrar Fecha:</span>
                        <input 
                            type="date" 
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            className="p-2 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="text-xs text-slate-500 hover:text-slate-800 underline ml-1"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Personal</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Hora Entrada</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Ciclo de Marcajes</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Validación Biométrica</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Geocerca</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Puntualidad</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Auditoría</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200 text-sm">
                            {filteredRecords.map(record => {
                                const user = userMap.get(record.userId);
                                const flaggedPunch = record.punches.find(p => p.verificationStatus === 'Flagged' || p.facialMatch === false);

                                return (
                                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-mono text-xs">
                                            {record.date}
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="font-semibold text-slate-900">{user?.name || 'Desconocido'}</div>
                                            <div className="text-xs text-slate-500">{user?.role || ''} · {user?.cedula || ''}</div>
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center font-mono font-bold text-slate-700">
                                            {record.checkInTime}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                                                {record.punches.map((p, idx) => (
                                                    <span 
                                                        key={idx} 
                                                        className={`text-[11px] px-2 py-0.5 rounded-md font-mono border ${
                                                            p.type === 'in' ? 'bg-sky-50 border-sky-200 text-sky-800' :
                                                            p.type === 'out' ? 'bg-slate-100 border-slate-300 text-slate-800' :
                                                            'bg-amber-50 border-amber-200 text-amber-800'
                                                        }`}
                                                        title={`${p.type}: ${p.time} (${p.method})`}
                                                    >
                                                        {p.time}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Biometric validation column */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            {record.hasFacialMismatch ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                                    <AlertTriangleIcon className="h-3.5 w-3.5 text-rose-600" />
                                                    Inconsistencia Facial
                                                </span>
                                            ) : record.punches.some(p => p.method === 'Facial' && p.facialMatch === true) ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                    <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                                                    Rostro Verificado
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-500 font-mono">
                                                    {record.method}
                                                </span>
                                            )}
                                        </td>

                                        {/* Geofence Column */}
                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            {record.maxDistance > 100 ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                                    <LocationMarkerIcon className="h-3.5 w-3.5 text-amber-600" />
                                                    +{record.maxDistance}m
                                                </span>
                                            ) : (
                                                <span className="text-xs text-emerald-700 font-semibold">
                                                    En Sede
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                record.status === 'OnTime' 
                                                    ? 'bg-emerald-100 text-emerald-800' 
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {record.status === 'OnTime' ? 'Puntual' : 'Atraso'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedRecordForDetail({ record, user })}
                                                className="text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1 rounded-lg transition"
                                            >
                                                Auditar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-slate-500 text-sm">
                                        No se encontraron registros de asistencia para los criterios seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record Inspection Modal */}
            {selectedRecordForDetail && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[120] flex justify-center items-center p-3 sm:p-4"
                    onClick={() => setSelectedRecordForDetail(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Auditoría Biométrica de Asistencia</h3>
                                <p className="text-xs text-slate-500">
                                    {selectedRecordForDetail.user?.name} ({selectedRecordForDetail.user?.role}) · Fecha: {selectedRecordForDetail.record.date}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedRecordForDetail(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
                            >
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </header>

                        <div className="p-5 overflow-y-auto space-y-4">
                            {/* Staff Official Master Enrollment */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-slate-300 bg-slate-200 flex-shrink-0">
                                        {selectedRecordForDetail.user?.facialPhotoUrl || selectedRecordForDetail.user?.photoUrl ? (
                                            <img 
                                                src={selectedRecordForDetail.user?.facialPhotoUrl || selectedRecordForDetail.user?.photoUrl} 
                                                alt="Foto oficial" 
                                                className="h-full w-full object-cover" 
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                                Sin Foto
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Fotografía Facial de Referencia (Ficha)</p>
                                        <p className="text-xs text-slate-500">
                                            {selectedRecordForDetail.user?.facialPhotoUrl 
                                                ? '✓ Enrolamiento oficial completado' 
                                                : '✕ Colaborador sin foto oficial enrolada'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                                        PIN: {selectedRecordForDetail.user?.accessPin || 'Sin PIN'}
                                    </span>
                                </div>
                            </div>

                            {/* Chronological Punches */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Marcajes Registrados en la Jornada ({selectedRecordForDetail.record.punches.length}/4)
                                </h4>
                                {selectedRecordForDetail.record.punches.map((punch, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                                            punch.facialMatch === false 
                                                ? 'bg-rose-50/70 border-rose-300' 
                                                : punch.verificationStatus === 'Flagged'
                                                    ? 'bg-amber-50/70 border-amber-300'
                                                    : 'bg-slate-50/50 border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800 text-sm">
                                                    {typeLabels[punch.type] || punch.type}
                                                </span>
                                                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border rounded text-slate-700">
                                                    {punch.time}
                                                </span>
                                            </div>
                                            <span className="font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                                                Vía {punch.method}
                                            </span>
                                        </div>

                                        {/* Facial Recognition Evidence & Match Score */}
                                        {punch.method === 'Facial' && (
                                            <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                                        <CameraIcon className="h-4 w-4 text-sky-600" />
                                                        Contrastación Facial en Tiempo Real
                                                    </span>
                                                    {punch.facialConfidence !== undefined && (
                                                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                                            punch.facialMatch === false 
                                                                ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                                                : 'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                            {punch.facialMatch === false 
                                                                ? `🚨 Discrepancia (${punch.facialConfidence}% Similitud)` 
                                                                : `✓ Coincidencia ${punch.facialConfidence}%`}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Side-by-Side: Reference Photo vs Punch Photo Evidence */}
                                                <div className="grid grid-cols-2 gap-3 pt-1">
                                                    <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                        <div className="h-20 w-20 rounded-lg overflow-hidden border border-slate-300 bg-white mb-1">
                                                            {selectedRecordForDetail.user?.facialPhotoUrl || selectedRecordForDetail.user?.photoUrl ? (
                                                                <img 
                                                                    src={selectedRecordForDetail.user?.facialPhotoUrl || selectedRecordForDetail.user?.photoUrl} 
                                                                    alt="Foto oficial" 
                                                                    className="h-full w-full object-cover" 
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                                                                    Sin foto oficial
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-700">Foto Oficial (Ficha)</span>
                                                    </div>

                                                    <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                        <div className="h-20 w-20 rounded-lg overflow-hidden border border-slate-300 bg-white mb-1">
                                                            {punch.photoProof ? (
                                                                <img 
                                                                    src={punch.photoProof} 
                                                                    alt="Foto capturada en marcaje" 
                                                                    className="h-full w-full object-cover" 
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                                                                    Sin foto capturada
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-700">Rostro Capturado en Marcaje</span>
                                                    </div>
                                                </div>

                                                {punch.flagReason && (
                                                    <div className="text-[11px] text-rose-700 font-semibold bg-rose-50 p-2 rounded border border-rose-200">
                                                        Motivo de Advertencia: {punch.flagReason}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Geofence info */}
                                        {punch.distanceFromInstitution > 0 && (
                                            <div className="flex items-center gap-2 text-slate-600 pt-1">
                                                <LocationMarkerIcon className="h-3.5 w-3.5 text-slate-400" />
                                                <span>Distancia detectada a la sede: <strong>{punch.distanceFromInstitution} m</strong></span>
                                                {punch.location && (
                                                    <a 
                                                        href={`https://www.google.com/maps?q=${punch.location.latitude},${punch.location.longitude}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sky-600 hover:underline font-semibold ml-auto"
                                                    >
                                                        Abrir Mapa ↗
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Justification Box if present */}
                                        {punch.justification && (
                                            <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                                                <div className="flex items-center gap-1.5 font-bold mb-1">
                                                    <AlertTriangleIcon className="h-3.5 w-3.5 text-amber-600" />
                                                    <span>Justificación Fuera de Rango: {punch.justification.reason}</span>
                                                </div>
                                                <p className="text-slate-700 italic bg-white p-2 rounded border border-amber-100">
                                                    "{punch.justification.note}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffAttendanceReport;