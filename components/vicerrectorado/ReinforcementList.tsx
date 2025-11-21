import React, { useState } from 'react';
import { ReinforcementPlan, Student, User, Subject, Class } from '../../types';
import { EditIcon, PrinterIcon, PlusIcon, GraduationCapIcon } from '../icons/Icons';
import ReinforcementPrintable from './ReinforcementPrintable';

interface ReinforcementListProps {
    plans: ReinforcementPlan[];
    students: Student[];
    teachers: User[];
    subjects: Subject[];
    classes: Class[];
    onEdit: (plan: ReinforcementPlan) => void;
    onCreate: () => void;
}

const ReinforcementList: React.FC<ReinforcementListProps> = ({ plans, students, teachers, subjects, classes, onEdit, onCreate }) => {
    const [printData, setPrintData] = useState<{ plan: ReinforcementPlan, type: 'planning' | 'notification' | 'report' } | null>(null);

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Nominated': return <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">Nominado</span>;
            case 'Planned': return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-xs">Planificado</span>;
            case 'ParentNotified': return <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-600 text-xs">Notificado</span>;
            case 'In_Progress': return <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs">En Curso</span>;
            case 'Completed': return <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-600 text-xs">Finalizado</span>;
            default: return null;
        }
    };

    const handlePrint = (plan: ReinforcementPlan, type: 'planning' | 'notification' | 'report') => {
        setPrintData({ plan, type });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-700">Listado de Estudiantes en Refuerzo Académico</h3>
                <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">
                    <PlusIcon className="h-4 w-4" />
                    Nueva Nominación
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
                {plans.length > 0 ? (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estudiante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Asignatura</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Docente Refuerzo</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {plans.map(plan => (
                                <tr key={plan.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{students.find(s => s.id === plan.studentId)?.name}</div>
                                        <div className="text-xs text-slate-500">{classes.find(c => c.id === students.find(s => s.id === plan.studentId)?.classId)?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {subjects.find(s => s.id === plan.subjectId)?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {teachers.find(t => t.id === plan.teacherId)?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {getStatusBadge(plan.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                        <div className="relative group">
                                            <button className="p-1 text-slate-400 hover:text-slate-600"><PrinterIcon className="h-5 w-5"/></button>
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block border">
                                                <button onClick={() => handlePrint(plan, 'planning')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left">Imprimir Planificación</button>
                                                <button onClick={() => handlePrint(plan, 'notification')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left">Imprimir Notificación/Acta</button>
                                                {plan.status === 'Completed' && <button onClick={() => handlePrint(plan, 'report')} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left">Imprimir Informe Final</button>}
                                            </div>
                                        </div>
                                        <button onClick={() => onEdit(plan)} className="p-1 text-blue-600 hover:text-blue-900"><EditIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-16">
                        <GraduationCapIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-lg font-semibold text-slate-800">No hay planes de refuerzo</h3>
                        <p className="mt-1 text-sm text-slate-500">Comience por nominar a un estudiante para refuerzo académico.</p>
                        <div className="mt-6">
                            <button
                                onClick={onCreate}
                                className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Nueva Nominación
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Print Modal Overlay */}
            {printData && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Vista Previa</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPrintData(null)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"><PrinterIcon className="h-5 w-5" />Imprimir</button>
                            </div>
                        </header>
                        <div className="overflow-y-auto bg-slate-100 p-4">
                             <ReinforcementPrintable 
                                plan={printData.plan} 
                                type={printData.type}
                                student={students.find(s => s.id === printData.plan.studentId)!}
                                teacher={teachers.find(t => t.id === printData.plan.teacherId)!}
                                tutor={teachers.find(t => t.id === printData.plan.tutorId)!}
                                subject={subjects.find(s => s.id === printData.plan.subjectId)!}
                                classInfo={classes.find(c => c.id === students.find(s => s.id === printData.plan.studentId)?.classId)!}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReinforcementList;