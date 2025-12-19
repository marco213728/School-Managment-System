
import React from 'react';
import { PeiProfile, Institution } from '../../types';
// FIX: Added missing import for CheckCircleIcon.
import { CheckCircleIcon } from '../icons/Icons';

interface PrintablePeiDocumentProps {
    pei: PeiProfile;
    institution: Institution;
}

const PrintablePeiDocument: React.FC<PrintablePeiDocumentProps> = ({ pei, institution }) => {
    return (
        <div className="bg-white p-12 font-serif text-gray-900 max-w-[21cm] mx-auto space-y-12 shadow-inner">
            {/* PORTADA */}
            <section className="h-[26cm] flex flex-col justify-between text-center border-8 border-double border-slate-900 p-8">
                <div className="flex flex-col items-center">
                    <img src={institution.logoUrl} alt="Logo" className="h-40 w-40 object-contain mb-8" />
                    <h1 className="text-4xl font-black uppercase tracking-widest">{institution.name}</h1>
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-6xl font-black text-indigo-900 leading-tight">PEI</h2>
                    <h3 className="text-2xl font-bold uppercase tracking-widest text-slate-700">Proyecto Educativo Institucional</h3>
                    <p className="text-xl font-bold text-slate-500">Periodo de Vigencia: {pei.academicPeriod}</p>
                </div>

                <div className="space-y-2 text-sm font-bold uppercase text-slate-400">
                    <p>Quito, Ecuador</p>
                    <p>{new Date().getFullYear()}</p>
                </div>
            </section>

            {/* FASE 1: IDENTIDAD */}
            <section className="break-before-page space-y-8">
                <h2 className="text-3xl font-black border-b-4 border-indigo-600 pb-2">1. IDENTIDAD INSTITUCIONAL</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-indigo-700 mb-2">Misión</h3>
                        <p className="text-lg italic leading-relaxed text-justify px-8 border-l-4 border-indigo-100 bg-indigo-50/30 py-4">"{pei.identity.mission}"</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-indigo-700 mb-2">Visión</h3>
                        <p className="text-lg italic leading-relaxed text-justify px-8 border-l-4 border-indigo-100 bg-indigo-50/30 py-4">"{pei.identity.vision}"</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-indigo-700 mb-2">Ideario y Valores</h3>
                        <p className="text-base text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">{pei.identity.ideario}</p>
                    </div>
                </div>
            </section>

            {/* FASE 2: FODA */}
            <section className="break-before-page space-y-8">
                <h2 className="text-3xl font-black border-b-4 border-indigo-600 pb-2">2. DIAGNÓSTICO ESTRATÉGICO (FODA)</h2>
                {pei.diagnostics.map(diag => (
                    <div key={diag.dimension} className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 uppercase bg-slate-100 p-2 rounded">{diag.dimension}</h3>
                        <table className="w-full border-collapse border-2 border-slate-900 text-sm">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="border border-white p-2 w-1/2">FACTORES INTERNOS</th>
                                    <th className="border border-white p-2 w-1/2">FACTORES EXTERNOS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-slate-900 p-4 align-top">
                                        <p className="font-black text-green-700 mb-2">FORTALEZAS:</p>
                                        <ul className="list-disc pl-5 space-y-1">{diag.entries.filter(e => e.type === 'Fortaleza').map(e => <li key={e.id}>{e.description}</li>)}</ul>
                                        <p className="font-black text-red-700 mt-4 mb-2">DEBILIDADES:</p>
                                        <ul className="list-disc pl-5 space-y-1">{diag.entries.filter(e => e.type === 'Debilidad').map(e => <li key={e.id}>{e.description}</li>)}</ul>
                                    </td>
                                    <td className="border border-slate-900 p-4 align-top">
                                        <p className="font-black text-blue-700 mb-2">OPORTUNIDADES:</p>
                                        <ul className="list-disc pl-5 space-y-1">{diag.entries.filter(e => e.type === 'Oportunidad').map(e => <li key={e.id}>{e.description}</li>)}</ul>
                                        <p className="font-black text-orange-700 mt-4 mb-2">AMENAZAS:</p>
                                        <ul className="list-disc pl-5 space-y-1">{diag.entries.filter(e => e.type === 'Amenaza').map(e => <li key={e.id}>{e.description}</li>)}</ul>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
            </section>

            {/* FASE 3: PLANIFICACIÓN */}
            <section className="break-before-page space-y-8">
                <h2 className="text-3xl font-black border-b-4 border-indigo-600 pb-2">3. PLANIFICACIÓN ESTRATÉGICA (METAS)</h2>
                {pei.strategicObjectives.map(so => (
                    <div key={so.dimension} className="space-y-4">
                        <h3 className="text-lg font-bold text-indigo-700 uppercase">{so.dimension}</h3>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <p className="font-bold">Objetivo Estratégico:</p>
                            <p className="text-lg italic">"{so.objective}"</p>
                        </div>
                        <table className="w-full border-collapse border border-slate-300 text-xs">
                            <thead>
                                <tr className="bg-slate-200">
                                    <th className="border border-slate-300 p-2 text-left">META ESTRATÉGICA</th>
                                    <th className="border border-slate-300 p-2 text-left">INDICADOR DE GESTIÓN</th>
                                    <th className="border border-slate-300 p-2 text-center">VALOR META</th>
                                </tr>
                            </thead>
                            <tbody>
                                {so.goals.map(goal => (
                                    <tr key={goal.id}>
                                        <td className="border border-slate-300 p-2">{goal.description}</td>
                                        <td className="border border-slate-300 p-2">{goal.indicator}</td>
                                        <td className="border border-slate-300 p-2 text-center font-bold">{goal.meta}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </section>

            {/* FASE 4: PLANES DE MEJORA */}
            <section className="break-before-page space-y-8">
                <h2 className="text-3xl font-black border-b-4 border-indigo-600 pb-2">4. PLANES DE MEJORA OPERATIVOS</h2>
                {pei.improvementPlans.map(plan => (
                    <div key={plan.id} className="p-6 border-2 border-slate-200 rounded-2xl bg-slate-50 space-y-4">
                        <h3 className="text-xl font-black text-slate-800 uppercase">{plan.title}</h3>
                        <p className="text-sm"><strong>Problema Priorizado:</strong> {plan.problem}</p>
                        <p className="text-sm"><strong>Objetivo Anual:</strong> {plan.objective}</p>
                        <div className="grid grid-cols-3 gap-4 py-2 border-t border-b border-slate-200">
                            <div className="text-center"><p className="text-[10px] uppercase font-bold text-gray-400">Meta</p><p className="font-bold text-blue-700">{plan.goal}</p></div>
                            <div className="text-center"><p className="text-[10px] uppercase font-bold text-gray-400">Plazo</p><p className="font-bold text-gray-700">{plan.deadline}</p></div>
                            <div className="text-center"><p className="text-[10px] uppercase font-bold text-gray-400">Estado</p><p className="font-bold text-gray-700">{plan.status}</p></div>
                        </div>
                    </div>
                ))}
            </section>

            {/* ANEXOS: ACTAS */}
            <section className="break-before-page space-y-8">
                <h2 className="text-3xl font-black border-b-4 border-indigo-600 pb-2">ANEXO: ACTAS DE SOCIALIZACIÓN</h2>
                <div className="space-y-8">
                    {pei.approvalData?.actas.map(acta => (
                        <div key={acta.id} className="p-8 border rounded-3xl bg-gray-50/50">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-xl font-bold uppercase">Acta de {acta.type}</h4>
                                <p className="text-sm font-bold text-gray-400">{new Date(acta.meetingDate).toLocaleDateString()}</p>
                            </div>
                            <p className="text-base text-justify leading-relaxed whitespace-pre-wrap mb-6">{acta.summary}</p>
                            <div>
                                <p className="text-xs font-black uppercase text-gray-400 mb-2">Comunidad Participante:</p>
                                <p className="text-sm text-gray-600">{acta.participants.join(', ')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* VALIDACIÓN FINAL */}
            <footer className="break-before-page h-[26cm] flex flex-col justify-center items-center text-center space-y-12">
                <div className="w-32 h-32 border-8 border-double border-emerald-600 rounded-full flex items-center justify-center text-emerald-600 mb-8">
                    <CheckCircleIcon className="h-20 w-20" />
                </div>
                <h2 className="text-4xl font-black text-emerald-800 uppercase tracking-tighter">CERTIFICACIÓN DE RATIFICACIÓN</h2>
                <p className="text-xl max-w-2xl text-slate-600 leading-relaxed">
                    El presente Proyecto Educativo Institucional ha sido ratificado internamente y registrado ante la autoridad distrital competente, otorgando plena validez a la planificación estratégica aquí descrita por un periodo de cinco años.
                </p>
                <div className="grid grid-cols-2 gap-32 mt-24">
                    <div className="border-t-2 border-slate-900 w-64 pt-2 font-bold uppercase">Rectoría / Dirección</div>
                    <div className="border-t-2 border-slate-900 w-64 pt-2 font-bold uppercase">Secretaría General</div>
                </div>
                <p className="text-xs text-gray-400 mt-20 italic">Documento generado por Amauta para {institution.name} • AMIE: {institution.codeAMIE}</p>
            </footer>
        </div>
    );
};

export default PrintablePeiDocument;
