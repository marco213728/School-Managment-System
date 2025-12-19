
import React from 'react';
import { PeiProfile, Institution, PeiStatus } from '../../types';

interface PrintableAuditVerdictProps {
    pei: PeiProfile;
    institution: Institution;
}

const PrintableAuditVerdict: React.FC<PrintableAuditVerdictProps> = ({ pei, institution }) => {
    const date = new Date().toLocaleDateString();

    const StatusBadge = ({ status }: { status: PeiStatus }) => (
        <span className={`px-4 py-1 border-2 font-black rounded-lg uppercase ${status === PeiStatus.Approved ? 'border-green-600 text-green-700 bg-green-50' : 'border-amber-600 text-amber-700 bg-amber-50'}`}>
            {status}
        </span>
    );

    return (
        <div className="bg-white p-12 font-serif text-gray-900 max-w-[21cm] mx-auto min-h-[29.7cm] flex flex-col shadow-inner">
            <header className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
                <div className="w-2/3">
                    <h1 className="text-2xl font-black uppercase leading-tight">DIctamen de Auditoría Técnica</h1>
                    <p className="text-sm font-bold text-gray-600 mt-2">Plataforma de Gestión Escolar AMAUTA - Dirección Nacional de Estándares</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-400">REGISTRO: {pei.id.toUpperCase()}</p>
                    <p className="text-xs font-bold text-gray-400">FECHA: {date}</p>
                </div>
            </header>

            <main className="flex-grow space-y-8">
                {/* Institutional Context */}
                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">1. Datos de la Institución Educativa</h2>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                        <p><strong>Institución:</strong> {institution.name}</p>
                        <p><strong>AMIE:</strong> {institution.codeAMIE || 'N/A'}</p>
                        <p><strong>Periodo PEI:</strong> {pei.academicPeriod}</p>
                        <p><strong>Estado Actual:</strong> <StatusBadge status={pei.status} /></p>
                    </div>
                </section>

                {/* Technical Review per Phase */}
                <section>
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 border-b pb-2">2. Resultados de la Evaluación por Fase</h2>
                    <div className="space-y-6">
                        {[
                            { title: 'Fase 1: Identidad Institucional', feedback: pei.auditData?.phaseFeedback.identity },
                            { title: 'Fase 2: Diagnóstico Situacional (FODA)', feedback: pei.auditData?.phaseFeedback.diagnostic },
                            { title: 'Fase 3: Planificación Estratégica (Metas)', feedback: pei.auditData?.phaseFeedback.planning },
                            { title: 'Fase 4: Planes de Mejora Operativos', feedback: pei.auditData?.phaseFeedback.improvement }
                        ].map((phase, idx) => (
                            <div key={idx} className="border-l-4 border-slate-200 pl-4 py-1">
                                <h4 className="font-bold text-sm text-slate-800">{phase.title}</h4>
                                <div className="mt-2 p-3 bg-slate-50 rounded-xl text-sm italic text-slate-700 min-h-[60px]">
                                    {phase.feedback || 'Sin observaciones específicas. Cumple con los lineamientos técnicos requeridos.'}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final Verdict */}
                <section className="border-t-2 pt-6">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">3. Conclusiones Generales</h2>
                    <div className="p-4 border-2 border-slate-900 rounded-2xl bg-white text-sm leading-relaxed">
                        {pei.auditData?.generalComments || `Tras la revisión exhaustiva de los medios de verificación y la planificación presentada, la Dirección de Estándares emite un dictamen de ${pei.status.toUpperCase()}. La institución debe proceder conforme al protocolo establecido en la plataforma.`}
                    </div>
                </section>
            </main>

            <footer className="mt-20 pt-8 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-12 text-center text-xs">
                    <div>
                        <div className="border-b border-slate-400 h-16 mb-2"></div>
                        <p className="font-black uppercase">Auditor de Estándares</p>
                        <p>Ministerio de Educación / AMAUTA</p>
                    </div>
                    <div>
                        <div className="border-b border-slate-400 h-16 mb-2"></div>
                        <p className="font-black uppercase">Rectoría / Dirección</p>
                        <p>{institution.name}</p>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-12 text-center">Este dictamen ha sido generado y validado mediante firma electrónica en la plataforma Amauta.</p>
            </footer>
        </div>
    );
};

export default PrintableAuditVerdict;
