import React, { useState, useMemo, useContext, useRef, useEffect } from 'react';
import { 
    ChatChannel, 
    ChatMessage, 
    ChatChannelType, 
    User, 
    Student, 
    Class, 
    Role 
} from '../../types';
import { UserContext } from '../../contexts/UserContext';
import { 
    ChatBubbleIcon, 
    SendIcon, 
    SearchIcon, 
    PlusIcon, 
    UsersIcon, 
    PaperClipIcon, 
    LockClosedIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    AlertTriangleIcon,
    GraduationCapIcon,
    ShieldCheckIcon,
    CloseIcon
} from '../icons/Icons';

export interface TeacherCollaborationChatProps {
    channels: ChatChannel[];
    messages: ChatMessage[];
    onSendMessage: (message: ChatMessage) => void;
    onCreateChannel: (channel: ChatChannel) => void;
    users: User[];
    students: Student[];
    classes: Class[];
}

const TeacherCollaborationChat: React.FC<TeacherCollaborationChatProps> = ({
    channels,
    messages,
    onSendMessage,
    onCreateChannel,
    users,
    students,
    classes
}) => {
    const { user: currentUser } = useContext(UserContext);

    // Filter and Active Channel
    const [selectedChannelId, setSelectedChannelId] = useState<string>(() => channels[0]?.id || '');
    const [channelCategoryFilter, setChannelCategoryFilter] = useState<'ALL' | ChatChannelType>('ALL');
    const [channelSearchTerm, setChannelSearchTerm] = useState('');
    
    // Message Input
    const [messageText, setMessageText] = useState('');
    const [selectedAttachment, setSelectedAttachment] = useState<{ name: string; size: string; type: 'pdf' | 'doc' | 'image' | 'other' } | null>(null);
    const [linkingStudentId, setLinkingStudentId] = useState<string>('');
    const [isLinkCaseModalOpen, setIsLinkCaseModalOpen] = useState(false);

    // New Channel Modal
    const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
    const [newChanName, setNewChanName] = useState('');
    const [newChanType, setNewChanType] = useState<ChatChannelType>('DIRECT');
    const [newChanDesc, setNewChanDesc] = useState('');
    const [newChanParticipants, setNewChanParticipants] = useState<string[]>([]);
    const [newChanRelatedStudentId, setNewChanRelatedStudentId] = useState<string>('');

    // Institutional Hours Mode (Do Not Disturb outside school hours)
    const [isDndModeActive, setIsDndModeActive] = useState<boolean>(() => {
        const saved = localStorage.getItem('amauta_chat_dnd');
        return saved === 'true';
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Eligible Staff users (Teachers, DECE, Medical, Inspector, Admin)
    const staffUsers = useMemo(() => {
        return users.filter(u => u.role !== Role.Parent && u.role !== Role.Student);
    }, [users]);

    // Accessible Channels for currentUser
    const userAccessibleChannels = useMemo(() => {
        if (!currentUser) return [];
        return channels.filter(ch => {
            // Channel participants include user OR user is admin OR public academic channel
            if (currentUser.role === Role.InstitutionAdmin || currentUser.role === Role.Rector) return true;
            return ch.participantIds.includes(currentUser.id);
        });
    }, [channels, currentUser]);

    // Filtered Channels list
    const displayedChannels = useMemo(() => {
        let list = userAccessibleChannels;
        if (channelCategoryFilter !== 'ALL') {
            list = list.filter(ch => ch.channelType === channelCategoryFilter);
        }
        if (channelSearchTerm.trim()) {
            const q = channelSearchTerm.toLowerCase();
            list = list.filter(ch => 
                ch.name.toLowerCase().includes(q) || 
                ch.description?.toLowerCase().includes(q) ||
                ch.relatedEntityName?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [userAccessibleChannels, channelCategoryFilter, channelSearchTerm]);

    // Active Channel
    const activeChannel = useMemo(() => {
        return channels.find(ch => ch.id === selectedChannelId) || displayedChannels[0] || null;
    }, [channels, selectedChannelId, displayedChannels]);

    // Active Channel Messages
    const channelMessages = useMemo(() => {
        if (!activeChannel) return [];
        return messages.filter(m => m.channelId === activeChannel.id)
            .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    }, [messages, activeChannel]);

    // Scroll to bottom on message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [channelMessages]);

    // Handle Send Message
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!messageText.trim() && !selectedAttachment) || !activeChannel || !currentUser) return;

        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            channelId: activeChannel.id,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            content: messageText.trim(),
            caseCitationId: linkingStudentId || undefined,
            attachmentMetadata: selectedAttachment ? [{
                name: selectedAttachment.name,
                url: '#',
                size: selectedAttachment.size,
                type: selectedAttachment.type
            }] : undefined,
            sentAt: new Date().toISOString()
        };

        onSendMessage(newMsg);
        setMessageText('');
        setSelectedAttachment(null);
        setLinkingStudentId('');
    };

    // Handle Create New Channel
    const handleCreateChannelSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChanName.trim() || !currentUser) return;

        const selectedStudent = students.find(s => s.id === newChanRelatedStudentId);

        const newChannel: ChatChannel = {
            id: `chan-${Date.now()}`,
            institutionId: currentUser.institutionId || 'uemol',
            channelType: newChanType,
            name: newChanName.trim(),
            description: newChanDesc.trim() || undefined,
            relatedEntityId: newChanRelatedStudentId || undefined,
            relatedEntityName: selectedStudent?.name || undefined,
            participantIds: Array.from(new Set([currentUser.id, ...newChanParticipants])),
            createdAt: new Date().toISOString(),
            isArchived: false,
            caseCitation: selectedStudent ? {
                studentId: selectedStudent.id,
                studentName: selectedStudent.name,
                category: 'DECE_REFERRAL',
                summary: `Canal de caso abierto para seguimiento interdisciplinar de ${selectedStudent.name}.`
            } : undefined
        };

        onCreateChannel(newChannel);
        setSelectedChannelId(newChannel.id);
        setIsNewChannelModalOpen(false);
        setNewChanName('');
        setNewChanDesc('');
        setNewChanParticipants([]);
        setNewChanRelatedStudentId('');
    };

    const toggleDndMode = () => {
        setIsDndModeActive(prev => {
            const next = !prev;
            localStorage.setItem('amauta_chat_dnd', String(next));
            return next;
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px] max-h-[85vh]">
            {/* Top Bar / Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600/30 border border-indigo-400/40 rounded-xl">
                        <ChatBubbleIcon className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-white leading-tight">
                                Chat Docente y Colaboración Interdisciplinaria
                            </h2>
                            <span className="text-[10px] bg-indigo-500/30 border border-indigo-400/30 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full">
                                Canal Seguro Institucional
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Reemplazo oficial a mensajería informal (WhatsApp) para Juntas de Curso, Áreas Académicas y Casos DECE.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Institutional Hours / DND Toggle */}
                    <button
                        type="button"
                        onClick={toggleDndMode}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            isDndModeActive 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' 
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                        title="Modo Fuera de Horario Laboral: Silencia notificaciones push para proteger el tiempo de descanso docente cumpliendo con la normativa laboral."
                    >
                        <ClockIcon className="h-4 w-4" />
                        <span>{isDndModeActive ? 'Modo No Molestar (Activo)' : 'Horario Laboral'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsNewChannelModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Nuevo Canal / Caso
                    </button>
                </div>
            </div>

            {/* DND Alert Banner if active */}
            {isDndModeActive && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                        <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
                        Modo Fuera de Horario Laboral Activo: Las alertas y notificaciones están silenciadas temporalmente. Los mensajes permanecen archivados y auditables.
                    </span>
                    <button onClick={toggleDndMode} className="text-amber-900 underline text-[11px] font-bold">
                        Desactivar
                    </button>
                </div>
            )}

            {/* Main Chat Layout: 2 Columns */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Channels List */}
                <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/70">
                    {/* Category Filter Pills */}
                    <div className="p-3 border-b border-slate-200 space-y-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar canal o caso..."
                                value={channelSearchTerm}
                                onChange={e => setChannelSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <SearchIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] font-bold">
                            {(['ALL', 'GRADE_LEVEL', 'CASE_THREAD', 'SUBJECT_AREA', 'DIRECT'] as const).map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setChannelCategoryFilter(cat)}
                                    className={`px-2 py-1 rounded-lg whitespace-nowrap transition ${
                                        channelCategoryFilter === cat 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {cat === 'ALL' ? 'Todos' :
                                     cat === 'GRADE_LEVEL' ? 'Juntas' :
                                     cat === 'CASE_THREAD' ? 'Casos DECE' :
                                     cat === 'SUBJECT_AREA' ? 'Áreas' : 'Directos'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Channels Scrollable List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {displayedChannels.map(ch => {
                            const isSelected = activeChannel?.id === ch.id;
                            const isCaseThread = ch.channelType === 'CASE_THREAD';
                            const isGradeLevel = ch.channelType === 'GRADE_LEVEL';

                            return (
                                <div
                                    key={ch.id}
                                    onClick={() => setSelectedChannelId(ch.id)}
                                    className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                                        isSelected 
                                            ? 'bg-indigo-50/80 border-r-4 border-indigo-600' 
                                            : 'hover:bg-slate-100/60'
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                        isCaseThread ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                        isGradeLevel ? 'bg-sky-100 text-sky-700 border border-sky-200' :
                                        ch.channelType === 'SUBJECT_AREA' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                        'bg-slate-200 text-slate-700'
                                    }`}>
                                        {isCaseThread ? <LockClosedIcon className="h-4 w-4" /> :
                                         isGradeLevel ? <GraduationCapIcon className="h-4 w-4" /> :
                                         <UsersIcon className="h-4 w-4" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <h4 className="text-xs font-bold text-slate-900 truncate">
                                                {ch.name}
                                            </h4>
                                            {ch.lastMessage && (
                                                <span className="text-[9px] text-slate-400 font-mono whitespace-nowrap">
                                                    {new Date(ch.lastMessage.sentAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                            {ch.lastMessage 
                                                ? `${ch.lastMessage.senderName.split(' ')[0]}: ${ch.lastMessage.content}` 
                                                : ch.description || 'Sin mensajes aún'}
                                        </p>

                                        {isCaseThread && (
                                            <span className="inline-block mt-1 text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                                🔒 Caso DECE Restringido
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {displayedChannels.length === 0 && (
                            <div className="p-8 text-center text-xs text-slate-400">
                                No se encontraron canales en esta categoría.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Chat Area: Active Conversation */}
                {activeChannel ? (
                    <div className="flex-1 flex flex-col bg-white">
                        {/* Conversation Header */}
                        <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                    #
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-900">{activeChannel.name}</h3>
                                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                                            {activeChannel.participantIds.length} participantes
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">{activeChannel.description}</p>
                                </div>
                            </div>

                            {/* Case Citation Badge in Header */}
                            {activeChannel.caseCitation && (
                                <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-1 text-[11px] text-purple-800 flex items-center gap-1.5">
                                    <LockClosedIcon className="h-3.5 w-3.5 text-purple-700" />
                                    <span>Caso Vinculado: <strong>{activeChannel.caseCitation.studentName}</strong></span>
                                </div>
                            )}
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
                            {channelMessages.map(msg => {
                                const isMe = msg.senderId === currentUser?.id;
                                const isCaseCitation = !!msg.caseCitationId;
                                const studentCited = students.find(s => s.id === msg.caseCitationId);

                                return (
                                    <div 
                                        key={msg.id} 
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                                            <span className="font-bold text-slate-700">{msg.senderName}</span>
                                            <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-500 text-[9px]">
                                                {msg.senderRole}
                                            </span>
                                            <span className="font-mono">
                                                {new Date(msg.sentAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className={`p-3 rounded-2xl max-w-lg text-xs shadow-xs ${
                                            isMe 
                                                ? 'bg-indigo-600 text-white rounded-tr-xs' 
                                                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                                        }`}>
                                            {/* Linked Case Citation Box inside message */}
                                            {isCaseCitation && (
                                                <div className={`mb-2 p-2 rounded-lg text-[11px] flex items-center gap-2 ${
                                                    isMe ? 'bg-indigo-700/60 text-indigo-100 border border-indigo-400/30' : 'bg-purple-50 text-purple-900 border border-purple-200'
                                                }`}>
                                                    <ShieldCheckIcon className="h-4 w-4 flex-shrink-0" />
                                                    <div>
                                                        <span className="font-bold block text-[10px] uppercase">Expediente Vinculado</span>
                                                        <span>Estudiante: {studentCited?.name || 'Caso Académico'} ({studentCited?.grade || '10mo EGB'})</span>
                                                    </div>
                                                </div>
                                            )}

                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                            {/* Attachment Preview */}
                                            {msg.attachmentMetadata && msg.attachmentMetadata.map((att, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`mt-2 p-2 rounded-xl flex items-center justify-between text-[11px] ${
                                                        isMe ? 'bg-indigo-700/50 text-white' : 'bg-slate-100 text-slate-800'
                                                    }`}
                                                >
                                                    <span className="truncate flex items-center gap-1.5">
                                                        <PaperClipIcon className="h-3.5 w-3.5" />
                                                        {att.name}
                                                    </span>
                                                    <span className="text-[10px] opacity-75 font-mono ml-2">{att.size}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                                            {isMe ? 'Entregado ✓' : ''}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Selected Attachment or Linked Case Ribbon */}
                        {(selectedAttachment || linkingStudentId) && (
                            <div className="bg-slate-100 p-2 px-4 border-t border-slate-200 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    {selectedAttachment && (
                                        <span className="inline-flex items-center gap-1.5 text-indigo-700 font-bold bg-white px-2 py-0.5 rounded border border-indigo-200">
                                            <PaperClipIcon className="h-3.5 w-3.5" />
                                            {selectedAttachment.name} ({selectedAttachment.size})
                                            <button onClick={() => setSelectedAttachment(null)} className="text-slate-400 hover:text-rose-600 ml-1">✕</button>
                                        </span>
                                    )}

                                    {linkingStudentId && (
                                        <span className="inline-flex items-center gap-1.5 text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                            <ShieldCheckIcon className="h-3.5 w-3.5" />
                                            Vinculado a: {students.find(s => s.id === linkingStudentId)?.name}
                                            <button onClick={() => setLinkingStudentId('')} className="text-slate-400 hover:text-rose-600 ml-1">✕</button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Message Input Box */}
                        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                            {/* Attachment button */}
                            <button
                                type="button"
                                onClick={() => {
                                    // Simulation of attaching lesson plan or circular
                                    setSelectedAttachment({
                                        name: 'Planificacion_Refuerzo_Semana12.pdf',
                                        size: '1.4 MB',
                                        type: 'pdf'
                                    });
                                }}
                                className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition"
                                title="Adjuntar documento o planificación"
                            >
                                <PaperClipIcon className="h-5 w-5" />
                            </button>

                            {/* Link Case Citation button */}
                            <button
                                type="button"
                                onClick={() => setIsLinkCaseModalOpen(true)}
                                className={`p-2 rounded-xl transition ${
                                    linkingStudentId 
                                        ? 'bg-purple-100 text-purple-700 font-bold' 
                                        : 'text-slate-500 hover:text-purple-600 hover:bg-slate-100'
                                }`}
                                title="Vincular citación de caso o seguimiento de estudiante"
                            >
                                <ShieldCheckIcon className="h-5 w-5" />
                            </button>

                            <input
                                type="text"
                                placeholder={`Escribir mensaje en #${activeChannel.name}...`}
                                value={messageText}
                                onChange={e => setMessageText(e.target.value)}
                                className="flex-1 p-2.5 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                            <button
                                type="submit"
                                disabled={!messageText.trim() && !selectedAttachment}
                                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition"
                            >
                                <SendIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
                        Seleccione un canal para iniciar la conversación.
                    </div>
                )}
            </div>

            {/* MODAL: Link Case Citation to Message */}
            {isLinkCaseModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <ShieldCheckIcon className="h-4 w-4 text-purple-600" />
                                Vincular Citación de Caso a Mensaje
                            </h3>
                            <button onClick={() => setIsLinkCaseModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Permite referenciar un estudiante para seguimiento académico o conductual sin exponer notas clínicas confidenciales.
                        </p>
                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                            {students.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => {
                                        setLinkingStudentId(s.id);
                                        setIsLinkCaseModalOpen(false);
                                    }}
                                    className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 cursor-pointer transition text-xs flex items-center justify-between"
                                >
                                    <div>
                                        <span className="font-bold text-slate-800 block">{s.name}</span>
                                        <span className="text-[10px] text-slate-400">{s.grade}</span>
                                    </div>
                                    <span className="text-xs text-purple-600 font-bold">Vincular ➔</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Create New Channel / Case Thread */}
            {isNewChannelModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-base font-bold text-slate-900">
                                Crear Nuevo Canal o Hilo de Caso
                            </h3>
                            <button onClick={() => setIsNewChannelModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateChannelSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Canal:</label>
                                <select
                                    value={newChanType}
                                    onChange={e => setNewChanType(e.target.value as ChatChannelType)}
                                    className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                                >
                                    <option value="GRADE_LEVEL">Junta de Curso / Paralelo (Docentes del grupo)</option>
                                    <option value="CASE_THREAD">Hilo de Caso Interdisciplinar (DECE & Tutor)</option>
                                    <option value="SUBJECT_AREA">Área Académica / Comisión Técnico-Pedagógica</option>
                                    <option value="DIRECT">Mensaje Directo 1 a 1</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Canal:</label>
                                <input
                                    type="text"
                                    required
                                    value={newChanName}
                                    onChange={e => setNewChanName(e.target.value)}
                                    placeholder="Ej: Caso: Seguimiento Lengua 10mo A"
                                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            {newChanType === 'CASE_THREAD' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Estudiante Vinculado:</label>
                                    <select
                                        value={newChanRelatedStudentId}
                                        onChange={e => setNewChanRelatedStudentId(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                                    >
                                        <option value="">Seleccione estudiante...</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Propósito o Descripción:</label>
                                <textarea
                                    rows={2}
                                    value={newChanDesc}
                                    onChange={e => setNewChanDesc(e.target.value)}
                                    placeholder="Objetivo pedagógico o institucional del canal..."
                                    className="w-full p-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Participantes Iniciales:</label>
                                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                                    {staffUsers.filter(u => u.id !== currentUser?.id).map(u => (
                                        <label key={u.id} className="flex items-center gap-2 text-xs p-1 hover:bg-white rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newChanParticipants.includes(u.id)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setNewChanParticipants([...newChanParticipants, u.id]);
                                                    } else {
                                                        setNewChanParticipants(newChanParticipants.filter(id => id !== u.id));
                                                    }
                                                }}
                                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="font-medium text-slate-800">{u.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">({u.role})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsNewChannelModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                                >
                                    Crear Canal ✓
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherCollaborationChat;
