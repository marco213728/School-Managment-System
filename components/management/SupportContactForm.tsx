
import React, { useState, useEffect } from 'react';
import { SupportContact } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface SupportContactFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Omit<SupportContact, 'id' | 'institutionId'> & { id?: string }) => void;
    contactToEdit: SupportContact | null;
}

const contactTypes: SupportContact['type'][] = ['Salud Mental', 'Apoyo Legal', 'Centro de Salud', 'Servicios Sociales'];

const SupportContactForm: React.FC<SupportContactFormProps> = ({ isOpen, onClose, onSave, contactToEdit }) => {
    const [formData, setFormData] = useState({
        id: undefined as string | undefined,
        name: '',
        type: 'Salud Mental' as SupportContact['type'],
        phone: '',
        email: '',
        address: '',
    });

    useEffect(() => {
        if (contactToEdit) {
            setFormData({
                id: contactToEdit.id,
                name: contactToEdit.name,
                type: contactToEdit.type,
                phone: contactToEdit.phone,
                email: contactToEdit.email || '',
                address: contactToEdit.address,
            });
        } else {
            setFormData({
                id: undefined,
                name: '',
                type: 'Salud Mental',
                phone: '',
                email: '',
                address: '',
            });
        }
    }, [contactToEdit, isOpen]);

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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">{contactToEdit ? 'Editar' : 'Añadir'} Contacto de Apoyo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Organización</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
                            {contactTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email (Opcional)</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
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

export default SupportContactForm;