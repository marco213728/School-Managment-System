
import React, { useState, useMemo, useEffect } from 'react';
import { User, Institution, Role, Class, Student, ScheduleEntry, Notification, SupportContact, HealthRecord, MedicalVisit, Subject, TimeSlot, Room, Timetable, ViccIntervention, Intervention, AttendanceRecord, ExitPass, Citacion, AcademicCalendarEvent, LeccionarioEntry, MicroPlan, Dcd, EvaluationCriterion, EvaluationIndicator, Gradebook, Activity, ReinforcementPlan, StaffAttendanceRecord, PunchType, AttendancePunch, AttendanceJustification, FormalRequest, TrainingPlan, InstitutionalDocument, MeetingRecord, Rubric, ConflictMediation, CronogramaEvent, AbsenceRequest, Appointment, ChatChannel, ChatMessage } from './types';
import { MOCK_USERS, MOCK_INSTITUTIONS, MOCK_CLASSES, MOCK_STUDENTS, MOCK_SCHEDULE_ENTRIES, MOCK_NOTIFICATIONS, MOCK_SUPPORT_CONTACTS, MOCK_HEALTH_RECORDS, MOCK_MEDICAL_VISITS, MOCK_INTERVENTIONS, MOCK_SUBJECTS, MOCK_TIME_SLOTS, MOCK_ROOMS, MOCK_TIMETABLES, MOCK_VICC_INTERVENTIONS, MOCK_ATTENDANCE, MOCK_EXIT_PASSES, MOCK_CITACIONES, MOCK_ACADEMIC_CALENDAR_EVENTS, MOCK_LECCIONARIO_ENTRIES, MOCK_MICRO_PLANS, MOCK_DCDS, MOCK_EVALUATION_CRITERIA, MOCK_EVALUATION_INDICATORS, MOCK_GRADEBOOKS, MOCK_ACTIVITIES, MOCK_REINFORCEMENT_PLANS, MOCK_STAFF_ATTENDANCE, MOCK_FORMAL_REQUESTS, MOCK_TRAINING_PLANS, MOCK_INSTITUTIONAL_DOCUMENTS, MOCK_MEETING_RECORDS, MOCK_RUBRICS, MOCK_CONFLICT_MEDIATIONS, MOCK_CRONOGRAMA_EVENTS, MOCK_APPOINTMENTS, MOCK_CHAT_CHANNELS, MOCK_CHAT_MESSAGES } from './constants';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import { UserContext, InstitutionContext } from './contexts/UserContext';
import SuperAdminPage from './pages/SuperAdminPage';
import PlatformAdminLayout from './components/layout/PlatformAdminLayout';
import UserProfileModal from './components/profile/UserProfileModal';
import { AMAUTA_LOGO } from './branding';
import { auth, googleProvider, db, handleFirestoreError, OperationType, saveDocument, deleteDocument, subscribeToCollection, updatePassword } from './lib/firebase';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

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
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(MOCK_INSTITUTIONS[0]);

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
  const [interventions, setInterventions] = useState<Intervention[]>(MOCK_INTERVENTIONS);
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
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS || []);
  const [chatChannels, setChatChannels] = useState<ChatChannel[]>(MOCK_CHAT_CHANNELS || []);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES || []);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Helper to match authenticated Firebase/Google user with their registered profile in Firestore or state
  const resolveAndSetAuthenticatedUser = async (fbUser: { uid: string; email: string | null; displayName: string | null; photoURL?: string | null }) => {
    if (!fbUser || !fbUser.email) return;
    const cleanEmail = fbUser.email.toLowerCase().trim();

    // 1. Check local users state first
    let matchedUser = users.find(u => 
      (u.authUid && u.authUid === fbUser.uid) ||
      ((u.email || '').toLowerCase().trim() === cleanEmail)
    );

    // 2. If not found in local memory, query Firestore users collection directly
    if (!matchedUser) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const dbUsers = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
        matchedUser = dbUsers.find(u => 
          (u.authUid && u.authUid === fbUser.uid) ||
          ((u.email || '').toLowerCase().trim() === cleanEmail)
        );
        if (matchedUser) {
          setUsers(dbUsers);
        }
      } catch (err) {
        console.warn("Aviso al consultar usuarios en Firestore:", err);
      }
    }

    // CHECK 1: The Google login button must NEVER point to the super user / super admin profile
    if (matchedUser && (matchedUser.role === Role.SuperAdmin || (matchedUser.role as any) === 'Super Administrador')) {
      await fbSignOut(auth);
      setCurrentUser(null);
      setCurrentInstitution(null);
      const superAdminError = "Acceso denegado: El inicio de sesión con Google no está disponible para perfiles de Superusuario / Administrador Global. Debe acceder mediante el formulario de credenciales (correo y contraseña).";
      setLoginError(superAdminError);
      throw new Error(superAdminError);
    }

    // CHECK 2: User profile must already exist AND be created in one of the colleges
    const isCollegeProfile = matchedUser && 
      matchedUser.institutionId && 
      matchedUser.institutionId !== 'platform' && 
      matchedUser.institutionId !== 'none' &&
      matchedUser.role !== Role.SuperAdmin &&
      (matchedUser.role as any) !== 'Super Administrador';

    if (!isCollegeProfile) {
      // Reject login immediately if not pre-created in one of the colleges
      await fbSignOut(auth);
      setCurrentUser(null);
      setCurrentInstitution(null);
      const notRegisteredError = `Acceso denegado: La cuenta (${fbUser.email}) no está registrada en ningún colegio o institución educativa. Para acceder al sistema, solicite previamente a la administración de su colegio que cree su perfil.`;
      setLoginError(notRegisteredError);
      throw new Error(notRegisteredError);
    }

    // Authorized college profile - Link credentials & log in
    const updatedMatchedUser: User = {
      ...matchedUser!,
      authUid: fbUser.uid,
      photoUrl: fbUser.photoURL || matchedUser!.photoUrl,
    };

    // Persist linked authUid & photoUrl in Firestore
    saveDocument('users', updatedMatchedUser.id, updatedMatchedUser).catch(e => console.warn("Error guardando vinculación de usuario:", e));

    setUsers(prev => prev.map(u => u.id === updatedMatchedUser.id ? updatedMatchedUser : u));
    setCurrentUser(updatedMatchedUser);
    setLoginError(null);

    const targetInst = (updatedMatchedUser.institutionId && institutions.find(i => i.id === updatedMatchedUser.institutionId)) 
      || institutions[0] 
      || MOCK_INSTITUTIONS[0];
    setCurrentInstitution(targetInst);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        try {
          await resolveAndSetAuthenticatedUser(fbUser);
        } catch (err: any) {
          console.warn("Autenticación con Google rechazada en onAuthStateChanged:", err?.message);
        }
      }
    });

    return () => unsubscribe();
  }, [users, institutions]);

  const handleLogin = (email: string, password: string): boolean => {
    setLoginError(null);
    const user = users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
    if (!user) return false;

    // Check credentials:
    // 1. Password matches what is stored in user object (from Firestore or default)
    // 2. Or fallback default 'password'
    // 3. Or super admin default passwords ('admin123', 'password')
    const isValid = 
      (user.password && user.password === password) ||
      password === 'password' ||
      (user.role === Role.SuperAdmin && (password === 'admin123' || password === 'password')) ||
      (!user.password && password === 'password');

    if (isValid) {
      setCurrentUser(user);
      const targetInst = (user.institutionId && institutions.find(i => i.id === user.institutionId)) || institutions[0] || MOCK_INSTITUTIONS[0];
      setCurrentInstitution(targetInst);
      return true;
    }
    return false;
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        await resolveAndSetAuthenticatedUser(cred.user);
      }
    } catch (err) {
      console.error("Error al autenticar con Google:", err);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.error("Error en Firebase signout:", e);
    }
    setCurrentUser(null);
    setCurrentInstitution(null);
    setLoginError(null);
  };

  // Listen to Firestore Real-time Collections
  useEffect(() => {
    const unsubInstitutions = subscribeToCollection<Institution>('institutions', (items) => {
      if (items.length > 0) {
        const sanitized = items.map(inst => ({
          ...inst,
          contact: {
            email: inst.contact?.email || '',
            phone: inst.contact?.phone || '',
            address: inst.contact?.address || '',
          }
        }));
        setInstitutions(sanitized);
        setCurrentInstitution(prev => prev ? sanitized.find(i => i.id === prev.id) || sanitized[0] : sanitized[0]);
      } else {
        MOCK_INSTITUTIONS.forEach(inst => saveDocument('institutions', inst.id, inst));
        setCurrentInstitution(MOCK_INSTITUTIONS[0]);
      }
    });

    const unsubUsers = subscribeToCollection<User>('users', (items) => {
      if (items.length > 0) {
        setUsers(items);
        setCurrentUser(prev => prev ? items.find(u => u.id === prev.id) || prev : null);
      }
    });

    const unsubClasses = subscribeToCollection<Class>('classes', items => items.length > 0 && setClasses(items));
    const unsubStudents = subscribeToCollection<Student>('students', items => items.length > 0 && setStudents(items));
    const unsubSubjects = subscribeToCollection<Subject>('subjects', items => items.length > 0 && setSubjects(items));
    const unsubRooms = subscribeToCollection<Room>('rooms', items => items.length > 0 && setRooms(items));
    const unsubTimetables = subscribeToCollection<Timetable>('timetables', items => items.length > 0 && setTimetables(items));
    const unsubNotifications = subscribeToCollection<Notification>('notifications', items => items.length > 0 && setNotifications(items));
    const unsubFormalRequests = subscribeToCollection<FormalRequest>('formal_requests', items => items.length > 0 && setFormalRequests(items));
    const unsubStaffAttendance = subscribeToCollection<StaffAttendanceRecord>('staff_attendance', items => items.length > 0 && setStaffAttendanceRecords(items));
    const unsubDocs = subscribeToCollection<InstitutionalDocument>('institutional_documents', items => items.length > 0 && setInstitutionalDocuments(items));
    const unsubMeetings = subscribeToCollection<MeetingRecord>('meeting_records', items => items.length > 0 && setMeetingRecords(items));
    const unsubAttendance = subscribeToCollection<AttendanceRecord>('attendance', items => items.length > 0 && setAttendanceRecords(items));
    const unsubExitPasses = subscribeToCollection<ExitPass>('exit_passes', items => items.length > 0 && setExitPasses(items));
    const unsubCitaciones = subscribeToCollection<Citacion>('citaciones', items => items.length > 0 && setCitaciones(items));
    const unsubCalendar = subscribeToCollection<AcademicCalendarEvent>('academic_calendar', items => items.length > 0 && setAcademicCalendarEvents(items));
    const unsubLeccionario = subscribeToCollection<LeccionarioEntry>('leccionario', items => items.length > 0 && setLeccionarioEntries(items));
    const unsubMicroPlans = subscribeToCollection<MicroPlan>('micro_plans', items => items.length > 0 && setMicroPlans(items));
    const unsubDcds = subscribeToCollection<Dcd>('dcds', items => items.length > 0 && setDcds(items));
    const unsubEvalCrit = subscribeToCollection<EvaluationCriterion>('evaluation_criteria', items => items.length > 0 && setEvaluationCriteria(items));
    const unsubEvalInd = subscribeToCollection<EvaluationIndicator>('evaluation_indicators', items => items.length > 0 && setEvaluationIndicators(items));
    const unsubGradebooks = subscribeToCollection<Gradebook>('gradebooks', items => items.length > 0 && setGradebooks(items));
    const unsubActivities = subscribeToCollection<Activity>('activities', items => items.length > 0 && setActivities(items));
    const unsubReinforce = subscribeToCollection<ReinforcementPlan>('reinforcement_plans', items => items.length > 0 && setReinforcementPlans(items));
    const unsubTraining = subscribeToCollection<TrainingPlan>('training_plans', items => items.length > 0 && setTrainingPlans(items));
    const unsubRubrics = subscribeToCollection<Rubric>('rubrics', items => items.length > 0 && setRubrics(items));
    const unsubConflict = subscribeToCollection<ConflictMediation>('conflict_mediations', items => items.length > 0 && setConflictMediations(items));
    const unsubCronograma = subscribeToCollection<CronogramaEvent>('cronograma_events', items => items.length > 0 && setCronogramaEvents(items));
    const unsubHealth = subscribeToCollection<HealthRecord>('health_records', items => items.length > 0 && setHealthRecords(items));
    const unsubMedicalVisits = subscribeToCollection<MedicalVisit>('medical_visits', items => items.length > 0 && setMedicalVisits(items));
    const unsubTimeSlots = subscribeToCollection<TimeSlot>('time_slots', items => items.length > 0 && setTimeSlots(items));
    const unsubSchedule = subscribeToCollection<ScheduleEntry>('schedule', items => items.length > 0 && setSchedule(items));
    const unsubSupport = subscribeToCollection<SupportContact>('support_contacts', items => items.length > 0 && setSupportContacts(items));
    const unsubVicc = subscribeToCollection<ViccIntervention>('vicc_interventions', items => items.length > 0 && setViccInterventions(items));
    const unsubInterventions = subscribeToCollection<Intervention>('interventions', items => items.length > 0 && setInterventions(items));
    const unsubAbsenceRequests = subscribeToCollection<AbsenceRequest>('absence_requests', items => items.length > 0 && setAbsenceRequests(items));
    const unsubAppointments = subscribeToCollection<Appointment>('appointments', items => items.length > 0 && setAppointments(items));
    const unsubChatChannels = subscribeToCollection<ChatChannel>('chat_channels', items => items.length > 0 && setChatChannels(items));
    const unsubChatMessages = subscribeToCollection<ChatMessage>('chat_messages', items => items.length > 0 && setChatMessages(items));

    return () => {
      unsubInstitutions();
      unsubUsers();
      unsubClasses();
      unsubStudents();
      unsubSubjects();
      unsubRooms();
      unsubTimetables();
      unsubNotifications();
      unsubFormalRequests();
      unsubStaffAttendance();
      unsubDocs();
      unsubMeetings();
      unsubAttendance();
      unsubExitPasses();
      unsubCitaciones();
      unsubCalendar();
      unsubLeccionario();
      unsubMicroPlans();
      unsubDcds();
      unsubEvalCrit();
      unsubEvalInd();
      unsubGradebooks();
      unsubActivities();
      unsubReinforce();
      unsubTraining();
      unsubRubrics();
      unsubConflict();
      unsubCronograma();
      unsubHealth();
      unsubMedicalVisits();
      unsubTimeSlots();
      unsubSchedule();
      unsubSupport();
      unsubVicc();
      unsubInterventions();
      unsubAbsenceRequests();
      unsubAppointments();
      unsubChatChannels();
      unsubChatMessages();
    };
  }, []);

  const handleSetInstitution = (updatedInstitution: Institution) => {
    setInstitutions(prev => prev.map(i => i.id === updatedInstitution.id ? updatedInstitution : i));
    setCurrentInstitution(updatedInstitution);
    saveDocument('institutions', updatedInstitution.id, updatedInstitution);
  };

  const handleUpdateInstitutions = (updatedInstitutions: Institution[]) => {
    setInstitutions(updatedInstitutions);
    updatedInstitutions.forEach(i => saveDocument('institutions', i.id, i));
  };

  const handleUpdateDocuments = (docs: InstitutionalDocument[]) => {
    setInstitutionalDocuments(docs);
    docs.forEach(d => saveDocument('institutional_documents', d.id, d));
  };

  const handleUpdateMeetings = (meetings: MeetingRecord[]) => {
    setMeetingRecords(meetings);
    meetings.forEach(m => saveDocument('meeting_records', m.id, m));
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    updatedUsers.forEach(u => saveDocument('users', u.id, u));
  };

  const handleUpdateClasses = (updatedClasses: Class[]) => {
    const activeInstId = (currentUser?.institutionId && currentUser.institutionId !== 'none') 
      ? currentUser.institutionId 
      : currentInstitution?.id;
    const currentClassIds = new Set(updatedClasses.map(c => c.id));
    classes.forEach(c => {
      // Only delete if it belongs to this active institution and is absent from updatedClasses
      if (activeInstId && c.institutionId === activeInstId && !currentClassIds.has(c.id)) {
        deleteDocument('classes', c.id);
      }
    });
    setClasses(prev => {
      const otherClasses = prev.filter(c => activeInstId ? c.institutionId !== activeInstId : false);
      return [...otherClasses, ...updatedClasses];
    });
    updatedClasses.forEach(c => saveDocument('classes', c.id, c));
  };

  const handleUpdateSchedule = (updatedSchedule: ScheduleEntry[]) => {
    const finalizedSchedule = updatedSchedule.map(s => {
      const entryId = s.id || `sch-${s.classId}-${s.day}-${s.timeSlotId}`;
      return { ...s, id: entryId };
    });

    const currentEntryIds = new Set(finalizedSchedule.map(s => s.id!));
    schedule.forEach(existing => {
      const existingId = existing.id || `sch-${existing.classId}-${existing.day}-${existing.timeSlotId}`;
      if (!currentEntryIds.has(existingId)) {
        deleteDocument('schedule', existingId);
      }
    });

    setSchedule(finalizedSchedule);
    finalizedSchedule.forEach(s => saveDocument('schedule', s.id!, s));
  };
  
  const handleUpdateStudents = (updatedStudents: Student[]) => {
    const activeInstId = (currentUser?.institutionId && currentUser.institutionId !== 'none') 
      ? currentUser.institutionId 
      : currentInstitution?.id;
    const currentStudentIds = new Set(updatedStudents.map(s => s.id));
    students.forEach(s => {
      // Only delete if it belongs to this active institution and is absent from updatedStudents
      if (activeInstId && s.institutionId === activeInstId && !currentStudentIds.has(s.id)) {
        deleteDocument('students', s.id);
      }
    });
    setStudents(prev => {
      const otherStudents = prev.filter(s => activeInstId ? s.institutionId !== activeInstId : false);
      return [...otherStudents, ...updatedStudents];
    });
    updatedStudents.forEach(s => saveDocument('students', s.id, s));
  };

  const handleUpdateNotifications = (updatedNotifications: Notification[]) => {
    setNotifications(updatedNotifications);
    updatedNotifications.forEach(n => saveDocument('notifications', n.id, n));
  };

  const handleUpdateSupportContacts = (updatedContacts: SupportContact[]) => {
    setSupportContacts(updatedContacts);
    updatedContacts.forEach(c => saveDocument('support_contacts', c.id, c));
  };

  const handleUpdateHealthRecords = (updatedRecords: HealthRecord[]) => {
    const currentIds = new Set(updatedRecords.map(r => r.id));
    healthRecords.forEach(r => {
      if (!currentIds.has(r.id)) {
        deleteDocument('health_records', r.id);
      }
    });
    setHealthRecords(updatedRecords);
    updatedRecords.forEach(h => saveDocument('health_records', h.id, h));
  };

  const handleUpdateMedicalVisits = (updatedVisits: MedicalVisit[]) => {
    const currentIds = new Set(updatedVisits.map(v => v.id));
    medicalVisits.forEach(v => {
      if (!currentIds.has(v.id)) {
        deleteDocument('medical_visits', v.id);
      }
    });
    setMedicalVisits(updatedVisits);
    updatedVisits.forEach(m => saveDocument('medical_visits', m.id, m));
  };

  const handleUpdateInterventions = (updatedInterventions: Intervention[]) => {
    const currentIds = new Set(updatedInterventions.map(i => i.id));
    interventions.forEach(i => {
      if (!currentIds.has(i.id)) {
        deleteDocument('interventions', i.id);
      }
    });
    setInterventions(updatedInterventions);
    updatedInterventions.forEach(i => saveDocument('interventions', i.id, i));
  };
  
  const handleUpdateSubjects = (updatedSubjects: Subject[]) => {
    setSubjects(updatedSubjects);
    updatedSubjects.forEach(s => saveDocument('subjects', s.id, s));
  };

  const handleUpdateTimeSlots = (updatedTimeSlots: TimeSlot[]) => {
    setTimeSlots(updatedTimeSlots);
    updatedTimeSlots.forEach(ts => saveDocument('time_slots', ts.id, ts));
  };
  
  const handleUpdateRooms = (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    updatedRooms.forEach(r => saveDocument('rooms', r.id, r));
  };

  const handleUpdateTimetables = (updatedTimetables: Timetable[]) => {
    setTimetables(updatedTimetables);
    updatedTimetables.forEach(t => saveDocument('timetables', t.id, t));
  };

  const handleUpdateViccInterventions = (updatedInterventions: ViccIntervention[]) => {
    setViccInterventions(updatedInterventions);
    updatedInterventions.forEach(v => saveDocument('vicc_interventions', v.id, v));
  };

  const handleUpdateAttendance = (updatedRecords: AttendanceRecord[]) => {
    setAttendanceRecords(updatedRecords);
    updatedRecords.forEach(a => saveDocument('attendance', a.id, a));
  };

  const handleUpdateExitPasses = (updatedPasses: ExitPass[]) => {
    setExitPasses(updatedPasses);
    updatedPasses.forEach(p => saveDocument('exit_passes', p.id, p));
  };

  const handleUpdateCitaciones = (updatedCitaciones: Citacion[]) => {
    setCitaciones(updatedCitaciones);
    updatedCitaciones.forEach(c => saveDocument('citaciones', c.id, c));
  };

  const handleUpdateAcademicCalendarEvents = (updatedEvents: AcademicCalendarEvent[]) => {
    setAcademicCalendarEvents(updatedEvents);
    updatedEvents.forEach(e => saveDocument('academic_calendar', e.id, e));
  };

  const handleUpdateLeccionarioEntries = (updatedEntries: LeccionarioEntry[]) => {
    setLeccionarioEntries(updatedEntries);
    updatedEntries.forEach(l => saveDocument('leccionario', l.id, l));
  };

  const handleUpdateMicroPlans = (updatedPlans: MicroPlan[]) => {
    setMicroPlans(updatedPlans);
    updatedPlans.forEach(m => saveDocument('micro_plans', m.id, m));
  };

  const handleUpdateDcds = (newDcds: Dcd[]) => {
    setDcds(newDcds);
    newDcds.forEach(d => saveDocument('dcds', d.id, d));
  };

  const handleUpdateEvaluationCriteria = (newCriteria: EvaluationCriterion[]) => {
    setEvaluationCriteria(newCriteria);
    newCriteria.forEach(c => saveDocument('evaluation_criteria', c.id, c));
  };

  const handleUpdateEvaluationIndicators = (newIndicators: EvaluationIndicator[]) => {
    setEvaluationIndicators(newIndicators);
    newIndicators.forEach(i => saveDocument('evaluation_indicators', i.id, i));
  };

  const handleUpdateGradebooks = (updatedGradebooks: Gradebook[]) => {
    setGradebooks(updatedGradebooks);
    updatedGradebooks.forEach(g => saveDocument('gradebooks', g.id, g));
  };

  const handleUpdateActivities = (updatedActivities: Activity[]) => {
    setActivities(updatedActivities);
    updatedActivities.forEach(a => saveDocument('activities', a.id, a));
  };

  const handleUpdateReinforcementPlans = (updatedPlans: ReinforcementPlan[]) => {
    setReinforcementPlans(updatedPlans);
    updatedPlans.forEach(r => saveDocument('reinforcement_plans', r.id, r));
  };
  
  const handleUpdateFormalRequests = (updatedRequests: FormalRequest[]) => {
    setFormalRequests(updatedRequests);
    updatedRequests.forEach(r => saveDocument('formal_requests', r.id, r));
  };

  const handleUpdateTrainingPlans = (updatedPlans: TrainingPlan[]) => {
    setTrainingPlans(updatedPlans);
    updatedPlans.forEach(t => saveDocument('training_plans', t.id, t));
  };

  const handleUpdateRubrics = (newRubrics: Rubric[]) => {
    setRubrics(newRubrics);
    newRubrics.forEach(r => saveDocument('rubrics', r.id, r));
  };

  const handleUpdateConflictMediations = (conflicts: ConflictMediation[]) => {
    setConflictMediations(conflicts);
    conflicts.forEach(c => saveDocument('conflict_mediations', c.id, c));
  };

  const handleUpdateCronogramaEvents = (events: CronogramaEvent[]) => {
    setCronogramaEvents(events);
    events.forEach(e => saveDocument('cronograma_events', e.id, e));
  };

  const handleUpdateAbsenceRequests = (updatedRequests: AbsenceRequest[]) => {
    setAbsenceRequests(updatedRequests);
    updatedRequests.forEach(r => saveDocument('absence_requests', r.id, r));
  };

  const handleUpdateAppointments = (updatedAppts: Appointment[]) => {
    setAppointments(updatedAppts);
    updatedAppts.forEach(a => saveDocument('appointments', a.id, a));
  };

  const handleUpdateChatChannels = (updatedChannels: ChatChannel[]) => {
    setChatChannels(updatedChannels);
    updatedChannels.forEach(c => saveDocument('chat_channels', c.id, c));
  };

  const handleSendMessage = (msg: ChatMessage) => {
    setChatMessages(prev => [...prev, msg]);
    saveDocument('chat_messages', msg.id, msg);
  };
  
  const handleUpdateStaffAttendance = (
    userId: string, 
    method: 'Biometric' | 'Manual' | 'Facial', 
    location?: { latitude: number; longitude: number; },
    justification?: AttendanceJustification,
    photoProof?: string,
    facialConfidence?: number,
    facialMatch?: boolean,
    flagReason?: string
  ) => {
    // --- GEOFENCE & VERIFICATION LOGIC START ---
    let verificationStatus: 'Success' | 'Failed' | 'Pending' | 'Flagged' = 'Pending';
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
            // Out of range: if justified, mark as Flagged, otherwise Failed
            verificationStatus = justification ? 'Flagged' : 'Failed';
            
            // ALERT GENERATION FOR ADMINS (GEOFENCE)
            const targetAdmins = users.filter(u => 
                (u.institutionId === currentInstitution.id || u.role === Role.SuperAdmin) && 
                (u.role === Role.InstitutionAdmin || u.role === Role.InspectorGeneral || u.role === Role.Rector || u.role === Role.SuperAdmin)
            );
            
            const justificationText = justification 
                ? ` Justificación: [${justification.reason}] "${justification.note}"`
                : ' Sin justificación proporcionada.';

            const alertRecipientIds = targetAdmins.length > 0 ? targetAdmins.map(a => a.id) : [currentUser?.id || 'admin'];

            const newAlerts: Notification[] = alertRecipientIds.map(recipientId => ({
                id: `alert-geo-${Date.now()}-${recipientId}`,
                institutionId: currentInstitution.id,
                userId: recipientId,
                title: 'Alerta de Marcaje: Fuera de Rango Institucional',
                message: `El usuario ${user?.name || 'Personal'} ha registrado asistencia a ${Math.round(distance)}m de la institución (Radio permitido: ${currentInstitution.geofenceConfig?.radius}m).${justificationText}`,
                date: new Date().toISOString(),
                read: false
            }));
            
            setNotifications(prev => [...prev, ...newAlerts]);
            newAlerts.forEach(a => saveDocument('notifications', a.id, a));
        }
    } else {
        // Fallback if no geofence configured
        verificationStatus = 'Success'; 
    }

    // Check facial match inconsistency
    if (method === 'Facial' && facialMatch === false) {
        verificationStatus = 'Flagged';
        const targetAdmins = users.filter(u => 
            (u.institutionId === currentInstitution.id || u.role === Role.SuperAdmin) && 
            (u.role === Role.InstitutionAdmin || u.role === Role.InspectorGeneral || u.role === Role.Rector || u.role === Role.SuperAdmin)
        );
        const alertRecipientIds = targetAdmins.length > 0 ? targetAdmins.map(a => a.id) : [currentUser?.id || 'admin'];
        const facialAlerts: Notification[] = alertRecipientIds.map(recipientId => ({
            id: `alert-face-${Date.now()}-${recipientId}`,
            institutionId: currentInstitution.id,
            userId: recipientId,
            title: '🚨 Alerta: Inconsistencia Facial en Marcaje',
            message: `El colaborador ${user?.name || 'Personal'} registró marcaje pero el rostro capturado en cámara difiere de su foto oficial (${facialConfidence || 0}% de similitud). Se adjuntó foto al reporte de asistencia.`,
            date: new Date().toISOString(),
            read: false
        }));
        setNotifications(prev => [...prev, ...facialAlerts]);
        facialAlerts.forEach(a => saveDocument('notifications', a.id, a));
    }
    // --- VERIFICATION LOGIC END ---

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
                        // Already completed all punches
                        return prev;
                }
            }

            const newPunch: AttendancePunch = {
                time: currentTime,
                type: newPunchType,
                method,
                location,
                verificationStatus,
                distanceFromInstitution: Math.round(distance),
                justification,
                photoProof,
                facialConfidence,
                facialMatch,
                flagReason
            };

            recordToUpdate.punches = [...recordToUpdate.punches, newPunch];
            updatedRecords[existingRecordIndex] = recordToUpdate;
            saveDocument('staff_attendance', recordToUpdate.id, recordToUpdate);
            return updatedRecords;
        } else {
            const newPunch: AttendancePunch = {
                time: currentTime,
                type: 'in',
                method,
                location,
                verificationStatus,
                distanceFromInstitution: Math.round(distance),
                justification,
                photoProof,
                facialConfidence,
                facialMatch,
                flagReason
            };

            const newRecord: StaffAttendanceRecord = {
                id: `sa-${userId}-${today}`,
                institutionId: user.institutionId || currentInstitution?.id || 'inst-1',
                userId: userId,
                date: today,
                punches: [newPunch]
            };

            saveDocument('staff_attendance', newRecord.id, newRecord);
            return [...prev, newRecord];
        }
    });
  };


  const handleUpdateCurrentUser = async (updatedData: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    const updatedUser: User = {
      ...currentUser,
      ...updatedData,
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    try {
      await saveDocument('users', updatedUser.id, updatedUser);
      return true;
    } catch (err) {
      console.error("Error al guardar perfil de usuario:", err);
      return false;
    }
  };

  const handleUpdateUserPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No hay usuario autenticado' };

    // 1. If authenticated in Firebase Auth, update in cloud
    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch (err: any) {
        console.warn("Aviso al actualizar clave en Firebase Auth:", err);
        if (err?.code === 'auth/requires-recent-login') {
          return {
            success: false,
            error: 'Por seguridad de Firebase, debes volver a iniciar sesión antes de modificar tu contraseña en la nube.',
          };
        }
      }
    }

    // 2. Always persist password to Firestore user record
    const updatedUser: User = {
      ...currentUser,
      password: newPassword,
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    try {
      await saveDocument('users', updatedUser.id, updatedUser);
      return { success: true };
    } catch (err: any) {
      console.error("Error al guardar nueva contraseña:", err);
      return { success: false, error: err?.message || 'Error al guardar la contraseña.' };
    }
  };

  const userContextValue = useMemo(() => ({
    user: currentUser,
    logout: handleLogout,
    openProfileModal: () => setIsProfileModalOpen(true),
    updateCurrentUser: handleUpdateCurrentUser,
    updateUserPassword: handleUpdateUserPassword,
  }), [currentUser, users]);

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
        <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} initialError={loginError} />
      </InstitutionContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={userContextValue}>
      <InstitutionContext.Provider value={institutionContextValue}>
        {currentUser.role === Role.SuperAdmin ? (
          <PlatformAdminLayout>
            <SuperAdminPage 
                institutions={institutions} 
                onUpdateInstitutions={handleUpdateInstitutions}
                users={users}
                classes={classes}
                students={students}
                dcds={dcds}
                evaluationCriteria={evaluationCriteria}
                evaluationIndicators={evaluationIndicators}
                subjects={subjects}
                onUpdateDcds={handleUpdateDcds}
                onUpdateEvaluationCriteria={handleUpdateEvaluationCriteria}
                onUpdateEvaluationIndicators={handleUpdateEvaluationIndicators}
            />
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
            interventions={interventions}
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
            absenceRequests={absenceRequests}
            onUpdateAbsenceRequests={handleUpdateAbsenceRequests}

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
            onUpdateInterventions={handleUpdateInterventions}
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
            appointments={appointments}
            onUpdateAppointments={handleUpdateAppointments}
            chatChannels={chatChannels}
            onUpdateChatChannels={handleUpdateChatChannels}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        )}
        <UserProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      </InstitutionContext.Provider>
    </UserContext.Provider>
  );
}
