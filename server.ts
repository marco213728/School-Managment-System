import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MotorOptimizadorHorarios } from "./lib/scheduler";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint para inicializar el algoritmo asíncronamente
  app.post("/api/v1/horarios/generar", (req, res) => {
    const { docentes, paralelos, aulas, asignaturas } = req.body;
    
    // Aquí es donde en una arquitectura real se usaría Celery o un Worker.
    // Para simplificar, lo ejecutamos asíncronamente en el background
    // sin bloquear la respuesta de la petición.
    setTimeout(() => {
      console.log("Iniciando optimización de horarios...");
      const motor = new MotorOptimizadorHorarios(docentes, paralelos, aulas, asignaturas);
      const resultado = motor.resolver();
      console.log("Optimización terminada. Fitness:", resultado.fitness_score);
      // En una implementación completa esto guardaría en BD y notificaría.
    }, 100);

    // Responder inmediatamente para no bloquear
    res.json({ status: "Procesando", message: "La generación de horarios ha comenzado en segundo plano." });
  });

  // Validador de Identidad y Auditoría de Carga Laboral GETH
  app.post("/api/v1/staff/validate-characterization", (req, res) => {
    const data = req.body;
    const { cedula, enPeriodoLactancia, tieneLimitacionMovilidad, horasMaximasPermitidas } = data;

    // 1. Validador de Cédula Ecuatoriana (Módulo 10)
    if (!cedula || cedula.length !== 10 || isNaN(Number(cedula))) {
      return res.status(400).json({ error: "Formato de cédula inválido. Debe tener 10 dígitos numéricos." });
    }
    
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let digito = parseInt(cedula[i], 10);
        if (i % 2 === 0) {
            digito *= 2;
            if (digito > 9) digito -= 9;
        }
        suma += digito;
    }
    const decimo = parseInt(cedula[9], 10);
    const digitoVerificador = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    
    if (decimo !== digitoVerificador) {
      return res.status(400).json({ error: "La cédula ecuatoriana no pasó la validación matemática (Módulo 10)." });
    }

    // 2. Regulación de Carga por Lactancia
    let horasClaseDirectaMax = horasMaximasPermitidas || 25; // Default 25
    if (enPeriodoLactancia) {
      horasClaseDirectaMax = Math.min(horasClaseDirectaMax, 20); // GETH: Max 20h para lactancia
    }

    // 3. (Mock) Auditoría Física de Accesibilidad se realiza durante la generación, 
    // pero guardamos el flag para bloquear asignaciones de piso > 1 sin ascensor.

    res.json({
      success: true,
      auditedData: {
        ...data,
        horasMaximasPermitidas: horasClaseDirectaMax,
      },
      message: "Caracterización validada y auditada correctamente por GETH."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
