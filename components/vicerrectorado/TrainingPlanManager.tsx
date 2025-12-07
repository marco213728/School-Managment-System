import React, { useState, useMemo, useContext, useEffect } from 'react';
import { TrainingPlan, TrainingCourse, User, Role, TeacherTrainingRecord, TrainingModality, TrainingType } from '../../types';
import { PlusIcon, CalendarIcon, UsersIcon, CheckCircleIcon, CloseIcon, PrinterIcon, EditIcon, UploadIcon } from '../icons/Icons';
import { UserContext } from '../../contexts/UserContext';
import TrainingCertificatePrintable from './TrainingCertificatePrintable';

interface TrainingPlanManagerProps {
    plans: TrainingPlan[];
    users: User[]; // To select teachers
    onUpdatePlans: (plans: TrainingPlan[]) => void;
    onClose: () => void;
}

const TrainingPlanManager: React.FC<TrainingPlanManagerProps> = ({ plans, users, onUpdatePlans, onClose }) => {
    const { user: currentUser } = useContext(UserContext);
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
    const [isEditingCourse, setIsEditingCourse] = useState(false);
    
    // State for creating/editing a plan
    const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
    const [editingPlanData, setEditingPlanData] = useState<TrainingPlan | null>(null);
    const [planForm, setPlanForm] = useState({ title: '', academicYear: '2025-2026', objectives: '', justification: '', methodology: '' });

    // State for creating/editing a course
    const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
    const [courseForm, setCourseForm] = useState({ title: '', instructor: '', startDate: '', endDate: '', durationHours: 0, modality: 'Presencial' as TrainingModality, type: 'Interna' as TrainingType });

    // State for adding teachers
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    
    // Printing Certificate State
    const [printingCertData, setPrintingCertData] = useState<{ teacherId: string, course: TrainingCourse, planTitle: string } | null>(null);

    const teachers = useMemo(() => users.filter(u => u.role === Role.Teacher), [users]);

    // -- Plan Logic --

    const handleEditPlan = (plan: TrainingPlan) => {
        setEditingPlanData(plan);
        setPlanForm({
            title: plan.title,
            academicYear: plan.academicYear,
            objectives: plan.objectives,
            justification: plan.justification,
            methodology: plan.methodology
        });
        setIsPlanFormOpen(true);
    };

    const handleSavePlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlanData) {
            // Update existing
            const updatedPlan = { ...editingPlanData, ...planForm };
            onUpdatePlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
            setSelectedPlan(updatedPlan); // Update view if currently selected
        } else {
            // Create new
            const newPlan: TrainingPlan = {
                id: `tp-${Date.now()}`,
                institutionId: currentUser?.institutionId || '',
                transversalThemes: ['Inclusión', 'Innovación'], // Default for prototype
                status: 'Planned',
                courses: [],
                ...planForm
            };
            onUpdatePlans([...plans, newPlan]);
        }
        setIsPlanFormOpen(false);
        setEditingPlanData(null);
        setPlanForm({ title: '', academicYear: '2025-2026', objectives: '', justification: '', methodology: '' }); // Reset
    };

    // -- Course Logic --

    const handleAddCourse = () => {
        setCourseForm({ title: '', instructor: '', startDate: '', endDate: '', durationHours: 0, modality: 'Presencial', type: 'Interna' });
        setIsCourseFormOpen(true);
    };

    const handleSaveCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlan) return;

        const newCourse: TrainingCourse = {
            id: `tc-${Date.now()}`,
            planId: selectedPlan.id,
            enrolledTeachers: [],
            ...courseForm
        };

        const updatedPlan = {
            ...selectedPlan,
            courses: [...selectedPlan.courses, newCourse]
        };

        onUpdatePlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        setSelectedPlan(updatedPlan);
        setIsCourseFormOpen(false);
    };

    // -- Enrollment Logic --

    const handleEnrollTeacher = () => {
        if (!selectedCourse || !selectedPlan || !selectedTeacherId) return;
        
        // Check if already enrolled
        if (selectedCourse.enrolledTeachers.some(r => r.teacherId === selectedTeacherId)) {
            alert('El docente ya está inscrito en este curso.');
            return;
        }

        const newRecord: TeacherTrainingRecord = {
            teacherId: selectedTeacherId,
            attendancePercentage: 0,
            finalGrade: 0,
            status: 'En Curso'
        };

        const updatedCourse = {
            ...selectedCourse,
            enrolledTeachers: [...selectedCourse.enrolledTeachers, newRecord]
        };

        const updatedCourses = selectedPlan.courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
        const updatedPlan = { ...selectedPlan, courses: updatedCourses };

        onUpdatePlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        setSelectedPlan(updatedPlan);
        setSelectedCourse(updatedCourse);
        setIsEnrollmentOpen(false);
        setSelectedTeacherId('');
    };


    const handleGradeChange = (teacherId: string, field: 'grade' | 'attendance', value: string) => {
        if (!selectedCourse || !selectedPlan) return;

        const updatedEnrolled = selectedCourse.enrolledTeachers.map(record => {
            if (record.teacherId === teacherId) {
                const newVal = parseFloat(value);
                const updatedRecord = { ...record };
                if (field === 'grade') updatedRecord.finalGrade = newVal;
                if (field === 'attendance') updatedRecord.attendancePercentage = newVal;
                
                if (updatedRecord.finalGrade >= 7 && updatedRecord.attendancePercentage >= 75) {
                    updatedRecord.status = 'Aprobado';
                } else {
                    updatedRecord.status = 'Reprobado';
                }
                return updatedRecord;
            }
            return record;
        });

        const updatedCourse = { ...selectedCourse, enrolledTeachers: updatedEnrolled };
        
        // Update plan state
        const updatedCourses = selectedPlan.courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
        const updatedPlan = { ...selectedPlan, courses: updatedCourses };
        onUpdatePlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        setSelectedPlan(updatedPlan);
        setSelectedCourse(updatedCourse);
    };


    const handlePrintCertificate = (teacherId: string, course: TrainingCourse) => {
        if(!selectedPlan) return;
        setPrintingCertData({
            teacherId,
            course,
            planTitle: selectedPlan.title
        });
    };

    // -- Renders --

    // NEW: Render for the Create Plan Form
    const renderPlanForm = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800">{editingPlanData ? 'Editar Plan' : 'Nuevo Plan de Capacitación'}</h3>
                <button onClick={() => { setIsPlanFormOpen(false); setEditingPlanData(null); }} className="text-gray-500 hover:text-gray-700"><CloseIcon className="h-6 w-6"/></button>
            </div>
            <form onSubmit={handleSavePlan} className="space-y-4 max-w-2xl mx-auto">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título del Plan</label>
                    <input type="text" required value={planForm.title} onChange={e => setPlanForm({...planForm, title: e.target.value})} className="mt-1 w-full p-2 border rounded-md" placeholder="Ej: Plan de Desarrollo Profesional 2025"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Año Lectivo</label>
                    <input type="text" required value={planForm.academicYear} onChange={e => setPlanForm({...planForm, academicYear: e.target.value})} className="mt-1 w-full p-2 border rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Justificación (Diagnóstico de Necesidades)</label>
                    <textarea required rows={3} value={planForm.justification} onChange={e => setPlanForm({...planForm, justification: e.target.value})} className="mt-1 w-full p-2 border rounded-md" placeholder="Basado en diagnóstico del DECE o PCA..."></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Objetivos Generales</label>
                    <textarea required rows={3} value={planForm.objectives} onChange={e => setPlanForm({...planForm, objectives: e.target.value})} className="mt-1 w-full p-2 border rounded-md" placeholder="¿Qué se espera lograr con este plan?"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Metodología</label>
                    <textarea required rows={2} value={planForm.methodology} onChange={e => setPlanForm({...planForm, methodology: e.target.value})} className="mt-1 w-full p-2 border rounded-md" placeholder="Talleres, cursos virtuales, círculos de estudio..."></textarea>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={() => setIsPlanFormOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md mr-2">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded-md hover:bg-primary-700">Guardar Plan</button>
                </div>
            </form>
        </div>
    );

    const renderCourseForm = () => (
         <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800">Añadir Nuevo Curso</h3>
                <button onClick={() => setIsCourseFormOpen(false)} className="text-gray-500 hover:text-gray-700"><CloseIcon className="h-6 w-6"/></button>
            </div>
            <form onSubmit={handleSaveCourse} className="space-y-4 max-w-2xl mx-auto">
                 <div><label className="block text-sm font-medium">Título del Curso</label><input type="text" required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="w-full p-2 border rounded"/></div>
                 <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-sm font-medium">Instructor</label><input type="text" required value={courseForm.instructor} onChange={e => setCourseForm({...courseForm, instructor: e.target.value})} className="w-full p-2 border rounded"/></div>
                     <div><label className="block text-sm font-medium">Duración (Horas)</label><input type="number" required value={courseForm.durationHours} onChange={e => setCourseForm({...courseForm, durationHours: parseInt(e.target.value)})} className="w-full p-2 border rounded"/></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-sm font-medium">Fecha Inicio</label><input type="date" required value={courseForm.startDate} onChange={e => setCourseForm({...courseForm, startDate: e.target.value})} className="w-full p-2 border rounded"/></div>
                     <div><label className="block text-sm font-medium">Fecha Fin</label><input type="date" required value={courseForm.endDate} onChange={e => setCourseForm({...courseForm, endDate: e.target.value})} className="w-full p-2 border rounded"/></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-sm font-medium">Modalidad</label><select value={courseForm.modality} onChange={e => setCourseForm({...courseForm, modality: e.target.value as any})} className="w-full p-2 border rounded"><option>Presencial</option><option>Virtual</option><option>Híbrida</option></select></div>
                     <div><label className="block text-sm font-medium">Tipo</label><select value={courseForm.type} onChange={e => setCourseForm({...courseForm, type: e.target.value as any})} className="w-full p-2 border rounded"><option>Interna</option><option>Externa</option><option>Inducción</option></select></div>
                 </div>
                 <div className="flex justify-end pt-4"><button type="submit" className="px-6 py-2 bg-primary-600 text-white font-bold rounded">Guardar Curso</button></div>
            </form>
        </div>
    );

    const renderPlanList = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Planes de Desarrollo Profesional</h3>
                <button 
                    onClick={() => setIsPlanFormOpen(true)} // CONNECTED BUTTON
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-semibold hover:bg-primary-700"
                >
                    <PlusIcon className="h-4 w-4" /> Nuevo Plan Anual
                </button>
            </div>
            {plans.length === 0 && <p className="text-center text-gray-500 py-8">No hay planes registrados.</p>}
            {plans.map(plan => (
                <div key={plan.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white" onClick={() => setSelectedPlan(plan)}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-primary-700">{plan.title}</h4>
                            <p className="text-xs text-gray-500">{plan.academicYear} • {plan.status}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{plan.courses.length} Cursos</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{plan.objectives}</p>
                    <div className="mt-3 flex gap-2">
                        {plan.transversalThemes.map(t => <span key={t} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded border">{t}</span>)}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderCourseDetails = () => {
        if (!selectedCourse) return null;
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <div>
                        <button onClick={() => setSelectedCourse(null)} className="text-xs text-primary-600 hover:underline mb-1">&larr; Volver al Plan</button>
                        <h3 className="text-lg font-bold text-gray-800">{selectedCourse.title}</h3>
                        <p className="text-xs text-gray-500">Instructor: {selectedCourse.instructor} | {selectedCourse.durationHours} Horas | {selectedCourse.modality}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Méritos: {(selectedCourse.durationHours > 40 ? 3 : 1)} Puntos</p>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-2">
                     <h4 className="font-bold text-gray-700">Docentes Inscritos</h4>
                     <button onClick={() => setIsEnrollmentOpen(true)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">+ Inscribir Docente</button>
                </div>

                {isEnrollmentOpen && (
                    <div className="p-4 bg-gray-100 rounded mb-4 border flex items-end gap-2">
                        <div className="flex-grow">
                            <label className="block text-xs font-bold text-gray-700">Seleccionar Docente</label>
                            <select className="w-full p-1 border rounded text-sm" value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
                                <option value="">-- Seleccionar --</option>
                                {teachers.filter(t => !selectedCourse!.enrolledTeachers.some(e => e.teacherId === t.id)).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleEnrollTeacher} className="px-3 py-1 bg-blue-600 text-white text-sm rounded">Añadir</button>
                        <button onClick={() => setIsEnrollmentOpen(false)} className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded">Cancelar</button>
                    </div>
                )}

                <div className="flex-grow overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-2">Docente</th>
                                <th className="p-2 w-24 text-center">Asistencia %</th>
                                <th className="p-2 w-24 text-center">Nota /10</th>
                                <th className="p-2 w-24 text-center">Estado</th>
                                <th className="p-2 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {selectedCourse.enrolledTeachers.map(record => {
                                const teacher = teachers.find(t => t.id === record.teacherId);
                                return (
                                    <tr key={record.teacherId}>
                                        <td className="p-2 font-medium">{teacher?.name}</td>
                                        <td className="p-2 text-center">
                                            <input 
                                                type="number" 
                                                min="0" max="100"
                                                value={record.attendancePercentage} 
                                                onChange={(e) => handleGradeChange(record.teacherId, 'attendance', e.target.value)}
                                                className="w-16 p-1 border rounded text-center"
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <input 
                                                type="number" 
                                                min="0" max="10" step="0.1"
                                                value={record.finalGrade} 
                                                onChange={(e) => handleGradeChange(record.teacherId, 'grade', e.target.value)}
                                                className="w-16 p-1 border rounded text-center"
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${record.status === 'Aprobado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="p-2 text-right flex justify-end gap-2">
                                            <button className="text-blue-600 hover:underline text-xs" title="Subir Evidencia de Aplicación">Evidencia</button>
                                            {record.status === 'Aprobado' && (
                                                <button 
                                                    onClick={() => handlePrintCertificate(record.teacherId, selectedCourse)} 
                                                    className="text-gray-600 hover:text-primary-600" 
                                                    title="Imprimir Certificado"
                                                >
                                                    <PrinterIcon className="h-4 w-4"/>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {selectedCourse.enrolledTeachers.length === 0 && (
                                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No hay docentes inscritos.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderPlanDetails = () => {
        if (!selectedPlan) return null;
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                    <div>
                        <button onClick={() => setSelectedPlan(null)} className="text-xs text-primary-600 hover:underline mb-1">&larr; Volver a la lista</button>
                        <h2 className="text-xl font-bold text-gray-800">{selectedPlan.title}</h2>
                        <p className="text-sm text-gray-600 mt-1"><strong>Diagnóstico/Necesidad:</strong> {selectedPlan.justification}</p>
                        <p className="text-sm text-gray-600"><strong>Metodología:</strong> {selectedPlan.methodology}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleEditPlan(selectedPlan)} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50">Editar Plan</button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-700">Oferta de Cursos y Talleres</h3>
                    <button onClick={handleAddCourse} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded font-semibold hover:bg-primary-200 flex items-center gap-1">
                        <PlusIcon className="h-3 w-3"/> Añadir Curso
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-1">
                    {selectedPlan.courses.map(course => (
                        <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 cursor-pointer bg-gray-50" onClick={() => setSelectedCourse(course)}>
                            <div className="flex justify-between">
                                <h4 className="font-bold text-gray-800 text-sm">{course.title}</h4>
                                <span className="text-[10px] bg-white border px-1 rounded h-fit">{course.type}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1"><CalendarIcon className="inline h-3 w-3 mr-1"/>{new Date(course.startDate).toLocaleDateString()}</p>
                            <div className="mt-3 flex justify-between items-center">
                                <div className="flex -space-x-2">
                                    {[...Array(Math.min(3, course.enrolledTeachers.length))].map((_, i) => (
                                        <div key={i} className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-[8px]">T</div>
                                    ))}
                                    {course.enrolledTeachers.length > 3 && <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px]">+{course.enrolledTeachers.length - 3}</div>}
                                </div>
                                <button className="text-xs text-primary-600 font-semibold hover:underline">Gestionar &rarr;</button>
                            </div>
                        </div>
                    ))}
                    {selectedPlan.courses.length === 0 && <p className="text-sm text-gray-500 italic col-span-full text-center py-4">No hay cursos creados en este plan.</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-700 rounded-full"><UsersIcon className="h-5 w-5 text-primary-400"/></div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight">Plan de Capacitación y Desarrollo Profesional</h2>
                            <p className="text-xs text-gray-400">Gestión de Cursos, Méritos y Certificación Docente</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="h-6 w-6"/></button>
                </header>
                
                <main className="flex-grow p-6 overflow-hidden overflow-y-auto">
                    {/* CONDITIONAL RENDERING LOGIC */}
                    {selectedCourse ? renderCourseDetails() : 
                     isCourseFormOpen ? renderCourseForm() :
                     isPlanFormOpen ? renderPlanForm() : 
                     selectedPlan ? renderPlanDetails() : 
                     renderPlanList()}
                </main>
            </div>

            {/* Certificate Print Modal */}
            {printingCertData && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={() => setPrintingCertData(null)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="p-4 flex justify-between items-center bg-gray-50 border-b no-print sticky top-0 z-10">
                            <h3 className="text-lg font-semibold text-gray-700">Vista Previa de Certificado</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPrintingCertData(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-semibold">Cerrar</button>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"><PrinterIcon className="h-5 w-5" /> Imprimir</button>
                            </div>
                        </header>
                        <div className="overflow-y-auto bg-gray-100 p-8 h-full">
                            <TrainingCertificatePrintable 
                                teacher={users.find(u => u.id === printingCertData.teacherId)!}
                                course={printingCertData.course}
                                planTitle={printingCertData.planTitle}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingPlanManager;