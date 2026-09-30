import React, { useState, useMemo } from 'react';
import { User, Class, Subject, ScheduleEntry, TimeSlot, Timetable, Room, Role } from '../../types';
import { CloseIcon, CalendarIcon, GraduationCapIcon, ClipboardListIcon, PhoneIcon, EmailIcon, LocationMarkerIcon, ClockIcon, EditIcon } from '../icons/Icons';
import ScheduleView from '../schedule/ScheduleView';

interface TeacherProfileModalProps {
    teacher: User | null;
    isOpen: boolean;
    onClose: () => void;
    classes: Class[];
    subjects: Subject[];
    schedule: ScheduleEntry[];
    timeSlots: TimeSlot[];
    timetables: Timetable[];
    rooms: Room[];
    users?: User[];
    onEdit?: (teacher: User) => void;
}

const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
    teacher,
    isOpen,
    onClose,
    classes,
    subjects,
    schedule,
    timeSlots,
    timetables,
    rooms,
    users = [],
    onEdit,
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'workload'>('schedule');

    // 1. Teacher subjects
    const teacherSubjects = useMemo(() => {
        if (!teacher) return [];
        return subjects.filter(s => s.teacherId === teacher.id);
    }, [teacher, subjects]);

    const teacherSubjectIds = useMemo(() => new Set(teacherSubjects.map(s => s.id)), [teacherSubjects]);

    // 2. Classes where teacher is tutor or teaches subjects or assigned via classIds
    const teacherClasses = useMemo(() => {
        if (!teacher) return [];
        const classIds = new Set<string>(teacher.classIds || []);
        classes.forEach(c => {
            if (c.tutorId === teacher.id) classIds.add(c.id);
        });
        // Also classes from schedule
        schedule.forEach(e => {
            if (teacherSubjectIds.has(e.subjectId) && e.classId) {
                classIds.add(e.classId);
            }
        });
        return classes.filter(c => classIds.has(c.id));
    }, [teacher, classes, teacherSubjectIds, schedule]);

    // 3. Schedule entries for this teacher
    const teacherScheduleEntries = useMemo(() => {
        if (!teacher) return [];
        return schedule.filter(e => teacherSubjectIds.has(e.subjectId));
    }, [teacher, schedule, teacherSubjectIds]);

    // 4. Timetables & Time slots resolution
    const teacherTimetables = useMemo(() => {
        if (!teacher) return [];
        // First check timetables from teacher's classes
        const ttIds = new Set<string>();
        teacherClasses.forEach(c => {
            if (c.timetableId) ttIds.add(c.timetableId);
        });
        const matched = timetables.filter(t => ttIds.has(t.id));
        if (matched.length > 0) return matched;

        // Fallback: institution's timetables
        const instTimetables = timetables.filter(t => !t.institutionId || t.institutionId === teacher.institutionId);
        if (instTimetables.length > 0) return instTimetables;

        return timetables;
    }, [teacher, teacherClasses, timetables]);

    const primaryTimetable = teacherTimetables[0] || null;

    // 5. Relevant Time Slots
    const relevantTimeSlots = useMemo(() => {
        if (!teacher) return [];
        const primaryTtId = primaryTimetable?.id;

        // Collect candidate slots matching teacher's timetables, used in schedule, or matching shift
        let candidateSlots = timeSlots.filter(ts => {
            if (primaryTtId && ts.timetableId === primaryTtId) return true;
            if (teacherScheduleEntries.some(e => e.timeSlotId === ts.id)) return true;
            return false;
        });

        if (candidateSlots.length === 0 && primaryTimetable?.shift) {
            candidateSlots = timeSlots.filter(ts => ts.shift === primaryTimetable.shift);
        }

        if (candidateSlots.length === 0) {
            candidateSlots = timeSlots;
        }

        // Deduplicate by id and sort chronologically
        const seen = new Set<string>();
        const result: TimeSlot[] = [];
        candidateSlots.forEach(ts => {
            if (!seen.has(ts.id)) {
                seen.add(ts.id);
                result.push(ts);
            }
        });
        return result.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [teacher, primaryTimetable, timeSlots, teacherScheduleEntries]);

    // Total weekly assigned teaching hours
    const totalWeeklyHours = teacherScheduleEntries.length;
    const maxWeeklyAllowed = teacher?.horasMaximas || (teacher?.esPeriodoLactancia ? 20 : 25);

    if (!isOpen || !teacher) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-center items-center p-4 overflow-y-auto" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="p-6 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
                            {teacher.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">{teacher.name}</h2>
                                <span className="text-xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-medium">
                                    {teacher.role}
                                </span>
                            </div>
                            <p className="text-sm text-indigo-200 mt-0.5">{teacher.email}</p>
                            {teacher.cedula && (
                                <p className="text-xs text-slate-300 mt-1">C.I: <span className="font-mono">{teacher.cedula}</span></p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <button 
                                onClick={() => {
                                    onClose();
                                    onEdit(teacher);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition"
                                title="Editar datos del docente"
                            >
                                <EditIcon className="h-4 w-4" />
                                <span>Editar</span>
                            </button>
                        )}
                        <button 
                            onClick={onClose} 
                            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                        >
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <nav className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'schedule'
                                ? 'border-primary-600 text-primary-600 bg-white rounded-t-lg'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <CalendarIcon className="h-4 w-4" />
                        <span>Horario Asignado</span>
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">
                            {totalWeeklyHours}h
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('workload')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'workload'
                                ? 'border-primary-600 text-primary-600 bg-white rounded-t-lg'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <ClipboardListIcon className="h-4 w-4" />
                        <span>Carga y Asignaturas</span>
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                            {teacherSubjects.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'info'
                                ? 'border-primary-600 text-primary-600 bg-white rounded-t-lg'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <GraduationCapIcon className="h-4 w-4" />
                        <span>Ficha y Datos Laborales</span>
                    </button>
                </nav>

                {/* Content */}
                <main className="p-6 overflow-y-auto flex-1 bg-slate-50">
                    {activeTab === 'schedule' && (
                        <div className="space-y-4">
                            {/* Summary Card */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary-50 text-primary-600 rounded-lg">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Plantilla de Horario Asignada</p>
                                        <h4 className="text-base font-bold text-slate-800">
                                            {primaryTimetable ? `${primaryTimetable.name} (${primaryTimetable.shift})` : 'Plantilla Institucional Matutina'}
                                        </h4>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                                        {totalWeeklyHours} / {maxWeeklyAllowed} horas asignadas
                                    </span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-medium">
                                        {relevantTimeSlots.length} franjas horarias
                                    </span>
                                </div>
                            </div>

                            {/* Notice if no classes yet */}
                            {totalWeeklyHours === 0 && (
                                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center justify-between">
                                    <span>
                                        ℹ️ El docente está vinculado a la plantilla institucional pero aún no tiene horas registradas en el distributivo semanal. A continuación se presentan las franjas horarias oficiales de su jornada.
                                    </span>
                                </div>
                            )}

                            {/* Schedule Grid */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                <ScheduleView
                                    title={`Horario Semanal - ${teacher.name}`}
                                    scheduleEntries={teacherScheduleEntries}
                                    timeSlots={relevantTimeSlots}
                                    subjects={subjects}
                                    classes={classes}
                                    rooms={rooms}
                                    users={users.length > 0 ? users : [teacher]}
                                    viewType="teacher"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'workload' && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Horas Asignadas</p>
                                    <p className="text-2xl font-bold text-primary-600 mt-1">{totalWeeklyHours} <span className="text-sm text-slate-400 font-normal">/ {maxWeeklyAllowed}h</span></p>
                                    <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                                        <div 
                                            className={`h-full ${totalWeeklyHours > maxWeeklyAllowed ? 'bg-rose-500' : 'bg-primary-600'}`}
                                            style={{ width: `${Math.min(100, (totalWeeklyHours / maxWeeklyAllowed) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Asignaturas a Cargo</p>
                                    <p className="text-2xl font-bold text-indigo-600 mt-1">{teacherSubjects.length}</p>
                                    <p className="text-xs text-slate-500 mt-1">Materias en distributivo</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Paralelos Asignados</p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">{teacherClasses.length}</p>
                                    <p className="text-xs text-slate-500 mt-1">Grupos estudiantiles</p>
                                </div>
                            </div>

                            {/* Subjects Table */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                                <div className="p-4 border-b border-slate-200">
                                    <h4 className="font-bold text-slate-800 text-sm">Asignaturas y Carga Curricular</h4>
                                </div>
                                {teacherSubjects.length > 0 ? (
                                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                                        <thead className="bg-slate-50 text-slate-500 text-xs font-semibold">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Asignatura</th>
                                                <th className="px-4 py-3 text-left">Área de Conocimiento</th>
                                                <th className="px-4 py-3 text-center">Horas Semanales</th>
                                                <th className="px-4 py-3 text-center">Horas en Horario</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {teacherSubjects.map(sub => {
                                                const scheduledCount = teacherScheduleEntries.filter(e => e.subjectId === sub.id).length;
                                                return (
                                                    <tr key={sub.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-semibold text-slate-800">{sub.name}</td>
                                                        <td className="px-4 py-3 text-slate-600">{sub.areaOfKnowledge || 'General'}</td>
                                                        <td className="px-4 py-3 text-center text-slate-700 font-bold">{sub.maxWeeklyHours || 5}h</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                                scheduledCount >= (sub.maxWeeklyHours || 5)
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {scheduledCount}h
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="p-6 text-center text-slate-500 text-sm">No tiene asignaturas asignadas en el distributivo de materias.</p>
                                )}
                            </div>

                            {/* Classes List */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                <h4 className="font-bold text-slate-800 text-sm mb-3">Paralelos Vinculados</h4>
                                {teacherClasses.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {teacherClasses.map(c => (
                                            <div key={c.id} className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-2">
                                                <span>{c.name}</span>
                                                {c.tutorId === teacher.id && (
                                                    <span className="bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">Tutor</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-xs">No tiene paralelos directamente vinculados.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            {/* Personal & Contact Details */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                                <h4 className="font-bold text-slate-800 text-sm mb-4 border-b pb-2">Información Personal y Contacto</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500">Nombre Completo:</span>
                                        <p className="font-medium text-slate-900">{teacher.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500">Cédula de Identidad:</span>
                                        <p className="font-medium text-slate-900">{teacher.cedula || 'No registrada'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500">Correo Electrónico:</span>
                                        <p className="font-medium text-slate-900 flex items-center gap-1.5">
                                            <EmailIcon className="h-4 w-4 text-slate-400" />
                                            <a href={`mailto:${teacher.email}`} className="text-primary-600 hover:underline">{teacher.email}</a>
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500">Teléfono:</span>
                                        <p className="font-medium text-slate-900 flex items-center gap-1.5">
                                            <PhoneIcon className="h-4 w-4 text-slate-400" />
                                            {teacher.phone ? <a href={`tel:${teacher.phone}`} className="text-slate-700 hover:underline">{teacher.phone}</a> : 'No registrado'}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-xs font-semibold text-slate-500">Dirección:</span>
                                        <p className="font-medium text-slate-900 flex items-center gap-1.5">
                                            <LocationMarkerIcon className="h-4 w-4 text-slate-400" />
                                            {teacher.address || 'No registrada'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* GETH Characterization */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                                <h4 className="font-bold text-slate-800 text-sm mb-4 border-b pb-2">Políticas y Caracterización GETH (LOEI)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500">Relación Laboral:</span>
                                        <p className="font-medium text-slate-900 capitalize">{teacher.relacionLaboral || 'Contrato'}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500">Carga Horaria Máxima:</span>
                                        <p className="font-medium text-slate-900">{maxWeeklyAllowed} horas pedagógicas semanales</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500">Período de Lactancia:</span>
                                        <p className="font-medium">
                                            {teacher.esPeriodoLactancia ? (
                                                <span className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                                    Sí (Límite max 20h)
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">No</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500">Limitación de Movilidad:</span>
                                        <p className="font-medium">
                                            {teacher.tieneLimitacionMovilidad ? (
                                                <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                                    Sí (Requiere aulas accesibles)
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">No</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Labor Schedule */}
                            {teacher.workSchedule && Object.keys(teacher.workSchedule).length > 0 && (
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                                    <div className="flex items-center gap-2 mb-3 border-b pb-2">
                                        <ClockIcon className="h-5 w-5 text-primary-600" />
                                        <h4 className="font-bold text-slate-800 text-sm">Horario Laboral Registrado (Entrada y Salida)</h4>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => {
                                            const sch = teacher.workSchedule?.[day];
                                            return (
                                                <div key={day} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                                                    <p className="font-bold text-xs text-slate-700">{day}</p>
                                                    {sch?.startTime && sch?.endTime ? (
                                                        <p className="text-xs font-mono text-primary-700 font-semibold mt-1">
                                                            {sch.startTime} - {sch.endTime}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[11px] text-slate-400 mt-1">Sin horario</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TeacherProfileModal;
