
import React, { useState, useMemo, useEffect } from 'react';
import { User, Institution, Role, Class, Student, ScheduleEntry, Notification, SupportContact, HealthRecord, MedicalVisit, Subject, TimeSlot, Room, Timetable, ViccIntervention, AttendanceRecord, ExitPass, Citacion, AcademicCalendarEvent, LeccionarioEntry, MicroPlan, Dcd, EvaluationCriterion, EvaluationIndicator, Gradebook, Activity, ReinforcementPlan, StaffAttendanceRecord, PunchType, FormalRequest, TrainingPlan, InstitutionalDocument, MeetingRecord, Rubric, ConflictMediation, CronogramaEvent } from './types';
import { MOCK_USERS, MOCK_INSTITUTIONS, MOCK_CLASSES, MOCK_STUDENTS, MOCK_SCHEDULE_ENTRIES, MOCK_NOTIFICATIONS, MOCK_SUPPORT_CONTACTS, MOCK_HEALTH_RECORDS, MOCK_MEDICAL_VISITS, MOCK_SUBJECTS, MOCK_TIME_SLOTS, MOCK_ROOMS, MOCK_TIMETABLES, MOCK_VICC_INTERVENTIONS, MOCK_ATTENDANCE, MOCK_EXIT_PASSES, MOCK_CITACIONES, MOCK_ACADEMIC_CALENDAR_EVENTS, MOCK_LECCIONARIO_ENTRIES, MOCK_MICRO_PLANS, MOCK_DCDS, MOCK_EVALUATION_CRITERIA, MOCK_EVALUATION_INDICATORS, MOCK_GRADEBOOKS, MOCK_ACTIVITIES, MOCK_REINFORCEMENT_PLANS, MOCK_STAFF_ATTENDANCE, MOCK_FORMAL_REQUESTS, MOCK_TRAINING_PLANS, MOCK_INSTITUTIONAL_DOCUMENTS, MOCK_MEETING_RECORDS, MOCK_RUBRICS, MOCK_CONFLICT_MEDIATIONS, MOCK_CRONOGRAMA_EVENTS } from './constants';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import { UserContext, InstitutionContext } from './contexts/UserContext';
import SuperAdminPage from './pages/SuperAdminPage';
import PlatformAdminLayout from './components/layout/PlatformAdminLayout';
import { AMAUTA_LOGO } from './branding';
import { auth, googleProvider, db, handleFirestoreError, OperationType, saveDocument, deleteDocument, subscribeToCollection } from './lib/firebase';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';

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
  const [absenceRequests, setAbsenceRequests] = useState<any[]>([]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        const existing = users.find(u => u.email.toLowerCase() === fbUser.email!.toLowerCase());
        if (existing) {
          setCurrentUser(existing);
          if (existing.institutionId) {
            const inst = institutions.find(i => i.id === existing.institutionId);
            setCurrentInstitution(inst || null);
          }
        } else {
          // New Google authenticated user gets SuperAdmin or institution access
          const newUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            password: '',
            role: Role.SuperAdmin,
          };
          setUsers(prev => {
            if (prev.some(u => u.id === newUser.id)) return prev;
            return [newUser, ...prev];
          });
          setCurrentUser(newUser);
        }
      }
    });

    return () => unsubscribe();
  }, [users, institutions]);

  const handleLogin = (email: string, password: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
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

  const handleGoogleLogin = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      if (fbUser && fbUser.email) {
        const existing = users.find(u => u.email.toLowerCase() === fbUser.email!.toLowerCase());
        if (existing) {
          setCurrentUser(existing);
          if (existing.institutionId) {
            const inst = institutions.find(i => i.id === existing.institutionId);
            setCurrentInstitution(inst || null);
          }
        } else {
          const newUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            password: '',
            role: Role.SuperAdmin,
          };
          setUsers(prev => [newUser, ...prev]);
          setCurrentUser(newUser);
        }
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
        setCurrentInstitution(prev => prev ? sanitized.find(i => i.id === prev.id) || sanitized[0] : sanitized[0] || null);
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
    setClasses(updatedClasses);
    updatedClasses.forEach(c => saveDocument('classes', c.id, c));
  };

  const handleUpdateSchedule = (updatedSchedule: ScheduleEntry[]) => {
    setSchedule(updatedSchedule);
    updatedSchedule.forEach(s => saveDocument('schedule', s.id, s));
  };
  
  const handleUpdateStudents = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
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
    setHealthRecords(updatedRecords);
    updatedRecords.forEach(h => saveDocument('health_records', h.id, h));
  };

  const handleUpdateMedicalVisits = (updatedVisits: MedicalVisit[]) => {
    setMedicalVisits(updatedVisits);
    updatedVisits.forEach(m => saveDocument('medical_visits', m.id, m));
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
            saveDocument('staff_attendance', recordToUpdate.id, recordToUpdate);
            return updatedRecords;
        } else {
            const newRecord: StaffAttendanceRecord = {
                id: `sa-${userId}-${today}`,
                institutionId: user.institutionId!,
                userId: userId,
                date: today,
                punches: [{ time: currentTime, type: 'in', method, location, verificationStatus, distanceFromInstitution: Math.round(distance) }],
            };
            saveDocument('staff_attendance', newRecord.id, newRecord);
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
        <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
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
            onUpdateAbsenceRequests={setAbsenceRequests}

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
