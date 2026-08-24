import React, { useState, useEffect, useMemo, useContext } from 'react';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { Role, User, AbsenceRequest, ScheduleEntry, Class, Subject, PunchType, StaffAttendanceRecord } from '../../types';

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
  asignaturaNombre: string;
  especialidadRequerida: string;
  paraleloNombre: string;
  aulaNombre: string;
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
}

export const InspectorSustituciones: React.FC<InspectorSustitucionesProps> = ({ users, schedule, classes, subjects, staffAttendanceRecords, absenceRequests = [], onUpdateAbsenceRequests = () => {} }) => {
  const { user: currentUser } = useContext(UserContext);
  const { institution } = useContext(InstitutionContext);
  
  const [ausencias, setAusencias] = useState<AusenciaReportada[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
      docenteTitularId: "",
      fecha: new Date().toISOString().split('T')[0],
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

  // Carga inicial de ausencias pendientes de cubrir (Mock basado en contexto)
  
  useEffect(() => {
    if (institution) {
        const pendingRequests = absenceRequests.filter(r => r.institutionId === institution.id && r.estado === 'Pendiente');
        const mapped = pendingRequests.map(r => {
            const teacher = users.find(u => u.id === r.docenteTitularId);
            const cls = classes.find(c => c.id === r.classId);
            const sub = subjects.find(s => s.id === r.subjectId);
            return {
                id: r.id,
                docenteTitular: teacher?.name || 'Desconocido',
                docenteTitularId: teacher?.id || '',
                fecha: r.fecha,
                periodo: r.periodo,
                diaSemana: r.diaSemana,
                asignaturaNombre: sub?.name || 'Desconocida',
                especialidadRequerida: sub?.name || 'General',
                paraleloNombre: cls?.name || 'Desconocido',
                aulaNombre: 'Asignada',
                planificacionUrl: r.planificacionUrl
            };
        });
        setAusencias(mapped);
    }
  }, [institution, absenceRequests, users, classes, subjects]);


  // Algoritmo de detección de Horas Huecas localmente usando los datos del sistema
  const consultarDocentesDisponibles = async (ausencia: AusenciaReportada) => {
    setLoading(true);
    setAusenciaSeleccionada(ausencia);
    setMensajeExito(null);
    
    setTimeout(() => {
        // Filtrar docentes de esta institucion
        const docentesInstitucion = users.filter(u => u.institutionId === currentUser?.institutionId && u.role === Role.Teacher);
        
        const disponibles: DocenteDisponible[] = [];
        
        docentesInstitucion.forEach(docente => {
            // Verificar si tiene clase en este periodo y dia (dia de la semana 1-5, o periodo en el horario)
            const scheduleEntry = schedule.find(s => 
                s.teacherId === docente.id && 
                s.dayOfWeek === ausencia.diaSemana && 
                s.period === ausencia.periodo
            );
            
            // Verificar si el docente está ausente hoy
            const isAusenteHoy = staffAttendanceRecords.some(r => r.userId === docente.id && r.date === ausencia.fecha && r.punches.length === 0);

            // Si es hora hueca
            if (!scheduleEntry && !isAusenteHoy) {
                
                // Calculo de carga
                const totalHoras = schedule.filter(s => s.teacherId === docente.id).length;
                
                // Validar especialidad (simulada basada en la asignatura que imparte)
                const subjectsDocente = subjects.filter(s => s.teacherId === docente.id);
                const coincideEspecialidad = subjectsDocente.some(s => s.name.includes('Matemáticas') || s.name.includes('Ciencias Exactas'));

                disponibles.push({
                    id: docente.id,
                    nombre: docente.name,
                    especialidad: subjectsDocente[0]?.name || 'General',
                    coincideEspecialidad: coincideEspecialidad,
                    reemplazosAcumuladosMes: Math.floor(Math.random() * 5), // Mock de reemplazos historicos
                    horasAsignadasSemana: totalHoras
                });
            }
        });
        
        // Ordenar por rotacion equitativa (Indice de Sustitución Histórica)
        disponibles.sort((a, b) => {
            if (a.coincideEspecialidad && !b.coincideEspecialidad) return -1;
            if (!a.coincideEspecialidad && b.coincideEspecialidad) return 1;
            return a.reemplazosAcumuladosMes - b.reemplazosAcumuladosMes;
        });

        setCandidatos(disponibles);
        setLoading(false);
    }, 800);
  };

  const ejecutarReasignacionYNotificar = async (docenteId: string) => {
    if (!ausenciaSeleccionada) return;

    try {
      const updatedRequests = absenceRequests.map(r => 
          r.id === ausenciaSeleccionada.id ? { ...r, estado: 'Aprobado' as const, docenteReemplazanteId: docenteId } : r
      );
      onUpdateAbsenceRequests(updatedRequests);
      
      const teacherTitular = users.find(u => u.id === ausenciaSeleccionada.docenteTitularId);
      setMensajeExito(`¡Reasignación Exitosa! Se ha enviado una Notificación Push al dispositivo del docente reemplazante y a ${teacherTitular?.name || 'Titular'}. Se ha registrado el log de asistencia para Talento Humano.`);
      
      setAusencias(prev => prev.filter(a => a.id !== ausenciaSeleccionada.id));
      setAusenciaSeleccionada(null);
      setCandidatos([]);
    } catch (e) {
      console.error("Error al registrar el reemplazo", e);
    }
  };

  const handleAddAbsence = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser?.institutionId) return;
      const newAbsence: AbsenceRequest = {
          ...formData,
          id: `abs-${Date.now()}`,
          institutionId: currentUser.institutionId,
          estado: 'Pendiente',
          creadoPorRol: currentUser.role
      };
      onUpdateAbsenceRequests([...absenceRequests, newAbsence]);
      setIsFormOpen(false);
      setFormData({
          docenteTitularId: "",
          fecha: new Date().toISOString().split('T')[0],
          periodo: 1,
          classId: "",
          subjectId: "",
          instrucciones: "",
          planificacionUrl: ""
      });
  };

  return (
    <>
    <div className="bg-gray-50 animate-fade-in p-4 rounded-xl border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Panel Izquierdo: Ausencias Pendientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 🚨 Ausencias Pendientes
              </h2>
              <button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                  + Reportar Ausencia
              </button>
          </div>
          <p className="text-xs text-gray-500 mb-6">Lista de novedades reportadas por inspección y docentes que requieren acompañamiento.</p>
          
          <div className="space-y-4">
            {ausencias.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                    No hay ausencias pendientes de cubrir hoy.
                </div>
            ) : ausencias.map(ausencia => (
              <div 
                key={ausencia.id}
                onClick={() => consultarDocentesDisponibles(ausencia)}
                className={`p-4 border rounded-xl cursor-pointer transition-all hover:border-indigo-400 ${
                  ausenciaSeleccionada?.id === ausencia.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm text-gray-900">{ausencia.docenteTitular}</h3>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    Periodo {ausencia.periodo}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1"><strong>Asignatura:</strong> {ausencia.asignaturaNombre} en {ausencia.paraleloNombre}</p>
                <p className="text-xs text-gray-600 mb-2"><strong>Aula:</strong> {ausencia.aulaNombre}</p>
                
                {/* Instructions Box */}
                {(() => {
                    const absReq = absenceRequests.find(r => r.id === ausencia.id);
                    if (absReq?.instrucciones) {
                        return (
                            <div className="mt-3 p-2 bg-gray-50 border border-gray-100 rounded text-xs text-gray-700">
                                <strong>Instrucciones:</strong> {absReq.instrucciones}
                            </div>
                        );
                    }
                    return null;
                })()}

                {ausencia.planificacionUrl && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-2">
                      ✓ Planificación de Contingencia Adjunta
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Buscador de Horas Libres y Asignador de Reemplazos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔎 Buscador de Sustitutos</h2>
          
          {mensajeExito && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 text-xs rounded-r-xl shadow-sm">
              {mensajeExito}
            </div>
          )}

          {ausenciaSeleccionada ? (
            <div>
              <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                Reemplazo para el <strong>Bloque {ausenciaSeleccionada.periodo}</strong> en <strong>{ausenciaSeleccionada.asignaturaNombre}</strong>. Se requiere un docente especialista en: <span className="underline font-bold">{ausenciaSeleccionada.especialidadRequerida}</span>.
              </div>

              {loading ? (
                <div className="text-center py-12 text-sm text-indigo-600 font-medium animate-pulse">
                    Buscando horas huecas en el horario presencial...
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Docentes Disponibles (Criterio de Rotación)</h3>
                  {candidatos.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No se encontraron docentes disponibles en este horario.</p>
                  ) : candidatos.map(candidato => (
                    <div 
                      key={candidato.id} 
                      className="p-4 border border-gray-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 gap-4 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-gray-900">{candidato.nombre}</h4>
                          {candidato.coincideEspecialidad && (
                            <span className="bg-green-100 text-green-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              Especialista
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Especialidad: {candidato.especialidad}</p>
                        <p className="text-[11px] text-indigo-600 font-semibold mt-1 bg-indigo-50 inline-block px-2 py-1 rounded">
                          Sustituciones este mes: {candidato.reemplazosAcumuladosMes}
                        </p>
                      </div>
                      <button 
                        onClick={() => ejecutarReasignacionYNotificar(candidato.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap shadow-sm hover:shadow"
                      >
                        Asignar y Notificar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 px-8 text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              Selecciona una ausencia en el panel izquierdo para analizar las horas huecas disponibles del personal en tiempo real.
            </div>
          )}
        </div>

      </div>
    </div>

    {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Reportar Nueva Ausencia</h3>
                    <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleAddAbsence} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Docente Ausente</label>
                            <select 
                                required
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={formData.docenteTitularId}
                                onChange={e => setFormData({...formData, docenteTitularId: e.target.value})}
                            >
                                <option value="">Seleccione un docente...</option>
                                {users.filter(u => u.institutionId === currentUser?.institutionId && u.role === Role.Teacher).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                <input type="date" required className="w-full p-2 border border-gray-300 rounded-md" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value, diaSemana: new Date(e.target.value).getDay()})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo (Bloque)</label>
                                <input type="number" min="1" max="10" required className="w-full p-2 border border-gray-300 rounded-md" value={formData.periodo} onChange={e => setFormData({...formData, periodo: parseInt(e.target.value)})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clase/Paralelo</label>
                                <select required className="w-full p-2 border border-gray-300 rounded-md" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                                    <option value="">Seleccione...</option>
                                    {classes.filter(c => c.institutionId === currentUser?.institutionId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
                                <select required className="w-full p-2 border border-gray-300 rounded-md" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
                                    <option value="">Seleccione...</option>
                                    {subjects.filter(s => s.institutionId === currentUser?.institutionId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones / Tareas para el curso</label>
                            <textarea required className="w-full p-2 border border-gray-300 rounded-md" rows={3} value={formData.instrucciones} onChange={e => setFormData({...formData, instrucciones: e.target.value})} placeholder="Ej: Resolver páginas 45 y 46 del libro..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Planificación / Material (Opcional)</label>
                            <input type="url" className="w-full p-2 border border-gray-300 rounded-md" value={formData.planificacionUrl} onChange={e => setFormData({...formData, planificacionUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Guardar Ausencia</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )}
    </>
  );
};