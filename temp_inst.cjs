const fs = require('fs');
let content = fs.readFileSync('components/inspection/InspectorSustituciones.tsx', 'utf8');

const UI = `                <div className="flex justify-between items-start mb-2">
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
                )}`;

content = content.replace(/                <div className="flex justify-between items-start mb-2">\n[\s\S]*?✓ Planificación de Contingencia Adjunta\n                  <\/span>\n                \)\}/, UI);

fs.writeFileSync('components/inspection/InspectorSustituciones.tsx', content);
