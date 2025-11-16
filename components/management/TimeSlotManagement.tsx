import React, { useState } from 'react';
import { TimeSlot, Timetable } from '../../types';
import { CloseIcon, PlusIcon, TrashIcon } from '../icons/Icons';

interface TimeSlotManagementProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (timeSlots: TimeSlot[]) => void;
    timeSlots: TimeSlot[];
    timetable: Timetable;
    institutionId: string;
}

const TimeSlotManagement: React.FC<TimeSlotManagementProps> = ({ isOpen, onClose, onSave, timeSlots: initialTimeSlots, timetable, institutionId }) => {
    // Keep a local copy of all time slots, but only operate on the ones for the specified timetable
    const [localTimeSlots, setLocalTimeSlots] = useState<TimeSlot[]>(initialTimeSlots);
    
    const handleUpdate = (id: string, field: keyof TimeSlot, value: any) => {
        const updated = localTimeSlots.map(ts => ts.id === id ? { ...ts, [field]: value } : ts);
        setLocalTimeSlots(updated);
    };
    
    const handleAdd = () => {
        const newSlot: TimeSlot = {
            id: `ts-${Date.now()}`,
            institutionId: institutionId,
            timetableId: timetable.id, // Use the passed timetable's ID
            shift: timetable.shift,   // Use the passed timetable's shift
            startTime: '00:00',
            endTime: '00:00',
            isBreak: false,
        };
        setLocalTimeSlots(prev => [...prev, newSlot].sort((a,b) => a.startTime.localeCompare(b.startTime)));
    };

    const handleRemove = (id: string) => {
        setLocalTimeSlots(prev => prev.filter(ts => ts.id !== id));
    };

    const handleSaveAndClose = () => {
        // Get all time slots that are NOT for the current timetable from the original list
        const otherTimeSlots = initialTimeSlots.filter(ts => ts.timetableId !== timetable.id);
        
        // Get the updated time slots that ARE for the current timetable from the local state
        const updatedTimeSlotsForThisTimetable = localTimeSlots.filter(ts => ts.timetableId === timetable.id);
        
        // Combine them to form the complete new list
        onSave([...otherTimeSlots, ...updatedTimeSlotsForThisTimetable]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Gestionar Franjas Horarias</h2>
                        <p className="text-sm text-gray-500 font-semibold">{timetable.name} ({timetable.shift})</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>

                <div className="space-y-3 overflow-y-auto pr-2">
                    {localTimeSlots
                        .filter(ts => ts.timetableId === timetable.id)
                        .sort((a,b) => a.startTime.localeCompare(b.startTime))
                        .map((slot) => (
                        <div key={slot.id} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md">
                            <div className="col-span-3">
                                <label className="text-xs font-medium text-gray-500">Inicio</label>
                                <input type="time" value={slot.startTime} onChange={e => handleUpdate(slot.id, 'startTime', e.target.value)} className="w-full p-1 border rounded" />
                            </div>
                            <div className="col-span-3">
                                <label className="text-xs font-medium text-gray-500">Fin</label>
                                <input type="time" value={slot.endTime} onChange={e => handleUpdate(slot.id, 'endTime', e.target.value)} className="w-full p-1 border rounded" />
                            </div>
                            <div className="col-span-4 flex items-center pt-5">
                                <input id={`isBreak-${slot.id}`} type="checkbox" checked={slot.isBreak} onChange={e => handleUpdate(slot.id, 'isBreak', e.target.checked)} className="h-4 w-4 rounded text-primary-600" />
                                <label htmlFor={`isBreak-${slot.id}`} className="ml-2 text-sm text-gray-600">Es descanso</label>
                            </div>
                            <div className="col-span-2 flex justify-end pt-5">
                                <button onClick={() => handleRemove(slot.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        </div>
                    ))}
                     <button onClick={handleAdd} className="mt-2 flex items-center gap-2 text-sm text-primary-600 hover:underline">
                        <PlusIcon className="h-4 w-4" /> Añadir Franja
                    </button>
                </div>
                <div className="flex justify-end gap-4 pt-6 mt-auto border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="button" onClick={handleSaveAndClose} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

export default TimeSlotManagement;
