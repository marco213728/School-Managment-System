import React, { useState, useMemo, useContext } from 'react';
import { ExitPass, Student, User, Notification, Role } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import { ArrowLeftIcon, PlusIcon, SearchIcon, PrinterIcon } from '../icons/Icons';
import ExitPassForm from './ExitPassForm';
import PrintableExitPass from './PrintableExitPass';

interface ExitPassManagementProps {
    exitPasses: ExitPass[];
    onUpdateExitPasses: (passes: ExitPass[]) => void;
    students: Student[];
    users: User[];
    notifications: Notification[];
    onUpdateNotifications: (notifications: Notification[]) => void;
    onBack: () => void;
}

const StudentSelector: React.FC<{ students: Student[], onSelect: (studentId: string) => void, onCancel: () => void }> = ({ students, onSelect, onCancel }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredStudents = useMemo(() => {
        return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [students, searchTerm]);

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Seleccionar Estudiante</h3>
             <div className="relative mb-4">
                <input type="text" placeholder="Buscar estudiante..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md" />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
            </div>
            <ul className="divide-y max-h-80 overflow-y-auto border rounded-md">
                {filteredStudents.map(student => (
                    <li key={student.id} onClick={() => onSelect(student.id)} className="p-3 hover:bg-gray-50 cursor-pointer">
                        {student.name}
                    </li>
                ))}
            </ul>
            <button onClick={onCancel} className="mt-4 text-sm text-gray-600 hover:underline">Cancelar</button>
        </div>
    );
};


const ExitPassManagement: React.FC<ExitPassManagementProps> = ({ exitPasses, onUpdateExitPasses, students, users, notifications, onUpdateNotifications, onBack }) => {
    const { user: currentUser } = useContext(UserContext);
    const [view, setView] = useState<'list' | 'select_student'>('list');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [printingPass, setPrintingPass] = useState<ExitPass | null>(null);
    
    const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);
    const inspectorMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

    const handleSavePass = (formData: { reason: string; responsibleName: string; responsibleId: string }) => {
        if (!selectedStudent || !currentUser) return;

        const newPass: ExitPass = {
            id: `ep-${Date.now()}`,
            institutionId: currentUser.institutionId!,
            studentId: selectedStudent.id,
            inspectorId: currentUser.id,
            date: new Date().toISOString(),
            ...formData,
        };

        const updatedPasses = [...exitPasses, newPass];
        onUpdateExitPasses(updatedPasses);
        
        // --- Trigger Parent Notification ---
        const parent = users.find(u => u.id === selectedStudent.parentId);
        if (parent) {
            const time = new Date(newPass.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const newNotification: Notification = {
                id: `notif-exit-${Date.now()}`,
                institutionId: currentUser.institutionId!,
                userId: parent.id,
                title: "Pase de Salida Registrado",
                message: `Su hijo/a ${selectedStudent.name} ha salido de la institución a las ${time} acompañado/a por ${newPass.responsibleName}.`,
                date: new Date().toISOString(),
                read: false,
            };
            onUpdateNotifications([...notifications, newNotification]);
        }
        // --- End Notification ---
        
        setIsFormOpen(false);
        setSelectedStudent(null);
        setView('list');
        setPrintingPass(newPass); // Open print preview
    };

    const sortedPasses = useMemo(() => [...exitPasses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [exitPasses]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4" />
                Volver al Dashboard de Inspección
            </button>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Gestionar Pases de Salida</h2>
                {view === 'list' && (
                    <button onClick={() => setView('select_student')} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        <PlusIcon className="h-5 w-5" />
                        Registrar Salida
                    </button>
                )}
            </div>

            {view === 'list' && (
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retirado por</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedPasses.map(pass => (
                                <tr key={pass.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(pass.date).toLocaleString('es-ES')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{studentMap.get(pass.studentId)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{pass.reason}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pass.responsibleName} ({pass.responsibleId})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setPrintingPass(pass)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100" title="Imprimir Pase"><PrinterIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {view === 'select_student' && (
                <StudentSelector 
                    students={students}
                    onSelect={(studentId) => {
                        setSelectedStudent(students.find(s => s.id === studentId) || null);
                        setIsFormOpen(true);
                    }}
                    onCancel={() => setView('list')}
                />
            )}

            {isFormOpen && selectedStudent && (
                <ExitPassForm 
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false);
                        setSelectedStudent(null);
                        setView('list');
                    }}
                    onSave={handleSavePass}
                    studentName={selectedStudent.name}
                />
            )}

            {printingPass && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                    <div id="exit-pass-print-section" className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                         <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Vista Previa del Pase de Salida</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPrintingPass(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                                    <PrinterIcon className="h-5 w-5" /> Imprimir
                                </button>
                            </div>
                        </header>
                         <div className="overflow-y-auto">
                            <PrintableExitPass 
                                pass={printingPass}
                                studentName={studentMap.get(printingPass.studentId) || ''}
                                inspectorName={inspectorMap.get(printingPass.inspectorId) || ''}
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ExitPassManagement;