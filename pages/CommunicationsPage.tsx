import React, { useState, useContext, useMemo } from 'react';
import { User, Class, Student, Notification, Role } from '../types';
import { UserContext, InstitutionContext } from '../contexts/UserContext';
import { SendIcon } from '../components/icons/Icons';
import AutomatedNotificationsConfig from '../components/communications/AutomatedNotificationsConfig';

interface CommunicationsPageProps {
  users: User[];
  students: Student[];
  classes: Class[];
  allNotifications: Notification[];
  onUpdateNotifications: (notifications: Notification[]) => void;
}

const ManualSend: React.FC<CommunicationsPageProps> = ({ users, students, classes, allNotifications, onUpdateNotifications }) => {
    const { user: currentUser } = useContext(UserContext);
    const { institution } = useContext(InstitutionContext);
    
    const [recipient, setRecipient] = useState('');
    const [channel, setChannel] = useState('internal');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSent, setIsSent] = useState(false);

    const institutionUsers = useMemo(() => users.filter(u => u.institutionId === currentUser?.institutionId), [users, currentUser]);
    const institutionClasses = useMemo(() => classes.filter(c => c.institutionId === currentUser?.institutionId), [classes, currentUser]);

    const recipientOptions = useMemo(() => {
        const roleGroups = [
            { value: 'role-Parent', label: 'Todos los Familiares' },
            { value: 'role-Teacher', label: 'Todos los Profesores' },
            { value: 'role-Student', label: 'Todos los Alumnos' },
        ];
        const classGroups = institutionClasses.map(c => ({ value: `class-${c.id}`, label: `Clase: ${c.name}` }));
        const individualGroups = institutionUsers.map(u => ({ value: `user-${u.id}`, label: `${u.name} (${u.role})`}));

        return [
            { label: 'Grupos por Rol', options: roleGroups },
            { label: 'Grupos por Clase', options: classGroups },
            { label: 'Individual', options: individualGroups },
        ];
    }, [institutionUsers, institutionClasses]);

    const availableChannels = useMemo(() => {
        const channels = [{ key: 'internal', label: 'Notificación Interna' }];
        if (institution?.communicationChannels?.email.enabled) {
            channels.push({ key: 'email', label: 'Email' });
        }
        // Add other channels like SMS here if implemented
        return channels;
    }, [institution]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipient || !subject || !message) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        const targetUserIds = new Set<string>();
        const [type, id] = recipient.split('-');

        if (type === 'role') {
            institutionUsers.forEach(u => {
                if (u.role === id) targetUserIds.add(u.id);
            });
        } else if (type === 'class') {
            const cls = institutionClasses.find(c => c.id === id);
            cls?.studentIds.forEach(studentId => {
                targetUserIds.add(studentId);
                const student = students.find(s => s.id === studentId);
                if (student) targetUserIds.add(student.parentId); // Add parent as well
            });
        } else if (type === 'user') {
            targetUserIds.add(id);
        }

        if (channel === 'internal') {
            const newNotifications: Notification[] = Array.from(targetUserIds).map(userId => ({
                id: `notif-${Date.now()}-${userId}`,
                institutionId: currentUser!.institutionId!,
                userId,
                title: subject,
                message,
                date: new Date().toISOString(),
                read: false,
            }));
            onUpdateNotifications([...allNotifications, ...newNotifications]);
        } else if (channel === 'email') {
            const recipientEmails = Array.from(targetUserIds)
                .map(userId => users.find(u => u.id === userId)?.email)
                .filter(Boolean);
            
            alert(`--- SIMULACIÓN DE ENVÍO DE EMAIL ---\n\nCanal: Email\nPara: ${recipientEmails.join(', ')}\nAsunto: ${subject}\n\nMensaje:\n${message}\n\n-------------------------------------`);
        }
        
        setIsSent(true);
        setRecipient('');
        setSubject('');
        setMessage('');
        setTimeout(() => setIsSent(false), 4000);
    };
    
    return (
         <div className="bg-white p-6 rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Destinatario</label>
                    <select 
                        id="recipient" 
                        value={recipient} 
                        onChange={e => setRecipient(e.target.value)}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">-- Seleccione un destinatario --</option>
                        {recipientOptions.map(group => (
                            <optgroup key={group.label} label={group.label}>
                                {group.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="channel" className="block text-sm font-medium text-gray-700">Canal de Envío</label>
                    <select 
                        id="channel" 
                        value={channel} 
                        onChange={e => setChannel(e.target.value)}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        {availableChannels.map(ch => <option key={ch.key} value={ch.key}>{ch.label}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto</label>
                    <input 
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                 <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje</label>
                    <textarea 
                        id="message"
                        rows={8}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    ></textarea>
                </div>
                <div className="flex justify-end items-center gap-4">
                     {isSent && <p className="text-sm text-green-600">Mensaje enviado con éxito.</p>}
                    <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        <SendIcon className="h-5 w-5" />
                        Enviar
                    </button>
                </div>
            </form>
        </div>
    );
};

const CommunicationsPage: React.FC<CommunicationsPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'manual' | 'automated'>('manual');

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Centro de Comunicaciones</h2>
            
             <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'manual'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Envío Manual
                    </button>
                    <button
                        onClick={() => setActiveTab('automated')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'automated'
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Notificaciones Automáticas
                    </button>
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'manual' && <ManualSend {...props} />}
                {activeTab === 'automated' && <AutomatedNotificationsConfig />}
            </div>
        </div>
    );
};


export default CommunicationsPage;