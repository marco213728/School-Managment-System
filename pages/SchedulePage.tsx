import React, { useContext, useMemo, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { ScheduleEntry, Subject, TimeSlot, Room, Timetable, User, Class, Student, Role } from '../types';
import { CalendarIcon, UsersIcon } from '../components/icons/Icons';
import ScheduleView from '../components/schedule/ScheduleView';

interface SchedulePageProps {
    schedule: ScheduleEntry[];
    subjects: Subject[];
    timeSlots: TimeSlot[];
    rooms: Room[];
    timetables: Timetable[];
    users: User[];
    classes: Class[];
    students: Student[];
}

const SchedulePage: React.FC<SchedulePageProps> = ({ schedule, subjects, timeSlots, rooms, timetables, users, classes, students }) => {
    const { user: currentUser } = useContext(UserContext);
    
    // For admin / leadership view
    const [adminViewMode, setAdminViewMode] = useState<'class' | 'teacher'>('class');
    const [selectedAdminClassId, setSelectedAdminClassId] = useState<string>(() => {
        const classWithEntries = classes.find(c => schedule.some(s => s.classId === c.id));
        return classWithEntries ? classWithEntries.id : classes[0]?.id || '';
    });
    const [selectedAdminTeacherId, setSelectedAdminTeacherId] = useState<string>(() => {
        const teachers = users.filter(u => u.role === Role.Teacher);
        return teachers[0]?.id || '';
    });

    const isLeadershipRole = currentUser && [Role.InstitutionAdmin, Role.Rector, Role.InspectorGeneral, Role.Vicerrector, Role.SuperAdmin].includes(currentUser.role);

    const scheduleData = useMemo(() => {
        if (!currentUser) return null;

        // 1. LEADERSHIP / ADMIN VIEW
        if (isLeadershipRole) {
            if (adminViewMode === 'class') {
                const targetClass = classes.find(c => c.id === selectedAdminClassId) || classes[0];
                if (!targetClass) return null;

                const instTimetables = timetables.filter(t => !t.institutionId || t.institutionId === targetClass.institutionId);
                const classTimetable = targetClass.timetableId 
                    ? timetables.find(t => t.id === targetClass.timetableId)
                    : (instTimetables[0] || timetables[0] || null);

                const classScheduleEntries = schedule.filter(e => e.classId === targetClass.id);
                const usedSlotIds = new Set(classScheduleEntries.map(e => e.timeSlotId));

                let candidateSlots = timeSlots.filter(ts => {
                    if (classTimetable && ts.timetableId === classTimetable.id) return true;
                    if (usedSlotIds.has(ts.id)) return true;
                    return false;
                });

                if (candidateSlots.length === 0 && classTimetable?.shift) {
                    candidateSlots = timeSlots.filter(ts => ts.shift === classTimetable.shift);
                }

                if (candidateSlots.length === 0) {
                    candidateSlots = timeSlots;
                }

                const seen = new Set<string>();
                const relevantTimeSlots: TimeSlot[] = [];
                candidateSlots.forEach(ts => {
                    if (!seen.has(ts.id)) {
                        seen.add(ts.id);
                        relevantTimeSlots.push(ts);
                    }
                });
                relevantTimeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

                return {
                    title: `Horario Semanal - ${targetClass.name}`,
                    scheduleEntries: classScheduleEntries,
                    timeSlots: relevantTimeSlots,
                    viewType: 'student' as const,
                    timetableName: classTimetable?.name || 'Plantilla General',
                    shift: classTimetable?.shift || 'Matutina'
                };
            } else {
                // Teacher view selected by Admin
                const targetTeacher = users.find(u => u.id === selectedAdminTeacherId) || users.find(u => u.role === Role.Teacher);
                if (!targetTeacher) return null;

                const teacherSubjects = subjects.filter(s => s.teacherId === targetTeacher.id);
                const teacherSubjectIds = new Set(teacherSubjects.map(s => s.id));
                const teacherScheduleEntries = schedule.filter(e => teacherSubjectIds.has(e.subjectId));

                const instTimetables = timetables.filter(t => !t.institutionId || t.institutionId === targetTeacher.institutionId);
                const primaryTimetable = instTimetables[0] || timetables[0] || null;

                let candidateSlots = timeSlots.filter(ts => {
                    if (primaryTimetable && ts.timetableId === primaryTimetable.id) return true;
                    if (teacherScheduleEntries.some(e => e.timeSlotId === ts.id)) return true;
                    return false;
                });

                if (candidateSlots.length === 0) {
                    candidateSlots = timeSlots;
                }

                const seen = new Set<string>();
                const relevantTimeSlots: TimeSlot[] = [];
                candidateSlots.forEach(ts => {
                    if (!seen.has(ts.id)) {
                        seen.add(ts.id);
                        relevantTimeSlots.push(ts);
                    }
                });
                relevantTimeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

                return {
                    title: `Horario Semanal del Docente - ${targetTeacher.name}`,
                    scheduleEntries: teacherScheduleEntries,
                    timeSlots: relevantTimeSlots,
                    viewType: 'teacher' as const,
                    timetableName: primaryTimetable?.name || 'Plantilla Institucional',
                    shift: primaryTimetable?.shift || 'Matutina'
                };
            }
        }

        // 2. TEACHER VIEW (Own Schedule)
        if (currentUser.role === Role.Teacher) {
            const teacherSubjects = subjects.filter(s => s.teacherId === currentUser.id);
            const teacherSubjectIds = new Set(teacherSubjects.map(s => s.id));
            
            const teacherScheduleEntries = schedule.filter(e => teacherSubjectIds.has(e.subjectId));

            const teacherClassIds = new Set<string>(currentUser.classIds || []);
            classes.forEach(c => {
                if (c.tutorId === currentUser.id) teacherClassIds.add(c.id);
            });
            teacherScheduleEntries.forEach(e => teacherClassIds.add(e.classId));
            
            const teacherTimetableIds = new Set<string>();
            classes.forEach(c => {
                if (teacherClassIds.has(c.id) && c.timetableId) {
                    teacherTimetableIds.add(c.timetableId);
                }
            });

            const instTimetables = timetables.filter(t => !t.institutionId || t.institutionId === currentUser.institutionId);
            if (teacherTimetableIds.size === 0 && instTimetables.length > 0) {
                instTimetables.forEach(t => teacherTimetableIds.add(t.id));
            }

            const primaryTimetable = instTimetables.find(t => teacherTimetableIds.has(t.id)) || instTimetables[0] || timetables[0] || null;

            let candidateSlots = timeSlots.filter(ts => {
                if (ts.timetableId && teacherTimetableIds.has(ts.timetableId)) return true;
                if (teacherScheduleEntries.some(e => e.timeSlotId === ts.id)) return true;
                return false;
            });

            if (candidateSlots.length === 0 && primaryTimetable?.shift) {
                candidateSlots = timeSlots.filter(ts => ts.shift === primaryTimetable.shift);
            }

            if (candidateSlots.length === 0) {
                candidateSlots = timeSlots;
            }

            const seen = new Set<string>();
            const relevantTimeSlots: TimeSlot[] = [];
            candidateSlots.forEach(ts => {
                if (!seen.has(ts.id)) {
                    seen.add(ts.id);
                    relevantTimeSlots.push(ts);
                }
            });
            relevantTimeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

            return {
                title: `Mi Horario Semanal - ${currentUser.name}`,
                scheduleEntries: teacherScheduleEntries,
                timeSlots: relevantTimeSlots,
                viewType: 'teacher' as const,
                timetableName: primaryTimetable?.name || 'Plantilla Institucional',
                shift: primaryTimetable?.shift || 'Matutina'
            };
        }
        
        // 3. STUDENT VIEW
        const student = students.find(s => s.id === currentUser.id);
        const studentClass = student ? classes.find(c => c.id === student.classId) : null;
        
        if (!studentClass) return null;

        const instTimetables = timetables.filter(t => !t.institutionId || t.institutionId === studentClass.institutionId);
        const classTimetable = studentClass.timetableId 
            ? timetables.find(t => t.id === studentClass.timetableId)
            : (instTimetables[0] || timetables[0] || null);

        const classScheduleEntries = schedule.filter(e => e.classId === studentClass.id);
        const usedSlotIds = new Set(classScheduleEntries.map(e => e.timeSlotId));

        let candidateSlots = timeSlots.filter(ts => {
            if (classTimetable && ts.timetableId === classTimetable.id) return true;
            if (usedSlotIds.has(ts.id)) return true;
            return false;
        });

        if (candidateSlots.length === 0 && classTimetable?.shift) {
            candidateSlots = timeSlots.filter(ts => ts.shift === classTimetable.shift);
        }

        if (candidateSlots.length === 0) {
            candidateSlots = timeSlots;
        }

        const seen = new Set<string>();
        const relevantTimeSlots: TimeSlot[] = [];
        candidateSlots.forEach(ts => {
            if (!seen.has(ts.id)) {
                seen.add(ts.id);
                relevantTimeSlots.push(ts);
            }
        });
        relevantTimeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

        return {
            title: `Horario Semanal - ${studentClass.name}`,
            scheduleEntries: classScheduleEntries,
            timeSlots: relevantTimeSlots,
            viewType: 'student' as const,
            timetableName: classTimetable?.name || 'Plantilla General',
            shift: classTimetable?.shift || 'Matutina'
        };
    }, [currentUser, schedule, classes, timeSlots, students, timetables, subjects, users, isLeadershipRole, adminViewMode, selectedAdminClassId, selectedAdminTeacherId]);

    const teachersList = useMemo(() => {
        return users.filter(u => u.role === Role.Teacher);
    }, [users]);

    if (!scheduleData || scheduleData.timeSlots.length === 0) {
        return (
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Mi Horario</h2>
                <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-lg mx-auto border border-slate-200">
                    <CalendarIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700">Sin horario asignado</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Aún no se ha vinculado una plantilla de horario o franjas horarias a tu perfil. Por favor, contacta con la administración de la institución.
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {/* Leadership Selector Bar */}
            {isLeadershipRole && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Modo de Consulta:</span>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setAdminViewMode('class')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminViewMode === 'class' ? 'bg-white shadow text-primary-600' : 'text-slate-600'}`}
                            >
                                Por Curso
                            </button>
                            <button
                                onClick={() => setAdminViewMode('teacher')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition ${adminViewMode === 'teacher' ? 'bg-white shadow text-primary-600' : 'text-slate-600'}`}
                            >
                                Por Docente
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {adminViewMode === 'class' ? (
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-slate-600">Curso:</label>
                                <select
                                    value={selectedAdminClassId}
                                    onChange={(e) => setSelectedAdminClassId(e.target.value)}
                                    className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium text-slate-800"
                                >
                                    {classes.map(c => {
                                        const count = schedule.filter(s => s.classId === c.id).length;
                                        return (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({count} hrs)
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-slate-600">Docente:</label>
                                <select
                                    value={selectedAdminTeacherId}
                                    onChange={(e) => setSelectedAdminTeacherId(e.target.value)}
                                    className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium text-slate-800"
                                >
                                    {teachersList.map(t => {
                                        const tSubjIds = new Set(subjects.filter(s => s.teacherId === t.id).map(s => s.id));
                                        const count = schedule.filter(s => tSubjIds.has(s.subjectId)).length;
                                        return (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({count} hrs)
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-50 text-primary-600 rounded-lg">
                        <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plantilla Asignada</span>
                        <h4 className="text-base font-bold text-slate-800">
                            {scheduleData.timetableName} ({scheduleData.shift})
                        </h4>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 font-bold px-3 py-1 rounded-full">
                        {scheduleData.scheduleEntries.length} horas programadas
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 font-medium px-2.5 py-1 rounded-full">
                        {scheduleData.timeSlots.length} franjas horarias
                    </span>
                </div>
            </div>

            {scheduleData.scheduleEntries.length === 0 && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>
                        Tu perfil está vinculado a la plantilla oficial ({scheduleData.timetableName}). Aún no se han registrado materias específicas en el distributivo de clases. A continuación puedes revisar la distribución de franjas horarias de tu jornada.
                    </span>
                </div>
            )}

            <ScheduleView
                title={scheduleData.title}
                scheduleEntries={scheduleData.scheduleEntries}
                timeSlots={scheduleData.timeSlots}
                subjects={subjects}
                classes={classes}
                rooms={rooms}
                users={users}
                viewType={scheduleData.viewType}
            />
        </div>
    );
};

export default SchedulePage;
