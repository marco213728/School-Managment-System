import React, { useState, useContext } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { AcademicCalendarEvent, Institution } from '../../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '../icons/Icons';
import AcademicCalendarEventForm from './AcademicCalendarEventForm';

interface AcademicCalendarManagementProps {
    events: AcademicCalendarEvent[];
    onUpdateEvents: (events: AcademicCalendarEvent[]) => void;
    onBack: () => void;
}

const AcademicCalendarManagement: React.FC<AcademicCalendarManagementProps> = ({ events, onUpdateEvents, onBack }) => {
    const { institution, setInstitution } = useContext(InstitutionContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const academicYear = institution?.academicYear;

    const handleUpdateYear = (field: 'startDate' | 'endDate', value: string) => {
        if (institution) {
            setInstitution({
                ...institution,
                academicYear: {
                    ...(institution.academicYear || { startDate: '', endDate: '' }),
                    [field]: value,
                }
            });
        }
    };

    const handleAddNew = () => {
        setIsModalOpen(true);
    };

    const handleDelete = (eventId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este evento del calendario?')) {
            onUpdateEvents(events.filter(e => e.id !== eventId));
        }
    };
    
    const handleSave = (eventToSave: Omit<AcademicCalendarEvent, 'id' | 'institutionId'>) => {
        const newEvent: AcademicCalendarEvent = {
            ...eventToSave,
            id: `ace-${Date.now()}`,
            institutionId: institution!.id,
        };
        onUpdateEvents([...events, newEvent]);
        setIsModalOpen(false);
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a Gestión del Centro
            </button>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Gestionar Calendario Académico</h3>

            <div className="border p-4 rounded-md mb-6 bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-2">Año Lectivo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                        <input 
                            type="date"
                            value={academicYear?.startDate || ''}
                            onChange={(e) => handleUpdateYear('startDate', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                         <input 
                            type="date"
                            value={academicYear?.endDate || ''}
                            onChange={(e) => handleUpdateYear('endDate', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-800">Días No Lectivos (Feriados, Vacaciones)</h4>
                <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 text-sm">
                    <PlusIcon className="h-5 w-5" />
                    Añadir
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Evento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Inicio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Fin</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.map(event => (
                            <tr key={event.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.startDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.endDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <AcademicCalendarEventForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default AcademicCalendarManagement;
