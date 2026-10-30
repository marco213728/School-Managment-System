import React, { useState, useMemo } from 'react';
import { Class, Student, Subject, TextbookAssignment, CopyCondition, BibliographicItem, PhysicalCopy } from '../../types';
import { BookOpenIcon, QrCodeIcon, ShieldCheckIcon } from '../icons/Icons';
import { MobileScannerModal } from './MobileScannerModal';

interface TextbookBulkDistributorProps {
  classes: Class[];
  students: Student[];
  subjects: Subject[];
  textbookAssignments: TextbookAssignment[];
  onUpdateAssignments: (assignments: TextbookAssignment[]) => void;
  bibliographicItems: BibliographicItem[];
  physicalCopies: PhysicalCopy[];
  institutionId: string;
}

export const TextbookBulkDistributor: React.FC<TextbookBulkDistributorProps> = ({
  classes,
  students,
  subjects,
  textbookAssignments,
  onUpdateAssignments,
  bibliographicItems,
  physicalCopies,
  institutionId
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedBookId, setSelectedBookId] = useState<string>(
    bibliographicItems.find((b) => b.materialType === 'TEXTBOOK')?.id || bibliographicItems[0]?.id || ''
  );

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanningStudentId, setScanningStudentId] = useState<string | null>(null);

  // Return assessment state modal
  const [returningAssignment, setReturningAssignment] = useState<TextbookAssignment | null>(null);
  const [returnCondition, setReturnCondition] = useState<CopyCondition>('GOOD');
  const [damageFee, setDamageFee] = useState<number>(0);
  const [returnNotes, setReturnNotes] = useState<string>('');

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  const selectedSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId);
  }, [subjects, selectedSubjectId]);

  const selectedBook = useMemo(() => {
    return bibliographicItems.find((b) => b.id === selectedBookId);
  }, [bibliographicItems, selectedBookId]);

  // Existing assignments for this class and subject
  const currentClassAssignments = useMemo(() => {
    return textbookAssignments.filter(
      (a) => a.classId === selectedClassId && a.subjectId === selectedSubjectId
    );
  }, [textbookAssignments, selectedClassId, selectedSubjectId]);

  // Quick auto-assign sequential copies for all unassigned students
  const handleAutoAssignAll = () => {
    if (!selectedClass || !selectedSubject || !selectedBook) return;

    const availableCopies = physicalCopies.filter(
      (c) => c.bibliographicItemId === selectedBook.id && c.status === 'AVAILABLE'
    );

    const updated = [...textbookAssignments];
    let copyIdx = 0;

    classStudents.forEach((student) => {
      const alreadyAssigned = updated.find(
        (a) => a.classId === selectedClassId && a.subjectId === selectedSubjectId && a.studentId === student.id && a.status === 'ASSIGNED'
      );

      if (!alreadyAssigned) {
        const copy = availableCopies[copyIdx];
        const barcode = copy ? copy.barcode : `786${Date.now().toString().slice(-6)}${copyIdx + 1}`;
        const accNumber = copy ? copy.accessionNumber : `ACC-TXT-${Math.floor(1000 + Math.random() * 9000)}`;

        updated.push({
          id: `txt-assign-${Date.now()}-${student.id}`,
          institutionId,
          classId: selectedClass.id,
          className: selectedClass.name,
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
          studentId: student.id,
          studentName: student.name,
          studentIdentification: student.identification || student.nationalId || 'N/A',
          textbookTitle: selectedBook.title,
          textbookBarcode: barcode,
          textbookAccessionNumber: accNumber,
          checkoutCondition: copy ? copy.condition : 'NEW',
          assignedDate: new Date().toISOString(),
          status: 'ASSIGNED',
          notes: 'Despacho masivo de inicio de período'
        });
        copyIdx++;
      }
    });

    onUpdateAssignments(updated);
  };

  // Assign individual student using scanner or custom barcode
  const handleScanForStudent = (barcode: string) => {
    if (!scanningStudentId || !selectedClass || !selectedSubject || !selectedBook) return;
    const student = students.find((s) => s.id === scanningStudentId);
    if (!student) return;

    // Check if barcode belongs to a known copy
    const copy = physicalCopies.find((c) => c.barcode === barcode || c.accessionNumber === barcode || c.nfcUid === barcode);

    const newAssignment: TextbookAssignment = {
      id: `txt-assign-${Date.now()}-${student.id}`,
      institutionId,
      classId: selectedClass.id,
      className: selectedClass.name,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      studentId: student.id,
      studentName: student.name,
      studentIdentification: student.identification || student.nationalId || 'N/A',
      textbookTitle: selectedBook.title,
      textbookBarcode: barcode,
      textbookAccessionNumber: copy?.accessionNumber || `ACC-${barcode.slice(-5)}`,
      checkoutCondition: copy ? copy.condition : 'GOOD',
      assignedDate: new Date().toISOString(),
      status: 'ASSIGNED',
      notes: 'Asignación escaneada vía terminal móvil'
    };

    // Filter out previous assignment if any
    const filtered = textbookAssignments.filter(
      (a) => !(a.classId === selectedClassId && a.subjectId === selectedSubjectId && a.studentId === student.id && a.status === 'ASSIGNED')
    );

    onUpdateAssignments([...filtered, newAssignment]);
    setScanningStudentId(null);
  };

  // Process return and damage assessment
  const handleConfirmReturn = () => {
    if (!returningAssignment) return;

    const isDamaged = returnCondition === 'DAMAGED' || returnCondition === 'POOR';
    const isLost = returnCondition === 'DAMAGED' && damageFee >= 15;

    const updated = textbookAssignments.map((a) => {
      if (a.id === returningAssignment.id) {
        return {
          ...a,
          returnCondition,
          returnDate: new Date().toISOString(),
          damageFee: Number(damageFee) || 0,
          damageFeePaid: Number(damageFee) === 0,
          status: (isLost ? 'LOST' : isDamaged ? 'DAMAGED' : 'RETURNED') as any,
          notes: returnNotes ? `${a.notes ? a.notes + ' | ' : ''}Retorno: ${returnNotes}` : a.notes
        };
      }
      return a;
    });

    onUpdateAssignments(updated);
    setReturningAssignment(null);
    setDamageFee(0);
    setReturnNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Selectors Panel */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Distribución Masiva de Textos Escolares
              </h3>
              <p className="text-xs text-slate-500">
                Vinculada directamente a la nómina de estudiantes, cursos y asignaturas oficiales del plantel
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoAssignAll}
              disabled={classStudents.length === 0}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <span>⚡ Asignación Masiva Secuencial</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
            >
              <span>🖨️ Acta de Entrega</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              1. Seleccionar Curso / Paralelo
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              2. Asignatura Curricular
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              3. Título del Texto Escolar Asignado
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {bibliographicItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.materialType === 'TEXTBOOK' ? 'Texto Escolar' : 'Libro'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Roster & Distribution Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h4 className="font-semibold text-sm text-slate-800">
              Nómina de Estudiantes - {selectedClass?.name || 'Curso'} ({classStudents.length} estudiantes)
            </h4>
            <p className="text-xs text-slate-500">
              Materia: <span className="font-medium text-slate-700">{selectedSubject?.name}</span> | Texto: <span className="font-medium text-slate-700">{selectedBook?.title}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200">
              {currentClassAssignments.filter((a) => a.status === 'ASSIGNED').length} Asignados
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-semibold rounded-lg border border-amber-200">
              {classStudents.length - currentClassAssignments.filter((a) => a.status === 'ASSIGNED').length} Pendientes
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Estudiante / Cédula</th>
                <th className="py-3 px-4">Código de Barras / Ejemplar</th>
                <th className="py-3 px-4">Condición Entrega</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones de Despacho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((student, idx) => {
                const assignment = currentClassAssignments.find(
                  (a) => a.studentId === student.id && a.status === 'ASSIGNED'
                );
                const historicalReturn = currentClassAssignments.find(
                  (a) => a.studentId === student.id && (a.status === 'RETURNED' || a.status === 'DAMAGED' || a.status === 'LOST')
                );

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{student.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Cédula: {student.identification || student.nationalId || 'Sin registrar'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {assignment ? (
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-bold">
                            {assignment.textbookBarcode}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {assignment.textbookAccessionNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No asignado aún</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {assignment ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            assignment.checkoutCondition === 'NEW'
                              ? 'bg-emerald-100 text-emerald-800'
                              : assignment.checkoutCondition === 'GOOD'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {assignment.checkoutCondition === 'NEW'
                            ? '5 - Nuevo'
                            : assignment.checkoutCondition === 'GOOD'
                            ? '4 - Bueno'
                            : '3 - Regular'}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {assignment ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full text-[11px] border border-emerald-200">
                          <ShieldCheckIcon className="w-3.5 h-3.5" />
                          <span>En Custodia</span>
                        </span>
                      ) : historicalReturn ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px]">
                          <span>Devuelto ({historicalReturn.status})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded-full text-[11px]">
                          <span>Pendiente Despacho</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {assignment ? (
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setReturningAssignment(assignment);
                              setReturnCondition('GOOD');
                              setDamageFee(0);
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg transition"
                          >
                            Recepción Fin de Año
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setScanningStudentId(student.id);
                              setIsScannerOpen(true);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition"
                          >
                            <QrCodeIcon className="w-3.5 h-3.5" />
                            <span>Escanear Móvil</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return & Damage Assessment Modal */}
      {returningAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-slate-800">
                Recepción & Evaluación de Estado de Texto Escolar
              </h3>
              <p className="text-xs text-slate-500">
                Estudiante: <span className="font-semibold text-slate-700">{returningAssignment.studentName}</span>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Condición Física en la Recepción
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => {
                    const cond = e.target.value as CopyCondition;
                    setReturnCondition(cond);
                    if (cond === 'DAMAGED') setDamageFee(8.50);
                    else if (cond === 'POOR') setDamageFee(4.00);
                    else setDamageFee(0);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="NEW">5 - Excelente / Como nuevo</option>
                  <option value="GOOD">4 - Bueno (Desgaste natural de uso)</option>
                  <option value="FAIR">3 - Regular (Marcas leves de lápiz)</option>
                  <option value="POOR">2 - Malo (Páginas arrugadas / manchadas)</option>
                  <option value="DAMAGED">1 - Dañado / Mutilado (Páginas rotas o rayadas con tinta)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo por Daño / Pérdida ($USD)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={damageFee}
                  onChange={(e) => setDamageFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-rose-600 focus:ring-2 focus:ring-rose-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Si no hay daños negligentes, mantén el valor en $0.00.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones de Recepción
                </label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Ej: Faltan páginas 45-48 o forro en excelente estado..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setReturningAssignment(null)}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Confirmar Recepción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Scanner Modal Integration */}
      <MobileScannerModal
        isOpen={isScannerOpen}
        onClose={() => {
          setIsScannerOpen(false);
          setScanningStudentId(null);
        }}
        onScan={(code) => handleScanForStudent(code)}
        title="Escaneo de Texto Escolar para Estudiante"
        subtitle="Lee el código de barras o chip NFC del texto asignado"
        sampleCodes={physicalCopies
          .filter((c) => c.status === 'AVAILABLE')
          .slice(0, 3)
          .map((c) => ({
            code: c.barcode,
            label: `${c.barcode} (${c.accessionNumber})`,
            type: 'BARCODE' as const
          }))}
      />
    </div>
  );
};
