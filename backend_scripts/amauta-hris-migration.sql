-- =================================================================================
-- AMAUTA HRIS MIGRATION SCRIPT (PostgreSQL)
-- =================================================================================
-- Este script define la estructura base de datos para el módulo de Recursos Humanos,
-- abarcando estructura multirrol, selección, asistencia y evaluación de desempeño.

BEGIN;

-- 1. ESTRUCTURA UNIFICADA MULTI-ROL (NÓMINA DE PLANTA)
CREATE TYPE regimen_laboral AS ENUM ('LOEI', 'LOSEP', 'CODIGO_TRABAJO');
CREATE TYPE rol_organizacional AS ENUM ('DOCENTE', 'DIRECTIVO', 'ADMINISTRATIVO', 'SALUD', 'DECE', 'APOYO');

CREATE TABLE hris_colaborador (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL, -- Relación con la tabla auth_user
    cedula VARCHAR(10) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    rol rol_organizacional NOT NULL,
    regimen regimen_laboral NOT NULL,
    superior_directo_id UUID REFERENCES hris_colaborador(id),
    titulo_profesional VARCHAR(255),
    especialidad_accion_personal VARCHAR(255),
    especialidad_aula VARCHAR(255),
    fecha_ingreso DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ATRACCIÓN Y SELECCIÓN DE CANDIDATOS (RECLUTAMIENTO)
CREATE TYPE estado_vacante AS ENUM ('ABIERTA', 'CERRADA', 'PAUSADA');
CREATE TYPE fase_candidato AS ENUM ('APLICADO', 'PRESELECCIONADO', 'PRUEBA_TECNICA', 'ENTREVISTA', 'REFERENCIAS', 'SELECCIONADO', 'DESCALIFICADO');

CREATE TABLE hris_vacante (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(150) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    regimen_requerido regimen_laboral NOT NULL,
    salario_referencial NUMERIC(10, 2),
    descripcion TEXT,
    estado estado_vacante DEFAULT 'ABIERTA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hris_candidato (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vacante_id UUID REFERENCES hris_vacante(id) ON DELETE CASCADE,
    cedula VARCHAR(10) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    fase fase_candidato DEFAULT 'APLICADO',
    puntaje_evaluacion NUMERIC(5, 2),
    verificacion_referencias TEXT,
    cv_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CONTROL DE ASISTENCIA Y PERMANENCIA PRESENCIAL (FICHAJE)
CREATE TYPE tipo_marcacion AS ENUM ('ENTRADA', 'SALIDA_RECESO', 'ENTRADA_RECESO', 'SALIDA');
CREATE TYPE estado_validacion_geo AS ENUM ('VERIFICADO_EN_CAMPUS', 'FUERA_DE_RANGO', 'PENDIENTE');

CREATE TABLE hris_asistencia_diaria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID REFERENCES hris_colaborador(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    horas_totales_calculadas NUMERIC(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (colaborador_id, fecha)
);

CREATE TABLE hris_marcacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asistencia_id UUID REFERENCES hris_asistencia_diaria(id) ON DELETE CASCADE,
    hora TIME NOT NULL,
    tipo tipo_marcacion NOT NULL,
    latitud NUMERIC(10, 8),
    longitud NUMERIC(11, 8),
    distancia_metros NUMERIC(8, 2),
    validacion_geo estado_validacion_geo DEFAULT 'PENDIENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. EVALUACIÓN DE DESEMPEÑO Y PORTAFOLIO (GUÍA 31)
CREATE TYPE estado_evaluacion AS ENUM ('BORRADOR', 'EN_REVISION', 'FIRMADA');

CREATE TABLE hris_evaluacion_desempeno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID REFERENCES hris_colaborador(id),
    evaluador_id UUID REFERENCES hris_colaborador(id),
    periodo_lectivo VARCHAR(20) NOT NULL,
    puntaje_funcional NUMERIC(5, 2) CHECK (puntaje_funcional <= 70),
    puntaje_comportamental NUMERIC(5, 2) CHECK (puntaje_comportamental <= 30),
    puntaje_total NUMERIC(5, 2) GENERATED ALWAYS AS (puntaje_funcional + puntaje_comportamental) STORED,
    indice_fatiga_burnout NUMERIC(5, 2), -- Alerta de salud ocupacional
    estado estado_evaluacion DEFAULT 'BORRADOR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hris_compromiso_individual (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluacion_id UUID REFERENCES hris_evaluacion_desempeno(id) ON DELETE CASCADE,
    verbo VARCHAR(50) NOT NULL,
    objeto_especifico VARCHAR(255) NOT NULL,
    condicion_calidad TEXT NOT NULL,
    evidencia_url VARCHAR(255)
);

COMMIT;
