
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MOCK_STUDENTS, MOCK_OCR_SUBMISSIONS, ATTENDANCE_OBSERVATIONS } from '../constants';
import { AttendanceStatus, Role, OcrSubmission, OcrSubmissionStatus, Class, TimeSlot, Timetable, AttendanceRecord, Student } from '../types';
import { UploadIcon, CloseIcon } from '../components/icons/Icons';
import JustificationForm from '../components/attendance/JustificationForm';

// New component imports
import OcrSubmissionsList from '../components/attendance/OcrSubmissionsList';
import OcrUploadModal from '../components/attendance/OcrUploadModal';
import OcrVerification from '../components/attendance/OcrVerification';


const statusColors: Record<AttendanceStatus, string> = {
    [AttendanceStatus.Present]: 'bg-emerald-100 text-emerald-800',
    [AttendanceStatus.Tardy]: 'bg-amber-100 text-amber-800',
    [AttendanceStatus.Unexcused]: 'bg-rose-100 text-rose-800',
    [AttendanceStatus.Excused]: 'bg-blue-100 text-blue-800',
    [AttendanceStatus.Absent]: 'bg-orange-100 text-orange-800',
    [AttendanceStatus.JustificationPending]: 'bg-purple-100 text-purple-800',
};

interface AttendancePageProps {
    classes: Class[];
    students?: Student[];
    timeSlots: TimeSlot[];
    timetables: Timetable[];
    attendanceRecords: AttendanceRecord[];
    onUpdateAttendance: (records: AttendanceRecord[]) => void;
}

interface ObservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (observations: number[]) => void;
    currentObservations: number[];
}

const ObservationModal: React.FC<ObservationModalProps> = ({ isOpen, onClose, onSave, currentObservations }) => {
    const [selected, setSelected] = useState(new Set(currentObservations));

    const handleToggle = (id: number) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const handleSave = () => {
        onSave(Array.from(selected));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon className="h-6 w-6" /></button>
                <h2 className="text-xl font-bold mb-4">Registrar Observaciones</h2>
                <div className="space-y-2 overflow-y-auto">
                    {Object.entries(ATTENDANCE_OBSERVATIONS).map(([id, label]) => (
                        <label key={id} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.has(Number(id))}
                                onChange={() => handleToggle(Number(id))}
                                className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-3 text-gray-700">{label}</span>
                        </label>
                    ))}
                </div>
                 <div className="flex justify-end gap-4 pt-4 mt-auto border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Guardar</button>
                </div>
            </div>
        </div>
    );
};

// Teacher View - Manual Entry (Existing component)
const TakeAttendanceManual: React.FC<AttendancePageProps> = ({ classes, students = [], timeSlots, timetables, attendanceRecords, onUpdateAttendance }) => {    
    const { user } = useContext(UserContext);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [attendanceData, setAttendanceData] = useState<Record<string, { status: AttendanceStatus; observations: number[] }>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isObservationModalOpen, setObservationModalOpen] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

    const institutionClasses = useMemo(() => classes, [classes]);
    const institutionStudents = useMemo(() => students.length > 0 ? students : MOCK_STUDENTS.filter(s => s.institutionId === user?.institutionId), [students, user]);
    
    const relevantTimeSlots = useMemo(() => {
        if (!selectedClass) return [];
        const classInfo = institutionClasses.find(c => c.id === selectedClass);
        if (!classInfo || !classInfo.timetableId) return [];

        return timeSlots
            .filter(ts => ts.timetableId === classInfo.timetableId && !ts.isBreak)
            .sort((a,b) => a.startTime.localeCompare(b.startTime));
    }, [selectedClass, institutionClasses, timeSlots]);

    const visibleClasses = useMemo(() => {
        if (user?.role === Role.InstitutionAdmin || user?.role === Role.InspectorGeneral || user?.role === Role.SuperAdmin || user?.role === Role.Rector) {
            return institutionClasses;
        }
        return institutionClasses.filter(c => user?.classIds?.includes(c.id));
    }, [institutionClasses, user]);
    
    const studentsInClass = useMemo(() => {
        return institutionStudents.filter(s => s.classId === selectedClass);
    }, [selectedClass, institutionStudents]);

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendanceData(prev => {
            const currentData = prev[studentId] || { status: AttendanceStatus.Present, observations: [] };
            return {
                ...prev,
                [studentId]: { ...currentData, status },
            };
        });
    };

    const handleOpenObservations = (studentId: string) => {
        setEditingStudentId(studentId);
        setObservationModalOpen(true);
    };

    const handleSaveObservations = (observations: number[]) => {
        if (editingStudentId) {
            setAttendanceData(prev => {
                const currentData = prev[editingStudentId] || { status: AttendanceStatus.Present, observations: [] };
                return {
                    ...prev,
                    [editingStudentId]: { ...currentData, observations },
                };
            });
        }
        setObservationModalOpen(false);
        setEditingStudentId(null);
    };

    const handleSubmit = () => {
        if (!selectedClass || !selectedDate || !selectedTimeSlot || !user?.institutionId) return;

        const newRecords: AttendanceRecord[] = [];
        const updatedRecords: AttendanceRecord[] = [];
        const existingRecordMap = new Map<string, AttendanceRecord>(
            attendanceRecords
                .filter(rec => rec.date === selectedDate && rec.timeSlot === selectedTimeSlot)
                .map(rec => [rec.studentId, rec])
        );

        studentsInClass.forEach(student => {
            const studentData = attendanceData[student.id];
            if (studentData) {
                const existingRecord = existingRecordMap.get(student.id);
                if (existingRecord) {
                    const updatedRecord: AttendanceRecord = {
                        ...existingRecord,
                        status: studentData.status,
                        observations: studentData.observations,
                    };
                    updatedRecords.push(updatedRecord);
                } else {
                    newRecords.push({
                        id: `att-${student.id}-${selectedDate}-${selectedTimeSlot}`,
                        institutionId: user.institutionId!,
                        studentId: student.id,
                        date: selectedDate,
                        timeSlot: selectedTimeSlot,
                        status: studentData.status,
                        observations: studentData.observations
                    });
                }
            }
        });
        
        const otherRecords = attendanceRecords.filter(rec => {
             const isForThisSession = rec.date === selectedDate && rec.timeSlot === selectedTimeSlot && studentsInClass.some(s => s.id === rec.studentId);
             return !isForThisSession;
        });

        onUpdateAttendance(otherRecords.concat(updatedRecords, newRecords));
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
    };
    
    const getShortStatus = (status: AttendanceStatus) => {
        if (status === AttendanceStatus.Unexcused) return 'Injustif.';
        if (status === AttendanceStatus.Excused) return 'Justif.';
        return status;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pase de Lista Manual</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-2 border rounded-md">
                    <option value="">Seleccionar Clase</option>
                    {visibleClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-2 border rounded-md" />
                <select value={selectedTimeSlot} onChange={e => setSelectedTimeSlot(e.target.value)} className="w-full p-2 border rounded-md" disabled={!selectedClass}>
                    <option value="">Seleccionar Franja Horaria</option>
                    {relevantTimeSlots.map(ts => <option key={ts.id} value={`${ts.startTime}-${ts.endTime}`}>{ts.startTime} - {ts.endTime}</option>)}
                </select>
            </div>

            {selectedClass && selectedTimeSlot && (
                <div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumno</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {studentsInClass.map(student => {
                                    const currentData = attendanceData[student.id] || { status: AttendanceStatus.Present, observations: [] };
                                    return (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.values(AttendanceStatus).filter(s => s !== AttendanceStatus.JustificationPending).map(status => (
                                                        <button 
                                                            key={status} 
                                                            onClick={() => handleStatusChange(student.id, status)}
                                                            className={`px-2 py-1 text-xs rounded-md ${currentData.status === status ? statusColors[status] : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                                        >
                                                            {getShortStatus(status)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button onClick={() => handleOpenObservations(student.id)} className="text-sm text-primary-600 hover:underline">
                                                    Añadir ({currentData.observations.length})
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleSubmit} className="mt-6 w-full md:w-auto px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
                        Guardar Asistencia
                    </button>
                    {isSubmitted && <p className="mt-4 text-emerald-600">Asistencia guardada con éxito.</p>}
                </div>
            )}
            {editingStudentId && (
                <ObservationModal 
                    isOpen={isObservationModalOpen}
                    onClose={() => setObservationModalOpen(false)}
                    onSave={handleSaveObservations}
                    currentObservations={attendanceData[editingStudentId]?.observations || []}
                />
            )}
        </div>
    );
};


// Teacher View - Container
const TeacherAttendance: React.FC<AttendancePageProps> = ({ classes, students = [], timeSlots, timetables, attendanceRecords, onUpdateAttendance }) => {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState<'manual' | 'ocr'>('manual');
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [submissions, setSubmissions] = useState(MOCK_OCR_SUBMISSIONS.filter(s => s.institutionId === user?.institutionId));
    const [reviewingSubmission, setReviewingSubmission] = useState<OcrSubmission | null>(null);
    const [selectedOcrClass, setSelectedOcrClass] = useState('');

    const institutionClasses = useMemo(() => classes, [classes]);

    const classesForCurrentUser = useMemo(() => {
        if (user?.role === Role.InstitutionAdmin || user?.role === Role.InspectorGeneral || user?.role === Role.SuperAdmin || user?.role === Role.Rector) {
            return institutionClasses;
        }
        return institutionClasses.filter(c => user?.classIds?.includes(c.id));
    }, [institutionClasses, user]);

    const filteredSubmissions = useMemo(() => {
        if (!selectedOcrClass) return [];
        return submissions.filter(s => s.classId === selectedOcrClass);
    }, [submissions, selectedOcrClass]);

    const handleFileUpload = (file: File) => {
        if (!selectedOcrClass) {
            alert('Por favor seleccione una clase antes de subir un archivo.');
            return;
        }
        const newSubmission: OcrSubmission = {
            id: `ocr-${Date.now()}`,
            institutionId: user!.institutionId!,
            classId: selectedOcrClass,
            uploaderId: user!.id,
            uploadDate: new Date().toISOString(),
            fileName: file.name,
            imageUrl: URL.createObjectURL(file), // For local preview
            status: OcrSubmissionStatus.Processing,
            extractedData: [],
        };
        setSubmissions(prev => [newSubmission, ...prev]);

        // Simulate backend processing
        setTimeout(() => {
            setSubmissions(prev => prev.map(s => s.id === newSubmission.id ? { ...MOCK_OCR_SUBMISSIONS[0], id: s.id, imageUrl: s.imageUrl, fileName: s.fileName, uploadDate: s.uploadDate, status: OcrSubmissionStatus.PendingVerification, classId: s.classId } : s));
        }, 3000);
    };

    const handleApprove = (submissionId: string, updatedData: any) => {
        setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: OcrSubmissionStatus.Completed, extractedData: updatedData } : s));
        setReviewingSubmission(null);
    };

    if (reviewingSubmission) {
        return <OcrVerification submission={reviewingSubmission} onBack={() => setReviewingSubmission(null)} onApprove={handleApprove} />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-2 rounded-xl shadow-sm inline-flex space-x-2 border border-slate-200">
                <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeTab === 'manual' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                    Registro Manual
                </button>
                <button onClick={() => setActiveTab('ocr')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeTab === 'ocr' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                    Registro por OCR
                </button>
            </div>
            {activeTab === 'manual' && <TakeAttendanceManual classes={classes} students={students} timeSlots={timeSlots} timetables={timetables} attendanceRecords={attendanceRecords} onUpdateAttendance={onUpdateAttendance} />}
            {activeTab === 'ocr' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <h2 className="text-xl font-bold text-gray-800">Envíos de Asistencia por OCR</h2>
                        <button 
                            onClick={() => setUploadModalOpen(true)} 
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-slate-400"
                            disabled={!selectedOcrClass}
                        >
                            <UploadIcon className="h-5 w-5" />
                            Cargar Hoja
                        </button>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="ocr-class-select" className="block text-sm font-medium text-gray-700">Clase</label>
                        <select 
                            id="ocr-class-select" 
                            value={selectedOcrClass} 
                            onChange={e => setSelectedOcrClass(e.target.value)} 
                            className="mt-1 block w-full md:w-1/2 p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">-- Seleccione una clase --</option>
                            {classesForCurrentUser.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {selectedOcrClass ? (
                         <OcrSubmissionsList 
                            submissions={filteredSubmissions}
                            onReviewClick={(sub) => setReviewingSubmission(sub)}
                        />
                    ) : (
                        <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                            <UploadIcon className="h-12 w-12 text-slate-300 mx-auto" />
                            <p className="mt-2 font-semibold">Seleccione una clase</p>
                            <p className="text-sm">Por favor, elija una clase para ver o cargar las hojas de asistencia.</p>
                        </div>
                    )}
                </div>
            )}
            <OcrUploadModal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} onUpload={handleFileUpload} />
        </div>
    );
};


// Student/Parent View
interface ViewAttendanceProps {
    students?: Student[];
    classes?: Class[];
    attendanceRecords: AttendanceRecord[];
    onUpdateAttendance: (records: AttendanceRecord[]) => void;
}

const ViewAttendance: React.FC<ViewAttendanceProps> = ({ students = [], classes = [], attendanceRecords, onUpdateAttendance }) => {
    const { user } = useContext(UserContext);
    const [justifyingRecord, setJustifyingRecord] = useState<AttendanceRecord | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const availableStudents = useMemo(() => {
        const studentPool = students.length > 0 ? students : MOCK_STUDENTS;
        if (!user) return [];

        if (user.role === Role.Student) {
            return studentPool.filter(s => s.id === user.id);
        }

        if (user.role === Role.Parent) {
            // 1. By childIds in parent user
            const byChildIds = user.childIds && user.childIds.length > 0
                ? studentPool.filter(s => user.childIds?.includes(s.id))
                : [];
            // 2. By parentId in student
            const byParentId = studentPool.filter(s => s.parentId === user.id);
            // 3. By matching email, phone or name in relatedContacts
            const byContact = studentPool.filter(s => 
                s.relatedContacts?.some(c => 
                    (user.email && c.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
                    (user.phone && c.phone && c.phone.replace(/\D/g, '') === user.phone.replace(/\D/g, '')) ||
                    (user.name && c.name && c.name.toLowerCase().trim() === user.name.toLowerCase().trim())
                )
            );

            const map = new Map<string, Student>();
            [...byChildIds, ...byParentId, ...byContact].forEach(s => map.set(s.id, s));
            return Array.from(map.values());
        }

        return [];
    }, [user, students]);

    useEffect(() => {
        if (availableStudents.length > 0) {
            if (!selectedStudentId || !availableStudents.some(s => s.id === selectedStudentId)) {
                setSelectedStudentId(availableStudents[0].id);
            }
        }
    }, [availableStudents, selectedStudentId]);

    const studentData = useMemo(() => 
        availableStudents.find(s => s.id === selectedStudentId) || (availableStudents.length > 0 ? availableStudents[0] : null),
        [selectedStudentId, availableStudents]
    );

    const studentClass = useMemo(() => {
        if (!studentData?.classId) return null;
        return classes.find(c => c.id === studentData.classId);
    }, [studentData, classes]);

    const studentAttendance = useMemo(() => {
        if (!studentData) return [];
        return attendanceRecords
            .filter(att => att.studentId === studentData.id)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [studentData, attendanceRecords]);

    const stats = useMemo(() => {
        const total = studentAttendance.length;
        const present = studentAttendance.filter(r => r.status === AttendanceStatus.Present).length;
        const tardy = studentAttendance.filter(r => r.status === AttendanceStatus.Tardy).length;
        const unexcused = studentAttendance.filter(r => r.status === AttendanceStatus.Unexcused).length;
        const justified = studentAttendance.filter(r => r.status === AttendanceStatus.Excused || r.status === AttendanceStatus.JustificationPending).length;
        return { total, present, tardy, unexcused, justified };
    }, [studentAttendance]);

    const handleSaveJustification = (notes: string, documentUrl?: string) => {
        if (!justifyingRecord) return;

        const updatedRecords = attendanceRecords.map(rec => {
            if (rec.id === justifyingRecord.id) {
                return {
                    ...rec,
                    status: AttendanceStatus.JustificationPending,
                    justificationNotes: notes,
                    justificationDocumentUrl: documentUrl,
                };
            }
            return rec;
        });
        onUpdateAttendance(updatedRecords);
        setJustifyingRecord(null);
    };

    if (availableStudents.length === 0) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-xl mx-auto my-8">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-200">
                    👨‍👩‍👧‍👦
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No se encontraron estudiantes asociados</h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Tu cuenta de familiar (<strong>{user?.name}</strong>) no tiene ningún estudiante vinculado actualmente.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 text-left space-y-2">
                    <p className="font-semibold text-slate-800">¿Qué debes hacer?</p>
                    <p>• Comunícate con la administración de la institución para que registren a tu representado.</p>
                    <p>• Al matricular al alumno, el personal asignará tu correo (<strong>{user?.email}</strong>) como representante legal.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Multi-child selector if parent has more than 1 student */}
            {availableStudents.length > 1 && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3 overflow-x-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Estudiante:</span>
                    <div className="flex gap-2">
                        {availableStudents.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedStudentId(s.id)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                                    selectedStudentId === s.id
                                        ? 'bg-primary-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                <span>🎓</span>
                                <span>{s.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Student Header Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-xl font-bold shadow-md overflow-hidden flex-shrink-0">
                        {studentData?.photoUrl ? (
                            <img src={studentData.photoUrl} alt={studentData.name} className="w-full h-full object-cover" />
                        ) : (
                            studentData?.name ? studentData.name.charAt(0) : '🎓'
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold text-slate-900">{studentData?.name}</h2>
                            {studentData?.listNumber && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
                                    Nº {studentData.listNumber}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="font-semibold text-primary-700">
                                🏫 {studentClass?.name || studentData?.grade || 'Sin curso asignado'}
                            </span>
                            {studentData?.nationalId && (
                                <span>• Cédula: <strong className="font-mono text-slate-700">{studentData.nationalId}</strong></span>
                            )}
                            <span>• Representante: <strong className="text-slate-700">{user?.name}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Seguimiento Activo
                    </span>
                </div>
            </div>

            {/* Attendance Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
                    <div className="text-2xl font-black text-emerald-700">{stats.present}</div>
                    <div className="text-xs font-semibold text-emerald-800 mt-0.5">Asistencias Puntuales</div>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
                    <div className="text-2xl font-black text-amber-700">{stats.tardy}</div>
                    <div className="text-xs font-semibold text-amber-800 mt-0.5">Atrasos</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
                    <div className="text-2xl font-black text-blue-700">{stats.justified}</div>
                    <div className="text-xs font-semibold text-blue-800 mt-0.5">Justificadas</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-center">
                    <div className="text-2xl font-black text-rose-700">{stats.unexcused}</div>
                    <div className="text-xs font-semibold text-rose-800 mt-0.5">Faltas Injustificadas</div>
                </div>
            </div>

            {/* Records Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <span>📋</span> Registro Detallado de Asistencia
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                        {studentAttendance.length} registro(s)
                    </span>
                </div>

                {studentAttendance.length === 0 ? (
                    <div className="py-12 px-4 text-center border-2 border-dashed border-emerald-100 bg-emerald-50/40 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3">
                            ✓
                        </div>
                        <h4 className="text-base font-bold text-emerald-950 mb-1">¡Excelente Asistencia!</h4>
                        <p className="text-xs text-emerald-800 max-w-md mx-auto">
                            No se registran faltas ni atrasos reportados para <strong>{studentData?.name}</strong> en el sistema lectivo.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="min-w-full divide-y divide-slate-200 text-xs">
                            <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">Fecha</th>
                                    <th className="px-4 py-3 text-left">Franja Horaria / Periodo</th>
                                    <th className="px-4 py-3 text-left">Estado</th>
                                    <th className="px-4 py-3 text-right">Acciones / Justificación</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {studentAttendance.map(record => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition">
                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{record.date}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">{record.timeSlot}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-bold rounded-full ${statusColors[record.status]}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                                            {record.status === AttendanceStatus.Unexcused && user?.role === Role.Parent && (
                                                <button 
                                                    onClick={() => setJustifyingRecord(record)} 
                                                    className="px-3 py-1 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 rounded-lg font-bold text-xs transition"
                                                >
                                                    Justificar Falta
                                                </button>
                                            )}
                                            {record.justificationDocumentUrl && (
                                                <a href={record.justificationDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium">
                                                    <span>📎 Doc. Adjunto</span>
                                                </a>
                                            )}
                                            {record.justificationNotes && (
                                                <span className="text-slate-500 italic text-[11px]" title={record.justificationNotes}>
                                                    ({record.justificationNotes.slice(0, 30)}...)
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {justifyingRecord && (
                <JustificationForm 
                    isOpen={!!justifyingRecord}
                    onClose={() => setJustifyingRecord(null)}
                    onSave={handleSaveJustification}
                />
            )}
        </div>
    );
};


const AttendancePage: React.FC<AttendancePageProps> = ({ classes, students = [], timeSlots, timetables, attendanceRecords, onUpdateAttendance }) => {
    const { user } = useContext(UserContext);
    
    if (user?.role === Role.Teacher || user?.role === Role.InstitutionAdmin || user?.role === Role.InspectorGeneral || user?.role === Role.SuperAdmin || user?.role === Role.Rector) {
        return <TeacherAttendance classes={classes} students={students} timeSlots={timeSlots} timetables={timetables} attendanceRecords={attendanceRecords} onUpdateAttendance={onUpdateAttendance} />;
    }
    
    if (user?.role === Role.Parent || user?.role === Role.Student) {
        return <ViewAttendance students={students} classes={classes} attendanceRecords={attendanceRecords} onUpdateAttendance={onUpdateAttendance} />;
    }

    return <p>No tiene acceso a esta sección.</p>;
};

export default AttendancePage;
