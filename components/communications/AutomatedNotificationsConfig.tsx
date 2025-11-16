import React, { useState, useContext, useMemo } from 'react';
import { InstitutionContext } from '../../contexts/UserContext';
import { Institution } from '../../types';
import { AttendanceIcon, AlertTriangleIcon, HealthIcon, CalendarIcon, GraduationCapIcon, ClipboardListIcon } from '../icons/Icons';

type NotificationKey = keyof NonNullable<Institution['automatedNotifications']>;
type Channel = 'email' | 'sms' | 'internalMessaging' | 'phoneCalls' | 'pushNotifications';

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

const AutomatedNotificationsConfig: React.FC = () => {
    const { institution, setInstitution } = useContext(InstitutionContext);
    const [config, setConfig] = useState(institution?.automatedNotifications);
    const [isSaved, setIsSaved] = useState(false);

    const configItems = useMemo(() => [
        { key: 'absences' as NotificationKey, title: 'Ausencias y Retrasos', description: 'Notifica a familiares sobre ausencias o retrasos.', icon: <AttendanceIcon className="h-8 w-8 text-primary-600" />, channels: ['email', 'sms', 'internalMessaging'] },
        { key: 'discipline' as NotificationKey, title: 'Alertas de Disciplina', description: 'Informa sobre incidencias de comportamiento o ausentismo.', icon: <AlertTriangleIcon className="h-8 w-8 text-yellow-600" />, channels: ['email', 'internalMessaging'] },
        { key: 'healthEmergencies' as NotificationKey, title: 'Emergencias de Salud', description: 'Envía notificaciones críticas a los cuidadores en emergencias médicas.', icon: <HealthIcon className="h-8 w-8 text-red-600" />, channels: ['email', 'sms', 'phoneCalls'] },
        { key: 'events' as NotificationKey, title: 'Eventos y Plazos', description: 'Recordatorios sobre fechas importantes, eventos y fechas límite.', icon: <CalendarIcon className="h-8 w-8 text-blue-600" />, channels: ['internalMessaging', 'email'] },
        { key: 'grades' as NotificationKey, title: 'Calificaciones y Portafolio', description: 'Notifica sobre nuevas calificaciones publicadas.', icon: <GraduationCapIcon className="h-8 w-8 text-green-600" />, channels: ['internalMessaging'], comingSoon: true },
        { key: 'checkInOut' as NotificationKey, title: 'Registro de Entrada/Salida', description: 'Notifica a los padres cuando el alumno entra o sale del centro.', icon: <ClipboardListIcon className="h-8 w-8 text-indigo-600" />, channels: ['sms', 'pushNotifications'], comingSoon: true },
    ], []);

    if (!config) {
        return <div className="bg-white p-6 rounded-xl shadow-md"><p>Cargando configuración...</p></div>;
    }
    
    const handleToggle = (key: NotificationKey) => {
        setConfig(prev => prev ? ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }) : prev);
        setIsSaved(false);
    };
    
    const handleChannelChange = (key: NotificationKey, channel: any) => {
        setConfig(prev => prev ? ({ ...prev, [key]: { ...prev[key], channel } }) : prev);
        setIsSaved(false);
    };

    const handleTemplateChange = (key: NotificationKey, template: string) => {
        setConfig(prev => prev ? ({ ...prev, [key]: { ...prev[key], template } }) : prev);
        setIsSaved(false);
    };

    const handleSave = () => {
        if (institution && config) {
            setInstitution({ ...institution, automatedNotifications: config });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    const getChannelName = (channelKey: string) => {
        switch (channelKey) {
            case 'email': return 'Email';
            case 'sms': return 'SMS';
            case 'internalMessaging': return 'Notificación Interna';
            case 'phoneCalls': return 'Llamada Telefónica';
            case 'pushNotifications': return 'Notificación Push';
            default: return 'Desconocido';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">Configuración de Notificaciones Automáticas</h3>
                    <p className="text-sm text-gray-500">Active y personalice las alertas automáticas de la plataforma.</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    {isSaved && <p className="text-sm text-green-600 animate-pulse">¡Guardado con éxito!</p>}
                    <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        Guardar Cambios
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {configItems.map(({ key, title, description, icon, channels: availableChannels, comingSoon }) => (
                    <div key={key} className={`bg-gray-50 border rounded-lg p-4 flex flex-col ${comingSoon ? 'opacity-60' : ''}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {icon}
                                <h4 className="font-bold text-gray-800">{title}</h4>
                            </div>
                            {comingSoon ? (
                                <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Próximamente</span>
                            ) : (
                                <ToggleSwitch enabled={config[key].enabled} onChange={() => handleToggle(key)} />
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mt-3 mb-4 flex-grow">{description}</p>
                        
                        {!comingSoon && config[key].enabled && (
                            <div className="space-y-4 pt-4 border-t">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Canal de Envío</label>
                                    <select 
                                        value={config[key].channel}
                                        onChange={(e) => handleChannelChange(key, e.target.value as Channel)}
                                        className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    >
                                        {availableChannels.map(ch => (
                                            <option key={ch} value={ch} disabled={!institution?.communicationChannels?.[ch as keyof typeof institution.communicationChannels]?.enabled}>
                                                {getChannelName(ch)} {!institution?.communicationChannels?.[ch as keyof typeof institution.communicationChannels]?.enabled && '(deshabilitado)'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Plantilla del Mensaje</label>
                                    <textarea 
                                        rows={4}
                                        value={config[key].template}
                                        onChange={(e) => handleTemplateChange(key, e.target.value)}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm text-xs font-mono"
                                    ></textarea>
                                    <p className="text-xs text-gray-500 mt-1">Placeholders: [STUDENT_NAME], [PARENT_NAME], [DATE], etc.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AutomatedNotificationsConfig;