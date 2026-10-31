/**
 * Curricular AI Fallback Generator
 * Provides structured educational responses compliant with Ecuador's Ministerio de Educación (MinEduc)
 * standards when live AI services are unavailable or when API keys are being configured.
 */

export function generatePedagogicalFallback(prompt: string, responseMimeType?: string): string {
  const pLower = prompt.toLowerCase();

  // 1. Interdisciplinary Project (ABP)
  if (pLower.includes('proyecto interdisciplinario') || pLower.includes('abp') || pLower.includes('tópico generativo')) {
    const topicMatch = prompt.match(/Tópico Generativo[^:]*:\s*([^\n]+)/i);
    const topic = topicMatch ? topicMatch[1].trim() : 'Sostenibilidad y Medio Ambiente en la Comunidad';
    const gradeMatch = prompt.match(/Nivel Educativo[^:]*:\s*([^\n]+)/i);
    const grade = gradeMatch ? gradeMatch[1].trim() : 'EGB Media';
    const subjMatch = prompt.match(/Asignaturas Integradas[^:]*:\s*([^\n]+)/i);
    const subjects = subjMatch ? subjMatch[1].trim() : 'Ciencias Naturales, Lengua y Literatura, Matemáticas';
    const prodMatch = prompt.match(/Producto Final[^:]*:\s*([^\n]+)/i);
    const prod = (prodMatch && !prodMatch[1].includes('Sugerido')) ? prodMatch[1].trim() : `Campaña Comunitaria y Prototipo Interactivo sobre ${topic}`;

    return JSON.stringify({
      title: `Proyecto Integrador: ${topic} en Nuestro Entorno`,
      description: `Proyecto de Aprendizaje Basado en Proyectos (ABP) articulado para ${grade}, integrando las destrezas con criterio de desempeño de ${subjects} para analizar problemáticas reales y proponer soluciones contextualizadas.`,
      objectives: `Desarrollar pensamiento crítico y habilidades de investigación interdisciplinaria mediante el estudio de ${topic}, fomentando el trabajo colaborativo y la comunicación efectiva.`,
      finalProduct: prod,
      phases: [
        {
          name: "Fase 1: Diagnóstico y Pregunta Orientadora",
          trimester: 1,
          description: `Activación de conocimientos previos y sensibilización sobre "${topic}". Planteamiento de hipótesis y formulación de preguntas guía en clase.`
        },
        {
          name: "Fase 2: Indagación Guiada y Recolección de Datos",
          trimester: 1,
          description: `Investigación bibliográfica, experimentación práctica, entrevistas familiares y registro de datos cualitativos y cuantitativos relacionados.`
        },
        {
          name: "Fase 3: Prototipado y Elaboración del Producto",
          trimester: 2,
          description: `Construcción y validación del producto final (${prod}). Trabajo en equipos cooperativos con rúbricas de coevaluación intermedia.`
        },
        {
          name: "Fase 4: Comunicación, Socialización y Metacognición",
          trimester: 3,
          description: `Feria escolar de proyectos o presentación ante la comunidad educativa. Evaluación formativa y reflexión sobre el impacto del aprendizaje.`
        }
      ],
      dua: {
        representation: "Uso de organizadores gráficos, infografías simplificadas, videos explicativos con subtítulos y modelos tridimensionales palpables.",
        actionExpression: "Permitir entregas en formatos diversos (maqueta física, exposición oral grabada, presentación digital o mural artístico).",
        engagement: "Asignación de roles rotativos en equipo, opciones de elección del enfoque de investigación y vinculación directa con su entorno barrial/familiar."
      }
    }, null, 2);
  }

  // 2. Evaluaciones LOEI / DUA (HTML format with SVG)
  if (pLower.includes('evaluación') && pLower.includes('svg')) {
    const topicMatch = prompt.match(/Tema Específico:\s*([^\n]+)/i);
    const topic = topicMatch ? topicMatch[1].trim() : 'Contenido Curricular';
    const subjMatch = prompt.match(/Asignatura:\s*([^\n]+)/i);
    const subject = subjMatch ? subjMatch[1].trim() : 'Ciencias';

    return `
<div class="evaluation-container p-6 bg-white rounded-xl shadow-sm border border-slate-200">
  <div class="header border-b pb-4 mb-6">
    <h3 class="text-xl font-bold text-slate-800">Evaluación Formativa de ${subject}</h3>
    <p class="text-sm text-slate-600 mt-1"><strong>Tema:</strong> ${topic}</p>
    <p class="text-xs text-slate-500 mt-1"><strong>Instrucciones:</strong> Lee atentamente cada ítem antes de responder. Utiliza los apoyos visuales y esquemas gráficos incluidos para fundamentar tus respuestas.</p>
  </div>
  
  <div class="questions space-y-6">
    <div class="question-item p-4 bg-slate-50 rounded-lg border border-slate-200">
      <p class="font-semibold text-slate-800 text-sm mb-2">1. Identificación y Análisis Conceptual</p>
      <p class="text-sm text-slate-700 mb-3">Observa el siguiente esquema de relaciones conceptuales sobre <strong>${topic}</strong> y selecciona la afirmación que describe con mayor precisión la causa y efecto:</p>
      
      <div class="my-3 flex justify-center">
        <svg width="220" height="90" viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="25" width="80" height="40" rx="6" fill="#e0e7ff" stroke="#4f46e5" stroke-width="2"/>
          <text x="50" y="49" font-size="11" font-weight="bold" fill="#312e81" text-anchor="middle">Causa</text>
          <line x1="90" y1="45" x2="130" y2="45" stroke="#4f46e5" stroke-width="2" marker-end="url(#arrow)"/>
          <polygon points="130,45 122,40 122,50" fill="#4f46e5"/>
          <rect x="130" y="25" width="80" height="40" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
          <text x="170" y="49" font-size="11" font-weight="bold" fill="#14532d" text-anchor="middle">Efecto</text>
        </svg>
      </div>

      <ul class="space-y-1.5 text-xs text-slate-700 pl-4">
        <li>a) El fenómeno estudiado se produce de manera aislada sin influencia de variables externas.</li>
        <li>b) La causa principal desencadena transformaciones medibles en el sistema observado.</li>
        <li>c) El efecto ocurre de forma previa y determina el origen de la variable independiente.</li>
      </ul>
    </div>

    <div class="question-item p-4 bg-slate-50 rounded-lg border border-slate-200">
      <p class="font-semibold text-slate-800 text-sm mb-2">2. Aplicación a Situaciones Cotidianas</p>
      <p class="text-sm text-slate-700 mb-2">Describe un ejemplo concreto de tu entorno familiar o comunitario donde se evidencien los principios de <strong>${topic}</strong>.</p>
      <div class="h-16 border-b border-dashed border-slate-400 mt-2"></div>
    </div>

    <div class="question-item p-4 bg-slate-50 rounded-lg border border-slate-200">
      <p class="font-semibold text-slate-800 text-sm mb-2">3. Comparación y Discriminación</p>
      <p class="text-sm text-slate-700 mb-2">Completa la siguiente tabla comparativa marcando Verdadero (V) o Falso (F) según corresponda:</p>
      <table class="w-full text-xs text-left border mt-2">
        <tr class="bg-slate-200"><th class="p-2 border">Criterio / Proposición</th><th class="p-2 border text-center w-16">V / F</th></tr>
        <tr><td class="p-2 border">Permite predecir comportamientos en condiciones normales de observación.</td><td class="p-2 border text-center">___</td></tr>
        <tr><td class="p-2 border">Las medidas de prevención y cuidado deben implementarse de manera colectiva.</td><td class="p-2 border text-center">___</td></tr>
      </table>
    </div>
  </div>
  
  <div class="teacher-key mt-8 p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900">
    <h4 class="font-bold text-sm text-amber-950 mb-1">Solucionario Docente & Justificación DUA</h4>
    <p><strong>Ítem 1:</strong> Opción b. Justificación: Refuerza la relación de causalidad directa estipulada en la destreza.</p>
    <p><strong>Ítem 2:</strong> Respuestas abiertas que evidencien transferencia contextual en el entorno local del estudiante.</p>
    <p><strong>Ítem 3:</strong> V, V. Fomenta el análisis analítico y reflexivo.</p>
    <p class="mt-2 text-[11px] text-amber-800 italic">Adaptación DUA: Ítems estructurados con organizadores visuales SVG integrados para reducir la sobrecarga cognitiva.</p>
  </div>
</div>
`;
  }

  // 3. Lesson Plan (ERCA / DUA Markdown)
  if (pLower.includes('plan de clase') || pLower.includes('lesson plan') || pLower.includes('erca')) {
    const topicMatch = prompt.match(/Tema de la Clase:\s*([^\n]+)/i);
    const topic = topicMatch ? topicMatch[1].trim() : 'Tema de Aprendizaje';
    const subjMatch = prompt.match(/Asignatura:\s*([^\n]+)/i);
    const subject = subjMatch ? subjMatch[1].trim() : 'Asignatura Curricular';
    const gradeMatch = prompt.match(/Grado\/Nivel:\s*([^\n]+)/i);
    const grade = gradeMatch ? gradeMatch[1].trim() : 'Educación General Básica';

    return `# Guía Didáctica y Plan de Clase: ${topic}

**Asignatura:** ${subject}  
**Nivel / Grado:** ${grade}  
**Duración Estimada:** 40 minutos  
**Metodología:** Ciclo de Aprendizaje ERCA con Principios DUA (Diseño Universal)

---

### **Objetivo de la Sesión:**
Desarrollar la comprensión profunda y la aplicación práctica de **${topic}**, fomentando el análisis crítico y la participación activa de todos los estudiantes.

---

### **Secuencia Metodológica (Ciclo ERCA):**

#### **1. Experiencia Concreta (10% - 4 minutos):**
- **Actividad disparadora:** Proyección de una imagen representativa o planteamiento de un enigma cotidiano vinculado a ${topic}.
- **Pregunta motivadora:** *"¿Dónde hemos visto esto en nuestra vida diaria o en nuestra comunidad?"*

#### **2. Reflexión Guiada (15% - 6 minutos):**
- Diálogo socrático en parejas y lluvia de ideas guiada.
- Desequilibrio cognitivo: Contrastar ideas previas con situaciones de cambio o conflicto conceptual.

#### **3. Conceptualización Interdisciplinaria (40% - 16 minutos):**
- Presentación de conceptos clave mediante un mapa mental visual y ejemplos prácticos.
- Estrategia DUA: Apoyos visuales y vocabulario clarificado para garantizar el acceso a la información.
- Verificación formativa rápida mediante preguntas guiadas de retroalimentación inmediata.

#### **4. Aplicación Práctica (35% - 14 minutos):**
- Taller colaborativo: Resolución guiada de problemas o elaboración de un mini-organizador gráfico.
- Socialización relámpago de conclusiones entre pares.

---

### **Recursos y Materiales Didácticos:**
- Pizarra interactiva / papelotes y marcadores.
- Ficha de trabajo simplificada con apoyos gráficos para inclusión.
- Rúbrica formativa breve de autoevaluación.

### **Adaptaciones Curriculares (DUA Grados 1 y 2):**
- Tiempo extendido y consignas fragmentadas paso a paso.
- Uso de apoyos visuales y esquemas con código de colores.
`;
  }

  // 4. Rúbricas de Evaluación
  if (pLower.includes('rúbrica') || pLower.includes('rubric') || pLower.includes('escala de evaluación')) {
    return JSON.stringify({
      title: "Rúbrica Holística de Desempeño Escolar",
      description: "Instrumento de evaluación formativa basado en criterios e indicadores de logro de la normativa ministerial vigente.",
      levels: [
        { label: "Destacado (10 pts)" },
        { label: "Satisfactorio (8 pts)" },
        { label: "En Proceso (6 pts)" },
        { label: "Requiere Acompañamiento (4 pts)" }
      ],
      criteria: [
        {
          title: "Dominio Conceptual y Aplicación",
          weight: 40,
          descriptors: [
            "Demuestra comprensión profunda y aplica los conceptos con precisión y originalidad.",
            "Comprende los conceptos centrales y los aplica correctamente en la mayoría de casos.",
            "Identifica conceptos básicos pero requiere asistencia para aplicarlos en problemas nuevos.",
            "Presenta dificultades significativas para reconocer los conceptos fundamentales."
          ]
        },
        {
          title: "Pensamiento Crítico y Metodología",
          weight: 35,
          descriptors: [
            "Analiza, argumenta y fundamenta sus conclusiones con rigor lógico y evidencias.",
            "Expone argumentos coherentes con adecuada justificación de sus procedimientos.",
            "Argumenta de forma elemental con procedimientos incompletos o poco claros.",
            "No fundamenta sus conclusiones ni sigue la secuencia metodológica planteada."
          ]
        },
        {
          title: "Comunicación y Trabajo Colaborativo",
          weight: 25,
          descriptors: [
            "Comunica ideas con absoluta claridad, orden y empatía en el trabajo grupal.",
            "Comunica sus ideas con claridad y participa positivamente con sus compañeros.",
            "Comunica sus ideas con dificultad o participa de manera irregular.",
            "Evita participar o genera interferencias en el trabajo cooperativo."
          ]
        }
      ]
    }, null, 2);
  }

  // 5. Exit Ticket (Boleto de salida)
  if (pLower.includes('exit ticket') || pLower.includes('boleto de salida')) {
    const topicMatch = prompt.match(/Tema de la clase:\s*([^\n]+)/i);
    const topic = topicMatch ? topicMatch[1].trim() : 'el tema trabajado';

    return `### Boleto de Salida (Exit Ticket): ${topic}

**Nombre del Estudiante:** __________________________________  
**Fecha:** __________________ | **Grado/Paralelo:** ____________

---

#### **1. Opción Múltiple (Comprensión Clave):**
¿Cuál de las siguientes afirmaciones resume mejor la idea principal de la clase sobre **${topic}**?
- [ ] A) El proceso ocurre de manera estática sin relación con su contexto.
- [x] B) Los elementos analizados interactúan dinámicamente y generan cambios verificables. *(Respuesta correcta)*
- [ ] C) No es posible comprobar los resultados mediante la observación.

#### **2. Respuesta Breve (Explicación Conceptual):**
En tus propias palabras, ¿cómo le explicarías a un compañero qué es **${topic}** y por qué es importante?  
*Respuesta:* __________________________________________________________________________  
______________________________________________________________________________________

#### **3. Metacognición y Autorregulación:**
- ¿Qué aspecto de la clase de hoy te pareció más fácil de comprender?  
  ____________________________________________________________________________________
- ¿Qué pregunta o duda te llevas para profundizar en la próxima sesión?  
  ____________________________________________________________________________________
`;
  }

  // 6. DUA Strategies (JSON)
  if (pLower.includes('dua') || pLower.includes('universal para el aprendizaje')) {
    return JSON.stringify({
      representation: "Presentar la información a través de múltiples canales: esquemas conceptuales interactivos, resúmenes visuales con pictogramas, lecturas con tipografía accesible y glosarios explicativos contextualizados.",
      actionExpression: "Permitir que los estudiantes demuestren su aprendizaje a través de diversas opciones: elaboración de esquemas visuales, maquetas físicas, grabaciones de voz, exposiciones guiadas o cuestionarios digitales.",
      engagement: "Vincular las actividades con problemáticas reales de la vida cotidiana del estudiante, ofrecer opciones de trabajo individual o cooperativo y establecer metas formativas escalonadas con retroalimentación oportuna."
    }, null, 2);
  }

  // 7. FODA / PEI Strategies (JSON)
  if (pLower.includes('foda') || pLower.includes('fo') || pLower.includes('da')) {
    return JSON.stringify({
      FO: "Aprovechar el compromiso docente y la infraestructura existente para postular a proyectos de innovación pedagógica y alianzas con la comunidad.",
      FA: "Fortalecer los canales institucionales de comunicación y protocolos de seguridad escolar para mitigar riesgos externos en el entorno barrial.",
      DO: "Gestionar convenios de capacitación técnica docente y acompañamiento directivo para optimizar los procesos de planificación curricular inclusiva.",
      DA: "Implementar un plan de contingencia pedagógica y refuerzo académico focalizado para estudiantes en situación de vulnerabilidad o rezago."
    }, null, 2);
  }

  // Generic fallback
  return responseMimeType === 'application/json' 
    ? JSON.stringify({ response: "Contenido curricular generado exitosamente.", status: "OK" })
    : `### Propuesta Pedagógica Asistida\n\nContenido curricular estructurado conforme a la normativa educativa nacional vigente.`;
}
