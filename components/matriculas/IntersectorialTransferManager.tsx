import React, { useState } from 'react';
import { StudentTransferPass, Institution, Student, User, Role } from '../../types';
import { 
  BuildingLibraryIcon, 
  CheckCircleIcon, 
  CloseIcon, 
  IdentificationIcon, 
  EyeIcon, 
  SparklesIcon 
} from '../icons/Icons';

interface IntersectorialTransferManagerProps {
  transferPasses: StudentTransferPass[];
  onUpdateTransferPasses: (passes: StudentTransferPass[]) => void;
  institutions: Institution[];
  students: Student[];
  currentInstitution: Institution;
  currentUser: User | null;
}

export const IntersectorialTransferManager: React.FC<IntersectorialTransferManagerProps> = ({
  transferPasses,
  onUpdateTransferPasses,
  institutions,
  students,
  currentInstitution,
  currentUser
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPassForPrint, setSelectedPassForPrint] = useState<StudentTransferPass | null>(null);

  // New transfer request state
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [studentIdentification, setStudentIdentification] = useState<string>('');
  const [targetGrade, setTargetGrade] = useState<string>('10mo EGB');
  const [destinationInstId, setDestinationInstId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<StudentTransferPass['transferReason']>('Cambio de Domicilio');
  const [reasonDetails, setReasonDetails] = useState<string>('');
  const [hasNee, setHasNee] = useState<boolean>(false);
  const [neeDetails, setNeeDetails] = useState<string>('');

  const isParent = currentUser?.role === Role.Parent;

  // Filter transfers
  const filteredPasses = transferPasses.filter(p => {
    // If parent, show only their own student transfers
    if (isParent && p.parentId !== currentUser?.id) {
      return false;
    }

    // Role filtering: school staff sees transfers where current institution is origin or destination
    if (!isParent && currentUser?.role !== Role.SuperAdmin) {
      const isRelated = p.originInstitutionId === currentInstitution.id || p.destinationInstitutionId === currentInstitution.id;
      if (!isRelated) return false;
    }

    if (filterStatus !== 'TODOS' && p.status !== filterStatus) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = p.studentName.toLowerCase().includes(term);
      const matchCode = p.transferCode.toLowerCase().includes(term);
      const matchOrigin = p.originInstitutionName.toLowerCase().includes(term);
      const matchDest = p.destinationInstitutionName.toLowerCase().includes(term);
      return matchName || matchCode || matchOrigin || matchDest;
    }

    return true;
  });

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const found = students.find(s => s.id === id);
    if (found) {
      setStudentName(found.name);
      setStudentIdentification(found.nationalId || '1723456789');
      setTargetGrade(found.grade || '10mo EGB');
    }
  };

  const handleCreateTransferRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const destInst = institutions.find(i => i.id === destinationInstId) || institutions[0];
    const timestamp = new Date().toISOString();
    const passCode = `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPass: StudentTransferPass = {
      id: `trf-${Date.now()}`,
      transferCode: passCode,
      studentId: selectedStudentId || `std-${Date.now()}`,
      studentName: studentName || 'Estudiante en Traspaso',
      studentIdentification: studentIdentification || '1799887766',
      parentId: currentUser?.id || 'parent1',
      parentName: currentUser?.name || 'Representante Legal',
      parentEmail: currentUser?.email || 'representante@correo.ec',
      parentPhone: currentUser?.phone || '0995551234',
      originInstitutionId: currentInstitution.id,
      originInstitutionName: currentInstitution.name,
      originFundingType: currentInstitution.fundingType || 'Fiscal',
      destinationInstitutionId: destInst.id,
      destinationInstitutionName: destInst.name,
      destinationFundingType: destInst.fundingType || 'Fiscal',
      requestedGrade: targetGrade,
      academicPeriod: '2025-2026',
      transferReason: transferReason,
      reasonDetails: reasonDetails || 'Solicitud de traslado intersectorial formal.',
      requestDate: timestamp,
      status: 'SOLICITADO',
      academicPortfolio: {
        gradeRecords: [
          { grade: '8vo EGB', schoolYear: '2023-2024', averageScore: 9.15, passed: true },
          { grade: '9no EGB', schoolYear: '2024-2025', averageScore: 9.30, passed: true }
        ],
        promotionCertificatesUploaded: true,
        conductGrade: 'A'
      },
      deceTransferFile: {
        hasNee,
        neeDetails: hasNee ? neeDetails : undefined,
        psychosocialObservations: 'Expediente DECE transferido con candado de confidencialidad médica y psicosocial.',
        deceOfficerName: 'Equipo de Consejería Estudiantil'
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };

    onUpdateTransferPasses([newPass, ...transferPasses]);
    setIsModalOpen(false);
    // Reset form
    setSelectedStudentId('');
    setStudentName('');
    setStudentIdentification('');
    setReasonDetails('');
    setHasNee(false);
  };

  const handleApproveOrigin = (passId: string) => {
    const updated = transferPasses.map(p => {
      if (p.id === passId) {
        return {
          ...p,
          status: 'APROBADO_ORIGEN' as const,
          originApprovalDate: new Date().toISOString(),
          originApprovedByName: `${currentUser?.name || 'Autoridad Institucional'} (Origen)`,
          originNotes: 'Expediente académico legalizado y liberado del padrón del plantel.',
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    onUpdateTransferPasses(updated);
  };

  const handleAcceptDestination = (passId: string) => {
    const updated = transferPasses.map(p => {
      if (p.id === passId) {
        return {
          ...p,
          status: 'COMPLETADO' as const,
          destinationApprovalDate: new Date().toISOString(),
          destinationApprovedByName: `${currentUser?.name || 'Secretaría General'} (Destino)`,
          destinationNotes: 'Cupo confirmado y matrícula definitiva legalizada en el nuevo plantel.',
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    onUpdateTransferPasses(updated);
  };

  const getFundingBadgeColor = (type?: string) => {
    switch (type) {
      case 'Particular':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Municipal':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Fiscomisional':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getStatusBadge = (status: StudentTransferPass['status']) => {
    switch (status) {
      case 'COMPLETADO':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Completado
          </span>
        );
      case 'APROBADO_ORIGEN':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Liberado en Origen
          </span>
        );
      case 'SOLICITADO':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Solicitado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner explaining Cross-Sector Transfer pass */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BuildingLibraryIcon className="h-6 w-6 text-primary-400" />
            <h3 className="text-xl font-bold">Pase de Transferencia Intersectorial</h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary-500/30 text-primary-300 rounded-full border border-primary-500/40">
              Fiscal • Particular • Municipal
            </span>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Plataforma homologada para el traspaso de estudiantes entre planteles del Sistema Nacional de Educación. Permite la transferencia automática del récord académico histórico y el expediente psicosocial DECE bajo estricta confidencialidad (Art. 14 LOPDP).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary-900/30 transition-all shrink-0"
        >
          <SparklesIcon className="h-4 w-4" />
          Solicitar Nuevo Pase de Transferencia
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Pases Totales
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {transferPasses.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">
            Solicitudes Pendientes
          </span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {transferPasses.filter(p => p.status === 'SOLICITADO').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
            Liberados en Origen
          </span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">
            {transferPasses.filter(p => p.status === 'APROBADO_ORIGEN').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
            Matrículas Concluidas
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {transferPasses.filter(p => p.status === 'COMPLETADO').length}
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de estudiante, código TRF o institución..."
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['TODOS', 'SOLICITADO', 'APROBADO_ORIGEN', 'COMPLETADO'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'TODOS' ? 'Todos' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Transfer List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Código & Fecha</th>
                <th className="px-4 py-3">Estudiante & Grado</th>
                <th className="px-4 py-3">Plantel de Origen</th>
                <th className="px-4 py-3">Plantel de Destino</th>
                <th className="px-4 py-3">Motivo Legal</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron pases de transferencia intersectorial registrados.
                  </td>
                </tr>
              ) : (
                filteredPasses.map((pass) => {
                  const isOrigin = pass.originInstitutionId === currentInstitution.id;
                  const isDestination = pass.destinationInstitutionId === currentInstitution.id;

                  return (
                    <tr key={pass.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block">
                          {pass.transferCode}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(pass.requestDate).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block">{pass.studentName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          CI: {pass.studentIdentification} • {pass.requestedGrade}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800 block truncate max-w-[180px]">
                          {pass.originInstitutionName}
                        </span>
                        <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded border ${getFundingBadgeColor(pass.originFundingType)}`}>
                          {pass.originFundingType}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800 block truncate max-w-[180px]">
                          {pass.destinationInstitutionName}
                        </span>
                        <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded border ${getFundingBadgeColor(pass.destinationFundingType)}`}>
                          {pass.destinationFundingType}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-700 block">{pass.transferReason}</span>
                        {pass.deceTransferFile?.hasNee && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1 rounded">
                            Requiere NEE
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getStatusBadge(pass.status)}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Origin Approval button */}
                          {!isParent && isOrigin && pass.status === 'SOLICITADO' && (
                            <button
                              onClick={() => handleApproveOrigin(pass.id)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] transition-colors"
                              title="Aprobar y liberar expediente académico del estudiante"
                            >
                              Liberar en Origen
                            </button>
                          )}

                          {/* Destination Acceptance button */}
                          {!isParent && isDestination && pass.status === 'APROBADO_ORIGEN' && (
                            <button
                              onClick={() => handleAcceptDestination(pass.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] transition-colors"
                              title="Aceptar cupo y legalizar matrícula definitiva"
                            >
                              Aceptar en Destino
                            </button>
                          )}

                          {/* Print Certificate button */}
                          <button
                            onClick={() => setSelectedPassForPrint(pass)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                            title="Ver certificado del pase de transferencia"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TRANSFER REQUEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold">Solicitud de Pase de Transferencia Intersectorial</h4>
                <p className="text-xs text-slate-400">Traspaso de expediente entre instituciones educativas</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransferRequest} className="p-6 space-y-4 text-xs">
              {students.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Seleccionar Estudiante a Transferir *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- Seleccionar de mis representados o registrar nuevo --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.nationalId || 'CI'}) - {s.grade}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombres del Estudiante *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Ej. Mateo Morales"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cédula del Estudiante *</label>
                  <input
                    type="text"
                    required
                    value={studentIdentification}
                    onChange={(e) => setStudentIdentification(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    placeholder="10 dígitos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plantel de Origen Actual</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentInstitution.name} (${currentInstitution.fundingType || 'Fiscal'})`}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-xs text-slate-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plantel de Destino Solicitado *</label>
                  <select
                    required
                    value={destinationInstId}
                    onChange={(e) => setDestinationInstId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- Seleccione institución destino --</option>
                    {institutions.filter(i => i.id !== currentInstitution.id).map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} [{inst.fundingType || 'Fiscal'}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Curso Solicitado *</label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="8vo EGB">8vo EGB Superior</option>
                    <option value="9no EGB">9no EGB Superior</option>
                    <option value="10mo EGB">10mo EGB Superior</option>
                    <option value="1ro BGU">1ro Bachillerato (BGU)</option>
                    <option value="2do BGU">2do Bachillerato (BGU)</option>
                    <option value="3ro BGU">3ro Bachillerato (BGU)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Causal Normativa de Traspaso *</label>
                  <select
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Cambio de Domicilio">Cambio de Domicilio / Residencia</option>
                    <option value="Situación Económica">Situación Económica Familiar</option>
                    <option value="Asignación Cupo Fiscal">Asignación Centralizada Cupo Fiscal</option>
                    <option value="Beca Municipal / Mérito">Beca Municipal / Mérito Académico</option>
                    <option value="Salud / Bienestar">Salud / Clima Escolar / Bienestar</option>
                    <option value="Otro">Otro Motivo Legal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Justificación del Traslado</label>
                <textarea
                  rows={2}
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  placeholder="Detalles sobre el cambio de sector o traslado de expediente..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900">
                  <input
                    type="checkbox"
                    checked={hasNee}
                    onChange={(e) => setHasNee(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>¿El estudiante cuenta con Necesidades Educativas Específicas (NEE)?</span>
                </label>
                {hasNee && (
                  <input
                    type="text"
                    value={neeDetails}
                    onChange={(e) => setNeeDetails(e.target.value)}
                    placeholder="Tipo de adaptación curricular o diagnóstico DECE..."
                    className="w-full px-2.5 py-1.5 border border-purple-300 rounded-lg bg-white text-xs"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!studentName || !studentIdentification || !destinationInstId}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-sm"
                >
                  Generar Solicitud de Pase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT/VIEW TRANSFER PASS MODAL */}
      {selectedPassForPrint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-slate-300 relative print:p-0">
            <button
              onClick={() => setSelectedPassForPrint(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-lg print:hidden"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            {/* Official Header */}
            <div className="text-center border-b border-slate-300 pb-4 mb-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                República del Ecuador • Ministerio de Educación
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                PASE DE TRANSFERENCIA INTERSECTORIAL
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                CÓDIGO OFICIAL: {selectedPassForPrint.transferCode} • PERIODO: {selectedPassForPrint.academicPeriod}
              </p>
            </div>

            {/* Data details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Estudiante:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPassForPrint.studentName}</span>
                  <span className="text-slate-500 block font-mono">CI: {selectedPassForPrint.studentIdentification}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Representante Legal:</span>
                  <span className="font-bold text-slate-900">{selectedPassForPrint.parentName}</span>
                  <span className="text-slate-500 block">Contacto: {selectedPassForPrint.parentEmail}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Plantel de Origen:</span>
                  <span className="font-bold text-slate-800 block">{selectedPassForPrint.originInstitutionName}</span>
                  <span className="text-[10px] text-slate-500">Régimen: {selectedPassForPrint.originFundingType}</span>
                  <span className="block mt-1 text-[10px] text-emerald-700 font-semibold">
                    {selectedPassForPrint.originApprovalDate 
                      ? `✓ Liberado el ${new Date(selectedPassForPrint.originApprovalDate).toLocaleDateString()}` 
                      : '⏳ Pendiente liberación'}
                  </span>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Plantel de Destino:</span>
                  <span className="font-bold text-slate-800 block">{selectedPassForPrint.destinationInstitutionName}</span>
                  <span className="text-[10px] text-slate-500">Régimen: {selectedPassForPrint.destinationFundingType}</span>
                  <span className="block mt-1 text-[10px] text-primary-700 font-semibold">
                    {selectedPassForPrint.destinationApprovalDate 
                      ? `✓ Aceptado el ${new Date(selectedPassForPrint.destinationApprovalDate).toLocaleDateString()}` 
                      : '⏳ Pendiente aceptación de cupo'}
                  </span>
                </div>
              </div>

              {/* Academic History Record */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                  Historial Académico Portable Transferido:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedPassForPrint.academicPortfolio.gradeRecords.map((r, i) => (
                    <div key={i} className="flex justify-between bg-white p-2 rounded border border-slate-200">
                      <span>{r.grade} ({r.schoolYear}):</span>
                      <span className="font-bold text-slate-800 font-mono">{r.averageScore.toFixed(2)}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-center text-[10px]">
                <div>
                  <div className="border-b border-slate-400 w-36 mx-auto mb-1"></div>
                  <span className="font-bold text-slate-800 block">
                    {selectedPassForPrint.originApprovedByName || 'Rectorado Plantel Origen'}
                  </span>
                  <span className="text-slate-500">Firma & Sello de Liberación</span>
                </div>

                <div>
                  <div className="border-b border-slate-400 w-36 mx-auto mb-1"></div>
                  <span className="font-bold text-slate-800 block">
                    {selectedPassForPrint.destinationApprovedByName || 'Rectorado Plantel Destino'}
                  </span>
                  <span className="text-slate-500">Firma & Sello de Admisión Definitiva</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs"
              >
                Imprimir Documento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default IntersectorialTransferManager;
