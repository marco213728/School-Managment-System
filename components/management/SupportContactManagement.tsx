
import React, { useState } from 'react';
import { SupportContact } from '../../types';
import { ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon } from '../icons/Icons';
import SupportContactForm from './SupportContactForm';

interface SupportContactManagementProps {
    contacts: SupportContact[];
    onUpdateContacts: (contacts: SupportContact[]) => void;
    onBack: () => void;
}

const SupportContactManagement: React.FC<SupportContactManagementProps> = ({ contacts, onUpdateContacts, onBack }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<SupportContact | null>(null);

    const handleAddNew = () => {
        setEditingContact(null);
        setIsModalOpen(true);
    };

    const handleEdit = (contact: SupportContact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    const handleDelete = (contactId: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este contacto de la red de apoyo?')) {
            onUpdateContacts(contacts.filter(c => c.id !== contactId));
        }
    };

    const handleSave = (contactToSave: Omit<SupportContact, 'id' | 'institutionId'> & { id?: string }) => {
        if (contactToSave.id) {
            onUpdateContacts(contacts.map(c => c.id === contactToSave.id ? { ...c, ...contactToSave } as SupportContact : c));
        } else {
            const newContact: SupportContact = {
                ...contactToSave,
                id: `sup-${Date.now()}`,
                institutionId: contacts[0]?.institutionId || '', // Assume same institution
            } as SupportContact;
            onUpdateContacts([...contacts, newContact]);
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
                <h3 className="text-lg font-semibold text-gray-700">Gestionar Red de Apoyo Externa</h3>
                <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                    <PlusIcon className="h-5 w-5" />
                    Añadir Contacto
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {contacts.map(contact => (
                            <tr key={contact.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{contact.phone}</div>
                                    {contact.email && <div>{contact.email}</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(contact)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100"><EditIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleDelete(contact.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <SupportContactForm 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    contactToEdit={editingContact}
                />
            )}
        </div>
    );
};

export default SupportContactManagement;