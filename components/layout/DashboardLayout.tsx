
import React, { useState, useContext, useMemo } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardPage from '../../pages/DashboardPage';
import AttendancePage from '../../pages/AttendancePage';
import ActivitiesPage from '../../pages/ActivitiesPage';
import ReportsPage from '../../pages/ReportsPage';
import ManagePage from '../../pages/ManagePage';
import HRISDashboard from '../management/HRISDashboard';
import DecePage from '../../pages/DecePage';
import HealthPage from '../../pages/HealthPage';
// FIX: Added Role to imports to resolve "Cannot find name 'Role'" error
import { Role, User, Class, Student, ScheduleEntry, Notification, SupportContact, HealthRecord, MedicalVisit, Subject, TimeSlot, Room, Timetable, ViccIntervention, Intervention, AttendanceRecord, ExitPass, Citacion, AcademicCalendarEvent, LeccionarioEntry, MicroPlan, Dcd, EvaluationCriterion, EvaluationIndicator, Gradebook, Activity, ReinforcementPlan, StaffAttendanceRecord, FormalRequest, TrainingPlan, InstitutionalDocument, MeetingRecord, Rubric, ConflictMediation, CronogramaEvent } from '../../types';
import StudentManagementPage from '../../pages/StudentManagementPage';
import CommunicationsPage from '../../pages/CommunicationsPage';
import SchedulePage from '../../pages/SchedulePage';
import InspectionPage from '../../pages/InspectionPage';
import CitacionesPage from '../../pages/CitacionesPage';
import LeccionarioPage from '../../pages/LeccionarioPage';
import CurricularPlanningPage from '../../pages/CurricularPlanningPage';
import CurriculumRepositoryPage from '../../pages/CurriculumRepositoryPage';
import GradebookPage from '../../pages/GradebookPage';
import VicerrectoradoPage from '../../pages/VicerrectoradoPage';
import TeacherReinforcementPage from '../../pages/TeacherReinforcementPage';
import StaffAttendanceModal from '../staff/StaffAttendanceModal';
import TeacherTrainingPage from '../../pages/TeacherTrainingPage'; 
import ResourceRepositoryPage from '../../pages/ResourceRepositoryPage';
import JuntaManager from '../vicerrectorado/JuntaManager'; 
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { MOCK_RUBRICS } from '../../constants'; 

type Page = 'dashboard' | 'attendance' | 'activities' | 'reports' | 'manage' | 'dece' | 'health' | 'students' | 'communications' | 'schedule' | 'inspection' | 'citaciones' | 'leccionario' | 'curricular_planning' | 'curriculum_repository' | 'gradebook' | 'vicerrector_dashboard' | 'reinforcement' | 'teacher_training' | 'resource_bank' | 'juntas' | 'hris'; 

interface DashboardLayoutProps {
  absenceRequests: any[];
  onUpdateAbsenceRequests: (r: any[]) => void;
  users: User[];
  classes: Class[];
  students: Student[];
  schedule: ScheduleEntry[];
  notifications: Notification[];
  supportContacts: SupportContact[];
  healthRecords: HealthRecord[];
  medicalVisits: MedicalVisit[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  rooms: Room[];
  timetables: Timetable[];
  viccInterventions: ViccIntervention[];
  interventions?: Intervention[];
  attendanceRecords: AttendanceRecord[];
  exitPasses: ExitPass[];
  citaciones: Citacion[];
  academicCalendarEvents: AcademicCalendarEvent[];
  leccionarioEntries: LeccionarioEntry[];
  microPlans: MicroPlan[];
  dcds: Dcd[];
  evaluationCriteria: EvaluationCriterion[];
  evaluationIndicators: EvaluationIndicator[];
  gradebooks: Gradebook[];
  activities: Activity[];
  reinforcementPlans: ReinforcementPlan[];
  staffAttendanceRecords: StaffAttendanceRecord[];
  formalRequests: FormalRequest[];
  trainingPlans: TrainingPlan[];
  institutionalDocuments: InstitutionalDocument[];
  meetingRecords: MeetingRecord[];
  rubrics?: Rubric[]; 
  conflictMediations?: ConflictMediation[];
  cronogramaEvents?: CronogramaEvent[];
  
  onUpdateUsers: (users: User[]) => void;
  onUpdateClasses: (classes: Class[]) => void;
  onUpdateSchedule: (schedule: ScheduleEntry[]) => void;
  onUpdateStudents: (students: Student[]) => void;
  onUpdateNotifications: (notifications: Notification[]) => void;
  onUpdateSupportContacts: (contacts: SupportContact[]) => void;
  onUpdateHealthRecords: (records: HealthRecord[]) => void;
  onUpdateMedicalVisits: (visits: MedicalVisit[]) => void;
  onUpdateSubjects: (subjects: Subject[]) => void;
  onUpdateTimeSlots: (timeSlots: TimeSlot[]) => void;
  onUpdateRooms: (rooms: Room[]) => void;
  onUpdateTimetables: (timetables: Timetable[]) => void; 
  onUpdateViccInterventions: (interventions: ViccIntervention[]) => void;
  onUpdateInterventions?: (interventions: Intervention[]) => void;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onUpdateExitPasses: (passes: ExitPass[]) => void;
  onUpdateCitaciones: (citaciones: Citacion[]) => void;
  onUpdateAcademicCalendarEvents: (events: AcademicCalendarEvent[]) => void;
  onUpdateLeccionarioEntries: (entries: LeccionarioEntry[]) => void;
  onUpdateMicroPlans: (plans: MicroPlan[]) => void;
  onUpdateDcds: (dcds: Dcd[]) => void;
  onUpdateEvaluationCriteria: (criteria: EvaluationCriterion[]) => void;
  onUpdateEvaluationIndicators: (indicators: EvaluationIndicator[]) => void;
  onUpdateGradebooks: (gradebooks: Gradebook[]) => void;
  onUpdateActivities: (activities: Activity[]) => void;
  onUpdateReinforcementPlans: (plans: ReinforcementPlan[]) => void;
  onUpdateStaffAttendance: (userId: string, method: 'Biometric' | 'Manual' | 'Facial', location?: { latitude: number; longitude: number; }) => void;
  onUpdateFormalRequests: (requests: FormalRequest[]) => void;
  onUpdateTrainingPlans: (plans: TrainingPlan[]) => void;
  onUpdateDocuments: (docs: InstitutionalDocument[]) => void;
  onUpdateMeetings: (meetings: MeetingRecord[]) => void;
  onUpdateRubrics?: (rubrics: Rubric[]) => void; 
  onUpdateConflictMediations?: (conflicts: ConflictMediation[]) => void;
  onUpdateCronogramaEvents?: (events: CronogramaEvent[]) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => {
  const { user } = useContext(UserContext);
  const { institution } = useContext(InstitutionContext);
  const effectiveInstitutionId = useMemo(() => {
    if (user?.institutionId && user.institutionId !== 'none') {
      return user.institutionId;
    }
    if (institution?.id && institution.id !== 'platform') {
      return institution.id;
    }
    return props.classes[0]?.institutionId || 'inst-1790363544282-swirjer';
  }, [user, institution, props.classes]);

  const {
    users,
    classes,
    students,
    schedule,
    subjects,
    timeSlots,
    leccionarioEntries, 
    onUpdateLeccionarioEntries,
    microPlans,
    onUpdateMicroPlans,
    dcds,
    reinforcementPlans,
    onUpdateReinforcementPlans,
    staffAttendanceRecords,
    onUpdateStaffAttendance,
    formalRequests,
    onUpdateFormalRequests,
    trainingPlans,
    onUpdateTrainingPlans,
    institutionalDocuments,
    onUpdateDocuments,
    meetingRecords,
    onUpdateMeetings,
    conflictMediations,
    onUpdateConflictMediations,
    gradebooks,
    cronogramaEvents,
    onUpdateCronogramaEvents,
    ...restProps
  } = props;

  const institutionTimetables = useMemo(() => {
    const all = props.timetables || [];
    if (!effectiveInstitutionId) return [];
    const direct = all.filter(t => t.institutionId === effectiveInstitutionId);
    if (direct.length > 0) return direct;
    return all.filter(t => !t.institutionId);
  }, [props.timetables, effectiveInstitutionId]);

  const institutionClasses = useMemo(() => {
    const all = props.classes || [];
    if (!effectiveInstitutionId) return [];
    return all.filter(c => c.institutionId === effectiveInstitutionId);
  }, [props.classes, effectiveInstitutionId]);

  const institutionStudents = useMemo(() => {
    const all = props.students || [];
    if (!effectiveInstitutionId) return [];
    return all.filter(s => s.institutionId === effectiveInstitutionId);
  }, [props.students, effectiveInstitutionId]);

  const institutionTimetableIds = useMemo(() => {
    return new Set(institutionTimetables.map(t => t.id));
  }, [institutionTimetables]);

  const institutionTimeSlots = useMemo(() => {
    return (timeSlots || []).filter(ts => {
      // Reject if explicitly assigned to another institution
      if (effectiveInstitutionId && ts.institutionId && ts.institutionId !== effectiveInstitutionId) {
        return false;
      }
      // Accept if belonging to one of this institution's timetables
      if (ts.timetableId && institutionTimetableIds.has(ts.timetableId)) {
        return true;
      }
      // Accept if explicitly belongs to this institution
      if (effectiveInstitutionId && ts.institutionId === effectiveInstitutionId) {
        return true;
      }
      // Only fallback to slots without institution if no institutional timetables exist
      return (!effectiveInstitutionId || !ts.institutionId) && institutionTimetableIds.size === 0;
    });
  }, [timeSlots, effectiveInstitutionId, institutionTimetableIds]);

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Fallback for rubrics if not passed from App
  const rubrics = props.rubrics || MOCK_RUBRICS;
  const handleUpdateRubrics = props.onUpdateRubrics || ((r) => console.log('Mock update rubrics:', r));

  const renderContent = () => {
    switch (currentPage) {
        case 'dashboard':
          return <DashboardPage absenceRequests={props.absenceRequests} onUpdateAbsenceRequests={props.onUpdateAbsenceRequests} 
              {...restProps} 
              schedule={schedule} 
              classes={institutionClasses} 
              subjects={subjects} 
              timeSlots={institutionTimeSlots} 
              rooms={restProps.rooms} 
              timetables={institutionTimetables} 
              users={users} 
              onNavigate={setCurrentPage}
              students={institutionStudents}
              formalRequests={formalRequests}
              cronogramaEvents={cronogramaEvents || []}
              onUpdateCronogramaEvents={onUpdateCronogramaEvents || (() => {})}
          />;
        case 'hris':
          return <HRISDashboard users={users} staffAttendanceRecords={staffAttendanceRecords} />;
        case 'manage':
          return <ManagePage 
            {...restProps}
            allUsers={users}
            allClasses={props.classes}
            allStudents={props.students}
            schedule={schedule}
            supportContacts={restProps.supportContacts}
            subjects={subjects}
            timeSlots={institutionTimeSlots}
            rooms={restProps.rooms}
            timetables={institutionTimetables}
            academicCalendarEvents={restProps.academicCalendarEvents}
            onUpdateUsers={restProps.onUpdateUsers}
            onUpdateClasses={restProps.onUpdateClasses}
            onUpdateSchedule={restProps.onUpdateSchedule}
            onUpdateStudents={restProps.onUpdateStudents}
            onUpdateSupportContacts={restProps.onUpdateSupportContacts}
            onUpdateSubjects={restProps.onUpdateSubjects}
            onUpdateTimeSlots={restProps.onUpdateTimeSlots}
            onUpdateRooms={restProps.onUpdateRooms}
            onUpdateTimetables={restProps.onUpdateTimetables}
            onUpdateAcademicCalendarEvents={restProps.onUpdateAcademicCalendarEvents}
            staffAttendanceRecords={staffAttendanceRecords}
            onUpdateStaffAttendance={onUpdateStaffAttendance}
          />;
        case 'reinforcement':
            return <TeacherReinforcementPage
                students={institutionStudents}
                classes={institutionClasses}
                subjects={subjects}
                users={users}
                reinforcementPlans={reinforcementPlans}
                onUpdateReinforcementPlans={onUpdateReinforcementPlans}
            />;
        case 'teacher_training':
             return <TeacherTrainingPage
                trainingPlans={trainingPlans}
                onUpdateTrainingPlans={onUpdateTrainingPlans}
             />;
        case 'vicerrector_dashboard':
            return <VicerrectoradoPage
                microPlans={microPlans}
                viccInterventions={restProps.viccInterventions}
                gradebooks={gradebooks}
                users={users}
                subjects={subjects}
                classes={institutionClasses}
                students={institutionStudents}
                onNavigate={setCurrentPage}
                notifications={restProps.notifications}
                onUpdateNotifications={restProps.onUpdateNotifications}
                reinforcementPlans={reinforcementPlans}
                onUpdateReinforcementPlans={onUpdateReinforcementPlans}
                trainingPlans={trainingPlans}
                onUpdateTrainingPlans={onUpdateTrainingPlans}
                institutionalDocuments={institutionalDocuments}
                onUpdateDocuments={onUpdateDocuments}
                meetingRecords={meetingRecords}
                onUpdateMeetings={onUpdateMeetings}
            />;
        case 'communications':
            return <CommunicationsPage
                {...restProps}
                users={users}
                students={institutionStudents}
                classes={institutionClasses}
                allNotifications={restProps.notifications}
                onUpdateNotifications={restProps.onUpdateNotifications}
                formalRequests={formalRequests}
                onUpdateFormalRequests={onUpdateFormalRequests}
            />;
        case 'resource_bank':
            return <ResourceRepositoryPage 
                dcds={dcds}
                rubrics={rubrics}
                onUpdateRubrics={handleUpdateRubrics}
                subjects={subjects}
                microPlans={microPlans} 
                classes={institutionClasses} 
            />;
        case 'curriculum_repository':
            return <CurriculumRepositoryPage 
                dcds={dcds} 
                onUpdateDcds={restProps.onUpdateDcds} 
                subjects={subjects} 
                evaluationCriteria={restProps.evaluationCriteria} 
                onUpdateEvaluationCriteria={restProps.onUpdateEvaluationCriteria} 
                evaluationIndicators={restProps.evaluationIndicators} 
                onUpdateEvaluationIndicators={restProps.onUpdateEvaluationIndicators}
                readOnly={![Role.SuperAdmin, Role.InstitutionAdmin, Role.Rector, Role.Vicerrector].includes(user?.role as any)}
            />;
        case 'juntas':
            return (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Juntas de Curso y Entrega de Informes</h2>
                    <JuntaManager 
                        classes={institutionClasses}
                        subjects={subjects}
                        users={users}
                        students={institutionStudents}
                        gradebooks={gradebooks}
                        microPlans={microPlans}
                        reinforcementPlans={reinforcementPlans}
                    />
                </div>
            );
        default:
             const AllOtherPages = {
                'attendance': <AttendancePage classes={institutionClasses} students={institutionStudents} timeSlots={institutionTimeSlots} timetables={institutionTimetables} attendanceRecords={restProps.attendanceRecords} onUpdateAttendance={restProps.onUpdateAttendance} />,
                'activities': <ActivitiesPage 
                    activities={restProps.activities} 
                    onUpdateActivities={restProps.onUpdateActivities} 
                    classes={institutionClasses} 
                    subjects={subjects} 
                    students={institutionStudents} 
                    gradebooks={gradebooks} 
                    onUpdateGradebooks={restProps.onUpdateGradebooks} 
                    users={users} 
                    microPlans={microPlans} 
                    dcds={dcds} 
                    rubrics={rubrics} 
                    onUpdateRubrics={handleUpdateRubrics} 
                />,
                'reports': <ReportsPage attendanceRecords={restProps.attendanceRecords} academicCalendarEvents={restProps.academicCalendarEvents} students={institutionStudents} classes={institutionClasses} schedule={schedule} timeSlots={institutionTimeSlots} timetables={institutionTimetables} users={users} subjects={subjects} gradebooks={gradebooks} interventions={props.interventions || []} healthRecords={props.healthRecords || []} viccInterventions={restProps.viccInterventions || []} />,
                'dece': <DecePage {...restProps} users={users} classes={institutionClasses} schedule={schedule} subjects={subjects} timeSlots={institutionTimeSlots} students={institutionStudents} onUpdateStudents={restProps.onUpdateStudents} viccInterventions={restProps.viccInterventions} onUpdateViccInterventions={restProps.onUpdateViccInterventions} conflictMediations={conflictMediations} onUpdateConflictMediations={onUpdateConflictMediations} interventions={props.interventions || []} onUpdateInterventions={props.onUpdateInterventions} healthRecords={props.healthRecords || []} onUpdateHealthRecords={props.onUpdateHealthRecords} medicalVisits={props.medicalVisits || []} onUpdateMedicalVisits={props.onUpdateMedicalVisits} />,
                'health': <HealthPage {...restProps} users={users} classes={institutionClasses} schedule={schedule} subjects={subjects} timeSlots={institutionTimeSlots} students={institutionStudents} onUpdateStudents={restProps.onUpdateStudents} viccInterventions={restProps.viccInterventions} onUpdateViccInterventions={restProps.onUpdateViccInterventions} healthRecords={props.healthRecords || []} onUpdateHealthRecords={props.onUpdateHealthRecords} medicalVisits={props.medicalVisits || []} onUpdateMedicalVisits={props.onUpdateMedicalVisits} interventions={props.interventions || []} onUpdateInterventions={props.onUpdateInterventions} />,
                'students': <StudentManagementPage 
                    {...restProps} 
                    users={users} 
                    classes={institutionClasses} 
                    schedule={schedule} 
                    subjects={subjects} 
                    timeSlots={institutionTimeSlots} 
                    rooms={restProps.rooms} 
                    timetables={institutionTimetables} 
                    students={institutionStudents} 
                    onUpdateStudents={restProps.onUpdateStudents} 
                    onUpdateUsers={restProps.onUpdateUsers} 
                    onUpdateClasses={restProps.onUpdateClasses} 
                    healthRecords={props.healthRecords || []}
                    onUpdateHealthRecords={props.onUpdateHealthRecords}
                    medicalVisits={props.medicalVisits || []}
                    onUpdateMedicalVisits={props.onUpdateMedicalVisits}
                    interventions={props.interventions || []}
                    onUpdateInterventions={props.onUpdateInterventions}
                    viccInterventions={restProps.viccInterventions || []}
                    onUpdateViccInterventions={restProps.onUpdateViccInterventions}
                />,
                'schedule': <SchedulePage {...restProps} schedule={schedule} subjects={subjects} timeSlots={institutionTimeSlots} rooms={restProps.rooms} timetables={institutionTimetables} users={users} classes={institutionClasses} students={institutionStudents} />,
                'inspection': <InspectionPage absenceRequests={props.absenceRequests} onUpdateAbsenceRequests={props.onUpdateAbsenceRequests} 
                    {...restProps} 
                    classes={institutionClasses} 
                    users={users} 
                    students={institutionStudents} 
                    schedule={schedule}
                    staffAttendanceRecords={staffAttendanceRecords || []}
                    conflictMediations={conflictMediations} 
                    onUpdateConflictMediations={onUpdateConflictMediations} 
                    gradebooks={gradebooks} 
                    subjects={subjects} 
                />,
                'citaciones': <CitacionesPage {...restProps} users={users} students={institutionStudents} />,
                'leccionario': <LeccionarioPage leccionarioEntries={leccionarioEntries} onUpdateLeccionarioEntries={onUpdateLeccionarioEntries} schedule={schedule} classes={institutionClasses} subjects={subjects} users={users} timeSlots={institutionTimeSlots} microPlans={microPlans} />,
                'curricular_planning': <CurricularPlanningPage microPlans={microPlans} onUpdateMicroPlans={onUpdateMicroPlans} classes={institutionClasses} subjects={subjects} students={institutionStudents} users={users} dcds={dcds} evaluationCriteria={restProps.evaluationCriteria} evaluationIndicators={restProps.evaluationIndicators} />,
                'gradebook': <GradebookPage gradebooks={gradebooks} onUpdateGradebooks={restProps.onUpdateGradebooks} classes={institutionClasses} subjects={subjects} students={institutionStudents} users={users} schedule={schedule} activities={restProps.activities} />,
            };
            return AllOtherPages[currentPage] || <DashboardPage absenceRequests={props.absenceRequests} onUpdateAbsenceRequests={props.onUpdateAbsenceRequests} {...restProps} schedule={schedule} classes={institutionClasses} subjects={subjects} timeSlots={institutionTimeSlots} rooms={restProps.rooms} timetables={institutionTimetables} users={users} onNavigate={setCurrentPage} students={institutionStudents} formalRequests={formalRequests} cronogramaEvents={cronogramaEvents || []} onUpdateCronogramaEvents={onUpdateCronogramaEvents || (() => {})} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          notifications={restProps.notifications}
          onUpdateNotifications={restProps.onUpdateNotifications}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
      <StaffAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        users={users}
        onRecordAttendance={onUpdateStaffAttendance}
        records={staffAttendanceRecords}
        currentUser={user!}
      />
    </div>
  );
};

export default DashboardLayout;
