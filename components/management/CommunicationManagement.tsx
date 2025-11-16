import React, { useState, useContext, useMemo } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { Institution } from '../../types';
import { ArrowLeftIcon, EmailIcon, SmsIcon, ChatBubbleIcon, PushNotificationIcon, PhoneIcon, SocialIcon, CircularIcon } from '../icons/Icons';

type ChannelKey = keyof NonNullable<Institution['communicationChannels']>;

interface CommunicationManagementProps {
    onBack: () => void;
}

const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <button
        type="button"
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            enabled ? 'bg-primary-600' : 'bg-gray-200'
        }`}
        onClick={onChange}
        role="switch"
        aria-checked={enabled}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

const CommunicationManagement: React.FC<CommunicationManagementProps> = ({ onBack }) => {
    const { institution, setInstitution } = useContext(InstitutionContext);
    const [channels, setChannels] = useState(institution?.communicationChannels);
    const [isSaved, setIsSaved] = useState(false);

    const channelConfig = useMemo(() => [
        { key: 'email', title: 'Correo Electrónico', description: 'Para notificaciones automáticas (ausencias, tareas) y recuperación de contraseñas.', icon: <EmailIcon className="h-8 w-8 text-primary-600" /> },
        { key: 'sms', title: 'Mensajes SMS', description: 'Para notificaciones urgentes de faltas de asistencia o alarmas a las familias.', icon: <SmsIcon className="h-8 w-8 text-primary-600" /> },
        { key: 'internalMessaging', title: 'Mensajería Interna', description: 'Chat dentro de la aplicación para la comunicación entre profesores, familias y alumnos.', icon: <ChatBubbleIcon className="h-8 w-8 text-primary-600" /> },
        { key: 'pushNotifications', title: 'Notificaciones Push', description: 'Avisos y recordatorios directamente en los dispositivos móviles de los usuarios.', icon: <PushNotificationIcon className="h-8 w-8 text-primary-600" /> },
        { key: 'phoneCalls', title: 'Llamadas Telefónicas', description: 'Reservado para emergencias de salud o situaciones críticas que requieren contacto inmediato.', icon: <PhoneIcon className="h-8 w-8 text-primary-600" /> },
        { key: 'socialMedia', title: 'Redes Sociales', description: 'Canales de alerta e información general durante emergencias (ej. suspensión de clases).', icon: <SocialIcon className="h-8 w-8 text-primary-600" /> },
        { key: 'circulars', title: 'Circulares/Cartas', description: 'Para campañas colectivas o información específica sobre procesos de salud (ej. pediculosis).', icon: <CircularIcon className="h-8 w-8 text-primary-600" /> },
    ], []);

    if (!channels) {
        return <p>Cargando configuración de canales...</p>;
    }

    const handleToggle = (channelKey: ChannelKey) => {
        setChannels(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [channelKey]: { ...prev[channelKey], enabled: !prev[channelKey].enabled }
            };
        });
        setIsSaved(false);
    };

    const handleSave = () => {
        if (institution) {
            setInstitution({ ...institution, communicationChannels: channels });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4" />
                Volver a Gestión del Centro
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">Canales de Comunicación</h3>
                    <p className="text-sm text-gray-500">Habilite o deshabilite los métodos de notificación para la institución.</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    {isSaved && <p className="text-sm text-green-600 animate-pulse">¡Guardado con éxito!</p>}
                    <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        Guardar Cambios
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channelConfig.map(({ key, title, description, icon }) => (
                    <div key={key} className="bg-gray-50 border rounded-lg p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {icon}
                                    <h4 className="font-bold text-gray-800">{title}</h4>
                                </div>
                                <ToggleSwitch 
                                    enabled={channels[key as ChannelKey].enabled} 
                                    onChange={() => handleToggle(key as ChannelKey)} 
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-3">{description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunicationManagement;