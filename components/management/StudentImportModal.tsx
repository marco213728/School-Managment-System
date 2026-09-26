import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Student, User, Class, Role } from '../../types';
import { CloseIcon, PlusIcon, UsersIcon } from '../icons/Icons';
import { saveDocumentsBatch } from '../../lib/firebase';

interface StudentImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    classes: Class[];
    existingStudents: Student[];
    existingUsers: User[];
    institutionId: string;
    onImportSuccess: (newStudents: Student[], newParents: User[], updatedClasses: Class[]) => void;
}

interface ParsedStudentRow {
    index: number;
    nationalId: string;
    name: string;
    className: string;
    listNumber?: number;
    gender?: 'FEMENINO' | 'MASCULINO' | 'OTRO';
    birthDate?: string;
    phone?: string;
    address?: string;
    parentName?: string;
    parentEmail?: string;
    parentPhone?: string;
    isValid: boolean;
    errors: string[];
}

export const DATA_STRUCTURE_GUIDE = [
    {
        field: "cedula",
        label: "Cédula / Identificación",
        required: true,
        type: "Texto / Número (10 dígitos)",
        example: "1720349812",
        description: "Documento de identidad o número de identificación oficial del estudiante."
    },
    {
        field: "apellidos_y_nombres",
        label: "Apellidos y Nombres",
        required: true,
        type: "Texto",
        example: "Mendoza Salazar Juan Carlos",
        description: "Nombre completo del estudiante (o separado en columnas 'apellidos' y 'nombres')."
    },
    {
        field: "curso",
        label: "Curso / Grado / Paralelo",
        required: false,
        type: "Texto",
        example: "10mo EGB A",
        description: "Grupo al que pertenece el estudiante. Si no se especifica, se usará el curso destino seleccionado."
    },
    {
        field: "numero_lista",
        label: "Nº de Lista",
        required: false,
        type: "Número entero",
        example: "1",
        description: "Orden alfabético o número de lista del estudiante en la nómina del aula."
    },
    {
        field: "genero",
        label: "Género / Sexo",
        required: false,
        type: "MASCULINO / FEMENINO (o M / F)",
        example: "MASCULINO",
        description: "Sexo o género del estudiante para estadísticas ministeriales."
    },
    {
        field: "fecha_nacimiento",
        label: "Fecha de Nacimiento",
        required: false,
        type: "Fecha (AAAA-MM-DD o DD/MM/AAAA)",
        example: "2010-05-14",
        description: "Fecha de nacimiento del alumno."
    },
    {
        field: "telefono",
        label: "Teléfono / Celular Alumno",
        required: false,
        type: "Texto / Número",
        example: "0991234567",
        description: "Número de teléfono de contacto o emergencia del estudiante."
    },
    {
        field: "direccion",
        label: "Dirección Domiciliaria",
        required: false,
        type: "Texto",
        example: "Av. Amazonas y Colón, Quito",
        description: "Dirección de residencia del alumno."
    },
    {
        field: "representante",
        label: "Representante Legal / Padre",
        required: false,
        type: "Texto",
        example: "Carlos Mendoza",
        description: "Nombre completo de la madre, padre o representante legal."
    },
    {
        field: "email_representante",
        label: "Email del Representante",
        required: false,
        type: "Correo Electrónico",
        example: "carlos.mendoza@email.com",
        description: "Se creará un usuario familiar con este correo para que pueda consultar notas y citaciones."
    },
    {
        field: "telefono_representante",
        label: "Teléfono Representante",
        required: false,
        type: "Texto / Número",
        example: "0987654321",
        description: "Número de contacto directo con el representante legal."
    }
];

const StudentImportModal: React.FC<StudentImportModalProps> = ({
    isOpen,
    onClose,
    classes,
    existingStudents,
    existingUsers,
    institutionId,
    onImportSuccess
}) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'guide'>('upload');
    const [selectedTargetClassId, setSelectedTargetClassId] = useState<string>('auto');
    const [autoCreateClasses, setAutoCreateClasses] = useState<boolean>(true);
    const [fileName, setFileName] = useState<string | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const normalizeHeader = (header: string): string => {
        return header
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "_");
    };

    const parseFileContent = (data: ArrayBuffer | string, name: string) => {
        setIsProcessing(true);
        setImportSuccessMessage(null);
        try {
            let workbook: XLSX.WorkBook;
            if (typeof data === 'string') {
                workbook = XLSX.read(data, { type: 'string' });
            } else {
                workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            }

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            if (rawRows.length === 0) {
                alert('El archivo no contiene filas de datos. Verifica que tenga una fila de encabezados y registros.');
                setIsProcessing(false);
                return;
            }

            const results: ParsedStudentRow[] = rawRows.map((row, idx) => {
                const normalizedRow: Record<string, string> = {};
                for (const [k, v] of Object.entries(row)) {
                    normalizedRow[normalizeHeader(k)] = String(v).trim();
                }

                // Field Detection
                let nationalId = normalizedRow['cedula'] || normalizedRow['identificacion'] || normalizedRow['dni'] || normalizedRow['ci'] || normalizedRow['id'] || '';
                
                let name = normalizedRow['apellidos_y_nombres'] || normalizedRow['apellidos_nombres'] || normalizedRow['nombres_y_apellidos'] || normalizedRow['nombre_completo'] || normalizedRow['estudiante'] || normalizedRow['alumno'] || normalizedRow['nombre'] || '';
                
                // If separate apellidos and nombres columns exist
                if (!name && (normalizedRow['apellidos'] || normalizedRow['nombres'])) {
                    name = `${normalizedRow['apellidos'] || ''} ${normalizedRow['nombres'] || ''}`.trim();
                }

                let className = normalizedRow['curso'] || normalizedRow['clase'] || normalizedRow['grado'] || normalizedRow['paralelo'] || normalizedRow['curso_paralelo'] || '';

                let rawListNum = normalizedRow['numero_lista'] || normalizedRow['no_lista'] || normalizedRow['lista'] || normalizedRow['orden'] || normalizedRow['num'];
                let listNumber = rawListNum ? parseInt(rawListNum, 10) : (idx + 1);
                if (isNaN(listNumber)) listNumber = idx + 1;

                let rawGender = (normalizedRow['genero'] || normalizedRow['sexo'] || '').toUpperCase();
                let gender: 'FEMENINO' | 'MASCULINO' | 'OTRO' | undefined = undefined;
                if (rawGender.startsWith('M') || rawGender === 'V' || rawGender.includes('MASC')) {
                    gender = 'MASCULINO';
                } else if (rawGender.startsWith('F') || rawGender.includes('FEM')) {
                    gender = 'FEMENINO';
                }

                let birthDate = normalizedRow['fecha_nacimiento'] || normalizedRow['nacimiento'] || normalizedRow['fnac'] || '';
                // Standardize date if formatted as DD/MM/YYYY
                if (birthDate.includes('/')) {
                    const parts = birthDate.split('/');
                    if (parts.length === 3) {
                        if (parts[2].length === 4) {
                            birthDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        }
                    }
                }

                let phone = normalizedRow['telefono'] || normalizedRow['celular'] || normalizedRow['movil'] || '';
                let address = normalizedRow['direccion'] || normalizedRow['domicilio'] || '';

                let parentName = normalizedRow['representante'] || normalizedRow['tutor_legal'] || normalizedRow['padre'] || normalizedRow['madre'] || normalizedRow['nombre_representante'] || '';
                let parentEmail = normalizedRow['email_representante'] || normalizedRow['correo_representante'] || normalizedRow['email'] || normalizedRow['correo'] || '';
                let parentPhone = normalizedRow['telefono_representante'] || normalizedRow['celular_representante'] || normalizedRow['telefono_tutor'] || '';

                const errors: string[] = [];
                if (!name) errors.push('Falta el nombre del estudiante');
                if (!nationalId) errors.push('Sin cédula/identificación (se generará ID temporal)');

                return {
                    index: idx + 1,
                    nationalId,
                    name,
                    className,
                    listNumber,
                    gender,
                    birthDate,
                    phone,
                    address,
                    parentName,
                    parentEmail,
                    parentPhone,
                    isValid: Boolean(name),
                    errors
                };
            });

            setFileName(name);
            setParsedRows(results);
        } catch (err: any) {
            console.error('Error al procesar archivo:', err);
            alert(`No se pudo leer el archivo: ${err?.message || 'Formato no soportado'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const buffer = evt.target?.result as ArrayBuffer;
            parseFileContent(buffer, file.name);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const buffer = evt.target?.result as ArrayBuffer;
            parseFileContent(buffer, file.name);
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadExcelTemplate = () => {
        const sampleData = [
            {
                "cedula": "1720349812",
                "apellidos_y_nombres": "Mendoza Salazar Juan Carlos",
                "curso": "10mo EGB A",
                "numero_lista": 1,
                "genero": "MASCULINO",
                "fecha_nacimiento": "2010-05-14",
                "telefono": "0991234567",
                "direccion": "Av. Amazonas y Colón, Quito",
                "representante": "Carlos Mendoza",
                "email_representante": "carlos.mendoza@email.com",
                "telefono_representante": "0987654321"
            },
            {
                "cedula": "1751928374",
                "apellidos_y_nombres": "Paredes Gómez Valentina Sofía",
                "curso": "10mo EGB A",
                "numero_lista": 2,
                "genero": "FEMENINO",
                "fecha_nacimiento": "2010-09-22",
                "telefono": "0997654321",
                "direccion": "Sector La Pradera, Pasaje B",
                "representante": "Lucía Gómez",
                "email_representante": "lucia.gomez@email.com",
                "telefono_representante": "0998877665"
            },
            {
                "cedula": "1782341908",
                "apellidos_y_nombres": "Tapia Caiza Mateo David",
                "curso": "10mo EGB A",
                "numero_lista": 3,
                "genero": "MASCULINO",
                "fecha_nacimiento": "2010-11-03",
                "telefono": "0984561230",
                "direccion": "Calle Guayaquil y Chile",
                "representante": "David Tapia",
                "email_representante": "david.tapia@email.com",
                "telefono_representante": "0981122334"
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        // Column widths
        worksheet['!cols'] = [
            { wch: 15 }, // cedula
            { wch: 32 }, // apellidos_y_nombres
            { wch: 14 }, // curso
            { wch: 14 }, // numero_lista
            { wch: 14 }, // genero
            { wch: 18 }, // fecha_nacimiento
            { wch: 14 }, // telefono
            { wch: 28 }, // direccion
            { wch: 24 }, // representante
            { wch: 28 }, // email_representante
            { wch: 22 }  // telefono_representante
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla_Estudiantes");
        XLSX.writeFile(workbook, "plantilla_estudiantes_amauta.xlsx");
    };

    const downloadCsvTemplate = () => {
        const csvContent = 
            "\uFEFFcedula,apellidos_y_nombres,curso,numero_lista,genero,fecha_nacimiento,telefono,direccion,representante,email_representante,telefono_representante\n" +
            "1720349812,Mendoza Salazar Juan Carlos,10mo EGB A,1,MASCULINO,2010-05-14,0991234567,Av. Amazonas y Colón,Carlos Mendoza,carlos.mendoza@email.com,0987654321\n" +
            "1751928374,Paredes Gómez Valentina Sofía,10mo EGB A,2,FEMENINO,2010-09-22,0997654321,Sector La Pradera,Lucía Gómez,lucia.gomez@email.com,0998877665\n" +
            "1782341908,Tapia Caiza Mateo David,10mo EGB A,3,MASCULINO,2010-11-03,0984561230,Calle Guayaquil y Chile,David Tapia,david.tapia@email.com,0981122334\n";
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "plantilla_estudiantes_amauta.csv";
        link.click();
    };

    const handleExecuteImport = async () => {
        const validRows = parsedRows.filter(r => r.isValid);
        if (validRows.length === 0) {
            alert('No hay estudiantes válidos para importar.');
            return;
        }

        setImporting(true);

        try {
            const newStudentsList: Student[] = [];
            const newParentsList: User[] = [];
            const updatedClassesMap = new Map<string, Class>();
            classes.forEach(c => updatedClassesMap.set(c.id, { ...c, studentIds: [...(c.studentIds || [])] }));

            // Firestore Batch Payload array
            const batchOperations: { collectionName: string; id: string; data: any }[] = [];

            // Helper to get or create class
            const getOrCreateClass = (targetName: string): Class => {
                const trimmed = targetName.trim();
                let found = Array.from(updatedClassesMap.values()).find(c => 
                    c.name.toLowerCase().trim() === trimmed.toLowerCase().trim()
                );

                if (!found && autoCreateClasses && trimmed) {
                    const newClassId = `class-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
                    found = {
                        id: newClassId,
                        institutionId: institutionId || 'uemol',
                        name: trimmed,
                        studentIds: [],
                        timetableId: '',
                        academicYear: '2024-2025'
                    };
                    updatedClassesMap.set(newClassId, found);
                    batchOperations.push({ collectionName: 'classes', id: newClassId, data: found });
                }

                if (!found) {
                    // Fallback to first existing class or default
                    found = Array.from(updatedClassesMap.values())[0] || {
                        id: `class-${Date.now()}`,
                        institutionId: institutionId || 'uemol',
                        name: 'Clase General',
                        studentIds: []
                    };
                    updatedClassesMap.set(found.id, found);
                }

                return found;
            };

            for (const row of validRows) {
                // Determine target class
                let targetClass: Class;
                if (selectedTargetClassId !== 'auto') {
                    targetClass = updatedClassesMap.get(selectedTargetClassId) || getOrCreateClass(row.className);
                } else {
                    targetClass = getOrCreateClass(row.className || 'Clase General');
                }

                const studentId = row.nationalId 
                    ? `std-${row.nationalId.replace(/[^a-zA-Z0-9]/g, '')}` 
                    : `std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

                // Parent management
                let parentId = `parent-${studentId}`;
                if (row.parentName || row.parentEmail) {
                    // Check if parent user with this email or name already exists
                    const existingParent = existingUsers.find(u => 
                        (row.parentEmail && u.email.toLowerCase() === row.parentEmail.toLowerCase()) ||
                        (row.parentName && u.name.toLowerCase() === row.parentName.toLowerCase() && u.role === Role.Parent)
                    );

                    if (existingParent) {
                        parentId = existingParent.id;
                    } else {
                        const newParent: User = {
                            id: parentId,
                            name: row.parentName || `Representante de ${row.name}`,
                            email: row.parentEmail || `rep_${studentId}@amauta.internal`,
                            password: 'password',
                            role: Role.Parent,
                            institutionId: institutionId || 'uemol',
                            childIds: [studentId],
                            phone: row.parentPhone || ''
                        };
                        newParentsList.push(newParent);
                        batchOperations.push({ collectionName: 'users', id: parentId, data: newParent });
                    }
                }

                const newStudent: Student = {
                    id: studentId,
                    institutionId: institutionId || 'uemol',
                    name: row.name,
                    classId: targetClass.id,
                    parentId: parentId,
                    nationalId: row.nationalId || undefined,
                    listNumber: row.listNumber,
                    gender: row.gender,
                    birthDate: row.birthDate || undefined,
                    phone: row.phone || undefined,
                    address: row.address || undefined,
                    photoUrl: `https://placehold.co/200x200/2563eb/white?text=${encodeURIComponent(row.name.charAt(0))}`
                };

                newStudentsList.push(newStudent);
                batchOperations.push({ collectionName: 'students', id: studentId, data: newStudent });

                // Link to Class studentIds
                if (!targetClass.studentIds.includes(studentId)) {
                    targetClass.studentIds.push(studentId);
                    batchOperations.push({ collectionName: 'classes', id: targetClass.id, data: targetClass });
                }
            }

            // Save in batches to Firestore
            await saveDocumentsBatch(batchOperations);

            const finalUpdatedClasses = Array.from(updatedClassesMap.values());
            onImportSuccess(newStudentsList, newParentsList, finalUpdatedClasses);

            setImportSuccessMessage(`¡Éxito! Se han importado ${newStudentsList.length} estudiantes correctamente y sincronizado en la base de datos.`);
            setTimeout(() => {
                onClose();
            }, 1800);
        } catch (err: any) {
            console.error('Error importando estudiantes:', err);
            alert(`Ocurrió un error al guardar los estudiantes: ${err?.message || 'Error desconocido'}`);
        } finally {
            setImporting(false);
        }
    };

    if (!isOpen) return null;

    const validCount = parsedRows.filter(r => r.isValid).length;
    const errorCount = parsedRows.length - validCount;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-scale-in">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-primary-700 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 rounded-xl">
                            <UsersIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Importación Masiva de Estudiantes</h2>
                            <p className="text-xs text-blue-100">Sube listas completas desde Excel (.xlsx, .xls) o Texto (.csv, .txt)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
                    <button 
                        onClick={() => setActiveTab('upload')} 
                        className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition border-b-2 ${activeTab === 'upload' ? 'bg-white text-blue-600 border-blue-600 shadow-xs' : 'text-slate-600 border-transparent hover:text-slate-900'}`}
                    >
                        1. Subir y Procesar Archivo
                    </button>
                    <button 
                        onClick={() => setActiveTab('guide')} 
                        className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition border-b-2 ${activeTab === 'guide' ? 'bg-white text-blue-600 border-blue-600 shadow-xs' : 'text-slate-600 border-transparent hover:text-slate-900'}`}
                    >
                        2. Estructura de Datos y Plantillas
                    </button>
                </div>

                <div className="p-6 max-h-[72vh] overflow-y-auto">
                    {/* TAB 1: UPLOAD */}
                    {activeTab === 'upload' && (
                        <div className="space-y-6">
                            {/* Download Template Banner */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                        📄 ¿Necesitas el formato exacto?
                                    </h4>
                                    <p className="text-xs text-blue-700 mt-0.5">
                                        Descarga la plantilla con encabezados listos y ejemplos de alumnos ecuatorianos.
                                    </p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button 
                                        type="button" 
                                        onClick={downloadExcelTemplate} 
                                        className="flex-1 sm:flex-none px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                                    >
                                        <span>📊</span> Descargar Excel (.xlsx)
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={downloadCsvTemplate} 
                                        className="flex-1 sm:flex-none px-3.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                                    >
                                        <span>📝</span> Descargar CSV (.csv / .txt)
                                    </button>
                                </div>
                            </div>

                            {/* Drop Zone */}
                            <div 
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'}`}
                            >
                                <div className="max-w-md mx-auto space-y-3">
                                    <div className="w-14 h-14 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                        📂
                                    </div>
                                    <div>
                                        <label htmlFor="student-file-input" className="cursor-pointer font-bold text-sm text-blue-600 hover:text-blue-800 hover:underline">
                                            Haz clic para seleccionar tu archivo
                                        </label>
                                        <p className="text-xs text-slate-500 mt-1">o arrástralo y suéltalo aquí directamente</p>
                                    </div>
                                    <p className="text-[11px] text-slate-400">Formatos admitidos: Microsoft Excel (.xlsx, .xls), CSV (.csv) o Texto delimitado (.txt)</p>
                                    <input 
                                        id="student-file-input" 
                                        type="file" 
                                        accept=".xlsx,.xls,.csv,.txt" 
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                    />
                                    {fileName && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                            ✓ Archivo cargado: {fileName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Configuration Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Curso Destino para la Importación:
                                    </label>
                                    <select 
                                        value={selectedTargetClassId} 
                                        onChange={(e) => setSelectedTargetClassId(e.target.value)} 
                                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="auto">🤖 Detectar automáticamente por la columna 'curso' en cada fila</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>
                                                Asignar todos a: {c.name} ({c.studentIds?.length || 0} alumnos actuales)
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Si eliges automático, cada estudiante se asignará al curso indicado en su fila.
                                    </p>
                                </div>

                                <div className="flex flex-col justify-center">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={autoCreateClasses} 
                                            onChange={(e) => setAutoCreateClasses(e.target.checked)} 
                                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        <span>Crear el curso automáticamente si no existe en el sistema</span>
                                    </label>
                                    <p className="text-[11px] text-slate-500 mt-1 ml-6">
                                        Si el archivo tiene cursos nuevos (ej. "8vo EGB B"), se crearán de inmediato en el centro.
                                    </p>
                                </div>
                            </div>

                            {/* Preview Table */}
                            {parsedRows.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-800">Vista Previa de Alumnos Detectados</span>
                                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                                                {validCount} listos
                                            </span>
                                            {errorCount > 0 && (
                                                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                                                    {errorCount} incompletos
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                        <table className="min-w-full divide-y divide-slate-200 text-xs">
                                            <thead className="bg-slate-100 sticky top-0 font-bold text-slate-700">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Nº</th>
                                                    <th className="px-3 py-2 text-left">Cédula</th>
                                                    <th className="px-3 py-2 text-left">Nombres y Apellidos</th>
                                                    <th className="px-3 py-2 text-left">Curso</th>
                                                    <th className="px-3 py-2 text-left">Género</th>
                                                    <th className="px-3 py-2 text-left">Representante</th>
                                                    <th className="px-3 py-2 text-left">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {parsedRows.map((row) => (
                                                    <tr key={row.index} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                                                        <td className="px-3 py-2 text-slate-500">{row.listNumber || row.index}</td>
                                                        <td className="px-3 py-2 font-mono text-slate-700">{row.nationalId || <span className="text-amber-500 italic">Temporal</span>}</td>
                                                        <td className="px-3 py-2 font-semibold text-slate-900">{row.name}</td>
                                                        <td className="px-3 py-2 text-slate-600">{row.className || 'Sin curso'}</td>
                                                        <td className="px-3 py-2 text-slate-600">{row.gender || '-'}</td>
                                                        <td className="px-3 py-2 text-slate-600">
                                                            {row.parentName || row.parentEmail || '-'}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {row.isValid ? (
                                                                <span className="text-emerald-600 font-semibold flex items-center gap-1">✓ Válido</span>
                                                            ) : (
                                                                <span className="text-red-500 font-semibold" title={row.errors.join(', ')}>⚠️ Incompleto</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {importSuccessMessage && (
                                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                                    <span>🎉</span> {importSuccessMessage}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: DATA STRUCTURE GUIDE */}
                    {activeTab === 'guide' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs">
                                <strong>💡 Recomendación importante:</strong> Puedes usar nombres de columnas en mayúsculas, minúsculas o con tildes. El importador inteligente de Amauta reconoce automáticamente sinónimos comunes (ej. <em>cédula</em>, <em>dni</em>, <em>identificación</em>, <em>estudiante</em>, <em>nombres</em>, <em>curso</em>).
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                <table className="min-w-full divide-y divide-slate-200 text-xs">
                                    <thead className="bg-slate-100 font-bold text-slate-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Columna</th>
                                            <th className="px-3 py-3 text-left">Obligatorio</th>
                                            <th className="px-4 py-3 text-left">Formato / Tipo</th>
                                            <th className="px-4 py-3 text-left">Ejemplo</th>
                                            <th className="px-4 py-3 text-left">Descripción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {DATA_STRUCTURE_GUIDE.map(item => (
                                            <tr key={item.field} className="hover:bg-slate-50">
                                                <td className="px-4 py-2.5 font-mono font-bold text-blue-700">{item.field}</td>
                                                <td className="px-3 py-2.5">
                                                    {item.required ? (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold text-[10px]">
                                                            Requerido
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px]">
                                                            Opcional
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-slate-600">{item.type}</td>
                                                <td className="px-4 py-2.5 font-mono text-slate-800 bg-slate-50/50">{item.example}</td>
                                                <td className="px-4 py-2.5 text-slate-600">{item.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={downloadExcelTemplate} 
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-2"
                                >
                                    <span>📊</span> Descargar Plantilla Oficial Excel
                                </button>
                                <button 
                                    type="button" 
                                    onClick={downloadCsvTemplate} 
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-2"
                                >
                                    <span>📝</span> Descargar Plantilla Oficial CSV/TXT
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={importing}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                    {activeTab === 'upload' && parsedRows.length > 0 && (
                        <button 
                            type="button" 
                            onClick={handleExecuteImport} 
                            disabled={validCount === 0 || importing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            {importing ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Importando a Firestore...</span>
                                </>
                            ) : (
                                <>
                                    <span>🚀</span>
                                    <span>Confirmar e Importar {validCount} Estudiante(s)</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentImportModal;
