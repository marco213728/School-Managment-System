
import React, { useState, useEffect, useMemo } from 'react';
import { Institution, User, Role } from '../../types';
import { CloseIcon } from '../icons/Icons';

interface InstitutionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (institution: Omit<Institution, 'id'> & { id?: string }) => void;
    institutionToEdit: Institution | null;
    allUsers: User[];
}

const initialFormData: Omit<Institution, 'id' | 'contact'> & { id?: string; contact: { phone: string; email: string; address: string; }; adminIds: string[] } = {
    id: undefined,
    name: '',
    logoUrl: 'https://placehold.co/150x150/cccccc/333333?text=Logo',
    contact: { phone: '', email: '', address: '' },
    activeModules: { dece: false, health: false },
    adminIds: [],
    methodologyFocus: 'DUA', // Default to DUA
};

const InstitutionForm: React.FC<InstitutionFormProps> = ({ isOpen, onClose, onSave, institutionToEdit, allUsers }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const adminUsers = useMemo(() => 
        allUsers.filter(u => u.role === Role.InstitutionAdmin), 
        [allUsers]
    );

    useEffect(() => {
        if (institutionToEdit) {
            setFormData({
                id: institutionToEdit.id,
                name: institutionToEdit.name,
                logoUrl: institutionToEdit.logoUrl,
                contact: institutionToEdit.contact,
                activeModules: institutionToEdit.activeModules || { dece: false, health: false },
                adminIds: institutionToEdit.adminIds || [],
                methodologyFocus: institutionToEdit.methodologyFocus || 'DUA',
            });
            setLogoPreview(null);
        } else {
            setFormData(initialFormData);
            setLogoPreview(null);
        }
    }, [institutionToEdit, isOpen]);

    // FIX: Use `e.currentTarget` to correctly access form element properties and avoid type errors.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        if (name in formData.contact) {
            setFormData(prev => ({ ...prev, contact: { ...prev.contact, [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            activeModules: { ...prev.activeModules!, [name]: checked }
        }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setLogoPreview(result);
                setFormData(prev => ({ ...prev, logoUrl: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // FIX: Use `e.currentTarget` to correctly access selected options from a multi-select element.
    const handleAdminIdsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // FIX: Explicitly type `option` as HTMLOptionElement to resolve `value` property access error.
        const values = Array.from(e.currentTarget.selectedOptions, (option: HTMLOptionElement) => option.value);
        setFormData(prev => ({ ...prev, adminIds: values }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{institutionToEdit ? 'Editar Institución' : 'Añadir Institución'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2">
                    <div className="flex items-center space-x-4">
                        <img src={logoPreview || formData.logoUrl} alt="Logo" className="w-20 h-20 rounded-full object-cover bg-gray-100" />
                        <div>
                            <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                Cambiar Logo
                            </label>
                            <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Institución</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    
                    {/* DUA Requirement */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <h4 className="font-bold text-blue-800 text-sm mb-1">Configuración de Metodología (PCI)</h4>
                        <div className="flex items-center">
                            <input type="radio" checked readOnly className="h-4 w-4 text-blue-600" />
                            <label className="ml-2 text-sm font-medium text-blue-900">Enfoque Prioritario: Diseño Universal para el Aprendizaje (DUA) - Obligatorio</label>
                        </div>
                        <p className="text-xs text-blue-700 mt-1 ml-6">El sistema configurará automáticamente los formatos de planificación según la normativa.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                            <input type="email" name="email" value={formData.contact.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input type="tel" name="phone" value={formData.contact.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" name="address" value={formData.contact.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Administradores de la Institución</label>
                        <p className="text-xs text-gray-500 mb-1">Seleccione uno o más administradores (mantener Ctrl/Cmd para selección múltiple).</p>
                        <select
                            multiple
                            name="adminIds"
                            value={formData.adminIds}
                            onChange={handleAdminIdsChange}
                            className="mt-1 block w-full h-24 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        >
                            {adminUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Módulos Activos</label>
                        <div className="mt-2 space-y-2">
                            <label className="flex items-center">
                                <input type="checkbox" name="dece" checked={formData.activeModules?.dece || false} onChange={handleCheckboxChange} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500" />
                                <span className="ml-2 text-gray-700">Módulo DECE</span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" name="health" checked={formData.activeModules?.health || false} onChange={handleCheckboxChange} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500" />
                                <span className="ml-2 text-gray-700">Módulo de Salud</span>
                            </label>
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

export default InstitutionForm;
