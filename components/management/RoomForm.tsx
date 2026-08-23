import React, { useState, useEffect } from 'react';
import { Room } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface RoomFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (roomData: Omit<Room, 'id' | 'institutionId'> & { id?: string }) => void;
    roomToEdit: Room | null;
}

const RoomForm: React.FC<RoomFormProps> = ({ isOpen, onClose, onSave, roomToEdit }) => {
    const [name, setName] = useState('');
    const [capacidad, setCapacidad] = useState(30);
    const [esLaboratorio, setEsLaboratorio] = useState(false);
    const [piso, setPiso] = useState(1);
    const [tieneAscensor, setTieneAscensor] = useState(false);
    const [tieneRampaAcceso, setTieneRampaAcceso] = useState(false);
    const [gradoExclusivo, setGradoExclusivo] = useState<string>('');

    useEffect(() => {
        if (roomToEdit) {
            setName(roomToEdit.name);
            setCapacidad(roomToEdit.capacidad || 30);
            setEsLaboratorio(roomToEdit.esLaboratorio || false);
            setPiso(roomToEdit.piso || 1);
            setTieneAscensor(roomToEdit.tieneAscensor || false);
            setTieneRampaAcceso(roomToEdit.tieneRampaAcceso || false);
            setGradoExclusivo(roomToEdit.gradoExclusivo || '');
        } else {
            setName('');
            setCapacidad(30);
            setEsLaboratorio(false);
            setPiso(1);
            setTieneAscensor(false);
            setTieneRampaAcceso(false);
            setGradoExclusivo('');
        }
    }, [roomToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: roomToEdit?.id, name, capacidad, esLaboratorio, piso, tieneAscensor, tieneRampaAcceso, gradoExclusivo: gradoExclusivo || undefined });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">{roomToEdit ? 'Editar Aula' : 'Añadir Aula'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Aula</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
                            placeholder="Ej: Aula 101, Laboratorio" 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Capacidad (Asientos)</label>
                            <input type="number" value={capacidad} onChange={e => setCapacidad(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Piso (Nivel)</label>
                            <input type="number" value={piso} onChange={e => setPiso(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-4 space-y-3">
                        <h3 className="text-sm font-bold text-gray-800">Características e Infraestructura</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Grado Exclusivo (Opcional)</label>
                            <input 
                                type="text" 
                                value={gradoExclusivo} 
                                onChange={(e) => setGradoExclusivo(e.target.value)} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
                                placeholder="Ej: Segundo de Básica" 
                            />
                            <p className="text-xs text-gray-500 mt-1">Bloquea esta aula para que SOLO pueda ser usada por este grado debido a su mobiliario adaptado.</p>
                        </div>
                        <div className="flex items-center mt-3">
                            <input type="checkbox" id="lab" checked={esLaboratorio} onChange={e => setEsLaboratorio(e.target.checked)} className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                            <label htmlFor="lab" className="ml-2 block text-sm text-gray-700">Es Laboratorio / Taller</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="ascensor" checked={tieneAscensor} onChange={e => setTieneAscensor(e.target.checked)} className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                            <label htmlFor="ascensor" className="ml-2 block text-sm text-gray-700">El edificio cuenta con ascensor</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="rampa" checked={tieneRampaAcceso} onChange={e => setTieneRampaAcceso(e.target.checked)} className="h-4 w-4 text-primary-600 rounded border-gray-300" />
                            <label htmlFor="rampa" className="ml-2 block text-sm text-gray-700">El aula tiene rampa de acceso</label>
                        </div>
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

export default RoomForm;