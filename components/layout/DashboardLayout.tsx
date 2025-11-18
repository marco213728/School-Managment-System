
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
import { User, Class, Student, ScheduleEntry, Notification, SupportContact, HealthRecord, MedicalVisit, Subject, TimeSlot, Room, Timetable, ViccIntervention, AttendanceRecord, ExitPass, Citacion, AcademicCalendarEvent, LeccionarioEntry, MicroPlan, Dcd, EvaluationCriterion, EvaluationIndicator, Gradebook, Activity } from '../../types';
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


type Page = 'dashboard' | 'attendance' | 'activities' | 'reports' | 'manage' | 'dece' | 'health' | 'students' | 'communications' | 'schedule' | 'inspection' | 'citaciones' | 'leccionario' | 'curricular_planning' | 'curriculum_repository' | 'gradebook' | 'vicerrector_dashboard';

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
}

const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => {
  const {
    // Destructure all props to pass them down
    users,
    classes,
    schedule,
    subjects,
    timeSlots,
    leccionarioEntries, 
    onUpdateLeccionarioEntries,
    microPlans,
    dcds,
    ...restProps
  } = props;

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage {...restProps} schedule={schedule} classes={classes} subjects={subjects} timeSlots={timeSlots} rooms={restProps.rooms} timetables={restProps.timetables} users={users} />;
      case 'attendance':
        return <AttendancePage classes={classes} timeSlots={timeSlots} timetables={restProps.timetables} attendanceRecords={restProps.attendanceRecords} onUpdateAttendance={restProps.onUpdateAttendance} />;
      case 'activities':
        return <ActivitiesPage 
          activities={props.activities}
          onUpdateActivities={props.onUpdateActivities}
          classes={props.classes}
          subjects={props.subjects}
          students={props.students}
          gradebooks={props.gradebooks}
          onUpdateGradebooks={props.onUpdateGradebooks}
          users={props.users}
          microPlans={microPlans}
          dcds={dcds}
        />;
      case 'reports':
        return <ReportsPage 
          attendanceRecords={restProps.attendanceRecords} 
          academicCalendarEvents={restProps.academicCalendarEvents}
          students={restProps.students}
          classes={classes}
          schedule={schedule}
          timeSlots={timeSlots}
          timetables={restProps.timetables}
          users={users}
          subjects={subjects}
          gradebooks={props.gradebooks}
         />;
      case 'manage':
        return <ManagePage 
          allUsers={users}
          allClasses={classes}
          allStudents={restProps.students}
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
        />;
      case 'dece':
        return <DecePage {...restProps} users={users} classes={classes} schedule={schedule} subjects={subjects} timeSlots={timeSlots} />;
      case 'health':
        return <HealthPage {...restProps} users={users} classes={classes} schedule={schedule} subjects={subjects} timeSlots={timeSlots} />;
      case 'students':
        return <StudentManagementPage {...restProps} users={users} classes={classes} schedule={schedule} subjects={subjects} timeSlots={timeSlots} />;
      case 'communications':
        return <CommunicationsPage {...restProps} users={users} classes={classes} allNotifications={props.notifications} />;
      case 'schedule':
        return <SchedulePage {...restProps} schedule={schedule} subjects={subjects} timeSlots={timeSlots} users={users} classes={classes} />;
      case 'inspection':
        return <InspectionPage {...restProps} classes={classes} users={users} />;
      case 'citaciones':
        return <CitacionesPage {...restProps} users={users} />;
      case 'leccionario':
        return <LeccionarioPage 
            leccionarioEntries={leccionarioEntries}
            onUpdateLeccionarioEntries={onUpdateLeccionarioEntries}
            schedule={schedule}
            classes={classes}
            subjects={subjects}
            users={users}
            timeSlots={timeSlots}
            microPlans={microPlans}
        />;
      case 'curricular_planning':
        return <CurricularPlanningPage
            microPlans={props.microPlans}
            onUpdateMicroPlans={props.onUpdateMicroPlans}
            classes={props.classes}
            subjects={props.subjects}
            students={props.students}
            users={props.users}
            dcds={props.dcds}
            evaluationCriteria={props.evaluationCriteria}
            evaluationIndicators={props.evaluationIndicators}
        />;
      case 'curriculum_repository':
        return <CurriculumRepositoryPage
            dcds={props.dcds}
            onUpdateDcds={props.onUpdateDcds}
            subjects={props.subjects}
            evaluationCriteria={props.evaluationCriteria}
            onUpdateEvaluationCriteria={props.onUpdateEvaluationCriteria}
            evaluationIndicators={props.evaluationIndicators}
            onUpdateEvaluationIndicators={props.onUpdateEvaluationIndicators}
        />;
      case 'gradebook':
        return <GradebookPage
          gradebooks={props.gradebooks}
          onUpdateGradebooks={props.onUpdateGradebooks}
          classes={props.classes}
          subjects={props.subjects}
          students={props.students}
          users={props.users}
          schedule={props.schedule}
          activities={props.activities}
        />;
      case 'vicerrector_dashboard':
          return <VicerrectoradoPage
              microPlans={props.microPlans}
              viccInterventions={props.viccInterventions}
              gradebooks={props.gradebooks}
              users={props.users}
              subjects={props.subjects}
              classes={props.classes}
              students={props.students}
              onNavigate={setCurrentPage}
              notifications={props.notifications}
              onUpdateNotifications={props.onUpdateNotifications}
          />;
      default:
        return <DashboardPage {...restProps} schedule={schedule} classes={classes} subjects={subjects} timeSlots={timeSlots} rooms={restProps.rooms} timetables={restProps.timetables} users={users} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          notifications={props.notifications}
          onUpdateNotifications={props.onUpdateNotifications}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
