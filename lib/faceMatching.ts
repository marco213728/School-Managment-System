/**
 * Biometric Face Matching Utility for AMAUTA Attendance System
 * Compares webcam capture snapshots against enrolled official facial reference photos.
 */

export interface FaceComparisonResult {
    match: boolean;
    confidence: number; // 0 to 100 percentage
    message: string;
    metrics?: {
        structuralSimilarity: number;
        edgeCorrelation: number;
        colorHistogramMatch: number;
    };
}

/**
 * Loads an image from a Data URL or Image URI
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error('No se pudo cargar la imagen de referencia: ' + err));
        img.src = src;
    });
};

interface FeatureVector {
    luminance: Float32Array;
    gradients: Float32Array;
    histogram: Float32Array;
}

/**
 * Extracts normalized facial features from an image using off-screen HTML Canvas
 */
const extractFeatures = (img: HTMLImageElement, sampleSize = 64): FeatureVector => {
    const canvas = document.createElement('canvas');
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
        throw new Error('Canvas 2D context no disponible');
    }

    // Center crop to focus on the central facial area (65% width, 75% height)
    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;
    
    // Focus towards upper-center (face center)
    const cropW = srcW * 0.70;
    const cropH = srcH * 0.75;
    const cropX = (srcW - cropW) / 2;
    const cropY = (srcH - cropH) * 0.35; // slightly higher than center for eyes/face

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, sampleSize, sampleSize);
    const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imgData.data;

    const totalPixels = sampleSize * sampleSize;
    const luminance = new Float32Array(totalPixels);
    const histogram = new Float32Array(32); // 32 luminance bins

    let sumLum = 0;
    for (let i = 0; i < totalPixels; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        // Standard perceptual luminance
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        luminance[i] = lum;
        sumLum += lum;

        const bin = Math.min(31, Math.floor(lum * 32));
        histogram[bin] += 1;
    }

    // Normalize histogram
    for (let i = 0; i < 32; i++) {
        histogram[i] /= totalPixels;
    }

    // Normalize luminance to zero-mean, unit-variance for lighting invariance
    const meanLum = sumLum / totalPixels;
    let varLum = 0;
    for (let i = 0; i < totalPixels; i++) {
        const diff = luminance[i] - meanLum;
        varLum += diff * diff;
    }
    const stdLum = Math.sqrt(varLum / totalPixels) || 0.0001;
    for (let i = 0; i < totalPixels; i++) {
        luminance[i] = (luminance[i] - meanLum) / stdLum;
    }

    // Calculate edge gradients (Sobel horizontal & vertical filters for contours like eyes, nose, mouth)
    const gradients = new Float32Array(totalPixels);
    for (let y = 1; y < sampleSize - 1; y++) {
        for (let x = 1; x < sampleSize - 1; x++) {
            const idx = y * sampleSize + x;
            // Horizontal gradient
            const gx = luminance[idx + 1] - luminance[idx - 1];
            // Vertical gradient
            const gy = luminance[idx + sampleSize] - luminance[idx - sampleSize];
            gradients[idx] = Math.sqrt(gx * gx + gy * gy);
        }
    }

    return { luminance, gradients, histogram };
};

/**
 * Calculates Cosine Similarity between two Float32Arrays
 */
const cosineSimilarity = (a: Float32Array, b: Float32Array): number => {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Calculates Histogram Intersection (0 to 1)
 */
const histogramIntersection = (a: Float32Array, b: Float32Array): number => {
    let intersection = 0;
    for (let i = 0; i < a.length; i++) {
        intersection += Math.min(a[i], b[i]);
    }
    return intersection;
};

/**
 * Compares a captured face photo with an enrolled official reference photo.
 * Threshold is standard 60%:
 * - >= 60% : Verified identity
 * - < 60%  : Inconsistent / Different person
 */
export const compareFaces = async (
    capturedPhotoUrl: string, 
    referencePhotoUrl: string,
    threshold = 60
): Promise<FaceComparisonResult> => {
    try {
        const [capturedImg, refImg] = await Promise.all([
            loadImage(capturedPhotoUrl),
            loadImage(referencePhotoUrl)
        ]);

        const featCaptured = extractFeatures(capturedImg, 64);
        const featRef = extractFeatures(refImg, 64);

        // 1. Structural luminance correlation (Normalized cross-correlation)
        const structSim = Math.max(0, cosineSimilarity(featCaptured.luminance, featRef.luminance));

        // 2. Facial contour / gradient similarity (Eyes, eyebrows, nose, mouth lines)
        const edgeSim = Math.max(0, cosineSimilarity(featCaptured.gradients, featRef.gradients));

        // 3. Tone / Lighting distribution match
        const histSim = Math.max(0, histogramIntersection(featCaptured.histogram, featRef.histogram));

        // Composite weighted similarity:
        // Contours & features (45%), Structural luminance (40%), Tone (15%)
        const compositeScore = (edgeSim * 0.45) + (structSim * 0.40) + (histSim * 0.15);
        const confidence = Math.min(100, Math.max(0, Math.round(compositeScore * 100)));

        const isMatch = confidence >= threshold;

        return {
            match: isMatch,
            confidence,
            message: isMatch 
                ? `Rostro verificado exitosamente (${confidence}% de coincidencia con la foto oficial).`
                : `Inconsistencia detectada: el rostro actual tiene solo ${confidence}% de coincidencia con la foto oficial (Mínimo requerido: ${threshold}%).`,
            metrics: {
                structuralSimilarity: Math.round(structSim * 100),
                edgeCorrelation: Math.round(edgeSim * 100),
                colorHistogramMatch: Math.round(histSim * 100)
            }
        };
    } catch (err) {
        console.error('Error al comparar rostros:', err);
        return {
            match: false,
            confidence: 0,
            message: 'Error al procesar las fotografías para comparación biométrica: ' + (err instanceof Error ? err.message : String(err))
        };
    }
};
