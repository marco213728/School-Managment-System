import React, { useState, useContext, useMemo } from 'react';
import { 
  EnrollmentRecord, 
  MogacTicket, 
  User, 
  Student, 
  Class, 
  Notification, 
  Role,
  EnrollmentStatus,
  DocumentVerificationStatus 
} from '../../types';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { 
  BuildingLibraryIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  AlertTriangleIcon, 
  PlusIcon, 
  DownloadIcon, 
  EyeIcon, 
  SearchIcon, 
  PrinterIcon, 
  CloseIcon,
  IdentificationIcon 
} from '../icons/Icons';
import DocumentPreviewModal from './DocumentPreviewModal';
import DigitalEnrollmentCertificate from './DigitalEnrollmentCertificate';
import JuntosPortalSimulator from './JuntosPortalSimulator';
import MogacTicketManager from './MogacTicketManager';
import PrivateAdmissionModal from './PrivateAdmissionModal';
import IntersectorialTransferManager from './IntersectorialTransferManager';
import { StudentTransferPass, Institution } from '../../types';

export interface MatriculasPageProps {
  enrollments: EnrollmentRecord[];
  onUpdateEnrollments: (records: EnrollmentRecord[]) => void;
  mogacTickets: MogacTicket[];
  onUpdateMogacTickets: (tickets: MogacTicket[]) => void;
  users: User[];
  students: Student[];
  classes: Class[];
  transferPasses?: StudentTransferPass[];
  onUpdateTransferPasses?: (passes: StudentTransferPass[]) => void;
  institutions?: Institution[];
  onUpdateStudents?: (students: Student[]) => void;
  onUpdateUsers?: (users: User[]) => void;
  notifications?: Notification[];
  onUpdateNotifications?: (notifs: Notification[]) => void;
}

const MatriculasPage: React.FC<MatriculasPageProps> = ({
  enrollments,
  onUpdateEnrollments,
  mogacTickets,
  onUpdateMogacTickets,
  users,
  students,
  classes,
  transferPasses = [],
  onUpdateTransferPasses,
  institutions = [],
  onUpdateStudents,
  onUpdateUsers,
  notifications = [],
  onUpdateNotifications
}) => {
  const { user } = useContext(UserContext);
  const { institution } = useContext(InstitutionContext);

  const isParent = user?.role === Role.Parent;
  const isStaff = !!user && user.role !== Role.Parent && user.role !== Role.Student;
  const isAdmin = !!user && [Role.InstitutionAdmin, Role.Rector, Role.Vicerrector].includes(user.role);

  // Tabs
  const [activeTab, setActiveTab] = useState<'enrollments' | 're-enrollment' | 'mogac' | 'territorial' | 'transfers'>(
    isParent ? 'enrollments' : 'enrollments'
  );

  // Modals state
  const [isJuntosModalOpen, setIsJuntosModalOpen] = useState(false);
  const [isPrivateModalOpen, setIsPrivateModalOpen] = useState(false);
  const [previewingDocument, setPreviewingDocument] = useState<{ doc: any; studentName: string } | null>(null);
  const [printingCertificate, setPrintingCertificate] = useState<EnrollmentRecord | null>(null);

  // Filters for Staff
  const [statusFilter, setStatusFilter] = useState<'ALL' | EnrollmentStatus>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto re-enrollment batch selection
  const [selectedForBatch, setSelectedForBatch] = useState<string[]>([]);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState('');

  // Parent's own enrollments
  const parentEnrollments = useMemo(() => {
    if (!user) return [];
    if (isParent) {
      return enrollments.filter(e => e.parentId === user.id || e.parentEmail.toLowerCase() === user.email.toLowerCase());
    }
    return enrollments;
  }, [user, isParent, enrollments]);

  // Displayed enrollments in the administration table
  const displayedEnrollments = useMemo(() => {
    let list = enrollments;
    if (statusFilter !== 'ALL') {
      list = list.filter(e => e.status === statusFilter);
    }
    if (gradeFilter !== 'ALL') {
      list = list.filter(e => e.targetGrade === gradeFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(e => 
        e.studentName.toLowerCase().includes(q) ||
        e.studentNationalId.includes(q) ||
        e.parentName.toLowerCase().includes(q) ||
        e.circuit.toLowerCase().includes(q)
      );
    }
    return list;
  }, [enrollments, statusFilter, gradeFilter, searchTerm]);

  // Distinct grades from classes
  const availableGrades = useMemo(() => {
    const setG = new Set<string>();
    classes.forEach(c => setG.add(c.name));
    return Array.from(setG);
  }, [classes]);

  // Handle document verification status change
  const handleUpdateDocumentStatus = (docId: string, newStatus: DocumentVerificationStatus, comment?: string) => {
    if (!user) return;

    const updated = enrollments.map(rec => {
      let docFound = false;
      const updatedDocs = { ...rec.documents };

      Object.entries(updatedDocs).forEach(([k, d]) => {
        if (d.id === docId) {
          docFound = true;
          updatedDocs[k] = {
            ...d,
            status: newStatus,
            reviewComment: comment
          };
        }
      });

      if (docFound) {
        // Recalculate record status: if any observed => OBSERVADO, if all validado => APROBADO
        const allStatuses = Object.values(updatedDocs).map(d => d.status);
        let recStatus = rec.status;
        if (allStatuses.some(s => s === 'OBSERVADO')) {
          recStatus = 'OBSERVADO';
        } else if (allStatuses.every(s => s === 'VALIDADO')) {
          recStatus = 'APROBADO';
        }

        return {
          ...rec,
          documents: updatedDocs,
          status: recStatus,
          reviewedBy: user.id,
          reviewedByName: user.name,
          reviewNotes: comment,
          enrollmentCertificateCode: recStatus === 'APROBADO' && !rec.enrollmentCertificateCode 
            ? `CERT-2026-UEMOL-${Math.floor(1000 + Math.random() * 9000)}` 
            : rec.enrollmentCertificateCode,
          enrolledAt: recStatus === 'APROBADO' && !rec.enrolledAt ? new Date().toISOString() : rec.enrolledAt,
          updatedAt: new Date().toISOString()
        };
      }
      return rec;
    });

    onUpdateEnrollments(updated);

    // Send notification to the parent if observed or approved
    if (onUpdateNotifications && previewingDocument) {
      const rec = enrollments.find(e => Object.values(e.documents).some(d => d.id === docId));
      if (rec) {
        const notif: Notification = {
          id: `notif-doc-${Date.now()}`,
          institutionId: rec.institutionId,
          userId: rec.parentId,
          title: newStatus === 'VALIDADO' ? '✓ Requisito de Matrícula Validado' : '⚠ Observación en Documento de Matrícula',
          message: newStatus === 'VALIDADO' 
            ? `El documento de matrícula de ${rec.studentName} ha sido verificado con éxito.`
            : `El documento de matrícula de ${rec.studentName} fue observado: "${comment || 'Requiere subsanación'}". Ingrese al módulo para actualizarlo.`,
          date: new Date().toISOString(),
          read: false
        };
        onUpdateNotifications([notif, ...notifications]);
      }
    }
  };

  // Full approval of an enrollment record by Secretary
  const handleApproveEnrollment = (recordId: string) => {
    if (!user) return;
    const certCode = `CERT-2026-UEMOL-${Math.floor(1000 + Math.random() * 9000)}`;

    const updated = enrollments.map(rec => {
      if (rec.id === recordId) {
        // Validate all documents
        const validDocs = { ...rec.documents };
        Object.keys(validDocs).forEach(k => {
          validDocs[k] = { ...validDocs[k], status: 'VALIDADO' };
        });

        return {
          ...rec,
          status: 'APROBADO' as EnrollmentStatus,
          documents: validDocs,
          enrollmentCertificateCode: certCode,
          enrolledAt: new Date().toISOString(),
          reviewedBy: user.id,
          reviewedByName: user.name,
          updatedAt: new Date().toISOString()
        };
      }
      return rec;
    });

    onUpdateEnrollments(updated);

    const rec = enrollments.find(e => e.id === recordId);
    if (rec && onUpdateNotifications) {
      const notif: Notification = {
        id: `notif-mat-aprob-${Date.now()}`,
        institutionId: rec.institutionId,
        userId: rec.parentId,
        title: '🎉 Matrícula Aprobada Oficialmente',
        message: `La matrícula de ${rec.studentName} para el periodo 2026-2027 ha sido formalmente aprobada. Ya puede descargar su Certificado Oficial de Matrícula.`,
        date: new Date().toISOString(),
        read: false
      };
      onUpdateNotifications([notif, ...notifications]);
    }
  };

  // Automated Re-enrollment Pipeline (1-click)
  const handleBatchAutoReenroll = () => {
    if (selectedForBatch.length === 0) return;

    const updated = enrollments.map(rec => {
      if (selectedForBatch.includes(rec.id)) {
        return {
          ...rec,
          enrollmentType: 'REMATRICULA_AUTOMATICA' as const,
          status: 'APROBADO' as const,
          enrollmentCertificateCode: `CERT-2026-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
          enrolledAt: new Date().toISOString(),
          reviewedByName: 'Pipeline de Continuidad Automática (MinEduc)',
          updatedAt: new Date().toISOString()
        };
      }
      return rec;
    });

    onUpdateEnrollments(updated);
    setBatchSuccessMsg(`¡${selectedForBatch.length} estudiantes rematriculados automáticamente con éxito!`);
    setSelectedForBatch([]);
    setTimeout(() => setBatchSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
              institution?.fundingType === 'Particular' ? 'bg-blue-100 text-blue-900 border-blue-300' :
              institution?.fundingType === 'Municipal' ? 'bg-amber-100 text-amber-900 border-amber-300' :
              institution?.fundingType === 'Fiscomisional' ? 'bg-purple-100 text-purple-900 border-purple-300' :
              'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}>
              Régimen {institution?.fundingType || 'Fiscal'}
            </span>
            {institution?.costResolution && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                Res. Costos: {institution.costResolution.resolutionNumber}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              MOGAC Art. 14 LOPDP
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Matrículas, Asignación de Cupos y Actualización de Datos
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Gestión multi-sectorial: Asignación por zonificación (Fiscal), admisiones con resolución de costos y contrato digital (Particular/Municipal), pases de transferencia y rectificación LOPDP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* If Particular or Municipal, allow Autonomous Admission with Contract */}
          {(institution?.fundingType === 'Particular' || institution?.fundingType === 'Municipal') ? (
            <button
              onClick={() => setIsPrivateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Nueva Admisión & Contrato ({institution?.fundingType})</span>
            </button>
          ) : (
            <button
              onClick={() => setIsJuntosModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Asignación Fiscal en Línea (Juntos)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('transfers')}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition"
          >
            <BuildingLibraryIcon className="h-4 w-4 text-purple-600" />
            <span>Pase Intersectorial</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
              activeTab === 'enrollments'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <IdentificationIcon className="h-4 w-4" />
            <span>{isParent ? 'Mis Matrículas y Asignaciones' : 'Bandeja de Expedientes de Matrícula'}</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {isParent ? parentEnrollments.length : enrollments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('re-enrollment')}
            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
              activeTab === 're-enrollment'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircleIcon className="h-4 w-4" />
            <span>{isParent ? 'Confirmación de Continuidad' : 'Pipeline de Rematrícula Automática'}</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
              activeTab === 'transfers'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BuildingLibraryIcon className="h-4 w-4" />
            <span>Pases de Transferencia Intersectorial</span>
            {transferPasses.length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {transferPasses.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mogac')}
            className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition ${
              activeTab === 'mogac'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BuildingLibraryIcon className="h-4 w-4" />
            <span>Trámites de Rectificación MOGAC</span>
            {mogacTickets.filter(t => t.status === 'INGRESADO' || t.status === 'EN_TRAMITE').length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {mogacTickets.filter(t => t.status === 'INGRESADO' || t.status === 'EN_TRAMITE').length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* TAB 1: ENROLLMENTS */}
      {activeTab === 'enrollments' && (
        <div className="space-y-6">
          {/* PARENT PERSPECTIVE: Cards of children */}
          {isParent ? (
            <div className="space-y-4">
              {parentEnrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {parentEnrollments.map(rec => (
                    <div 
                      key={rec.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400">ID: {rec.id}</span>
                            <h3 className="text-base font-bold text-slate-900 mt-0.5">{rec.studentName}</h3>
                            <p className="text-xs text-slate-500 font-mono">Cédula: {rec.studentNationalId}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            rec.status === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            rec.status === 'OBSERVADO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            rec.status === 'RECHAZADO' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {rec.status === 'APROBADO' ? '✓ Matrícula Aprobada' :
                             rec.status === 'OBSERVADO' ? '⚠ Requiere Subsanación' :
                             rec.status === 'RECHAZADO' ? '✕ Rechazado' :
                             'En Revisión por Secretaría'}
                          </span>
                        </div>

                        {/* General specs */}
                        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 mb-4">
                          <p><span className="text-slate-500">Grado:</span> <strong>{rec.targetGrade}</strong></p>
                          <p><span className="text-slate-500">Periodo Lectivo:</span> <strong>{rec.academicYear}</strong></p>
                          <p><span className="text-slate-500">Circuito Territorial:</span> {rec.circuit} ({rec.district})</p>
                          {rec.juntosReceipt && (
                            <p className="text-[11px] text-blue-700 font-mono">
                              Comprobante Juntos: {rec.juntosReceipt.receiptNumber}
                            </p>
                          )}
                        </div>

                        {/* Observation alert if observed */}
                        {rec.reviewNotes && rec.status === 'OBSERVADO' && (
                          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                            <strong>Observación de Secretaría: </strong>
                            {rec.reviewNotes}
                          </div>
                        )}

                        {/* Attached documents list */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Documentación y Requisitos Digitales:
                          </h4>
                          <div className="space-y-1.5">
                            {Object.entries(rec.documents).map(([k, doc]) => (
                              <div 
                                key={doc.id}
                                className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50/70 text-xs"
                              >
                                <span className="text-slate-700 font-medium truncate max-w-[200px]" title={doc.name}>
                                  {doc.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    doc.status === 'VALIDADO' ? 'bg-emerald-100 text-emerald-800' :
                                    doc.status === 'OBSERVADO' ? 'bg-amber-100 text-amber-800' :
                                    'bg-slate-200 text-slate-700'
                                  }`}>
                                    {doc.status}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewingDocument({ doc, studentName: rec.studentName })}
                                    className="p-1 text-slate-400 hover:text-blue-600 transition"
                                    title="Previsualizar documento"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer actions */}
                      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        {rec.status === 'APROBADO' ? (
                          <button
                            type="button"
                            onClick={() => setPrintingCertificate(rec)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                          >
                            <PrinterIcon className="h-4 w-4" />
                            <span>Descargar Certificado de Matrícula</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            Certificado disponible al completar la validación oficial.
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          Actualizado: {new Date(rec.updatedAt).toLocaleDateString('es-EC')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <IdentificationIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No registra matrículas activas</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    Utilice el portal oficial en línea de asignación para registrar a su representado para el nuevo año lectivo.
                  </p>
                  <button
                    onClick={() => setIsJuntosModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow-sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Iniciar Inscripción Juntos Educación</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* STAFF / SECRETARY PERSPECTIVE: Comprehensive Verification Table */
            <div className="space-y-4">
              {/* Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500 font-semibold">Total Expedientes</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{enrollments.length}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-emerald-600 font-semibold">Matrículas Aprobadas</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {enrollments.filter(e => e.status === 'APROBADO').length}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-blue-600 font-semibold">En Revisión</span>
                  <p className="text-2xl font-black text-blue-700 mt-1">
                    {enrollments.filter(e => e.status === 'EN_REVISION').length}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-amber-600 font-semibold">Con Observaciones</span>
                  <p className="text-2xl font-black text-amber-700 mt-1">
                    {enrollments.filter(e => e.status === 'OBSERVADO').length}
                  </p>
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="relative w-full sm:w-72">
                  <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar estudiante o cédula..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Estado:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="p-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">Todos los Estados</option>
                      <option value="APROBADO">Aprobados</option>
                      <option value="EN_REVISION">En Revisión</option>
                      <option value="OBSERVADO">Con Observaciones</option>
                      <option value="RECHAZADO">Rechazados</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Grado:</span>
                    <select
                      value={gradeFilter}
                      onChange={(e) => setGradeFilter(e.target.value)}
                      className="p-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">Todos los Cursos</option>
                      {availableGrades.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table of Records */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase">Estudiante / Cédula</th>
                        <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase">Representante / Contacto</th>
                        <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase">Grado / Circuito</th>
                        <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase">Requisitos Digitales</th>
                        <th className="px-5 py-3.5 text-left font-bold text-slate-600 uppercase">Estado</th>
                        <th className="px-5 py-3.5 text-right font-bold text-slate-600 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {displayedEnrollments.map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <strong className="text-slate-900 block text-xs">{rec.studentName}</strong>
                            <span className="text-[11px] font-mono text-slate-500">C.I: {rec.studentNationalId}</span>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 block">{rec.parentName}</span>
                            <span className="text-[11px] text-slate-500 block">{rec.parentEmail}</span>
                            <span className="text-[10px] text-slate-400">Tel: {rec.parentPhone}</span>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-bold text-indigo-700 block">{rec.targetGrade}</span>
                            <span className="text-[10px] text-slate-500 block">{rec.circuit}</span>
                            {rec.planillaContrato && (
                              <span className="text-[10px] font-mono text-slate-400">CUEN: {rec.planillaContrato}</span>
                            )}
                          </td>

                          {/* Clickable document preview badges */}
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {Object.entries(rec.documents).map(([k, doc]) => (
                                <button
                                  key={doc.id}
                                  onClick={() => setPreviewingDocument({ doc, studentName: rec.studentName })}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition flex items-center gap-1 ${
                                    doc.status === 'VALIDADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' :
                                    doc.status === 'OBSERVADO' ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' :
                                    'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                                  }`}
                                  title={`Ver ${doc.name}`}
                                >
                                  <EyeIcon className="h-3 w-3" />
                                  <span>{doc.documentType.replace(/_/g, ' ').substring(0, 10)}...</span>
                                </button>
                              ))}
                            </div>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              rec.status === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              rec.status === 'OBSERVADO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              rec.status === 'RECHAZADO' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {rec.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                            {rec.status !== 'APROBADO' && (
                              <button
                                onClick={() => handleApproveEnrollment(rec.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-2xs"
                              >
                                Aprobar Matrícula
                              </button>
                            )}

                            {rec.status === 'APROBADO' && (
                              <button
                                onClick={() => setPrintingCertificate(rec)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition inline-flex items-center gap-1"
                                title="Ver Certificado"
                              >
                                <PrinterIcon className="h-3.5 w-3.5" />
                                <span>Certificado</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUTOMATIC RE-ENROLLMENT PIPELINE */}
      {activeTab === 're-enrollment' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                Pipeline de Retención Escolar
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                Rematrícula Automática para Estudiantes Continuos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proceso automatizado que preserva el vínculo familiar y el expediente histórico año a año, evitando trámites manuales innecesarios.
              </p>
            </div>

            {isStaff && (
              <button
                type="button"
                onClick={handleBatchAutoReenroll}
                disabled={selectedForBatch.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs disabled:opacity-50"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Ejecutar Rematrícula por Lote ({selectedForBatch.length})</span>
              </button>
            )}
          </div>

          {batchSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 animate-pulse">
              ✓ {batchSuccessMsg}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Seleccione los expedientes de estudiantes promovidos de año lectivo para generar automáticamente 
              su inscripción al siguiente curso con sus datos residenciales y representantes validados:
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    {isStaff && (
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedForBatch.length === enrollments.length && enrollments.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedForBatch(enrollments.map(en => en.id));
                            else setSelectedForBatch([]);
                          }}
                          className="rounded text-indigo-600"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Estudiante</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Representante Legal</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Año y Curso Actual</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Promoción Proyectada</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Estado de Continuidad</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {enrollments.map(rec => {
                    const isSelected = selectedForBatch.includes(rec.id);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        {isStaff && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedForBatch([...selectedForBatch, rec.id]);
                                else setSelectedForBatch(selectedForBatch.filter(id => id !== rec.id));
                              }}
                              className="rounded text-indigo-600"
                            />
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <strong className="text-slate-900">{rec.studentName}</strong>
                          <p className="text-[11px] font-mono text-slate-400">C.I: {rec.studentNationalId}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-slate-800">{rec.parentName}</span>
                          <p className="text-[11px] text-slate-400">{rec.parentEmail}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                          {rec.targetGrade} (2025-2026)
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-indigo-700">
                          Periodo 2026-2027 (Promovido)
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Expediente Continuo
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOGAC RECTIFICATION */}
      {activeTab === 'mogac' && (
        <MogacTicketManager
          tickets={mogacTickets}
          onUpdateTickets={onUpdateMogacTickets}
          users={users}
          students={students}
          onUpdateStudents={onUpdateStudents}
          onUpdateUsers={onUpdateUsers}
          notifications={notifications}
          onUpdateNotifications={onUpdateNotifications}
          isStaff={isStaff}
        />
      )}

      {/* TAB 4: INTERSECTORIAL TRANSFERS (Fiscal, Particular, Municipal) */}
      {activeTab === 'transfers' && (
        <IntersectorialTransferManager
          transferPasses={transferPasses}
          onUpdateTransferPasses={onUpdateTransferPasses || (() => {})}
          institutions={institutions.length > 0 ? institutions : (institution ? [institution] : [])}
          students={students}
          currentInstitution={institution || (institutions[0] as any)}
          currentUser={user}
        />
      )}

      {/* MODAL 1: Document Previewer */}
      {previewingDocument && (
        <DocumentPreviewModal
          document={previewingDocument.doc}
          studentName={previewingDocument.studentName}
          isOpen={!!previewingDocument}
          onClose={() => setPreviewingDocument(null)}
          canReview={isStaff}
          onUpdateStatus={handleUpdateDocumentStatus}
        />
      )}

      {/* MODAL 2: Digital Certificate View */}
      {printingCertificate && (
        <DigitalEnrollmentCertificate
          enrollment={printingCertificate}
          onClose={() => setPrintingCertificate(null)}
        />
      )}

      {/* MODAL 3: Juntos Portal Simulator (Fiscal) */}
      {isJuntosModalOpen && (
        <JuntosPortalSimulator
          isOpen={isJuntosModalOpen}
          onClose={() => setIsJuntosModalOpen(false)}
          classes={classes}
          onSubmitEnrollment={(newRec) => {
            onUpdateEnrollments([newRec, ...enrollments]);
          }}
        />
      )}

      {/* MODAL 4: Private & Municipal Autonomous Admission and Contract */}
      {isPrivateModalOpen && (
        <PrivateAdmissionModal
          isOpen={isPrivateModalOpen}
          onClose={() => setIsPrivateModalOpen(false)}
          institution={institution || institutions[0]}
          students={students}
          currentUser={user}
          onSaveEnrollment={(newRec) => {
            onUpdateEnrollments([newRec, ...enrollments]);
          }}
        />
      )}
    </div>
  );
};

export default MatriculasPage;
