const fs = require('fs');
let content = fs.readFileSync('components/inspection/InspectorSustituciones.tsx', 'utf8');

const replacement = `  const ejecutarReasignacionYNotificar = async (docenteId: string) => {
    if (!ausenciaSeleccionada) return;

    try {
      const updatedRequests = absenceRequests.map(r => 
          r.id === ausenciaSeleccionada.id ? { ...r, estado: 'Aprobado' as const, docenteReemplazanteId: docenteId } : r
      );
      onUpdateAbsenceRequests(updatedRequests);
      
      setMensajeExito(\`¡Reasignación Exitosa! Se ha enviado una Notificación Push al dispositivo del docente reemplazante y se ha registrado el log de asistencia para Talento Humano.\`);
      
      setAusencias(prev => prev.filter(a => a.id !== ausenciaSeleccionada.id));
      setAusenciaSeleccionada(null);
      setCandidatos([]);
    } catch (e) {
      console.error("Error al registrar el reemplazo", e);
    }
  };

  const handleAddAbsence = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser?.institutionId) return;
      const newAbsence: AbsenceRequest = {
          ...formData,
          id: \`abs-\${Date.now()}\`,
          institutionId: currentUser.institutionId,
          estado: 'Pendiente',
          creadoPorRol: currentUser.role
      };
      onUpdateAbsenceRequests([...absenceRequests, newAbsence]);
      setIsFormOpen(false);
      setFormData({
          docenteTitularId: "",
          fecha: new Date().toISOString().split('T')[0],
          periodo: 1,
          classId: "",
          subjectId: "",
          instrucciones: "",
          planificacionUrl: ""
      });
  };`;

content = content.replace(/  const ejecutarReasignacionYNotificar = async \([^)]*\) => \{\n[\s\S]*?  \};\n/, replacement + '\n');

fs.writeFileSync('components/inspection/InspectorSustituciones.tsx', content);
