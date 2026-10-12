import React, { useState, useMemo, useContext } from 'react';
import { User, Class, Subject, TimeSlot, ScheduleEntry, LeccionarioEntry, MicroPlan, CurricularPlanStatus, AbsenceRequest, Role } from '../types';
import { UserContext } from '../contexts/UserContext';
import LeccionarioForm from '../components/leccionario/LeccionarioForm';
import PrintableLeccionario from '../components/leccionario/PrintableLeccionario';
import { PrinterIcon, EditIcon, PlusIcon } from '../components/icons/Icons';
import { notifyOnLeccionarioRegistered } from '../lib/notificationService';

interface LeccionarioPageProps {
    leccionarioEntries: LeccionarioEntry[];
    onUpdateLeccionarioEntries: (entries: LeccionarioEntry[]) => void;
    schedule: ScheduleEntry[];
    classes: Class[];
    subjects: Subject[];
    users: User[];
    timeSlots: TimeSlot[];
    microPlans: MicroPlan[];
    absenceRequests?: AbsenceRequest[];
    onUpdateAbsenceRequests?: (r: AbsenceRequest[]) => void;
}

const LeccionarioPage: React.FC<LeccionarioPageProps> = ({ 
    leccionarioEntries, 
    onUpdateLeccionarioEntries, 
    schedule, 
    classes, 
    subjects, 
    users, 
    timeSlots, 
    microPlans,
    absenceRequests = [],
    onUpdateAbsenceRequests
}) => {
    const { user: currentUser } = useContext(UserContext);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [editingEntryData, setEditingEntryData] = useState<{ 
        entry: LeccionarioEntry | null; 
        timeSlotId: string; 
        subjectId: string;
        absenceRequest?: AbsenceRequest;
    }>({ entry: null, timeSlotId: '', subjectId: '' });

    const isAdminOrInspector = useMemo(() => {
        if (!currentUser) return false;
        return [
            Role.SuperAdmin, 
            Role.InstitutionAdmin, 
            Role.InspectorGeneral, 
            Role.Vicerrector, 
            Role.Rector
        ].includes(currentUser.role);
    }, [currentUser]);

    const selectableClasses = useMemo(() => {
        if (!currentUser) return [];
        if (isAdminOrInspector) {
            return classes;
        }

        // Classes taught regularly
        const regularClassIds = new Set(
            schedule
                .filter(s => {
                    const subject = subjects.find(sub => sub.id === s.subjectId);
                    return subject?.teacherId === currentUser.id;
                })
                .map(s => s.classId)
        );

        // Classes where this teacher is assigned as a substitute
        (absenceRequests || []).forEach(r => {
            if (r.docenteReemplazanteId === currentUser.id && r.estado === 'Aprobado') {
                regularClassIds.add(r.classId);
            }
        });

        return classes.filter(c => regularClassIds.has(c.id));
    }, [currentUser, classes, schedule, subjects, absenceRequests, isAdminOrInspector]);

    const dateStr = selectedDate.toISOString().split('T')[0];

    const scheduleForDay = useMemo(() => {
        const dayOfWeek = selectedDate.toLocaleDateString('es-ES', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase()) as ScheduleEntry['day'];

        // Regular schedule entries
        const regularItems = schedule
            .filter(s => {
                const subject = subjects.find(sub => sub.id === s.subjectId);
                const isMyClass = isAdminOrInspector || subject?.teacherId === currentUser?.id;
                return s.classId === selectedClassId && s.day === dayOfWeek && isMyClass;
            })
            .map(s => {
                const subject = subjects.find(sub => sub.id === s.subjectId);
                const teacher = users.find(u => u.id === subject?.teacherId);
                const timeSlot = timeSlots.find(ts => ts.id === s.timeSlotId);
                
                // Check if there is an approved substitution for this class slot today
                const substitution = (absenceRequests || []).find(r => 
                    r.classId === selectedClassId && 
                    r.subjectId === s.subjectId && 
                    r.fecha === dateStr &&
                    r.estado === 'Aprobado'
                );

                const replacementTeacher = substitution?.docenteReemplazanteId 
                    ? users.find(u => u.id === substitution.docenteReemplazanteId) 
                    : null;

                return { 
                    ...s, 
                    subjectName: subject?.name || 'Asignatura', 
                    teacherName: teacher?.name || 'Docente Titular', 
                    timeSlot: timeSlot || ({ id: s.timeSlotId, name: 'Bloque', startTime: '07:00', endTime: '07:45', institutionId: '', timetableId: '', shift: 'Matutina', isBreak: false } as unknown as TimeSlot),
                    substitution,
                    replacementTeacher
                };
            });

        // Also add any substitution assigned to currentUser on this date if not covered by regular schedule
        const activeSubstitutions = (absenceRequests || []).filter(r => 
            r.classId === selectedClassId && 
            r.fecha === dateStr && 
            r.estado === 'Aprobado' &&
            (isAdminOrInspector || r.docenteReemplazanteId === currentUser?.id)
        );

        activeSubstitutions.forEach(subReq => {
            const alreadyInList = regularItems.some(item => item.subjectId === subReq.subjectId);
            if (!alreadyInList) {
                const sub = subjects.find(s => s.id === subReq.subjectId);
                const titularTeacher = users.find(u => u.id === subReq.docenteTitularId);
                const replacementTeacher = users.find(u => u.id === subReq.docenteReemplazanteId);
                const timeSlot = timeSlots[subReq.periodo - 1] || timeSlots[0] || ({
                    id: `slot-${subReq.periodo}`,
                    name: `Periodo ${subReq.periodo}`,
                    startTime: '07:00',
                    endTime: '07:45',
                    institutionId: '',
                    timetableId: '',
                    shift: 'Matutina',
                    isBreak: false
                } as unknown as TimeSlot);

                regularItems.push({
                    id: `sub-entry-${subReq.id}`,
                    classId: subReq.classId,
                    subjectId: subReq.subjectId,
                    timeSlotId: timeSlot.id,
                    day: dayOfWeek,
                    roomId: '',
                    subjectName: sub?.name || 'Asignatura Asignada',
                    teacherName: titularTeacher?.name || 'Docente Titular',
                    timeSlot,
                    substitution: subReq,
                    replacementTeacher
                });
            }
        });

        return regularItems.sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
    }, [selectedClassId, selectedDate, schedule, subjects, users, timeSlots, currentUser, isAdminOrInspector, absenceRequests, dateStr]);

    const handleOpenForm = (timeSlotId: string, subjectId: string, substitution?: AbsenceRequest) => {
        const entry = leccionarioEntries.find(e => 
            e.classId === selectedClassId && 
            e.date === dateStr && 
            (e.timeSlotId === timeSlotId || e.absenceRequestId === substitution?.id)
        );

        setEditingEntryData({ 
            entry: entry || null, 
            timeSlotId, 
            subjectId,
            absenceRequest: substitution
        });
        setIsFormOpen(true);
    };

    const handleSaveEntry = async (data: Omit<LeccionarioEntry, 'id'|'institutionId'|'teacherId'>) => {
        const existingEntry = leccionarioEntries.find(e => 
            e.date === data.date && 
            e.classId === data.classId && 
            e.timeSlotId === data.timeSlotId
        );

        let savedEntryId = '';
        let updatedEntries: LeccionarioEntry[];

        const isReplacementClass = !!editingEntryData.absenceRequest;
        const subReq = editingEntryData.absenceRequest;

        if (existingEntry) {
            savedEntryId = existingEntry.id;
            updatedEntries = leccionarioEntries.map(e => e.id === existingEntry.id ? { 
                ...e, 
                ...data, 
                teacherId: currentUser!.id,
                isReplacement: isReplacementClass || e.isReplacement,
                replacedTeacherId: subReq?.docenteTitularId || e.replacedTeacherId,
                absenceRequestId: subReq?.id || e.absenceRequestId
            } : e);
        } else {
            savedEntryId = `lec-${Date.now()}`;
            const newEntry: LeccionarioEntry = {
                id: savedEntryId,
                institutionId: currentUser!.institutionId || 'uemol',
                teacherId: currentUser!.id,
                ...data,
                isReplacement: isReplacementClass,
                replacedTeacherId: subReq?.docenteTitularId,
                substituteTeacherName: currentUser?.name,
                absenceRequestId: subReq?.id
            };
            updatedEntries = [...leccionarioEntries, newEntry];
        }

        onUpdateLeccionarioEntries(updatedEntries);

        // Si fue una sustitución, actualizar el AbsenceRequest y enviar notificaciones
        if (subReq && onUpdateAbsenceRequests) {
            const updatedAbsences = absenceRequests.map(r => 
                r.id === subReq.id ? {
                    ...r,
                    leccionarioRegistered: true,
                    leccionarioEntryId: savedEntryId,
                    leccionarioDate: new Date().toISOString()
                } : r
            );
            onUpdateAbsenceRequests(updatedAbsences);

            const titularTeacher = users.find(u => u.id === subReq.docenteTitularId);
            const sub = subjects.find(s => s.id === subReq.subjectId);
            const cls = classes.find(c => c.id === subReq.classId);

            await notifyOnLeccionarioRegistered({
                absenceRequest: { ...subReq, leccionarioRegistered: true },
                docenteReemplazante: currentUser || undefined,
                docenteTitular: titularTeacher,
                subject: sub,
                classObj: cls,
                users,
                currentNotifications: []
            });
        }

        setIsFormOpen(false);
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Leccionario Estudiantil Diario</h2>
                        <p className="text-xs text-gray-500">
                            Registro oficial de clases, destrezas trabajadas, tareas y novedades pedagógicas en aula.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Clase / Paralelo</label>
                        <select 
                            value={selectedClassId} 
                            onChange={e => setSelectedClassId(e.target.value)} 
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="">Seleccionar Clase...</option>
                            {selectableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Fecha de la Clase</label>
                        <input 
                            type="date" 
                            value={selectedDate.toISOString().split('T')[0]} 
                            onChange={e => {
                                const newDate = new Date(e.target.value);
                                const timezoneOffset = newDate.getTimezoneOffset() * 60000;
                                setSelectedDate(new Date(newDate.getTime() + timezoneOffset));
                            }} 
                            className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                        />
                    </div>
                </div>

                {selectedClassId ? (
                    <>
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={() => setIsPrintOpen(true)} 
                                disabled={scheduleForDay.length === 0} 
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:bg-gray-400 shadow-sm"
                            >
                                <PrinterIcon className="h-4 w-4" />
                                Imprimir Leccionario del Día
                            </button>
                        </div>

                        <div className="space-y-4">
                            {scheduleForDay.map(item => {
                                const entry = leccionarioEntries.find(e => 
                                    e.classId === selectedClassId && 
                                    e.date === dateStr && 
                                    (e.timeSlotId === item.timeSlotId || e.absenceRequestId === item.substitution?.id)
                                );

                                const isSubstitution = !!item.substitution;

                                return (
                                    <div 
                                        key={item.id || item.timeSlotId} 
                                        className={`p-4 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                                            isSubstitution 
                                                ? 'bg-amber-50 border-amber-300' 
                                                : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900 text-sm">
                                                    {item.timeSlot.startTime} - {item.timeSlot.endTime}
                                                </p>
                                                {isSubstitution && (
                                                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-full">
                                                        🔄 Clase de Reemplazo
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-primary-700 font-semibold text-sm">{item.subjectName}</p>
                                            
                                            {isSubstitution ? (
                                                <div className="text-xs text-amber-900 bg-white p-2 rounded border border-amber-200">
                                                    <p>
                                                        <strong>Titular:</strong> {item.teacherName} • <strong>Reemplazante:</strong> {item.replacementTeacher?.name || item.substitution?.docenteReemplazanteNombre || 'Docente Sustituto'}
                                                    </p>
                                                    {item.substitution?.instrucciones && (
                                                        <p className="mt-0.5 text-gray-700">
                                                            <strong>Instrucciones:</strong> {item.substitution.instrucciones}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500">Docente: {item.teacherName}</p>
                                            )}

                                            {entry && (
                                                <p className="text-[11px] text-emerald-700 font-medium">
                                                    ✓ DCD: {entry.skillCode} • Tema: {entry.topics}
                                                </p>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => handleOpenForm(item.timeSlotId, item.subjectId, item.substitution)} 
                                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap ${
                                                entry 
                                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                                    : 'bg-primary-600 text-white hover:bg-primary-700'
                                            }`}
                                        >
                                            {entry ? (
                                                <>
                                                    <EditIcon className="h-4 w-4" />
                                                    Editar Leccionario
                                                </>
                                            ) : (
                                                <>
                                                    <PlusIcon className="h-4 w-4" />
                                                    {isSubstitution ? 'Asentar Reemplazo' : 'Llenar Leccionario'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}

                            {scheduleForDay.length === 0 && (
                                <p className="text-center text-gray-500 py-8 text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    No hay clases ni sustituciones programadas para esta fecha en la clase seleccionada.
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs">
                        <p>Por favor, seleccione una clase o paralelo para ver el horario del día y registrar el leccionario.</p>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <LeccionarioForm 
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    onSave={handleSaveEntry} 
                    entryToEdit={editingEntryData.entry} 
                    classId={selectedClassId} 
                    subjectId={editingEntryData.subjectId} 
                    date={dateStr} 
                    timeSlotId={editingEntryData.timeSlotId} 
                    microPlans={microPlans} 
                />
            )}

            {isPrintOpen && selectedClassId && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                    <div id="leccionario-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold">Vista Previa del Leccionario</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsPrintOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md text-xs font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md text-xs font-semibold hover:bg-primary-700">
                                    <PrinterIcon className="h-4 w-4" />
                                    Imprimir / PDF
                                </button>
                            </div>
                        </header>
                        <div className="overflow-y-auto">
                            <PrintableLeccionario 
                                leccionarioEntries={leccionarioEntries.filter(e => e.classId === selectedClassId && e.date === dateStr)} 
                                selectedClass={classes.find(c => c.id === selectedClassId)!} 
                                selectedDate={selectedDate} 
                                scheduleForDay={scheduleForDay} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeccionarioPage;
