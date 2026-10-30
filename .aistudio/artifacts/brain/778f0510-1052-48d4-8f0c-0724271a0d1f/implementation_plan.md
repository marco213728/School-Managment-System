# Plan de Implementación: Sistema de Gestión de Biblioteca Escolar (SLMS)

Módulo integral de biblioteca escolar multi-inquilino (multi-tenant) integrado en Amauta, administrado directamente por el personal bibliotecario y directivo desde la barra lateral (siguiendo el modelo de DECE e Inspección), con soporte móvil para cámara y Web NFC, catalogación MARC21, circulación, multas, y distribución masiva de textos escolares vinculada a cursos y materias existentes.

---

## 1. Alcance y Decisiones de Diseño

Conforme a las instrucciones del usuario:
1. **Acceso Exclusivo para el Bibliotecario/Directivos:** Acceso directo desde la barra lateral (`Biblioteca Escolar`), sin portales públicos OPAC ni kioscos desatendidos. Todos los préstamos, devoluciones, reservas y catalogaciones son operados por el Bibliotecario o Administrador.
2. **Soporte Móvil Nativo para Escáner:** Integración de la cámara del dispositivo móvil para lectura óptica de códigos de barras (Code 128, Code 39, ISBN, QR) mediante la API estándar del navegador (`BarcodeDetector` / cámara web), y soporte táctil para lectura de chips NFC (`NDEFReader` de Web NFC) con emulador/entrada de teclado para ordenadores de escritorio.
3. **Distribución Masiva de Libros de Texto Vinculada al Plantel:** Integración total con la estructura existente de cursos (`classes`), asignaturas (`subjects`) y nómina de alumnos (`students`), permitiendo asignaciones masivas por curso en segundos y registro de condición física (Escala 1 a 5: Nuevo, Bueno, Regular, Malo, Dañado).

---

## 2. Modelo de Datos y Entidades (`types.ts`)

### 2.1 Catálogo Bibliográfico y Copias Físicas
- `BibliographicItem`:
  - `id`, `institutionId` (aislamiento multi-tenant)
  - `isbn`: 10 o 13 dígitos
  - `title`, `subtitle`, `author`, `publisher`, `publicationYear`
  - `deweyDecimal`: Clasificación Decimal Dewey (ej. 510 para Matemáticas, 863 para Novela)
  - `physicalDescription`: Páginas, dimensiones
  - `subjectHeadings`: Materias / descriptores
  - `lexileLevel`: ej. "750L"
  - `acceleratedReader`: `{ atosLevel: number; points: number; quizNumber: string }`
  - `materialType`: `'GENERAL_BOOK' | 'TEXTBOOK' | 'REFERENCE' | 'PERIODICAL' | 'MULTIMEDIA'`
  - `coverUrl`: Imagen de portada
  - `copiesCount`, `availableCopiesCount`
- `PhysicalCopy`:
  - `id`, `bibliographicItemId`, `institutionId`
  - `accessionNumber`: Código secuencial de inventario (ej. `ACC-10492`)
  - `barcode`: Código de barras adherido
  - `nfcUid`: Identificador único de chip NFC/RFID
  - `shelfLocation`: Ubicación física (ej. `ESTANTE-MAT-02`)
  - `condition`: `'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED'`
  - `status`: `'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'MAINTENANCE' | 'LOST'`
  - `isReferenceOnly`: boolean

### 2.2 Circulación y Préstamos
- `LibraryLoan`:
  - `id`, `institutionId`, `copyId`, `accessionNumber`, `bookTitle`, `studentId`, `studentName`, `studentGrade`
  - `borrowDate`: ISO Date
  - `dueDate`: Fecha pactada de devolución
  - `returnDate`: Fecha real de devolución (si ya retornó)
  - `status`: `'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST'`
  - `renewalCount`: Renovaciones aplicadas
  - `fineAmount`: Multa acumulada calculada (excluyendo fines de semana)
  - `finePaid`: boolean
  - `returnedCondition`: Condición física registrada en la recepción

### 2.3 Reservas y Cola FIFO
- `LibraryHold`:
  - `id`, `institutionId`, `bibliographicItemId`, `studentId`, `studentName`, `requestDate`, `status`: `'WAITING' | 'READY_FOR_PICKUP' | 'FULFILLED' | 'CANCELLED'`, `queuePosition`: number, `pickupExpiresAt`: string

### 2.4 Asignación de Textos Escolares por Curso
- `TextbookAssignment`:
  - `id`, `institutionId`, `classId`, `className`, `subjectId`, `subjectName`, `studentId`, `studentName`
  - `textbookBarcode`, `textbookTitle`, `checkoutCondition`, `returnCondition`, `damageFee`, `status`: `'ASSIGNED' | 'RETURNED' | 'DAMAGED' | 'LOST'`

---

## 3. Componentes Especializados a Desarrollar

1. **`components/library/LibraryPage.tsx`:**
   - Página principal del módulo con pestañas de trabajo:
     1. **Mesa de Circulación:** Préstamos y devoluciones rápidas con escaneo de código de barras / NFC.
     2. **Catálogo & Inventario:** Búsqueda facetada, catalogación MARC21 rápida e importación por ISBN.
     3. **Distribución de Textos Escolares:** Selector de curso (`class1`, `class2`), selección de asignatura y asignación masiva a la nómina de estudiantes con calificación del estado del libro.
     4. **Reservas & Sanciones:** Cola FIFO de libros reservados y libro mayor de multas/daños.
     5. **Analíticas de Lectura:** Métricas de lectura por grado, bandas Lexile y puntos AR.

2. **`components/library/MobileScannerModal.tsx`:**
   - Modal con visor de cámara en tiempo real (`navigator.mediaDevices.getUserMedia` + detección de códigos de barras) y soporte para Web NFC (`NDEFReader.scan()`) cuando esté soportado en dispositivos móviles.
   - Alternativa manual con detección automática de lectores de código de barras USB/Bluetooth en modo cuña de teclado.

3. **`components/library/TextbookBulkDistributor.tsx`:**
   - Asistente de despacho rápido para inicio de período: selecciona grado/paralelo, muestra los alumnos y permite pistolazo secuencial de libros por estudiante en menos de 15 segundos.

4. **`components/library/CatalogEntryModal.tsx`:**
   - Formulario de alta rápida de títulos con mapeo automático de campos MARC21 (020 ISBN, 100 Autor, 245 Título, 082 Dewey, 650 Materias, Lexile/AR) y generación de etiquetas de inventario.

---

## 4. Integración en Navegación y Roles

- En `types.ts`: Añadir `Role.Librarian` (o compatibilidad con `InstitutionAdmin`, `Rector`, `Vicerrector`, `Teacher` e `InspectorGeneral`).
- En `components/layout/Sidebar.tsx`:
  - Añadir ícono de libro (`BookOpenIcon`) y enlace a `library` en el menú de roles administrativos (`InstitutionAdmin`, `Rector`, `Vicerrector` y `Teacher` asignado).
- En `components/layout/DashboardLayout.tsx`:
  - Añadir `case 'library': return <LibraryPage ... />;`
- En `App.tsx`:
  - Estado y sincronización en Firestore para `library_books`, `library_loans`, `library_textbooks`.

---

## 5. Verificación y Pruebas

- Verificación de tipos y linting con `lint_applet` (0 errores).
- Verificación de compilación del bundle con `compile_applet`.
- Prueba del ciclo completo de préstamo y devolución con cálculo de multas.
- Prueba de asignación masiva de textos escolares vinculada a los cursos existentes en el colegio.
