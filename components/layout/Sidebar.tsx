
import React, { useContext } from 'react';
import { Role } from '../../types';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { DashboardIcon, AttendanceIcon, ActivityIcon, ReportIcon, ManageIcon, CloseIcon, DeceIcon, HealthIcon, UsersIcon, ChatBubbleIcon, CalendarIcon, VicerrectoradoIcon, InspectionIcon, CitacionIcon, LeccionarioIcon, ClipboardDocumentCheckIcon, ArchiveBoxIcon, ClipboardListIcon, GraduationCapIcon, FingerPrintIcon } from '../icons/Icons';
import { AMAUTA_LOGO } from '../../branding';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: any) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onOpenAttendanceModal: () => void; // Added prop to open modal
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen, onOpenAttendanceModal }) => {
  const { user } = useContext(UserContext);
  const { institution } = useContext(InstitutionContext);

  const NavLink = ({ page, icon, text }: { page: any, icon: React.ReactNode, text: string }) => {
    const isActive = currentPage === page;
    const baseClasses = "flex items-center px-3 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors duration-200";
    const activeClasses = "bg-primary-600/20 text-primary-400 font-semibold";

    return (
      <a href="#" className={`${baseClasses} ${isActive ? activeClasses : ''}`} onClick={(e) => {
        e.preventDefault();
        setCurrentPage(page);
        setSidebarOpen(false);
      }}>
        {icon}
        <span className="mx-3">{text}</span>
      </a>
    );
  };

  const commonLinks = [
    { page: 'dashboard', icon: <DashboardIcon className="h-6 w-6" />, text: 'Dashboard' }
  ];

  const roleLinks = {
    [Role.InstitutionAdmin]: [
      ...commonLinks,
      { page: 'students', icon: <UsersIcon className="h-6 w-6" />, text: 'Alumnos' },
      { page: 'attendance', icon: <AttendanceIcon className="h-6 w-6" />, text: 'Asistencia General' },
      { page: 'reports', icon: <ReportIcon className="h-6 w-6" />, text: 'Informes' },
      { page: 'communications', icon: <ChatBubbleIcon className="h-6 w-6" />, text: 'Comunicaciones' },
      { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' },
      { page: 'dece', icon: <DeceIcon className="h-6 w-6" />, text: 'DECE' },
      { page: 'health', icon: <HealthIcon className="h-6 w-6" />, text: 'Salud' },
      { page: 'vicerrector_dashboard', icon: <VicerrectoradoIcon className="h-6 w-6" />, text: 'Vicerrectorado' },
      { page: 'curricular_planning', icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />, text: 'Planificación' },
      { page: 'curriculum_repository', icon: <ArchiveBoxIcon className="h-6 w-6" />, text: 'Repositorio' },
      { page: 'inspection', icon: <InspectionIcon className="h-6 w-6" />, text: 'Inspección' },
      { page: 'manage', icon: <ManageIcon className="h-6 w-6" />, text: 'Gestión Centro' },
      // Added Resource Bank Link
      { page: 'resource_bank', icon: <ArchiveBoxIcon className="h-6 w-6" />, text: 'Banco de Recursos' },
    ],
    [Role.Teacher]: [
      ...commonLinks,
      { page: 'leccionario', icon: <LeccionarioIcon className="h-6 w-6" />, text: 'Leccionario' },
      { page: 'gradebook', icon: <ClipboardListIcon className="h-6 w-6" />, text: 'Registro Docente' },
      { page: 'curricular_planning', icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />, text: 'Planificación' },
      { page: 'attendance', icon: <AttendanceIcon className="h-6 w-6" />, text: 'Pase de Lista' },
      { page: 'activities', icon: <ActivityIcon className="h-6 w-6" />, text: 'Actividades' },
      { page: 'reinforcement', icon: <GraduationCapIcon className="h-6 w-6" />, text: 'Refuerzo Académico' },
      // Added Juntas de Curso Link for Teachers
      { page: 'juntas', icon: <UsersIcon className="h-6 w-6" />, text: 'Juntas de Curso' },
      { page: 'reports', icon: <ReportIcon className="h-6 w-6" />, text: 'Informes de Clase' },
      { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' },
      { page: 'teacher_training', icon: <ArchiveBoxIcon className="h-6 w-6" />, text: 'Capacitación' },
      // Added Resource Bank Link
      { page: 'resource_bank', icon: <ArchiveBoxIcon className="h-6 w-6" />, text: 'Banco de Recursos' },
      { page: 'communications', icon: <ChatBubbleIcon className="h-6 w-6" />, text: 'Comunicaciones' },
    ],
    [Role.Parent]: [
      ...commonLinks,
      { page: 'attendance', icon: <AttendanceIcon className="h-6 w-6" />, text: 'Asistencia Hijo/a' },
      { page: 'activities', icon: <ActivityIcon className="h-6 w-6" />, text: 'Actividades Hijo/a' },
      { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' },
    ],
    [Role.Student]: [
      ...commonLinks,
      { page: 'schedule', icon: <CalendarIcon className="h-6 w-6" />, text: 'Mi Horario' },
      { page: 'attendance', icon: <AttendanceIcon className="h-6 w-6" />, text: 'Mi Asistencia' },
      { page: 'activities', icon: <ActivityIcon className="h-6 w-6" />, text: 'Mis Actividades' },
    ],
    [Role.JefeDECE]: [ ...commonLinks, { page: 'dece', icon: <DeceIcon className="h-6 w-6" />, text: 'Módulo DECE' }, { page: 'reports', icon: <ReportIcon className="h-6 w-6" />, text: 'Informes DECE' }, { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' }, { page: 'communications', icon: <ChatBubbleIcon className="h-6 w-6" />, text: 'Comunicaciones' }],
    [Role.PsicologoEducativo]: [ ...commonLinks, { page: 'dece', icon: <DeceIcon className="h-6 w-6" />, text: 'Módulo DECE' }, { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' }, { page: 'communications', icon: <ChatBubbleIcon className="h-6 w-6" />, text: 'Comunicaciones' }],
    [Role.TrabajadorSocial]: [ ...commonLinks, { page: 'dece', icon: <DeceIcon className="h-6 w-6" />, text: 'Módulo DECE' }, { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' }, { page: 'communications', icon: <ChatBubbleIcon className="h-6 w-6" />, text: 'Comunicaciones' }],
    [Role.HealthProfessional]: [ ...commonLinks, { page: 'health', icon: <HealthIcon className="h-6 w-6" />, text: 'Módulo de Salud' }, { page: 'reports', icon: <ReportIcon className="h-6 w-6" />, text: 'Informes de Salud' }, { page: 'communications', icon: <ChatBubbleIcon className="h-6 w-6" />, text: 'Comunicaciones' }],
    [Role.Vicerrector]: [ { page: 'vicerrector_dashboard', icon: <VicerrectoradoIcon className="h-6 w-6" />, text: 'Dashboard Vicerrectorado' }, { page: 'curricular_planning', icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />, text: 'Planificación Curricular' }, { page: 'curriculum_repository', icon: <ArchiveBoxIcon className="h-6 w-6" />, text: 'Repositorio Curricular' }, { page: 'resource_bank', icon: <ArchiveBoxIcon className="h-6 w-6" />, text: 'Banco de Recursos' }, { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' }, { page: 'communications', icon: <ChatBubbleIcon className="h-6 w-6" />, text: 'Comunicaciones' }],
    [Role.InspectorGeneral]: [ ...commonLinks, { page: 'inspection', icon: <InspectionIcon className="h-6 w-6" />, text: 'Inspección' }, { page: 'students', icon: <UsersIcon className="h-6 w-6" />, text: 'Alumnos' }, { page: 'attendance', icon: <AttendanceIcon className="h-6 w-6" />, text: 'Asistencia General' }, { page: 'manage', icon: <ManageIcon className="h-6 w-6" />, text: 'Gestión Centro' }, { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' }, { page: 'communications', icon: <ChatBubbleIcon className="h-6 w-6" />, text: 'Comunicaciones' }],
    [Role.Rector]: [ { page: 'dashboard', icon: <DashboardIcon className="h-6 w-6" />, text: 'Dashboard' }, { page: 'communications', icon: <ChatBubbleIcon className="h-6 w-6" />, text: 'Comunicaciones' }, { page: 'manage', icon: <ManageIcon className="h-6 w-6" />, text: 'Gestión Centro' }],
  };

  const links = user && user.role !== Role.SuperAdmin ? roleLinks[user.role] || [] : [];
  
  const logo = institution?.logoUrl && !institution.logoUrl.includes('placehold') ? institution.logoUrl : AMAUTA_LOGO;
  
  const isStaff = user && user.role !== Role.Parent && user.role !== Role.Student && user.role !== Role.SuperAdmin;

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`flex flex-col w-64 h-full px-4 py-5 bg-slate-900 transform transition-transform duration-300 ease-in-out fixed lg:static lg:translate-x-0 z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }} className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
            </a>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 lg:hidden">
              <CloseIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="flex flex-col justify-between flex-1 mt-6">
          <nav className="space-y-1">
            {links.map(link => (
              <NavLink key={link.page} {...link} />
            ))}
          </nav>

          {isStaff && (
            <div className="mt-auto pt-4 border-t border-slate-700">
              <button 
                onClick={onOpenAttendanceModal}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-slate-200 bg-slate-800 hover:bg-primary-600 rounded-lg transition-colors duration-200"
              >
                <FingerPrintIcon className="h-6 w-6" />
                <span className="font-semibold">Registrar Asistencia</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
