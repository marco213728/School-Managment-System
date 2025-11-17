import React, { useState, useMemo, useContext } from 'react';
import { User, Class, Subject, TimeSlot, ScheduleEntry, LeccionarioEntry, MicroPlan, CurricularPlanStatus } from '../types';
import { UserContext } from '../contexts/UserContext';
import LeccionarioForm from '../components/leccionario/LeccionarioForm';
import PrintableLeccionario from '../components/leccionario/PrintableLeccionario';
import { PrinterIcon, EditIcon, PlusIcon, ClipboardDocumentCheckIcon } from '../components/icons/Icons';

interface LeccionarioPageProps {
    leccionarioEntries: LeccionarioEntry[];
    onUpdateLeccionarioEntries: (entries: LeccionarioEntry[]) => void;
    schedule: ScheduleEntry[];
    classes: Class[];
    subjects: Subject[];
    users: User[];
    timeSlots: TimeSlot[];
    microPlans: MicroPlan[]; // Added microPlans to props
}

const LeccionarioPage: React.FC<LeccionarioPageProps> = ({ leccionarioEntries, onUpdateLeccionarioEntries, schedule, classes, subjects, users, timeSlots, microPlans }) => {
    const { user: currentUser } = useContext(UserContext);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [editingEntryData, setEditingEntryData] = useState<{ entry: LeccionarioEntry | null, timeSlotId: string, subjectId: string }>({ entry: null, timeSlotId: '', subjectId: '' });

    const teacherClasses = useMemo(() => {
        if (!currentUser) return [];
        // Get all unique class IDs this teacher teaches
        const taughtClassIds = new Set(
            schedule
                .filter(s => {
                    const subject = subjects.find(sub => sub.id === s.subjectId);
                    return subject?.teacherId === currentUser.id;
                })
                .map(s => s.classId)
        );
        return classes.filter(c => taughtClassIds.has(c.id));
    }, [currentUser, classes, schedule, subjects]);

    const scheduleForDay = useMemo(() => {
        const dayOfWeek = selectedDate.toLocaleDateString('es-ES', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase()) as ScheduleEntry['day'];
        return schedule
            .filter(s => {
                const subject = subjects.find(sub => sub.id === s.subjectId);
                return s.classId === selectedClassId && s.day === dayOfWeek && subject?.teacherId === currentUser?.id;
            })
            .map(s => {
                const subject = subjects.find(sub => sub.id === s.subjectId);
                const teacher = users.find(u => u.id === subject?.teacherId);
                const timeSlot = timeSlots.find(ts => ts.id === s.timeSlotId);
                return { ...s, subjectName: subject?.name || '', teacherName: teacher?.name || '', timeSlot: timeSlot! };
            })
            .sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
    }, [selectedClassId, selectedDate, schedule, subjects, users, timeSlots, currentUser]);

    const handleOpenForm = (timeSlotId: string, subjectId: string) => {
        const entry = leccionarioEntries.find(e => e.classId === selectedClassId && e.date === selectedDate.toISOString().split('T')[0] && e.timeSlotId === timeSlotId);
        setEditingEntryData({ entry: entry || null, timeSlotId, subjectId });
        setIsFormOpen(true);
    };

    const handleSaveEntry = (data: Omit<LeccionarioEntry, 'id'|'institutionId'|'teacherId'>) => {
        const existingEntry = leccionarioEntries.find(e => e.date === data.date && e.classId === data.classId && e.timeSlotId === data.timeSlotId);
        let updatedEntries;
        if (existingEntry) {
            updatedEntries = leccionarioEntries.map(e => e.id === existingEntry.id ? { ...e, ...data, teacherId: currentUser!.id } : e);
        } else {
            const newEntry: LeccionarioEntry = {
                id: `lec-${Date.now()}`,
                institutionId: currentUser!.institutionId!,
                teacherId: currentUser!.id,
                ...data
            };
            updatedEntries = [...leccionarioEntries, newEntry];
        }
        onUpdateLeccionarioEntries(updatedEntries);
        setIsFormOpen(false);
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Leccionario Estudiantil Diario</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full p-2 border rounded-md"><option value="">Seleccionar Clase</option>{teacherClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <input type="date" value={selectedDate.toISOString().split('T')[0]} onChange={e => {
                        const newDate = new Date(e.target.value);
                        const timezoneOffset = newDate.getTimezoneOffset() * 60000;
                        setSelectedDate(new Date(newDate.getTime() + timezoneOffset));
                    }} className="w-full p-2 border rounded-md" />
                </div>
                {selectedClassId ? (
                    <>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setIsPrintOpen(true)} disabled={scheduleForDay.length === 0} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"><PrinterIcon className="h-5 w-5" />Imprimir Leccionario del Día</button>
                        </div>
                        <div className="space-y-4">
                            {scheduleForDay.map(item => {
                                const entry = leccionarioEntries.find(e => e.classId === selectedClassId && e.date === selectedDate.toISOString().split('T')[0] && e.timeSlotId === item.timeSlotId);
                                return (
                                    <div key={item.timeSlotId} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{item.timeSlot.startTime} - {item.timeSlot.endTime}</p>
                                            <p className="text-primary-700 font-semibold">{item.subjectName}</p>
                                        </div>
                                        <button onClick={() => handleOpenForm(item.timeSlotId, item.subjectId)} className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md ${entry ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {entry ? <><EditIcon className="h-4 w-4" />Editar</> : <><PlusIcon className="h-4 w-4" />Llenar Leccionario</>}
                                        </button>
                                    </div>
                                );
                            })}
                            {scheduleForDay.length === 0 && <p className="text-center text-gray-500 py-4">No tienes clases programadas para esta fecha en la clase seleccionada.</p>}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                        <p>Por favor, seleccione una clase para ver el horario del día.</p>
                    </div>
                )}
            </div>
            {isFormOpen && (<LeccionarioForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveEntry} entryToEdit={editingEntryData.entry} classId={selectedClassId} subjectId={editingEntryData.subjectId} date={selectedDate.toISOString().split('T')[0]} timeSlotId={editingEntryData.timeSlotId} microPlans={microPlans} />)}
            {isPrintOpen && selectedClassId && (<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"><div id="leccionario-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"><header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10"><h3 className="text-lg font-semibold">Vista Previa</h3><div className="flex items-center gap-2"><button onClick={() => setIsPrintOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cerrar</button><button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md"><PrinterIcon className="h-5 w-5" />Imprimir / PDF</button></div></header><div className="overflow-y-auto"><PrintableLeccionario leccionarioEntries={leccionarioEntries.filter(e => e.classId === selectedClassId && e.date === selectedDate.toISOString().split('T')[0])} selectedClass={classes.find(c => c.id === selectedClassId)!} selectedDate={selectedDate} scheduleForDay={scheduleForDay} /></div></div></div>)}
        </div>
    );
};

export default LeccionarioPage;