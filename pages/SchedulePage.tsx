import React, { useContext, useMemo } from 'react';
import { UserContext } from '../contexts/UserContext';
import { ScheduleEntry, Subject, TimeSlot, Room, Timetable, User, Class, Student } from '../types';
import ScheduleView from '../components/schedule/ScheduleView';

interface SchedulePageProps {
    schedule: ScheduleEntry[];
    subjects: Subject[];
    timeSlots: TimeSlot[];
    rooms: Room[];
    timetables: Timetable[];
    users: User[];
    classes: Class[];
    students: Student[];
}

const SchedulePage: React.FC<SchedulePageProps> = ({ schedule, subjects, timeSlots, rooms, timetables, users, classes, students }) => {
    const { user: currentUser } = useContext(UserContext);

    const studentData = useMemo(() => {
        if (!currentUser) return null;
        
        const student = students.find(s => s.id === currentUser.id);
        if (!student) return null;

        const studentClass = classes.find(c => c.id === student.classId);
        if (!studentClass || !studentClass.timetableId) return null;

        const relevantTimeSlots = timeSlots.filter(ts => ts.timetableId === studentClass.timetableId);
        const classScheduleEntries = schedule.filter(e => e.classId === studentClass.id);
        
        return {
            title: `Horario Semanal - ${studentClass.name}`,
            scheduleEntries: classScheduleEntries,
            timeSlots: relevantTimeSlots,
        };
    }, [currentUser, schedule, classes, timeSlots, students]);

    if (!studentData) {
        return (
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Mi Horario</h2>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <p>No tienes un horario asignado. Por favor, contacta con la administración.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <ScheduleView
                title={studentData.title}
                scheduleEntries={studentData.scheduleEntries}
                timeSlots={studentData.timeSlots}
                subjects={subjects}
                classes={classes}
                rooms={rooms}
                users={users}
                viewType="student"
            />
        </div>
    );
};

export default SchedulePage;
