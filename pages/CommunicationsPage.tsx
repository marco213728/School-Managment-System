import React, { useState, useContext, useMemo } from 'react';
import { User, Class, Student, Notification, Role, FormalRequest } from '../types';
import { UserContext } from '../contexts/UserContext';
import { SendIcon, PlusIcon, ChatBubbleIcon, ClipboardListIcon } from '../components/icons/Icons';
import AutomatedNotificationsConfig from '../components/communications/AutomatedNotificationsConfig';
import FormalRequestForm from '../components/communications/FormalRequestForm';
import RequestDetailModal from '../components/communications/RequestDetailModal';

interface CommunicationsPageProps {
  users: User[];
  students: Student[];
  classes: Class[];
  allNotifications: Notification[];
  onUpdateNotifications: (notifications: Notification[]) => void;
  formalRequests: FormalRequest[];
  onUpdateFormalRequests: (requests: FormalRequest[]) => void;
}

const ManualSend: React.FC<CommunicationsPageProps> = ({ users, students, classes, allNotifications, onUpdateNotifications }) => {
    const { user } = useContext(UserContext);
    const [recipientType, setRecipientType] = useState<'class' | 'individual'>('class');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [messageTitle, setMessageTitle] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [isSent, setIsSent] = useState(false);

    const institutionClasses = useMemo(() => classes.filter(c => c.institutionId === user?.institutionId), [classes, user]);
    const institutionUsers = useMemo(() => users.filter(u => u.institutionId === user?.institutionId && u.id !== user?.id), [users, user]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        let recipients: string[] = [];

        if (recipientType === 'class') {
            const selectedClass = classes.find(c => c.id === selectedClassId);
            if (selectedClass) {
                const studentIds = selectedClass.studentIds;
                const studentsInClass = students.filter(s => studentIds.includes(s.id));
                studentsInClass.forEach(s => {
                    recipients.push(s.id);
                    if (s.parentId) recipients.push(s.parentId);
                });
            }
        } else {
            if (selectedUserId) recipients.push(selectedUserId);
        }

        const newNotifications: Notification[] = recipients.map(recipientId => ({
            id: `notif-${Date.now()}-${Math.random()}`,
            institutionId: user.institutionId!,
            userId: recipientId,
            title: messageTitle,
            message: messageBody,
            date: new Date().toISOString(),
            read: false,
        }));

        onUpdateNotifications([...allNotifications, ...newNotifications]);
        setIsSent(true);
        setTimeout(() => {
            setIsSent(false);
            setMessageTitle('');
            setMessageBody('');
            setSelectedClassId('');
            setSelectedUserId('');
        }, 3000);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Enviar Mensaje</h3>
            <form onSubmit={handleSend} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Destinatario</label>
                    <div className="mt-2 flex items-center gap-4">
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio text-primary-600" name="recipientType" value="class" checked={recipientType === 'class'} onChange={() => setRecipientType('class')} />
                            <span className="ml-2">Clase Completa</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio text-primary-600" name="recipientType" value="individual" checked={recipientType === 'individual'} onChange={() => setRecipientType('individual')} />
                            <span className="ml-2">Usuario Individual</span>
                        </label>
                    </div>
                </div>

                {recipientType === 'class' ? (
                    <div>
                        <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full p-2 border rounded-md" required>
                            <option value="">Seleccionar Clase</option>
                            {institutionClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                ) : (
                    <div>
                        <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full p-2 border rounded-md" required>
                            <option value="">Seleccionar Usuario</option>
                            {institutionUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Asunto</label>
                    <input type="text" value={messageTitle} onChange={e => setMessageTitle(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mensaje</label>
                    <textarea value={messageBody} onChange={e => setMessageBody(e.target.value)} rows={4} className="w-full p-2 border rounded-md" required></textarea>
                </div>

                <div className="flex justify-end items-center gap-4">
                    {isSent && <span className="text-green-600 text-sm font-medium animate-pulse">Mensaje enviado correctamente</span>}
                    <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        <SendIcon className="h-4 w-4" /> Enviar
                    </button>
                </div>
            </form>
        </div>
    );
};

const CommunicationsPage: React.FC<CommunicationsPageProps> = (props) => {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState<'manual' | 'automated' | 'requests'>('manual');
    const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<FormalRequest | null>(null);

    const isStaff = user && [Role.Teacher, Role.InstitutionAdmin, Role.Vicerrector, Role.Rector, Role.InspectorGeneral, Role.JefeDECE].includes(user.role);
    const isAdmin = user && [Role.InstitutionAdmin, Role.Vicerrector, Role.Rector].includes(user.role);

    // Filter requests based on role
    const displayedRequests = useMemo(() => {
        if (!user) return [];
        if (isAdmin) {
            // Admins see requests sent TO them or BY them
            return props.formalRequests.filter(r => r.recipientRole === user.role || r.requesterId === user.id);
        }
        // Teachers/Staff see only their own requests
        return props.formalRequests.filter(r => r.requesterId === user.id);
    }, [props.formalRequests, user, isAdmin]);

    const handleSaveRequest = (reqData: any) => {
        if (!user) return;
        const newRequest: FormalRequest = {
            id: `req-${Date.now()}`,
            institutionId: user.institutionId!,
            requesterId: user.id,
            status: 'Pending',
            submissionDate: new Date().toISOString(),
            ...reqData
        };
        props.onUpdateFormalRequests([...props.formalRequests, newRequest]);
        setIsRequestFormOpen(false);
    };

    const handleResolveRequest = (requestId: string, status: 'Approved' | 'Rejected', comments: string) => {
        if (!user) return;
        const updatedRequests = props.formalRequests.map(r => 
            r.id === requestId 
            ? { ...r, status, resolutionComments: comments, resolutionDate: new Date().toISOString(), resolverId: user.id } as FormalRequest
            : r
        );
        props.onUpdateFormalRequests(updatedRequests);
        
        // Notify requester
        const request = props.formalRequests.find(r => r.id === requestId);
        if (request) {
            const newNotification: Notification = {
                id: `notif-req-${Date.now()}`,
                institutionId: user.institutionId!,
                userId: request.requesterId,
                title: `Solicitud ${status === 'Approved' ? 'Aprobada' : 'Rechazada'}`,
                message: `Su solicitud "${request.subject}" ha sido ${status === 'Approved' ? 'aprobada' : 'rechazada'}.`,
                date: new Date().toISOString(),
                read: false
            };
            props.onUpdateNotifications([...props.allNotifications, newNotification]);
        }
        setSelectedRequest(null);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Centro de Comunicaciones</h2>
            
             <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'manual' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <ChatBubbleIcon className="h-5 w-5"/> Mensajería
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('automated')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'automated' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                             <ClipboardListIcon className="h-5 w-5"/> Automáticas
                        </button>
                    )}
                    {isStaff && (
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'requests' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                             <ClipboardListIcon className="h-5 w-5"/> Solicitudes y Permisos
                             {isAdmin && displayedRequests.filter(r => r.status === 'Pending' && r.recipientRole === user?.role).length > 0 && (
                                 <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full ml-1">
                                     {displayedRequests.filter(r => r.status === 'Pending' && r.recipientRole === user?.role).length}
                                 </span>
                             )}
                        </button>
                    )}
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'manual' && <ManualSend {...props} />}
                {activeTab === 'automated' && isAdmin && <AutomatedNotificationsConfig />}
                {activeTab === 'requests' && isStaff && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">
                                {isAdmin ? 'Gestión de Solicitudes' : 'Mis Solicitudes Enviadas'}
                            </h3>
                            <button onClick={() => setIsRequestFormOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                                <PlusIcon className="h-5 w-5" /> Nueva Solicitud
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asunto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isAdmin ? 'Solicitante' : 'Destinatario'}</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {displayedRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.submissionDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.subject}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{req.type}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {isAdmin 
                                                    ? props.users.find(u => u.id === req.requesterId)?.name 
                                                    : req.recipientRole}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {req.status === 'Approved' ? 'Aprobado' : req.status === 'Rejected' ? 'Rechazado' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setSelectedRequest(req)} className="text-blue-600 hover:underline text-sm font-semibold">
                                                    {isAdmin && req.status === 'Pending' && req.recipientRole === user?.role ? 'Revisar' : 'Ver Detalles'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedRequests.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-gray-500">No hay solicitudes.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {isRequestFormOpen && (
                <FormalRequestForm 
                    isOpen={isRequestFormOpen}
                    onClose={() => setIsRequestFormOpen(false)}
                    onSave={handleSaveRequest}
                />
            )}

            {selectedRequest && (
                <RequestDetailModal
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    request={selectedRequest}
                    requesterName={props.users.find(u => u.id === selectedRequest.requesterId)?.name || 'Usuario'}
                    isReviewer={isAdmin && selectedRequest.recipientRole === user?.role}
                    onResolve={handleResolveRequest}
                />
            )}
        </div>
    );
};

export default CommunicationsPage;