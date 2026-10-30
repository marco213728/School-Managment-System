import React, { useState, useContext, useMemo } from 'react';
import { MogacTicket, MogacFieldCategory, MogacStatus, Role, User, Student, Notification } from '../../types';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { 
  BuildingLibraryIcon, 
  CheckCircleIcon, 
  CloseIcon, 
  PlusIcon, 
  UploadIcon, 
  DownloadIcon, 
  ShieldCheckIcon, 
  AlertTriangleIcon,
  SearchIcon 
} from '../icons/Icons';

interface MogacTicketManagerProps {
  tickets: MogacTicket[];
  onUpdateTickets: (tickets: MogacTicket[]) => void;
  users: User[];
  students: Student[];
  onUpdateStudents?: (students: Student[]) => void;
  onUpdateUsers?: (users: User[]) => void;
  notifications?: Notification[];
  onUpdateNotifications?: (notifs: Notification[]) => void;
  isStaff: boolean;
}

const CATEGORY_LABELS: Record<MogacFieldCategory, string> = {
  APELLIDOS_NOMBRES: 'Apellidos y Nombres (Identidad Civil)',
  CEDULA_IDENTIDAD: 'Número de Cédula / Pasaporte',
  FECHA_NACIMIENTO: 'Fecha de Nacimiento Registral',
  DIRECCION_RESIDENCIA: 'Dirección Domiciliaria y Sectorización',
  CONTACTO_CORREO_TELEFONO: 'Datos de Contacto (Teléfono y Correo)',
  CONDICION_DISCAPACIDAD: 'Carnet de Discapacidad / Diagnóstico',
  OTRO: 'Otras Observaciones Registrales',
};

const MogacTicketManager: React.FC<MogacTicketManagerProps> = ({
  tickets,
  onUpdateTickets,
  users,
  students,
  onUpdateStudents,
  onUpdateUsers,
  notifications = [],
  onUpdateNotifications,
  isStaff
}) => {
  const { user } = useContext(UserContext);
  const { institution } = useContext(InstitutionContext);

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<MogacTicket | null>(null);
  const [resolutionComment, setResolutionComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MogacStatus>('ALL');

  // Form states for new ticket
  const [targetType, setTargetType] = useState<'STUDENT' | 'PARENT'>('STUDENT');
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [category, setCategory] = useState<MogacFieldCategory>('APELLIDOS_NOMBRES');
  const [currentVal, setCurrentVal] = useState('');
  const [requestedVal, setRequestedVal] = useState('');
  const [justification, setJustification] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Eligible students for current user if parent
  const accessibleStudents = useMemo(() => {
    if (!user) return [];
    if (user.role === Role.Parent) {
      return students.filter(s => s.parentId === user.id || user.childIds?.includes(s.id));
    }
    return students;
  }, [user, students]);

  // Filtered tickets
  const displayedTickets = useMemo(() => {
    let list = tickets;
    if (!isStaff && user) {
      list = list.filter(t => t.requesterId === user.id);
    }
    if (statusFilter !== 'ALL') {
      list = list.filter(t => t.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(t => 
        t.ticketNumber.toLowerCase().includes(q) ||
        t.targetEntityName.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        t.justification.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, isStaff, user, statusFilter, searchTerm]);

  // Calculate SLA countdown
  const getSlaInfo = (ticket: MogacTicket) => {
    const now = new Date();
    const deadline = new Date(ticket.deadlineDate);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (ticket.status === 'RESUELTO_APROBADO' || ticket.status === 'NEGADO') {
      return { days: 0, text: 'Trámite Concluido', color: 'text-slate-500 bg-slate-100 border-slate-200' };
    }

    if (diffDays <= 0) {
      return { days: 0, text: 'SLA Expirado (Urgente)', color: 'text-rose-700 bg-rose-50 border-rose-300 animate-pulse' };
    }
    if (diffDays <= 3) {
      return { days: diffDays, text: `${diffDays} días restantes (Atención Prioritaria)`, color: 'text-amber-800 bg-amber-50 border-amber-300' };
    }
    return { days: diffDays, text: `${diffDays} días restantes (Dentro de Plazo)`, color: 'text-emerald-800 bg-emerald-50 border-emerald-300' };
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let targetEntityName = user.name;
    let targetEntityId = user.id;

    if (targetType === 'STUDENT') {
      const s = students.find(item => item.id === targetStudentId);
      if (s) {
        targetEntityName = s.name;
        targetEntityId = s.id;
      }
    }

    const ticketSeq = Math.floor(1000 + Math.random() * 9000);
    const newTicket: MogacTicket = {
      id: `mogac-tk-${Date.now()}`,
      ticketNumber: `MOGAC-2026-${ticketSeq}`,
      institutionId: institution?.id || 'uemol',
      requesterId: user.id,
      requesterName: user.name,
      requesterRole: user.role === Role.Student ? 'ESTUDIANTE' : 'PADRE',
      targetEntityType: targetType,
      targetEntityId,
      targetEntityName,
      category,
      currentValue: currentVal.trim(),
      requestedValue: requestedVal.trim(),
      justification: justification.trim(),
      supportingDocumentName: proofFile ? proofFile.name : 'Documento_Probatorio_Identidad.pdf',
      supportingDocumentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      status: 'INGRESADO',
      legalSlaDays: 15,
      deadlineDate: new Date(Date.now() + 86400000 * 15).toISOString(),
      createdAt: new Date().toISOString()
    };

    onUpdateTickets([newTicket, ...tickets]);
    setIsNewTicketOpen(false);
    // Reset form
    setCurrentVal('');
    setRequestedVal('');
    setJustification('');
    setProofFile(null);
  };

  const handleResolveTicket = (ticketId: string, newStatus: 'RESUELTO_APROBADO' | 'NEGADO') => {
    if (!user) return;

    const targetTicket = tickets.find(t => t.id === ticketId);
    if (!targetTicket) return;

    const resolvedTime = new Date().toISOString();
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          resolutionNotes: resolutionComment.trim() || (newStatus === 'RESUELTO_APROBADO' ? 'Solicitud verificada conforme a documentación legal aportada.' : 'Solicitud no procede por documentación insuficiente.'),
          resolvedBy: user.id,
          resolvedByName: user.name,
          resolvedAt: resolvedTime,
        };
      }
      return t;
    });

    onUpdateTickets(updatedTickets);

    // If approved, automatically apply update to student or parent record
    if (newStatus === 'RESUELTO_APROBADO') {
      if (targetTicket.targetEntityType === 'STUDENT' && onUpdateStudents) {
        onUpdateStudents(students.map(s => {
          if (s.id === targetTicket.targetEntityId) {
            const updated = { ...s };
            if (targetTicket.category === 'APELLIDOS_NOMBRES') updated.name = targetTicket.requestedValue;
            if (targetTicket.category === 'CEDULA_IDENTIDAD') updated.nationalId = targetTicket.requestedValue;
            if (targetTicket.category === 'DIRECCION_RESIDENCIA') updated.address = targetTicket.requestedValue;
            return updated;
          }
          return s;
        }));
      } else if (targetTicket.targetEntityType === 'PARENT' && onUpdateUsers) {
        onUpdateUsers(users.map(u => {
          if (u.id === targetTicket.targetEntityId) {
            const updated = { ...u };
            if (targetTicket.category === 'APELLIDOS_NOMBRES') updated.name = targetTicket.requestedValue;
            if (targetTicket.category === 'CEDULA_IDENTIDAD') updated.cedula = targetTicket.requestedValue;
            if (targetTicket.category === 'DIRECCION_RESIDENCIA') updated.address = targetTicket.requestedValue;
            return updated;
          }
          return u;
        }));
      }

      // Notify the requester
      if (onUpdateNotifications) {
        const notif: Notification = {
          id: `notif-mogac-${Date.now()}`,
          institutionId: targetTicket.institutionId,
          userId: targetTicket.requesterId,
          title: `Trámite MOGAC Aprobado (${targetTicket.ticketNumber})`,
          message: `Su solicitud de rectificación para ${targetTicket.targetEntityName} ha sido procesada y aprobada favorablemente. Los datos han sido actualizados en el sistema central.`,
          date: new Date().toISOString(),
          read: false
        };
        onUpdateNotifications([notif, ...notifications]);
      }
    }

    setSelectedTicket(null);
    setResolutionComment('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner MOGAC */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-widest">
                servicios.educacion.gob.ec/mogac-web/
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                SLA Legal: 15 Días (Art. 14 LOPDP)
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Módulo de Gestión de Atención Ciudadana (MOGAC)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Canal oficial para el ejercicio del derecho ciudadano de rectificación, actualización y supresión 
              de datos registrales erróneos o inexactos en los expedientes estudiantiles y de representantes legales.
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Nuevo Trámite de Rectificación</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ticket, nombre o motivo..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Estado:</span>
          {(['ALL', 'INGRESADO', 'EN_TRAMITE', 'RESUELTO_APROBADO', 'NEGADO'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {displayedTickets.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase">No. Ticket</th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase">Titular Afectado</th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase">Dato a Rectificar</th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase">SLA 15 Días (LOPDP)</th>
                  <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase">Estado</th>
                  <th className="px-5 py-3.5 text-right font-bold text-slate-600 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {displayedTickets.map(tk => {
                  const sla = getSlaInfo(tk);
                  return (
                    <tr key={tk.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {tk.ticketNumber}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Ingreso: {new Date(tk.createdAt).toLocaleDateString('es-EC')}
                        </p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <strong className="text-slate-900 block text-xs">{tk.targetEntityName}</strong>
                        <span className="text-[10px] text-slate-500">
                          Solicitante: {tk.requesterName} ({tk.requesterRole})
                        </span>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 mb-1">
                          {CATEGORY_LABELS[tk.category] || tk.category}
                        </span>
                        <p className="text-slate-600 text-[11px] truncate" title={tk.justification}>
                          {tk.justification}
                        </p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${sla.color}`}>
                          {sla.text}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tk.status === 'RESUELTO_APROBADO' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          tk.status === 'NEGADO' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          tk.status === 'EN_TRAMITE' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {tk.status === 'RESUELTO_APROBADO' ? '✓ Aprobado' :
                           tk.status === 'NEGADO' ? '✕ Negado' :
                           tk.status === 'EN_TRAMITE' ? 'En Trámite Distrital' :
                           'Ingresado'}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedTicket(tk)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          Ver Detalle / Dictamen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <BuildingLibraryIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No hay trámites MOGAC registrados</h3>
              <p className="text-xs text-slate-500 mt-1">
                Todas las solicitudes ciudadanas de rectificación de datos se gestionan desde este portal.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Ticket */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Ingreso de Solicitud de Rectificación Ciudadana (MOGAC)
                </h3>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <strong>Garantía de Protección de Datos (Art. 14 LOPDP):</strong> El titular de los datos 
                tiene derecho a que la entidad educativa rectifique información inexacta o incompleta 
                dentro de un plazo máximo improrrogable de 15 días laborables.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Titular del Dato a Rectificar *
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="STUDENT">Estudiante Representado</option>
                    <option value="PARENT">Representante Legal (Yo)</option>
                  </select>
                </div>

                {targetType === 'STUDENT' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Seleccionar Estudiante *
                    </label>
                    <select
                      value={targetStudentId}
                      onChange={(e) => setTargetStudentId(e.target.value)}
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {accessibleStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.nationalId || 'Sin C.I.'})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campo a Rectificar / Corregir *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor Actual (Incorrecto en el Sistema) *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentVal}
                    onChange={(e) => setCurrentVal(e.target.value)}
                    placeholder="Ej: Carlos Andrade"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor Rectificado Solicitado (Correcto) *
                  </label>
                  <input
                    type="text"
                    required
                    value={requestedVal}
                    onChange={(e) => setRequestedVal(e.target.value)}
                    placeholder="Ej: Carlos David Andrade Gómez"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-blue-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motivo y Justificación Legal *
                  </label>
                  <textarea
                    required
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Explique el motivo del cambio o error registral que justifica la actualización..."
                    rows={3}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Documento de Sustento Probatorio (Partida, Cédula o Certificado Civil)
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                    <UploadIcon className="h-5 w-5 text-slate-400" />
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Ingresar Trámite MOGAC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ticket Detail & Resolution */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <span className="font-mono text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {selectedTicket.ticketNumber}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1">
                  Expediente de Rectificación MOGAC
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* SLA Banner */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500">Plazo de Resolución Legal:</span>
                  <p className="font-bold text-slate-800">15 Días Laborables (Art. 14 LOPDP)</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Fecha Límite:</span>
                  <p className="font-mono font-bold text-slate-800">
                    {new Date(selectedTicket.deadlineDate).toLocaleDateString('es-EC')}
                  </p>
                </div>
              </div>

              {/* Data comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-rose-700 font-bold block uppercase text-[10px]">Dato Actual en Base de Datos:</span>
                  <p className="font-semibold text-rose-950 mt-1 text-sm">{selectedTicket.currentValue}</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-emerald-700 font-bold block uppercase text-[10px]">Dato Rectificado Solicitado:</span>
                  <p className="font-semibold text-emerald-950 mt-1 text-sm">{selectedTicket.requestedValue}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold">Justificación Aportada:</span>
                <p className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                  {selectedTicket.justification}
                </p>
              </div>

              {selectedTicket.supportingDocumentUrl && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <DownloadIcon className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">{selectedTicket.supportingDocumentName || 'Documento_Sustento.pdf'}</span>
                  </div>
                  <a
                    href={selectedTicket.supportingDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-white border border-blue-300 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100"
                  >
                    Ver Sustento
                  </a>
                </div>
              )}

              {/* Resolution Info if already resolved */}
              {selectedTicket.resolutionNotes && (
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-300">
                  <span className="font-bold text-slate-800">Resolución Oficial:</span>
                  <p className="text-slate-700 mt-1">{selectedTicket.resolutionNotes}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Dictaminado por: {selectedTicket.resolvedByName || 'Secretaría General'} el {new Date(selectedTicket.resolvedAt || '').toLocaleString('es-EC')}
                  </p>
                </div>
              )}

              {/* Action Buttons for Staff if not resolved yet */}
              {isStaff && selectedTicket.status !== 'RESUELTO_APROBADO' && selectedTicket.status !== 'NEGADO' && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <label className="block font-bold text-slate-800">
                    Dictamen de Secretaría / Rectorado:
                  </label>
                  <textarea
                    value={resolutionComment}
                    onChange={(e) => setResolutionComment(e.target.value)}
                    placeholder="Detalle de la resolución o comprobación de la documentación oficial..."
                    rows={2}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => handleResolveTicket(selectedTicket.id, 'NEGADO')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition"
                    >
                      Negar Solicitud
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveTicket(selectedTicket.id, 'RESUELTO_APROBADO')}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                    >
                      ✓ Aprobar y Actualizar Base de Datos
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MogacTicketManager;
