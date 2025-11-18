import React, { useState, useMemo, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
// FIX: Import GradeEntry to resolve type error.
import { Gradebook, StudentGradebook, Class, Subject, Student, User, Role, TrimesterRecord, ScheduleEntry, Activity, GradeEntry } from '../types';

interface GradebookPageProps {
    gradebooks: Gradebook[];
    onUpdateGradebooks: (gradebooks: Gradebook[]) => void;
    classes: Class[];
    subjects: Subject[];
    students: Student[];
    users: User[];
    schedule: ScheduleEntry[];
    activities: Activity[];
}

const GradebookPage: React.FC<GradebookPageProps> = ({ gradebooks, onUpdateGradebooks, classes, subjects, students, users, schedule, activities }) => {
    const { user: currentUser } = useContext(UserContext);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [localGradebook, setLocalGradebook] = useState<Gradebook | null>(null);
    
    const activityMap = useMemo(() => new Map(activities.map(a => [a.id, a.title])), [activities]);

    const scheduleForSubject = (subjectId: string): ScheduleEntry[] => {
        return schedule.filter(entry => entry.subjectId === subjectId);
    }

    const teacherClasses = useMemo(() => {
        const taughtClassIds = new Set(subjects.filter(s => s.teacherId === currentUser?.id).flatMap(s =>
            classes.filter(c => scheduleForSubject(s.id).some(sc => sc.classId === c.id)).map(c => c.id)
        ));
        return classes.filter(c => c.institutionId === currentUser?.institutionId && taughtClassIds.has(c.id));
    }, [classes, subjects, currentUser, schedule]);

    const teacherSubjects = useMemo(() => {
        return subjects.filter(s => s.teacherId === currentUser?.id);
    }, [subjects, currentUser]);

    useEffect(() => {
        if (selectedClassId && selectedSubjectId) {
            const gb = gradebooks.find(g => g.classId === selectedClassId && g.subjectId === selectedSubjectId);
            setLocalGradebook(gb ? JSON.parse(JSON.stringify(gb)) : null);
        } else {
            setLocalGradebook(null);
        }
    }, [selectedClassId, selectedSubjectId, gradebooks]);

    const studentsForGradebook = useMemo(() => {
        if (!localGradebook) return [];
        return students
            .filter(s => localGradebook.records.some(r => r.studentId === s.id))
            .sort((a,b) => (a.listNumber || 0) - (b.listNumber || 0) || a.name.localeCompare(b.name));
    }, [localGradebook, students]);
    
    // FIX: Add 'examenSupletorio' to the type union for the 'type' parameter to allow its use.
    const handleGradeChange = (studentId: string, trimesterKey: 'trimester1' | 'trimester2' | 'trimester3', type: 'actividad' | 'portafolio' | 'evaluacionSumativa' | 'proyectoIntegrador' | 'proyectoFinal10' | 'examenSupletorio', value: string, activityIndex?: number, field?: 'nota' | 'mejora' | 'refuerzo' | 'examenSupletorio') => {
        setLocalGradebook(prevGb => {
            if (!prevGb) return null;
            
            const updatedRecords = prevGb.records.map(rec => {
                if (rec.studentId !== studentId) return rec;

                const newRec = JSON.parse(JSON.stringify(rec));
                const numValue = value === '' ? undefined : parseFloat(value);
                
                if (type === 'actividad' && activityIndex !== undefined && field) {
                    newRec[trimesterKey].actividades[activityIndex][field] = numValue;
                } else if (type === 'portafolio' || type === 'evaluacionSumativa' || type === 'proyectoIntegrador') {
                     newRec[trimesterKey][type][field!] = numValue;
                } else if (type === 'proyectoFinal10') {
                    newRec.proyectoFinal10[field!] = numValue;
                } else if (type === 'examenSupletorio') {
                     newRec.examenSupletorio = numValue;
                }

                return calculateAll(newRec);
            });

            return { ...prevGb, records: updatedRecords };
        });
    };

    const calculateAll = (record: StudentGradebook): StudentGradebook => {
        const trimesters: ('trimester1' | 'trimester2' | 'trimester3')[] = ['trimester1', 'trimester2', 'trimester3'];
        let mejorasCount = 0;
        
        trimesters.forEach(trimKey => {
            const trimester = record[trimKey];
            const allEntries = [...trimester.actividades, trimester.portafolio, trimester.evaluacionSumativa, trimester.proyectoIntegrador];
            
            allEntries.forEach(entry => {
                entry.promedio = entry.refuerzo ?? entry.mejora ?? entry.nota ?? 0;
                if (entry.mejora !== undefined) mejorasCount++;
            });
            
            const sumPromedios = trimester.actividades.reduce((sum, act) => sum + act.promedio, 0);
            trimester.promedioFormativas = trimester.actividades.length > 0 ? sumPromedios / trimester.actividades.length : 0;
            
            trimester.sumaTrimestre = 
                (trimester.promedioFormativas * 0.45) +
                (trimester.portafolio.promedio * 0.05) +
                (trimester.evaluacionSumativa.promedio * 0.25) +
                (trimester.proyectoIntegrador.promedio * 0.25);
        });

        record.mejorasUtilizadas = mejorasCount;

        const totalTrimestre = record.trimester1.sumaTrimestre + record.trimester2.sumaTrimestre + record.trimester3.sumaTrimestre;
        record.promedioTrimestralFinal = (record.trimester1.sumaTrimestre > 0 || record.trimester2.sumaTrimestre > 0 || record.trimester3.sumaTrimestre > 0) ? totalTrimestre / 3 : 0;
        record.notaAnual90 = record.promedioTrimestralFinal * 0.9;

        record.proyectoFinal10.promedio = record.proyectoFinal10.nota ?? 0;
        record.notaFinal100 = record.notaAnual90 + (record.proyectoFinal10.promedio * 0.1);
        
        if (record.notaFinal100 >= 7) {
            record.observacionFinal = 'Aprobado';
            record.notaFinalConSupletorio = undefined;
        } else if (record.examenSupletorio !== undefined && record.examenSupletorio !== null) {
             record.notaFinalConSupletorio = record.examenSupletorio;
             record.observacionFinal = record.examenSupletorio >= 7 ? 'Aprobado' : 'Reprobado';
        } else {
            record.observacionFinal = 'Supletorio';
            record.notaFinalConSupletorio = undefined;
        }

        return record;
    };


    const handleSave = () => {
        if (!localGradebook) return;
        const index = gradebooks.findIndex(gb => gb.id === localGradebook.id);
        let updatedGradebooks;
        if (index > -1) {
             updatedGradebooks = gradebooks.map(gb => gb.id === localGradebook.id ? localGradebook : gb);
        } else {
             updatedGradebooks = [...gradebooks, localGradebook];
        }
        onUpdateGradebooks(updatedGradebooks);
        alert('Registro guardado con éxito.');
    };
    
    const getTitle = (entry: GradeEntry | undefined, defaultTitle: string) => activityMap.get(entry?.activityId || '') || defaultTitle;
    
    const renderHeader = () => (
        <thead className="bg-gray-100 text-[10px] uppercase sticky top-0 z-10">
            <tr>
                <th rowSpan={4} className="sticky left-0 bg-gray-100 z-20 border p-1 w-48">Estudiante</th>
                {([1, 2, 3] as const).map(trim => (
                    <th key={trim} colSpan={24} className="border p-1">TRIMESTRE {trim}</th>
                ))}
                <th colSpan={7} className="border p-1">Cálculos Finales</th>
            </tr>
            <tr>
                {([1, 2, 3] as const).map(trim => (
                    <React.Fragment key={trim}>
                        <th colSpan={20} className="border p-1">Evaluaciones Formativas (45%)</th>
                        <th colSpan={1} className="border p-1" rowSpan={2}><div className="rotate-text">{getTitle(localGradebook?.records[0]?.[`trimester${trim}`]?.portafolio, 'Portafolio')} (5%)</div></th>
                        <th colSpan={1} className="border p-1" rowSpan={2}><div className="rotate-text">{getTitle(localGradebook?.records[0]?.[`trimester${trim}`]?.evaluacionSumativa, 'Eval. Sumativa')} (25%)</div></th>
                        <th colSpan={1} className="border p-1" rowSpan={2}><div className="rotate-text">{getTitle(localGradebook?.records[0]?.[`trimester${trim}`]?.proyectoIntegrador, 'Proyecto')} (25%)</div></th>
                        <th colSpan={1} className="border p-1" rowSpan={3}><div className="rotate-text">Suma Trim.</div></th>
                    </React.Fragment>
                ))}
                 <th rowSpan={3} className="border p-1"><div className="rotate-text">Prom. Trimestral</div></th>
                 <th rowSpan={3} className="border p-1"><div className="rotate-text">Nota Anual (90%)</div></th>
                 <th colSpan={1} rowSpan={2} className="border p-1"><div className="rotate-text">{getTitle(localGradebook?.records[0]?.proyectoFinal10, 'Proyecto Final')} (10%)</div></th>
                 <th rowSpan={3} className="border p-1"><div className="rotate-text">Nota Final (100%)</div></th>
                 <th rowSpan={3} className="border p-1"><div className="rotate-text">Ex. Supletorio</div></th>
                 <th rowSpan={3} className="border p-1"><div className="rotate-text">Nota Final c/ Supl.</div></th>
                 <th rowSpan={3} className="border p-1"><div className="rotate-text">Observación</div></th>
            </tr>
            <tr>
                {([1,2,3] as const).map(trim => (
                    <React.Fragment key={trim}>
                        {[...Array(5).keys()].map(actIdx => <th key={actIdx} colSpan={4} className="border p-1"><div className="truncate w-28">{getTitle(localGradebook?.records[0]?.[`trimester${trim}`]?.actividades[actIdx], `Actividad ${actIdx + 1}`)}</div></th>)}
                    </React.Fragment>
                ))}
            </tr>
            <tr>
                {([1,2,3] as const).map(trim => (
                    <React.Fragment key={trim}>
                        {[...Array(5).keys()].map(act => <React.Fragment key={act}><th className="border p-1">N</th><th className="border p-1">M</th><th className="border p-1">R</th><th className="border p-1">P</th></React.Fragment>)}
                        <th className="border p-1">N</th>
                        <th className="border p-1">N</th>
                        <th className="border p-1">N</th>
                    </React.Fragment>
                ))}
                <th className="border p-1">N</th>
            </tr>
        </thead>
    );
    
    const GradeInput: React.FC<{value?: number, onChange: (val: string) => void}> = ({ value, onChange }) => (
        <td><input type="number" step="0.01" min="0" max="10" value={value ?? ''} onChange={e => onChange(e.target.value)} className="w-12 p-1 text-center border-none focus:ring-1 focus:ring-primary-500 rounded"/></td>
    );

    const renderBody = () => (
        <tbody className="text-xs">
            {studentsForGradebook.map((student) => {
                const record = localGradebook?.records.find(r => r.studentId === student.id);
                if(!record) return null;
                return (
                    <tr key={student.id} className="hover:bg-slate-50">
                        <td className="sticky left-0 bg-white hover:bg-slate-50 border p-1 font-semibold whitespace-nowrap">{student.listNumber}. {student.name}</td>
                        {([record.trimester1, record.trimester2, record.trimester3] as const).map((trim, trimIndex) => {
                          // FIX: Add type assertion to ensure trimesterKey is of the correct literal union type.
                          const trimesterKey = `trimester${trimIndex+1}` as 'trimester1' | 'trimester2' | 'trimester3';
                          return (
                            <React.Fragment key={trimIndex}>
                                {trim.actividades.map((act, actIndex) => (
                                    <React.Fragment key={actIndex}>
                                        <GradeInput value={act.nota} onChange={val => handleGradeChange(student.id, trimesterKey, 'actividad', val, actIndex, 'nota')} />
                                        <GradeInput value={act.mejora} onChange={val => handleGradeChange(student.id, trimesterKey, 'actividad', val, actIndex, 'mejora')} />
                                        <GradeInput value={act.refuerzo} onChange={val => handleGradeChange(student.id, trimesterKey, 'actividad', val, actIndex, 'refuerzo')} />
                                        <td className="font-bold bg-gray-50 text-center">{act.promedio.toFixed(2)}</td>
                                    </React.Fragment>
                                ))}
                                <GradeInput value={trim.portafolio.nota} onChange={val => handleGradeChange(student.id, trimesterKey, 'portafolio', val, undefined, 'nota')} />
                                <GradeInput value={trim.evaluacionSumativa.nota} onChange={val => handleGradeChange(student.id, trimesterKey, 'evaluacionSumativa', val, undefined, 'nota')} />
                                <GradeInput value={trim.proyectoIntegrador.nota} onChange={val => handleGradeChange(student.id, trimesterKey, 'proyectoIntegrador', val, undefined, 'nota')} />
                                <td className="font-bold bg-blue-50 text-center">{trim.sumaTrimestre.toFixed(2)}</td>
                            </React.Fragment>
                        )})}
                         <td className="font-bold bg-green-50 text-center">{record.promedioTrimestralFinal.toFixed(2)}</td>
                         <td className="font-bold bg-green-50 text-center">{record.notaAnual90.toFixed(2)}</td>
                         <GradeInput value={record.proyectoFinal10.nota} onChange={val => handleGradeChange(student.id, 'trimester1', 'proyectoFinal10', val, undefined, 'nota')} />
                         <td className="font-bold bg-green-100 text-center">{record.notaFinal100.toFixed(2)}</td>
                         <GradeInput value={record.examenSupletorio} onChange={val => handleGradeChange(student.id, 'trimester1', 'examenSupletorio', val, undefined, 'examenSupletorio')} />
                         <td className="font-bold bg-yellow-100 text-center">{record.notaFinalConSupletorio?.toFixed(2) || '-'}</td>
                         <td className={`text-center font-semibold text-xs p-1 ${record.observacionFinal === 'Aprobado' ? 'text-green-700' : 'text-red-700'}`}>{record.observacionFinal}</td>
                    </tr>
                );
            })}
        </tbody>
    );


    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Registro Docente de Calificaciones</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full p-2 border rounded-md"><option value="">Seleccionar Clase</option>{teacherClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    <select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} className="w-full p-2 border rounded-md" disabled={!selectedClassId}><option value="">Seleccionar Asignatura</option>{teacherSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                    <button onClick={handleSave} disabled={!localGradebook} className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400">Guardar Cambios</button>
                </div>
                {localGradebook ? (
                    <div className="overflow-auto border rounded-lg max-h-[70vh]">
                        <table className="min-w-full border-collapse">
                           {renderHeader()}
                           {renderBody()}
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                        <p>Seleccione una clase y una asignatura para ver o crear el registro de calificaciones.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradebookPage;