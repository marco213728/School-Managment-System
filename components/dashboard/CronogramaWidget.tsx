
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { CronogramaEvent, User, Role } from '../../types';
import { PlusIcon, CheckCircleIcon, CloseIcon, CalendarIcon, ClockIcon, LocationMarkerIcon, EditIcon, ArrowLeftIcon } from '../icons/Icons';

interface CronogramaWidgetProps {
    events: CronogramaEvent[];
    onAddEvent: (event: Omit<CronogramaEvent, 'id' | 'status' | 'institutionId'>) => void;
    onUpdateStatus: (eventId: string, status: 'Approved' | 'Rejected') => void;
    onEditEvent: (event: CronogramaEvent) => void;
}

const CronogramaWidget: React.FC<CronogramaWidgetProps> = ({ events, onAddEvent, onUpdateStatus, onEditEvent }) => {
    const { user } = useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'calendar' | 'approvals'>('calendar');
    
    // Date Navigation State
    const [currentDate, setCurrentDate] = useState(new Date());

    // Form State
    const [formEvent, setFormEvent] = useState<Partial<CronogramaEvent>>({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '09:00',
        location: '',
        responsible: user?.name || ''
    });

    const isInspector = user?.role === Role.InspectorGeneral;
    // Allow proposals from most staff roles, excluding students/parents
    const canPropose = user && ![Role.Student, Role.Parent].includes(user.role);

    // Week calculation helpers
    const getWeekRange = (date: Date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay() + 1); // Monday
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // Sunday
        return { start, end };
    };

    const { start: weekStart, end: weekEnd } = getWeekRange(currentDate);

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const visibleEvents = useMemo(() => {
        return events
            .filter(e => {
                const eventDate = new Date(e.date + 'T00:00:00'); // Ensure time doesn't shift date
                // Check date range
                const inRange = eventDate >= weekStart && eventDate <= weekEnd;
                // Check visibility permissions
                const isApproved = e.status === 'Approved';
                const isMyProposal = e.proposedBy === user?.id;
                // Inspector sees all, others see approved or their own proposals
                const hasPermission = isInspector || isApproved || isMyProposal;
                
                return inRange && hasPermission;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));
    }, [events, user, canPropose, weekStart, weekEnd, isInspector]);

    const pendingEvents = useMemo(() => {
        return events.filter(e => e.status === 'Pending').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events]);

    const groupedEvents = useMemo(() => {
        const groups: Record<string, CronogramaEvent[]> = {};
        visibleEvents.forEach(e => {
            const dateKey = new Date(e.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(e);
        });
        return groups;
    }, [visibleEvents]);

    const handleOpenModal = (eventToEdit?: CronogramaEvent) => {
        if (eventToEdit) {
            setFormEvent(eventToEdit);
        } else {
            setFormEvent({
                title: '',
                date: new Date().toISOString().split('T')[0],
                startTime: '08:00',
                endTime: '09:00',
                location: '',
                responsible: user?.name || '',
                id: undefined 
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formEvent.id) {
            // Edit Mode
            if (onEditEvent && formEvent.id) {
                 onEditEvent(formEvent as CronogramaEvent);
            }
        } else {
            // Create Mode
            onAddEvent({
                title: formEvent.title!,
                date: formEvent.date!,
                startTime: formEvent.startTime!,
                endTime: formEvent.endTime!,
                location: formEvent.location!,
                responsible: formEvent.responsible!,
                proposedBy: user?.id || ''
            });
            alert('Actividad propuesta enviada a Inspección para aprobación.');
        }
        
        setIsModalOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-indigo-600"/> Cronograma Institucional
                </h3>
                <div className="flex gap-2">
                    {isInspector && (
                         <div className="flex bg-gray-100 rounded-lg p-1">
                            <button 
                                onClick={() => setActiveTab('calendar')}
                                className={`px-3 py-1 text-xs font-medium rounded-md ${activeTab === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                            >
                                Calendario
                            </button>
                            <button 
                                onClick={() => setActiveTab('approvals')}
                                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1 ${activeTab === 'approvals' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                            >
                                Por Aprobar
                                {pendingEvents.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingEvents.length}</span>}
                            </button>
                        </div>
                    )}
                    {canPropose && activeTab === 'calendar' && (
                        <button onClick={() => handleOpenModal()} className="p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700" title="Proponer Actividad">
                            <PlusIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Date Navigation */}
            {activeTab === 'calendar' && (
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg mb-4 border border-slate-200">
                    <button onClick={handlePrevWeek} className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded"><ArrowLeftIcon className="h-4 w-4" /></button>
                    <span className="text-xs font-semibold text-slate-700 uppercase">
                        {weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                    <button onClick={handleNextWeek} className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transform rotate-180"><ArrowLeftIcon className="h-4 w-4" /></button>
                </div>
            )}

            <div className="flex-grow overflow-y-auto pr-2">
                {activeTab === 'calendar' ? (
                    Object.entries(groupedEvents).length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(groupedEvents).map(([date, dayEvents]) => (
                                <div key={date}>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">{date}</h4>
                                    <div className="space-y-3">
                                        {(dayEvents as CronogramaEvent[]).map(event => (
                                            <div key={event.id} className={`p-3 rounded-lg border-l-4 relative group ${event.status === 'Pending' ? 'bg-yellow-50 border-yellow-400' : 'bg-slate-50 border-indigo-500'}`}>
                                                <div className="flex justify-between items-start">
                                                    <h5 className="font-bold text-slate-800 text-sm pr-6">{event.title}</h5>
                                                    {event.status === 'Pending' && <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">Pendiente</span>}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                                                    <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3"/> {event.startTime} - {event.endTime}</span>
                                                    <span className="flex items-center gap-1"><LocationMarkerIcon className="h-3 w-3"/> {event.location}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 italic">Resp: {event.responsible}</p>
                                                
                                                {/* Edit Button for Inspector */}
                                                {isInspector && (
                                                    <button 
                                                        onClick={() => handleOpenModal(event)}
                                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600 bg-white rounded-full border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Editar Evento"
                                                    >
                                                        <EditIcon className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center text-sm text-gray-500 py-8">No hay actividades para esta semana.</p>
                ) : (
                    // Approvals Tab (Inspector Only)
                    <div className="space-y-3">
                        {pendingEvents.length === 0 && <p className="text-center text-sm text-gray-500 py-8">No hay solicitudes pendientes.</p>}
                        {pendingEvents.map(event => (
                            <div key={event.id} className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm relative group">
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold text-gray-500">{new Date(event.date + 'T00:00:00').toLocaleDateString()}</span>
                                    <span className="text-xs bg-gray-100 px-2 rounded text-gray-600">{event.startTime} - {event.endTime}</span>
                                </div>
                                <h5 className="font-bold text-slate-800 text-sm mt-1">{event.title}</h5>
                                <p className="text-xs text-slate-600">Lugar: {event.location}</p>
                                <p className="text-xs text-slate-600">Resp: {event.responsible}</p>
                                
                                <div className="flex justify-end gap-2 mt-3 pt-2 border-t">
                                    <button onClick={() => onUpdateStatus(event.id, 'Rejected')} className="text-xs text-red-600 hover:bg-red-50 px-3 py-1 rounded">Rechazar</button>
                                    <button onClick={() => onUpdateStatus(event.id, 'Approved')} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1">
                                        <CheckCircleIcon className="h-3 w-3"/> Aprobar
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={() => handleOpenModal(event)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-indigo-600 bg-white rounded-full border border-gray-200"
                                    title="Editar antes de aprobar"
                                >
                                    <EditIcon className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal for Proposing/Editing Event */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[90] flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold text-slate-800">{formEvent.id ? 'Editar Actividad' : 'Proponer Actividad'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><CloseIcon className="h-5 w-5 text-gray-500"/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Actividad</label>
                                <input required type="text" className="w-full p-2 border rounded text-sm" value={formEvent.title} onChange={e => setFormEvent({...formEvent, title: e.target.value})} placeholder="Ej: Casa Abierta de Ciencias"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Fecha</label>
                                    <input required type="date" className="w-full p-2 border rounded text-sm" value={formEvent.date} onChange={e => setFormEvent({...formEvent, date: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Responsable</label>
                                    <input required type="text" className="w-full p-2 border rounded text-sm" value={formEvent.responsible} onChange={e => setFormEvent({...formEvent, responsible: e.target.value})}/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Hora Inicio</label>
                                    <input required type="time" className="w-full p-2 border rounded text-sm" value={formEvent.startTime} onChange={e => setFormEvent({...formEvent, startTime: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Hora Fin</label>
                                    <input required type="time" className="w-full p-2 border rounded text-sm" value={formEvent.endTime} onChange={e => setFormEvent({...formEvent, endTime: e.target.value})}/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Lugar</label>
                                <input required type="text" className="w-full p-2 border rounded text-sm" value={formEvent.location} onChange={e => setFormEvent({...formEvent, location: e.target.value})} placeholder="Ej: Auditorio"/>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700">
                                    {formEvent.id ? 'Guardar Cambios' : 'Enviar Propuesta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CronogramaWidget;
