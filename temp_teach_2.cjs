const fs = require('fs');
let content = fs.readFileSync('pages/DashboardPage.tsx', 'utf8');

const replacement = `                {/* Substitution / Absence Management for Teachers */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Mis Ausencias Reportadas</h3>
                        <button 
                            onClick={() => {
                                const formEl = document.getElementById('report-absence-form');
                                if (formEl) {
                                    formEl.classList.toggle('hidden');
                                }
                            }}
                            className="bg-primary-50 text-primary-600 hover:bg-primary-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                            + Reportar Ausencia
                        </button>
                    </div>
                    
                    <div id="report-absence-form" className="hidden mb-6 p-4 border border-primary-200 bg-primary-50 rounded-lg">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!currentUser?.institutionId || !onUpdateAbsenceRequests) return;
                            const target = e.target as HTMLFormElement;
                            const newAbsence = {
                                id: \`abs-\${Date.now()}\`,
                                institutionId: currentUser.institutionId,
                                docenteTitularId: currentUser.id,
                                fecha: (target.elements.namedItem('fecha') as HTMLInputElement).value,
                                diaSemana: new Date((target.elements.namedItem('fecha') as HTMLInputElement).value).getDay(),
                                periodo: parseInt((target.elements.namedItem('periodo') as HTMLInputElement).value),
                                classId: (target.elements.namedItem('classId') as HTMLSelectElement).value,
                                subjectId: (target.elements.namedItem('subjectId') as HTMLSelectElement).value,
                                instrucciones: (target.elements.namedItem('instrucciones') as HTMLTextAreaElement).value,
                                planificacionUrl: (target.elements.namedItem('planificacionUrl') as HTMLInputElement).value,
                                estado: 'Pendiente',
                                creadoPorRol: currentUser.role
                            };
                            onUpdateAbsenceRequests([...(absenceRequests || []), newAbsence]);
                            target.reset();
                            target.parentElement?.classList.add('hidden');
                        }} className="space-y-4">
                            <h4 className="font-semibold text-sm text-primary-800 mb-2">Nueva Notificación de Ausencia</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                                    <input type="date" name="fecha" required className="w-full p-2 text-sm border border-gray-300 rounded-md" defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Periodo (Bloque)</label>
                                    <input type="number" name="periodo" min="1" max="10" required className="w-full p-2 text-sm border border-gray-300 rounded-md" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Clase/Paralelo</label>
                                    <select name="classId" required className="w-full p-2 text-sm border border-gray-300 rounded-md">
                                        <option value="">Seleccione...</option>
                                        {classes.filter(c => c.institutionId === currentUser?.institutionId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Asignatura</label>
                                    <select name="subjectId" required className="w-full p-2 text-sm border border-gray-300 rounded-md">
                                        <option value="">Seleccione...</option>
                                        {subjects.filter(s => s.institutionId === currentUser?.institutionId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Instrucciones para el Reemplazo / Tareas</label>
                                <textarea name="instrucciones" required className="w-full p-2 text-sm border border-gray-300 rounded-md" rows={2} placeholder="Ej: Resolver páginas 45 y 46 del libro..." />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">URL Material (Opcional)</label>
                                <input type="url" name="planificacionUrl" className="w-full p-2 text-sm border border-gray-300 rounded-md" placeholder="https://drive.google.com/..." />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={(e) => (e.target as HTMLElement).closest('#report-absence-form')?.classList.add('hidden')} className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-white">Cancelar</button>
                                <button type="submit" className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700">Enviar a Inspección</button>
                            </div>
                        </form>
                    </div>

                    {absenceRequests && absenceRequests.filter(r => r.docenteTitularId === currentUser?.id).length > 0 ? (
                        <div className="space-y-3">
                            {absenceRequests.filter(r => r.docenteTitularId === currentUser?.id).map(r => {
                                const cls = classes.find(c => c.id === r.classId);
                                const sub = subjects.find(s => s.id === r.subjectId);
                                return (
                                    <div key={r.id} className="p-3 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-3">
                                        <div>
                                            <p className="font-semibold text-sm text-gray-800">{r.fecha} - Bloque {r.periodo}</p>
                                            <p className="text-xs text-gray-500">{sub?.name} en {cls?.name}</p>
                                            {r.estado === 'Pendiente' && <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded">Pendiente de Aprobación</span>}
                                            {r.estado === 'Aprobado' && <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded">Aprobado / Reasignado</span>}
                                        </div>
                                        <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 w-full md:w-auto md:max-w-xs truncate">
                                            <span className="font-medium">Instrucciones:</span> {r.instrucciones}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No tienes ausencias reportadas.</p>
                    )}
                </div>`;

content = content.replace(/                \{\/\* Substitution \/ Absence Management for Teachers \*\/\}[\s\S]*?No tienes ausencias reportadas\.\<\/p>\n                    \)\}\n                \<\/div>/, replacement);

fs.writeFileSync('pages/DashboardPage.tsx', content);
