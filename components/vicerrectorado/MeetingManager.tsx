import React, { useState } from 'react';
import { MeetingRecord, User } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, UsersIcon } from '../icons/Icons';

interface MeetingManagerProps {
    meetings: MeetingRecord[];
    onUpdateMeetings: (meetings: MeetingRecord[]) => void;
    users: User[];
}

const MeetingManager: React.FC<MeetingManagerProps> = ({ meetings, onUpdateMeetings, users }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<MeetingRecord | null>(null);
    const [formData, setFormData] = useState<Partial<MeetingRecord>>({
        type: 'Junta de Curso',
        title: '',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        agreements: '',
        attendees: []
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMeeting) {
            const updated = meetings.map(m => m.id === editingMeeting.id ? { ...m, ...formData } as MeetingRecord : m);
            onUpdateMeetings(updated);
        } else {
            const newMeeting: MeetingRecord = {
                id: `meet-${Date.now()}`,
                institutionId: 'uemol',
                type: formData.type as any,
                title: formData.title!,
                date: formData.date!,
                summary: formData.summary!,
                agreements: formData.agreements!,
                attendees: formData.attendees || []
            };
            onUpdateMeetings([...meetings, newMeeting]);
        }
        setIsFormOpen(false);
        setEditingMeeting(null);
        setFormData({ type: 'Junta de Curso', title: '', date: new Date().toISOString().split('T')[0], summary: '', agreements: '', attendees: [] });
    };

     const handleDelete = (id: string) => {
        if (window.confirm('¿Eliminar esta acta de reunión?')) {
            onUpdateMeetings(meetings.filter(m => m.id !== id));
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    Actas de Juntas y Comités
                </h3>
                <button onClick={() => { setEditingMeeting(null); setIsFormOpen(true); }} className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded hover:bg-orange-700 flex items-center gap-1">
                    <PlusIcon className="h-3 w-3"/> Nueva Acta
                </button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSave} className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                    <h4 className="font-bold text-sm mb-3">{editingMeeting ? 'Editar Acta' : 'Nueva Acta de Reunión'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div><label className="block text-xs font-bold text-gray-600">Tipo</label><select className="w-full p-2 border rounded text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}><option>Junta de Curso</option><option>Junta de Área</option><option>Comisión Pedagógica</option></select></div>
                        <div><label className="block text-xs font-bold text-gray-600">Fecha</label><input type="date" className="w-full p-2 border rounded text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600">Título / Tema</label><input type="text" className="w-full p-2 border rounded text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600">Resumen / Puntos Tratados</label><textarea className="w-full p-2 border rounded text-sm" rows={3} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} required /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-600">Acuerdos y Resoluciones</label><textarea className="w-full p-2 border rounded text-sm" rows={3} value={formData.agreements} onChange={e => setFormData({...formData, agreements: e.target.value})} /></div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Cancelar</button>
                        <button type="submit" className="px-3 py-1 bg-orange-600 text-white rounded text-sm">Guardar Acta</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {meetings.map(meet => (
                    <div key={meet.id} className="border-l-4 border-orange-500 pl-4 py-2 relative group hover:bg-gray-50 rounded-r-lg transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-800 text-sm">{meet.title}</h4>
                                    <span className="text-[10px] bg-gray-200 px-2 rounded-full text-gray-600">{meet.type}</span>
                                </div>
                                <span className="text-xs text-gray-500">{new Date(meet.date).toLocaleDateString()}</span>
                            </div>
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                                <button onClick={() => { setEditingMeeting(meet); setFormData(meet); setIsFormOpen(true); }} className="p-1 text-gray-400 hover:text-blue-600"><EditIcon className="h-4 w-4"/></button>
                                <button onClick={() => handleDelete(meet.id)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{meet.summary}</p>
                        {meet.agreements && (
                            <div className="mt-2 text-xs bg-orange-50 p-2 rounded text-orange-800 border border-orange-100">
                                <strong>Acuerdos:</strong> {meet.agreements}
                            </div>
                        )}
                        <div className="mt-2 flex gap-2">
                             <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 flex items-center gap-1"><UsersIcon className="h-3 w-3"/> {meet.attendees.length} Asistentes</span>
                        </div>
                    </div>
                ))}
                 {meetings.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No hay actas registradas.</p>}
            </div>
        </div>
    );
};

export default MeetingManager;