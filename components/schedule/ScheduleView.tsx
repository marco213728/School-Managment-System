import React from 'react';
import { ScheduleEntry, TimeSlot, Subject, Class, Room, User, Role } from '../../types';
import { DAYS_OF_WEEK } from '../../constants';

interface ScheduleViewProps {
  title: string;
  scheduleEntries: ScheduleEntry[];
  timeSlots: TimeSlot[];
  subjects: Subject[];
  classes: Class[];
  rooms: Room[];
  users: User[];
  viewType: 'student' | 'teacher';
}

const ScheduleView: React.FC<ScheduleViewProps> = ({
  title,
  scheduleEntries,
  timeSlots,
  subjects,
  classes,
  rooms,
  users,
  viewType,
}) => {
  const subjectMap = new Map<string, Subject>(subjects.map(s => [s.id, s]));
  const classMap = new Map(classes.map(c => [c.id, c.name]));
  const roomMap = new Map(rooms.map(r => [r.id, r.name]));
  const teacherMap = new Map(users.filter(u => u.role === Role.Teacher).map(t => [t.id, t.name]));

  const sortedTimeSlots = [...timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Franja Horaria</th>
              {DAYS_OF_WEEK.map(day => (
                <th key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTimeSlots.map(slot => {
              if (slot.isBreak) {
                return (
                  <tr key={slot.id}>
                    <td className="px-2 py-2 text-sm font-medium text-gray-500 bg-gray-100">{slot.startTime} - {slot.endTime}</td>
                    <td colSpan={5} className="text-center text-sm font-semibold text-gray-600 bg-gray-100">D E S C A N S O</td>
                  </tr>
                );
              }
              return (
                <tr key={slot.id}>
                  <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">{slot.startTime} - {slot.endTime}</td>
                  {DAYS_OF_WEEK.map(day => {
                    const entry = scheduleEntries.find(e => e.day === day && e.timeSlotId === slot.id);
                    const subject = entry ? subjectMap.get(entry.subjectId) : null;
                    const teacher = subject ? teacherMap.get(subject.teacherId) : null;
                    const className = entry ? classMap.get(entry.classId) : null;
                    const room = entry ? roomMap.get(entry.roomId) : null;

                    return (
                      <td key={day} className="px-1 py-1 align-top border-l h-24">
                        {entry && subject ? (
                          <div className="bg-primary-100 text-primary-800 p-1 rounded-md text-xs text-center h-full flex flex-col justify-center">
                            <p className="font-bold">{subject.name}</p>
                            {viewType === 'teacher' && <p className="text-gray-700 font-semibold">{className || 'N/A'}</p>}
                            {viewType === 'student' && <p className="text-gray-600">{teacher || 'N/A'}</p>}
                            <p className="text-gray-500 italic">@{room || 'N/A'}</p>
                          </div>
                        ) : (
                          <div className="h-full w-full"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleView;