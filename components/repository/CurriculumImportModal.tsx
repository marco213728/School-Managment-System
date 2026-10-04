import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Dcd, EvaluationCriterion, EvaluationIndicator, Subject, GradeLevel, Competency, CurricularInsertion } from '../../types';
import { GRADE_LEVELS, COMPETENCIES, CURRICULAR_INSERTIONS } from '../../constants';
import { CloseIcon, UploadIcon, DownloadIcon, CheckCircleIcon, AlertTriangleIcon, SparklesIcon } from '../icons/Icons';
import { saveDocumentsBatch } from '../../lib/firebase';

interface CurriculumImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjects: Subject[];
    existingCriteria: EvaluationCriterion[];
    existingDcds: Dcd[];
    existingIndicators: EvaluationIndicator[];
    institutionId: string;
    onImportSuccess: (imported: {
        criteria: EvaluationCriterion[];
        dcds: Dcd[];
        indicators: EvaluationIndicator[];
    }) => void;
}

type ImportSource = 'file' | 'paste';
type DocumentStructure = 'integrated' | 'ce' | 'dcd' | 'ie';

interface ParsedCriterionRow {
    code: string;
    description: string;
    subjectId: string;
    subjectName: string;
    gradeLevel: GradeLevel;
    isValid: boolean;
    errors: string[];
}

interface ParsedDcdRow {
    code: string;
    description: string;
    subjectId: string;
    subjectName: string;
    gradeLevel: GradeLevel;
    criterionCode: string;
    isDisaggregated: boolean;
    refCode?: string;
    competencies: Competency[];
    curricularInsertions: CurricularInsertion[];
    isValid: boolean;
    errors: string[];
}

interface ParsedIndicatorRow {
    code: string;
    description: string;
    criterionCode: string;
    isValid: boolean;
    errors: string[];
}

// Normalize text: lowercase, remove accents, trim
const normalize = (str: any) => {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
};

export const CurriculumImportModal: React.FC<CurriculumImportModalProps> = ({
    isOpen,
    onClose,
    subjects,
    existingCriteria,
    existingDcds,
    existingIndicators,
    institutionId,
    onImportSuccess
}) => {
    const [source, setSource] = useState<ImportSource>('file');
    const [docStructure, setDocStructure] = useState<DocumentStructure>('integrated');
    const [file, setFile] = useState<File | null>(null);
    const [pastedText, setPastedText] = useState('');
    const [selectedSheet, setSelectedSheet] = useState<string>('');
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Parsed results
    const [parsedCriteria, setParsedCriteria] = useState<ParsedCriterionRow[]>([]);
    const [parsedDcds, setParsedDcds] = useState<ParsedDcdRow[]>([]);
    const [parsedIndicators, setParsedIndicators] = useState<ParsedIndicatorRow[]>([]);
    const [hasParsed, setHasParsed] = useState(false);

    // Track newly detected subjects that need to be created in Firestore
    const autoSubjectsRef = useRef<Map<string, { id: string; name: string }>>(new Map());
    const newDetectedSubjectsRef = useRef<Map<string, Subject>>(new Map());

    if (!isOpen) return null;

    // Helper to match subject from name or text
    const findSubjectId = (subjectText: string): { id: string; name: string } => {
        if (!subjectText || !subjectText.trim()) {
            return { id: subjects[0]?.id || 'subj-gen', name: subjects[0]?.name || 'General' };
        }
        const cleanName = subjectText.trim();
        const norm = normalize(cleanName);
        if (!norm) {
            return { id: subjects[0]?.id || 'subj-gen', name: subjects[0]?.name || 'General' };
        }

        // Direct match
        const direct = subjects.find(s => s && normalize(s.name) === norm);
        if (direct) return { id: direct.id, name: direct.name };

        // Partial match
        const partial = subjects.find(s => {
            if (!s || !s.name) return false;
            const sNorm = normalize(s.name);
            return sNorm && (norm === sNorm || norm.includes(sNorm) || sNorm.includes(norm));
        });
        if (partial) return { id: partial.id, name: partial.name };

        // Keyword based
        if (norm.includes('inicial') || norm.includes('preparatoria') || norm.includes('infantil')) {
            const ini = subjects.find(s => s && s.name && (normalize(s.name).includes('inicial') || normalize(s.name).includes('preparatoria')));
            if (ini) return { id: ini.id, name: ini.name };
        }
        if (norm.includes('matemat')) {
            const m = subjects.find(s => s && s.name && normalize(s.name).includes('matemat'));
            if (m) return { id: m.id, name: m.name };
        }
        if (norm.includes('lengua') || norm.includes('literat')) {
            const l = subjects.find(s => s && s.name && (normalize(s.name).includes('lengua') || normalize(s.name).includes('literat')));
            if (l) return { id: l.id, name: l.name };
        }
        if (norm.includes('social') || norm.includes('histor')) {
            const s = subjects.find(s => s && s.name && (normalize(s.name).includes('social') || normalize(s.name).includes('histor')));
            if (s) return { id: s.id, name: s.name };
        }
        if (norm.includes('natural') || norm.includes('biolog') || norm.includes('quimic') || norm.includes('fisic')) {
            const n = subjects.find(s => s && s.name && (normalize(s.name).includes('natural') || normalize(s.name).includes('biolog')));
            if (n) return { id: n.id, name: n.name };
        }
        if (norm.includes('ingles') || norm.includes('english')) {
            const i = subjects.find(s => s && s.name && (normalize(s.name).includes('ingles') || normalize(s.name).includes('english')));
            if (i) return { id: i.id, name: i.name };
        }
        if (norm.includes('educacion fisica') || norm.includes('fisica') || norm.includes('ed. fis')) {
            const ef = subjects.find(s => s && s.name && (normalize(s.name).includes('educacion fisica') || normalize(s.name).includes('fisica')));
            if (ef) return { id: ef.id, name: ef.name };
        }

        // If not in the current catalog, create a dedicated subject entry instead of incorrectly assigning to subjects[0]
        if (autoSubjectsRef.current.has(norm)) {
            return autoSubjectsRef.current.get(norm)!;
        }

        const slugId = `subj-${norm.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now()}`;
        const newSubjInfo = { id: slugId, name: cleanName };
        autoSubjectsRef.current.set(norm, newSubjInfo);

        newDetectedSubjectsRef.current.set(slugId, {
            id: slugId,
            institutionId: institutionId || 'GLOBAL',
            name: cleanName,
            teacherId: '',
            areaOfKnowledge: cleanName,
            level: 'Todos',
            isModule: false
        });

        return newSubjInfo;
    };

    // Helper to normalize GradeLevel
    const matchGradeLevel = (levelText: string): GradeLevel => {
        if (!levelText) return 'EGB Superior';
        const norm = normalize(levelText);
        if (norm.includes('superior') || norm.includes('8') || norm.includes('9') || norm.includes('10')) return 'EGB Superior';
        if (norm.includes('media') || norm.includes('5') || norm.includes('6') || norm.includes('7')) return 'EGB Media';
        if (norm.includes('elemental') || norm.includes('2') || norm.includes('3') || norm.includes('4')) return 'EGB Elemental';
        if (norm.includes('bachillerato') || norm.includes('bgu') || norm.includes('1ro') || norm.includes('2do') || norm.includes('3ro')) return 'BGU';
        if (norm.includes('preparatoria') || norm.includes('1er')) return 'Preparatoria';
        if (norm.includes('inicial')) return 'Inicial';
        return 'EGB Superior';
    };

    // Extract code and text from mixed string like "CE.M.4.1. Emplea las relaciones de orden..."
    const splitCodeAndText = (input: any, prefixRegex: RegExp): { code: string; text: string } => {
        if (!input) return { code: '', text: '' };
        const clean = String(input || '').trim();
        if (!clean) return { code: '', text: '' };
        const match = clean.match(prefixRegex);
        if (match && match[0]) {
            const code = String(match[0] || '').trim().replace(/[:.-]+$/, '');
            const text = (clean || '').substring(match[0].length).replace(/^[:.-]+/, '').trim();
            return { code, text: text || clean };
        }
        return { code: '', text: clean };
    };

    // Parse Competencies from string
    const parseCompetencies = (text: string): Competency[] => {
        if (!text) return [];
        const norm = normalize(text);
        const res: Competency[] = [];
        if (norm.includes('comunicacion') || norm.includes('cc')) res.push('Comunicacionales');
        if (norm.includes('matemat') || norm.includes('cm')) res.push('Matemáticas');
        if (norm.includes('digital') || norm.includes('cd')) res.push('Digitales');
        if (norm.includes('socioemocion') || norm.includes('cs')) res.push('Socioemocionales');
        return res;
    };

    // Parse Curricular Insertions from string
    const parseInsertions = (text: string): CurricularInsertion[] => {
        if (!text) return [];
        const norm = normalize(text);
        const res: CurricularInsertion[] = [];
        if (norm.includes('civic') || norm.includes('integrid')) res.push('Educación Cívica, Ética e Integridad');
        if (norm.includes('financier')) res.push('Educación Financiera');
        if (norm.includes('sostenib') || norm.includes('ambient')) res.push('Educación para el Desarrollo Sostenible');
        if (norm.includes('socioemocional')) res.push('Educación Socioemocional');
        if (norm.includes('riesgo') || norm.includes('seguridad')) res.push('Educación para la Seguridad y Gestión de Riesgos');
        return res;
    };

    // Read and parse raw tabular data (array of objects with header keys)
    const processRawData = (rows: Record<string, any>[]) => {
        if (!rows || rows.length === 0) {
            setErrorMsg('El documento no contiene filas con datos válidos.');
            return;
        }

        const criteriaList: ParsedCriterionRow[] = [];
        const dcdList: ParsedDcdRow[] = [];
        const indicatorList: ParsedIndicatorRow[] = [];

        // Helper to find column value by multiple possible header names
        const getCol = (row: Record<string, any>, possibleNames: string[]): string => {
            const keys = Object.keys(row);
            for (const name of possibleNames) {
                const targetNorm = normalize(name);
                const foundKey = keys.find(k => {
                    const kNorm = normalize(k);
                    return kNorm === targetNorm || kNorm.includes(targetNorm);
                });
                if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
                    return String(row[foundKey]).trim();
                }
            }
            return '';
        };

        // Cache seen criteria codes in this import
        const criteriaByCode = new Map<string, ParsedCriterionRow>();
        let lastSeenCeCode = '';
        let lastSeenSubject = subjects[0] || { id: 'sub-mat', name: 'Matemática' };
        let lastSeenGradeLevel: GradeLevel = 'EGB Superior';

        const CE_REGEX = /^CE\.[A-Z]+(\.[A-Z]+)?\.[0-9]+(\.[0-9]+)*\.?/i;
        const DCD_REGEX = /^[A-Z]+(\.[A-Z]+)?\.[0-9]+(\.[0-9]+)+(\.[0-9]+)*\.?/i;
        const IE_REGEX = /^I\.[A-Z]+(\.[A-Z]+)?\.[0-9]+(\.[0-9]+)*\.?/i;

        rows.forEach((row, idx) => {
            // Check for Subject and GradeLevel in this row
            const subjectRaw = getCol(row, ['asignatura', 'materia', 'area', 'área', 'subject']);
            const gradeLevelRaw = getCol(row, ['nivel', 'subnivel', 'grado', 'curso', 'gradelevel']);
            
            if (subjectRaw) {
                lastSeenSubject = findSubjectId(subjectRaw);
            }
            if (gradeLevelRaw) {
                lastSeenGradeLevel = matchGradeLevel(gradeLevelRaw);
            }

            const matchedSubject = lastSeenSubject;
            const matchedGradeLevel = lastSeenGradeLevel;

            // Extract all cell values for fallback cell-sniffing
            const allCellValues = Object.values(row).map(v => String(v || '').trim()).filter(v => v.length > 0);

            if (docStructure === 'integrated') {
                // MINEDUC UNIFIED MATRIX FORMAT
                // 1. Criterio de Evaluación
                const ceCodeRaw = getCol(row, ['codigo_ce', 'codigo criterio', 'cod_ce', 'ce_code', 'ce', 'codigo']);
                let ceDescRaw = getCol(row, ['criterio de evaluacion', 'criterios de evaluacion', 'criterio evaluacion', 'criterios evaluacion', 'criterio', 'criterios', 'descripcion_ce', 'ce_desc']);
                
                let ceCode = ceCodeRaw;
                let ceDesc = ceDescRaw;

                // Fallback: sniff cell with CE code
                if (!ceCode && !ceDesc) {
                    const foundCeCell = allCellValues.find(v => /^CE\.[A-Z]+/i.test(v));
                    if (foundCeCell) {
                        ceDesc = foundCeCell;
                    }
                }

                if (!ceCode && ceDesc) {
                    const split = splitCodeAndText(ceDesc, CE_REGEX);
                    if (split.code) {
                        ceCode = split.code;
                        ceDesc = split.text;
                    }
                }
                if (ceCode && !ceCode.endsWith('.')) ceCode += '.';

                if (ceCode) {
                    lastSeenCeCode = ceCode;
                } else if (lastSeenCeCode) {
                    ceCode = lastSeenCeCode;
                }

                if (ceCode && ceDesc && !criteriaByCode.has(ceCode)) {
                    const critObj: ParsedCriterionRow = {
                        code: ceCode,
                        description: ceDesc,
                        subjectId: matchedSubject.id,
                        subjectName: matchedSubject.name,
                        gradeLevel: matchedGradeLevel,
                        isValid: Boolean(ceCode && ceDesc),
                        errors: []
                    };
                    criteriaByCode.set(ceCode, critObj);
                    criteriaList.push(critObj);
                }

                // 2. Destreza DCD
                const dcdCodeRaw = getCol(row, ['codigo_dcd', 'codigo destreza', 'cod_dcd', 'dcd_code', 'dcd']);
                let dcdDescRaw = getCol(row, ['destreza con criterio de desempeno', 'destrezas con criterio de desempeno', 'destrezas con criterios de desempeno', 'destreza con criterios de desempeno', 'destreza', 'destrezas', 'dcd', 'descripcion_dcd', 'dcd_desc', 'contenido']);
                let dcdCode = dcdCodeRaw;
                let dcdDesc = dcdDescRaw;

                // Fallback: sniff cell with DCD code
                if (!dcdCode && !dcdDesc) {
                    const foundDcdCell = allCellValues.find(v => DCD_REGEX.test(v) && !/^CE\./i.test(v) && !/^I\./i.test(v));
                    if (foundDcdCell) {
                        dcdDesc = foundDcdCell;
                    }
                }

                if (!dcdCode && dcdDesc) {
                    const split = splitCodeAndText(dcdDesc, DCD_REGEX);
                    if (split.code) {
                        dcdCode = split.code;
                        dcdDesc = split.text;
                    }
                }
                if (dcdCode && !dcdCode.endsWith('.')) dcdCode += '.';

                if (dcdCode || dcdDesc) {
                    const compRaw = getCol(row, ['competencias', 'competencias priorizadas']);
                    const insRaw = getCol(row, ['inserciones', 'inserciones curriculares']);
                    const desagregadaRaw = getCol(row, ['desagregada', 'es desagregada', 'desagregado']);
                    const isDisaggregated = ['si', 'sí', 'true', '1', 'x'].includes(normalize(desagregadaRaw));
                    const refCode = getCol(row, ['ref', 'referencia', 'codigo_ref', 'refcode']);

                    const dcdObj: ParsedDcdRow = {
                        code: dcdCode || `DCD-${idx + 1}`,
                        description: dcdDesc || 'Sin descripción',
                        subjectId: matchedSubject.id,
                        subjectName: matchedSubject.name,
                        gradeLevel: matchedGradeLevel,
                        criterionCode: ceCode || lastSeenCeCode || '',
                        isDisaggregated,
                        refCode: refCode || undefined,
                        competencies: parseCompetencies(compRaw),
                        curricularInsertions: parseInsertions(insRaw),
                        isValid: Boolean(dcdCode && dcdDesc),
                        errors: []
                    };
                    if (!dcdDesc) dcdObj.errors.push('Falta descripción de destreza');
                    dcdList.push(dcdObj);
                }

                // 3. Indicador de Evaluación IE
                const ieCodeRaw = getCol(row, ['codigo_ie', 'codigo indicador', 'cod_ie', 'ie_code', 'ie']);
                let ieDescRaw = getCol(row, ['indicador de evaluacion', 'indicadores de evaluacion', 'indicadores para la evaluacion del criterio', 'indicador evaluacion', 'indicadores evaluacion', 'indicador', 'indicadores', 'descripcion_ie', 'ie_desc']);
                let ieCode = ieCodeRaw;
                let ieDesc = ieDescRaw;

                // Fallback: sniff cell with IE code
                if (!ieCode && !ieDesc) {
                    const foundIeCell = allCellValues.find(v => IE_REGEX.test(v));
                    if (foundIeCell) {
                        ieDesc = foundIeCell;
                    }
                }

                if (!ieCode && ieDesc) {
                    const split = splitCodeAndText(ieDesc, IE_REGEX);
                    if (split.code) {
                        ieCode = split.code;
                        ieDesc = split.text;
                    }
                }
                if (ieCode && !ieCode.endsWith('.')) ieCode += '.';

                if (ieCode || ieDesc) {
                    const ieObj: ParsedIndicatorRow = {
                        code: ieCode || `IE-${idx + 1}`,
                        description: ieDesc || 'Sin descripción',
                        criterionCode: ceCode || lastSeenCeCode || '',
                        isValid: Boolean(ieCode && ieDesc),
                        errors: []
                    };
                    if (!ieDesc) ieObj.errors.push('Falta descripción del indicador');
                    indicatorList.push(ieObj);
                }

            } else if (docStructure === 'ce') {
                // SOLO CRITERIOS
                const codeRaw = getCol(row, ['codigo', 'code', 'cod', 'código']);
                let descRaw = getCol(row, ['descripcion', 'criterio', 'description', 'detalle', 'criterios']);
                if (!descRaw && !codeRaw) {
                    const cell = allCellValues.find(v => /^CE\./i.test(v)) || allCellValues[0];
                    if (cell) descRaw = cell;
                }
                let code = codeRaw;
                let desc = descRaw;
                if (!code && desc) {
                    const split = splitCodeAndText(desc, CE_REGEX);
                    if (split.code) { code = split.code; desc = split.text; }
                }
                if (code && !code.endsWith('.')) code += '.';

                const critObj: ParsedCriterionRow = {
                    code: code || `CE-${idx + 1}`,
                    description: desc || 'Sin descripción',
                    subjectId: matchedSubject.id,
                    subjectName: matchedSubject.name,
                    gradeLevel: matchedGradeLevel,
                    isValid: Boolean(code && desc),
                    errors: !desc ? ['Falta descripción'] : []
                };
                criteriaList.push(critObj);

            } else if (docStructure === 'dcd') {
                // SOLO DESTREZAS
                const codeRaw = getCol(row, ['codigo', 'code', 'cod', 'código']);
                let descRaw = getCol(row, ['descripcion', 'destreza', 'description', 'detalle', 'destrezas', 'contenido']);
                if (!descRaw && !codeRaw) {
                    const cell = allCellValues.find(v => DCD_REGEX.test(v)) || allCellValues[0];
                    if (cell) descRaw = cell;
                }
                const critCodeRaw = getCol(row, ['criterio', 'criterion', 'criterio_ref', 'ce', 'codigo_ce']);
                let code = codeRaw;
                let desc = descRaw;
                if (!code && desc) {
                    const split = splitCodeAndText(desc, DCD_REGEX);
                    if (split.code) { code = split.code; desc = split.text; }
                }
                if (code && !code.endsWith('.')) code += '.';

                const compRaw = getCol(row, ['competencias', 'competencies']);
                const insRaw = getCol(row, ['inserciones', 'inserciones curriculares', 'insertions']);
                const desagregadaRaw = getCol(row, ['desagregada', 'isdisaggregated']);
                const isDisaggregated = ['si', 'sí', 'true', '1'].includes(normalize(desagregadaRaw));
                const refCode = getCol(row, ['ref', 'referencia', 'refcode']);

                const dcdObj: ParsedDcdRow = {
                    code: code || `DCD-${idx + 1}`,
                    description: desc || 'Sin descripción',
                    subjectId: matchedSubject.id,
                    subjectName: matchedSubject.name,
                    gradeLevel: matchedGradeLevel,
                    criterionCode: critCodeRaw || '',
                    isDisaggregated,
                    refCode: refCode || undefined,
                    competencies: parseCompetencies(compRaw),
                    curricularInsertions: parseInsertions(insRaw),
                    isValid: Boolean(code && desc),
                    errors: !desc ? ['Falta descripción'] : []
                };
                dcdList.push(dcdObj);

            } else if (docStructure === 'ie') {
                // SOLO INDICADORES
                const codeRaw = getCol(row, ['codigo', 'code', 'cod', 'código']);
                let descRaw = getCol(row, ['descripcion', 'indicador', 'description', 'detalle', 'indicadores']);
                if (!descRaw && !codeRaw) {
                    const cell = allCellValues.find(v => IE_REGEX.test(v)) || allCellValues[0];
                    if (cell) descRaw = cell;
                }
                const critCodeRaw = getCol(row, ['criterio', 'criterion', 'criterio_ref', 'ce', 'codigo_ce']);
                let code = codeRaw;
                let desc = descRaw;
                if (!code && desc) {
                    const split = splitCodeAndText(desc, IE_REGEX);
                    if (split.code) { code = split.code; desc = split.text; }
                }
                if (code && !code.endsWith('.')) code += '.';

                const ieObj: ParsedIndicatorRow = {
                    code: code || `IE-${idx + 1}`,
                    description: desc || 'Sin descripción',
                    criterionCode: critCodeRaw || '',
                    isValid: Boolean(code && desc),
                    errors: !desc ? ['Falta descripción'] : []
                };
                indicatorList.push(ieObj);
            }
        });

        setParsedCriteria(criteriaList);
        setParsedDcds(dcdList);
        setParsedIndicators(indicatorList);
        setHasParsed(true);

        const totalItems = criteriaList.length + dcdList.length + indicatorList.length;
        if (totalItems === 0) {
            setErrorMsg('No se detectaron elementos curriculares con las columnas identificadas. Por favor revise el formato o descargue la plantilla.');
        } else {
            setErrorMsg(null);
        }
    };

    // Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setErrorMsg(null);
        setHasParsed(false);

        const reader = new FileReader();
        if (selected.name.endsWith('.xlsx') || selected.name.endsWith('.xls')) {
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const wb = XLSX.read(data, { type: 'array' });
                    setWorkbook(wb);
                    setSheetNames(wb.SheetNames);
                    setSelectedSheet(wb.SheetNames[0] || '');
                } catch (err: any) {
                    setErrorMsg('Error al leer el archivo Excel: ' + err.message);
                }
            };
            reader.readAsArrayBuffer(selected);
        } else {
            // CSV file
            reader.onload = (event) => {
                try {
                    const text = event.target?.result as string;
                    setWorkbook(null);
                    setSheetNames([]);
                    setSelectedSheet('');
                    parseCsvText(text);
                } catch (err: any) {
                    setErrorMsg('Error al leer el archivo CSV: ' + err.message);
                }
            };
            reader.readAsText(selected);
        }
    };

    // Helper to find header row if document has leading title rows
    const normalizeSheetRows = (sheet: XLSX.WorkSheet): Record<string, any>[] => {
        let jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
        if (jsonRows.length === 0) return [];

        // Check if the header row is buried in the first 5 rows (due to title/metadata rows)
        let headerRowIdx = -1;
        for (let r = 0; r < Math.min(jsonRows.length, 6); r++) {
            const vals = Object.values(jsonRows[r]).map(v => normalize(String(v)));
            const matchCount = vals.filter(v => 
                v.includes('criterio') || v.includes('destreza') || v.includes('indicador') || 
                v.includes('codigo') || v.includes('cod') || v.includes('asignatura') || 
                v.includes('dcd') || v.includes('descripcion') || v.includes('competencia')
            ).length;
            if (matchCount >= 2) {
                headerRowIdx = r;
                break;
            }
        }

        if (headerRowIdx >= 0) {
            const oldKeys = Object.keys(jsonRows[0]);
            const newHeaders = oldKeys.map(k => String(jsonRows[headerRowIdx][k] || k).trim());
            const remapped: Record<string, any>[] = [];
            for (let i = headerRowIdx + 1; i < jsonRows.length; i++) {
                const newRow: Record<string, any> = {};
                oldKeys.forEach((oldK, kIdx) => {
                    newRow[newHeaders[kIdx] || oldK] = jsonRows[i][oldK];
                });
                remapped.push(newRow);
            }
            if (remapped.length > 0) {
                return remapped;
            }
        }

        return jsonRows;
    };

    // Parse CSV Text with delimiter detection and quote support
    const parseCsvText = (csvString: string) => {
        setIsParsing(true);
        try {
            if (!csvString || !csvString.trim()) {
                setErrorMsg('El texto proporcionado está vacío.');
                return;
            }
            // Use XLSX utility to parse CSV text into json rows cleanly
            const wb = XLSX.read(csvString, { type: 'string', raw: true });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const jsonRows = normalizeSheetRows(sheet);
            processRawData(jsonRows);
        } catch (err: any) {
            setErrorMsg('Error al procesar el texto: ' + err.message);
        } finally {
            setIsParsing(false);
        }
    };

    // Parse Selected Sheet in Workbook
    const parseSelectedSheet = () => {
        if (!workbook || !selectedSheet) return;
        setIsParsing(true);
        try {
            const sheet = workbook.Sheets[selectedSheet];
            const jsonRows = normalizeSheetRows(sheet);
            processRawData(jsonRows);
        } catch (err: any) {
            setErrorMsg('Error al procesar la hoja de cálculo: ' + err.message);
        } finally {
            setIsParsing(false);
        }
    };

    // Handle Parse Text (from copy/paste tab)
    const handleParsePastedText = () => {
        if (!pastedText.trim()) {
            setErrorMsg('Pegue el contenido de su tabla antes de analizar.');
            return;
        }
        parseCsvText(pastedText);
    };

    // Execute Import and Save
    const handleExecuteImport = async () => {
        setIsSaving(true);
        setErrorMsg(null);
        try {
            const instId = institutionId || 'GLOBAL';

            // 1. Process Criteria
            const newCriteriaToSave: EvaluationCriterion[] = [];
            const criteriaCodeToId = new Map<string, string>();
            (existingCriteria || []).forEach(c => {
                if (c && c.code) {
                    const cleanCode = String(c.code).trim();
                    if (cleanCode) {
                        criteriaCodeToId.set(cleanCode, c.id);
                    }
                }
            });

            parsedCriteria.forEach(pc => {
                if (!pc) return;
                const pcCode = String(pc.code || '').trim();
                const existing = (existingCriteria || []).find(c => c && String(c.code || '').trim() === pcCode);
                const id = existing ? existing.id : `ce-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
                const item: EvaluationCriterion = {
                    id,
                    institutionId: instId,
                    code: pcCode || `CE.${Date.now()}`,
                    description: pc.description || '',
                    subjectId: pc.subjectId || '',
                    gradeLevel: pc.gradeLevel
                };
                newCriteriaToSave.push(item);
                if (pcCode) {
                    criteriaCodeToId.set(pcCode, id);
                }
            });

            // 2. Process DCDs
            const newDcdsToSave: Dcd[] = [];
            parsedDcds.forEach(pd => {
                if (!pd) return;
                const pdCode = String(pd.code || '').trim();
                const existing = (existingDcds || []).find(d => d && String(d.code || '').trim() === pdCode);
                const id = existing ? existing.id : `dcd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
                
                // Link criterionId
                let criterionId = '';
                const critCode = String(pd.criterionCode || '').trim();
                if (critCode && criteriaCodeToId.has(critCode)) {
                    criterionId = criteriaCodeToId.get(critCode)!;
                } else if (existingCriteria && existingCriteria.length > 0 && existingCriteria[0]?.id) {
                    criterionId = existingCriteria[0].id;
                } else if (newCriteriaToSave.length > 0 && newCriteriaToSave[0]?.id) {
                    criterionId = newCriteriaToSave[0].id;
                }

                const item: Dcd = {
                    id,
                    code: pdCode || `DCD.${Date.now()}`,
                    description: pd.description || '',
                    subjectId: pd.subjectId || '',
                    gradeLevel: pd.gradeLevel,
                    criterionId,
                    competencies: pd.competencies || [],
                    curricularInsertions: pd.curricularInsertions && pd.curricularInsertions.length > 0 ? pd.curricularInsertions : undefined,
                    isDisaggregated: !!pd.isDisaggregated,
                    refCode: pd.refCode ? String(pd.refCode).trim() : undefined
                };
                newDcdsToSave.push(item);
            });

            // 3. Process Indicators
            const newIndicatorsToSave: EvaluationIndicator[] = [];
            parsedIndicators.forEach(pi => {
                if (!pi) return;
                const piCode = String(pi.code || '').trim();
                const existing = (existingIndicators || []).find(i => i && String(i.code || '').trim() === piCode);
                const id = existing ? existing.id : `ie-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

                let criterionId = '';
                const critCode = String(pi.criterionCode || '').trim();
                if (critCode && criteriaCodeToId.has(critCode)) {
                    criterionId = criteriaCodeToId.get(critCode)!;
                } else if (existingCriteria && existingCriteria.length > 0 && existingCriteria[0]?.id) {
                    criterionId = existingCriteria[0].id;
                } else if (newCriteriaToSave.length > 0 && newCriteriaToSave[0]?.id) {
                    criterionId = newCriteriaToSave[0].id;
                }

                const item: EvaluationIndicator = {
                    id,
                    institutionId: instId,
                    code: piCode || `I.${Date.now()}`,
                    description: pi.description || '',
                    criterionId
                };
                newIndicatorsToSave.push(item);
            });

            // 4. Batch Save to Firestore
            const batchOperations: { collectionName: string; id: string; data: any }[] = [];
            newDetectedSubjectsRef.current.forEach(s => batchOperations.push({ collectionName: 'subjects', id: s.id, data: s }));
            newCriteriaToSave.forEach(c => batchOperations.push({ collectionName: 'evaluation_criteria', id: c.id, data: c }));
            newDcdsToSave.forEach(d => batchOperations.push({ collectionName: 'dcds', id: d.id, data: d }));
            newIndicatorsToSave.forEach(i => batchOperations.push({ collectionName: 'evaluation_indicators', id: i.id, data: i }));

            if (batchOperations.length > 0) {
                await saveDocumentsBatch(batchOperations);
            }

            // Merge with existing
            const finalCriteria = [...(existingCriteria || [])];
            newCriteriaToSave.forEach(nc => {
                const idx = finalCriteria.findIndex(c => c && c.id === nc.id);
                if (idx > -1) finalCriteria[idx] = nc;
                else finalCriteria.push(nc);
            });

            const finalDcds = [...(existingDcds || [])];
            newDcdsToSave.forEach(nd => {
                const idx = finalDcds.findIndex(d => d && d.id === nd.id);
                if (idx > -1) finalDcds[idx] = nd;
                else finalDcds.push(nd);
            });

            const finalIndicators = [...(existingIndicators || [])];
            newIndicatorsToSave.forEach(ni => {
                const idx = finalIndicators.findIndex(i => i && i.id === ni.id);
                if (idx > -1) finalIndicators[idx] = ni;
                else finalIndicators.push(ni);
            });

            onImportSuccess({
                criteria: finalCriteria,
                dcds: finalDcds,
                indicators: finalIndicators
            });

            setSuccessMsg(`¡Importación exitosa! Se procesaron: ${newCriteriaToSave.length} Criterios, ${newDcdsToSave.length} Destrezas y ${newIndicatorsToSave.length} Indicadores.`);
            setTimeout(() => {
                onClose();
            }, 1800);

        } catch (err: any) {
            console.error('Error al guardar datos curriculares:', err);
            setErrorMsg('Error al guardar datos curriculares: ' + (err?.message || String(err)));
        } finally {
            setIsSaving(false);
        }
    };

    // Generate and Download Excel Template
    const handleDownloadExcelTemplate = () => {
        const sampleRows = [
            {
                'ASIGNATURA': 'Lengua y Literatura',
                'SUBNIVEL': 'EGB Superior',
                'CODIGO_CE': 'CE.LL.4.1.',
                'CRITERIO_EVALUACION': 'Explica los aportes de la cultura escrita al desarrollo histórico, social y cultural de la humanidad y valora la diversidad del mundo expresada en textos escritos.',
                'CODIGO_DCD': 'LL.4.1.1.',
                'DESTREZA_DCD': 'Indagar y explicar los aportes de la cultura escrita al desarrollo histórico, social y cultural de la humanidad.',
                'CODIGO_IE': 'I.LL.4.1.1.',
                'INDICADOR_EVALUACION': 'Explica el origen, el desarrollo y la influencia de la escritura en distintos momentos históricos, regiones del mundo y culturas del pasado. (I.3., S.1.)',
                'COMPETENCIAS': 'Comunicacionales, Socioemocionales',
                'INSERCIONES': 'Educación Cívica, Ética e Integridad',
                'DESAGREGADA': 'NO',
                'REFERENCIA': ''
            },
            {
                'ASIGNATURA': 'Lengua y Literatura',
                'SUBNIVEL': 'EGB Superior',
                'CODIGO_CE': 'CE.LL.4.1.',
                'CRITERIO_EVALUACION': 'Explica los aportes de la cultura escrita al desarrollo histórico, social y cultural de la humanidad y valora la diversidad del mundo expresada en textos escritos.',
                'CODIGO_DCD': 'LL.4.1.2.',
                'DESTREZA_DCD': 'Valorar la diversidad cultural del mundo expresada en textos escritos representativos de las diferentes culturas humanas en diversas épocas históricas.',
                'CODIGO_IE': 'I.LL.4.1.2.',
                'INDICADOR_EVALUACION': 'Valora la diversidad cultural del mundo expresada en textos escritos representativos en diversas épocas históricas. (J.1., I.2.)',
                'COMPETENCIAS': 'Comunicacionales, Digitales',
                'INSERCIONES': 'Educación para el Desarrollo Sostenible',
                'DESAGREGADA': 'NO',
                'REFERENCIA': ''
            },
            {
                'ASIGNATURA': 'Matemáticas',
                'SUBNIVEL': 'EGB Superior',
                'CODIGO_CE': 'CE.M.4.1.',
                'CRITERIO_EVALUACION': 'Emplea las relaciones de orden, las operaciones con distintos conjuntos numéricos y propiedades algebraicas para formular y resolver problemas.',
                'CODIGO_DCD': 'M.4.1.1.',
                'DESTREZA_DCD': 'Reconocer los elementos del conjunto de números enteros Z, ejemplificando situaciones reales en las que se utilizan números enteros negativos.',
                'CODIGO_IE': 'I.M.4.1.1.',
                'INDICADOR_EVALUACION': 'Ejemplifica situaciones reales en las que se utilizan los números enteros; establece relaciones de orden empleando la recta numérica. (I.4.)',
                'COMPETENCIAS': 'Matemáticas',
                'INSERCIONES': 'Educación Financiera',
                'DESAGREGADA': 'NO',
                'REFERENCIA': ''
            },
            {
                'ASIGNATURA': 'Ciencias Naturales',
                'SUBNIVEL': 'EGB Superior',
                'CODIGO_CE': 'CE.CN.4.1.',
                'CRITERIO_EVALUACION': 'Explica a partir de la indagación y experimentación las propiedades de la materia y las leyes de la física y química.',
                'CODIGO_DCD': 'CN.4.1.1.',
                'DESTREZA_DCD': 'Indagar y explicar las propiedades de la materia y clasificarla por su estado físico y composición en sustancias puras y mezclas.',
                'CODIGO_IE': 'I.CN.4.1.1.',
                'INDICADOR_EVALUACION': 'Analiza el nivel de complejidad de la materia a partir de la experimentación y diferenciación de estados físicos. (J.3.)',
                'COMPETENCIAS': 'Digitales, Matemáticas',
                'INSERCIONES': 'Educación para la Seguridad y Gestión de Riesgos',
                'DESAGREGADA': 'NO',
                'REFERENCIA': ''
            }
        ];

        const ws = XLSX.utils.json_to_sheet(sampleRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Matriz_Curricular_MinEduc');
        XLSX.writeFile(wb, 'Plantilla_Repositorio_Curricular_Amauta.xlsx');
    };

    // Download CSV template
    const handleDownloadCsvTemplate = () => {
        const headers = 'ASIGNATURA;SUBNIVEL;CODIGO_CE;CRITERIO_EVALUACION;CODIGO_DCD;DESTREZA_DCD;CODIGO_IE;INDICADOR_EVALUACION;COMPETENCIAS;INSERCIONES;DESAGREGADA;REFERENCIA';
        const row1 = 'Lengua y Literatura;EGB Superior;CE.LL.4.1.;Explica los aportes de la cultura escrita al desarrollo historico y social.;LL.4.1.1.;Indagar y explicar los aportes de la cultura escrita.;I.LL.4.1.1.;Explica el origen y desarrollo de la escritura.;Comunicacionales;Educacion Civica;NO;';
        const row2 = 'Matemáticas;EGB Superior;CE.M.4.1.;Emplea relaciones de orden y operaciones con numeros enteros.;M.4.1.1.;Reconocer los elementos del conjunto Z.;I.M.4.1.1.;Ejemplifica situaciones reales con enteros.;Matematicas;Educacion Financiera;NO;';
        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, row1, row2].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'Plantilla_Curricular_MinEduc.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col relative my-auto animate-fade-in border border-slate-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/80 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-100 text-primary-700 rounded-xl">
                            <UploadIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Importador Curricular Compatible (MinEduc Ecuador)
                            </h2>
                            <p className="text-xs text-slate-500">
                                Compatible con matrices de Excel (.xlsx, .xls), archivos CSV delimitados y tablas copiadas.
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Notifications */}
                    {errorMsg && (
                        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-start gap-3">
                            <AlertTriangleIcon className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                            <div>{errorMsg}</div>
                        </div>
                    )}
                    {successMsg && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-3">
                            <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <div className="font-semibold">{successMsg}</div>
                        </div>
                    )}

                    {/* Step 1: Format & Source Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-2">
                                1. Formato o Estructura del Documento
                            </label>
                            <select
                                value={docStructure}
                                onChange={(e) => {
                                    setDocStructure(e.target.value as DocumentStructure);
                                    setHasParsed(false);
                                }}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="integrated">★ Matriz Unificada MinEduc (Criterios + Destrezas + Indicadores)</option>
                                <option value="ce">Solo Criterios de Evaluación (CE)</option>
                                <option value="dcd">Solo Destrezas con Criterio de Desempeño (DCD)</option>
                                <option value="ie">Solo Indicadores de Evaluación (IE)</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-2">
                                {docStructure === 'integrated' && 'Recomendado: importa matrices completas del Ministerio de Educación donde cada fila asocia CE, DCD e IE.'}
                                {docStructure === 'ce' && 'Importa tablas exclusivas con listado de Criterios de Evaluación (código, descripción, asignatura, nivel).'}
                                {docStructure === 'dcd' && 'Importa listados de Destrezas DCD (código, descripción, criterio asociado, competencias).'}
                                {docStructure === 'ie' && 'Importa listados de Indicadores IE (código, descripción, criterio asociado).'}
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-2">
                                2. Origen del Documento
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setSource('file'); setHasParsed(false); }}
                                    className={`py-2 px-3 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition ${source === 'file' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                                >
                                    <UploadIcon className="h-4 w-4" />
                                    Subir Archivo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setSource('paste'); setHasParsed(false); }}
                                    className={`py-2 px-3 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition ${source === 'paste' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                                >
                                    <SparklesIcon className="h-4 w-4" />
                                    Pegar Tabla
                                </button>
                            </div>

                            {/* Download Templates */}
                            <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-200">
                                <span className="text-xs text-slate-500 font-medium">Plantillas de ejemplo:</span>
                                <button
                                    type="button"
                                    onClick={handleDownloadExcelTemplate}
                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100 transition"
                                >
                                    <DownloadIcon className="h-3 w-3" />
                                    Excel (.xlsx)
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownloadCsvTemplate}
                                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 flex items-center gap-1 hover:bg-blue-100 transition"
                                >
                                    <DownloadIcon className="h-3 w-3" />
                                    CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Input Area */}
                    {source === 'file' ? (
                        <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition text-center">
                            <input
                                type="file"
                                id="curriculum-file-input"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label htmlFor="curriculum-file-input" className="cursor-pointer flex flex-col items-center">
                                <UploadIcon className="h-10 w-10 text-primary-500 mb-2" />
                                <span className="text-sm font-bold text-slate-800">
                                    {file ? file.name : 'Haz clic para seleccionar tu archivo Excel o CSV'}
                                </span>
                                <span className="text-xs text-slate-500 mt-1">
                                    Formatos compatibles: Microsoft Excel (.xlsx, .xls) y CSV (.csv delimitado por coma o punto y coma)
                                </span>
                            </label>

                            {/* Excel Sheet selector if multiple sheets */}
                            {sheetNames.length > 1 && (
                                <div className="mt-4 inline-flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                                    <span className="text-xs font-semibold text-slate-700">Seleccionar Hoja de Excel:</span>
                                    <select
                                        value={selectedSheet}
                                        onChange={(e) => setSelectedSheet(e.target.value)}
                                        className="text-xs p-1.5 border rounded-md bg-white font-medium text-slate-800"
                                    >
                                        {sheetNames.map(sheet => (
                                            <option key={sheet} value={sheet}>{sheet}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={parseSelectedSheet}
                                        className="px-3 py-1 bg-primary-600 text-white rounded text-xs font-semibold hover:bg-primary-700"
                                    >
                                        Analizar Hoja
                                    </button>
                                </div>
                            )}

                            {workbook && sheetNames.length === 1 && !hasParsed && (
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={parseSelectedSheet}
                                        disabled={isParsing}
                                        className="px-4 py-1.5 bg-primary-600 text-white rounded-md text-xs font-semibold hover:bg-primary-700"
                                    >
                                        {isParsing ? 'Analizando documento...' : 'Procesar Hoja'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider">
                                Pega aquí los datos copiados desde Excel, Word o texto tabulado:
                            </label>
                            <textarea
                                rows={6}
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                                placeholder="Pega aquí las filas de tu tabla curricular. Puedes incluir encabezados como: ASIGNATURA, CODIGO_CE, CRITERIO, CODIGO_DCD, DESTREZA, CODIGO_IE, INDICADOR..."
                                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500"
                            />
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleParsePastedText}
                                    disabled={!pastedText.trim() || isParsing}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition"
                                >
                                    {isParsing ? 'Analizando texto...' : 'Analizar y Previsualizar'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview Table & Statistics */}
                    {hasParsed && (
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-bold text-slate-800">
                                        Resultados del Análisis Previo
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            {parsedCriteria.length} Criterios (CE)
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {parsedDcds.length} Destrezas (DCD)
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                            {parsedIndicators.length} Indicadores (IE)
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500">
                                    Los datos se vincularán automáticamente a las asignaturas de la institución.
                                </span>
                            </div>

                            {/* Preview Tabs / Tables */}
                            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                                <table className="min-w-full divide-y divide-slate-200 text-xs">
                                    <thead className="bg-slate-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-bold text-slate-600 uppercase">Tipo</th>
                                            <th className="px-3 py-2 text-left font-bold text-slate-600 uppercase">Código</th>
                                            <th className="px-3 py-2 text-left font-bold text-slate-600 uppercase">Descripción</th>
                                            <th className="px-3 py-2 text-left font-bold text-slate-600 uppercase">Asignatura / Ref</th>
                                            <th className="px-3 py-2 text-center font-bold text-slate-600 uppercase">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {parsedCriteria.map((c, i) => (
                                            <tr key={`ce-${i}`} className="hover:bg-slate-50">
                                                <td className="px-3 py-2 font-bold text-indigo-700">CE</td>
                                                <td className="px-3 py-2 font-mono font-bold text-slate-800">{c.code}</td>
                                                <td className="px-3 py-2 text-slate-600 max-w-md truncate" title={c.description}>{c.description}</td>
                                                <td className="px-3 py-2 text-slate-500">{c.subjectName} ({c.gradeLevel})</td>
                                                <td className="px-3 py-2 text-center">
                                                    {c.isValid ? (
                                                        <span className="text-emerald-600 font-semibold">✓ Válido</span>
                                                    ) : (
                                                        <span className="text-rose-600 font-semibold">⚠ Incompleto</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}

                                        {parsedDcds.slice(0, 30).map((d, i) => (
                                            <tr key={`dcd-${i}`} className="hover:bg-slate-50">
                                                <td className="px-3 py-2 font-bold text-emerald-700">DCD</td>
                                                <td className="px-3 py-2 font-mono font-bold text-slate-800">{d.code}</td>
                                                <td className="px-3 py-2 text-slate-600 max-w-md truncate" title={d.description}>{d.description}</td>
                                                <td className="px-3 py-2 text-slate-500">{d.subjectName} | Ref: {d.criterionCode || 'Sin CE'}</td>
                                                <td className="px-3 py-2 text-center">
                                                    {d.isValid ? (
                                                        <span className="text-emerald-600 font-semibold">✓ Válido</span>
                                                    ) : (
                                                        <span className="text-rose-600 font-semibold">⚠ Incompleto</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}

                                        {parsedIndicators.slice(0, 20).map((ie, i) => (
                                            <tr key={`ie-${i}`} className="hover:bg-slate-50">
                                                <td className="px-3 py-2 font-bold text-amber-700">IE</td>
                                                <td className="px-3 py-2 font-mono font-bold text-slate-800">{ie.code}</td>
                                                <td className="px-3 py-2 text-slate-600 max-w-md truncate" title={ie.description}>{ie.description}</td>
                                                <td className="px-3 py-2 text-slate-500">Ref: {ie.criterionCode || 'Sin CE'}</td>
                                                <td className="px-3 py-2 text-center">
                                                    {ie.isValid ? (
                                                        <span className="text-emerald-600 font-semibold">✓ Válido</span>
                                                    ) : (
                                                        <span className="text-rose-600 font-semibold">⚠ Incompleto</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                        Compatible con las directrices curriculares vigentes del Ministerio de Educación de Ecuador.
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleExecuteImport}
                            disabled={!hasParsed || isSaving || (parsedCriteria.length === 0 && parsedDcds.length === 0 && parsedIndicators.length === 0)}
                            className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-xs"
                        >
                            {isSaving ? (
                                <>
                                    <span className="inline-block animate-spin">⏳</span>
                                    Guardando en Firestore...
                                </>
                            ) : (
                                <>
                                    <UploadIcon className="h-4 w-4" />
                                    Confirmar e Importar al Repositorio
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurriculumImportModal;
