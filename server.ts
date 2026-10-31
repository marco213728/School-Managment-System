import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { MotorOptimizadorHorarios } from "./lib/scheduler.ts";
import { generatePedagogicalFallback } from "./lib/aiFallbackGenerator.ts";

async function startServer() {
  const app = express();
  // In development, the AI Studio dev environment requires port 3000.
  // In production (e.g. Cloud Run), process.env.PORT is used.
  const isDev = process.env.NODE_ENV !== "production";
  const PORT = isDev ? 3000 : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

  app.use(express.json());

  // Cloud Run Health Check endpoints
  app.get("/healthz", (_req, res) => {
    res.status(200).send("OK");
  });
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  // Endpoint Seguro de Generación con Inteligencia Artificial (Gemini API Proxy)
  app.post("/api/ai/generate", async (req, res) => {
    const { prompt, systemInstruction, responseMimeType, model } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "El prompt es requerido." });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    const targetModel = model && model !== 'gemini-3-flash-preview' ? model : 'gemini-2.5-flash';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const config: any = {};
        if (responseMimeType) {
          config.responseMimeType = responseMimeType;
        }
        if (systemInstruction) {
          config.systemInstruction = systemInstruction;
        }

        const response = await ai.models.generateContent({
          model: targetModel,
          contents: prompt,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        if (response && response.text) {
          return res.json({ success: true, text: response.text });
        }
      } catch (err: any) {
        console.warn("Aviso al invocar Gemini API en servidor:", err?.message || err);
      }
    }

    // Fallback curricular estructurado garantizado en caso de clave ausente o en mantenimiento
    console.log("Generando respuesta curricular pedagógica de contingencia...");
    const fallbackText = generatePedagogicalFallback(prompt, responseMimeType);
    return res.json({
      success: true,
      text: fallbackText,
      warning: "Generado con motor curricular asistido. Para activar el modelo neural en tiempo real, verifique o actualice su clave Gemini en el panel Settings > Secrets de AI Studio.",
    });
  });

  // API endpoint para inicializar el algoritmo asíncronamente
  app.post("/api/v1/horarios/generar", (req, res) => {
    const { docentes, paralelos, aulas, asignaturas } = req.body;
    setTimeout(() => {
      console.log("Iniciando optimización de horarios...");
      const motor = new MotorOptimizadorHorarios(docentes, paralelos, aulas, asignaturas);
      const resultado = motor.resolver();
      console.log("Optimización terminada. Fitness:", resultado.fitness_score);
    }, 100);

    res.json({ status: "Procesando", message: "La generación de horarios ha comenzado en segundo plano." });
  });

  // Validador de Identidad y Auditoría de Carga Laboral GETH
  app.post("/api/v1/staff/validate-characterization", (req, res) => {
    const data = req.body;
    const { cedula, enPeriodoLactancia, horasMaximasPermitidas } = data;

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

    let horasClaseDirectaMax = horasMaximasPermitidas || 25;
    if (enPeriodoLactancia) {
      horasClaseDirectaMax = Math.min(horasClaseDirectaMax, 20);
    }

    res.json({
      success: true,
      auditedData: {
        ...data,
        horasMaximasPermitidas: horasClaseDirectaMax,
      },
      message: "Caracterización validada y auditada correctamente por GETH."
    });
  });

  // En producción (Cloud Run / App Hosting): Servir estáticos construidos si existen
  const distPath = path.join(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  const hasBuiltDist = fs.existsSync(indexHtmlPath);

  if (isDev || !hasBuiltDist) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.use((_req, res) => {
      if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
      } else {
        res.status(404).send("Application static files are being prepared.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
