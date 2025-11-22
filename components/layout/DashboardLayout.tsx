
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
import { User, Class, Student, ScheduleEntry, Notification, SupportContact, HealthRecord, MedicalVisit, Subject, TimeSlot, Room, Timetable, ViccIntervention, AttendanceRecord, ExitPass, Citacion, AcademicCalendarEvent, LeccionarioEntry, MicroPlan, Dcd, EvaluationCriterion, EvaluationIndicator, Gradebook, Activity, ReinforcementPlan, StaffAttendanceRecord } from '../../types';
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
import StaffAttendanceModal from '../staff/StaffAttendanceModal'; // Import the new modal


type Page = 'dashboard' | 'attendance' | 'activities' | 'reports' | 'manage' | 'dece' | 'health' | 'students' | 'communications' | 'schedule' | 'inspection' | 'citaciones' | 'leccionario' | 'curricular_planning' | 'curriculum_repository' | 'gradebook' | 'vicerrector_dashboard' | 'reinforcement';

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
  staffAttendanceRecords: StaffAttendanceRecord[]; // Added for staff attendance
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
  onUpdateStaffAttendance: (userId: string, method: 'Biometric' | 'Manual', location?: { latitude: number; longitude: number; }) => void; // Updated for staff attendance
}

const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => {
  const {
    users,
    classes,
    schedule,
    subjects,
    timeSlots,
    leccionarioEntries, 
    onUpdateLeccionarioEntries,
    microPlans,
    dcds,
    reinforcementPlans,
    onUpdateReinforcementPlans,
    staffAttendanceRecords,
    onUpdateStaffAttendance,
    ...restProps
  } = props;

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false); // State for the modal

  const renderContent = () => {
    switch (currentPage) {
        // ... (all other cases remain the same)
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
          />;
        case 'manage':
          return <ManagePage 
            {...restProps}
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
            staffAttendanceRecords={staffAttendanceRecords}
            onUpdateStaffAttendance={onUpdateStaffAttendance}
          />;
        case 'reinforcement':
            return <TeacherReinforcementPage
                students={props.students}
                classes={props.classes}
                subjects={props.subjects}
                users={props.users}
                reinforcementPlans={reinforcementPlans}
                onUpdateReinforcementPlans={onUpdateReinforcementPlans}
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
                // FIX: Pass reinforcementPlans and its updater to VicerrectoradoPage
                reinforcementPlans={reinforcementPlans}
                onUpdateReinforcementPlans={onUpdateReinforcementPlans}
            />;
        default:
             const AllOtherPages = {
                'attendance': <AttendancePage classes={classes} timeSlots={timeSlots} timetables={restProps.timetables} attendanceRecords={restProps.attendanceRecords} onUpdateAttendance={restProps.onUpdateAttendance} />,
                'activities': <ActivitiesPage activities={props.activities} onUpdateActivities={props.onUpdateActivities} classes={props.classes} subjects={props.subjects} students={props.students} gradebooks={props.gradebooks} onUpdateGradebooks={props.onUpdateGradebooks} users={props.users} microPlans={microPlans} dcds={dcds} />,
                'reports': <ReportsPage attendanceRecords={restProps.attendanceRecords} academicCalendarEvents={restProps.academicCalendarEvents} students={restProps.students} classes={classes} schedule={schedule} timeSlots={timeSlots} timetables={restProps.timetables} users={users} subjects={subjects} gradebooks={props.gradebooks} />,
                'dece': <DecePage {...restProps} users={users} classes={classes} schedule={schedule} subjects={subjects} timeSlots={timeSlots} />,
                'health': <HealthPage {...restProps} users={users} classes={classes} schedule={schedule} subjects={subjects} timeSlots={timeSlots} />,
                'students': <StudentManagementPage {...restProps} users={users} classes={classes} schedule={schedule} subjects={subjects} timeSlots={timeSlots} rooms={restProps.rooms} timetables={restProps.timetables} />,
                'communications': <CommunicationsPage {...restProps} users={users} classes={classes} allNotifications={props.notifications} />,
                'schedule': <SchedulePage {...restProps} schedule={schedule} subjects={subjects} timeSlots={timeSlots} users={users} classes={classes} />,
                'inspection': <InspectionPage {...restProps} classes={classes} users={users} />,
                'citaciones': <CitacionesPage {...restProps} users={users} />,
                'leccionario': <LeccionarioPage leccionarioEntries={leccionarioEntries} onUpdateLeccionarioEntries={onUpdateLeccionarioEntries} schedule={schedule} classes={classes} subjects={subjects} users={users} timeSlots={timeSlots} microPlans={microPlans} />,
                'curricular_planning': <CurricularPlanningPage microPlans={props.microPlans} onUpdateMicroPlans={props.onUpdateMicroPlans} classes={props.classes} subjects={props.subjects} students={props.students} users={props.users} dcds={props.dcds} evaluationCriteria={props.evaluationCriteria} evaluationIndicators={props.evaluationIndicators} />,
                'curriculum_repository': <CurriculumRepositoryPage dcds={props.dcds} onUpdateDcds={props.onUpdateDcds} subjects={props.subjects} evaluationCriteria={props.evaluationCriteria} onUpdateEvaluationCriteria={props.onUpdateEvaluationCriteria} evaluationIndicators={props.evaluationIndicators} onUpdateEvaluationIndicators={props.onUpdateEvaluationIndicators} />,
                'gradebook': <GradebookPage gradebooks={props.gradebooks} onUpdateGradebooks={props.onUpdateGradebooks} classes={props.classes} subjects={props.subjects} students={props.students} users={props.users} schedule={props.schedule} activities={props.activities} />,
            };
            return AllOtherPages[currentPage] || <DashboardPage {...restProps} schedule={schedule} classes={classes} subjects={subjects} timeSlots={timeSlots} rooms={restProps.rooms} timetables={restProps.timetables} users={users} onNavigate={setCurrentPage} />;
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
          notifications={props.notifications}
          onUpdateNotifications={props.onUpdateNotifications}
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
      />
    </div>
  );
};

export default DashboardLayout;
