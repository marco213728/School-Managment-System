# Sistema de Marcaje y Asistencia Docente / Administrativo (Clock-In System)

Mejora integral del sistema de marcaje de asistencia para personal docente y administrativo, incorporando reconocimiento facial mejorado con captura de foto-evidencia, seguimiento visual del ciclo secuencial de jornada (Entrada, Receso Inicio, Receso Fin, Salida), y validación de geolocalización con justificación obligatoria fuera de rango.

## Decisiones Críticas y Preferencias Confirmadas

> [!IMPORTANT]
> Decisiones de producto y diseño acordadas a partir de las respuestas del usuario:

- **Métodos de Identificación Confirmados**: Se mantienen los tres métodos existentes (Reconocimiento Facial, Huella Dactilar y Código PIN), potenciando el **Reconocimiento Facial** con retícula HUD en tiempo real, captura automática de foto-evidencia en el instante del marcaje y verificación visual del colaborador.
- **Ciclo Secuencial de Marcaje Confirmado**: Se conserva el ciclo estricto de 4 pasos secuenciales:
  1. `in`: Entrada de Jornada.
  2. `out_break`: Salida a Receso / Almuerzo.
  3. `in_break`: Retorno de Receso / Almuerzo.
  4. `out`: Salida Final de Jornada.
  Se añade un indicador visual interactivo de progreso (`1/4`, `2/4`, etc.) y una tarjeta de resumen de jornada una vez completados los 4 marcajes en lugar de alertas nativas del navegador.
- **Política de Geofencing Confirmada**: Permitir el registro de asistencia cuando el usuario se encuentre fuera del radio geográfico permitido de la institución, **exigiendo obligatoriamente** la selección de un motivo de justificación y una nota explicativa detallada, registrando el estado con bandera de advertencia (`Flagged / Justificado`) y notificando a las autoridades institucionales.

---

## 1. Visión General y Concepto Central

- **Qué hace**: Proporciona un módulo de marcaje de asistencia robusto, rápido y transparente tanto en modo autoservicio individual (desde la sesión de cada docente/administrativo) como en modo kiosco compartido. Permite registrar cada momento de la jornada con verificación biométrica/facial, geolocalización asistida y justificaciones auditables cuando el registro ocurre fuera del plantel.
- **Audiencia Objetivo**: Docentes, directivos, inspectores generales, personal administrativo y personal de apoyo de la institución educativa.
- **Valor Principal**: Elimina ambigüedades en el registro laboral, previene bloqueos injustos en terreno mediante la justificación estructurada fuera de rango, y provee a la administración evidencia fotográfica y geográfica de cada marcaje.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujos Clave de Usuario

1. **Flujo de Marcaje Facial Mejorado**:
   - El colaborador abre el kiosco o modal de asistencia.
   - La pantalla muestra el estado actual de su jornada (ej: *"Siguiente: Entrada de Jornada"* o *"Siguiente: Salida a Receso"*).
   - Al seleccionar **Reconocimiento Facial**, se activa la cámara web mostrando una guía ovalada con retícula animada tipo HUD (*scanline*, indicadores de esquinas, detección activa).
   - Al alinearse, el sistema realiza la captura fotográfica del rostro, calcula la ubicación GPS y emite confirmación auditiva/visual con el nombre, avatar y hora exacta.
2. **Flujo de Justificación por Ubicación Fuera de Rango**:
   - Si la distancia detectada supera el radio configurado (ej: >100m de la institución), se despliega una pantalla de advertencia clara: *"Marcaje fuera del perímetro institucional ({distancia} m detectados)"*.
   - Se activa un formulario modal de justificación con selector de motivos (ej: *Trabajo de campo / Salida pedagógica*, *Problema de movilización*, *Comisión institucional externa*, *Teletrabajo / Planificación externa*, *Inconsistencia de señal GPS*) y campo de texto obligatorio.
   - Tras confirmar, el marcaje se graba con advertencia y se genera una notificación de seguridad para el Rector e Inspector General.
3. **Flujo de Seguimiento de Ciclo de Jornada (4 Marcajes)**:
   - Visualización tipo línea de tiempo o *stepper* horizontal que muestra el estado de los 4 marcajes del día con hora, método y badge de estado.
   - Al completar la salida final, la interfaz felicita al usuario, resume el total de horas cumplidas y desactiva el botón de marcaje para evitar duplicados accidentales.

### Dirección Estética y Lenguaje Visual

- **Paleta y Tonalidad**: Azul institucional (`#0284c7` / `#0369a1`) con toques de esmeralda para validación exitosa (`#059669`) y ámbar cálido para alertas de geocerca (`#d97706`). Fondos limpios en slate neutro (`#f8fafc` y `#ffffff`).
- **Disciplina Anti-Slop**: Tipografía limpia con pesos definidos (`font-semibold` / `font-bold`), sin píldoras decorativas innecesarias, bordes nítidos (`border-slate-200`) y sombras de profundidad sutil (`shadow-sm`, `shadow-md`).
- **Micro-interacciones y Feedback**: Animación de escaneo láser en la cámara, transición suave hacia la pantalla de éxito, y badges de geolocalización con enlace directo a coordenadas en Google Maps.

---

## 3. Decisiones de Producto y Consideraciones Técnicas

- **Captura Fotográfica en Canvas HTML5**:
  - *Enfoque*: Capturar un fotograma del `<video>` en un `<canvas>` oculto en base64 (resolución optimizada 320x320) al confirmar el reconocimiento facial.
  - *Por qué*: Proporciona evidencia fotográfica real de presencia sin requerir librerías pesadas externas ni almacenamiento costoso.
- **Manejo del Ciclo Secuencial en Estado y Firestore**:
  - *Enfoque*: Cada documento de `staff_attendance` almacena un arreglo de `punches` con `{ time, type, method, location, verificationStatus, distanceFromInstitution, justification, photoProof }`.
  - *Por qué*: Mantiene el historial completo del día en un solo documento atómico por usuario/fecha, facilitando consultas de nómina y cálculos de puntualidad.
- **Justificaciones Auditables**:
  - *Enfoque*: Cuando `verificationStatus` es `'Flagged'`, se incluye el objeto `justification: { reason, note, timestamp }`. Los reportes institucionales muestran un botón interactivo para revisar el motivo y foto del registro.

---

## 4. Arquitectura del Sistema y Estrategia de Datos

### Diagrama de Arquitectura de Asistencia

```
┌─────────────────────────────────────────────────────────────────┐
│                      StaffAttendanceKiosk                       │
│  ┌───────────────────────┐  ┌────────────────────────────────┐  │
│  │   Camera Stream / HUD │  │    Punch Cycle Stepper (1-4)   │  │
│  │   • Retícula de guía  │  │    • Entrada (in)              │  │
│  │   • Scanner animation │  │    • Salida Receso (out_break) │  │
│  │   • Canvas photo proof│  │    • Regreso Receso (in_break) │  │
│  │   • Pin & Biometric   │  │    • Salida Final (out)        │  │
│  └───────────┬───────────┘  └───────────────┬────────────────┘  │
└──────────────┼──────────────────────────────┼───────────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Geofence & Location Checker                   │
│  • Haversine distance vs institution.geofenceConfig             │
│  • ¿Dentro de radio? ──> Registra inmediato ('Success')         │
│  • ¿Fuera de radio?  ──> Modal Justificación Obligatoria        │
│                          ('Flagged' + Motivo + Nota)            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              App.tsx (handleUpdateStaffAttendance)              │
│  • Actualiza StaffAttendanceRecord en estado React              │
│  • Persiste documento en Firestore ('staff_attendance')         │
│  • Emite notificación a Admin/Inspector si hubo advertencia     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     StaffAttendanceReport                       │
│  • Tabla de registros con badges de puntualidad y geocerca      │
│  • Visualización de Justificación y Foto-evidencia en modal     │
│  • Enlace directo a Google Maps con coordenadas del marcaje     │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes y Archivos Clave a Actualizar

1. `types.ts`:
   - Ampliar la interfaz `StaffAttendanceRecord.punches` con campos opcionales:
     - `photoProof?: string;` (captura en base64)
     - `justification?: { reason: string; note: string; timestamp: string; };`
     - Estado de verificación: `'Success' | 'Failed' | 'Pending' | 'Flagged'`
2. `components/staff/StaffAttendanceKiosk.tsx`:
   - Nueva interfaz de cámara con retícula ovalada facial, guía de alineación y captura de foto vía canvas.
   - Línea de tiempo interactiva del ciclo de 4 marcajes del día con el siguiente paso resaltado.
   - Modal/paso integrado de justificación obligatoria cuando la geolocalización detecta que el usuario está fuera de rango.
3. `components/staff/StaffAttendanceModal.tsx`:
   - Pasar los registros del día del usuario actual al kiosco para reflejar el progreso del ciclo de 4 pasos.
4. `App.tsx`:
   - Actualizar `handleUpdateStaffAttendance` para aceptar `justification` y `photoProof`, persistir en Firestore y emitir alertas a las autoridades con el motivo de justificación.
5. `components/staff/StaffAttendanceReport.tsx`:
   - Columna/modal de detalles para visualizar la foto capturada en el marcaje y la nota de justificación cuando un registro fue realizado fuera de rango.
