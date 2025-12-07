import React, { useState, useMemo, useEffect } from 'react';
// FIX: Import PunchType and StaffAttendanceRecord
import { User, Institution, Role, Class, Student, ScheduleEntry, Notification, SupportContact, HealthRecord, MedicalVisit, Subject, TimeSlot, Room, Timetable, ViccIntervention, AttendanceRecord, ExitPass, Citacion, AcademicCalendarEvent, LeccionarioEntry, MicroPlan, Dcd, EvaluationCriterion, EvaluationIndicator, Gradebook, Activity, ReinforcementPlan, StaffAttendanceRecord, PunchType, FormalRequest, TrainingPlan } from './types';
import { MOCK_USERS, MOCK_INSTITUTIONS, MOCK_CLASSES, MOCK_STUDENTS, MOCK_SCHEDULE_ENTRIES, MOCK_NOTIFICATIONS, MOCK_SUPPORT_CONTACTS, MOCK_HEALTH_RECORDS, MOCK_MEDICAL_VISITS, MOCK_SUBJECTS, MOCK_TIME_SLOTS, MOCK_ROOMS, MOCK_TIMETABLES, MOCK_VICC_INTERVENTIONS, MOCK_ATTENDANCE, MOCK_EXIT_PASSES, MOCK_CITACIONES, MOCK_ACADEMIC_CALENDAR_EVENTS, MOCK_LECCIONARIO_ENTRIES, MOCK_MICRO_PLANS, MOCK_DCDS, MOCK_EVALUATION_CRITERIA, MOCK_EVALUATION_INDICATORS, MOCK_GRADEBOOKS, MOCK_ACTIVITIES, MOCK_REINFORCEMENT_PLANS, MOCK_STAFF_ATTENDANCE, MOCK_FORMAL_REQUESTS, MOCK_TRAINING_PLANS } from './constants';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import { UserContext, InstitutionContext } from './contexts/UserContext';
import SuperAdminPage from './pages/SuperAdminPage';
import PlatformAdminLayout from './components/layout/PlatformAdminLayout';
import { AMAUTA_LOGO } from './branding';
import { MOCK_INSTITUTIONAL_DOCUMENTS, MOCK_MEETING_RECORDS } from './constants';
import { InstitutionalDocument, MeetingRecord } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);

  // In a real app, this would be fetched, but for the prototype, we manage it in state.
  const [institutionalDocuments, setInstitutionalDocuments] = useState<InstitutionalDocument[]>(MOCK_INSTITUTIONAL_DOCUMENTS);
  const [meetingRecords, setMeetingRecords] = useState<MeetingRecord[]>(MOCK_MEETING_RECORDS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [institutions, setInstitutions] = useState<Institution[]>(MOCK_INSTITUTIONS);
  const [classes, setClasses] = useState<Class[]>(MOCK_CLASSES);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(MOCK_SCHEDULE_ENTRIES);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>(MOCK_SUPPORT_CONTACTS);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(MOCK_HEALTH_RECORDS);
  const [medicalVisits, setMedicalVisits] = useState<MedicalVisit[]>(MOCK_MEDICAL_VISITS);
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(MOCK_TIME_SLOTS);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [timetables, setTimetables] = useState<Timetable[]>(MOCK_TIMETABLES);
  const [viccInterventions, setViccInterventions] = useState<ViccIntervention[]>(MOCK_VICC_INTERVENTIONS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [exitPasses, setExitPasses] = useState<ExitPass[]>(MOCK_EXIT_PASSES);
  const [citaciones, setCitaciones] = useState<Citacion[]>(MOCK_CITACIONES);
  const [academicCalendarEvents, setAcademicCalendarEvents] = useState<AcademicCalendarEvent[]>(MOCK_ACADEMIC_CALENDAR_EVENTS);
  const [leccionarioEntries, setLeccionarioEntries] = useState<LeccionarioEntry[]>(MOCK_LECCIONARIO_ENTRIES);
  const [microPlans, setMicroPlans] = useState<MicroPlan[]>(MOCK_MICRO_PLANS);
  const [dcds, setDcds] = useState<Dcd[]>(MOCK_DCDS);
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriterion[]>(MOCK_EVALUATION_CRITERIA);
  const [evaluationIndicators, setEvaluationIndicators] = useState<EvaluationIndicator[]>(MOCK_EVALUATION_INDICATORS);
  const [gradebooks, setGradebooks] = useState<Gradebook[]>(MOCK_GRADEBOOKS);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  
  const [reinforcementPlans, setReinforcementPlans] = useState<ReinforcementPlan[]>(MOCK_REINFORCEMENT_PLANS || []);
  const [staffAttendanceRecords, setStaffAttendanceRecords] = useState<StaffAttendanceRecord[]>(MOCK_STAFF_ATTENDANCE || []);
  const [formalRequests, setFormalRequests] = useState<FormalRequest[]>(MOCK_FORMAL_REQUESTS || []); 
  // FIX: Centralize Training Plans State
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>(MOCK_TRAINING_PLANS || []);

  const handleLogin = (email: string, password: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
      setCurrentUser(user);
      if (user.role !== Role.SuperAdmin && user.institutionId) {
        const institution = institutions.find(i => i.id === user.institutionId);
        setCurrentInstitution(institution || null);
      } else {
        setCurrentInstitution(null);
      }
      return true; // Login successful
    }
    return false; // Login failed
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentInstitution(null);
  };

  const handleSetInstitution = (updatedInstitution: Institution) => {
    setInstitutions(prev => prev.map(i => i.id === updatedInstitution.id ? updatedInstitution : i));
    setCurrentInstitution(updatedInstitution);
  };

  const handleUpdateDocuments = (docs: InstitutionalDocument[]) => setInstitutionalDocuments(docs);
  const handleUpdateMeetings = (meetings: MeetingRecord[]) => setMeetingRecords(meetings);
  
  const handleUpdateUsers = (updatedUsers: User[]) => setUsers(updatedUsers);
  const handleUpdateClasses = (updatedClasses: Class[]) => setClasses(updatedClasses);
  const handleUpdateSchedule = (updatedSchedule: ScheduleEntry[]) => setSchedule(updatedSchedule);
  const handleUpdateStudents = (updatedStudents: Student[]) => setStudents(updatedStudents);
  const handleUpdateNotifications = (updatedNotifications: Notification[]) => setNotifications(updatedNotifications);
  const handleUpdateSupportContacts = (updatedContacts: SupportContact[]) => setSupportContacts(updatedContacts);
  const handleUpdateHealthRecords = (updatedRecords: HealthRecord[]) => setHealthRecords(updatedRecords);
  const handleUpdateMedicalVisits = (updatedVisits: MedicalVisit[]) => setMedicalVisits(updatedVisits);
  const handleUpdateSubjects = (updatedSubjects: Subject[]) => setSubjects(updatedSubjects);
  const handleUpdateTimeSlots = (updatedTimeSlots: TimeSlot[]) => setTimeSlots(updatedTimeSlots);
  const handleUpdateRooms = (updatedRooms: Room[]) => setRooms(updatedRooms);
  const handleUpdateTimetables = (updatedTimetables: Timetable[]) => setTimetables(updatedTimetables);
  const handleUpdateViccInterventions = (updatedInterventions: ViccIntervention[]) => setViccInterventions(updatedInterventions);
  const handleUpdateAttendance = (updatedRecords: AttendanceRecord[]) => setAttendanceRecords(updatedRecords);
  const handleUpdateExitPasses = (updatedPasses: ExitPass[]) => setExitPasses(updatedPasses);
  const handleUpdateCitaciones = (updatedCitaciones: Citacion[]) => setCitaciones(updatedCitaciones);
  const handleUpdateAcademicCalendarEvents = (updatedEvents: AcademicCalendarEvent[]) => setAcademicCalendarEvents(updatedEvents);
  const handleUpdateLeccionarioEntries = (updatedEntries: LeccionarioEntry[]) => setLeccionarioEntries(updatedEntries);
  const handleUpdateMicroPlans = (updatedPlans: MicroPlan[]) => setMicroPlans(updatedPlans);
  const handleUpdateDcds = (newDcds: Dcd[]) => setDcds(prev => [...prev, ...newDcds]);
  const handleUpdateEvaluationCriteria = (newCriteria: EvaluationCriterion[]) => setEvaluationCriteria(prev => [...prev, ...newCriteria]);
  const handleUpdateEvaluationIndicators = (newIndicators: EvaluationIndicator[]) => setEvaluationIndicators(prev => [...prev, ...newIndicators]);
  const handleUpdateGradebooks = (updatedGradebooks: Gradebook[]) => setGradebooks(updatedGradebooks);
  const handleUpdateActivities = (updatedActivities: Activity[]) => setActivities(updatedActivities);
  const handleUpdateReinforcementPlans = (updatedPlans: ReinforcementPlan[]) => setReinforcementPlans(updatedPlans);
  const handleUpdateFormalRequests = (updatedRequests: FormalRequest[]) => setFormalRequests(updatedRequests);
  // FIX: Add handler for Training Plans
  const handleUpdateTrainingPlans = (updatedPlans: TrainingPlan[]) => setTrainingPlans(updatedPlans);
  
  const handleUpdateStaffAttendance = (userId: string, method: 'Biometric' | 'Manual' | 'Facial', location?: { latitude: number; longitude: number; }) => {
    setStaffAttendanceRecords(prev => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 8);
        const user = users.find(u => u.id === userId);
        if (!user) return prev;

        const existingRecordIndex = prev.findIndex(r => r.userId === userId && r.date === today);

        if (existingRecordIndex > -1) {
            const updatedRecords = [...prev];
            const recordToUpdate = { ...updatedRecords[existingRecordIndex] };
            const lastPunch = recordToUpdate.punches[recordToUpdate.punches.length - 1];
            let newPunchType: PunchType = 'in'; // Default
            if (lastPunch) {
                switch (lastPunch.type) {
                    case 'in': newPunchType = 'out_break'; break;
                    case 'out_break': newPunchType = 'in_break'; break;
                    case 'in_break': newPunchType = 'out'; break;
                    case 'out': 
                        alert("Ya ha registrado su salida por hoy.");
                        return prev; // Do nothing if already clocked out
                }
            }

            recordToUpdate.punches = [
                ...recordToUpdate.punches,
                { time: currentTime, type: newPunchType, method, location },
            ];
            updatedRecords[existingRecordIndex] = recordToUpdate;
            return updatedRecords;
        } else {
            const newRecord: StaffAttendanceRecord = {
                id: `sa-${userId}-${today}`,
                institutionId: user.institutionId!,
                userId: userId,
                date: today,
                punches: [{ time: currentTime, type: 'in', method, location }],
            };
            return [newRecord, ...prev];
        }
    });
};


  const userContextValue = useMemo(() => ({
    user: currentUser,
    logout: handleLogout,
  }), [currentUser]);

  const institutionContextValue = useMemo(() => ({
    institution: currentInstitution,
    setInstitution: handleSetInstitution,
  }), [currentInstitution]);

  if (!currentUser) {
    const platformBranding = {
      name: "Amauta",
      logoUrl: AMAUTA_LOGO,
      contact: { phone: '', email: '', address: ''},
      id: 'platform'
    };
    const loginInstitutionContext = { institution: platformBranding, setInstitution: () => {} };

    return (
      <InstitutionContext.Provider value={loginInstitutionContext}>
        <LoginPage onLogin={handleLogin} />
      </InstitutionContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={userContextValue}>
      <InstitutionContext.Provider value={institutionContextValue}>
        {currentUser.role === Role.SuperAdmin ? (
          <PlatformAdminLayout>
            <SuperAdminPage institutions={institutions} users={users} />
          </PlatformAdminLayout>
        ) : (
          <DashboardLayout 
            users={users}
            classes={classes}
            students={students}
            schedule={schedule}
            notifications={notifications}
            supportContacts={supportContacts}
            healthRecords={healthRecords}
            medicalVisits={medicalVisits}
            subjects={subjects}
            timeSlots={timeSlots}
            rooms={rooms}
            timetables={timetables}
            viccInterventions={viccInterventions}
            attendanceRecords={attendanceRecords}
            exitPasses={exitPasses}
            citaciones={citaciones}
            academicCalendarEvents={academicCalendarEvents}
            leccionarioEntries={leccionarioEntries}
            microPlans={microPlans}
            dcds={dcds}
            evaluationCriteria={evaluationCriteria}
            evaluationIndicators={evaluationIndicators}
            gradebooks={gradebooks}
            activities={activities}
            reinforcementPlans={reinforcementPlans}
            staffAttendanceRecords={staffAttendanceRecords}
            formalRequests={formalRequests}
            // FIX: Pass new props
            trainingPlans={trainingPlans} 
            institutionalDocuments={institutionalDocuments}
            onUpdateDocuments={handleUpdateDocuments}
            meetingRecords={meetingRecords}
            onUpdateMeetings={handleUpdateMeetings}

            onUpdateUsers={handleUpdateUsers}
            onUpdateClasses={handleUpdateClasses}
            onUpdateSchedule={handleUpdateSchedule}
            onUpdateStudents={handleUpdateStudents}
            onUpdateNotifications={handleUpdateNotifications}
            onUpdateSupportContacts={handleUpdateSupportContacts}
            onUpdateHealthRecords={handleUpdateHealthRecords}
            onUpdateMedicalVisits={handleUpdateMedicalVisits}
            onUpdateSubjects={handleUpdateSubjects}
            onUpdateTimeSlots={handleUpdateTimeSlots}
            onUpdateRooms={handleUpdateRooms}
            onUpdateTimetables={handleUpdateTimetables}
            onUpdateViccInterventions={handleUpdateViccInterventions}
            onUpdateAttendance={handleUpdateAttendance}
            onUpdateExitPasses={handleUpdateExitPasses}
            onUpdateCitaciones={handleUpdateCitaciones}
            onUpdateAcademicCalendarEvents={handleUpdateAcademicCalendarEvents}
            onUpdateLeccionarioEntries={handleUpdateLeccionarioEntries}
            onUpdateMicroPlans={handleUpdateMicroPlans}
            onUpdateDcds={handleUpdateDcds}
            onUpdateEvaluationCriteria={handleUpdateEvaluationCriteria}
            onUpdateEvaluationIndicators={handleUpdateEvaluationIndicators}
            onUpdateGradebooks={handleUpdateGradebooks}
            onUpdateActivities={handleUpdateActivities}
            onUpdateReinforcementPlans={handleUpdateReinforcementPlans}
            onUpdateStaffAttendance={handleUpdateStaffAttendance}
            onUpdateFormalRequests={handleUpdateFormalRequests}
            // FIX: Pass new handler
            onUpdateTrainingPlans={handleUpdateTrainingPlans}
          />
        )}
      </InstitutionContext.Provider>
    </UserContext.Provider>
  );
}