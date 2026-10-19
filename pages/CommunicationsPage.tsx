import React, { useState, useContext, useMemo } from 'react';
import { 
    User, 
    Class, 
    Student, 
    Notification, 
    Role, 
    FormalRequest, 
    Appointment, 
    ChatChannel, 
    ChatMessage, 
    ScheduleEntry, 
    TimeSlot 
} from '../types';
import { UserContext } from '../contexts/UserContext';
import { 
    SendIcon, 
    PlusIcon, 
    ChatBubbleIcon, 
    ClipboardListIcon, 
    CalendarIcon, 
    UsersIcon, 
    ShieldCheckIcon 
} from '../components/icons/Icons';
import AutomatedNotificationsConfig from '../components/communications/AutomatedNotificationsConfig';
import FormalRequestForm from '../components/communications/FormalRequestForm';
import RequestDetailModal from '../components/communications/RequestDetailModal';
import MultiDeptAppointmentEngine from '../components/appointments/MultiDeptAppointmentEngine';
import TeacherCollaborationChat from '../components/chat/TeacherCollaborationChat';

export interface CommunicationsPageProps {
    users: User[];
    students: Student[];
    classes: Class[];
    allNotifications: Notification[];
    onUpdateNotifications: (notifications: Notification[]) => void;
    formalRequests: FormalRequest[];
    onUpdateFormalRequests: (requests: FormalRequest[]) => void;
    appointments?: Appointment[];
    onUpdateAppointments?: (appointments: Appointment[]) => void;
    chatChannels?: ChatChannel[];
    onUpdateChatChannels?: (channels: ChatChannel[]) => void;
    chatMessages?: ChatMessage[];
    onSendMessage?: (message: ChatMessage) => void;
    schedule?: ScheduleEntry[];
    timeSlots?: TimeSlot[];
    initialTab?: 'appointments' | 'chat' | 'manual' | 'automated' | 'requests';
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
                const studentIds = selectedClass.studentIds || [];
                const studentsInClass = students.filter(s => s && studentIds.includes(s.id));
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
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-4">Emisión de Comunicados Masivos y Circulares</h3>
            <form onSubmit={handleSend} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700">Tipo de Destinatario</label>
                    <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-slate-700">
                        <label className="inline-flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                className="form-radio text-indigo-600 focus:ring-indigo-500" 
                                name="recipientType" 
                                value="class" 
                                checked={recipientType === 'class'} 
                                onChange={() => setRecipientType('class')} 
                            />
                            <span className="ml-2">Paralelo / Curso Completo</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                className="form-radio text-indigo-600 focus:ring-indigo-500" 
                                name="recipientType" 
                                value="individual" 
                                checked={recipientType === 'individual'} 
                                onChange={() => setRecipientType('individual')} 
                            />
                            <span className="ml-2">Usuario Individual</span>
                        </label>
                    </div>
                </div>

                {recipientType === 'class' ? (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Seleccionar Curso</label>
                        <select 
                            value={selectedClassId} 
                            onChange={e => setSelectedClassId(e.target.value)} 
                            className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                            required
                        >
                            <option value="">-- Seleccionar Curso --</option>
                            {institutionClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Seleccionar Usuario</label>
                        <select 
                            value={selectedUserId} 
                            onChange={e => setSelectedUserId(e.target.value)} 
                            className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                            required
                        >
                            <option value="">-- Seleccionar Usuario --</option>
                            {institutionUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Asunto del Comunicado</label>
                    <input 
                        type="text" 
                        value={messageTitle} 
                        onChange={e => setMessageTitle(e.target.value)} 
                        placeholder="Ej: Convocatoria a Asamblea General / Informe Trimestral"
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        required 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cuerpo del Comunicado</label>
                    <textarea 
                        value={messageBody} 
                        onChange={e => setMessageBody(e.target.value)} 
                        rows={4} 
                        placeholder="Escriba el contenido oficial del comunicado institucional..."
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        required
                    />
                </div>

                <div className="flex justify-end items-center gap-4 pt-2">
                    {isSent && <span className="text-emerald-600 text-xs font-bold animate-pulse">✓ Mensaje despachado correctamente</span>}
                    <button 
                        type="submit" 
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 shadow-sm transition"
                    >
                        <SendIcon className="h-4 w-4" /> Despachar Notificación
                    </button>
                </div>
            </form>
        </div>
    );
};

const CommunicationsPage: React.FC<CommunicationsPageProps> = (props) => {
    const { user } = useContext(UserContext);
    
    // Default active tab based on role and props
    const defaultTab = useMemo(() => {
        if (props.initialTab) return props.initialTab;
        if (user?.role === Role.Parent) return 'appointments';
        return 'appointments';
    }, [props.initialTab, user]);

    const [activeTab, setActiveTab] = useState<'appointments' | 'chat' | 'manual' | 'automated' | 'requests'>(defaultTab);
    const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<FormalRequest | null>(null);

    const isStaff = user && user.role !== Role.Parent && user.role !== Role.Student;
    const isParent = user?.role === Role.Parent;
    const isAdmin = user && [Role.InstitutionAdmin, Role.Vicerrector, Role.Rector].includes(user.role);

    // Filter requests based on role
    const displayedRequests = useMemo(() => {
        if (!user) return [];
        if (isAdmin) {
            return props.formalRequests.filter(r => r.institutionId === user?.institutionId).filter(r => r.recipientRole === user.role || r.requesterId === user.id);
        }
        return props.formalRequests.filter(r => r.institutionId === user?.institutionId).filter(r => r.requesterId === user.id);
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
        <div className="space-y-6">
            {/* Top Navigation Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
                            activeTab === 'appointments' 
                                ? 'border-indigo-600 text-indigo-700' 
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <CalendarIcon className="h-4 w-4" />
                        <span>Citas y Atención a Padres</span>
                        {props.appointments && props.appointments.filter(a => a.status === 'PENDING').length > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                                {props.appointments.filter(a => a.status === 'PENDING').length}
                            </span>
                        )}
                    </button>

                    {isStaff && (
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
                                activeTab === 'chat' 
                                    ? 'border-indigo-600 text-indigo-700' 
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <ChatBubbleIcon className="h-4 w-4" />
                            <span>Chat Docente (Colaboración)</span>
                        </button>
                    )}

                    {isStaff && (
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
                                activeTab === 'manual' 
                                    ? 'border-indigo-600 text-indigo-700' 
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <SendIcon className="h-4 w-4" />
                            <span>Circulares y Comunicados</span>
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('automated')}
                            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
                                activeTab === 'automated' 
                                    ? 'border-indigo-600 text-indigo-700' 
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <ClipboardListIcon className="h-4 w-4" />
                            <span>Alertas Automáticas</span>
                        </button>
                    )}

                    {isStaff && (
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
                                activeTab === 'requests' 
                                    ? 'border-indigo-600 text-indigo-700' 
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <ClipboardListIcon className="h-4 w-4" />
                            <span>Solicitudes y Permisos</span>
                            {isAdmin && displayedRequests.filter(r => r.status === 'Pending' && r.recipientRole === user?.role).length > 0 && (
                                <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                                    {displayedRequests.filter(r => r.status === 'Pending' && r.recipientRole === user?.role).length}
                                </span>
                            )}
                        </button>
                    )}
                </nav>
            </div>

            {/* Tab Contents */}
            <div>
                {activeTab === 'appointments' && (
                    <MultiDeptAppointmentEngine
                        appointments={props.appointments || []}
                        onUpdateAppointments={props.onUpdateAppointments || (() => {})}
                        users={props.users}
                        students={props.students}
                        classes={props.classes}
                        schedule={props.schedule || []}
                        timeSlots={props.timeSlots || []}
                        notifications={props.allNotifications}
                        onUpdateNotifications={props.onUpdateNotifications}
                    />
                )}

                {activeTab === 'chat' && isStaff && (
                    <TeacherCollaborationChat
                        channels={props.chatChannels || []}
                        messages={props.chatMessages || []}
                        onSendMessage={props.onSendMessage || (() => {})}
                        onCreateChannel={(newChan) => {
                            if (props.onUpdateChatChannels && props.chatChannels) {
                                props.onUpdateChatChannels([...props.chatChannels, newChan]);
                            }
                        }}
                        users={props.users}
                        students={props.students}
                        classes={props.classes}
                    />
                )}

                {activeTab === 'manual' && isStaff && <ManualSend {...props} />}
                {activeTab === 'automated' && isAdmin && <AutomatedNotificationsConfig />}
                {activeTab === 'requests' && isStaff && (
                    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-slate-800">
                                {isAdmin ? 'Gestión de Solicitudes y Permisos' : 'Mis Solicitudes Enviadas'}
                            </h3>
                            <button 
                                onClick={() => setIsRequestFormOpen(true)} 
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition"
                            >
                                <PlusIcon className="h-4 w-4" /> Nueva Solicitud
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase">Fecha</th>
                                        <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase">Asunto</th>
                                        <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase">Tipo</th>
                                        <th className="px-5 py-3 text-left font-bold text-slate-500 uppercase">{isAdmin ? 'Solicitante' : 'Destinatario'}</th>
                                        <th className="px-5 py-3 text-center font-bold text-slate-500 uppercase">Estado</th>
                                        <th className="px-5 py-3 text-right font-bold text-slate-500 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {displayedRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3 whitespace-nowrap text-slate-500">{new Date(req.submissionDate).toLocaleDateString()}</td>
                                            <td className="px-5 py-3 whitespace-nowrap font-bold text-slate-900">{req.subject}</td>
                                            <td className="px-5 py-3 whitespace-nowrap text-slate-600">{req.type}</td>
                                            <td className="px-5 py-3 whitespace-nowrap text-slate-600">
                                                {isAdmin ? props.users.find(u => u.id === req.requesterId)?.name : req.recipientRole}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                                    req.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {req.status === 'Approved' ? 'Aprobado' : req.status === 'Rejected' ? 'Rechazado' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-right">
                                                <button 
                                                    onClick={() => setSelectedRequest(req)} 
                                                    className="text-indigo-600 hover:text-indigo-800 font-bold"
                                                >
                                                    Ver Detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedRequests.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-slate-400">
                                                No hay solicitudes registradas.
                                            </td>
                                        </tr>
                                    )}
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
                    request={selectedRequest}
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onResolve={handleResolveRequest}
                    requesterName={props.users.find(u => u.id === selectedRequest.requesterId)?.name || 'Usuario'}
                    isReviewer={isAdmin || false}
                />
            )}
        </div>
    );
};

export default CommunicationsPage;