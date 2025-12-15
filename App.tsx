
import React, { useState, useMemo, useEffect } from 'react';
import { User, Institution, Role, Class, Student, ScheduleEntry, Notification, SupportContact, HealthRecord, MedicalVisit, Subject, TimeSlot, Room, Timetable, ViccIntervention, AttendanceRecord, ExitPass, Citacion, AcademicCalendarEvent, LeccionarioEntry, MicroPlan, Dcd, EvaluationCriterion, EvaluationIndicator, Gradebook, Activity, ReinforcementPlan, StaffAttendanceRecord, PunchType, FormalRequest, TrainingPlan, InstitutionalDocument, MeetingRecord, Rubric, ConflictMediation, CronogramaEvent } from './types';
import { MOCK_USERS, MOCK_INSTITUTIONS, MOCK_CLASSES, MOCK_STUDENTS, MOCK_SCHEDULE_ENTRIES, MOCK_NOTIFICATIONS, MOCK_SUPPORT_CONTACTS, MOCK_HEALTH_RECORDS, MOCK_MEDICAL_VISITS, MOCK_SUBJECTS, MOCK_TIME_SLOTS, MOCK_ROOMS, MOCK_TIMETABLES, MOCK_VICC_INTERVENTIONS, MOCK_ATTENDANCE, MOCK_EXIT_PASSES, MOCK_CITACIONES, MOCK_ACADEMIC_CALENDAR_EVENTS, MOCK_LECCIONARIO_ENTRIES, MOCK_MICRO_PLANS, MOCK_DCDS, MOCK_EVALUATION_CRITERIA, MOCK_EVALUATION_INDICATORS, MOCK_GRADEBOOKS, MOCK_ACTIVITIES, MOCK_REINFORCEMENT_PLANS, MOCK_STAFF_ATTENDANCE, MOCK_FORMAL_REQUESTS, MOCK_TRAINING_PLANS, MOCK_INSTITUTIONAL_DOCUMENTS, MOCK_MEETING_RECORDS, MOCK_RUBRICS, MOCK_CONFLICT_MEDIATIONS, MOCK_CRONOGRAMA_EVENTS } from './constants';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import { UserContext, InstitutionContext } from './contexts/UserContext';
import SuperAdminPage from './pages/SuperAdminPage';
import PlatformAdminLayout from './components/layout/PlatformAdminLayout';
import { AMAUTA_LOGO } from './branding';

// Helper for Geofencing
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d * 1000; // Distance in meters
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);

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
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>(MOCK_TRAINING_PLANS || []);
  const [rubrics, setRubrics] = useState<Rubric[]>(MOCK_RUBRICS || []);
  const [conflictMediations, setConflictMediations] = useState<ConflictMediation[]>(MOCK_CONFLICT_MEDIATIONS || []);
  const [cronogramaEvents, setCronogramaEvents] = useState<CronogramaEvent[]>(MOCK_CRONOGRAMA_EVENTS || []);

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
      return true;
    }
    return false;
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
  const handleUpdateDcds = (newDcds: Dcd[]) => setDcds(newDcds); 
  const handleUpdateEvaluationCriteria = (newCriteria: EvaluationCriterion[]) => setEvaluationCriteria(newCriteria);
  const handleUpdateEvaluationIndicators = (newIndicators: EvaluationIndicator[]) => setEvaluationIndicators(newIndicators);
  const handleUpdateGradebooks = (updatedGradebooks: Gradebook[]) => setGradebooks(updatedGradebooks);
  const handleUpdateActivities = (updatedActivities: Activity[]) => setActivities(updatedActivities);
  const handleUpdateReinforcementPlans = (updatedPlans: ReinforcementPlan[]) => setReinforcementPlans(updatedPlans);
  const handleUpdateFormalRequests = (updatedRequests: FormalRequest[]) => setFormalRequests(updatedRequests);
  const handleUpdateTrainingPlans = (updatedPlans: TrainingPlan[]) => setTrainingPlans(updatedPlans);
  const handleUpdateRubrics = (newRubrics: Rubric[]) => setRubrics(newRubrics);
  const handleUpdateConflictMediations = (conflicts: ConflictMediation[]) => setConflictMediations(conflicts);
  const handleUpdateCronogramaEvents = (events: CronogramaEvent[]) => setCronogramaEvents(events);
  
  const handleUpdateStaffAttendance = (userId: string, method: 'Biometric' | 'Manual' | 'Facial', location?: { latitude: number; longitude: number; }) => {
    
    // --- GEOFENCE LOGIC START ---
    let verificationStatus: 'Success' | 'Failed' | 'Pending' = 'Pending';
    let distance = 0;
    const user = users.find(u => u.id === userId);

    if (currentInstitution?.geofenceConfig && currentInstitution.geofenceConfig.latitude && location) {
        distance = getDistanceFromLatLonInM(
            location.latitude, 
            location.longitude, 
            currentInstitution.geofenceConfig.latitude, 
            currentInstitution.geofenceConfig.longitude
        );

        if (distance <= currentInstitution.geofenceConfig.radius) {
            verificationStatus = 'Success';
        } else {
            verificationStatus = 'Failed';
            
            // ALERT GENERATION
            const adminUsers = users.filter(u => 
                u.institutionId === currentInstitution.id && 
                (u.role === Role.InstitutionAdmin || u.role === Role.InspectorGeneral || u.role === Role.Rector)
            );
            
            const newAlerts: Notification[] = adminUsers.map(admin => ({
                id: `alert-geo-${Date.now()}-${admin.id}`,
                institutionId: currentInstitution.id,
                userId: admin.id,
                title: 'Alerta de Seguridad: Asistencia Fuera de Rango',
                message: `El usuario ${user?.name} ha registrado asistencia a ${Math.round(distance)}m de la institución (Radio permitido: ${currentInstitution.geofenceConfig?.radius}m).`,
                date: new Date().toISOString(),
                read: false
            }));
            
            setNotifications(prev => [...prev, ...newAlerts]);
        }
    } else {
        // Fallback if no config
        verificationStatus = 'Success'; 
    }
    // --- GEOFENCE LOGIC END ---

    setStaffAttendanceRecords(prev => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 8);
        
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
                { time: currentTime, type: newPunchType, method, location, verificationStatus, distanceFromInstitution: Math.round(distance) },
            ];
            updatedRecords[existingRecordIndex] = recordToUpdate;
            return updatedRecords;
        } else {
            const newRecord: StaffAttendanceRecord = {
                id: `sa-${userId}-${today}`,
                institutionId: user.institutionId!,
                userId: userId,
                date: today,
                punches: [{ time: currentTime, type: 'in', method, location, verificationStatus, distanceFromInstitution: Math.round(distance) }],
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
            trainingPlans={trainingPlans} 
            institutionalDocuments={institutionalDocuments}
            onUpdateDocuments={handleUpdateDocuments}
            meetingRecords={meetingRecords}
            onUpdateMeetings={handleUpdateMeetings}
            rubrics={rubrics}
            onUpdateRubrics={handleUpdateRubrics}
            conflictMediations={conflictMediations}
            onUpdateConflictMediations={handleUpdateConflictMediations}
            cronogramaEvents={cronogramaEvents}
            onUpdateCronogramaEvents={handleUpdateCronogramaEvents}

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
            onUpdateTrainingPlans={handleUpdateTrainingPlans}
          />
        )}
      </InstitutionContext.Provider>
    </UserContext.Provider>
  );
}
