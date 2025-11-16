
import React from 'react';
import { SupportContact } from '../../types';
import { PhoneIcon, EmailIcon, LocationMarkerIcon } from '../icons/Icons';

const SupportContactCard: React.FC<{ contact: SupportContact }> = ({ contact }) => {
    const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(contact.address)}`;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 bg-blue-100 text-blue-800`}>
                    {contact.type}
                </span>
                <h4 className="font-bold text-gray-800 text-base">{contact.name}</h4>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 group">
                    <PhoneIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                    <span className="group-hover:text-primary-600 group-hover:underline">{contact.phone}</span>
                </a>
                {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 group">
                        <EmailIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                        <span className="group-hover:text-primary-600 group-hover:underline">{contact.email}</span>
                    </a>
                )}
                 <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 group">
                    <LocationMarkerIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="group-hover:text-primary-600 group-hover:underline">{contact.address}</span>
                </a>
            </div>
        </div>
    );
};


const SupportNetwork: React.FC<{ contacts: SupportContact[] }> = ({ contacts }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Red de Apoyo Externa</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.length > 0 ? (
                    contacts.map(contact => (
                        <SupportContactCard key={contact.id} contact={contact} />
                    ))
                ) : (
                    <p className="text-sm text-gray-500 col-span-full text-center">No hay contactos en la red de apoyo. Pueden ser añadidos por un administrador en el módulo de Gestión del Centro.</p>
                )}
            </div>
        </div>
    );
};

export default SupportNetwork;