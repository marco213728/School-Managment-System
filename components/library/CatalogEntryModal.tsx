import React, { useState } from 'react';
import { CloseIcon, BookOpenIcon } from '../icons/Icons';
import { BibliographicItem, PhysicalCopy, LibraryMaterialType, CopyCondition } from '../../types';

interface CatalogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: BibliographicItem, newCopies: PhysicalCopy[]) => void;
  institutionId: string;
}

export const CatalogEntryModal: React.FC<CatalogEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  institutionId
}) => {
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState<number>(2025);
  const [edition, setEdition] = useState('');
  const [deweyDecimal, setDeweyDecimal] = useState('863');
  const [physicalDescription, setPhysicalDescription] = useState('250 p. ; 21 cm');
  const [subjectHeadingsInput, setSubjectHeadingsInput] = useState('');
  const [lexileLevel, setLexileLevel] = useState('');
  const [atosLevel, setAtosLevel] = useState<number>(0);
  const [arPoints, setArPoints] = useState<number>(0);
  const [arQuizNumber, setArQuizNumber] = useState('');
  const [materialType, setMaterialType] = useState<LibraryMaterialType>('GENERAL_BOOK');
  const [summary, setSummary] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Physical copies generation
  const [initialCopiesCount, setInitialCopiesCount] = useState<number>(3);
  const [initialShelfLocation, setInitialShelfLocation] = useState('ESTANTE-GEN-01');
  const [initialCondition, setInitialCondition] = useState<CopyCondition>('NEW');
  const [replacementCost, setReplacementCost] = useState<number>(15.00);

  // Quick lookup simulation by ISBN
  const handleIsbnLookup = () => {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    if (cleanIsbn.includes('9789978') || cleanIsbn.includes('9789942') || cleanIsbn.length >= 10) {
      // Simulate MARC21 auto-fetch
      setTitle('Don Quijote de la Mancha: Adaptación Escolar Juvenil');
      setAuthor('Miguel de Cervantes Saavedra');
      setPublisher('Editorial Santillana Ecuador');
      setPublicationYear(2024);
      setDeweyDecimal('863.3');
      setLexileLevel('820L');
      setAtosLevel(5.6);
      setArPoints(9.0);
      setArQuizNumber('ES-1029');
      setSubjectHeadingsInput('Literatura Clásica, Siglo de Oro, Novela de Caballería, Lectura Guiada');
      setSummary('Adaptación anotada y con vocabulario pedagógico para estudiantes de Educación General Básica y Bachillerato.');
      setCoverUrl('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const itemId = `bib-${Date.now()}`;
    const subjects = subjectHeadingsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newItem: BibliographicItem = {
      id: itemId,
      institutionId,
      isbn: isbn.trim() || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      author: author.trim(),
      publisher: publisher.trim() || undefined,
      publicationYear: Number(publicationYear) || undefined,
      edition: edition.trim() || undefined,
      deweyDecimal: deweyDecimal.trim() || '000',
      physicalDescription: physicalDescription.trim() || undefined,
      subjectHeadings: subjects.length > 0 ? subjects : ['General'],
      lexileLevel: lexileLevel.trim() || undefined,
      acceleratedReader:
        atosLevel > 0
          ? {
              atosLevel,
              points: arPoints,
              quizNumber: arQuizNumber.trim() || 'N/A'
            }
          : undefined,
      materialType,
      coverUrl:
        coverUrl.trim() ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      summary: summary.trim() || undefined,
      copiesCount: initialCopiesCount,
      availableCopiesCount: initialCopiesCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Generate physical copies
    const generatedCopies: PhysicalCopy[] = [];
    const baseSequential = Math.floor(10000 + Math.random() * 89999);
    for (let i = 1; i <= initialCopiesCount; i++) {
      const copySeq = baseSequential + i;
      generatedCopies.push({
        id: `copy-${itemId}-${i}`,
        bibliographicItemId: itemId,
        institutionId,
        accessionNumber: `ACC-${copySeq}`,
        barcode: `786${copySeq}${i}`,
        nfcUid: `04:${(Math.random() * 0xff).toString(16).slice(0, 2).toUpperCase()}:${(Math.random() * 0xff).toString(16).slice(0, 2).toUpperCase()}:${(Math.random() * 0xff).toString(16).slice(0, 2).toUpperCase()}`,
        shelfLocation: initialShelfLocation.trim() || 'ESTANTE-GEN-01',
        condition: initialCondition,
        status: 'AVAILABLE',
        isReferenceOnly: materialType === 'REFERENCE',
        replacementCost
      });
    }

    onSave(newItem, generatedCopies);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300">
              <BookOpenIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Catalogación Bibliográfica & Alta de Ejemplares</h3>
              <p className="text-xs text-indigo-200">
                Formato estándar MARC21 con clasificación Dewey, Lexile y registro de inventario físico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick ISBN Search Row */}
          <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-indigo-900 mb-1">
                ISBN (MARC Tag 020) - Autocompletado Bibliográfico
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="Ej: 978-9978809426 (Ingresa ISBN para autocompletar)"
                  className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleIsbnLookup}
                  className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
                >
                  Consultar ISBN
                </button>
              </div>
            </div>
            <span className="text-[11px] text-indigo-600 italic sm:w-48 text-right">
              Consulta bases bibliográficas MinEduc y CERLALC
            </span>
          </div>

          {/* Section 1: Core Bibliographic Data */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b pb-1">
              1. Ficha Bibliográfica Principal (MARC21)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título Principal * (Tag 245 $a)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: La Emancipada"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtítulo / Mención de Responsabilidad (Tag 245 $b)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ej: Novela costumbrista ecuatoriana"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Autor Principal * (Tag 100 $a)
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ej: Miguel Riofrío"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Editorial / Pie de Imprenta (Tag 260 $b)
                </label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Ej: Libresa / Universidad Andina"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Año Publicación (Tag 260 $c)
                  </label>
                  <input
                    type="number"
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Material
                  </label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value as LibraryMaterialType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="GENERAL_BOOK">Libro General</option>
                    <option value="TEXTBOOK">Texto Escolar Curricular</option>
                    <option value="REFERENCE">Referencia / Consulta en Sala</option>
                    <option value="PERIODICAL">Periódico / Revista</option>
                    <option value="MULTIMEDIA">Material Multimedia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clasificación Dewey * (Tag 082 $a)
                </label>
                <input
                  type="text"
                  required
                  value={deweyDecimal}
                  onChange={(e) => setDeweyDecimal(e.target.value)}
                  placeholder="Ej: 863.5 (Novela), 510 (Matemática)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción Física (Tag 300 $a)
                </label>
                <input
                  type="text"
                  value={physicalDescription}
                  onChange={(e) => setPhysicalDescription(e.target.value)}
                  placeholder="Ej: 180 p. ; 20 cm"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Materias / Descriptores Temáticos (Tag 650 $a) - Separados por comas
                </label>
                <input
                  type="text"
                  value={subjectHeadingsInput}
                  onChange={(e) => setSubjectHeadingsInput(e.target.value)}
                  placeholder="Ej: Novela Ecuatoriana, Siglo XIX, Derechos de la Mujer, Literatura"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resumen / Sinopsis Pedagógica (Tag 520 $a)
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Breve reseña orientada al plan lector institucional..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pedagogical & Reading Frameworks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b pb-1">
              2. Metadatos de Lectoescritura (Lexile & Accelerated Reader)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nivel Lexile
                </label>
                <input
                  type="text"
                  value={lexileLevel}
                  onChange={(e) => setLexileLevel(e.target.value)}
                  placeholder="Ej: 750L"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nivel ATOS (AR)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={atosLevel || ''}
                  onChange={(e) => setAtosLevel(Number(e.target.value))}
                  placeholder="Ej: 5.4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Puntos AR
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={arPoints || ''}
                  onChange={(e) => setArPoints(Number(e.target.value))}
                  placeholder="Ej: 7.0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nº Quiz AR
                </label>
                <input
                  type="text"
                  value={arQuizNumber}
                  onChange={(e) => setArQuizNumber(e.target.value)}
                  placeholder="Ej: EC-0092"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Copies Generation */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              3. Generación Inmediata de Ejemplares Físicos (Inventario)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cantidad de Copias
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={initialCopiesCount}
                  onChange={(e) => setInitialCopiesCount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ubicación Física
                </label>
                <input
                  type="text"
                  value={initialShelfLocation}
                  onChange={(e) => setInitialShelfLocation(e.target.value)}
                  placeholder="Ej: ESTANTE-LIT-04"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado Inicial
                </label>
                <select
                  value={initialCondition}
                  onChange={(e) => setInitialCondition(e.target.value as CopyCondition)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="NEW">Nuevo (Excelente)</option>
                  <option value="GOOD">Bueno (Operativo)</option>
                  <option value="FAIR">Regular</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Costo Reposición ($USD)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={replacementCost}
                  onChange={(e) => setReplacementCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Se generarán automáticamente códigos de acceso (ACC), códigos de barras y UIDs NFC para cada copia física.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition"
            >
              Registrar Título & Copias
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
