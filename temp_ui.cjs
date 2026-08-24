const fs = require('fs');
let content = fs.readFileSync('components/inspection/InspectorSustituciones.tsx', 'utf8');

const uiReplacement = `        {/* Panel Izquierdo: Ausencias Pendientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 🚨 Ausencias Pendientes
              </h2>
              <button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                  + Reportar Ausencia
              </button>
          </div>`;

content = content.replace(/        \{\/\* Panel Izquierdo: Ausencias Pendientes \*\/}[\s\S]*?<h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">\s*🚨 Ausencias Pendientes\s*<\/h2>/, uiReplacement);

const formReplacement = `    </div>

    {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Reportar Nueva Ausencia</h3>
                    <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleAddAbsence} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Docente Ausente</label>
                            <select 
                                required
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={formData.docenteTitularId}
                                onChange={e => setFormData({...formData, docenteTitularId: e.target.value})}
                            >
                                <option value="">Seleccione un docente...</option>
                                {users.filter(u => u.institutionId === currentUser?.institutionId && u.role === Role.Teacher).map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                <input type="date" required className="w-full p-2 border border-gray-300 rounded-md" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value, diaSemana: new Date(e.target.value).getDay()})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo (Bloque)</label>
                                <input type="number" min="1" max="10" required className="w-full p-2 border border-gray-300 rounded-md" value={formData.periodo} onChange={e => setFormData({...formData, periodo: parseInt(e.target.value)})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clase/Paralelo</label>
                                <select required className="w-full p-2 border border-gray-300 rounded-md" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}>
                                    <option value="">Seleccione...</option>
                                    {classes.filter(c => c.institutionId === currentUser?.institutionId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
                                <select required className="w-full p-2 border border-gray-300 rounded-md" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
                                    <option value="">Seleccione...</option>
                                    {subjects.filter(s => s.institutionId === currentUser?.institutionId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones / Tareas para el curso</label>
                            <textarea required className="w-full p-2 border border-gray-300 rounded-md" rows={3} value={formData.instrucciones} onChange={e => setFormData({...formData, instrucciones: e.target.value})} placeholder="Ej: Resolver páginas 45 y 46 del libro..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Planificación / Material (Opcional)</label>
                            <input type="url" className="w-full p-2 border border-gray-300 rounded-md" value={formData.planificacionUrl} onChange={e => setFormData({...formData, planificacionUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Guardar Ausencia</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )}
  );
};`;

content = content.replace(/    <\/div>\n  \);\n\};/, formReplacement);

fs.writeFileSync('components/inspection/InspectorSustituciones.tsx', content);
