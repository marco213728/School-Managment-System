

import React, { useState, useMemo, useEffect } from 'react';
import { ScheduleEntry, Class, TimeSlot, Subject, User, Role, Shift, Room, Timetable } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';
import { ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon, PrinterIcon } from '../icons/Icons';
import ScheduleForm from './ScheduleForm';
import PrintableSchedule from './PrintableSchedule';


interface ScheduleManagementProps {
    schedule: ScheduleEntry[];
    classes: Class[];
    timeSlots: TimeSlot[];
    subjects: Subject[];
    rooms: Room[];
    timetables: Timetable[];
    users: User[];
    onUpdateSchedule: (schedule: ScheduleEntry[]) => void;
    onBack: () => void;
}

const WorkloadSummary: React.FC<{
    subjectLoads: { name: string; percentage: number; scheduled: number; max: number }[];
    teacherLoads: { name: string; percentage: number; scheduled: number; max: number }[];
}> = ({ subjectLoads, teacherLoads }) => {
    return (
        <div className="p-4 bg-gray-50 border rounded-lg mb-4">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Resumen de Carga Horaria</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Asignaturas (para esta clase)</h5>
                    <div className="space-y-2 text-xs max-h-40 overflow-y-auto pr-2">
                        {subjectLoads.map(s => (
                            <div key={s.name}>
                                <div className="flex justify-between mb-0.5">
                                    <span className="font-semibold">{s.name}</span>
                                    <span>{s.scheduled} / {s.max} hrs</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${s.percentage > 100 ? 'bg-red-500' : 'bg-primary-600'}`} style={{ width: `${Math.min(s.percentage, 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Profesores (total semanal)</h5>
                     <div className="space-y-2 text-xs max-h-40 overflow-y-auto pr-2">
                        {teacherLoads.map(t => (
                            <div key={t.name}>
                                <div className="flex justify-between mb-0.5">
                                    <span className="font-semibold">{t.name}</span>
                                    <span>~{t.scheduled} / {t.max} hrs</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                     <div className={`h-1.5 rounded-full ${t.percentage > 100 ? 'bg-red-500' : 'bg-primary-600'}`} style={{ width: `${Math.min(t.percentage, 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScheduleManagement: React.FC<ScheduleManagementProps> = ({ schedule, classes, timeSlots, subjects, rooms, users, timetables, onUpdateSchedule, onBack }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    
    const [editingData, setEditingData] = useState<{
        day: ScheduleEntry['day'],
        timeSlotId: string,
        entryToEdit: ScheduleEntry | null,
        unavailableSubjects: { id: string, reason: string }[],
        unavailableRoomIds: string[],
    } | null>(null);

    const [selectedClassId, setSelectedClassId] = useState<string>('');

    const classMap = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
    const teacherMap = useMemo(() => new Map(users.filter(u => u.role === Role.Teacher).map(t => [t.id, t.name])), [users]);
    const timeSlotMap = useMemo(() => new Map(timeSlots.map(ts => [ts.id, ts])), [timeSlots]);
    const roomMap = useMemo(() => new Map(rooms.map(r => [r.id, r.name])), [rooms]);
    
    const availableShifts = useMemo(() => {
        const shifts = new Set(timeSlots.map(ts => ts.shift));
        return Array.from(shifts).sort();
    }, [timeSlots]);
    
    const [selectedShift, setSelectedShift] = useState<Shift | undefined>(availableShifts[0]);
    
    useEffect(() => {
        if (!selectedShift || !availableShifts.includes(selectedShift)) {
            setSelectedShift(availableShifts[0]);
        }
    }, [availableShifts, selectedShift]);

    const workload = useMemo(() => {
        const subjectLoads = subjects
            .filter(s => s.maxWeeklyHours && (selectedClassId ? schedule.some(e => e.classId === selectedClassId && e.subjectId === s.id) : true))
            .map(subject => {
                const scheduled = schedule.filter(e => e.classId === selectedClassId && e.subjectId === subject.id).length;
                return { id: subject.id, name: subject.name, scheduled, max: subject.maxWeeklyHours!, percentage: (scheduled / subject.maxWeeklyHours!) * 100 };
            });

        const teacherLoads = users
            .filter(u => u.role === Role.Teacher && u.maxMonthlyHours)
            .map(teacher => {
                const weeklyLimit = teacher.maxMonthlyHours! / 4;
                const teacherSubjects = subjects.filter(s => s.teacherId === teacher.id).map(s => s.id);
                const scheduled = schedule.filter(e => teacherSubjects.includes(e.subjectId)).length;
                return { id: teacher.id, name: teacher.name, scheduled, max: weeklyLimit, percentage: (scheduled / weeklyLimit) * 100 };
            });

        return { subjectLoads, teacherLoads };
    }, [schedule, subjects, users, selectedClassId]);

    const handleOpenForm = (day: ScheduleEntry['day'], timeSlotId: string, entryToEdit: ScheduleEntry | null = null) => {
        // Resources unavailable due to a clash in the same time slot
        const entriesInSlot = schedule.filter(e => e.day === day && e.timeSlotId === timeSlotId);
        const otherEntriesInSlot = entryToEdit ? entriesInSlot.filter(e => e.classId !== entryToEdit.classId) : entriesInSlot;
        const busyTeacherIds = otherEntriesInSlot.map(e => subjectMap.get(e.subjectId)?.teacherId).filter(Boolean) as string[];
        const busyRoomIds = otherEntriesInSlot.map(e => e.roomId);
        
        const unavailableSubjects: { id: string; reason: string; }[] = [];
        
        subjects.forEach(subject => {
            // Check for teacher time slot clash
            if (busyTeacherIds.includes(subject.teacherId)) {
                unavailableSubjects.push({ id: subject.id, reason: "Profesor ocupado en esta franja" });
                return; // No need for further checks if teacher is busy
            }
            
            // Check for subject weekly hour limit FOR THE SELECTED CLASS
            const subLoad = workload.subjectLoads.find(sl => sl.id === subject.id);
            if (subLoad && subLoad.scheduled >= subLoad.max && entryToEdit?.subjectId !== subject.id) {
                unavailableSubjects.push({ id: subject.id, reason: "Límite de horas de la asignatura alcanzado" });
                return;
            }

            // Check for teacher total weekly hour limit
            const teacherLoad = workload.teacherLoads.find(tl => tl.id === subject.teacherId);
            if (teacherLoad && teacherLoad.scheduled >= teacherLoad.max && entryToEdit?.subjectId !== subject.id) {
                 unavailableSubjects.push({ id: subject.id, reason: "Límite de horas del profesor alcanzado" });
            }
        });

        setEditingData({
            day,
            timeSlotId,
            entryToEdit,
            unavailableSubjects,
            unavailableRoomIds: busyRoomIds,
        });
        setIsFormOpen(true);
    };

    const handleSave = (subjectId: string, roomId: string) => {
        if (!editingData || !selectedClassId) return;

        const { day, timeSlotId, entryToEdit } = editingData;
        let updatedSchedule = [...schedule];

        const oldEntryIndex = entryToEdit ? updatedSchedule.findIndex(e => e.day === day && e.timeSlotId === timeSlotId && e.classId === selectedClassId) : -1;

        if (oldEntryIndex > -1) {
            updatedSchedule.splice(oldEntryIndex, 1);
        }

        if (subjectId && roomId) {
            const newEntry: ScheduleEntry = { day, timeSlotId, classId: selectedClassId, subjectId, roomId };
            updatedSchedule.push(newEntry);
        }

        onUpdateSchedule(updatedSchedule);
        setIsFormOpen(false);
        setEditingData(null);
    };
    
    const handleRemove = (day: ScheduleEntry['day'], timeSlotId: string, classId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta clase del horario?')) {
            onUpdateSchedule(schedule.filter(e => !(e.day === day && e.timeSlotId === timeSlotId && e.classId === classId)));
        }
    }
    
    const visibleTimeSlots = useMemo(() => {
        if (!selectedShift) return [];
        return timeSlots.filter(ts => ts.shift === selectedShift).sort((a,b) => a.startTime.localeCompare(b.startTime));
    }, [timeSlots, selectedShift]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a Gestión del Centro
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-gray-700">Configurar Horario Semanal</h3>
                <div className="flex items-center gap-2">
                    {availableShifts.length > 0 && (
                        <div>
                            <label htmlFor="shift-selector" className="sr-only">Seleccionar Jornada</label>
                            <select
                                id="shift-selector"
                                value={selectedShift || ''}
                                onChange={(e) => setSelectedShift(e.target.value as Shift)}
                                className="px-3 py-1.5 border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 rounded-md shadow-sm"
                            >
                                {availableShifts.map(shift => (
                                    <option key={shift} value={shift}>{shift}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="my-4 flex items-end gap-4">
                <div className="flex-grow">
                    <label htmlFor="class-selector" className="block text-sm font-medium text-gray-700">
                        Filtrar por Clase
                    </label>
                    <select
                        id="class-selector"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="mt-1 block w-full md:w-2/3 p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">-- Vista General (Todas las clases) --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                {selectedClassId && (
                    <button
                        onClick={() => setIsPrintModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 flex-shrink-0"
                    >
                        <PrinterIcon className="h-5 w-5" />
                        Imprimir Horario
                    </button>
                )}
            </div>
            {selectedClassId && <WorkloadSummary subjectLoads={workload.subjectLoads} teacherLoads={workload.teacherLoads} />}

            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Franja Horaria</th>
                            {DAYS_OF_WEEK.map(day => (
                                <th key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {visibleTimeSlots.map(slot => {
                            if (slot.isBreak) {
                                return (
                                    <tr key={slot.id}>
                                        <td className="px-2 py-2 text-sm font-medium text-gray-500 bg-gray-100">{slot.startTime} - {slot.endTime}</td>
                                        <td colSpan={5} className="text-center text-sm font-semibold text-gray-600 bg-gray-100">D E S C A N S O</td>
                                    </tr>
                                );
                            }
                            return (
                                <tr key={slot.id}>
                                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">{slot.startTime} - {slot.endTime}</td>
                                    {DAYS_OF_WEEK.map(day => {
                                        const allEntriesInSlot = schedule.filter(e => e.day === day && e.timeSlotId === slot.id);
                                        const entryForSelectedClass = selectedClassId ? allEntriesInSlot.find(e => e.classId === selectedClassId) : null;
                                        
                                        return (
                                            <td key={day} className="px-1 py-1 align-top border-l h-24">
                                                <div className="h-full w-full relative flex flex-col gap-1">
                                                    {selectedClassId ? (
                                                        // Focused View: Only show selected class's entry or an add button
                                                        entryForSelectedClass ? (
                                                            <div className="bg-primary-100 text-primary-800 p-1 rounded-md text-xs group relative text-center">
                                                                <p className="font-bold">{subjectMap.get(entryForSelectedClass.subjectId)?.name}</p>
                                                                <p className="text-gray-600">{teacherMap.get(subjectMap.get(entryForSelectedClass.subjectId)?.teacherId || '')}</p>
                                                                <p className="text-gray-500 font-semibold">@{roomMap.get(entryForSelectedClass.roomId)}</p>
                                                                <div className="absolute top-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleOpenForm(day, slot.id, entryForSelectedClass)} className="p-1 hover:bg-white rounded-full" title="Editar"><EditIcon className="h-4 w-4"/></button>
                                                                    <button onClick={() => handleRemove(day, slot.id, entryForSelectedClass.classId)} className="p-1 hover:bg-white rounded-full" title="Eliminar"><TrashIcon className="h-4 w-4 text-red-500"/></button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => handleOpenForm(day, slot.id)} className="w-full flex-grow flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 border-2 border-dashed hover:border-gray-300"><PlusIcon className="h-5 w-5"/></button>
                                                        )
                                                    ) : (
                                                        // General View: Show all classes
                                                        allEntriesInSlot.map(entry => {
                                                            const subject = subjectMap.get(entry.subjectId);
                                                            return(
                                                                <div key={entry.classId} className="bg-gray-100 text-gray-700 p-1 rounded-md text-xs text-center">
                                                                    <p className="font-bold">{classMap.get(entry.classId)}</p>
                                                                    <p>{subject?.name}</p>
                                                                </div>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isFormOpen && editingData && (
                <ScheduleForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                    subjects={subjects}
                    rooms={rooms}
                    day={editingData.day}
                    classNameDisplay={classMap.get(selectedClassId) || ''}
                    timeSlotDisplay={`${timeSlotMap.get(editingData.timeSlotId)?.startTime} - ${timeSlotMap.get(editingData.timeSlotId)?.endTime}`}
                    entryToEdit={editingData.entryToEdit}
                    unavailableSubjects={editingData.unavailableSubjects}
                    unavailableRoomIds={editingData.unavailableRoomIds}
                />
            )}
            {isPrintModalOpen && selectedClassId && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div id="schedule-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Horario Semanal - {classMap.get(selectedClassId)}</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsPrintModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                    <PrinterIcon className="h-5 w-5" /> Imprimir
                                </button>
                            </div>
                        </header>
                        <div className="overflow-y-auto">
                            <PrintableSchedule
                                classToPrint={classes.find(c => c.id === selectedClassId)!}
                                schedule={schedule.filter(e => e.classId === selectedClassId)}
                                subjects={subjects}
                                timeSlots={visibleTimeSlots}
                                users={users}
                                rooms={rooms}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleManagement;