import React, { useState, useMemo } from 'react';
import {
  Role,
  User,
  Class,
  Student,
  Subject,
  BibliographicItem,
  PhysicalCopy,
  LibraryLoan,
  LibraryHold,
  TextbookAssignment,
  CopyCondition
} from '../../types';
import {
  BookOpenIcon,
  QrCodeIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  CloseIcon,
  TrashIcon,
  EditIcon
} from '../icons/Icons';
import { MobileScannerModal } from './MobileScannerModal';
import { CatalogEntryModal } from './CatalogEntryModal';
import { TextbookBulkDistributor } from './TextbookBulkDistributor';

interface LibraryPageProps {
  users: User[];
  classes: Class[];
  students: Student[];
  subjects: Subject[];
  institutionId: string;
  bibliographicItems?: BibliographicItem[];
  onUpdateBibliographicItems?: (items: BibliographicItem[]) => void;
  physicalCopies?: PhysicalCopy[];
  onUpdatePhysicalCopies?: (copies: PhysicalCopy[]) => void;
  loans?: LibraryLoan[];
  onUpdateLoans?: (loans: LibraryLoan[]) => void;
  holds?: LibraryHold[];
  onUpdateHolds?: (holds: LibraryHold[]) => void;
  textbookAssignments?: TextbookAssignment[];
  onUpdateTextbookAssignments?: (assignments: TextbookAssignment[]) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  users,
  classes,
  students,
  subjects,
  institutionId,
  bibliographicItems = [],
  onUpdateBibliographicItems = () => {},
  physicalCopies = [],
  onUpdatePhysicalCopies = () => {},
  loans = [],
  onUpdateLoans = () => {},
  holds = [],
  onUpdateHolds = () => {},
  textbookAssignments = [],
  onUpdateTextbookAssignments = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<'circulation' | 'catalog' | 'textbooks' | 'holds_fines' | 'analytics'>('circulation');

  // Scanner modal states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<'loan_book' | 'return_book' | 'student_id' | 'quick_lookup'>('loan_book');

  // Catalog modal
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  // Circulation Desk interactive inputs
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [copyCodeInput, setCopyCodeInput] = useState<string>('');
  const [loanDurationDays, setLoanDurationDays] = useState<number>(14);
  const [circulationFeedback, setCirculationFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Catalog search & filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogFilterType, setCatalogFilterType] = useState<string>('ALL');

  // Selected item detail view modal
  const [viewingItem, setViewingItem] = useState<BibliographicItem | null>(null);

  // Filter items by institution
  const tenantItems = useMemo(() => {
    return bibliographicItems.filter((i) => !i.institutionId || i.institutionId === institutionId);
  }, [bibliographicItems, institutionId]);

  const tenantCopies = useMemo(() => {
    return physicalCopies.filter((c) => !c.institutionId || c.institutionId === institutionId);
  }, [physicalCopies, institutionId]);

  const tenantLoans = useMemo(() => {
    return loans.filter((l) => !l.institutionId || l.institutionId === institutionId);
  }, [loans, institutionId]);

  const tenantHolds = useMemo(() => {
    return holds.filter((h) => !h.institutionId || h.institutionId === institutionId);
  }, [holds, institutionId]);

  // Business day overdue calculator (excludes weekends)
  const calculateOverdueDaysAndFine = (dueDateStr: string, returnDateStr?: string) => {
    const due = new Date(dueDateStr);
    const end = returnDateStr ? new Date(returnDateStr) : new Date();

    if (end <= due) return { overdueDays: 0, fine: 0 };

    let businessDays = 0;
    const cur = new Date(due);
    cur.setDate(cur.getDate() + 1);

    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    const fine = Math.round(businessDays * 0.5 * 100) / 100; // $0.50 per business day
    return { overdueDays: businessDays, fine };
  };

  // Perform quick loan
  const handlePerformLoan = (targetStudentId: string, copyCode: string) => {
    setCirculationFeedback(null);
    const student = students.find((s) => s.id === targetStudentId);
    if (!student) {
      setCirculationFeedback({ type: 'error', message: 'Selecciona o escanea un estudiante válido.' });
      return;
    }

    // Check if student has unpaid overdue fines > $5.00
    const studentUnpaidFines = tenantLoans
      .filter((l) => l.studentId === student.id && !l.finePaid && l.fineAmount > 0)
      .reduce((sum, l) => sum + l.fineAmount, 0);

    if (studentUnpaidFines >= 5.0) {
      setCirculationFeedback({
        type: 'error',
        message: `El estudiante tiene multas acumuladas por $${studentUnpaidFines.toFixed(2)}. Debe saldarlas antes de un nuevo préstamo.`
      });
      return;
    }

    // Find physical copy by barcode, accession number, or NFC UID
    const copy = tenantCopies.find(
      (c) =>
        c.barcode === copyCode.trim() ||
        c.accessionNumber.toLowerCase() === copyCode.trim().toLowerCase() ||
        (c.nfcUid && c.nfcUid.toLowerCase() === copyCode.trim().toLowerCase())
    );

    if (!copy) {
      setCirculationFeedback({
        type: 'error',
        message: `No se encontró ningún ejemplar con el código "${copyCode}". Verifica el inventario.`
      });
      return;
    }

    if (copy.status !== 'AVAILABLE') {
      setCirculationFeedback({
        type: 'error',
        message: `El ejemplar ${copy.accessionNumber} no está disponible (Estado actual: ${copy.status}).`
      });
      return;
    }

    if (copy.isReferenceOnly) {
      setCirculationFeedback({
        type: 'error',
        message: `El ejemplar ${copy.accessionNumber} es de consulta exclusiva en sala (Referencia).`
      });
      return;
    }

    const book = tenantItems.find((b) => b.id === copy.bibliographicItemId);
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDurationDays);

    const newLoan: LibraryLoan = {
      id: `loan-${Date.now()}`,
      institutionId,
      copyId: copy.id,
      bibliographicItemId: copy.bibliographicItemId,
      accessionNumber: copy.accessionNumber,
      barcode: copy.barcode,
      bookTitle: book?.title || 'Libro del Catálogo',
      studentId: student.id,
      studentName: student.name,
      studentGrade: classes.find((c) => c.id === student.classId)?.name || 'Bachillerato',
      borrowDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'ACTIVE',
      renewalCount: 0,
      fineAmount: 0,
      finePaid: true,
      handledByUserName: 'Lic. Martha Zambrano (Bibliotecaria)'
    };

    // Update copy status
    const updatedCopies = tenantCopies.map((c) => (c.id === copy.id ? { ...c, status: 'BORROWED' as const } : c));
    onUpdatePhysicalCopies(updatedCopies);

    // Update available count in bibliographic item
    if (book) {
      const updatedItems = tenantItems.map((b) =>
        b.id === book.id ? { ...b, availableCopiesCount: Math.max(0, b.availableCopiesCount - 1) } : b
      );
      onUpdateBibliographicItems(updatedItems);
    }

    onUpdateLoans([newLoan, ...tenantLoans]);
    setCopyCodeInput('');
    setCirculationFeedback({
      type: 'success',
      message: `Préstamo registrado exitosamente para ${student.name}. Fecha de devolución: ${dueDate.toLocaleDateString('es-EC')}.`
    });
  };

  // Perform quick return
  const handlePerformReturn = (copyCode: string, returnCondition: CopyCondition = 'GOOD') => {
    setCirculationFeedback(null);
    const cleanCode = copyCode.trim().toLowerCase();

    // Find active or overdue loan with this copy
    const targetLoan = tenantLoans.find(
      (l) =>
        (l.status === 'ACTIVE' || l.status === 'OVERDUE') &&
        (l.barcode.toLowerCase() === cleanCode ||
          l.accessionNumber.toLowerCase() === cleanCode ||
          tenantCopies.find((c) => c.id === l.copyId && c.nfcUid?.toLowerCase() === cleanCode))
    );

    if (!targetLoan) {
      setCirculationFeedback({
        type: 'error',
        message: `No hay un préstamo activo o vencido registrado para el código "${copyCode}".`
      });
      return;
    }

    const { fine } = calculateOverdueDaysAndFine(targetLoan.dueDate);
    const returnIso = new Date().toISOString();

    const updatedLoans = tenantLoans.map((l) => {
      if (l.id === targetLoan.id) {
        return {
          ...l,
          returnDate: returnIso,
          status: 'RETURNED' as const,
          fineAmount: fine,
          finePaid: fine === 0,
          returnedCondition: returnCondition
        };
      }
      return l;
    });

    // Update copy status back to AVAILABLE
    const updatedCopies = tenantCopies.map((c) =>
      c.id === targetLoan.copyId ? { ...c, status: 'AVAILABLE' as const, condition: returnCondition } : c
    );
    onUpdatePhysicalCopies(updatedCopies);

    // Check if there is an active hold for this bibliographic item
    const pendingHold = tenantHolds.find(
      (h) => h.bibliographicItemId === targetLoan.bibliographicItemId && h.status === 'WAITING'
    );

    if (pendingHold) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 2); // 48h to pick up
      const updatedHolds = tenantHolds.map((h) =>
        h.id === pendingHold.id
          ? { ...h, status: 'READY_FOR_PICKUP' as const, pickupExpiresAt: expiry.toISOString() }
          : h
      );
      onUpdateHolds(updatedHolds);
    } else {
      // Increment available copies count
      const updatedItems = tenantItems.map((b) =>
        b.id === targetLoan.bibliographicItemId
          ? { ...b, availableCopiesCount: Math.min(b.copiesCount, b.availableCopiesCount + 1) }
          : b
      );
      onUpdateBibliographicItems(updatedItems);
    }

    onUpdateLoans(updatedLoans);
    setCopyCodeInput('');
    setCirculationFeedback({
      type: 'success',
      message: `Ejemplar "${targetLoan.bookTitle}" devuelto correctamente por ${targetLoan.studentName}.${
        fine > 0 ? ` Multa generada: $${fine.toFixed(2)}.` : ''
      }`
    });
  };

  // Renew loan
  const handleRenewLoan = (loanId: string) => {
    const updated = tenantLoans.map((l) => {
      if (l.id === loanId) {
        if (l.renewalCount >= 2) {
          alert('Este préstamo ya ha alcanzado el límite máximo de 2 renovaciones permitidas.');
          return l;
        }
        const curDue = new Date(l.dueDate);
        curDue.setDate(curDue.getDate() + 7);
        return {
          ...l,
          dueDate: curDue.toISOString(),
          renewalCount: l.renewalCount + 1,
          status: 'ACTIVE' as const
        };
      }
      return l;
    });
    onUpdateLoans(updated);
  };

  // Pay fine
  const handlePayFine = (loanId: string) => {
    const updated = tenantLoans.map((l) => (l.id === loanId ? { ...l, finePaid: true } : l));
    onUpdateLoans(updated);
    alert('Multa registrada como pagada. Comprobante contable generado.');
  };

  // Save newly cataloged title
  const handleSaveCatalogItem = (newItem: BibliographicItem, newCopies: PhysicalCopy[]) => {
    onUpdateBibliographicItems([newItem, ...tenantItems]);
    onUpdatePhysicalCopies([...tenantCopies, ...newCopies]);
    setCirculationFeedback({
      type: 'success',
      message: `Título "${newItem.title}" catalogado con éxito (${newCopies.length} copias físicas agregadas al inventario).`
    });
  };

  // Filtered catalog list
  const filteredCatalog = useMemo(() => {
    return tenantItems.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.author.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.isbn.includes(catalogSearch) ||
        item.deweyDecimal.includes(catalogSearch) ||
        item.subjectHeadings.some((s) => s.toLowerCase().includes(catalogSearch.toLowerCase()));

      const matchType = catalogFilterType === 'ALL' || item.materialType === catalogFilterType;
      return matchSearch && matchType;
    });
  }, [tenantItems, catalogSearch, catalogFilterType]);

  // Overall analytics
  const activeLoansCount = tenantLoans.filter((l) => l.status === 'ACTIVE').length;
  const overdueLoansCount = tenantLoans.filter((l) => l.status === 'OVERDUE').length;
  const totalFinesCollected = tenantLoans
    .filter((l) => l.finePaid && l.fineAmount > 0)
    .reduce((sum, l) => sum + l.fineAmount, 0);
  const totalPendingFines = tenantLoans
    .filter((l) => !l.finePaid && l.fineAmount > 0)
    .reduce((sum, l) => sum + l.fineAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold tracking-wide border border-indigo-400/30">
              <BuildingLibraryIcon className="w-4 h-4" />
              <span>Sistema de Gestión de Biblioteca Escolar (SLMS)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Biblioteca & Centro de Recursos de Aprendizaje
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consola institucional para bibliotecarios: control de circulación en tiempo real, catalogación MARC21/Dewey,
              lectura óptica y NFC en dispositivos móviles, y despacho masivo de textos escolares por curso.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setScannerPurpose('loan_book');
                setIsScannerOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition"
            >
              <QrCodeIcon className="w-4 h-4" />
              <span>Terminal Escáner Móvil</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCatalogModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition"
            >
              <BookOpenIcon className="w-4 h-4" />
              <span>Catalogar MARC21</span>
            </button>
          </div>
        </div>

        {/* Quick KPI ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Títulos Catalogados</span>
            <span className="text-xl font-bold text-white">{tenantItems.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {tenantCopies.length} ejemplares físicos
            </span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Préstamos Activos</span>
            <span className="text-xl font-bold text-indigo-300">{activeLoansCount}</span>
            <span className="text-[10px] text-indigo-400 block mt-0.5">En circulación escolar</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Préstamos Vencidos</span>
            <span className="text-xl font-bold text-rose-400">{overdueLoansCount}</span>
            <span className="text-[10px] text-rose-300 block mt-0.5">Requieren notificación</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-slate-400 block text-[11px]">Multas por Cobrar</span>
            <span className="text-xl font-bold text-amber-300">${totalPendingFines.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Cobrado: ${totalFinesCollected.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('circulation')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
            activeTab === 'circulation'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>🏷️ Mesa de Circulación</span>
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
            activeTab === 'catalog'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>📚 Catálogo & Inventario</span>
        </button>
        <button
          onClick={() => setActiveTab('textbooks')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
            activeTab === 'textbooks'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>🎒 Distribución Masiva de Textos</span>
        </button>
        <button
          onClick={() => setActiveTab('holds_fines')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
            activeTab === 'holds_fines'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>⏳ Reservas & Sanciones</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>📊 Analíticas de Lectura</span>
        </button>
      </div>

      {/* Circulation Feedback Alert */}
      {circulationFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            circulationFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : circulationFeedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>
              {circulationFeedback.type === 'success' ? '✅' : circulationFeedback.type === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            <span>{circulationFeedback.message}</span>
          </div>
          <button
            onClick={() => setCirculationFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-full"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: CIRCULATION DESK */}
      {activeTab === 'circulation' && (
        <div className="space-y-6">
          {/* Quick Transaction Action Box */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center space-x-2">
              <span>⚡ Terminal de Préstamos y Devoluciones Rápidas</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              {/* Student Selector / Scan */}
              <div className="lg:col-span-5 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Estudiante / Lector Solicitante
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- Seleccionar de la nómina escolar --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({classes.find((c) => c.id === st.classId)?.name || 'Estudiante'})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setScannerPurpose('student_id');
                      setIsScannerOpen(true);
                    }}
                    title="Escanear carnet o carnet NFC del estudiante"
                    className="px-3 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl border border-slate-200 text-slate-700 transition"
                  >
                    <QrCodeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Barcode / NFC Copy Input */}
              <div className="lg:col-span-4 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Código de Barras / NFC del Ejemplar
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={copyCodeInput}
                    onChange={(e) => setCopyCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && copyCodeInput.trim()) {
                        if (selectedStudentId) {
                          handlePerformLoan(selectedStudentId, copyCodeInput);
                        } else {
                          handlePerformReturn(copyCodeInput);
                        }
                      }
                    }}
                    placeholder="Escanear o ingresar código..."
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setScannerPurpose('loan_book');
                      setIsScannerOpen(true);
                    }}
                    title="Abrir cámara móvil / NFC"
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition"
                  >
                    <QrCodeIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="lg:col-span-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePerformLoan(selectedStudentId, copyCodeInput)}
                  disabled={!selectedStudentId || !copyCodeInput.trim()}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40"
                >
                  Registrar Préstamo
                </button>
                <button
                  type="button"
                  onClick={() => handlePerformReturn(copyCodeInput)}
                  disabled={!copyCodeInput.trim()}
                  className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40"
                >
                  Registrar Devolución
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <span>Plazo estándar de préstamo:</span>
                <select
                  value={loanDurationDays}
                  onChange={(e) => setLoanDurationDays(Number(e.target.value))}
                  className="px-2 py-0.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                >
                  <option value={7}>7 días (1 semana)</option>
                  <option value={14}>14 días (2 semanas - Estándar)</option>
                  <option value={21}>21 días (3 semanas)</option>
                  <option value={30}>30 días (1 mes)</option>
                </select>
              </div>
              <span className="text-slate-400">
                Regla institucional: Multa de $0.50 por día hábil de retraso (sábados y domingos exentos).
              </span>
            </div>
          </div>

          {/* Active & Overdue Loans Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="font-semibold text-sm text-slate-800">
                Préstamos Vigentes & En Mora ({tenantLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE').length})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Ejemplar / Título</th>
                    <th className="py-3 px-4">Estudiante / Grado</th>
                    <th className="py-3 px-4">Fecha Salida</th>
                    <th className="py-3 px-4">Vencimiento</th>
                    <th className="py-3 px-4">Estado & Multa</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenantLoans
                    .filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE')
                    .map((loan) => {
                      const { overdueDays, fine } = calculateOverdueDaysAndFine(loan.dueDate);
                      const isOverdue = overdueDays > 0;

                      return (
                        <tr key={loan.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{loan.bookTitle}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Cód: {loan.barcode} | {loan.accessionNumber}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800">{loan.studentName}</div>
                            <div className="text-[11px] text-slate-400">{loan.studentGrade}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {new Date(loan.borrowDate).toLocaleDateString('es-EC')}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-semibold ${
                                isOverdue ? 'text-rose-600 underline' : 'text-slate-700'
                              }`}
                            >
                              {new Date(loan.dueDate).toLocaleDateString('es-EC')}
                            </span>
                            {isOverdue && (
                              <span className="block text-[10px] text-rose-500">
                                {overdueDays} días hábiles tarde
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isOverdue ? (
                              <div className="space-y-0.5">
                                <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                                  VENCIDO
                                </span>
                                <span className="block font-mono text-rose-700 font-bold">
                                  Multa: ${fine.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                                ACTIVO ({loan.renewalCount} renov.)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handlePerformReturn(loan.barcode)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold transition"
                            >
                              Devolver
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRenewLoan(loan.id)}
                              disabled={isOverdue || loan.renewalCount >= 2}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition disabled:opacity-40"
                              title="Renovar 7 días más"
                            >
                              +7d
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {tenantLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE').length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No hay libros en circulación actualmente. Todos los ejemplares están en sala.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG & INVENTORY */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full flex items-center space-x-3">
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Buscar por título, autor, ISBN, Dewey o descriptor temático..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <select
                value={catalogFilterType}
                onChange={(e) => setCatalogFilterType(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="ALL">Todos los materiales</option>
                <option value="GENERAL_BOOK">Libro General</option>
                <option value="TEXTBOOK">Texto Escolar</option>
                <option value="REFERENCE">Referencia</option>
                <option value="PERIODICAL">Periódico / Revista</option>
                <option value="MULTIMEDIA">Multimedia</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsCatalogModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition whitespace-nowrap"
            >
              + Nuevo Título MARC21
            </button>
          </div>

          {/* Catalog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((item) => {
              const copies = tenantCopies.filter((c) => c.bibliographicItemId === item.id);
              const available = copies.filter((c) => c.status === 'AVAILABLE').length;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <div className="flex p-4 gap-4 flex-1">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-20 h-28 object-cover rounded-lg shadow-sm border border-slate-200 bg-slate-100 flex-shrink-0"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold rounded">
                          CDD {item.deweyDecimal}
                        </span>
                        {item.lexileLevel && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold rounded">
                            {item.lexileLevel}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{item.author}</p>
                      <p className="text-[11px] text-slate-400 font-mono">ISBN: {item.isbn}</p>
                      {item.acceleratedReader && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block font-medium">
                          AR ATOS {item.acceleratedReader.atosLevel} | {item.acceleratedReader.points} pts
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges / Subject Tags */}
                  <div className="px-4 pb-3 flex flex-wrap gap-1">
                    {item.subjectHeadings.slice(0, 3).map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold ${
                        available > 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {available} / {copies.length || item.copiesCount} disponibles
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewingItem(item)}
                      className="px-2.5 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg font-medium transition"
                    >
                      Ver Ficha MARC21
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TEXTBOOKS BULK DISTRIBUTION */}
      {activeTab === 'textbooks' && (
        <TextbookBulkDistributor
          classes={classes}
          students={students}
          subjects={subjects}
          textbookAssignments={textbookAssignments}
          onUpdateAssignments={onUpdateTextbookAssignments}
          bibliographicItems={tenantItems}
          physicalCopies={tenantCopies}
          institutionId={institutionId}
        />
      )}

      {/* TAB 4: HOLDS & FINES LEDGER */}
      {activeTab === 'holds_fines' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FIFO Holds Queue */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="font-semibold text-sm text-slate-800">
                Cola FIFO de Reservas ({tenantHolds.filter((h) => h.status !== 'CANCELLED').length})
              </h4>
            </div>

            <div className="divide-y divide-slate-100">
              {tenantHolds
                .filter((h) => h.status !== 'CANCELLED')
                .map((hold) => (
                  <div key={hold.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          {hold.queuePosition}
                        </span>
                        <h5 className="font-semibold text-xs text-slate-800">{hold.bookTitle}</h5>
                      </div>
                      <p className="text-xs text-slate-500">
                        {hold.studentName} ({hold.studentGrade})
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Solicitado el {new Date(hold.requestDate).toLocaleDateString('es-EC')}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          hold.status === 'READY_FOR_PICKUP'
                            ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {hold.status === 'READY_FOR_PICKUP' ? 'Listo en Mostrador' : 'En Espera'}
                      </span>
                      {hold.pickupExpiresAt && (
                        <p className="text-[10px] text-rose-500">
                          Vence: {new Date(hold.pickupExpiresAt).toLocaleDateString('es-EC')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              {tenantHolds.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  No hay reservas activas en espera.
                </div>
              )}
            </div>
          </div>

          {/* Fines Ledger */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="font-semibold text-sm text-slate-800">
                Libro Mayor de Multas & Sanciones
              </h4>
            </div>

            <div className="divide-y divide-slate-100">
              {tenantLoans
                .filter((l) => l.fineAmount > 0)
                .map((loan) => (
                  <div key={loan.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-semibold text-xs text-slate-800">{loan.studentName}</div>
                      <div className="text-[11px] text-slate-500">{loan.bookTitle}</div>
                      <div className="text-[10px] text-slate-400">
                        Vencido el {new Date(loan.dueDate).toLocaleDateString('es-EC')}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-mono font-bold text-sm text-slate-800">
                        ${loan.fineAmount.toFixed(2)}
                      </div>
                      {loan.finePaid ? (
                        <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                          PAGADO
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePayFine(loan.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold shadow-sm transition"
                        >
                          Cobrar $ {loan.fineAmount.toFixed(2)}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              {tenantLoans.filter((l) => l.fineAmount > 0).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  Sin multas registradas en la institución.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: READING ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h4 className="font-bold text-sm text-slate-800">Distribución por Bandas Lexile</h4>
              <p className="text-xs text-slate-500">
                Alineación del acervo bibliográfico con los niveles de lectura institucional:
              </p>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Inicial (400L - 600L)</span>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[20%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Intermedio (600L - 900L)</span>
                    <span className="font-bold">55%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full w-[55%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Avanzado / Bachillerato (900L+)</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full w-[25%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h4 className="font-bold text-sm text-slate-800">Títulos Más Solicitados</h4>
              <div className="divide-y divide-slate-100 text-xs">
                {tenantItems.slice(0, 4).map((book, idx) => (
                  <div key={book.id} className="py-2 flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="font-bold text-slate-700 mr-1.5">{idx + 1}.</span>
                      <span className="text-slate-800">{book.title}</span>
                    </div>
                    <span className="text-indigo-600 font-bold whitespace-nowrap">
                      {book.copiesCount - book.availableCopiesCount} préstamos
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h4 className="font-bold text-sm text-slate-800">Resumen de Inventario</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-600">Total Ejemplares Registrados:</span>
                  <span className="font-bold text-slate-800">{tenantCopies.length}</span>
                </div>
                <div className="flex justify-between p-2 bg-emerald-50 text-emerald-800 rounded-lg">
                  <span>En Estantería (Disponibles):</span>
                  <span className="font-bold">
                    {tenantCopies.filter((c) => c.status === 'AVAILABLE').length}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-indigo-50 text-indigo-800 rounded-lg">
                  <span>En Préstamo Estudiantil:</span>
                  <span className="font-bold">
                    {tenantCopies.filter((c) => c.status === 'BORROWED').length}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-amber-50 text-amber-800 rounded-lg">
                  <span>En Mantenimiento / Reparación:</span>
                  <span className="font-bold">
                    {tenantCopies.filter((c) => c.status === 'MAINTENANCE').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MARC21 Full Detail Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">
                  Ficha Bibliográfica MARC21 Oficial
                </h3>
                <p className="text-xs text-slate-500 font-mono">Registro ID: {viewingItem.id}</p>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto max-h-80">
              <p>LEADER 01242nam a2200301 a 4500</p>
              <p>001 {viewingItem.id}</p>
              <p>020 $a {viewingItem.isbn}</p>
              <p>082 04 $a {viewingItem.deweyDecimal}</p>
              <p>100 1# $a {viewingItem.author}</p>
              <p>245 10 $a {viewingItem.title} {viewingItem.subtitle ? `$b ${viewingItem.subtitle}` : ''}</p>
              <p>260 ## $b {viewingItem.publisher || 'Editorial no especificada'} $c {viewingItem.publicationYear || 2024}</p>
              <p>300 ## $a {viewingItem.physicalDescription || 'Páginas no descritas'}</p>
              {viewingItem.subjectHeadings.map((sub, idx) => (
                <p key={idx}>650 #4 $a {sub}</p>
              ))}
              {viewingItem.lexileLevel && <p>521 8# $a Lexile: {viewingItem.lexileLevel}</p>}
              {viewingItem.acceleratedReader && (
                <p>
                  526 0# $a Accelerated Reader $b ATOS {viewingItem.acceleratedReader.atosLevel} $c {viewingItem.acceleratedReader.points} pts $d Quiz {viewingItem.acceleratedReader.quizNumber}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Entry Modal */}
      <CatalogEntryModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        onSave={handleSaveCatalogItem}
        institutionId={institutionId}
      />

      {/* Mobile Scanner Modal for Circulation */}
      <MobileScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code, hardwareType) => {
          if (scannerPurpose === 'student_id') {
            const matchedStudent = students.find(
              (s) => s.identification === code || s.nationalId === code || s.id === code
            );
            if (matchedStudent) {
              setSelectedStudentId(matchedStudent.id);
              setCirculationFeedback({
                type: 'info',
                message: `Lector detectado: ${matchedStudent.name} (${hardwareType}). Ahora pistolea el libro.`
              });
            } else {
              setCirculationFeedback({
                type: 'error',
                message: `Código "${code}" no coincide con la cédula de ningún estudiante registrado.`
              });
            }
          } else {
            setCopyCodeInput(code);
            if (selectedStudentId) {
              handlePerformLoan(selectedStudentId, code);
            } else {
              handlePerformReturn(code);
            }
          }
        }}
        title={scannerPurpose === 'student_id' ? 'Escanear Carnet Estudiantil' : 'Terminal Escáner de Ejemplar'}
        subtitle="Cámara de teléfono móvil, tarjeta NFC o pistola USB/Bluetooth"
        sampleCodes={[
          ...tenantCopies.slice(0, 3).map((c) => ({
            code: c.barcode,
            label: `${c.barcode} (${c.accessionNumber})`,
            type: 'BARCODE' as const
          })),
          ...(tenantCopies.find((c) => c.nfcUid)
            ? [
                {
                  code: tenantCopies.find((c) => c.nfcUid)!.nfcUid!,
                  label: `NFC: ${tenantCopies.find((c) => c.nfcUid)!.nfcUid!}`,
                  type: 'NFC' as const
                }
              ]
            : [])
        ]}
      />
    </div>
  );
};

export default LibraryPage;
