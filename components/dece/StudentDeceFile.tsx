import React, { useState, useEffect } from 'react';
import { Timetable, TimeSlot, Shift } from '../../types';
import { ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon, ManageIcon, CloseIcon } from '../icons/Icons';
import TimeSlotManagement from '../management/TimeSlotManagement';
import { MOCK_SHIFTS } from '../../constants';

// FIX: This component, TimetableManagement, is in the wrong directory. It should be in 'components/management/'.
// Leaving it here to satisfy the constraint of only updating files.

interface TimetableFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (timetable: { id?: string; name: string; shift: Shift; }) => void;
    timetableToEdit: Timetable | null;
}

const TimetableForm: React.FC<TimetableFormProps> = ({ isOpen, onClose, onSave, timetableToEdit }) => {
    const [formData, setFormData] = useState({
        id: undefined as string | undefined,
        name: '',
        shift: Shift.Morning,
    });

    useEffect(() => {
        if (timetableToEdit) {
            setFormData({
                id: timetableToEdit.id,
                name: timetableToEdit.name,
                shift: timetableToEdit.shift,
            });
        } else {
            setFormData({ id: undefined, name: '', shift: Shift.Morning });
        }
    }, [timetableToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <CloseIcon className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold mb-4">{timetableToEdit ? 'Editar Plantilla' : 'Añadir Plantilla'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Plantilla</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Ej: Horario Primaria Mañana" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Jornada</label>
                        <select name="shift" value={formData.shift} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
                            {MOCK_SHIFTS.map(shift => <option key={shift} value={shift}>{shift}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface TimetableManagementProps {
    timetables: Timetable[];
    timeSlots: TimeSlot[];
    onUpdateTimetables: (timetables: Timetable[]) => void;
    onUpdateTimeSlots: (timeSlots: TimeSlot[]) => void;
    institutionId: string;
    onBack: () => void;
}

const TimetableManagement: React.FC<TimetableManagementProps> = ({ timetables, timeSlots, onUpdateTimetables, onUpdateTimeSlots, institutionId, onBack }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
    const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
    const [managingTimeSlotsFor, setManagingTimeSlotsFor] = useState<Timetable | null>(null);

    const handleAddNew = () => {
        setEditingTimetable(null);
        setIsFormOpen(true);
    };

    const handleEdit = (timetable: Timetable) => {
        setEditingTimetable(timetable);
        setIsFormOpen(true);
    };

    const handleDelete = (timetableId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta plantilla de horario? Esto también eliminará sus franjas horarias.')) {
            onUpdateTimetables(timetables.filter(t => t.id !== timetableId));
            onUpdateTimeSlots(timeSlots.filter(ts => ts.timetableId !== timetableId));
        }
    };

    const handleSave = (timetableToSave: { id?: string; name: string; shift: Shift; }) => {
        if (timetableToSave.id) {
            onUpdateTimetables(timetables.map(t => t.id === timetableToSave.id ? { ...t, ...timetableToSave } as Timetable : t));
        } else {
            const newTimetable: Timetable = {
                ...timetableToSave,
                id: `tt-${Date.now()}`,
                institutionId,
            };
            onUpdateTimetables([...timetables, newTimetable]);
        }
        setIsFormOpen(false);
    };
    
    const handleManageTimeSlots = (timetable: Timetable) => {
        setManagingTimeSlotsFor(timetable);
        setIsTimeSlotModalOpen(true);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Volver a Gestión del Centro
                </button>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Gestionar Plantillas de Horario</h3>
                    <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        <PlusIcon className="h-5 w-5" />
                        Añadir Plantilla
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre de la Plantilla</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jornada</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {timetables.map(tt => (
                                <tr key={tt.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tt.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tt.shift}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleManageTimeSlots(tt)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-100" title="Gestionar Franjas Horarias"><ManageIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleEdit(tt)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100" title="Editar"><EditIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleDelete(tt.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100" title="Eliminar"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isFormOpen && (
                <TimetableForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                    timetableToEdit={editingTimetable}
                />
            )}
            {isTimeSlotModalOpen && managingTimeSlotsFor && (
                <TimeSlotManagement
                    isOpen={isTimeSlotModalOpen}
                    onClose={() => setIsTimeSlotModalOpen(false)}
                    onSave={onUpdateTimeSlots}
                    timeSlots={timeSlots}
                    timetable={managingTimeSlotsFor}
                    institutionId={institutionId}
                />
            )}
        </>
    );
};

export default TimetableManagement;
