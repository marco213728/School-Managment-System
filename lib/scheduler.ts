import { Docente, ParaleloInfo, AulaInfo, AsignaturaInfo, SlotHorarioInfo } from '../types';

export class MotorOptimizadorHorarios {
  private docentes: Docente[];
  private paralelos: ParaleloInfo[];
  private aulas: AulaInfo[];
  private asignaturas: AsignaturaInfo[];
  
  private tamano_poblacion = 60;
  private generaciones = 300;
  private tasa_mutacion = 0.15;
  private tasa_cruce = 0.8;
  
  private peso_conflicto_aula = 0.24;
  private peso_conflicto_docente = 1.0;
  private peso_conflicto_paralelo = 1.0;
  private peso_carga_docente = 0.086;
  private peso_repeticion_materia = 0.076;

  constructor(docentes: Docente[], paralelos: ParaleloInfo[], aulas: AulaInfo[], asignaturas: AsignaturaInfo[]) {
    this.docentes = docentes;
    this.paralelos = paralelos;
    this.aulas = aulas;
    this.asignaturas = asignaturas;
  }

  private inicializar_cromosoma(): SlotHorarioInfo[] {
    const cromosoma: SlotHorarioInfo[] = [];
    
    for (const paralelo of this.paralelos) {
      // Generar celdas disponibles (5 dias x 8 periodos = 40)
      const celdas_disponibles: { dia: number; periodo: number }[] = [];
      for (let d = 1; d <= 5; d++) {
        for (let p = 1; p <= 8; p++) {
          celdas_disponibles.push({ dia: d, periodo: p });
        }
      }
      // Mezclar las celdas para muestreo sin reemplazo (previene choques de paralelo)
      celdas_disponibles.sort(() => Math.random() - 0.5);

      const materias_curso = this.asignaturas.filter(m => m.nivel === paralelo.nivel);
      for (const materia of materias_curso) {
        let docentes_aptos = this.docentes.filter(d => d.especialidad === materia.especialidadRequerida);
        if (docentes_aptos.length === 0) {
          docentes_aptos = this.docentes;
        }
        
        for (let i = 0; i < materia.horasSemanales; i++) {
          const docente_elegido = docentes_aptos[Math.floor(Math.random() * docentes_aptos.length)];
          
          let celda;
          if (celdas_disponibles.length > 0) {
            celda = celdas_disponibles.pop()!;
          } else {
            celda = { dia: Math.floor(Math.random() * 5) + 1, periodo: Math.floor(Math.random() * 8) + 1 };
          }

          cromosoma.push({
            docenteId: docente_elegido.id,
            paraleloId: paralelo.id,
            aulaId: this.aulas[Math.floor(Math.random() * this.aulas.length)].id,
            asignaturaId: materia.id,
            dia: celda.dia,
            periodo: celda.periodo,
          });
        }
      }
    }
    return cromosoma;
  }

  private evaluar_aptitud(cromosoma: SlotHorarioInfo[]): number {
    let violaciones = 0.0;
    
    const ocupacion_docente: Record<string, boolean> = {};
    const ocupacion_aula: Record<string, boolean> = {};
    const ocupacion_paralelo: Record<string, boolean> = {};
    const cargas_docentes: Record<string, number> = {};
    const distribucion_diaria: Record<string, Record<number, { periodo: number, tipo: string }[]>> = {};
    
    // NUEVO: Peso de penalización crítico para accesibilidad física
    // Se trata como RESTRICCIÓN DURA CRÍTICA (penalización exponencial, peso 2.0)
    const peso_conflicto_accesibilidad = 2.0;
    const peso_bloques_consecutivos = 0.08;
    
    for (const d of this.docentes) {
      cargas_docentes[d.id] = 0;
      distribucion_diaria[d.id] = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    }
    
    for (const slot of cromosoma) {
      const tiempo = `${slot.dia}-${slot.periodo}`;
      
      const doc_info = this.docentes.find(d => d.id === slot.docenteId);
      const aula_info = this.aulas.find(a => a.id === slot.aulaId);
      
      if (doc_info) {
        if (distribucion_diaria[doc_info.id] && distribucion_diaria[doc_info.id][slot.dia]) {
          distribucion_diaria[doc_info.id][slot.dia].push({ periodo: slot.periodo, tipo: slot.tipoSlot || 'clase' });
        }
        
        // --- VALIDACIÓN DE INFRAESTRUCTURA & ACCESIBILIDAD ---
        if (doc_info.tieneLimitacionMovilidad && aula_info) {
          const piso_aula = aula_info.piso || 1;
          const tiene_ascensor = aula_info.tieneAscensor || false;
          
          if (piso_aula > 1 && !tiene_ascensor) {
            violaciones += peso_conflicto_accesibilidad;
          }
        }
      }
      
      const doc_key = `${slot.docenteId}-${tiempo}`;
      if (ocupacion_docente[doc_key]) {
        violaciones += this.peso_conflicto_docente;
      } else {
        ocupacion_docente[doc_key] = true;
      }
      
      const aula_key = `${slot.aulaId}-${tiempo}`;
      if (ocupacion_aula[aula_key]) {
        violaciones += this.peso_conflicto_aula;
      } else {
        ocupacion_aula[aula_key] = true;
      }
      
      const paralelo_key = `${slot.paraleloId}-${tiempo}`;
      if (ocupacion_paralelo[paralelo_key]) {
        violaciones += this.peso_conflicto_paralelo;
      } else {
        ocupacion_paralelo[paralelo_key] = true;
      }
      
      if (cargas_docentes[slot.docenteId] !== undefined) {
        cargas_docentes[slot.docenteId] += 1;
      }
    }
    
    for (const doc_id of Object.keys(cargas_docentes)) {
      const horas = cargas_docentes[doc_id];
      const doc_info = this.docentes.find(d => d.id === doc_id);
      if (!doc_info) continue;
      
      const limite_max = doc_info.horasMaximas || 25;
      if (horas > limite_max) {
        violaciones += this.peso_carga_docente * (horas - limite_max);
      } else if (horas < 21) {
        violaciones += this.peso_carga_docente * 0.5 * (21 - horas);
      }
    }

    // 1. Monitoreo de Clases Consecutivas (No más de 3 seguidas sin descanso o planning)
    for (const doc_id of Object.keys(distribucion_diaria)) {
      const dias = distribucion_diaria[doc_id];
      for (const dia of Object.keys(dias)) {
        const slots = dias[Number(dia)];
        if (slots.length > 1) {
          slots.sort((a, b) => a.periodo - b.periodo);
          let consecutivas = 0;
          for (let i = 0; i < slots.length; i++) {
            if (slots[i].tipo === 'clase') {
              consecutivas++;
              if (consecutivas > 3) {
                violaciones += peso_bloques_consecutivos;
              }
            } else {
              consecutivas = 0;
            }
          }
        }
      }
    }
    
    return 1.0 / (1.0 + violaciones);
  }

  private cruzar(padre1: SlotHorarioInfo[], padre2: SlotHorarioInfo[]): [SlotHorarioInfo[], SlotHorarioInfo[]] {
    if (Math.random() < this.tasa_cruce && padre1.length > 1) {
      const punto = Math.floor(Math.random() * (padre1.length - 1)) + 1;
      const hijo1 = [...padre1.slice(0, punto), ...padre2.slice(punto)];
      const hijo2 = [...padre2.slice(0, punto), ...padre1.slice(punto)];
      return [hijo1, hijo2];
    }
    return [[...padre1], [...padre2]];
  }

  private mutar(cromosoma: SlotHorarioInfo[]): SlotHorarioInfo[] {
    // Agrupar por paralelo para evitar generar colisiones de paralelo durante la mutación
    const slots_por_paralelo: Record<string, SlotHorarioInfo[]> = {};
    for (const slot of cromosoma) {
      if (!slots_por_paralelo[slot.paraleloId]) {
        slots_por_paralelo[slot.paraleloId] = [];
      }
      slots_por_paralelo[slot.paraleloId].push(slot);
    }

    for (const pid of Object.keys(slots_por_paralelo)) {
      const slots = slots_por_paralelo[pid];
      for (const slot of slots) {
        if (Math.random() < this.tasa_mutacion) {
          const ocupadas = new Set(slots.filter(s => s !== slot).map(s => `${s.dia}-${s.periodo}`));
          let intentos = 0;
          while (intentos < 10) {
            const dia_nuevo = Math.floor(Math.random() * 5) + 1;
            const per_nuevo = Math.floor(Math.random() * 8) + 1;
            if (!ocupadas.has(`${dia_nuevo}-${per_nuevo}`)) {
              slot.dia = dia_nuevo;
              slot.periodo = per_nuevo;
              break;
            }
            intentos++;
          }
          
          // Mutar Aula
          if (Math.random() < 0.5) {
            slot.aulaId = this.aulas[Math.floor(Math.random() * this.aulas.length)].id;
          }
          
          // Mutar Docente de forma adaptativa
          if (Math.random() < 0.3) {
            const materia = this.asignaturas.find(m => m.id === slot.asignaturaId);
            if (materia) {
              const docentes_aptos = this.docentes.filter(d => d.especialidad === materia.especialidadRequerida);
              if (docentes_aptos.length > 0) {
                slot.docenteId = docentes_aptos[Math.floor(Math.random() * docentes_aptos.length)].id;
              }
            }
          }
        }
      }
    }
    return cromosoma;
  }

  public resolver(): { fitness_score: number; generacion_convergencia: number; horario_generado: SlotHorarioInfo[] } {
    let poblacion = Array.from({ length: this.tamano_poblacion }, () => this.inicializar_cromosoma());
    let mejor_solucion: SlotHorarioInfo[] = [];
    let mejor_fitness = -1.0;
    
    let g = 0;
    for (g = 0; g < this.generaciones; g++) {
      const evaluaciones = poblacion.map(c => this.evaluar_aptitud(c));
      
      evaluaciones.forEach((score, i) => {
        if (score > mejor_fitness) {
          mejor_fitness = score;
          mejor_solucion = [...poblacion[i]];
        }
      });
      
      if (mejor_fitness >= 1.0) {
        break;
      }
      
      const nueva_poblacion: SlotHorarioInfo[][] = [];
      while (nueva_poblacion.length < this.tamano_poblacion) {
        const sel1 = this.seleccionTorneo(evaluaciones, poblacion);
        const sel2 = this.seleccionTorneo(evaluaciones, poblacion);
        
        const [h1, h2] = this.cruzar(sel1, sel2);
        nueva_poblacion.push(this.mutar(h1));
        nueva_poblacion.push(this.mutar(h2));
      }
      
      poblacion = nueva_poblacion.slice(0, this.tamano_poblacion);
    }
    
    return {
      fitness_score: mejor_fitness,
      generacion_convergencia: g,
      horario_generado: mejor_solucion
    };
  }

  private seleccionTorneo(evaluaciones: number[], poblacion: SlotHorarioInfo[][]): SlotHorarioInfo[] {
    const k = 3;
    let mejor_idx = -1;
    let max_score = -1;
    for (let i = 0; i < k; i++) {
      const idx = Math.floor(Math.random() * evaluaciones.length);
      if (evaluaciones[idx] > max_score) {
        max_score = evaluaciones[idx];
        mejor_idx = idx;
      }
    }
    return poblacion[mejor_idx];
  }
}
