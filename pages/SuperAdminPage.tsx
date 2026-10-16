import React, { useState, useEffect, useMemo } from 'react';
import { Institution, User, Role, Class, Student, Dcd, EvaluationCriterion, EvaluationIndicator, Subject } from '../types';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  ChartBarIcon, 
  UsersIcon, 
  SparklesIcon, 
  ClipboardDocumentCheckIcon, 
  ArchiveBoxIcon,
  SearchIcon,
  LocationMarkerIcon,
  DeceIcon,
  HealthIcon,
  CheckCircleIcon
} from '../components/icons/Icons';
import AmautaLogo from '../components/branding/AmautaLogo';
import InstitutionForm from '../components/management/InstitutionForm';
import InstitutionDetailsModal from '../components/superadmin/InstitutionDetailsModal';
import EducationalQualityAudit from '../components/superadmin/EducationalQualityAudit';
import PeiAudit from '../components/superadmin/PeiAudit';
import ResourceRepositoryPage from './ResourceRepositoryPage';
import CurriculumRepositoryPage from './CurriculumRepositoryPage';
import { saveDocument, deleteDocument } from '../lib/firebase';

interface SuperAdminPageProps {
  institutions: Institution[];
  onUpdateInstitutions?: (institutions: Institution[]) => void;
  users: User[];
  classes?: Class[];
  students?: Student[];
  dcds: Dcd[];
  evaluationCriteria: EvaluationCriterion[];
  evaluationIndicators: EvaluationIndicator[];
  subjects: Subject[];
  onUpdateDcds: (items: Dcd[]) => void;
  onUpdateEvaluationCriteria: (items: EvaluationCriterion[]) => void;
  onUpdateEvaluationIndicators: (items: EvaluationIndicator[]) => void;
}

export const SuperAdminPage: React.FC<SuperAdminPageProps> = (props) => {
  const { 
    institutions: initialInstitutions = [], 
    onUpdateInstitutions, 
    users = [], 
    classes = [],
    students = [],
    dcds = [], 
    evaluationCriteria = [], 
    evaluationIndicators = [], 
    subjects = [],
    onUpdateDcds, 
    onUpdateEvaluationCriteria, 
    onUpdateEvaluationIndicators 
  } = props;
  
  const [institutions, setInstitutions] = useState<Institution[]>(initialInstitutions || []);
  const [view, setView] = useState<'institutions' | 'quality' | 'resources' | 'pei_audit' | 'curriculum_master'>('institutions');
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>('cards');
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'pending' | 'suspended'>('ALL');
  const [moduleFilter, setModuleFilter] = useState<'ALL' | 'dece' | 'health'>('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [trackingInstitution, setTrackingInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    setInstitutions(initialInstitutions);
  }, [initialInstitutions]);

  // Network Analytics calculation
  const networkMetrics = useMemo(() => {
    const totalInst = institutions.length;
    const activeInst = institutions.filter(i => (i.status || 'active') === 'active').length;
    const pendingInst = institutions.filter(i => i.status === 'pending').length;
    const suspendedInst = institutions.filter(i => i.status === 'suspended').length;
    const totalUsers = users.length;
    const totalTeachers = users.filter(u => u.role === Role.Teacher).length;
    const totalStudents = students.length || users.filter(u => u.role === Role.Student).length;
    const deceAdoption = institutions.filter(i => i.activeModules?.dece).length;
    const healthAdoption = institutions.filter(i => i.activeModules?.health).length;

    return {
      totalInst,
      activeInst,
      pendingInst,
      suspendedInst,
      totalUsers,
      totalTeachers,
      totalStudents,
      deceAdoption,
      healthAdoption,
    };
  }, [institutions, users, students]);

  // Per-institution stats calculator
  const getInstStats = (instId: string) => {
    const instUsers = users.filter(u => u.institutionId === instId);
    const teachers = instUsers.filter(u => u.role === Role.Teacher).length;
    const rectors = instUsers.filter(u => u.role === Role.Rector || u.role === Role.Vicerrector).length;
    const parents = instUsers.filter(u => u.role === Role.Parent).length;
    const instClasses = classes.filter(c => c.institutionId === instId).length;
    const instStudents = students.filter(s => s.institutionId === instId).length || instUsers.filter(u => u.role === Role.Student).length;

    return {
      totalUsers: instUsers.length,
      teachers,
      rectors,
      parents,
      classes: instClasses,
      students: instStudents,
    };
  };

  // Filtered institutions
  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      // Search
      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q || (
        (inst.name || '').toLowerCase().includes(q) ||
        (inst.codeAMIE || '').toLowerCase().includes(q) ||
        (inst.province || '').toLowerCase().includes(q) ||
        (inst.canton || '').toLowerCase().includes(q) ||
        (inst.contact?.email || '').toLowerCase().includes(q)
      );

      // Status
      const matchStatus = statusFilter === 'ALL' || (inst.status || 'active') === statusFilter;

      // Module
      const matchModule = moduleFilter === 'ALL' || 
        (moduleFilter === 'dece' && inst.activeModules?.dece) ||
        (moduleFilter === 'health' && inst.activeModules?.health);

      return matchSearch && matchStatus && matchModule;
    });
  }, [institutions, searchTerm, statusFilter, moduleFilter]);

  const handleAddNew = () => {
    setEditingInstitution(null);
    setIsFormOpen(true);
  };

  const handleEdit = (institution: Institution) => {
    setEditingInstitution(institution);
    setIsFormOpen(true);
  };

  const handleOpenTracking = (institution: Institution) => {
    setTrackingInstitution(institution);
  };

  const handleDelete = async (institutionId: string) => {
    const inst = institutions.find(i => i.id === institutionId);
    if (window.confirm(`¿Está seguro de que desea eliminar la institución "${inst?.name || institutionId}"? Esta acción no se puede deshacer.`)) {
      const updated = institutions.filter(i => i.id !== institutionId);
      setInstitutions(updated);
      if (onUpdateInstitutions) onUpdateInstitutions(updated);
      await deleteDocument('institutions', institutionId);
    }
  };

  const handleSave = async (institutionData: Omit<Institution, 'id'> & { id?: string }) => {
    let savedInst: Institution;
    let updatedList: Institution[];
    if (institutionData.id) {
      const prevInst = institutions.find(inst => inst.id === institutionData.id);
      savedInst = { ...prevInst, ...institutionData } as Institution;
      updatedList = institutions.map(inst => inst.id === institutionData.id ? savedInst : inst);
    } else {
      savedInst = {
        ...institutionData,
        id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        logoUrl: institutionData.logoUrl || 'https://placehold.co/150x150/cccccc/333333?text=Logo',
        activeModules: institutionData.activeModules || { dece: false, health: false },
        status: institutionData.status || 'active',
      } as Institution;
      updatedList = [...institutions, savedInst];
    }
    setInstitutions(updatedList);
    if (onUpdateInstitutions) onUpdateInstitutions(updatedList);
    await saveDocument('institutions', savedInst.id, savedInst);
    setIsFormOpen(false);
  };

  const handleUpdateFromDetails = (updated: Institution) => {
    const updatedList = institutions.map(i => i.id === updated.id ? updated : i);
    setInstitutions(updatedList);
    if (onUpdateInstitutions) onUpdateInstitutions(updatedList);
    setTrackingInstitution(updated);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'AMIE', 'Estado', 'Régimen', 'Provincia', 'Email', 'Teléfono', 'Total Usuarios', 'Docentes', 'Estudiantes', 'DECE', 'Salud'];
    const rows = institutions.map(inst => {
      const st = getInstStats(inst.id);
      return [
        `"${inst.id}"`,
        `"${inst.name || ''}"`,
        `"${inst.codeAMIE || ''}"`,
        `"${inst.status || 'active'}"`,
        `"${inst.regime || 'Sierra'}"`,
        `"${inst.province || ''}"`,
        `"${inst.contact?.email || ''}"`,
        `"${inst.contact?.phone || ''}"`,
        st.totalUsers,
        st.teachers,
        st.students,
        inst.activeModules?.dece ? 'Sí' : 'No',
        inst.activeModules?.health ? 'Sí' : 'No',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amauta_censo_instituciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Executive Header with Andean Brand & Stats */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <AmautaLogo className="h-12 w-auto flex-shrink-0" mode="light" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Consola de Control y Seguimiento Federado
                </h1>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                  SuperAdmin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisión centralizada, auditoría y control de centros educativos en la red Amauta
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex bg-slate-100 p-1.5 rounded-xl overflow-x-auto no-scrollbar gap-1">
            <button 
              onClick={() => setView('institutions')} 
              className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap transition-all ${
                view === 'institutions' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UsersIcon className="h-4 w-4"/> Instituciones ({networkMetrics.totalInst})
            </button>
            <button 
              onClick={() => setView('curriculum_master')} 
              className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap transition-all ${
                view === 'curriculum_master' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArchiveBoxIcon className="h-4 w-4"/> Malla Maestra
            </button>
            <button 
              onClick={() => setView('pei_audit')} 
              className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap transition-all ${
                view === 'pei_audit' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardDocumentCheckIcon className="h-4 w-4"/> Auditoría PEI
            </button>
            <button 
              onClick={() => setView('quality')} 
              className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap transition-all ${
                view === 'quality' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ChartBarIcon className="h-4 w-4"/> Estándares
            </button>
            <button 
              onClick={() => setView('resources')} 
              className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-2 whitespace-nowrap transition-all ${
                view === 'resources' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SparklesIcon className="h-4 w-4"/> Banco Global
            </button>
          </nav>
        </div>

        {/* Global KPI Cards */}
        {view === 'institutions' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Centros Federados</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{networkMetrics.totalInst}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className="text-emerald-700 font-semibold">{networkMetrics.activeInst} activas</span>
                {networkMetrics.pendingInst > 0 && <span className="text-amber-700 font-semibold">· {networkMetrics.pendingInst} pendientes</span>}
              </div>
            </div>

            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Comunidad Total</span>
              <p className="text-2xl font-black text-blue-900 mt-1">{networkMetrics.totalUsers}</p>
              <p className="text-[11px] text-blue-700 mt-1">
                {networkMetrics.totalTeachers} docentes activos
              </p>
            </div>

            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Alumnado Total</span>
              <p className="text-2xl font-black text-purple-900 mt-1">{networkMetrics.totalStudents}</p>
              <p className="text-[11px] text-purple-700 mt-1">Matriculados en red</p>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Módulos Activos</span>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                  DECE: {networkMetrics.deceAdoption}
                </span>
                <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                  Salud: {networkMetrics.healthAdoption}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View: Instituciones */}
      {view === 'institutions' && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Filters, View toggle, Export */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre, código AMIE, provincia o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="active">Activas</option>
                <option value="pending">En Configuración</option>
                <option value="suspended">Suspendidas</option>
              </select>

              {/* Module filter */}
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value as any)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
              >
                <option value="ALL">Todos los Módulos</option>
                <option value="dece">Con Módulo DECE</option>
                <option value="health">Con Módulo Salud</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {/* Cards / Table toggle */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDisplayMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    displayMode === 'cards' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'
                  }`}
                  title="Vista Cuadrícula de Tarjetas"
                >
                  Tarjetas
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    displayMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600'
                  }`}
                  title="Vista Tabla de Datos"
                >
                  Tabla
                </button>
              </div>

              {/* Export */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition"
                title="Exportar censo institucional en CSV"
              >
                📥 Exportar
              </button>

              {/* Add New */}
              <button
                type="button"
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm text-xs transition"
              >
                <PlusIcon className="h-4 w-4" />
                Nueva Institución
              </button>
            </div>
          </div>

          {/* Cards Display Mode */}
          {displayMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInstitutions.length > 0 ? (
                filteredInstitutions.map(inst => {
                  const stats = getInstStats(inst.id);
                  const isSuspended = inst.status === 'suspended';
                  const isPending = inst.status === 'pending';

                  return (
                    <div 
                      key={inst.id} 
                      className={`bg-white rounded-2xl shadow-sm border transition hover:shadow-md flex flex-col justify-between overflow-hidden ${
                        isSuspended ? 'border-rose-200 bg-rose-50/20' : isPending ? 'border-amber-200' : 'border-slate-200'
                      }`}
                    >
                      <div className="p-5 space-y-4">
                        {/* Card Top: Logo, Name, AMIE, Status */}
                        <div className="flex items-start gap-3">
                          <img 
                            src={inst.logoUrl || 'https://placehold.co/150x150/cccccc/333333?text=Logo'} 
                            alt={inst.name} 
                            className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200 p-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-bold text-slate-900 text-sm truncate" title={inst.name}>
                                {inst.name}
                              </h3>
                              {isSuspended ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  Suspendida
                                </span>
                              ) : isPending ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  Configuración
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Activa
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                AMIE: {inst.codeAMIE || 'N/A'}
                              </span>
                              {inst.regime && (
                                <span className="text-[11px] text-slate-500">
                                  {inst.regime}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Location and contact info */}
                        <div className="text-[11px] text-slate-600 space-y-1">
                          {inst.province && (
                            <p className="flex items-center gap-1.5 truncate">
                              <LocationMarkerIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span>{inst.province}{inst.canton ? `, ${inst.canton}` : ''}</span>
                            </p>
                          )}
                          <p className="truncate text-slate-500">
                            ✉ {inst.contact?.email || 'Sin correo registrado'}
                          </p>
                        </div>

                        {/* Population Metrics Grid */}
                        <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Usuarios</span>
                            <span className="text-sm font-black text-slate-800">{stats.totalUsers}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Docentes</span>
                            <span className="text-sm font-black text-blue-700">{stats.teachers}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Alumnos</span>
                            <span className="text-sm font-black text-purple-700">{stats.students}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Aulas</span>
                            <span className="text-sm font-black text-emerald-700">{stats.classes}</span>
                          </div>
                        </div>

                        {/* Active modules indicators */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inst.activeModules?.dece 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            <DeceIcon className="w-3 h-3" /> DECE
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inst.activeModules?.health 
                              ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            <HealthIcon className="w-3 h-3" /> Salud
                          </span>
                          <span className="ml-auto text-[10px] font-semibold text-slate-400">
                            {inst.methodologyFocus || 'DUA'}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleOpenTracking(inst)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-100/70 hover:bg-blue-200 rounded-lg transition"
                        >
                          Control y Métricas ↗
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(inst)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white transition"
                            title="Editar institución"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(inst.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white transition"
                            title="Eliminar institución"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                  <p className="text-base font-bold text-slate-600">No se encontraron instituciones registradas</p>
                  <p className="text-xs text-slate-400 mt-1">Prueba cambiando los términos de búsqueda o filtros.</p>
                </div>
              )}
            </div>
          )}

          {/* Table Display Mode */}
          {displayMode === 'table' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-black text-slate-600 uppercase tracking-wider">Institución</th>
                      <th className="px-5 py-3.5 text-left font-black text-slate-600 uppercase tracking-wider">AMIE</th>
                      <th className="px-5 py-3.5 text-left font-black text-slate-600 uppercase tracking-wider">Estado</th>
                      <th className="px-5 py-3.5 text-left font-black text-slate-600 uppercase tracking-wider">Población</th>
                      <th className="px-5 py-3.5 text-left font-black text-slate-600 uppercase tracking-wider">Módulos</th>
                      <th className="px-5 py-3.5 text-left font-black text-slate-600 uppercase tracking-wider">Contacto</th>
                      <th className="px-5 py-3.5 text-right font-black text-slate-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredInstitutions.length > 0 ? (
                      filteredInstitutions.map(inst => {
                        const st = getInstStats(inst.id);
                        return (
                          <tr key={inst.id} className="hover:bg-slate-50 transition">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={inst.logoUrl || 'https://placehold.co/150x150/cccccc/333333?text=Logo'} 
                                  alt={inst.name} 
                                  className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                                />
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{inst.name}</p>
                                  <p className="text-[11px] text-slate-400">{inst.province || 'Ecuador'} {inst.canton ? `· ${inst.canton}` : ''}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-mono font-bold text-blue-700">
                              {inst.codeAMIE || 'N/A'}
                            </td>
                            <td className="px-5 py-4">
                              {inst.status === 'suspended' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Suspendida</span>
                              ) : inst.status === 'pending' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Configuración</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Activa</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="space-y-0.5 text-[11px]">
                                <span className="font-bold text-slate-800">{st.totalUsers} usuarios</span>
                                <p className="text-slate-400">({st.teachers} doc · {st.students} est)</p>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inst.activeModules?.dece ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'}`}>
                                  DECE
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inst.activeModules?.health ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-400'}`}>
                                  Salud
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              <p>{inst.contact?.email || 'Sin correo'}</p>
                              <p className="text-[11px] text-slate-400">{inst.contact?.phone || 'Sin tel'}</p>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenTracking(inst)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                >
                                  Detalle
                                </button>
                                <button 
                                  onClick={() => handleEdit(inst)} 
                                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                                >
                                  <EditIcon className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(inst.id)} 
                                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                          No se encontraron instituciones registradas con los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View: Malla Maestra Curricular */}
      {view === 'curriculum_master' && (
        <div className="animate-fade-in">
          <CurriculumRepositoryPage 
            dcds={dcds}
            evaluationCriteria={evaluationCriteria}
            evaluationIndicators={evaluationIndicators}
            subjects={subjects}
            onUpdateDcds={onUpdateDcds}
            onUpdateEvaluationCriteria={onUpdateEvaluationCriteria}
            onUpdateEvaluationIndicators={onUpdateEvaluationIndicators}
            readOnly={false}
          />
        </div>
      )}

      {/* View: Auditoría PEI */}
      {view === 'pei_audit' && <PeiAudit />}

      {/* View: Estándares de Calidad */}
      {view === 'quality' && <EducationalQualityAudit institutions={institutions} />}

      {/* View: Banco Global */}
      {view === 'resources' && (
        <div className="animate-fade-in">
          <ResourceRepositoryPage 
            dcds={dcds} 
            rubrics={[]} 
            onUpdateRubrics={() => {}} 
            subjects={subjects} 
          />
        </div>
      )}

      {/* Add / Edit Institution Modal */}
      {isFormOpen && (
        <InstitutionForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
          institutionToEdit={editingInstitution}
          allUsers={users}
        />
      )}

      {/* Institutional Tracking & Control Modal */}
      {trackingInstitution && (
        <InstitutionDetailsModal
          isOpen={!!trackingInstitution}
          onClose={() => setTrackingInstitution(null)}
          institution={trackingInstitution}
          allUsers={users}
          allClasses={classes}
          allStudents={students}
          onUpdateInstitution={handleUpdateFromDetails}
        />
      )}
    </div>
  );
};

export default SuperAdminPage;
