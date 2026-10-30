import React, { useState, useContext } from 'react';
import { UserContext, InstitutionContext } from '../../contexts/UserContext';
import { EnrollmentRecord, EnrollmentDocument } from '../../types';
import { 
  BuildingLibraryIcon, 
  CheckCircleIcon, 
  UploadIcon, 
  ShieldCheckIcon, 
  CloseIcon, 
  IdentificationIcon 
} from '../icons/Icons';

interface JuntosPortalSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitEnrollment: (record: EnrollmentRecord) => void;
  classes: any[];
}

const ECUADOR_DISTRICTS = [
  { id: '17D06', name: '17D06 - Eloy Alfaro', circuits: ['17D06C01_Chimbacalle', '17D06C02_LaMagdalena', '17D06C04_Solanda'] },
  { id: '17D05', name: '17D05 - Norte', circuits: ['17D05C01_Cotocollao', '17D05C02_Ponceano'] },
  { id: '17D04', name: '17D04 - Centro', circuits: ['17D04C01_CentroHistorico', '17D04C02_SanJuan'] },
];

const TARGET_GRADES = [
  'Inicial 1 (3 años)',
  'Inicial 2 (4 años)',
  '1ro EGB (Preparatoria)',
  '2do EGB',
  '3ro EGB',
  '4to EGB',
  '5to EGB',
  '6to EGB',
  '7mo EGB',
  '8vo EGB Superior',
  '9no EGB Superior',
  '10mo EGB Superior',
  '1ro BGU',
  '2do BGU',
  '3ro BGU'
];

const JuntosPortalSimulator: React.FC<JuntosPortalSimulatorProps> = ({
  isOpen,
  onClose,
  onSubmitEnrollment,
  classes
}) => {
  const { user } = useContext(UserContext);
  const { institution } = useContext(InstitutionContext);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Representative
  const [parentName, setParentName] = useState(user?.name || '');
  const [parentNationalId, setParentNationalId] = useState(user?.cedula || '1712345678');
  const [parentEmail, setParentEmail] = useState(user?.email || '');
  const [parentPhone, setParentPhone] = useState(user?.phone || '0991234567');
  const [parentAddress, setParentAddress] = useState(user?.address || 'Av. Maldonado y Moraspungo');
  const [cedulaFile, setCedulaFile] = useState<File | null>(null);

  // Step 2: Student
  const [studentName, setStudentName] = useState('');
  const [studentNationalId, setStudentNationalId] = useState('');
  const [studentBirthDate, setStudentBirthDate] = useState('2014-06-15');
  const [studentGender, setStudentGender] = useState<'FEMENINO' | 'MASCULINO' | 'OTRO'>('MASCULINO');
  const [targetGrade, setTargetGrade] = useState('8vo EGB Superior');
  const [studentCedulaFile, setStudentCedulaFile] = useState<File | null>(null);

  // Step 3: Geographic & Electricity bill
  const [selectedDistrict, setSelectedDistrict] = useState(ECUADOR_DISTRICTS[0].id);
  const [selectedCircuit, setSelectedCircuit] = useState(ECUADOR_DISTRICTS[0].circuits[2]);
  const [planillaContrato, setPlanillaContrato] = useState('1004829104');
  const [planillaFile, setPlanillaFile] = useState<File | null>(null);

  // Step 4: Academic history & DECE
  const [promoFile, setPromoFile] = useState<File | null>(null);
  const [fichaDeceFile, setFichaDeceFile] = useState<File | null>(null);

  // Completion state
  const [completedRecord, setCompletedRecord] = useState<EnrollmentRecord | null>(null);

  if (!isOpen) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    const newDocs: Record<string, EnrollmentDocument> = {
      cedulaRepresentante: {
        id: `doc-${Date.now()}-1`,
        name: cedulaFile ? cedulaFile.name : `Cedula_${parentName.replace(/\s+/g, '_')}.pdf`,
        fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date().toISOString(),
        status: 'PENDIENTE',
        documentType: 'CEDULA_REPRESENTANTE'
      },
      cedulaEstudiante: {
        id: `doc-${Date.now()}-2`,
        name: studentCedulaFile ? studentCedulaFile.name : `Cedula_${studentName.replace(/\s+/g, '_')}.pdf`,
        fileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date().toISOString(),
        status: 'PENDIENTE',
        documentType: 'CEDULA_ESTUDIANTE'
      },
      planillaElectrica: {
        id: `doc-${Date.now()}-3`,
        name: planillaFile ? planillaFile.name : `Planilla_EEQ_${planillaContrato}.pdf`,
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date().toISOString(),
        status: 'PENDIENTE',
        documentType: 'PLANILLA_ELECTRICA'
      },
      certificadosPromocion: {
        id: `doc-${Date.now()}-4`,
        name: promoFile ? promoFile.name : `Certificado_Promocion_${studentName.replace(/\s+/g, '_')}.pdf`,
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date().toISOString(),
        status: 'PENDIENTE',
        documentType: 'CERTIFICADO_PROMOCION'
      }
    };

    if (fichaDeceFile) {
      newDocs.fichaDece = {
        id: `doc-${Date.now()}-5`,
        name: fichaDeceFile.name,
        fileUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
        fileType: 'image',
        uploadedAt: new Date().toISOString(),
        status: 'PENDIENTE',
        documentType: 'FICHA_DECE'
      };
    }

    const receiptNum = `JUNTOS-2026-${selectedDistrict}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: EnrollmentRecord = {
      id: `mat-${Date.now()}`,
      institutionId: institution?.id || 'uemol',
      studentName: studentName.trim(),
      studentNationalId: studentNationalId.trim(),
      studentBirthDate,
      studentGender,
      parentId: user?.id || 'parent1',
      parentName: parentName.trim(),
      parentNationalId: parentNationalId.trim(),
      parentEmail: parentEmail.trim(),
      parentPhone: parentPhone.trim(),
      parentAddress: parentAddress.trim(),
      planillaContrato: planillaContrato.trim(),
      zone: 'Zona 9 - D.M.Q.',
      district: ECUADOR_DISTRICTS.find(d => d.id === selectedDistrict)?.name || selectedDistrict,
      circuit: selectedCircuit,
      academicYear: '2026-2027',
      targetClassId: classes[0]?.id || 'class1',
      targetGrade,
      enrollmentType: 'NUEVA_ASIGNACION',
      status: 'EN_REVISION',
      documents: newDocs,
      juntosReceipt: {
        receiptNumber: receiptNum,
        assignmentDate: new Date().toISOString(),
        distanceKm: 0.92,
        capacityAvailable: 15,
        priorityAssigned: 'Prioridad 1 - Georreferenciación por Suministro Eléctrico'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCompletedRecord(newRecord);
    onSubmitEnrollment(newRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* MinEduc / Juntos Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <BuildingLibraryIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-blue-200">
                  Portal Oficial de Registro y Asignación
                </span>
                <h2 className="text-xl font-black tracking-tight">juntos.educacion.gob.ec</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-blue-100 mt-2">
            Proceso de asignación territorial y matrícula en línea para el Régimen Escolar Sierra - Amazonía 2026-2027.
          </p>

          {/* Stepper */}
          {!completedRecord && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs">
              <div className={`flex items-center gap-1.5 ${step >= 1 ? 'font-bold text-white' : 'text-white/50'}`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                <span>Representante</span>
              </div>
              <div className="w-8 h-px bg-white/20"></div>
              <div className={`flex items-center gap-1.5 ${step >= 2 ? 'font-bold text-white' : 'text-white/50'}`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                <span>Estudiante</span>
              </div>
              <div className="w-8 h-px bg-white/20"></div>
              <div className={`flex items-center gap-1.5 ${step >= 3 ? 'font-bold text-white' : 'text-white/50'}`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                <span>Georreferenciación</span>
              </div>
              <div className="w-8 h-px bg-white/20"></div>
              <div className={`flex items-center gap-1.5 ${step >= 4 ? 'font-bold text-white' : 'text-white/50'}`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">4</span>
                <span>Documentos</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {completedRecord ? (
            /* Success & Assignment Receipt View */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircleIcon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  ¡Cupo Asignado e Inscripción Enviada con Éxito!
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  El expediente digital ha sido recibido en el sistema central de la institución educativa. 
                  Se ha generado su comprobante oficial de asignación del portal <strong>juntos.educacion.gob.ec</strong>.
                </p>
              </div>

              {/* Official Receipt Box */}
              <div className="p-5 bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Comprobante Oficial de Asignación Territorial
                  </span>
                  <span className="font-mono text-xs font-black text-blue-700 bg-white px-2.5 py-0.5 rounded-md border border-blue-200">
                    {completedRecord.juntosReceipt?.receiptNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Estudiante Asignado:</span>
                    <p className="font-bold text-slate-900">{completedRecord.studentName}</p>
                    <p className="text-[11px] font-mono text-slate-600">C.I: {completedRecord.studentNationalId}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Institución Educativa:</span>
                    <p className="font-bold text-slate-900">{institution?.name || 'Unidad Educativa Municipal'}</p>
                    <p className="text-[11px] text-slate-600">Grado: <strong>{completedRecord.targetGrade}</strong></p>
                  </div>
                  <div>
                    <span className="text-slate-500">Criterio de Asignación:</span>
                    <p className="font-semibold text-emerald-700">{completedRecord.juntosReceipt?.priorityAssigned}</p>
                    <p className="text-[11px] text-slate-600">Distancia calculada al plantel: <strong>{completedRecord.juntosReceipt?.distanceKm} km</strong></p>
                  </div>
                  <div>
                    <span className="text-slate-500">Representante Legal:</span>
                    <p className="font-bold text-slate-900">{completedRecord.parentName}</p>
                    <p className="text-[11px] text-slate-600">Notificaciones: {completedRecord.parentEmail}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200 flex items-center justify-between text-[11px] text-blue-800">
                  <span>Circuito: <strong>{completedRecord.circuit}</strong> • Distrito: <strong>{completedRecord.district}</strong></span>
                  <span className="font-mono">Fecha: {new Date().toLocaleDateString('es-EC')}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow-xs"
                >
                  Entendido, Ver Estado de Mi Matrícula
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFinish} className="space-y-6">
              {/* Step 1: Representative */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <IdentificationIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Paso 1: Datos de Identidad y Contacto del Representante Legal
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cédula o Pasaporte del Representante *
                      </label>
                      <input
                        type="text"
                        required
                        value={parentNationalId}
                        onChange={(e) => setParentNationalId(e.target.value)}
                        placeholder="Ej: 1712345678"
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombres y Apellidos Completos *
                      </label>
                      <input
                        type="text"
                        required
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Ej: Maria Elena Gomez"
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo Electrónico para Certificados y Notificaciones *
                      </label>
                      <input
                        type="email"
                        required
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teléfono Celular de Contacto *
                      </label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="0991234567"
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dirección Domiciliaria Exacta *
                      </label>
                      <input
                        type="text"
                        required
                        value={parentAddress}
                        onChange={(e) => setParentAddress(e.target.value)}
                        placeholder="Calle principal, número y calle secundaria"
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Copia Digital de Cédula del Representante (PDF o Imagen)
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <UploadIcon className="h-5 w-5 text-slate-400" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => setCedulaFile(e.target.files ? e.target.files[0] : null)}
                          className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!parentName || !parentNationalId || !parentEmail}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      Siguiente: Datos del Estudiante ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Student */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <IdentificationIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Paso 2: Datos de Identidad del Estudiante a Matricular
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cédula o Número de Partida de Nacimiento *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentNationalId}
                        onChange={(e) => setStudentNationalId(e.target.value)}
                        placeholder="1750000000"
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombres y Apellidos del Estudiante *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Ej: Daniel Alejandro Andrade Gómez"
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        required
                        value={studentBirthDate}
                        onChange={(e) => setStudentBirthDate(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Género Registral *
                      </label>
                      <select
                        value={studentGender}
                        onChange={(e) => setStudentGender(e.target.value as any)}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="FEMENINO">Femenino</option>
                        <option value="MASCULINO">Masculino</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Grado / Curso Solicitado *
                      </label>
                      <select
                        value={targetGrade}
                        onChange={(e) => setTargetGrade(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                      >
                        {TARGET_GRADES.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Adjunto: Cédula o Partida de Nacimiento del Estudiante
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <UploadIcon className="h-5 w-5 text-slate-400" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => setStudentCedulaFile(e.target.files ? e.target.files[0] : null)}
                          className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      ← Volver
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!studentName || !studentNationalId}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      Siguiente: Georreferenciación ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Geographic & Electricity Bill */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <BuildingLibraryIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Paso 3: Georreferenciación y Planilla Eléctrica (Sectorización MinEduc)
                    </h3>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                    <strong>Criterio Oficial de Zonificación:</strong> Conforme a la normativa ministerial, la 
                    asignación escolar prioriza la cercanía domiciliaria mediante el Código Único Eléctrico Nacional 
                    (CUEN) de la planilla de luz, garantizando cupos en el circuito y distrito más próximo.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Distrito Educativo Asignado *
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => {
                          setSelectedDistrict(e.target.value);
                          const dist = ECUADOR_DISTRICTS.find(d => d.id === e.target.value);
                          if (dist && dist.circuits[0]) setSelectedCircuit(dist.circuits[0]);
                        }}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {ECUADOR_DISTRICTS.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Circuito Territorial *
                      </label>
                      <select
                        value={selectedCircuit}
                        onChange={(e) => setSelectedCircuit(e.target.value)}
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {ECUADOR_DISTRICTS.find(d => d.id === selectedDistrict)?.circuits.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Código de Cuenta Contrato / Suministro (Planilla Eléctrica) *
                      </label>
                      <input
                        type="text"
                        required
                        value={planillaContrato}
                        onChange={(e) => setPlanillaContrato(e.target.value)}
                        placeholder="Ej: 1004829104"
                        className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500">
                        Se ubica en la esquina superior derecha de la planilla emitida por la Empresa Eléctrica.
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Copia Digital de la Planilla de Energía Eléctrica (Obligatorio)
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <UploadIcon className="h-5 w-5 text-slate-400" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => setPlanillaFile(e.target.files ? e.target.files[0] : null)}
                          className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      ← Volver
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      disabled={!planillaContrato}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      Siguiente: Archivos Académicos ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Academic history & DECE */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Paso 4: Expediente Académico y Ficha Interna (DECE)
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Certificados de Promoción Históricos / Examen de Ubicación
                      </label>
                      <p className="text-[11px] text-slate-500 mb-1">
                        Adjunte los certificados legalizados de los años anteriores o resultado de examen de ubicación.
                      </p>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <UploadIcon className="h-5 w-5 text-slate-400" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => setPromoFile(e.target.files ? e.target.files[0] : null)}
                          className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ficha de Datos Interna / Ficha Socioemocional DECE (Opcional)
                      </label>
                      <p className="text-[11px] text-slate-500 mb-1">
                        Ficha de antecedentes de salud, necesidades educativas o acompañamiento familiar.
                      </p>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <UploadIcon className="h-5 w-5 text-slate-400" />
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => setFichaDeceFile(e.target.files ? e.target.files[0] : null)}
                          className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary before submit */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-800">Resumen de Matrícula:</p>
                    <p className="text-slate-600">• Estudiante: <strong>{studentName}</strong> (C.I: {studentNationalId})</p>
                    <p className="text-slate-600">• Grado Asignado: <strong>{targetGrade}</strong></p>
                    <p className="text-slate-600">• Institución: <strong>{institution?.name || 'Unidad Educativa Municipal'}</strong></p>
                    <p className="text-slate-600">• Sector: <strong>{selectedCircuit}</strong> (Distrito {selectedDistrict})</p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      ← Volver
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition shadow-md"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Confirmar y Enviar Matrícula</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default JuntosPortalSimulator;
