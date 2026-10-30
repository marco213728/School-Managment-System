import React, { useState } from 'react';
import { Institution, Student, User, EnrollmentRecord } from '../../types';
import { CloseIcon, IdentificationIcon, CheckCircleIcon } from '../icons/Icons';

interface PrivateAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution: Institution;
  students: Student[];
  currentUser: User | null;
  onSaveEnrollment: (record: EnrollmentRecord) => void;
}

export const PrivateAdmissionModal: React.FC<PrivateAdmissionModalProps> = ({
  isOpen,
  onClose,
  institution,
  students,
  currentUser,
  onSaveEnrollment
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [studentIdentification, setStudentIdentification] = useState<string>('');
  const [targetGrade, setTargetGrade] = useState<string>('10mo EGB');
  
  // Financial & Scholarship state
  const isMunicipal = institution.fundingType === 'Municipal';
  const defaultTuition = institution.costResolution?.maxTuitionFee || (isMunicipal ? 0 : 180);
  const defaultEnrollment = institution.costResolution?.maxEnrollmentFee || (isMunicipal ? 0 : 135);
  
  const [paymentModality, setPaymentModality] = useState<'Mensual' | 'Anual_Contado'>('Mensual');
  const [selectedScholarship, setSelectedScholarship] = useState<string>(isMunicipal ? 'Beca Municipal DMQ (100%)' : 'Ninguna');
  
  // Billing data
  const [billingName, setBillingName] = useState<string>(currentUser?.name || '');
  const [billingId, setBillingId] = useState<string>(currentUser?.cedula || '1712345678');
  const [billingEmail, setBillingEmail] = useState<string>(currentUser?.email || '');
  const [billingPhone, setBillingPhone] = useState<string>(currentUser?.phone || '0995551234');
  const [billingAddress, setBillingAddress] = useState<string>(currentUser?.address || 'Quito, Av. República');

  // Contract digital signature state
  const [acceptClauses, setAcceptClauses] = useState<boolean>(false);
  const [acceptLopdp, setAcceptLopdp] = useState<boolean>(false);
  const [signatureName, setSignatureName] = useState<string>(currentUser?.name || '');
  const [signatureId, setSignatureId] = useState<string>(currentUser?.cedula || '1712345678');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdRecord, setCreatedRecord] = useState<EnrollmentRecord | null>(null);

  if (!isOpen) return null;

  // Scholarship discount logic
  let discountPercent = 0;
  if (selectedScholarship.includes('100%')) discountPercent = 100;
  else if (selectedScholarship.includes('50%')) discountPercent = 50;
  else if (selectedScholarship.includes('15%')) discountPercent = 15;

  const finalEnrollmentFee = discountPercent === 100 ? 0 : defaultEnrollment;
  const rawMonthlyFee = defaultTuition * (1 - discountPercent / 100);
  const finalMonthlyFee = paymentModality === 'Anual_Contado' && discountPercent < 100 
    ? Math.round(rawMonthlyFee * 0.95 * 100) / 100 // 5% de descuento por pago anual
    : Math.round(rawMonthlyFee * 100) / 100;

  const totalAnnualTuition = Math.round(finalMonthlyFee * 10 * 100) / 100;

  const handleSelectExistingStudent = (id: string) => {
    setSelectedStudentId(id);
    const found = students.find(s => s.id === id);
    if (found) {
      setStudentName(found.name);
      setStudentIdentification(found.nationalId || '1723456789');
      setTargetGrade(found.grade || '10mo EGB');
    }
  };

  const handleFinishAdmission = () => {
    setIsSubmitting(true);
    const timestamp = new Date().toISOString();
    const contractNum = `CTR-${institution.codeAMIE || 'INST'}-${Date.now().toString().slice(-6)}`;
    const certCode = `MATR-${institution.codeAMIE || 'EC'}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEnrollment: EnrollmentRecord = {
      id: `enr-priv-${Date.now()}`,
      institutionId: institution.id,
      institutionName: institution.name,
      studentId: selectedStudentId || `std-new-${Date.now()}`,
      studentName: studentName || 'Estudiante Matriculado',
      studentNationalId: studentIdentification || '1799887766',
      parentId: currentUser?.id || 'parent1',
      parentName: currentUser?.name || billingName,
      parentNationalId: billingId || '1712345678',
      parentEmail: currentUser?.email || billingEmail,
      parentPhone: billingPhone,
      parentAddress: billingAddress,
      planillaContrato: 'PARTICULAR-NO-CUEN',
      zone: 'Zona 9 - D.M.Q.',
      district: institution.costResolution?.validAcademicPeriod || '17D05 Norte',
      circuit: 'PARTICULAR-AUTONOMO',
      academicYear: '2025-2026',
      targetClassId: 'class1',
      targetGrade: targetGrade,
      enrollmentType: isMunicipal ? 'MUNICIPAL' : 'ORDINARIA_PARTICULAR',
      status: 'APROBADO', // Auto-aprobada tras contrato y validación
      documents: {
        identificacion: {
          id: `doc-id-${Date.now()}`,
          name: 'Cedula_Identidad_Estudiante.pdf',
          documentType: 'CEDULA_ESTUDIANTE',
          fileType: 'pdf',
          status: 'VALIDADO',
          uploadedAt: timestamp,
          fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
        },
        promocion: {
          id: `doc-pro-${Date.now()}`,
          name: 'Certificado_Promocion_Legalizado.pdf',
          documentType: 'CERTIFICADO_PROMOCION',
          fileType: 'pdf',
          status: 'VALIDADO',
          uploadedAt: timestamp,
          fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80'
        },
        fichaMedica: {
          id: `doc-med-${Date.now()}`,
          name: 'Ficha_Medica_DECE.pdf',
          documentType: 'FICHA_DECE',
          fileType: 'pdf',
          status: 'VALIDADO',
          uploadedAt: timestamp,
          fileUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80'
        }
      },
      financialLedger: {
        enrollmentFee: defaultEnrollment,
        monthlyTuitionFee: defaultTuition,
        totalMonths: 10,
        scholarshipPercent: discountPercent,
        scholarshipReason: selectedScholarship !== 'Ninguna' ? selectedScholarship : undefined,
        finalEnrollmentFee,
        finalMonthlyFee,
        paymentModality,
        billingData: {
          name: billingName,
          identification: billingId,
          email: billingEmail,
          phone: billingPhone,
          address: billingAddress
        }
      },
      contractSignOff: {
        contractNumber: contractNum,
        signedAt: timestamp,
        signedByIp: '190.152.188.42',
        signedByName: signatureName,
        signedByIdentification: signatureId,
        status: 'FIRMADO'
      },
      enrollmentCertificateCode: certCode,
      enrolledAt: timestamp,
      reviewedBy: currentUser?.id || 'admin1',
      reviewedByName: `${institution.rectorName || 'Rectorado'} / Secretaría`,
      reviewNotes: `Matrícula formal legalizada bajo Resolución de Costos ${institution.costResolution?.resolutionNumber || 'Oficial'}. Contrato digital ${contractNum}.`,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setTimeout(() => {
      onSaveEnrollment(newEnrollment);
      setCreatedRecord(newEnrollment);
      setIsSubmitting(false);
      setStep(4);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-primary-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-600/30 rounded-xl border border-primary-500/30">
              <IdentificationIcon className="h-6 w-6 text-primary-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  {institution.fundingType === 'Municipal' ? 'Admisión & Matrícula Municipal' : 'Admisión & Contrato Particular'}
                </h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  institution.fundingType === 'Municipal' ? 'bg-amber-500 text-slate-950' : 'bg-primary-500 text-white'
                }`}>
                  {institution.fundingType || 'Particular'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {institution.name} • Resolución: {institution.costResolution?.resolutionNumber || 'Oficial MinEduc'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-medium text-slate-600">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary-700 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>1</span>
            <span>Estudiante & Curso</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary-700 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>2</span>
            <span>Resolución & Costos</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-2 ${step === 3 ? 'text-primary-700 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 3 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>3</span>
            <span>Contrato Digital</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-2 ${step === 4 ? 'text-emerald-700 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>4</span>
            <span>Legalizado</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: Student info */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
                <p className="font-semibold mb-1">Admisión Autónoma Regulada (Art. 134 LOEI)</p>
                <p className="text-blue-700">
                  Las instituciones educativas particulares y municipales registran a sus postulantes validando su historial de promociones y asignación según disponibilidad de cupos en el curso objetivo.
                </p>
              </div>

              {students.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Seleccionar Hijo / Estudiante Registrado
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleSelectExistingStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="">-- Ingresar nuevo postulante o seleccionar --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.nationalId || 'Sin Cédula'}) - {s.grade}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombres y Apellidos Completos *
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Ej. Mateo Sebastián Morales"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cédula de Identidad / Pasaporte *
                  </label>
                  <input
                    type="text"
                    value={studentIdentification}
                    onChange={(e) => setStudentIdentification(e.target.value)}
                    placeholder="10 dígitos numéricos"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grado / Curso Solicitado *
                  </label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="1ro EGB">1ro EGB (Preparatoria)</option>
                    <option value="2do EGB">2do EGB Elemental</option>
                    <option value="5to EGB">5to EGB Media</option>
                    <option value="8vo EGB">8vo EGB Superior</option>
                    <option value="9no EGB">9no EGB Superior</option>
                    <option value="10mo EGB">10mo EGB Superior</option>
                    <option value="1ro BGU">1ro de Bachillerato (BGU)</option>
                    <option value="2do BGU">2do de Bachillerato (BGU)</option>
                    <option value="3ro BGU">3ro de Bachillerato (BGU)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Año Lectivo de Matrícula
                  </label>
                  <input
                    type="text"
                    value="2025 - 2026 (Régimen Sierra - Amazonía)"
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-sm text-slate-600"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Documentación Habilitante Requerida
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Cédula de identidad de estudiante y representante</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Certificado de promoción legalizado del año anterior</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Ficha médica y de consejería estudiantil (DECE)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Cost resolution & Financial plan */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Cost Resolution Banner */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">
                      Resolución Oficial de Costos MinEduc
                    </span>
                    <h4 className="text-base font-bold text-white font-mono">
                      {institution.costResolution?.resolutionNumber || 'JD-PICH-0174-2025'}
                    </h4>
                  </div>
                  <div className="text-right text-xs text-slate-300">
                    <p>Autorizado: {institution.costResolution?.authoritySignature || 'Junta Distrital de Regulación'}</p>
                    <p className="text-[10px] text-slate-400">Vigencia: Periodo {institution.costResolution?.validAcademicPeriod || '2025-2026'}</p>
                  </div>
                </div>
              </div>

              {/* Tuition and Fee Breakdown Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Valores Oficiales Aprobados
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Matrícula (máx. 75% pensión):</span>
                      <span className="font-bold text-slate-800 font-mono">${defaultEnrollment.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Pensión Mensual (10 cuotas):</span>
                      <span className="font-bold text-slate-800 font-mono">${defaultTuition.toFixed(2)} / mes</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Total Anual Referencial:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        ${(defaultEnrollment + defaultTuition * 10).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-primary-200 rounded-xl p-4 bg-primary-50/50">
                  <h5 className="text-xs font-bold text-primary-900 uppercase tracking-wider mb-3">
                    Políticas de Becas & Descuentos
                  </h5>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Beneficio Aplicable
                  </label>
                  <select
                    value={selectedScholarship}
                    onChange={(e) => setSelectedScholarship(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none mb-3"
                  >
                    <option value="Ninguna">Ninguna (Valores Regulares)</option>
                    <option value="Beca Mérito Académico (100%)">Beca Mérito Académico (100% pensión)</option>
                    <option value="Beca Hermanos (15%)">Beca Segundo/Tercer Hermano (15% pensión)</option>
                    <option value="Beca Deportiva / Talento (50%)">Beca Talento / Deportiva (50% pensión)</option>
                    {institution.fundingType === 'Municipal' && (
                      <option value="Beca Municipal DMQ (100%)">Beca Municipal DMQ - Ordenanza 089 (100% Total)</option>
                    )}
                  </select>

                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Modalidad de Pago
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentModality('Mensual')}
                      className={`p-2 rounded-lg border text-center font-medium transition-all ${
                        paymentModality === 'Mensual'
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      10 Cuotas Mensuales
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentModality('Anual_Contado')}
                      className={`p-2 rounded-lg border text-center font-medium transition-all ${
                        paymentModality === 'Anual_Contado'
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Pago Anual (-5%)
                    </button>
                  </div>
                </div>
              </div>

              {/* Net Payable Summary */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Total a Legalizar para Matrícula
                  </span>
                  <p className="text-xs text-emerald-700">
                    {discountPercent === 100 
                      ? 'Exoneración total aplicada conforme a beca institucional / municipal' 
                      : `Matrícula: $${finalEnrollmentFee.toFixed(2)} + 10 pensiones de $${finalMonthlyFee.toFixed(2)}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-900 font-mono">
                    ${(finalEnrollmentFee + totalAnnualTuition).toFixed(2)}
                  </span>
                  <span className="block text-[10px] text-emerald-700">anual total</span>
                </div>
              </div>

              {/* Billing Info */}
              <div className="border-t border-slate-200 pt-4">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Datos para Facturación Electrónica SRI
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1">Razón Social / Nombres</label>
                    <input
                      type="text"
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">RUC / Cédula</label>
                    <input
                      type="text"
                      value={billingId}
                      onChange={(e) => setBillingId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Correo de Facturación</label>
                    <input
                      type="email"
                      value={billingEmail}
                      onChange={(e) => setBillingEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Educational Services Legal Contract */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">Contrato de Prestación de Servicios Educativos</span>
                  <p className="text-amber-800">Conforme al Art. 135 de la Ley Orgánica de Educación Intercultural (LOEI).</p>
                </div>
                <span className="text-[10px] font-mono bg-amber-200/60 px-2 py-0.5 rounded text-amber-950">
                  Validez Jurídica Digital
                </span>
              </div>

              {/* Contract Clauses scroll area */}
              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 text-xs text-slate-700 max-h-56 overflow-y-auto space-y-3 font-serif leading-relaxed">
                <p className="text-center font-bold font-sans uppercase tracking-wider text-slate-900">
                  CONTRATO DE PRESTACIÓN DE SERVICIOS EDUCATIVOS - AÑO LECTIVO 2025-2026
                </p>
                <p>
                  Comparecen a la celebración del presente contrato, por una parte la institución educativa <strong>{institution.name}</strong>, legalmente representada por su Máxima Autoridad; y por otra parte, el/la señor/a <strong>{signatureName || billingName}</strong>, con cédula de identidad <strong>{signatureId || billingId}</strong>, en su calidad de representante legal del estudiante <strong>{studentName}</strong>.
                </p>
                <p>
                  <strong>PRIMERA: OBJETO DEL CONTRATO.-</strong> La institución se compromete a impartir al estudiante el programa de estudios correspondiente al nivel de <strong>{targetGrade}</strong>, cumpliendo los estándares de calidad del Ministerio de Educación y el Proyecto Educativo Institucional (PEI).
                </p>
                <p>
                  <strong>SEGUNDA: COSTOS REGULADOS.-</strong> Las partes convienen en acatar los valores establecidos en la Resolución de Costos <strong>{institution.costResolution?.resolutionNumber || 'Oficial'}</strong> dictada por la Junta Distrital de Regulación de Pensiones y Matrículas. El valor de matrícula asciende a <strong>${finalEnrollmentFee.toFixed(2)}</strong> y diez pensiones mensuales de <strong>${finalMonthlyFee.toFixed(2)}</strong>.
                </p>
                <p>
                  <strong>TERCERA: OBLIGACIONES DEL REPRESENTANTE.-</strong> El representante legal se compromete a apoyar el proceso pedagógico del estudiante, velar por su asistencia puntual, asistir a las citaciones docentes o del DECE y cumplir puntualmente con los compromisos contractuales asumidos.
                </p>
                <p>
                  <strong>CUARTA: PROTECCIÓN DE DATOS PERSONALES (LOPDP).-</strong> El representante otorga su consentimiento libre, previo, expreso e informado para el tratamiento de los datos académicos y de bienestar del estudiante conforme al Artículo 14 de la Ley Orgánica de Protección de Datos Personales, con derecho a rectificación mediante el módulo MOGAC.
                </p>
              </div>

              {/* Acceptance checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptClauses}
                    onChange={(e) => setAcceptClauses(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs text-slate-700">
                    Acepto íntegramente las cláusulas del Contrato de Prestación de Servicios Educativos y el Código de Convivencia Institucional.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptLopdp}
                    onChange={(e) => setAcceptLopdp(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs text-slate-700">
                    Autorizo el tratamiento de datos personales de mi representado bajo la Ley Orgánica de Protección de Datos Personales (LOPDP).
                  </span>
                </label>
              </div>

              {/* Digital Signature Confirmation */}
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Nombre Completo del Firmante *</label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Cédula del Firmante *</label>
                  <input
                    type="text"
                    value={signatureId}
                    onChange={(e) => setSignatureId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success confirmation */}
          {step === 4 && createdRecord && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircleIcon className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  ¡Matrícula Particular Legalizada con Éxito!
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  El contrato de servicios educativos ha sido firmado digitalmente y el estudiante ha sido incorporado al padrón oficial de {institution.name}.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-lg mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Estudiante:</span>
                  <span className="font-bold text-slate-800">{createdRecord.studentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Curso Asignado:</span>
                  <span className="font-bold text-slate-800">{createdRecord.targetGrade}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Contrato No.:</span>
                  <span className="font-mono font-bold text-primary-700">{createdRecord.contractSignOff?.contractNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Certificado de Matrícula:</span>
                  <span className="font-mono font-bold text-slate-800">{createdRecord.enrollmentCertificateCode}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Plan Financiero:</span>
                  <span className="font-bold text-emerald-700">
                    Matrícula: ${createdRecord.financialLedger?.finalEnrollmentFee.toFixed(2)} • Pensión: ${createdRecord.financialLedger?.finalMonthlyFee.toFixed(2)}/mes
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Atrás
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-3">
            {step < 3 && (
              <button
                type="button"
                disabled={!studentName || !studentIdentification}
                onClick={() => setStep((step + 1) as any)}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                Continuar a {step === 1 ? 'Costos y Becas' : 'Contrato Digital'}
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                disabled={!acceptClauses || !acceptLopdp || !signatureName || !signatureId || isSubmitting}
                onClick={handleFinishAdmission}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                {isSubmitting ? 'Legalizando Contrato...' : 'Firmar Contrato y Legalizar Matrícula'}
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                Finalizar y Ver en Panel
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivateAdmissionModal;
