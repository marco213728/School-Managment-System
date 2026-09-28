import React from 'react';
import { Student, User, Class, ScheduleEntry, Subject, TimeSlot, Room, Timetable, ViccIntervention, HealthRecord, MedicalVisit, Intervention } from '../types';
import StudentManagement from '../components/management/StudentManagement';

interface StudentManagementPageProps {
    students: Student[];
    users: User[];
    classes: Class[];
    onUpdateStudents: (students: Student[]) => void;
    onUpdateUsers: (users: User[]) => void;
    onUpdateClasses?: (classes: Class[]) => void;
    healthRecords?: HealthRecord[];
    onUpdateHealthRecords?: (records: HealthRecord[]) => void;
    medicalVisits?: MedicalVisit[];
    onUpdateMedicalVisits?: (visits: MedicalVisit[]) => void;
    interventions?: Intervention[];
    onUpdateInterventions?: (interventions: Intervention[]) => void;
    schedule: ScheduleEntry[];
    subjects: Subject[];
    timeSlots: TimeSlot[];
    rooms: Room[];
    timetables: Timetable[];
    viccInterventions: ViccIntervention[];
    onUpdateViccInterventions: (interventions: ViccIntervention[]) => void;
}

const StudentManagementPage: React.FC<StudentManagementPageProps> = ({ 
    students, 
    users, 
    classes, 
    onUpdateStudents, 
    onUpdateUsers, 
    onUpdateClasses,
    healthRecords,
    onUpdateHealthRecords,
    medicalVisits,
    onUpdateMedicalVisits,
    interventions,
    onUpdateInterventions,
    schedule, 
    subjects, 
    timeSlots, 
    rooms, 
    timetables, 
    viccInterventions, 
    onUpdateViccInterventions 
}) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Alumnos</h2>
            <StudentManagement
                students={students}
                users={users}
                classes={classes}
                onUpdateStudents={onUpdateStudents}
                onUpdateUsers={onUpdateUsers}
                onUpdateClasses={onUpdateClasses}
                allHealthRecords={healthRecords}
                onUpdateHealthRecords={onUpdateHealthRecords}
                allMedicalVisits={medicalVisits}
                onUpdateMedicalVisits={onUpdateMedicalVisits}
                allInterventions={interventions}
                onUpdateInterventions={onUpdateInterventions}
                showBackButton={false}
                schedule={schedule}
                subjects={subjects}
                timeSlots={timeSlots}
                rooms={rooms}
                timetables={timetables}
                viccInterventions={viccInterventions}
                onUpdateViccInterventions={onUpdateViccInterventions}
            />
        </div>
    );
};

export default StudentManagementPage;