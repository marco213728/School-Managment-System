
import React, { useState, useMemo, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { Class, Student, Gradebook, Role } from '../../types';
import { CheckCircleIcon, AlertTriangleIcon, ArrowLeftIcon, GraduationCapIcon } from '../icons/Icons';

interface PromotionWizardProps {
    classes: Class[];
    students: Student[];
    gradebooks: Gradebook[];
    onUpdateClasses: (classes: Class[]) => void;
    onUpdateStudents: (students: Student[]) => void;
    onClose: () => void;
}

type PromotionStatus = 'Promoted' | 'Retained' | 'Unknown';

interface StudentPromotionPreview {
    studentId: string;
    studentName: string;
    currentClassName: string;
    currentClassId: string;
    finalGrade: number;
    status: PromotionStatus;
    nextClassName?: string;
}

const PromotionWizard: React.FC<PromotionWizardProps> = ({ classes, students, gradebooks, onUpdateClasses, onUpdateStudents, onClose }) => {
    const { user: currentUser } = useContext(UserContext);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [nextYear, setNextYear] = useState('2025-2026');
    const [promotionPreview, setPromotionPreview] = useState<StudentPromotionPreview[]>([]);
    
    // Configuration for mapping grades (Simple incremental logic for demo)
    // In a real app, this would be editable
    const gradeMapping: Record<string, string> = {
        '1ro EGB': '2do EGB', '2do EGB': '3ro EGB', '3ro EGB': '4to EGB',
        '4to EGB': '5to EGB', '5to EGB': '6to EGB', '6to EGB': '7mo EGB',
        '7mo EGB': '8vo EGB', '8vo EGB': '9no EGB', '9no EGB': '10mo EGB',
        '10mo EGB': '1ro BGU', '1ro BGU': '2do BGU', '2do BGU': '3ro BGU',
        '3ro BGU': 'Graduado'
    };

    // --- STEP 1: ANALYSIS ---
    const analyzePromotion = () => {
        const preview: StudentPromotionPreview[] = [];

        // Filter classes for current institution (assuming current active ones don't have academicYear set or match current)
        // For prototype simplicity, we process all visible classes
        const activeClasses = classes.filter(c => c.institutionId === currentUser?.institutionId);

        activeClasses.forEach(cls => {
            // Determine level name (e.g., "8vo EGB" from "8vo EGB A")
            // This is a naive heuristic for the prototype
            const levelName = Object.keys(gradeMapping).find(k => cls.name.includes(k));
            const nextLevelName = levelName ? gradeMapping[levelName] : null;

            cls.studentIds.forEach(studentId => {
                const student = students.find(s => s.id === studentId);
                if (!student) return;

                // Calculate final average from all gradebooks for this student
                const studentGrades = gradebooks
                    .filter(gb => gb.records.some(r => r.studentId === studentId))
                    .map(gb => {
                        const rec = gb.records.find(r => r.studentId === studentId);
                        return rec?.notaFinal100 || rec?.promedioTrimestralFinal || 0;
                    });
                
                const finalAverage = studentGrades.length > 0 
                    ? studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length 
                    : 0;

                const status: PromotionStatus = finalAverage >= 7 ? 'Promoted' : 'Retained';
                
                let nextClassName = 'Por definir';
                if (status === 'Promoted') {
                    if (nextLevelName === 'Graduado') nextClassName = 'Graduado';
                    else if (nextLevelName) nextClassName = cls.name.replace(levelName!, nextLevelName); // e.g. 8vo A -> 9no A
                } else {
                    nextClassName = cls.name; // Stay in same class name structure
                }

                preview.push({
                    studentId: student.id,
                    studentName: student.name,
                    currentClassName: cls.name,
                    currentClassId: cls.id,
                    finalGrade: finalAverage,
                    status,
                    nextClassName
                });
            });
        });

        setPromotionPreview(preview);
        setStep(2);
    };

    // --- STEP 3: EXECUTION ---
    const executePromotion = () => {
        const institutionId = currentUser!.institutionId!;
        const newClasses: Class[] = [];
        const updatedStudents = [...students];

        // 1. Create New Classes based on preview
        // Fixed: Explicit type assertion to string[] for uniqueNewClasses
        const uniqueNewClasses = Array.from(new Set(promotionPreview.map(p => p.nextClassName).filter((n): n is string => !!n && n !== 'Graduado'))) as string[];
        
        const newClassMap = new Map<string, string>(); // Name -> New ID

        uniqueNewClasses.forEach(name => {
            const newId = `class-${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
            newClassMap.set(name, newId);
            
            // Find template from old class to copy timetableId if possible (simplified)
            // Ideally we'd look up the source class structure
            
            newClasses.push({
                id: newId,
                institutionId,
                name: name,
                studentIds: [], // Will populate next
                academicYear: nextYear,
                // In a real app, you might want to assign a default timetable here or clear it
            });
        });

        // 2. Move Students
        promotionPreview.forEach(p => {
            const studentIndex = updatedStudents.findIndex(s => s.id === p.studentId);
            if (studentIndex === -1) return;

            if (p.nextClassName === 'Graduado') {
                // Remove class association or mark as alumni
                updatedStudents[studentIndex] = {
                    ...updatedStudents[studentIndex],
                    classId: 'alumni', // Special ID or empty
                    grade: 'Graduado'
                };
            } else if (p.nextClassName) {
                // Fixed: Explicitly typed name as string for Map retrieval
                const newClassId = newClassMap.get(p.nextClassName);
                if (newClassId) {
                    updatedStudents[studentIndex] = {
                        ...updatedStudents[studentIndex],
                        classId: newClassId
                    };
                    // Add to class student list
                    const cls = newClasses.find(c => c.id === newClassId);
                    if (cls) cls.studentIds.push(p.studentId);
                }
            }
        });

        // 3. Commit Changes
        onUpdateClasses([...classes, ...newClasses]); // Keep old classes for history (conceptually)
        onUpdateStudents(updatedStudents);
        
        alert(`¡Promoción al año ${nextYear} realizada con éxito! Se han creado ${newClasses.length} nuevas clases.`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[90] flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <GraduationCapIcon className="h-6 w-6 text-primary-600"/> 
                            Asistente de Promoción Estudiantil
                        </h2>
                        <p className="text-sm text-gray-500">Gestión de cierre de año y paso de ciclo.</p>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto p-6">
                    {/* STEP 1: CONFIG */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="font-bold text-blue-900 mb-2">Instrucciones</h3>
                                <p className="text-sm text-blue-800 mb-2">Este asistente le ayudará a:</p>
                                <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                                    <li>Analizar los promedios finales de todos los estudiantes.</li>
                                    <li>Determinar quiénes son promovidos al siguiente nivel y quiénes repiten el año.</li>
                                    <li>Generar automáticamente las clases para el nuevo año lectivo.</li>
                                    <li>Mover a los estudiantes a sus nuevos grupos.</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nuevo Año Lectivo (Etiqueta)</label>
                                <input 
                                    type="text" 
                                    value={nextYear} 
                                    onChange={e => setNextYear(e.target.value)} 
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Ej: 2025-2026"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PREVIEW */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Vista Previa de Promoción</h3>
                                <div className="text-sm space-x-4">
                                    <span className="text-green-600 font-bold">{promotionPreview.filter(p => p.status === 'Promoted').length} Promovidos</span>
                                    <span className="text-red-600 font-bold">{promotionPreview.filter(p => p.status === 'Retained').length} Retenidos</span>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto border rounded-lg max-h-96">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left">Estudiante</th>
                                            <th className="p-2 text-left">Clase Actual</th>
                                            <th className="p-2 text-center">Promedio</th>
                                            <th className="p-2 text-center">Estado</th>
                                            <th className="p-2 text-left">Clase Proyectada ({nextYear})</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {promotionPreview.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="p-2 font-medium">{p.studentName}</td>
                                                <td className="p-2 text-gray-500">{p.currentClassName}</td>
                                                <td className="p-2 text-center font-bold">{p.finalGrade.toFixed(2)}</td>
                                                <td className="p-2 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'Promoted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {p.status === 'Promoted' ? 'Aprobado' : 'Reprobado'}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-gray-700">
                                                    {p.nextClassName} 
                                                    {p.status === 'Retained' && <span className="ml-2 text-xs text-red-500">(Repite)</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 italic">* Revise cuidadosamente. Al confirmar, se crearán las nuevas clases y se asignarán los estudiantes.</p>
                        </div>
                    )}
                </div>

                <footer className="p-6 border-t bg-gray-50 flex justify-between rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-white">Cancelar</button>
                    
                    {step === 1 && (
                        <button onClick={analyzePromotion} className="px-6 py-2 bg-primary-600 text-white rounded-md font-bold hover:bg-primary-700">
                            Analizar Datos &rarr;
                        </button>
                    )}
                    
                    {step === 2 && (
                        <div className="flex gap-2">
                             <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-600 hover:underline">
                                &larr; Atrás
                            </button>
                            <button onClick={executePromotion} className="px-6 py-2 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 flex items-center gap-2">
                                <CheckCircleIcon className="h-5 w-5"/> Confirmar y Ejecutar
                            </button>
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default PromotionWizard;
