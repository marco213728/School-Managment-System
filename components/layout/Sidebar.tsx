import React, { useContext } from 'react';
import { Role } from '../../types';
// FIX: Corrected import path for InstitutionContext and merged with UserContext import.
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { DashboardIcon, AttendanceIcon, ActivityIcon, ReportIcon, ManageIcon, CloseIcon, DeceIcon, HealthIcon, UsersIcon, ChatBubbleIcon, CalendarIcon, VicerrectoradoIcon, InspectionIcon, CitacionIcon, LeccionarioIcon, ClipboardDocumentCheckIcon, ArchiveBoxIcon } from '../icons/Icons';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: 'dashboard' | 'attendance' | 'activities' | 'reports' | 'manage' | 'dece' | 'health' | 'students' | 'communications' | 'schedule' | 'vicerrectorate' | 'inspection' | 'citaciones' | 'leccionario' | 'curricular_planning' | 'curriculum_repository') => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen }) => {
  const { user } = useContext(UserContext);
  const { institution } = useContext(InstitutionContext);

  // FIX: Changed JSX.Element to React.ReactNode to resolve namespace error.
  const NavLink = ({ page, icon, text }: { page: any, icon: React.ReactNode, text: string }) => {
    const isActive = currentPage === page;
    const baseClasses = "flex items-center px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200";
    const activeClasses = "bg-primary-100 text-primary-700 font-semibold";

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

  const deceRoles = [Role.JefeDECE, Role.PsicologoEducativo, Role.TrabajadorSocial];

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
      { page: 'vicerrectorate', icon: <VicerrectoradoIcon className="h-6 w-6" />, text: 'Vicerrectorado' },
      { page: 'inspection', icon: <InspectionIcon className="h-6 w-6" />, text: 'Inspección' },
      { page: 'manage', icon: <ManageIcon className="h-6 w-6" />, text: 'Gestión Centro' },
    ],
    [Role.Teacher]: [
      ...commonLinks,
      { page: 'leccionario', icon: <LeccionarioIcon className="h-6 w-6" />, text: 'Leccionario' },
      { page: 'curricular_planning', icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />, text: 'Planificación' },
      { page: 'attendance', icon: <AttendanceIcon className="h-6 w-6" />, text: 'Pase de Lista' },
      { page: 'activities', icon: <ActivityIcon className="h-6 w-6" />, text: 'Actividades' },
      { page: 'reports', icon: <ReportIcon className="h-6 w-6" />, text: 'Informes de Clase' },
      { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' },
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
    [Role.JefeDECE]: [
      ...commonLinks,
       { page: 'dece', icon: <DeceIcon className="h-6 w-6" />, text: 'Módulo DECE' },
       { page: 'reports', icon: <ReportIcon className="h-6 w-6" />, text: 'Informes DECE' },
       { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' },
    ],
    [Role.PsicologoEducativo]: [
      ...commonLinks,
       { page: 'dece', icon: <DeceIcon className="h-6 w-6" />, text: 'Módulo DECE' },
       { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' },
    ],
    [Role.TrabajadorSocial]: [
      ...commonLinks,
       { page: 'dece', icon: <DeceIcon className="h-6 w-6" />, text: 'Módulo DECE' },
       { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' },
    ],
    [Role.HealthProfessional]: [
      ...commonLinks,
      { page: 'health', icon: <HealthIcon className="h-6 w-6" />, text: 'Módulo de Salud' },
      { page: 'reports', icon: <ReportIcon className="h-6 w-6" />, text: 'Informes de Salud' },
    ],
    [Role.Vicerrector]: [
        ...commonLinks,
        { page: 'vicerrectorate', icon: <VicerrectoradoIcon className="h-6 w-6" />, text: 'Vicerrectorado' },
        { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' },
    ],
    [Role.InspectorGeneral]: [
        ...commonLinks,
        { page: 'inspection', icon: <InspectionIcon className="h-6 w-6" />, text: 'Inspección' },
        { page: 'attendance', icon: <AttendanceIcon className="h-6 w-6" />, text: 'Asistencia General' },
        { page: 'manage', icon: <ManageIcon className="h-6 w-6" />, text: 'Gestión Centro' },
        { page: 'citaciones', icon: <CitacionIcon className="h-6 w-6" />, text: 'Citaciones' },
    ]
  };

  // SuperAdmin has no links in this sidebar
  const links = user && user.role !== Role.SuperAdmin ? roleLinks[user.role] || [] : [];
  
  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`flex flex-col w-64 h-full px-4 py-5 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out fixed lg:static lg:translate-x-0 z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
            <a href="#" className="flex items-center gap-3">
              {institution && <img src={institution.logoUrl} alt="Logo" className="h-9 w-9 rounded-lg" />}
              <span className="text-base font-semibold text-slate-700">{institution?.name.split(' ').slice(0, 3).join(' ')}</span>
            </a>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-600 lg:hidden">
              <CloseIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="flex flex-col justify-between flex-1 mt-6">
          <nav className="space-y-1">
            {links.map(link => (
              <NavLink key={link.page} {...link} />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;