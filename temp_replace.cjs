const fs = require('fs');
let content = fs.readFileSync('components/inspection/InspectorSustituciones.tsx', 'utf8');

const replacement = `
  useEffect(() => {
    if (institution) {
        const pendingRequests = absenceRequests.filter(r => r.institutionId === institution.id && r.estado === 'Pendiente');
        const mapped = pendingRequests.map(r => {
            const teacher = users.find(u => u.id === r.docenteTitularId);
            const cls = classes.find(c => c.id === r.classId);
            const sub = subjects.find(s => s.id === r.subjectId);
            return {
                id: r.id,
                docenteTitular: teacher?.name || 'Desconocido',
                fecha: r.fecha,
                periodo: r.periodo,
                diaSemana: r.diaSemana,
                asignaturaNombre: sub?.name || 'Desconocida',
                especialidadRequerida: sub?.name || 'General',
                paraleloNombre: cls?.name || 'Desconocido',
                aulaNombre: 'Asignada',
                planificacionUrl: r.planificacionUrl
            };
        });
        setAusencias(mapped);
    }
  }, [institution, absenceRequests, users, classes, subjects]);
`;

content = content.replace(/useEffect\(\(\) => \{\n    if \(institution\) \{\n        setAusencias\(\[\n[\s\S]*?\]\);\n    \}\n  \}, \[institution\]\);/, replacement);

fs.writeFileSync('components/inspection/InspectorSustituciones.tsx', content);
