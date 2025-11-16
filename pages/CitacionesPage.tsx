import React, { useState, useMemo, useContext } from 'react';
import { Citacion, User, Student, Role, Notification, CitacionStatus } from '../types';
import { UserContext } from '../contexts/UserContext';
import { PlusIcon, PrinterIcon } from '../components/icons/Icons';
import CitacionForm from '../components/citaciones/CitacionForm';
import PrintableCitacion from '../components/citaciones/PrintableCitacion';

interface CitacionesPageProps {
    users: User[];
    students: Student[];
    citaciones: Citacion[];
    onUpdateCitaciones: (citaciones: Citacion[]) => void;
    notifications: Notification[];
    onUpdateNotifications: (notifications: Notification[]) => void;
}

const CitacionesPage: React.FC<CitacionesPageProps> = ({ users, students, citaciones, onUpdateCitaciones, notifications, onUpdateNotifications }) => {
    const { user: currentUser } = useContext(UserContext);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [printingCitacion, setPrintingCitacion] = useState<Citacion | null>(null);

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);

    const isStaff = currentUser && [Role.Teacher, Role.JefeDECE, Role.PsicologoEducativo, Role.TrabajadorSocial, Role.InspectorGeneral, Role.Vicerrector, Role.InstitutionAdmin].includes(currentUser.role);

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

    const ListView: React.FC = () => (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isStaff ? 'Estudiante' : 'Enviado por'}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de la Cita</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedCitaciones.map(citacion => (
                            <tr key={citacion.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {isStaff ? studentMap.get(citacion.studentId) : userMap.get(citacion.staffId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(citacion.date).toLocaleString('es-ES')}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate" title={citacion.reason}>{citacion.reason}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setPrintingCitacion(citacion)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100" title="Imprimir Citación">
                                        <PrinterIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedCitaciones.length === 0 && (
                    <p className="text-center py-8 text-gray-500">No hay citaciones para mostrar.</p>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Módulo de Citaciones</h2>
                {isStaff && (
                    <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        <PlusIcon className="h-5 w-5" />
                        Crear Citación
                    </button>
                )}
            </div>
            <ListView />
            {isFormOpen && (
                <CitacionForm 
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                    students={students.filter(s => s.institutionId === currentUser?.institutionId)}
                />
            )}
            {printingCitacion && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                    <div id="citacion-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                         <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Vista Previa de Citación</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPrintingCitacion(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                    <PrinterIcon className="h-5 w-5" /> Imprimir
                                </button>
                            </div>
                        </header>
                         <div className="overflow-y-auto">
                           <PrintableCitacion
                                citacion={printingCitacion}
                                studentName={studentMap.get(printingCitacion.studentId) || ''}
                                parentName={userMap.get(printingCitacion.parentId) || ''}
                                staffName={userMap.get(printingCitacion.staffId) || ''}
                           />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitacionesPage;