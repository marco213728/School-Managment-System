import React, { useContext } from 'react';
import { EnrollmentRecord } from '../../types';
import { InstitutionContext } from '../../contexts/UserContext';
import { PrinterIcon, CloseIcon, ShieldCheckIcon, DownloadIcon } from '../icons/Icons';
import AmautaLogo from '../branding/AmautaLogo';

interface DigitalEnrollmentCertificateProps {
  enrollment: EnrollmentRecord;
  onClose: () => void;
}

const DigitalEnrollmentCertificate: React.FC<DigitalEnrollmentCertificateProps> = ({
  enrollment,
  onClose
}) => {
  const { institution } = useContext(InstitutionContext);

  const certCode = enrollment.enrollmentCertificateCode || `CERT-2026-${enrollment.id.toUpperCase()}`;
  const enrollmentDate = enrollment.enrolledAt 
    ? new Date(enrollment.enrolledAt).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Modal Controls - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Certificado Oficial de Inscripción y Matrícula
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition shadow-2xs"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              title="Cerrar"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Body */}
        <div className="p-8 sm:p-12 font-serif text-slate-900 bg-white max-h-[80vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {institution?.logoUrl && !institution.logoUrl.includes('placehold') ? (
                  <img src={institution.logoUrl} alt="Escudo Institucional" className="h-20 w-auto object-contain" />
                ) : (
                  <AmautaLogo mode="light" className="h-16 w-auto" />
                )}
                <div>
                  <h4 className="text-xs uppercase font-sans tracking-widest text-slate-500 font-bold">
                    República del Ecuador • Ministerio de Educación
                  </h4>
                  <h1 className="text-2xl font-black uppercase text-slate-900 mt-0.5">
                    {institution?.name || 'Unidad Educativa Municipal'}
                  </h1>
                  <p className="text-xs text-slate-600 font-sans mt-0.5">
                    Código AMIE: <strong>{institution?.codeAMIE || '17H00001'}</strong> • {institution?.contact?.address || 'Quito, Ecuador'}
                  </p>
                </div>
              </div>
              <div className="text-right font-sans">
                <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                  ✓ Matrícula Asignada
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  No. Registro: {certCode}
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-8">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">
              Certificado Oficial de Inscripción y Matrícula
            </h2>
            <p className="text-sm font-sans text-slate-600 mt-1">
              Régimen Sierra - Amazonía • Periodo Lectivo <strong>{enrollment.academicYear}</strong>
            </p>
          </div>

          {/* Legal statement */}
          <p className="text-sm leading-relaxed text-justify mb-6">
            La Secretaría General y el Rectorado de la institución educativa certifican que, de conformidad con la 
            Ley Orgánica de Educación Intercultural (LOEI) y el proceso de asignación y matrícula del sistema 
            <strong> juntos.educacion.gob.ec</strong>, se encuentra formal y legalmente matriculado/a para el presente año lectivo:
          </p>

          {/* Student Profile Box */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 mb-6 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 border-b border-slate-200 pb-1">
              1. Datos del Estudiante
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs">
              <div>
                <span className="text-slate-500">Nombres y Apellidos:</span>{' '}
                <strong className="text-slate-900 text-sm">{enrollment.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Cédula / Identificación:</span>{' '}
                <strong className="text-slate-900 font-mono">{enrollment.studentNationalId}</strong>
              </div>
              <div>
                <span className="text-slate-500">Grado / Nivel Asignado:</span>{' '}
                <strong className="text-indigo-700">{enrollment.targetGrade}</strong>
              </div>
              <div>
                <span className="text-slate-500">Tipo de Matrícula:</span>{' '}
                <span className="capitalize">{enrollment.enrollmentType.replace(/_/g, ' ').toLowerCase()}</span>
              </div>
            </div>
          </div>

          {/* Representative & Territorial Box */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 mb-8 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 border-b border-slate-200 pb-1">
              2. Representante Legal y Sectorización Georreferenciada (MinEduc)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs">
              <div>
                <span className="text-slate-500">Representante Legal:</span>{' '}
                <strong className="text-slate-900">{enrollment.parentName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Cédula del Representante:</span>{' '}
                <strong className="text-slate-900 font-mono">{enrollment.parentNationalId}</strong>
              </div>
              <div>
                <span className="text-slate-500">Correo Notificaciones:</span>{' '}
                <strong className="text-slate-700">{enrollment.parentEmail}</strong>
              </div>
              <div>
                <span className="text-slate-500">Teléfono Registrado:</span>{' '}
                <strong className="text-slate-700">{enrollment.parentPhone}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500">Dirección Domiciliaria Verificada:</span>{' '}
                <strong className="text-slate-800">{enrollment.parentAddress}</strong>
                {enrollment.planillaContrato && (
                  <span className="text-slate-500 ml-2">
                    (Planilla Eléctrica CUEN: <code className="font-mono text-slate-700">{enrollment.planillaContrato}</code>)
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-500">Distrito Educativo:</span>{' '}
                <strong>{enrollment.district}</strong>
              </div>
              <div>
                <span className="text-slate-500">Circuito Territorial:</span>{' '}
                <strong>{enrollment.circuit}</strong>
              </div>
            </div>
          </div>

          {/* Validation Notice */}
          <div className="text-xs text-slate-500 font-sans space-y-1 mb-12">
            <p>• La presente matrícula es gratuita y garantiza el derecho a la educación pública de calidad y calidez.</p>
            <p>• Todo requerimiento de rectificación o actualización de datos personales se tramita bajo los términos de la Ley Orgánica de Protección de Datos Personales (MOGAC, SLA 15 días).</p>
          </div>

          {/* Signatures & QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-6 pt-6 border-t border-slate-300 font-sans">
            <div className="text-center">
              <div className="border-b border-slate-400 w-44 mx-auto mb-2"></div>
              <p className="text-xs font-bold text-slate-800">{enrollment.reviewedByName || 'Secretaría General'}</p>
              <p className="text-[10px] text-slate-500">Secretaría General Institucional</p>
            </div>

            <div className="text-center">
              <div className="border-b border-slate-400 w-44 mx-auto mb-2"></div>
              <p className="text-xs font-bold text-slate-800">{(institution as any)?.rectorName || 'Rectorado Institucional'}</p>
              <p className="text-[10px] text-slate-500">Máxima Autoridad</p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              {/* QR Mock code */}
              <div className="w-16 h-16 bg-slate-900 flex items-center justify-center p-1 rounded-sm text-white text-[8px] text-center font-mono">
                QR VERIFY<br />{certCode.substring(0, 10)}
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1 text-center">
                Autenticación Digital MinEduc
              </span>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 font-sans">
            Emitido en Quito D.M., a {enrollmentDate} • Sistema de Gestión Escolar Amauta
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalEnrollmentCertificate;
