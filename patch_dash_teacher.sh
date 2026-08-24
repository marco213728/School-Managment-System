cat << 'INNER_EOF' > temp_teach.cjs
const fs = require('fs');
let content = fs.readFileSync('pages/DashboardPage.tsx', 'utf8');

const replacement = `    if (!teacherData) return <p>Cargando horario...</p>;
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <ScheduleView
                    title="Mi Horario Semanal"
                    scheduleEntries={teacherData.teacherScheduleEntries}
                    timeSlots={teacherData.relevantTimeSlots}
                    subjects={subjects}
                    classes={classes}
                    rooms={rooms}
                    users={users}
                    viewType="teacher"
                />
                
                {/* Substitution / Absence Management for Teachers */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Mis Ausencias Reportadas</h3>
                    </div>
                    {absenceRequests && absenceRequests.filter(r => r.docenteTitularId === currentUser?.id).length > 0 ? (
                        <div className="space-y-3">
                            {absenceRequests.filter(r => r.docenteTitularId === currentUser?.id).map(r => {
                                const cls = classes.find(c => c.id === r.classId);
                                const sub = subjects.find(s => s.id === r.subjectId);
                                return (
                                    <div key={r.id} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-sm text-gray-800">{r.fecha} - Bloque {r.periodo}</p>
                                            <p className="text-xs text-gray-500">{sub?.name} en {cls?.name}</p>
                                            {r.estado === 'Pendiente' && <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded">Pendiente de Aprobación</span>}
                                            {r.estado === 'Aprobado' && <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded">Aprobado / Reasignado</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No tienes ausencias reportadas.</p>
                    )}
                </div>
            </div>`;

content = content.replace(/    if \(\!teacherData\) return <p>Cargando horario\.\.\.<\/p>;\n    \n    return \(\n        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">\n            <div className="lg:col-span-2 space-y-6">\n                <ScheduleView\n                    title="Mi Horario Semanal"\n                    scheduleEntries=\{teacherData\.teacherScheduleEntries\}\n                    timeSlots=\{teacherData\.relevantTimeSlots\}\n                    subjects=\{subjects\}\n                    classes=\{classes\}\n                    rooms=\{rooms\}\n                    users=\{users\}\n                    viewType="teacher"\n                \/>\n            <\/div>/, replacement);

fs.writeFileSync('pages/DashboardPage.tsx', content);
INNER_EOF
node temp_teach.cjs
