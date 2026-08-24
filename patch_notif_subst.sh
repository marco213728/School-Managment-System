cat << 'INNER_EOF' > temp_notif.cjs
const fs = require('fs');
let content = fs.readFileSync('components/inspection/InspectorSustituciones.tsx', 'utf8');

const replacement = `      onUpdateAbsenceRequests(updatedRequests);
      
      const teacherTitular = users.find(u => u.id === ausenciaSeleccionada.docenteTitularId);
      setMensajeExito(\`¡Reasignación Exitosa! Se ha enviado una Notificación Push al dispositivo del docente reemplazante y a \${teacherTitular?.name || 'Titular'}. Se ha registrado el log de asistencia para Talento Humano.\`);`;

content = content.replace(/      onUpdateAbsenceRequests\(updatedRequests\);\n      \n      setMensajeExito\(\`¡Reasignación Exitosa! Se ha enviado una Notificación Push al dispositivo del docente reemplazante y se ha registrado el log de asistencia para Talento Humano.\`\);/, replacement);

fs.writeFileSync('components/inspection/InspectorSustituciones.tsx', content);
INNER_EOF
node temp_notif.cjs
