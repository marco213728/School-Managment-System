import React, { useState, useEffect, useMemo } from 'react';
import { LeccionarioEntry, MicroPlan, CurricularPlanStatus } from '../../types';
import { CloseIcon, ClipboardDocumentCheckIcon } from '../icons/Icons';

interface PlanSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (plan: MicroPlan) => void;
    plans: MicroPlan[];
}

const PlanSelectorModal: React.FC<PlanSelectorModalProps> = ({ isOpen, onClose, onSelect, plans }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Seleccionar Planificación Aprobada</h3>
                <div className="max-h-80 overflow-y-auto space-y-2">
                    {plans.length > 0 ? (
                        plans.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => onSelect(plan)}
                                className="w-full text-left p-3 bg-gray-50 hover:bg-primary-100 border rounded-md"
                            >
                                <p className="font-semibold">{plan.unitTitle}</p>
                                <p className="text-xs text-gray-600">Creado: {new Date(plan.creationDate).toLocaleDateString()}</p>
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No se encontraron planificaciones aprobadas para esta clase y asignatura.</p>
                    )}
                </div>
                <div className="text-right mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

interface LeccionarioFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<LeccionarioEntry, 'id' | 'institutionId' | 'teacherId'>) => void;
    entryToEdit: LeccionarioEntry | null;
    classId: string;
    subjectId: string;
    date: string;
    timeSlotId: string;
    microPlans: MicroPlan[];
}

const LeccionarioForm: React.FC<LeccionarioFormProps> = ({ isOpen, onClose, onSave, entryToEdit, classId, subjectId, date, timeSlotId, microPlans }) => {
    const [formData, setFormData] = useState({
        skillCode: '',
        topics: '',
        tasks: '',
        observations: ''
    });
    const [isPlanSelectorOpen, setIsPlanSelectorOpen] = useState(false);

    useEffect(() => {
        if (entryToEdit) {
            setFormData({
                skillCode: entryToEdit.skillCode,
                topics: entryToEdit.topics,
                tasks: entryToEdit.tasks,
                observations: entryToEdit.observations,
            });
        } else {
            setFormData({ skillCode: '', topics: '', tasks: '', observations: '' });
        }
    }, [entryToEdit, isOpen]);
    
    const approvedPlans = useMemo(() => {
        return microPlans.filter(plan => 
            plan.classId === classId &&
            plan.subjectId === subjectId &&
            plan.status === CurricularPlanStatus.Approved
        );
    }, [microPlans, classId, subjectId]);

    const handlePlanSelect = (plan: MicroPlan) => {
        setFormData({
            // FIX: The `skills` property does not exist on the `MicroPlan` type.
            // Replaced with `dcdIds`, joined into a string to match the `skillCode` type.
            skillCode: plan.dcdIds.join(', '),
            topics: plan.unitTitle,
            tasks: plan.evaluation,
            observations: formData.observations // Keep any existing observations
        });
        setIsPlanSelectorOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            classId,
            subjectId,
            date,
            timeSlotId,
            ...formData,
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">{entryToEdit ? 'Editar' : 'Llenar'} Leccionario</h2>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => setIsPlanSelectorOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline">
                                <ClipboardDocumentCheckIcon className="h-4 w-4" />
                                Cargar desde Planificación
                            </button>
                            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><CloseIcon className="h-6 w-6" /></button>
                        </div>
                    </header>
                    <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
                        <div><label className="block text-sm font-medium">Código de Destreza</label><input type="text" name="skillCode" value={formData.skillCode} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">Temas</label><textarea name="topics" value={formData.topics} onChange={handleChange} required rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea></div>
                        <div><label className="block text-sm font-medium">Tareas</label><textarea name="tasks" value={formData.tasks} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea></div>
                        <div><label className="block text-sm font-medium">Observaciones</label><textarea name="observations" value={formData.observations} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea></div>
                        <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Guardar</button></div>
                    </form>
                </div>
            </div>
            <PlanSelectorModal
                isOpen={isPlanSelectorOpen}
                onClose={() => setIsPlanSelectorOpen(false)}
                onSelect={handlePlanSelect}
                plans={approvedPlans}
            />
        </>
    );
};

export default LeccionarioForm;