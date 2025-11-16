import React, { useState } from 'react';
import { Room } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, ArrowLeftIcon } from '../icons/Icons';
import RoomForm from './RoomForm';

interface RoomManagementProps {
    rooms: Room[];
    onUpdateRooms: (rooms: Room[]) => void;
    onBack: () => void;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ rooms, onUpdateRooms, onBack }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const handleAddNew = () => {
        setEditingRoom(null);
        setIsModalOpen(true);
    };

    const handleEdit = (room: Room) => {
        setEditingRoom(room);
        setIsModalOpen(true);
    };

    const handleDelete = (roomId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta aula?')) {
            onUpdateRooms(rooms.filter(r => r.id !== roomId));
        }
    };

    const handleSave = (roomToSave: Omit<Room, 'id' | 'institutionId'> & { id?: string }) => {
        if (roomToSave.id) {
            onUpdateRooms(rooms.map(r => r.id === roomToSave.id ? { ...r, ...roomToSave } as Room : r));
        } else {
            const newRoom: Room = {
                ...roomToSave,
                id: `room-${Date.now()}`,
                institutionId: rooms[0]?.institutionId || '',
            };
            onUpdateRooms([...rooms, newRoom]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a Gestión del Centro
            </button>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Gestionar Aulas</h3>
                <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    <PlusIcon className="h-5 w-5" />
                    Añadir Aula
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Aula</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.map(room => (
                            <tr key={room.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(room)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100"><EditIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleDelete(room.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <RoomForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    roomToEdit={editingRoom}
                />
            )}
        </div>
    );
};

export default RoomManagement;