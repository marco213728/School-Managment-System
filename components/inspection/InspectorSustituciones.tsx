import React, { useState, useEffect, useMemo, useContext } from 'react';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { Role, User, AbsenceRequest, ScheduleEntry, Class, Subject, StaffAttendanceRecord, LeccionarioEntry, TimeSlot, MicroPlan } from '../../types';
import type { Notification as AppNotification } from '../../types';
import { 
  requestNotificationPermission, 
  notifyInspeccionOnAbsenceRequest, 
  notifyOnReplacementAssigned, 
  notifyOnLeccionarioRegistered 
} from '../../lib/notificationService';

interface DocenteDisponible {
  id: string;
  nombre: string;
  especialidad: string;
  coincideEspecialidad: boolean;
  reemplazosAcumuladosMes: number;
  horasAsignadasSemana: number;
}

interface AusenciaReportada {
  id: string;
  docenteTitular: string;
  docenteTitularId: string;
  fecha: string;
  periodo: number;
  diaSemana: number;
  classId: string;
  subjectId: string;
  asignaturaNombre: string;
  especialidadRequerida: string;
  paraleloNombre: string;
  aulaNombre: string;
  instrucciones?: string;
  planificacionUrl?: string;
}

interface InspectorSustitucionesProps {
    absenceRequests: AbsenceRequest[];
    onUpdateAbsenceRequests: (r: AbsenceRequest[]) => void;
    users: User[];
    schedule: ScheduleEntry[];
    classes: Class[];
    subjects: Subject[];
    staffAttendanceRecords: StaffAttendanceRecord[];
    notifications?: AppNotification[];
    onUpdateNotifications?: (notifs: AppNotification[]) => void;
    leccionarioEntries?: LeccionarioEntry[];
    onUpdateLeccionarioEntries?: (entries: LeccionarioEntry[]) => void;
    timeSlots?: TimeSlot[];
    microPlans?: MicroPlan[];
}

export const InspectorSustituciones: React.FC<InspectorSustitucionesProps> = ({ 
  users, 
  schedule, 
  classes, 
  subjects, 
  staffAttendanceRecords, 
  absenceRequests = [], 
  onUpdateAbsenceRequests = (_r: AbsenceRequest[]) => {},
  notifications = [],
  onUpdateNotifications,
  leccionarioEntries = [],
  onUpdateLeccionarioEntries,
  timeSlots = [],
  microPlans = []
}) => {
  const { user: currentUser } = useContext(UserContext);
  const { institution } = useContext(InstitutionContext);
  
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'assigned'>('pending');
  const [ausencias, setAusencias] = useState<AusenciaReportada[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
      docenteTitularId: "",
      fecha: new Date().toISOString().split('T')[0],
      diaSemana: new Date().getDay(),
      periodo: 1,
      classId: "",
      subjectId: "",
      instrucciones: "",
      planificacionUrl: ""
  });
  const [ausenciaSeleccionada, setAusenciaSeleccionada] = useState<AusenciaReportada | null>(null);
  const [candidatos, setCandidatos] = useState<DocenteDisponible[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'default'
  );

  // Leccionario Modal State
  const [leccionarioModalData, setLeccionarioModalData] = useState<{
    isOpen: boolean;
    absence: AbsenceRequest | null;
    topics: string;
    tasks: string;
    skillCode: string;
    observations: string;
  }>({
    isOpen: false,
    absence: null,
    topics: '',
    tasks: '',
    skillCode: 'REEMPLAZO-01',
    observations: ''
  });

  const handleRequestPush = async () => {
    const res = await requestNotificationPermission();
    setPushStatus(res);
    if (res === 'granted') {
      setMensajeExito('🔔 ¡Notificaciones Push activadas con éxito! Recibirá avisos en tiempo real en este dispositivo.');
    }
  };

  // Carga inicial de ausencias pendientes de cubrir
  useEffect(() => {
    const currentInstId = institution?.id || currentUser?.institutionId;
    if (currentInstId) {
        const pendingRequests = absenceRequests.filter(r => 
          (r.institutionId === currentInstId || r.institutionId === 'uemol' || !r.institutionId) && 
          r.estado === 'Pendiente'
        );
        const mapped: AusenciaReportada[] = pendingRequests.map(r => {
            const teacher = users.find(u => u.id === r.docenteTitularId);
            const cls = classes.find(c => c.id === r.classId);
            const sub = subjects.find(s => s.id === r.subjectId);
            return {
                id: r.id,
                docenteTitular: teacher?.name || 'Docente Titular',
                docenteTitularId: r.docenteTitularId || '',
                fecha: r.fecha,
                periodo: r.periodo,
                diaSemana: r.diaSemana,
                classId: r.classId,
                subjectId: r.subjectId,
                asignaturaNombre: sub?.name || 'Asignatura Asignada',
                especialidadRequerida: sub?.name || 'General',
                paraleloNombre: cls?.name || 'Curso',
                aulaNombre: 'Aula Oficial',
                instrucciones: r.instrucciones,
                planificacionUrl: r.planificacionUrl
            };
        });
        setAusencias(mapped);
    }
  }, [institution, currentUser, absenceRequests, users, classes, subjects]);

  // Lista de reemplazos aprobados / asignados
  const reemplazosAsignados = useMemo(() => {
    const currentInstId = institution?.id || currentUser?.institutionId;
    return absenceRequests.filter(r => 
      (r.institutionId === currentInstId || r.institutionId === 'uemol' || !r.institutionId) && 
      r.estado === 'Aprobado'
    );
  }, [absenceRequests, institution, currentUser]);

  // Algoritmo de detección de Horas Huecas localmente usando los datos del sistema
  const consultarDocentesDisponibles = async (ausencia: AusenciaReportada) => {
    setLoading(true);
    setAusenciaSeleccionada(ausencia);
    setMensajeExito(null);
    
    setTimeout(() => {
        const currentInstId = institution?.id || currentUser?.institutionId;
        // Filtrar docentes de esta institucion
        const docentesInstitucion = users.filter(u => 
          (u.institutionId === currentInstId || u.institutionId === 'none' || !u.institutionId) && 
          u.role === Role.Teacher && 
          u.id !== ausencia.docenteTitularId
        );
        
        const disponibles: DocenteDisponible[] = [];
        
        const daysMap: Record<number, 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes'> = {
            1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes'
        };
        const diaNombre = daysMap[ausencia.diaSemana] || 'Lunes';

        docentesInstitucion.forEach(docente => {
            const docenteSubjectIds = new Set(subjects.filter(s => s.teacherId === docente.id).map(s => s.id));
            const scheduleEntry = schedule.find(s => 
                docenteSubjectIds.has(s.subjectId) && 
                s.day === diaNombre
            );
            
            // Verificar si el docente está ausente hoy
            const isAusenteHoy = staffAttendanceRecords.some(r => r.userId === docente.id && r.date === ausencia.fecha && r.punches?.length === 0);

            // Si es hora hueca
            if (!scheduleEntry && !isAusenteHoy) {
                const totalHoras = schedule.filter(s => docenteSubjectIds.has(s.subjectId)).length;
                const subjectsDocente = subjects.filter(s => s.teacherId === docente.id);
                const coincideEspecialidad = subjectsDocente.some(s => 
                  s.name.toLowerCase().includes(ausencia.asignaturaNombre.toLowerCase()) ||
                  ausencia.asignaturaNombre.toLowerCase().includes(s.name.toLowerCase())
                );

                // Conteo de reemplazos reales asignados en el mes
                const reemplazosMes = absenceRequests.filter(r => 
                  r.docenteReemplazanteId === docente.id && 
                  r.estado === 'Aprobado'
                ).length;

                disponibles.push({
                    id: docente.id,
                    nombre: docente.name,
                    especialidad: subjectsDocente[0]?.name || 'Educación General',
                    coincideEspecialidad: coincideEspecialidad,
                    reemplazosAcumuladosMes: reemplazosMes,
                    horasAsignadasSemana: totalHoras
                });
            }
        });
        
        // Ordenar por rotación equitativa (especialidad primero, luego menor carga de reemplazos)
        disponibles.sort((a, b) => {
            if (a.coincideEspecialidad && !b.coincideEspecialidad) return -1;
            if (!a.coincideEspecialidad && b.coincideEspecialidad) return 1;
            return a.reemplazosAcumuladosMes - b.reemplazosAcumuladosMes;
        });

        setCandidatos(disponibles);
        setLoading(false);
    }, 400);
  };

  const ejecutarReasignacionYNotificar = async (docenteId: string) => {
    if (!ausenciaSeleccionada) return;

    try {
      const candidato = candidatos.find(c => c.id === docenteId) || users.find(u => u.id === docenteId);
      const originalReq = absenceRequests.find(r => r.id === ausenciaSeleccionada.id);
      
      const candidateName = candidato ? ('nombre' in candidato ? (candidato as DocenteDisponible).nombre : (candidato as User).name) : 'Docente Reemplazante';

      const updatedReq: AbsenceRequest = {
        ...(originalReq || {
          id: ausenciaSeleccionada.id,
          institutionId: institution?.id || currentUser?.institutionId || 'uemol',
          docenteTitularId: ausenciaSeleccionada.docenteTitularId,
          fecha: ausenciaSeleccionada.fecha,
          periodo: ausenciaSeleccionada.periodo,
          diaSemana: ausenciaSeleccionada.diaSemana,
          classId: ausenciaSeleccionada.classId,
          subjectId: ausenciaSeleccionada.subjectId,
          instrucciones: ausenciaSeleccionada.instrucciones || 'Completar actividades en clase.',
          creadoPorRol: currentUser?.role || Role.InspectorGeneral,
        }),
        estado: 'Aprobado',
        docenteReemplazanteId: docenteId,
        docenteReemplazanteNombre: candidateName,
      };

      const updatedRequests = absenceRequests.some(r => r.id === updatedReq.id)
        ? absenceRequests.map(r => r.id === updatedReq.id ? updatedReq : r)
        : [...absenceRequests, updatedReq];

      onUpdateAbsenceRequests(updatedRequests);
      
      const teacherTitular = users.find(u => u.id === ausenciaSeleccionada.docenteTitularId);
      const teacherReemplazante = users.find(u => u.id === docenteId);
      const sub = subjects.find(s => s.id === ausenciaSeleccionada.subjectId);
      const cls = classes.find(c => c.id === ausenciaSeleccionada.classId);

      // Enviar notificaciones push a Inspección, al solicitante y al reemplazante
      await notifyOnReplacementAssigned({
        absenceRequest: updatedReq,
        docenteTitular: teacherTitular,
        docenteReemplazante: teacherReemplazante,
        subject: sub,
        classObj: cls,
        users,
        currentNotifications: notifications,
        onUpdateNotifications
      });

      setMensajeExito(`✅ ¡Reemplazo asignado exitosamente! Se envió una Notificación Push a ${teacherTitular?.name || 'el solicitante'} (informándole sobre ${candidateName}) y a ${candidateName} (con las instrucciones de la clase).`);
      
      setAusencias(prev => prev.filter(a => a.id !== ausenciaSeleccionada.id));
      setAusenciaSeleccionada(null);
      setCandidatos([]);
    } catch (e) {
      console.error("Error al registrar el reemplazo", e);
    }
  };

  const handleAddAbsence = async (e: React.FormEvent) => {
      e.preventDefault();
      const currentInstId = institution?.id || currentUser?.institutionId || 'uemol';
      const newAbsence: AbsenceRequest = {
          ...formData,
          diaSemana: formData.diaSemana ?? new Date(formData.fecha).getDay(),
          id: `abs-${Date.now()}`,
          institutionId: currentInstId,
          estado: 'Pendiente',
          creadoPorRol: currentUser?.role || Role.InspectorGeneral
      };

      const updated = [...absenceRequests, newAbsence];
      onUpdateAbsenceRequests(updated);

      const titularTeacher = users.find(u => u.id === formData.docenteTitularId);
      const sub = subjects.find(s => s.id === formData.subjectId);
      const cls = classes.find(c => c.id === formData.classId);

      // Enviar notificación push inmediata a Inspección
      await notifyInspeccionOnAbsenceRequest({
        absenceRequest: newAbsence,
        docenteTitular: titularTeacher,
        subject: sub,
        classObj: cls,
        users,
        currentNotifications: notifications,
        onUpdateNotifications
      });

      setIsFormOpen(false);
      setMensajeExito(`📢 Ausencia reportada correctamente. Se enviaron notificaciones push al equipo de Inspección.`);
      setFormData({
          docenteTitularId: "",
          fecha: new Date().toISOString().split('T')[0],
          diaSemana: new Date().getDay(),
          periodo: 1,
          classId: "",
          subjectId: "",
          instrucciones: "",
          planificacionUrl: ""
      });
  };

  // Abrir modal para registrar en leccionario
  const handleOpenLeccionarioModal = (req: AbsenceRequest) => {
    const titularTeacher = users.find(u => u.id === req.docenteTitularId);
    const sub = subjects.find(s => s.id === req.subjectId);
    const cls = classes.find(c => c.id === req.classId);
    const reemplazanteTeacher = users.find(u => u.id === req.docenteReemplazanteId);

    // Buscar si ya existe una entrada previa
    const existing = leccionarioEntries.find(l => 
      l.absenceRequestId === req.id || 
      (l.classId === req.classId && l.subjectId === req.subjectId && l.date === req.fecha)
    );

    setLeccionarioModalData({
      isOpen: true,
      absence: req,
      topics: existing?.topics || `Clase de Reemplazo para ${titularTeacher?.name || 'Titular'} - ${sub?.name || 'Asignatura'}`,
      tasks: existing?.tasks || req.instrucciones || 'Actividades de la planificación de contingencia.',
      skillCode: existing?.skillCode || 'DCD-REEMPLAZO',
      observations: existing?.observations || `Sustitución efectuada por ${reemplazanteTeacher?.name || req.docenteReemplazanteNombre || 'Docente'}. ${req.planificacionUrl ? `Material: ${req.planificacionUrl}` : ''}`
    });
  };

  const handleSaveLeccionarioEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leccionarioModalData.absence) return;

    const req = leccionarioModalData.absence;
    const currentInstId = institution?.id || currentUser?.institutionId || req.institutionId || 'uemol';

    // Resolver timeSlotId
    let slotId = timeSlots.find(ts => ts.institutionId === currentInstId)?.id || `slot-${req.periodo}`;

    const newLeccionarioEntry: LeccionarioEntry = {
      id: req.leccionarioEntryId || `lec-rep-${Date.now()}`,
      institutionId: currentInstId,
      teacherId: req.docenteReemplazanteId || currentUser?.id || '',
      classId: req.classId,
      subjectId: req.subjectId,
      date: req.fecha,
      timeSlotId: slotId,
      skillCode: leccionarioModalData.skillCode,
      topics: leccionarioModalData.topics,
      tasks: leccionarioModalData.tasks,
      observations: leccionarioModalData.observations,
      isReplacement: true,
      replacedTeacherId: req.docenteTitularId,
      substituteTeacherName: req.docenteReemplazanteNombre,
      absenceRequestId: req.id,
    };

    // Actualizar leccionarioEntries
    if (onUpdateLeccionarioEntries) {
      const filtered = leccionarioEntries.filter(l => l.id !== newLeccionarioEntry.id);
      onUpdateLeccionarioEntries([...filtered, newLeccionarioEntry]);
    }

    // Actualizar absenceRequest con leccionarioRegistered: true
    const updatedAbsences = absenceRequests.map(r => 
      r.id === req.id ? {
        ...r,
        leccionarioRegistered: true,
        leccionarioEntryId: newLeccionarioEntry.id,
        leccionarioDate: new Date().toISOString(),
        reemplazoObservaciones: leccionarioModalData.observations
      } : r
    );
    onUpdateAbsenceRequests(updatedAbsences);

    // Notificar a inspección y al docente titular
    const titularTeacher = users.find(u => u.id === req.docenteTitularId);
    const reemplazanteTeacher = users.find(u => u.id === req.docenteReemplazanteId);
    const sub = subjects.find(s => s.id === req.subjectId);
    const cls = classes.find(c => c.id === req.classId);

    await notifyOnLeccionarioRegistered({
      absenceRequest: { ...req, leccionarioRegistered: true },
      docenteReemplazante: reemplazanteTeacher,
      docenteTitular: titularTeacher,
      subject: sub,
      classObj: cls,
      users,
      currentNotifications: notifications,
      onUpdateNotifications
    });

    setLeccionarioModalData(prev => ({ ...prev, isOpen: false, absence: null }));
    setMensajeExito(`📖 ¡Registro en Leccionario guardado con éxito! Se notificó al docente titular e inspección.`);
  };

  return (
    <>
    <div className="bg-gray-50 animate-fade-in p-4 rounded-xl border border-gray-200">
      
      {/* Top Banner: Control de Notificaciones Push & Pestañas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            📋 Sistema de Sustituciones y Reemplazos
          </h2>
          <p className="text-xs text-gray-500">
            Detección de horas huecas, asignación de docentes sustitutos, notificaciones push automáticas y registro en Leccionario.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pushStatus !== 'granted' ? (
            <button
              onClick={handleRequestPush}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              title="Habilitar notificaciones en el navegador para recibir alertas inmediatas"
            >
              🔔 Activar Notificaciones Push
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Push Activo
            </span>
          )}

          <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
              + Reportar Ausencia
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded-r-xl shadow-sm flex items-center justify-between">
          <span>{mensajeExito}</span>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-700 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Navegación Secundaria: Pendientes vs Asignados */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`py-2.5 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'pending'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🚨 Ausencias Pendientes ({ausencias.length})
        </button>
        <button
          onClick={() => setActiveSubTab('assigned')}
          className={`py-2.5 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'assigned'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ✅ Reemplazos Asignados ({reemplazosAsignados.length})
        </button>
      </div>

      {activeSubTab === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Panel Izquierdo: Ausencias Pendientes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   🚨 Ausencias Pendientes de Cubrir
                </h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">Lista de novedades reportadas por inspección y docentes que requieren acompañamiento.</p>
            
            <div className="space-y-4">
              {ausencias.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No hay ausencias pendientes de cubrir hoy.
                  </div>
              ) : ausencias.map(ausencia => (
                <div 
                  key={ausencia.id}
                  onClick={() => consultarDocentesDisponibles(ausencia)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all hover:border-indigo-400 ${
                    ausenciaSeleccionada?.id === ausencia.id ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-gray-900">{ausencia.docenteTitular}</h4>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Bloque / Periodo {ausencia.periodo}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1"><strong>Fecha:</strong> {ausencia.fecha}</p>
                  <p className="text-xs text-gray-600 mb-1"><strong>Asignatura:</strong> {ausencia.asignaturaNombre} en {ausencia.paraleloNombre}</p>
                  
                  {ausencia.instrucciones && (
                    <div className="mt-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
                        <strong className="text-indigo-900">Instrucciones para el reemplazo:</strong> {ausencia.instrucciones}
                    </div>
                  )}

                  {ausencia.planificacionUrl && (
                    <div className="mt-2">
                      <a 
                        href={ausencia.planificacionUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        🔗 Ver Planificación de Contingencia Adjunta
                      </a>
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <span className="text-[11px] text-indigo-600 font-medium hover:underline">
                      Buscar docentes en hora hueca →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel Derecho: Buscador de Horas Libres y Asignador de Reemplazos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🔎 Buscador de Horas Libres y Sustitutos</h3>
            <p className="text-xs text-gray-500 mb-4">Algoritmo de balanceo por especialidad y menor carga de sustitución en el mes.</p>

            {ausenciaSeleccionada ? (
              <div>
                <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                  Reemplazo para el <strong>Bloque {ausenciaSeleccionada.periodo}</strong> en <strong>{ausenciaSeleccionada.asignaturaNombre} ({ausenciaSeleccionada.paraleloNombre})</strong>. Especialidad: <span className="font-bold underline">{ausenciaSeleccionada.especialidadRequerida}</span>.
                </div>

                {loading ? (
                  <div className="text-center py-12 text-sm text-indigo-600 font-medium animate-pulse">
                      Analizando horarios y franjas libres del distributivo docente...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Docentes Disponibles ({candidatos.length})</h4>
                    {candidatos.length === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-500 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          No se encontraron docentes con hora libre en este periodo.
                        </div>
                    ) : candidatos.map(candidato => (
                      <div 
                        key={candidato.id} 
                        className="p-4 border border-gray-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 gap-4 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-sm text-gray-900">{candidato.nombre}</h5>
                            {candidato.coincideEspecialidad && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                Especialista
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Especialidad: {candidato.especialidad}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                              Reemplazos este mes: {candidato.reemplazosAcumuladosMes}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Horas asignadas: {candidato.horasAsignadasSemana}h
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => ejecutarReasignacionYNotificar(candidato.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm hover:shadow"
                        >
                          Asignar y Notificar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 px-8 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                Selecciona una ausencia en el panel izquierdo para analizar las horas huecas disponibles del personal en tiempo real.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Pestaña: Historial de Reemplazos Asignados y Estado de Leccionario */
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Historial de Reemplazos y Leccionarios Oficiales</h3>
              <p className="text-xs text-gray-500">Monitoreo de docentes que cubrieron clases y verificación de registro en el Leccionario.</p>
            </div>
          </div>

          {reemplazosAsignados.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Aún no se registran reemplazos asignados en este periodo.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                  <tr>
                    <th className="p-3">Fecha / Bloque</th>
                    <th className="p-3">Paralelo y Asignatura</th>
                    <th className="p-3">Docente Titular (Ausente)</th>
                    <th className="p-3">Docente Reemplazante</th>
                    <th className="p-3">Instrucciones Entregadas</th>
                    <th className="p-3">Estado Leccionario</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reemplazosAsignados.map(req => {
                    const titular = users.find(u => u.id === req.docenteTitularId);
                    const reemplazante = users.find(u => u.id === req.docenteReemplazanteId);
                    const cls = classes.find(c => c.id === req.classId);
                    const sub = subjects.find(s => s.id === req.subjectId);
                    const isRegistered = req.leccionarioRegistered;

                    return (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-semibold text-gray-900">{req.fecha}</p>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Bloque {req.periodo}</span>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-gray-800">{sub?.name || 'Asignatura'}</p>
                          <p className="text-[11px] text-gray-500">{cls?.name || 'Paralelo'}</p>
                        </td>
                        <td className="p-3">
                          <span className="text-red-700 font-medium">{titular?.name || 'Titular'}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-emerald-700 font-bold">{reemplazante?.name || req.docenteReemplazanteNombre || 'Reemplazante'}</span>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="text-gray-700 truncate" title={req.instrucciones}>{req.instrucciones}</p>
                          {req.planificacionUrl && (
                            <a href={req.planificacionUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 hover:underline">
                              Material Adjunto
                            </a>
                          )}
                        </td>
                        <td className="p-3">
                          {isRegistered ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                              ✓ Registrado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">
                              ⏳ Pendiente
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenLeccionarioModal(req)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
                              isRegistered 
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                            }`}
                          >
                            {isRegistered ? 'Ver / Editar Leccionario' : '📝 Registrar en Leccionario'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>

    {/* Modal: Reportar Ausencia */}
    {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Reportar Novedad / Solicitud de Ausencia</h3>
                    <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleAddAbsence} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Docente Ausente</label>
                            <select 
                                required
                                className="w-full p-2 text-xs border border-gray-300 rounded-md"
                                value={formData.docenteTitularId}
                                onChange={e => setFormData({...formData, docenteTitularId: e.target.value})}
                            >
                                <option value="">Seleccione un docente...</option>
                                {users.filter(u => u.role === Role.Teacher).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                                <input type="date" required className="w-full p-2 text-xs border border-gray-300 rounded-md" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value, diaSemana: new Date(e.target.value).getDay()})} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Periodo (Bloque)</label>
                                <input type="number" min="1" max="10" required className="w-full p-2 text-xs border border-gray-300 rounded-md" value={formData.periodo} onChange={e => setFormData({...formData, periodo: parseInt(e.target.value)})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Clase / Paralelo</label>
                                <select required className="w-full p-2 text-xs border border-gray-300 rounded-md" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                                    <option value="">Seleccione...</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Asignatura</label>
                                <select required className="w-full p-2 text-xs border border-gray-300 rounded-md" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
                                    <option value="">Seleccione...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Instrucciones / Tareas para el curso</label>
                            <textarea required className="w-full p-2 text-xs border border-gray-300 rounded-md" rows={3} value={formData.instrucciones} onChange={e => setFormData({...formData, instrucciones: e.target.value})} placeholder="Ej: Resolver ejercicios de la página 35 a la 38..." />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">URL Planificación / Material (Opcional)</label>
                            <input type="url" className="w-full p-2 text-xs border border-gray-300 rounded-md" value={formData.planificacionUrl} onChange={e => setFormData({...formData, planificacionUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-xs hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-xs font-semibold hover:bg-primary-700">Guardar y Notificar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )}

    {/* Modal: Registrar Información en el Leccionario */}
    {leccionarioModalData.isOpen && leccionarioModalData.absence && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                📖 Registrar Clase de Reemplazo en el Leccionario
              </h3>
              <p className="text-xs text-gray-500">
                Esta información quedará asentada en el Leccionario Oficial Estudiantil.
              </p>
            </div>
            <button onClick={() => setLeccionarioModalData(prev => ({ ...prev, isOpen: false }))} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
          </div>
          <div className="p-6 overflow-y-auto">
            <form onSubmit={handleSaveLeccionarioEntry} className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900">
                <p><strong>Fecha:</strong> {leccionarioModalData.absence.fecha} | <strong>Bloque:</strong> {leccionarioModalData.absence.periodo}</p>
                <p><strong>Docente Titular:</strong> {users.find(u => u.id === leccionarioModalData.absence?.docenteTitularId)?.name || 'Titular'}</p>
                <p><strong>Docente Reemplazante:</strong> {users.find(u => u.id === leccionarioModalData.absence?.docenteReemplazanteId)?.name || leccionarioModalData.absence?.docenteReemplazanteNombre || 'Reemplazante'}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Código de Destreza / DCD</label>
                <input 
                  type="text" 
                  required
                  value={leccionarioModalData.skillCode}
                  onChange={e => setLeccionarioModalData(prev => ({ ...prev, skillCode: e.target.value }))}
                  className="w-full p-2 text-xs border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Temas Tratados</label>
                <textarea 
                  required
                  rows={2}
                  value={leccionarioModalData.topics}
                  onChange={e => setLeccionarioModalData(prev => ({ ...prev, topics: e.target.value }))}
                  className="w-full p-2 text-xs border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tareas / Actividades Desarrolladas</label>
                <textarea 
                  required
                  rows={3}
                  value={leccionarioModalData.tasks}
                  onChange={e => setLeccionarioModalData(prev => ({ ...prev, tasks: e.target.value }))}
                  className="w-full p-2 text-xs border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones / Novedades de la Sustitución</label>
                <textarea 
                  rows={2}
                  value={leccionarioModalData.observations}
                  onChange={e => setLeccionarioModalData(prev => ({ ...prev, observations: e.target.value }))}
                  className="w-full p-2 text-xs border border-gray-300 rounded-md"
                  placeholder="Detallar si todos los estudiantes cumplieron o incidencias..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setLeccionarioModalData(prev => ({ ...prev, isOpen: false }))} 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-xs hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700"
                >
                  Asentar en Leccionario
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
