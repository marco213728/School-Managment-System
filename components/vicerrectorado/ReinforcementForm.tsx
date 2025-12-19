
import React, { useState, useEffect } from 'react';
import { ReinforcementPlan, User, Student, Class, Subject, ReinforcementTopic, ReinforcementSession } from '../../types';
import { CloseIcon, PlusIcon, TrashIcon } from '../icons/Icons';

interface ReinforcementFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: ReinforcementPlan) => void;
    planToEdit: ReinforcementPlan | null;
    students: Student[];
    teachers: User[];
    subjects: Subject[];
    classes: Class[];
    currentUser: User;
}

const ReinforcementForm: React.FC<ReinforcementFormProps> = ({ isOpen, onClose, onSave, planToEdit, students, teachers, subjects, classes, currentUser }) => {
    const [activeTab, setActiveTab] = useState<'planning' | 'consent' | 'tracking' | 'report'>('planning');
    const [formData, setFormData] = useState<Partial<ReinforcementPlan>>({
        topics: [],
        sessions: [],
        status: 'Nominated',
        modalidad: 'extra_class',
        groupType: 'small_group'
    });

    useEffect(() => {
        if (planToEdit) {
            setFormData(JSON.parse(JSON.stringify(planToEdit))); // Deep copy
            // Determine tab based on status
            if (planToEdit.status === 'Planned') setActiveTab('consent');
            else if (planToEdit.status === 'ParentNotified' || planToEdit.status === 'In_Progress') setActiveTab('tracking');
            else if (planToEdit.status === 'Completed') setActiveTab('report');
        } else {
            setFormData({
                id: `rp-${Date.now()}`,
                institutionId: currentUser.institutionId,
                teacherId: currentUser.id, // Default to current user if teacher
                academicYear: '2025-2026',
                status: 'Nominated',
                nominationDate: new Date().toISOString().split('T')[0],
                topics: [],
                sessions: [],
                modalidad: 'extra_class',
                groupType: 'small_group',
                parentConsented: false
            });
        }
    }, [planToEdit, isOpen, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Topic Management
    const handleAddTopic = () => {
        setFormData(prev => ({
            ...prev,
            topics: [...(prev.topics || []), { dcd: '', strategies: '', resources: '', evaluationCriteria: '' }]
        }));
    };

    const handleTopicChange = (index: number, field: keyof ReinforcementTopic, value: string) => {
        const newTopics = [...(formData.topics || [])];
        newTopics[index] = { ...newTopics[index], [field]: value };
        setFormData(prev => ({ ...prev, topics: newTopics }));
    };

    const handleRemoveTopic = (index: number) => {
        setFormData(prev => ({ ...prev, topics: prev.topics?.filter((_, i) => i !== index) }));
    };

    // Session Management
    const handleAddSession = () => {
        setFormData(prev => ({
            ...prev,
            sessions: [...(prev.sessions || []), { id: `sess-${Date.now()}`, date: new Date().toISOString().split('T')[0], attendance: true, skillsReinforced: '', achievements: '', observations: '' }]
        }));
    };

    const handleSessionChange = (index: number, field: keyof ReinforcementSession, value: any) => {
        const newSessions = [...(formData.sessions || [])];
        newSessions[index] = { ...newSessions[index], [field]: value };
        setFormData(prev => ({ ...prev, sessions: newSessions }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Auto-update status logic
        let newStatus = formData.status;
        if (formData.topics && formData.topics.length > 0 && formData.status === 'Nominated') newStatus = 'Planned';
        if (formData.parentConsented && (newStatus === 'Planned' || newStatus === 'ParentNotified')) newStatus = 'In_Progress';
        if (formData.finalReport?.achievements && newStatus === 'In_Progress') newStatus = 'Completed';

        onSave({ ...formData, status: newStatus } as ReinforcementPlan);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4 border-b pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Plan de Refuerzo Académico</h2>
                        <p className="text-sm text-slate-500">Gestión Integral del Proceso</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>

                <div className="flex space-x-2 mb-4 border-b overflow-x-auto">
                    {['planning', 'consent', 'tracking', 'report'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap ${activeTab === tab ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab === 'planning' && '1. Planificación'}
                            {tab === 'consent' && '2. Notificación y Consentimiento'}
                            {tab === 'tracking' && '3. Seguimiento (Sesiones)'}
                            {tab === 'report' && '4. Informe Final'}
                        </button>
                    ))}
                </div>
                
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-6">
                    {activeTab === 'planning' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Estudiante</label>
                                    <select name="studentId" value={formData.studentId} onChange={handleChange} required className="w-full p-2 border rounded-md">
                                        <option value="">Seleccionar...</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Asignatura</label>
                                    <select name="subjectId" value={formData.subjectId} onChange={handleChange} required className="w-full p-2 border rounded-md">
                                        <option value="">Seleccionar...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Tutor</label>
                                    <select name="tutorId" value={formData.tutorId} onChange={handleChange} required className="w-full p-2 border rounded-md">
                                        <option value="">Seleccionar...</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Profesor de Refuerzo</label>
                                    <select name="teacherId" value={formData.teacherId} onChange={handleChange} required className="w-full p-2 border rounded-md">
                                        <option value="">Seleccionar...</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded border">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Justificación (Observaciones Nómina)</label>
                                <textarea name="nominationObservations" value={formData.nominationObservations} onChange={handleChange} rows={2} className="w-full p-2 border rounded-md" placeholder="¿Por qué requiere refuerzo?"></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Modalidad</label>
                                    <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="w-full p-2 border rounded-md">
                                        <option value="inside_class">Dentro del Aula</option>
                                        <option value="extra_class">Extra Clase</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Tipo de Grupo</label>
                                    <select name="groupType" value={formData.groupType} onChange={handleChange} className="w-full p-2 border rounded-md">
                                        <option value="individual">Individual</option>
                                        <option value="small_group">Pequeño Grupo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <input type="text" name="schedule" value={formData.schedule} onChange={handleChange} placeholder="Horario (ej: Lun 14:00)" className="p-2 border rounded-md" />
                                <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="Duración (ej: 6 semanas)" className="p-2 border rounded-md" />
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="p-2 border rounded-md" />
                            </div>
                            <textarea name="generalObjective" value={formData.generalObjective} onChange={handleChange} placeholder="Objetivo General del Refuerzo" rows={2} className="w-full p-2 border rounded-md"></textarea>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Planificación de Temas (Matriz)</label>
                                {formData.topics?.map((topic, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 p-3 border rounded bg-slate-50 relative">
                                        <input value={topic.dcd} onChange={e => handleTopicChange(idx, 'dcd', e.target.value)} placeholder="Destreza (DCD)" className="p-1 border rounded text-sm" />
                                        <input value={topic.evaluationCriteria} onChange={e => handleTopicChange(idx, 'evaluationCriteria', e.target.value)} placeholder="Criterio Evaluación" className="p-1 border rounded text-sm" />
                                        <textarea value={topic.strategies} onChange={e => handleTopicChange(idx, 'strategies', e.target.value)} placeholder="Estrategias Metodológicas" rows={2} className="p-1 border rounded text-sm" />
                                        <textarea value={topic.resources} onChange={e => handleTopicChange(idx, 'resources', e.target.value)} placeholder="Recursos" rows={2} className="p-1 border rounded text-sm" />
                                        <button type="button" onClick={() => handleRemoveTopic(idx)} className="absolute top-1 right-1 text-rose-500 hover:bg-rose-100 p-1 rounded-full"><TrashIcon className="h-4 w-4"/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddTopic} className="text-sm text-primary-600 flex items-center gap-1 font-medium"><PlusIcon className="h-4 w-4"/> Añadir Tema</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'consent' && (
                        <div className="space-y-6 p-4 bg-slate-50 rounded border">
                            <h3 className="font-bold text-slate-800">Estado de la Comunicación con la Familia</h3>
                            <div className="flex items-center gap-2">
                                <input type="date" name="notificationDate" value={formData.notificationDate} onChange={handleChange} className="p-2 border rounded-md" />
                                <span className="text-sm text-slate-600">Fecha de envío de notificación</span>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-white border rounded-md">
                                <input type="checkbox" name="parentConsented" checked={formData.parentConsented} onChange={e => setFormData(p => ({...p, parentConsented: e.target.checked}))} className="h-5 w-5 text-emerald-600 rounded" />
                                <div>
                                    <p className="font-bold text-slate-800">Consentimiento Recibido</p>
                                    <p className="text-sm text-slate-500">Marcar solo si el representante ha firmado el acta de compromiso.</p>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-slate-500 mb-2">Recuerde imprimir la notificación y el acta para firma.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tracking' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800">Registro de Sesiones (Avance)</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="border p-2 text-left">Fecha</th>
                                            <th className="border p-2 text-center">Asist.</th>
                                            <th className="border p-2 text-left">Destrezas Reforzadas</th>
                                            <th className="border p-2 text-left">Logros</th>
                                            <th className="border p-2 text-left">Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.sessions?.map((sess, idx) => (
                                            <tr key={sess.id}>
                                                <td className="border p-1"><input type="date" value={sess.date} onChange={e => handleSessionChange(idx, 'date', e.target.value)} className="w-full border-none bg-transparent" /></td>
                                                <td className="border p-1 text-center"><input type="checkbox" checked={sess.attendance} onChange={e => handleSessionChange(idx, 'attendance', e.target.checked)} /></td>
                                                <td className="border p-1"><input value={sess.skillsReinforced} onChange={e => handleSessionChange(idx, 'skillsReinforced', e.target.value)} className="w-full border-none bg-transparent" placeholder="..." /></td>
                                                <td className="border p-1"><input value={sess.achievements} onChange={e => handleSessionChange(idx, 'achievements', e.target.value)} className="w-full border-none bg-transparent" placeholder="..." /></td>
                                                <td className="border p-1"><input value={sess.observations} onChange={e => handleSessionChange(idx, 'observations', e.target.value)} className="w-full border-none bg-transparent" placeholder="..." /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" onClick={handleAddSession} className="text-sm text-primary-600 flex items-center gap-1 font-medium mt-2"><PlusIcon className="h-4 w-4"/> Registrar Sesión</button>
                        </div>
                    )}

                    {activeTab === 'report' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800">Informe Final Individual</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">a) Logros Alcanzados</label>
                                    <textarea value={formData.finalReport?.achievements || ''} onChange={e => setFormData(p => ({...p, finalReport: { ...p.finalReport!, achievements: e.target.value }}))} rows={3} className="w-full p-2 border rounded-md"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">b) Dificultades Persistentes</label>
                                    <textarea value={formData.finalReport?.difficulties || ''} onChange={e => setFormData(p => ({...p, finalReport: { ...p.finalReport!, difficulties: e.target.value }}))} rows={3} className="w-full p-2 border rounded-md"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">c) Sugerencias</label>
                                    <textarea value={formData.finalReport?.suggestions || ''} onChange={e => setFormData(p => ({...p, finalReport: { ...p.finalReport!, suggestions: e.target.value }}))} rows={3} className="w-full p-2 border rounded-md"></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4 border-t mt-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                            Guardar Progreso
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReinforcementForm;
