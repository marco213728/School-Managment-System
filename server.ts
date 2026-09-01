import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MotorOptimizadorHorarios } from "./lib/scheduler";

async function startServer() {
  const app = express();

  // IMPORTANTE PARA FIREBASE APP HOSTING
  const PORT = Number(process.env.PORT) || 8080;

  app.use(express.json());

  app.post("/api/v1/horarios/generar", (req, res) => {
    const { docentes, paralelos, aulas, asignaturas } = req.body;

    setTimeout(() => {
      console.log("Iniciando optimización de horarios...");

      const motor = new MotorOptimizadorHorarios(
        docentes,
        paralelos,
        aulas,
        asignaturas
      );

      const resultado = motor.resolver();

      console.log(
        "Optimización terminada. Fitness:",
        resultado.fitness_score
      );
    }, 100);

    res.json({
      status: "Procesando",
      message: "La generación de horarios ha comenzado en segundo plano.",
    });
  });

  app.post("/api/v1/staff/validate-characterization", (req, res) => {
    const data = req.body;

    const {
      cedula,
      enPeriodoLactancia,
      horasMaximasPermitidas,
    } = data;

    if (!cedula || cedula.length !== 10 || isNaN(Number(cedula))) {
      return res.status(400).json({
        error:
          "Formato de cédula inválido. Debe tener 10 dígitos numéricos.",
      });
    }

    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let digito = parseInt(cedula[i], 10);

      if (i % 2 === 0) {
        digito *= 2;

        if (digito > 9) {
          digito -= 9;
        }
      }

      suma += digito;
    }

    const decimo = parseInt(cedula[9], 10);
    const digitoVerificador =
      suma % 10 === 0 ? 0 : 10 - (suma % 10);

    if (decimo !== digitoVerificador) {
      return res.status(400).json({
        error:
          "La cédula ecuatoriana no pasó la validación matemática (Módulo 10).",
      });
    }

    let horasClaseDirectaMax = horasMaximasPermitidas || 25;

    if (enPeriodoLactancia) {
      horasClaseDirectaMax = Math.min(
        horasClaseDirectaMax,
        20
      );
    }

    res.json({
      success: true,
      auditedData: {
        ...data,
        horasMaximasPermitidas: horasClaseDirectaMax,
      },
      message:
        "Caracterización validada y auditada correctamente por GETH.",
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
