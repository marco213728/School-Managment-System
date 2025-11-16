import React, { useContext } from 'react';
import { Class, ScheduleEntry, Subject, TimeSlot, User, Room } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';
import { InstitutionContext } from '../../contexts/UserContext';

interface PrintableScheduleProps {
    classToPrint: Class;
    schedule: ScheduleEntry[];
    subjects: Subject[];
    timeSlots: TimeSlot[];
    users: User[];
    rooms: Room[];
}

const PrintableSchedule: React.FC<PrintableScheduleProps> = ({ classToPrint, schedule, subjects, timeSlots, users, rooms }) => {
    const { institution } = useContext(InstitutionContext);
    
    const subjectMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));
    const teacherMap = new Map(users.map(u => [u.id, u.name]));
    const roomMap = new Map(rooms.map(r => [r.id, r.name]));

    return (
        <div className="bg-white p-8 font-sans text-gray-800">
            <header className="flex items-center justify-between border-b-2 border-gray-700 pb-4">
                 <div className="flex items-center gap-4">
                    {institution && <img src={institution.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />}
                    <div>
                        <h1 className="text-xl font-bold uppercase">{institution?.name}</h1>
                        <p className="text-sm">Horario Semanal</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold">{classToPrint.name}</h2>
                    <p className="text-sm">Año Lectivo 2024-2025</p>
                </div>
            </header>

            <main className="mt-8">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 text-sm font-semibold">Franja Horaria</th>
                            {DAYS_OF_WEEK.map(day => (
                                <th key={day} className="border border-gray-300 p-2 text-sm font-semibold">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(slot => (
                            <tr key={slot.id} className="text-center">
                                <td className={`border border-gray-300 p-2 text-sm font-semibold ${slot.isBreak ? 'bg-gray-100' : ''}`}>
                                    {slot.startTime} - {slot.endTime}
                                </td>
                                {slot.isBreak ? (
                                    <td colSpan={5} className="border border-gray-300 p-2 bg-gray-100 font-bold text-gray-500">
                                        D E S C A N S O
                                    </td>
                                ) : (
                                    DAYS_OF_WEEK.map(day => {
                                        const entry = schedule.find(e => e.day === day && e.timeSlotId === slot.id);
                                        const subject = entry ? subjectMap.get(entry.subjectId) : null;
                                        const teacher = subject ? teacherMap.get(subject.teacherId) : null;
                                        const room = entry ? roomMap.get(entry.roomId) : null;

                                        return (
                                            <td key={day} className="border border-gray-300 p-2 text-xs">
                                                {entry && subject ? (
                                                    <div>
                                                        <p className="font-bold text-primary-700">{subject.name}</p>
                                                        <p className="text-gray-600">{teacher || 'N/A'}</p>
                                                        <p className="text-gray-500 italic">@{room || 'N/A'}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                        );
                                    })
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default PrintableSchedule;