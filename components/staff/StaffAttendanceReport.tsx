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
    SparklesIcon,
    UsersIcon
} from '../icons/Icons';
import { 
    calculateDayAudit, 
    DayAttendanceAudit, 
    PunchInfo,
    formatMinutesToHHMMSS 
} from '../../lib/attendanceCalculations';

interface StaffAttendanceReportProps {
    records: StaffAttendanceRecord[];
    users: User[];
}

const StaffAttendanceReport: React.FC<StaffAttendanceReportProps> = ({ records, users }) => {
    // View mode: 'official_matrix' (individual monthly audit like the Excel spreadsheet) or 'all_records' (consolidated)
    const [viewMode, setViewMode] = useState<'official_matrix' | 'all_records'>('official_matrix');
    
    // Filters
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = (now.getMonth() + 1).toString().padStart(2, '0');
        return `${y}-${m}`;
    });
    const [filterDate, setFilterDate] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterOnlyNovedades, setFilterOnlyNovedades] = useState<boolean>(false);
    const [filterOnlyInconsistencies, setFilterOnlyInconsistencies] = useState<boolean>(false);
    
    const [selectedAuditForModal, setSelectedAuditForModal] = useState<DayAttendanceAudit | null>(null);

    // Eligible staff users (not students or parents)
    const staffUsers = useMemo(() => {
        return (users || []).filter(u => u.role !== 'Familiar' && u.role !== 'Alumno');
    }, [users]);

    const userMap = useMemo(() => new Map(staffUsers.map(u => [u.id, u])), [staffUsers]);

    // Active user for official matrix view
    const activeStaffUser = useMemo(() => {
        if (selectedUserId) return userMap.get(selectedUserId);
        return staffUsers[0] || null;
    }, [selectedUserId, staffUsers, userMap]);

    // Helper: Map an existing StaffAttendanceRecord punch to PunchInfo
    const mapPunchesToPunchInfo = (punches?: AttendancePunch[]): PunchInfo[] => {
        if (!punches) return [];
        return punches.map(p => ({
            time: p.time,
            type: p.type,
            method: p.method,
            origin: p.method === 'Facial' ? 'FACIAL' : 'WEB',
            photoProof: p.photoProof,
            facialConfidence: p.facialConfidence,
            facialMatch: p.facialMatch,
            flagReason: p.flagReason,
            distanceFromInstitution: p.distanceFromInstitution
        }));
    };

    // GENERATE MONTHLY AUDIT ROWS FOR OFFICIAL MATRIX (Formato Dirección Metropolitana de Talento Humano)
    const monthlyMatrixAudits = useMemo(() => {
        if (!activeStaffUser) return [];

        const [yearStr, monthStr] = selectedMonth.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);

        // Days in this month
        const daysInMonth = new Date(year, month, 0).getDate();
        const audits: DayAttendanceAudit[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const dayFormatted = day.toString().padStart(2, '0');
            const monthFormatted = month.toString().padStart(2, '0');
            const isoDate = `${year}-${monthFormatted}-${dayFormatted}`;

            // Check if user has an attendance record for this date
            const record = records.find(r => r.userId === activeStaffUser.id && r.date === isoDate);
            const punches = mapPunchesToPunchInfo(record?.punches);

            const audit = calculateDayAudit({
                date: isoDate,
                punches,
                user: {
                    id: activeStaffUser.id,
                    name: activeStaffUser.name,
                    role: activeStaffUser.role,
                    cedula: activeStaffUser.cedula,
                    grupoOcupacional: activeStaffUser.grupoOcupacional,
                    tipoFuncionario: activeStaffUser.tipoFuncionario,
                    allowedLunchMinutes: activeStaffUser.allowedLunchMinutes,
                    workSchedule: activeStaffUser.workSchedule
                }
            });

            audits.push(audit);
        }

        return audits;
    }, [activeStaffUser, selectedMonth, records]);

    // GENERATE AUDITS FOR ALL ATTENDANCE RECORDS (Consolidated View)
    const allRecordsAudits = useMemo(() => {
        if (!records || !Array.isArray(records)) return [];

        return records.map(record => {
            const user = userMap.get(record.userId);
            if (!user) return null;

            const punches = mapPunchesToPunchInfo(record.punches);
            return calculateDayAudit({
                date: record.date,
                punches,
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    cedula: user.cedula,
                    grupoOcupacional: user.grupoOcupacional,
                    tipoFuncionario: user.tipoFuncionario,
                    allowedLunchMinutes: user.allowedLunchMinutes,
                    workSchedule: user.workSchedule
                }
            });
        }).filter((a): a is DayAttendanceAudit => a !== null);
    }, [records, userMap]);

    // Apply filters based on viewMode
    const displayedAudits = useMemo(() => {
        let list = viewMode === 'official_matrix' ? monthlyMatrixAudits : allRecordsAudits;

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(a => 
                a.userName.toLowerCase().includes(q) || 
                a.cedula.toLowerCase().includes(q) ||
                a.grupoOcupacional.toLowerCase().includes(q)
            );
        }

        if (filterDate) {
            list = list.filter(a => a.fecha === filterDate);
        }

        if (filterOnlyNovedades) {
            list = list.filter(a => a.novedadesDia === 'DIA CON NOVEDAD');
        }

        if (filterOnlyInconsistencies) {
            list = list.filter(a => 
                a.marcacionesConsistentes === 'INCONSISTENTES' || 
                a.hasBiometricIssue || 
                a.hasGeofenceIssue
            );
        }

        return list;
    }, [viewMode, monthlyMatrixAudits, allRecordsAudits, searchTerm, filterDate, filterOnlyNovedades, filterOnlyInconsistencies]);

    // Statistics
    const stats = useMemo(() => {
        const total = displayedAudits.length;
        const laborables = displayedAudits.filter(a => a.esLaborable).length;
        const sinNovedad = displayedAudits.filter(a => a.novedadesDia === 'DIA SIN NOVEDAD').length;
        const conNovedad = displayedAudits.filter(a => a.novedadesDia === 'DIA CON NOVEDAD').length;
        const atrasos = displayedAudits.filter(a => a.novedadesEntrada !== 'SIN NOVEDAD' && a.novedadesEntrada !== 'NO APLICA JORNADA LABORAL' && a.novedadesEntrada !== 'NO REGISTRA ENTRADA').length;
        const excesosAlmuerzo = displayedAudits.filter(a => a.novedadesAlmuerzo !== 'DENTRO DE TIEMPO DE ALMUERZO' && a.novedadesAlmuerzo !== 'NO APLICA JORNADA LABORAL' && !a.novedadesAlmuerzo.includes('NO REGISTRA')).length;
        const inconsistencias = displayedAudits.filter(a => a.marcacionesConsistentes === 'INCONSISTENTES' || a.hasBiometricIssue).length;

        return { total, laborables, sinNovedad, conNovedad, atrasos, excesosAlmuerzo, inconsistencias };
    }, [displayedAudits]);

    // OFFICIAL CSV / EXCEL EXPORT (matching Dirección Metropolitana de Talento Humano formulas & columns)
    const handleExportOfficialCsv = () => {
        if (displayedAudits.length === 0) {
            alert('No hay registros para exportar con los filtros seleccionados.');
            return;
        }

        const titleRows = [
            '"ARCHIVO FORMULADO PARA DETERMINACIÓN DE NOVEDADES EN CONTROL DE ASISTENCIA"',
            '"DEPENDENCIA: DIRECCIÓN METROPOLITANA DE TALENTO HUMANO"',
            `"COLABORADOR: ${activeStaffUser?.name || 'CONSOLIDADO INSTITUCIONAL'} - PERÍODO: ${selectedMonth}"`,
            '""'
        ];

        const headers = [
            'Fecha',
            'Marcación 1',
            'Origen 1',
            'Marcación 2',
            'Origen 2',
            'Marcación 3',
            'Origen 3',
            'Marcación 4',
            'Origen 4',
            'GRUPO OCUPACIONAL',
            'FUNCIONARIO DIRECTIVO U OTROS',
            'Día de la semana',
            'Laborables',
            'HORA ENTRADA DEFINIDA',
            'HORA SALIDA DEFINIDA',
            'Tiempo de almuerzo tomado',
            'Tiempo de almuerzo autorizado',
            'NOVEDADES ENTRADA JORNADA LABORAL',
            'Novedades Almuerzo',
            'Novedades Salida',
            'Tiempo fuera de la jornada',
            'Marcaciones Consistentes',
            'Novedades Día',
            'Colaborador',
            'Cédula'
        ];

        const dataRows = displayedAudits.map(a => {
            // Format date as DD/MM/YYYY
            const [y, m, d] = a.fecha.split('-');
            const dateFormatted = `${d}/${m}/${y}`;

            return [
                `"${dateFormatted}"`,
                `"${a.marcacion1 || '0'}"`,
                `"${a.origen1 || 'WEB'}"`,
                `"${a.marcacion2 || '0'}"`,
                `"${a.origen2 || 'WEB'}"`,
                `"${a.marcacion3 || '0'}"`,
                `"${a.origen3 || 'WEB'}"`,
                `"${a.marcacion4 || '0'}"`,
                `"${a.origen4 || 'WEB'}"`,
                `"${a.grupoOcupacional}"`,
                `"${a.tipoFuncionario}"`,
                `"${a.diaSemana}"`,
                `"${a.laborableLabel}"`,
                `"${a.horaEntradaDefinida}"`,
                `"${a.horaSalidaDefinida}"`,
                `"${a.tiempoAlmuerzoTomado}"`,
                `"${a.tiempoAlmuerzoAutorizado}"`,
                `"${a.novedadesEntrada}"`,
                `"${a.novedadesAlmuerzo}"`,
                `"${a.novedadesSalida}"`,
                `"${a.tiempoFueraJornada}"`,
                `"${a.marcacionesConsistentes}"`,
                `"${a.novedadesDia}"`,
                `"${a.userName}"`,
                `"${a.cedula}"`
            ].join(',');
        });

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [...titleRows, headers.join(','), ...dataRows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `DMTH_Control_Asistencia_${activeStaffUser?.name.replace(/\s+/g, '_') || 'General'}_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 border border-sky-500/30 rounded-full text-sky-300 text-xs font-mono font-bold mb-2">
                            <span>DIRECCIÓN METROPOLITANA DE TALENTO HUMANO</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                            Archivo Formulado para Determinación de Novedades en Control de Asistencia
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Auditoría oficial de 4 timbradas, tiempos de almuerzo, novedades de jornada y detección de inconsistencias.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* View Mode Toggle */}
                        <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center">
                            <button
                                type="button"
                                onClick={() => setViewMode('official_matrix')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'official_matrix' 
                                        ? 'bg-indigo-600 text-white shadow-sm' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <UsersIcon className="h-4 w-4" />
                                Ficha Mensual por Funcionario (DMTH)
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('all_records')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                    viewMode === 'all_records' 
                                        ? 'bg-indigo-600 text-white shadow-sm' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <ClipboardListIcon className="h-4 w-4" />
                                Consolidado General
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleExportOfficialCsv}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                            title="Descargar archivo CSV estructurado exactamente como la hoja oficial DMTH"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            Exportar Excel / CSV Oficial
                        </button>

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
                        >
                            <PrinterIcon className="h-4 w-4" />
                            Imprimir
                        </button>
                    </div>
                </div>

                {/* Sub-bar for Staff Selector & Month in official_matrix mode */}
                {viewMode === 'official_matrix' && (
                    <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">
                                Seleccionar Funcionario / Colaborador:
                            </label>
                            <select
                                value={activeStaffUser?.id || ''}
                                onChange={e => setSelectedUserId(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                {staffUsers.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.tipoFuncionario || (u.role.includes('Profesor') ? 'OTROS' : 'FD')}) · {u.role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">
                                Mes a Auditar (Período Laboral):
                            </label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Régimen Asignado</p>
                                <p className="text-xs font-bold text-indigo-300">
                                    {activeStaffUser?.grupoOcupacional || 'DOCENTE CATEGORIA E'} · {activeStaffUser?.tipoFuncionario || 'OTROS'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Almuerzo Aut.</p>
                                <p className="text-xs font-mono font-bold text-emerald-400">
                                    {formatMinutesToHHMMSS(activeStaffUser?.allowedLunchMinutes ?? 30)} ({activeStaffUser?.allowedLunchMinutes ?? 30} min)
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
                    <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">Días del Período</p>
                </div>

                <div 
                    onClick={() => { setFilterOnlyNovedades(false); setFilterOnlyInconsistencies(false); }}
                    className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs text-center cursor-pointer hover:bg-emerald-100/60 transition"
                >
                    <p className="text-2xl font-black text-emerald-700">{stats.sinNovedad}</p>
                    <p className="text-[11px] font-bold text-emerald-700 uppercase mt-1">Días Sin Novedad</p>
                </div>

                <div 
                    onClick={() => setFilterOnlyNovedades(prev => !prev)}
                    className={`p-4 rounded-xl border shadow-xs text-center cursor-pointer transition ${
                        filterOnlyNovedades 
                            ? 'bg-amber-600 text-white border-amber-700' 
                            : 'bg-amber-50/80 border-amber-200 hover:bg-amber-100 text-amber-800'
                    }`}
                >
                    <p className={`text-2xl font-black ${filterOnlyNovedades ? 'text-white' : 'text-amber-800'}`}>
                        {stats.conNovedad}
                    </p>
                    <p className={`text-[11px] font-bold uppercase mt-1 ${filterOnlyNovedades ? 'text-amber-100' : 'text-amber-700'}`}>
                        Días Con Novedad
                    </p>
                </div>

                <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 shadow-xs text-center">
                    <p className="text-2xl font-black text-rose-700">{stats.atrasos}</p>
                    <p className="text-[11px] font-bold text-rose-700 uppercase mt-1">Atrasos Entrada</p>
                </div>

                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 shadow-xs text-center">
                    <p className="text-2xl font-black text-sky-700">{stats.excesosAlmuerzo}</p>
                    <p className="text-[11px] font-bold text-sky-700 uppercase mt-1">Excesos Almuerzo</p>
                </div>

                <div 
                    onClick={() => setFilterOnlyInconsistencies(prev => !prev)}
                    className={`p-4 rounded-xl border shadow-xs text-center cursor-pointer transition ${
                        filterOnlyInconsistencies 
                            ? 'bg-purple-600 text-white border-purple-700' 
                            : 'bg-purple-50/80 border-purple-200 hover:bg-purple-100 text-purple-800'
                    }`}
                >
                    <p className={`text-2xl font-black ${filterOnlyInconsistencies ? 'text-white' : 'text-purple-800'}`}>
                        {stats.inconsistencias}
                    </p>
                    <p className={`text-[11px] font-bold uppercase mt-1 ${filterOnlyInconsistencies ? 'text-purple-100' : 'text-purple-700'}`}>
                        Inconsistencias
                    </p>
                </div>
            </div>

            {/* Main Official Spreadsheet Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                {/* Search & Fast Filter Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Buscar por colaborador, cédula o grupo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                        <span className="text-xs font-semibold text-slate-500">Filtrar Día:</span>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="text-xs text-slate-500 hover:text-slate-800 underline"
                            >
                                Limpiar
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setFilterOnlyNovedades(p => !p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                filterOnlyNovedades 
                                    ? 'bg-amber-600 text-white border-amber-700' 
                                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            {filterOnlyNovedades ? '✓ Solo Con Novedad' : 'Filtrar Con Novedad'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setFilterOnlyInconsistencies(p => !p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                filterOnlyInconsistencies 
                                    ? 'bg-purple-600 text-white border-purple-700' 
                                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            {filterOnlyInconsistencies ? '✓ Solo Inconsistencias' : 'Filtrar Inconsistencias'}
                        </button>
                    </div>
                </div>

                {/* HIGH-DENSITY AUDIT SPREADSHEET TABLE */}
                <div className="overflow-x-auto max-h-[650px]">
                    <table className="min-w-full divide-y divide-slate-200 border-collapse text-[11px]">
                        <thead className="bg-slate-800 text-white sticky top-0 z-10 font-bold uppercase tracking-wider text-center select-none">
                            <tr>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap">Fecha</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap">Marcación 1 (Entrada)</th>
                                <th className="px-2 py-3 border-r border-slate-700 whitespace-nowrap">Origen 1</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap">Marcación 2 (Sal. Almuerzo)</th>
                                <th className="px-2 py-3 border-r border-slate-700 whitespace-nowrap">Origen 2</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap">Marcación 3 (Ent. Almuerzo)</th>
                                <th className="px-2 py-3 border-r border-slate-700 whitespace-nowrap">Origen 3</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap">Marcación 4 (Salida)</th>
                                <th className="px-2 py-3 border-r border-slate-700 whitespace-nowrap">Origen 4</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap">Grupo Ocupacional</th>
                                <th className="px-2 py-3 border-r border-slate-700 whitespace-nowrap">Funcionario Directivo</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap">Día Semana</th>
                                <th className="px-2 py-3 border-r border-slate-700 whitespace-nowrap">Laborable</th>
                                <th className="px-2 py-3 border-r border-slate-700 whitespace-nowrap">H. Entrada</th>
                                <th className="px-2 py-3 border-r border-slate-700 whitespace-nowrap">H. Salida</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap bg-indigo-900/80">Tiempo Almuerzo Tomado</th>
                                <th className="px-2 py-3 border-r border-slate-700 whitespace-nowrap">Almuerzo Aut.</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap bg-rose-950/80">Novedades Entrada</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap bg-amber-950/80">Novedades Almuerzo</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap bg-slate-900">Novedades Salida</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap">Tiempo Fuera Jornada</th>
                                <th className="px-3 py-3 border-r border-slate-700 whitespace-nowrap">Consistencia</th>
                                <th className="px-3 py-3 whitespace-nowrap bg-slate-950">Novedades Día</th>
                                <th className="px-2 py-3 whitespace-nowrap">Auditar</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-slate-200">
                            {displayedAudits.map((audit, idx) => {
                                const isNoLaborable = !audit.esLaborable;
                                const isSinNovedad = audit.novedadesDia === 'DIA SIN NOVEDAD';
                                const hasLate = audit.novedadesEntrada !== 'SIN NOVEDAD' && audit.novedadesEntrada !== 'NO APLICA JORNADA LABORAL' && audit.novedadesEntrada !== 'NO REGISTRA ENTRADA';
                                const hasLunchExcess = audit.novedadesAlmuerzo !== 'DENTRO DE TIEMPO DE ALMUERZO' && audit.novedadesAlmuerzo !== 'NO APLICA JORNADA LABORAL' && !audit.novedadesAlmuerzo.includes('NO REGISTRA');
                                const isInconsistent = audit.marcacionesConsistentes === 'INCONSISTENTES';

                                // Format date as DD/MM/YYYY
                                const [y, m, d] = audit.fecha.split('-');
                                const dateFormatted = `${d}/${m}/${y}`;

                                return (
                                    <tr 
                                        key={`${audit.userId}-${audit.fecha}-${idx}`}
                                        className={`transition-colors hover:bg-slate-100/80 font-mono ${
                                            isNoLaborable 
                                                ? 'bg-slate-50/70 text-slate-400' 
                                                : isSinNovedad 
                                                    ? 'bg-emerald-50/30' 
                                                    : 'bg-white'
                                        }`}
                                    >
                                        {/* Fecha */}
                                        <td className="px-3 py-2 border-r border-slate-200 font-bold whitespace-nowrap text-slate-800">
                                            {dateFormatted}
                                        </td>

                                        {/* Marcación 1 & Origen */}
                                        <td className="px-3 py-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-slate-800">
                                            {audit.marcacion1 || (isNoLaborable ? '-' : <span className="text-slate-400 font-normal">0</span>)}
                                        </td>
                                        <td className="px-2 py-2 border-r border-slate-200 text-center whitespace-nowrap text-[10px] text-slate-500">
                                            {audit.marcacion1 ? audit.origen1 : '-'}
                                        </td>

                                        {/* Marcación 2 & Origen */}
                                        <td className="px-3 py-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-slate-800">
                                            {audit.marcacion2 || (isNoLaborable ? '-' : <span className="text-slate-400 font-normal">0</span>)}
                                        </td>
                                        <td className="px-2 py-2 border-r border-slate-200 text-center whitespace-nowrap text-[10px] text-slate-500">
                                            {audit.marcacion2 ? audit.origen2 : '-'}
                                        </td>

                                        {/* Marcación 3 & Origen */}
                                        <td className="px-3 py-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-slate-800">
                                            {audit.marcacion3 || (isNoLaborable ? '-' : <span className="text-slate-400 font-normal">0</span>)}
                                        </td>
                                        <td className="px-2 py-2 border-r border-slate-200 text-center whitespace-nowrap text-[10px] text-slate-500">
                                            {audit.marcacion3 ? audit.origen3 : '-'}
                                        </td>

                                        {/* Marcación 4 & Origen */}
                                        <td className="px-3 py-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-slate-800">
                                            {audit.marcacion4 || (isNoLaborable ? '-' : <span className="text-slate-400 font-normal">0</span>)}
                                        </td>
                                        <td className="px-2 py-2 border-r border-slate-200 text-center whitespace-nowrap text-[10px] text-slate-500">
                                            {audit.marcacion4 ? audit.origen4 : '-'}
                                        </td>

                                        {/* Grupo Ocupacional */}
                                        <td className="px-3 py-2 border-r border-slate-200 whitespace-nowrap text-slate-700 font-sans font-semibold text-[10px]">
                                            {audit.grupoOcupacional}
                                        </td>

                                        {/* Tipo Funcionario (FD / OTROS) */}
                                        <td className="px-2 py-2 border-r border-slate-200 text-center whitespace-nowrap font-bold">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                                audit.tipoFuncionario === 'FD' 
                                                    ? 'bg-indigo-100 text-indigo-800' 
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {audit.tipoFuncionario}
                                            </span>
                                        </td>

                                        {/* Día Semana */}
                                        <td className="px-3 py-2 border-r border-slate-200 whitespace-nowrap font-sans text-slate-600">
                                            {audit.diaSemana}
                                        </td>

                                        {/* Laborable */}
                                        <td className="px-2 py-2 border-r border-slate-200 text-center whitespace-nowrap font-sans">
                                            <span className={`text-[10px] font-semibold ${
                                                audit.esLaborable ? 'text-slate-800' : 'text-slate-400 italic'
                                            }`}>
                                                {audit.laborableLabel}
                                            </span>
                                        </td>

                                        {/* Horario Definido */}
                                        <td className="px-2 py-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-600">
                                            {audit.horaEntradaDefinida}
                                        </td>
                                        <td className="px-2 py-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-600">
                                            {audit.horaSalidaDefinida}
                                        </td>

                                        {/* Tiempo Almuerzo Tomado (U9) */}
                                        <td className="px-3 py-2 border-r border-slate-200 text-center whitespace-nowrap font-bold">
                                            {audit.tiempoAlmuerzoTomado.includes('NO REGISTRA') ? (
                                                <span className="text-slate-500 font-normal text-[10px] font-sans">
                                                    {audit.tiempoAlmuerzoTomado}
                                                </span>
                                            ) : audit.tiempoAlmuerzoTomado === 'MAL TIMBRADO' ? (
                                                <span className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded text-[10px]">
                                                    MAL TIMBRADO
                                                </span>
                                            ) : (
                                                <span className="text-indigo-900 font-mono">
                                                    {audit.tiempoAlmuerzoTomado}
                                                </span>
                                            )}
                                        </td>

                                        {/* Tiempo Almuerzo Autorizado (V9) */}
                                        <td className="px-2 py-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-600">
                                            {audit.tiempoAlmuerzoAutorizado}
                                        </td>

                                        {/* Novedades Entrada (W9) */}
                                        <td className={`px-3 py-2 border-r border-slate-200 whitespace-nowrap text-center font-bold ${
                                            hasLate ? 'bg-yellow-200 text-yellow-900' :
                                            audit.novedadesEntrada === 'SIN NOVEDAD' ? 'text-emerald-700' :
                                            'text-slate-500 font-normal font-sans text-[10px]'
                                        }`}>
                                            {audit.novedadesEntrada}
                                        </td>

                                        {/* Novedades Almuerzo (X9) */}
                                        <td className={`px-3 py-2 border-r border-slate-200 whitespace-nowrap text-center font-bold ${
                                            hasLunchExcess ? 'bg-amber-100 text-amber-900' :
                                            audit.novedadesAlmuerzo === 'DENTRO DE TIEMPO DE ALMUERZO' ? 'text-emerald-700' :
                                            'text-slate-500 font-normal font-sans text-[10px]'
                                        }`}>
                                            {audit.novedadesAlmuerzo}
                                        </td>

                                        {/* Novedades Salida */}
                                        <td className={`px-3 py-2 border-r border-slate-200 whitespace-nowrap text-center font-bold ${
                                            audit.novedadesSalida === 'SIN NOVEDAD' ? 'text-emerald-700' :
                                            audit.novedadesSalida === 'NO APLICA JORNADA LABORAL' ? 'text-slate-400 font-normal font-sans text-[10px]' :
                                            'text-rose-700'
                                        }`}>
                                            {audit.novedadesSalida}
                                        </td>

                                        {/* Tiempo Fuera Jornada */}
                                        <td className="px-3 py-2 border-r border-slate-200 whitespace-nowrap text-center text-slate-600 text-[10px] font-sans">
                                            {audit.tiempoFueraJornada}
                                        </td>

                                        {/* Marcaciones Consistentes */}
                                        <td className="px-3 py-2 border-r border-slate-200 whitespace-nowrap text-center font-bold font-sans">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                                isInconsistent 
                                                    ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                                    : 'text-slate-600'
                                            }`}>
                                                {audit.marcacionesConsistentes}
                                            </span>
                                        </td>

                                        {/* Novedades Día */}
                                        <td className="px-3 py-2 whitespace-nowrap text-center font-bold font-sans">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                audit.novedadesDia === 'DIA SIN NOVEDAD' 
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                                    : audit.novedadesDia === 'DIA CON NOVEDAD' 
                                                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                                        : 'text-slate-400 font-normal italic'
                                            }`}>
                                                {audit.novedadesDia}
                                            </span>
                                        </td>

                                        {/* Action Button */}
                                        <td className="px-2 py-2 whitespace-nowrap text-center font-sans">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedAuditForModal(audit)}
                                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-[10px] transition"
                                            >
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {displayedAudits.length === 0 && (
                                <tr>
                                    <td colSpan={24} className="py-12 text-center text-slate-500 font-sans text-xs">
                                        No se encontraron registros de auditoría para los criterios seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AUDIT DETAILS & BIOMETRIC EVIDENCE MODAL */}
            {selectedAuditForModal && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[120] flex justify-center items-center p-3 sm:p-4"
                    onClick={() => setSelectedAuditForModal(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden font-sans"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                            <div>
                                <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                                    Auditoría de Jornada Oficial
                                </span>
                                <h3 className="font-bold text-base mt-1 text-white">
                                    {selectedAuditForModal.userName} · {selectedAuditForModal.fecha} ({selectedAuditForModal.diaSemana})
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {selectedAuditForModal.grupoOcupacional} · Tipo: {selectedAuditForModal.tipoFuncionario} · Cédula: {selectedAuditForModal.cedula}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedAuditForModal(null)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            >
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </header>

                        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
                            {/* Novedades Summary Banner */}
                            <div className={`p-4 rounded-xl border flex items-center justify-between ${
                                selectedAuditForModal.novedadesDia === 'DIA SIN NOVEDAD' 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                                    : 'bg-rose-50 border-rose-200 text-rose-900'
                            }`}>
                                <div className="flex items-center gap-2.5">
                                    {selectedAuditForModal.novedadesDia === 'DIA SIN NOVEDAD' ? (
                                        <CheckCircleIcon className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                                    ) : (
                                        <AlertTriangleIcon className="h-6 w-6 text-rose-600 flex-shrink-0" />
                                    )}
                                    <div>
                                        <p className="font-bold text-sm">{selectedAuditForModal.novedadesDia}</p>
                                        <p className="text-[11px] opacity-80">
                                            {selectedAuditForModal.novedadesDia === 'DIA SIN NOVEDAD' 
                                                ? 'Cumplió entrada puntual, tiempo de almuerzo autorizado y salida completa.' 
                                                : 'Se han detectado una o más novedades durante las marcaciones de la jornada.'}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-xs bg-white/80 px-2.5 py-1 rounded-lg border border-current">
                                    {selectedAuditForModal.laborableLabel}
                                </span>
                            </div>

                            {/* Detailed Calculations Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">1. Entrada</p>
                                    <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                                        {selectedAuditForModal.marcacion1 || '0'}
                                    </p>
                                    <p className="text-[10px] text-slate-600 mt-1">
                                        Novedad: <strong className="text-slate-900">{selectedAuditForModal.novedadesEntrada}</strong>
                                    </p>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">2. Almuerzo Tomado</p>
                                    <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                                        {selectedAuditForModal.tiempoAlmuerzoTomado}
                                    </p>
                                    <p className="text-[10px] text-slate-600 mt-1">
                                        Aut: <strong>{selectedAuditForModal.tiempoAlmuerzoAutorizado}</strong>
                                    </p>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">3. Salida</p>
                                    <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                                        {selectedAuditForModal.marcacion4 || '0'}
                                    </p>
                                    <p className="text-[10px] text-slate-600 mt-1">
                                        Novedad: <strong className="text-slate-900">{selectedAuditForModal.novedadesSalida}</strong>
                                    </p>
                                </div>

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">4. Secuencia</p>
                                    <p className={`text-sm font-bold mt-1 ${
                                        selectedAuditForModal.marcacionesConsistentes === 'CONSISTENTES' ? 'text-emerald-700' : 'text-rose-700'
                                    }`}>
                                        {selectedAuditForModal.marcacionesConsistentes}
                                    </p>
                                    <p className="text-[10px] text-slate-600 mt-1">
                                        Fuera Jornada: <strong>{selectedAuditForModal.tiempoFueraJornada}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Biometric & Facial Evidence Section */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                <h4 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5">
                                    <CameraIcon className="h-4 w-4 text-sky-600" />
                                    Auditoría Biométrica Facial y Georreferenciación
                                </h4>

                                {selectedAuditForModal.punches.length === 0 ? (
                                    <p className="text-slate-500 italic text-xs">
                                        No hay marcajes registrados en el sistema para esta fecha.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedAuditForModal.punches.map((p, pIdx) => (
                                            <div key={pIdx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    {p.photoProof ? (
                                                        <img 
                                                            src={p.photoProof} 
                                                            alt="Foto marcaje" 
                                                            className="h-12 w-12 rounded-lg object-cover border border-slate-300"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                                                            Sin Foto
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-800">
                                                            {p.type === 'in' ? 'Entrada' : p.type === 'out_break' ? 'Salida Almuerzo' : p.type === 'in_break' ? 'Entrada Almuerzo' : 'Salida'} · {p.time}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500">
                                                            Vía {p.method || 'WEB'} · Origen {p.origin || 'WEB'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    {p.facialConfidence !== undefined && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            p.facialMatch === false 
                                                                ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                                                : 'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                            {p.facialMatch === false ? `🚨 Discrepancia (${p.facialConfidence}%)` : `✓ Rostro ${p.facialConfidence}%`}
                                                        </span>
                                                    )}
                                                    {p.distanceFromInstitution !== undefined && p.distanceFromInstitution > 0 && (
                                                        <p className="text-[10px] text-slate-500 mt-1">
                                                            Distancia: {p.distanceFromInstitution} m
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <footer className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedAuditForModal(null)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition"
                            >
                                Cerrar Auditoría
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffAttendanceReport;