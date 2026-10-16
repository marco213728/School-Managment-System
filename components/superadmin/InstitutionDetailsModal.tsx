import React, { useState, useMemo } from 'react';
import { Institution, User, Role, Class, Student } from '../../types';
import { 
  CloseIcon, 
  UsersIcon, 
  PhoneIcon, 
  EmailIcon, 
  LocationMarkerIcon, 
  CheckCircleIcon,
  SparklesIcon,
  DeceIcon,
  HealthIcon,
  ClipboardDocumentCheckIcon
} from '../icons/Icons';
import { saveDocument } from '../../lib/firebase';

interface InstitutionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution: Institution;
  allUsers: User[];
  allClasses?: Class[];
  allStudents?: Student[];
  onUpdateInstitution: (updated: Institution) => void;
}

export const InstitutionDetailsModal: React.FC<InstitutionDetailsModalProps> = ({
  isOpen,
  onClose,
  institution,
  allUsers,
  allClasses = [],
  allStudents = [],
  onUpdateInstitution,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'modules' | 'geofence'>('overview');
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form state for modules and control settings
  const [deceActive, setDeceActive] = useState(institution.activeModules?.dece ?? false);
  const [healthActive, setHealthActive] = useState(institution.activeModules?.health ?? false);
  const [status, setStatus] = useState(institution.status || 'active');
  const [regime, setRegime] = useState(institution.regime || 'Sierra');
  const [methodology, setMethodology] = useState(institution.methodologyFocus || 'DUA');
  const [province, setProvince] = useState(institution.province || '');
  const [canton, setCanton] = useState(institution.canton || '');
  const [codeAMIE, setCodeAMIE] = useState(institution.codeAMIE || '');
  const [phone, setPhone] = useState(institution.contact?.phone || '');
  const [email, setEmail] = useState(institution.contact?.email || '');
  const [address, setAddress] = useState(institution.contact?.address || '');

  // Geofence
  const [geoLat, setGeoLat] = useState(institution.geofenceConfig?.latitude?.toString() || '');
  const [geoLng, setGeoLng] = useState(institution.geofenceConfig?.longitude?.toString() || '');
  const [geoRadius, setGeoRadius] = useState(institution.geofenceConfig?.radius?.toString() || '150');

  // Institution-specific users
  const instUsers = useMemo(() => {
    return allUsers.filter(u => u.institutionId === institution.id);
  }, [allUsers, institution.id]);

  // Breakdown counts
  const counts = useMemo(() => {
    const teachers = instUsers.filter(u => u.role === Role.Teacher).length;
    const rectors = instUsers.filter(u => u.role === Role.Rector || u.role === Role.Vicerrector).length;
    const inspectors = instUsers.filter(u => u.role === Role.InspectorGeneral).length;
    const dece = instUsers.filter(u => u.role === Role.JefeDECE || u.role === Role.PsicologoEducativo || u.role === Role.TrabajadorSocial).length;
    const health = instUsers.filter(u => u.role === Role.HealthProfessional).length;
    const parents = instUsers.filter(u => u.role === Role.Parent).length;
    const students = instUsers.filter(u => u.role === Role.Student).length;
    const classes = allClasses.filter(c => c.institutionId === institution.id).length;
    const enrolledStudents = allStudents.filter(s => s.institutionId === institution.id).length || students;

    return {
      total: instUsers.length,
      teachers,
      rectors,
      inspectors,
      dece,
      health,
      parents,
      students: enrolledStudents,
      classes,
    };
  }, [instUsers, allClasses, allStudents, institution.id]);

  const filteredUsers = useMemo(() => {
    let list = instUsers;
    if (roleFilter !== 'ALL') {
      list = list.filter(u => u.role === roleFilter);
    }
    if (searchUser.trim()) {
      const q = searchUser.toLowerCase();
      list = list.filter(u => 
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [instUsers, roleFilter, searchUser]);

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const updated: Institution = {
        ...institution,
        codeAMIE: codeAMIE.trim(),
        status: status as any,
        regime: regime as any,
        methodologyFocus: methodology,
        province: province.trim(),
        canton: canton.trim(),
        contact: {
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
        },
        activeModules: {
          dece: deceActive,
          health: healthActive,
        },
        geofenceConfig: geoLat && geoLng ? {
          latitude: parseFloat(geoLat) || 0,
          longitude: parseFloat(geoLng) || 0,
          radius: parseInt(geoRadius, 10) || 150,
        } : institution.geofenceConfig,
      };

      await saveDocument('institutions', updated.id, updated);
      onUpdateInstitution(updated);
      setFeedback('¡Configuración institucional guardada exitosamente!');
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error(err);
      setFeedback('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st?: string) => {
    switch (st) {
      case 'active':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">Activa</span>;
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">En Configuración</span>;
      case 'suspended':
        return <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200">Suspendida</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">Activa</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={institution.logoUrl || 'https://placehold.co/150x150/cccccc/333333?text=Logo'} 
              alt={institution.name} 
              className="w-14 h-14 rounded-xl object-cover bg-white p-1 border-2 border-white/20 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold leading-tight">{institution.name}</h2>
                {getStatusBadge(status)}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-300">
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-amber-300 font-semibold">
                  AMIE: {codeAMIE || 'No asignado'}
                </span>
                <span>Régimen: {regime}</span>
                {province && <span>{province}{canton ? ` · ${canton}` : ''}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📊 Resumen y Métricas
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            👥 Población ({counts.total})
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
              activeTab === 'modules'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚙ Control y Módulos
          </button>
          <button
            onClick={() => setActiveTab('geofence')}
            className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
              activeTab === 'geofence'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📍 Geocerca y Contacto
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <span>✓</span>
            <span>{feedback}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 max-h-[68vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">Total Comunidad</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">{counts.total}</p>
                  <p className="text-[10px] text-blue-600 mt-0.5">Usuarios en plataforma</p>
                </div>
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Docentes</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">{counts.teachers}</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Planta docente activa</p>
                </div>
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">Estudiantes</p>
                  <p className="text-2xl font-black text-purple-900 mt-1">{counts.students}</p>
                  <p className="text-[10px] text-purple-600 mt-0.5">{counts.classes} paralelos</p>
                </div>
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">Padres de Familia</p>
                  <p className="text-2xl font-black text-amber-900 mt-1">{counts.parents}</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">Representantes legales</p>
                </div>
              </div>

              {/* Departmental breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Estructura Organizacional
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Directivos / Rectorado:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{counts.rectors} asignados</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Inspección General:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{counts.inspectors} asignados</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Departamento DECE:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{counts.dece} profesionales</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500">Servicio de Salud:</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{counts.health} profesionales</p>
                  </div>
                </div>
              </div>

              {/* Status & Modules overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estado de Módulos</h4>
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <DeceIcon className="w-4 h-4 text-purple-600" /> Módulo DECE
                      </span>
                      {deceActive ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">Habilitado</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-full text-[10px]">Deshabilitado</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <HealthIcon className="w-4 h-4 text-rose-600" /> Módulo de Salud
                      </span>
                      {healthActive ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">Habilitado</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-full text-[10px]">Deshabilitado</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <SparklesIcon className="w-4 h-4 text-amber-500" /> Enfoque Curricular
                      </span>
                      <span className="font-bold text-slate-800">{methodology}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Datos de Contacto</h4>
                  <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                    <p className="flex items-center gap-2">
                      <EmailIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{email || 'No registrado'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{phone || 'No registrado'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <LocationMarkerIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{address || 'No registrado'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre o email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full sm:w-72 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ALL">Todos los roles ({instUsers.length})</option>
                  <option value={Role.Rector}>Rector ({counts.rectors})</option>
                  <option value={Role.Teacher}>Docentes ({counts.teachers})</option>
                  <option value={Role.InspectorGeneral}>Inspección ({counts.inspectors})</option>
                  <option value={Role.JefeDECE}>DECE ({counts.dece})</option>
                  <option value={Role.HealthProfessional}>Salud ({counts.health})</option>
                  <option value={Role.Student}>Estudiantes ({counts.students})</option>
                  <option value={Role.Parent}>Padres ({counts.parents})</option>
                </select>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-bold text-slate-600 uppercase">Nombre</th>
                      <th className="px-4 py-2.5 text-left font-bold text-slate-600 uppercase">Rol</th>
                      <th className="px-4 py-2.5 text-left font-bold text-slate-600 uppercase">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">ID: {u.id}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            <p>{u.email}</p>
                            {u.phone && <p className="text-[11px] text-slate-400">{u.phone}</p>}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                          No se encontraron usuarios registrados en esta institución con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                <p className="font-bold">Panel de Control de Configuración Federada</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Los cambios realizados aquí se sincronizan de forma inmediata con los perfiles de todos los usuarios de este centro educativo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Código AMIE Ministerial
                  </label>
                  <input
                    type="text"
                    value={codeAMIE}
                    onChange={(e) => setCodeAMIE(e.target.value)}
                    placeholder="Ej. 17H00123"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Estado Operativo
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="active">Activa (Acceso Completo)</option>
                    <option value="pending">En Configuración (Pruebas)</option>
                    <option value="suspended">Suspendida (Bloqueo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Régimen Escolar
                  </label>
                  <select
                    value={regime}
                    onChange={(e) => setRegime(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Sierra">Sierra / Amazonía</option>
                    <option value="Costa">Costa / Galápagos</option>
                    <option value="Insular">Insular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Enfoque Metodológico
                  </label>
                  <select
                    value={methodology}
                    onChange={(e) => setMethodology(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="DUA">DUA (Diseño Universal para el Aprendizaje)</option>
                    <option value="Tradicional">Tradicional / Estandarizado</option>
                    <option value="Constructivista">Constructivista / ABP</option>
                    <option value="Montessori">Montessori</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Ej. Pichincha, Guayas, Azuay"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Cantón / Ciudad
                  </label>
                  <input
                    type="text"
                    value={canton}
                    onChange={(e) => setCanton(e.target.value)}
                    placeholder="Ej. Quito, Guayaquil, Cuenca"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Module Toggles */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Conmutadores de Módulos Especializados
                </h4>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <DeceIcon className="w-4 h-4 text-purple-600" />
                      Módulo DECE (Consejería Estudiantil)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Habilita protocolos de intervención, mediación de conflictos, acuerdos y fichas de seguimiento.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={deceActive} 
                      onChange={(e) => setDeceActive(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <HealthIcon className="w-4 h-4 text-rose-600" />
                      Módulo de Salud Escolar y Enfermería
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Permite registrar atenciones médicas, certificados de visita y fichas de salud de estudiantes.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={healthActive} 
                      onChange={(e) => setHealthActive(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Ajustes de Control'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'geofence' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <LocationMarkerIcon className="w-4 h-4 text-blue-600" />
                  Geolocalización para Asistencia Biométrica
                </h4>
                <p className="text-xs text-slate-600">
                  Define el perímetro GPS donde el personal docente y administrativo puede validar su asistencia mediante geolocalización.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Latitud</label>
                    <input
                      type="number"
                      step="any"
                      value={geoLat}
                      onChange={(e) => setGeoLat(e.target.value)}
                      placeholder="-0.180653"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Longitud</label>
                    <input
                      type="number"
                      step="any"
                      value={geoLng}
                      onChange={(e) => setGeoLng(e.target.value)}
                      placeholder="-78.467838"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Radio (Metros)</label>
                    <input
                      type="number"
                      value={geoRadius}
                      onChange={(e) => setGeoRadius(e.target.value)}
                      placeholder="150"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Institucional</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dirección</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Geocerca y Contacto'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitutionDetailsModal;
