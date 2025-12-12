
import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardPage from '../../pages/DashboardPage';
import AttendancePage from '../../pages/AttendancePage';
import ActivitiesPage from '../../pages/ActivitiesPage';
import ReportsPage from '../../pages/ReportsPage';
import ManagePage from '../../pages/ManagePage';
import DecePage from '../../pages/DecePage';
import HealthPage from '../../pages/HealthPage';
import { User, Class, Student, ScheduleEntry, Notification, SupportContact, HealthRecord, MedicalVisit, Subject, TimeSlot, Room, Timetable, ViccIntervention, AttendanceRecord, ExitPass, Citacion, AcademicCalendarEvent, LeccionarioEntry, MicroPlan, Dcd, EvaluationCriterion, EvaluationIndicator, Gradebook, Activity, ReinforcementPlan, StaffAttendanceRecord, FormalRequest, TrainingPlan, InstitutionalDocument, MeetingRecord, Rubric, ConflictMediation } from '../../types';
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
import JuntaManager from '../vicerrectorado/JuntaManager'; // Import JuntaManager
import { UserContext } from '../../contexts/UserContext';
import { MOCK_RUBRICS } from '../../constants'; // Import MOCK_RUBRICS for fallback

type Page = 'dashboard' | 'attendance' | 'activities' | 'reports' | 'manage' | 'dece' | 'health' | 'students' | 'communications' | 'schedule' | 'inspection' | 'citaciones' | 'leccionario' | 'curricular_planning' | 'curriculum_repository' | 'gradebook' | 'vicerrector_dashboard' | 'reinforcement' | 'teacher_training' | 'resource_bank' | 'juntas'; // Added 'juntas'

interface DashboardLayoutProps {
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
  rubrics?: Rubric[]; // Optional rubrics prop
  conflictMediations?: ConflictMediation[];
  
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
  onUpdateRubrics?: (rubrics: Rubric[]) => void; // Optional updater
  onUpdateConflictMediations?: (conflicts: ConflictMediation[]) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => {
  const { user } = useContext(UserContext);
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
    ...restProps
  } = props;

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Fallback for rubrics if not passed from App
  const rubrics = props.rubrics || MOCK_RUBRICS;
  const handleUpdateRubrics = props.onUpdateRubrics || ((r) => console.log('Mock update rubrics:', r));

  const renderContent = () => {
    switch (currentPage) {
        case 'dashboard':
          return <DashboardPage 
              {...restProps} 
              schedule={schedule} 
              classes={classes} 
              subjects={subjects} 
              timeSlots={timeSlots} 
              rooms={restProps.rooms} 
              timetables={restProps.timetables} 
              users={users} 
              onNavigate={setCurrentPage}
              students={students}
              formalRequests={formalRequests}
          />;
        case 'manage':
          return <ManagePage 
            {...restProps}
            allUsers={users}
            allClasses={classes}
            allStudents={students}
            schedule={schedule}
            supportContacts={restProps.supportContacts}
            subjects={subjects}
            timeSlots={timeSlots}
            rooms={restProps.rooms}
            timetables={restProps.timetables}
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
                students={students}
                classes={classes}
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
                classes={classes}
                students={students}
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
                students={students}
                classes={classes}
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
            />;
        case 'juntas':
            return (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Juntas de Curso y Entrega de Informes</h2>
                    <JuntaManager 
                        classes={classes}
                        subjects={subjects}
                        users={users}
                        students={students}
                        gradebooks={gradebooks}
                        microPlans={microPlans}
                        reinforcementPlans={reinforcementPlans}
                    />
                </div>
            );
        default:
             const AllOtherPages = {
                'attendance': <AttendancePage classes={classes} timeSlots={timeSlots} timetables={restProps.timetables} attendanceRecords={restProps.attendanceRecords} onUpdateAttendance={restProps.onUpdateAttendance} />,
                'activities': <ActivitiesPage 
                    activities={restProps.activities} 
                    onUpdateActivities={restProps.onUpdateActivities} 
                    classes={classes} 
                    subjects={subjects} 
                    students={students} 
                    gradebooks={gradebooks} 
                    onUpdateGradebooks={restProps.onUpdateGradebooks} 
                    users={users} 
                    microPlans={microPlans} 
                    dcds={dcds} 
                    rubrics={rubrics} // Pass rubrics
                    onUpdateRubrics={handleUpdateRubrics} // Pass update handler
                />,
                'reports': <ReportsPage attendanceRecords={restProps.attendanceRecords} academicCalendarEvents={restProps.academicCalendarEvents} students={students} classes={classes} schedule={schedule} timeSlots={timeSlots} timetables={restProps.timetables} users={users} subjects={subjects} gradebooks={gradebooks} />,
                'dece': <DecePage {...restProps} users={users} classes={classes} schedule={schedule} subjects={subjects} timeSlots={timeSlots} students={students} onUpdateStudents={restProps.onUpdateStudents} viccInterventions={restProps.viccInterventions} onUpdateViccInterventions={restProps.onUpdateViccInterventions} conflictMediations={conflictMediations} onUpdateConflictMediations={onUpdateConflictMediations} />,
                'health': <HealthPage {...restProps} users={users} classes={classes} schedule={schedule} subjects={subjects} timeSlots={timeSlots} students={students} onUpdateStudents={restProps.onUpdateStudents} viccInterventions={restProps.viccInterventions} onUpdateViccInterventions={restProps.onUpdateViccInterventions} />,
                'students': <StudentManagementPage {...restProps} users={users} classes={classes} schedule={schedule} subjects={subjects} timeSlots={timeSlots} rooms={restProps.rooms} timetables={restProps.timetables} students={students} onUpdateStudents={restProps.onUpdateStudents} />,
                'schedule': <SchedulePage {...restProps} schedule={schedule} subjects={subjects} timeSlots={timeSlots} users={users} classes={classes} students={students} />,
                'inspection': <InspectionPage 
                    {...restProps} 
                    classes={classes} 
                    users={users} 
                    students={students} 
                    conflictMediations={conflictMediations} 
                    onUpdateConflictMediations={onUpdateConflictMediations} 
                    gradebooks={gradebooks} 
                    subjects={subjects} 
                />,
                'citaciones': <CitacionesPage {...restProps} users={users} students={students} />,
                'leccionario': <LeccionarioPage leccionarioEntries={leccionarioEntries} onUpdateLeccionarioEntries={onUpdateLeccionarioEntries} schedule={schedule} classes={classes} subjects={subjects} users={users} timeSlots={timeSlots} microPlans={microPlans} />,
                'curricular_planning': <CurricularPlanningPage microPlans={microPlans} onUpdateMicroPlans={onUpdateMicroPlans} classes={classes} subjects={subjects} students={students} users={users} dcds={dcds} evaluationCriteria={restProps.evaluationCriteria} evaluationIndicators={restProps.evaluationIndicators} />,
                'curriculum_repository': <CurriculumRepositoryPage dcds={dcds} onUpdateDcds={restProps.onUpdateDcds} subjects={subjects} evaluationCriteria={restProps.evaluationCriteria} onUpdateEvaluationCriteria={restProps.onUpdateEvaluationCriteria} evaluationIndicators={restProps.evaluationIndicators} onUpdateEvaluationIndicators={restProps.onUpdateEvaluationIndicators} />,
                'gradebook': <GradebookPage gradebooks={gradebooks} onUpdateGradebooks={restProps.onUpdateGradebooks} classes={classes} subjects={subjects} students={students} users={users} schedule={schedule} activities={restProps.activities} />,
            };
            return AllOtherPages[currentPage] || <DashboardPage {...restProps} schedule={schedule} classes={classes} subjects={subjects} timeSlots={timeSlots} rooms={restProps.rooms} timetables={restProps.timetables} users={users} onNavigate={setCurrentPage} students={students} formalRequests={formalRequests} />;
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
