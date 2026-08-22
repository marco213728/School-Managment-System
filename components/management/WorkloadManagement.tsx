import React, { useState } from 'react';
import { User, Class, Room, Subject, ScheduleEntry, Role } from '../../types';
import { CargasDocentes } from './CargasDocentes';
import { SparklesIcon } from '../icons/Icons';
import { GETHBalanceCard } from './GETHBalanceCard';
import { DistributivoDocenteGETH } from '../../types/amauta_geth';

interface WorkloadManagementProps {
  users: User[];
  classes: Class[];
  rooms: Room[];
  subjects: Subject[];
  schedule: ScheduleEntry[];
  onBack: () => void;
}

export const WorkloadManagement: React.FC<WorkloadManagementProps> = ({ users, classes, rooms, subjects, schedule, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const teachers = users.filter(u => u.role === Role.Teacher).map(u => {
    // Calculate current assigned hours based on schedule entries for this teacher's subjects
    const teacherSubjects = subjects.filter(s => s.teacherId === u.id);
    const assignedHours = schedule.filter(entry => 
      teacherSubjects.some(s => s.id === entry.subjectId)
    ).length;

    return {
      id: u.id,
      nombre: u.name,
      cedula: u.id.substring(0, 10),
      especialidad: teacherSubjects.length > 0 ? teacherSubjects[0].areaOfKnowledge : 'General',
      relacionLaboral: 'definitivo' as const,
      funcion: 'docente' as const,
      esPeriodoLactancia: u.esPeriodoLactancia || false,
      tieneLimitacionMovilidad: u.tieneLimitacionMovilidad || false,
      horasAsignadas: assignedHours,
      horasMaximas: u.horasMaximas || (u.esPeriodoLactancia ? 20 : 25)
    };
  });

  const gethTeachers: DistributivoDocenteGETH[] = teachers.map((t, index) => ({
    idDocente: t.id,
    nombre: t.nombre,
    enPeriodoLactancia: t.esPeriodoLactancia,
    horasClaseDirecta: t.horasAsignadas || (22 - (index % 3)), // Mock logic if hours not fully assigned
    horasTutoriaAcompanamiento: 6,
    horasAtencionPadres: 2 + (index % 2)
  }));


  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage('');
    
    try {
      const payload = {
        docentes: teachers,
        paralelos: classes.map(c => ({
          id: c.id,
          gradoCurso: c.name,
          letra: 'A',
          nivel: 'basica',
          jornada: 'matutina',
          numEstudiantes: 30
        })),
        aulas: rooms.map(r => ({
          id: r.id,
          nombre: r.name,
          capacidad: r.capacidad || 40,
          esLaboratorio: r.esLaboratorio || false,
          piso: r.piso || 1,
          tieneAscensor: r.tieneAscensor || false,
          tieneRampaAcceso: r.tieneRampaAcceso || true
        })),
        asignaturas: subjects.map(s => ({
          id: s.id,
          nombre: s.name,
          nivel: 'basica',
          horasSemanales: s.maxWeeklyHours || 5,
          especialidadRequerida: s.areaOfKnowledge
        }))
      };

      const res = await fetch('/api/v1/horarios/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      setMessage(data.message || 'Generación iniciada.');
    } catch (error) {
      console.error(error);
      setMessage('Error al conectar con el motor de generación.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline">
          &larr; Volver
        </button>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
        >
          <SparklesIcon className="h-5 w-5" />
          {isGenerating ? 'Iniciando GA...' : 'Generar Horarios (Algoritmo Genético)'}
        </button>
      </div>

      {message && (
        <div className="p-4 bg-green-50 text-green-800 border-l-4 border-green-500 rounded">
          {message}
        </div>
      )}

      <CargasDocentes 
        docentes={teachers} 
        onSeleccionarDocente={(docente) => console.log('Seleccionado:', docente.nombre)} 
      />

      <div className="mt-8 border-t pt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Control de Permanencia Presencial (GETH)</h3>
        <p className="text-sm text-gray-600 mb-6">Monitoreo de horas no pedagógicas y jornada laboral (LOEI / Decreto 277).</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {gethTeachers.map(gt => (
            <GETHBalanceCard key={gt.idDocente} docente={gt} />
          ))}
        </div>
      </div>
    </div>
  );
};
