import React, { useState, useContext, useEffect } from 'react';
import { Institution } from '../../types';
// FIX: Corrected import path for InstitutionContext.
import { InstitutionContext } from '../../contexts/UserContext';

const InstitutionManagement = () => {
    const { institution, setInstitution: setGlobalInstitution } = useContext(InstitutionContext);
    const [localInstitution, setLocalInstitution] = useState<Institution | null>(institution);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setLocalInstitution(institution);
        setLogoPreview(null);
    }, [institution]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!localInstitution) return;
        const { name, value } = e.target;
        if (name in localInstitution.contact) {
            setLocalInstitution(prev => prev ? ({
                ...prev,
                contact: { ...prev.contact, [name]: value }
            }) : null);
        } else {
            setLocalInstitution(prev => prev ? ({ ...prev, [name]: value as any }) : null);
        }
        setIsSaved(false);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setLogoPreview(result);
                setLocalInstitution(prev => prev ? ({...prev, logoUrl: result}) : null);
            };
            reader.readAsDataURL(file);
            setIsSaved(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (localInstitution) {
            setGlobalInstitution(localInstitution);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    if (!localInstitution) {
        return <p>Cargando datos de la institución...</p>
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Datos de la Institución</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-4">
                    <img src={logoPreview || localInstitution.logoUrl} alt="Logo" className="w-20 h-20 rounded-full object-cover bg-gray-100" />
                    <div>
                        <label htmlFor="logo-upload" className="cursor-pointer px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cambiar Logo
                        </label>
                        <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </div>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Institución</label>
                    <input id="name" type="text" name="name" value={localInstitution.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                        <input id="email" type="email" name="email" value={localInstitution.contact.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono de Contacto</label>
                        <input id="phone" type="tel" name="phone" value={localInstitution.contact.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
                    <input id="address" type="text" name="address" value={localInstitution.contact.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div className="flex justify-end items-center gap-4 pt-2">
                    {isSaved && <p className="text-sm text-green-600 animate-pulse">¡Guardado con éxito!</p>}
                    <button type="submit" className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InstitutionManagement;