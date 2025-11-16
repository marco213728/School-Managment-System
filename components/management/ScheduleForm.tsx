

import React, { useState, useEffect, useMemo } from 'react';
import { ScheduleEntry, Subject, Room } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface ScheduleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (subjectId: string, roomId: string) => void;
    subjects: Subject[];
    rooms: Room[];
    day: ScheduleEntry['day'];
    classNameDisplay: string;
    timeSlotDisplay: string;
    entryToEdit: ScheduleEntry | null;
    unavailableSubjects: { id: string, reason: string }[];
    unavailableRoomIds: string[];
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
    isOpen, onClose, onSave, subjects, rooms, day, classNameDisplay, timeSlotDisplay, entryToEdit, unavailableSubjects, unavailableRoomIds 
}) => {
    const [selectedSubjectId, setSelectedSubjectId] = useState(entryToEdit?.subjectId || '');
    const [selectedRoomId, setSelectedRoomId] = useState(entryToEdit?.roomId || '');
    
    useEffect(() => {
        setSelectedSubjectId(entryToEdit?.subjectId || '');
        setSelectedRoomId(entryToEdit?.roomId || '');
    }, [entryToEdit, isOpen]);

    const availableRooms = useMemo(() => {
        return rooms.filter(room => {
            return !unavailableRoomIds.includes(room.id) || room.id === entryToEdit?.roomId;
        });
    }, [rooms, unavailableRoomIds, entryToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(selectedSubjectId, selectedRoomId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-2">Asignar Horario para {classNameDisplay}</h2>
                <p className="text-sm text-gray-500 mb-4">{day}, {timeSlotDisplay}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Asignatura</label>
                        <select
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"
                        >
                            <option value="">-- Sin Asignar / Vacío --</option>
                            {subjects.map(s => {
                                const unavailability = unavailableSubjects.find(us => us.id === s.id);
                                const isThisEntry = s.id === entryToEdit?.subjectId;
                                const isDisabled = !!unavailability && !isThisEntry;
                                
                                return (
                                    <option key={s.id} value={s.id} disabled={isDisabled}>
                                        {s.name} {isDisabled ? `(${unavailability.reason})` : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Aula</label>
                        <select
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            required={!!selectedSubjectId} // Room is required if a subject is selected
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"
                        >
                            <option value="">-- Seleccionar Aula --</option>
                            {availableRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            {rooms.length > availableRooms.length && <option disabled>--- Aulas Ocupadas ---</option>}
                             {rooms.filter(r => !availableRooms.find(ar => ar.id === r.id)).map(r => (
                                <option key={r.id} value={r.id} disabled>{r.name} (Ocupada)</option>
                            ))}
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

export default ScheduleForm;