/**
 * Utility functions for robust date parsing, Excel serial date conversion,
 * and user-friendly localized date formatting.
 */

/**
 * Checks whether a given string or number represents an Excel serial date.
 * Excel serials for realistic birth dates (e.g. 1950 - 2030) are roughly between 18000 and 48000.
 * Can also have fractional time parts like 41518.999814814815.
 */
export function isExcelSerialDate(val: any): boolean {
    if (val === null || val === undefined || val === '') return false;
    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) return false;
    // Year 1950 is ~18264, Year 2040 is ~51135
    return num >= 1000 && num <= 70000;
}

/**
 * Converts an Excel serial date number (or numeric string) to YYYY-MM-DD.
 * Note: Excel 1900 date system has the known 1900 leap year bug (day 60 is Feb 29, 1900).
 * Epoch offset between 1899-12-30 and 1970-01-01 is 25569 days.
 */
export function excelSerialToIsoDate(serial: number): string {
    const utcDays = Math.round(serial - 25569);
    const utcValue = utcDays * 86400 * 1000;
    const date = new Date(utcValue);
    if (isNaN(date.getTime())) return '';
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Parses any incoming date format (Date object, Excel serial number, DD/MM/YYYY, YYYY-MM-DD, etc.)
 * into a clean standard ISO string "YYYY-MM-DD".
 */
export function parseAnyDateToIso(raw: any): string {
    if (!raw) return '';
    if (raw instanceof Date) {
        if (isNaN(raw.getTime())) return '';
        const y = raw.getFullYear();
        const m = String(raw.getMonth() + 1).padStart(2, '0');
        const d = String(raw.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    const str = String(raw).trim();
    if (!str) return '';

    // If it's a numeric Excel serial date
    if (isExcelSerialDate(str)) {
        return excelSerialToIsoDate(Number(str));
    }

    // DD/MM/YYYY or D/M/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
        const [d, m, y] = str.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // DD-MM-YYYY or D-M-YYYY
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
        const [d, m, y] = str.split('-');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // YYYY-MM-DD (already ISO)
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
        const [y, m, d] = str.split('-');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // YYYY/MM/DD
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(str)) {
        const [y, m, d] = str.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // DD.MM.YYYY
    if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(str)) {
        const [d, m, y] = str.split('.');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // Datetime with T
    if (str.includes('T')) {
        const datePart = str.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return datePart;
        }
    }

    // Fallback standard parse
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    return str;
}

/**
 * Formats a date value for user display (e.g., "DD/MM/YYYY").
 * If the input is an Excel serial number, it automatically normalizes and displays it cleanly.
 */
export function formatDateForDisplay(rawDate?: string | number | null): string {
    if (!rawDate) return 'No registrada';
    const iso = parseAnyDateToIso(rawDate);
    if (!iso) return String(rawDate);

    const parts = iso.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return iso;
}
