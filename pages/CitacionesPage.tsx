import React, { useState, useMemo, useContext } from 'react';
import { 
    Citacion, 
    User, 
    Student, 
    Role, 
    Notification, 
    CitacionStatus, 
    Appointment, 
    Class, 
    ScheduleEntry, 
    TimeSlot 
} from '../types';
import { UserContext } from '../contexts/UserContext';
import { PlusIcon, PrinterIcon, CitacionIcon, CalendarIcon, ShieldCheckIcon } from '../components/icons/Icons';
import CitacionForm from '../components/citaciones/CitacionForm';
import PrintableCitacion from '../components/citaciones/PrintableCitacion';
import MultiDeptAppointmentEngine from '../components/appointments/MultiDeptAppointmentEngine';

export interface CitacionesPageProps {
    users: User[];
    students: Student[];
    classes?: Class[];
    schedule?: ScheduleEntry[];
    timeSlots?: TimeSlot[];
    citaciones: Citacion[];
    onUpdateCitaciones: (citaciones: Citacion[]) => void;
    appointments?: Appointment[];
    onUpdateAppointments?: (appointments: Appointment[]) => void;
    notifications: Notification[];
    onUpdateNotifications: (notifications: Notification[]) => void;
}

const CitacionesPage: React.FC<CitacionesPageProps> = ({ 
    users, 
    students, 
    classes = [],
    schedule = [],
    timeSlots = [],
    citaciones, 
    onUpdateCitaciones, 
    appointments = [],
    onUpdateAppointments = () => {},
    notifications, 
    onUpdateNotifications 
}) => {
    const { user: currentUser } = useContext(UserContext);
    const [subTab, setSubTab] = useState<'appointments' | 'printed_citaciones'>('appointments');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [printingCitacion, setPrintingCitacion] = useState<Citacion | null>(null);

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);

    const isStaff = currentUser && [Role.Teacher, Role.JefeDECE, Role.PsicologoEducativo, Role.TrabajadorSocial, Role.InspectorGeneral, Role.Vicerrector, Role.InstitutionAdmin, Role.HealthProfessional].includes(currentUser.role);

    const relevantCitaciones = useMemo(() => {
        if (!currentUser) return [];
        if (isStaff) {
            return citaciones.filter(c => c.staffId === currentUser.id && c.institutionId === currentUser.institutionId);
        } else if (currentUser.role === Role.Parent) {
            return citaciones.filter(c => c.parentId === currentUser.id && c.institutionId === currentUser.institutionId);
        }
        return [];
    }, [currentUser, citaciones, isStaff]);

    const handleSave = (formData: { studentId: string; date: string; reason: string }) => {
        if (!currentUser) return;

        const student = students.find(s => s.id === formData.studentId);
        if (!student) return;

        const newCitacion: Citacion = {
            id: `cit-${Date.now()}`,
            institutionId: currentUser.institutionId!,
            studentId: formData.studentId,
            parentId: student.parentId,
            staffId: currentUser.id,
            date: formData.date,
            reason: formData.reason,
            status: CitacionStatus.Sent,
            creationDate: new Date().toISOString(),
        };

        const newNotification: Notification = {
            id: `notif-cit-${Date.now()}`,
            institutionId: currentUser.institutionId!,
            userId: student.parentId,
            title: `Nueva Citación para ${student.name}`,
            message: `Ha recibido una nueva citación para una reunión el ${new Date(formData.date).toLocaleString('es-ES')}.`,
            date: new Date().toISOString(),
            read: false,
        };

        onUpdateCitaciones([...citaciones, newCitacion]);
        onUpdateNotifications([...notifications, newNotification]);
        setIsFormOpen(false);
    };

    const sortedCitaciones = [...relevantCitaciones].sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            {/* Top Sub-Navigation */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setSubTab('appointments')}
                        className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
                            subTab === 'appointments' 
                                ? 'border-indigo-600 text-indigo-700' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <CalendarIcon className="h-4 w-4" />
                        <span>Citas y Agendamiento Multidepartamental (Docentes, DECE, Médico, Inspección)</span>
                    </button>

                    <button
                        onClick={() => setSubTab('printed_citaciones')}
                        className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
                            subTab === 'printed_citaciones' 
                                ? 'border-indigo-600 text-indigo-700' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <CitacionIcon className="h-4 w-4" />
                        <span>Citaciones Escritas para Impresión</span>
                    </button>
                </nav>
            </div>

            {subTab === 'appointments' && (
                <MultiDeptAppointmentEngine
                    appointments={appointments}
                    onUpdateAppointments={onUpdateAppointments}
                    users={users}
                    students={students}
                    classes={classes}
                    schedule={schedule}
                    timeSlots={timeSlots}
                    notifications={notifications}
                    onUpdateNotifications={onUpdateNotifications}
                />
            )}

            {subTab === 'printed_citaciones' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Convocatorias y Citaciones Físicas</h2>
                            <p className="text-xs text-slate-500">Documentos formales emitidos para entrega firmada o notificación escrita.</p>
                        </div>
                        {isStaff && (
                            <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition">
                                <PlusIcon className="h-4 w-4" />
                                Nueva Citación Escrita
                            </button>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                        <div className="overflow-x-auto">
                            {sortedCitaciones.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200 text-xs">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase">{isStaff ? 'Estudiante' : 'Enviado por'}</th>
                                            <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase">Fecha de la Cita</th>
                                            <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase">Motivo</th>
                                            <th className="px-5 py-3 text-right font-bold text-slate-500 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sortedCitaciones.map(citacion => (
                                            <tr key={citacion.id} className="hover:bg-slate-50">
                                                <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900">
                                                    {isStaff ? studentMap.get(citacion.studentId) : userMap.get(citacion.staffId)}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-mono">
                                                    {new Date(citacion.date).toLocaleString('es-ES')}
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-600 max-w-sm truncate" title={citacion.reason}>
                                                    {citacion.reason}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium">
                                                    <button onClick={() => setPrintingCitacion(citacion)} className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition" title="Imprimir Citación">
                                                        <PrinterIcon className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                                    <CitacionIcon className="mx-auto h-12 w-12 text-slate-300" />
                                    <h3 className="mt-2 text-base font-bold text-slate-800">No hay citaciones impresas</h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {isStaff ? 'Actualmente no tiene citaciones escritas emitidas.' : 'No ha recibido ninguna citación.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <CitacionForm 
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                    students={students}
                />
            )}

            {printingCitacion && (
                <PrintableCitacion 
                    citacion={printingCitacion}
                    student={students.find(s => s.id === printingCitacion.studentId)}
                    staff={users.find(u => u.id === printingCitacion.staffId)}
                    parent={users.find(u => u.id === printingCitacion.parentId)}
                    onClose={() => setPrintingCitacion(null)}
                />
            )}
        </div>
    );
};

export default CitacionesPage;