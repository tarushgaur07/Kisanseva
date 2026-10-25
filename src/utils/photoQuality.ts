export interface QualityCheckResult {
  isAcceptable: boolean;
  isTooDark: boolean;
  isTooBright: boolean;
  isLowContrast: boolean;
  averageBrightness: number;
  contrastVariance: number;
  advice_en: string;
  advice_hi: string;
}

/**
 * Calculates brightness and variance from RGBA buffer samples
 * Brightness scale: 0-255
 */
export function evaluatePixelQuality(
  rgbaData: Uint8ClampedArray | number[],
  sampleStep = 4
): QualityCheckResult {
  if (!rgbaData || rgbaData.length < 16) {
    return {
      isAcceptable: true,
      isTooDark: false,
      isTooBright: false,
      isLowContrast: false,
      averageBrightness: 128,
      contrastVariance: 1000,
      advice_en: '',
      advice_hi: '',
    };
  }

  let totalLuminance = 0;
  let sampleCount = 0;
  const luminances: number[] = [];

  // Iterate over pixels (R, G, B, A)
  for (let i = 0; i < rgbaData.length; i += 4 * sampleStep) {
    const r = rgbaData[i];
    const g = rgbaData[i + 1];
    const b = rgbaData[i + 2];
    // Standard perceptual luminance formula
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuminance += lum;
    luminances.push(lum);
    sampleCount++;
  }

  const avg = sampleCount > 0 ? totalLuminance / sampleCount : 128;

  // Calculate variance to measure contrast/sharpness
  let varianceSum = 0;
  for (let j = 0; j < luminances.length; j++) {
    const diff = luminances[j] - avg;
    varianceSum += diff * diff;
  }
  const variance = sampleCount > 0 ? varianceSum / sampleCount : 0;

  const isTooDark = avg < 45;
  const isTooBright = avg > 235;
  const isLowContrast = variance < 40 && !isTooDark && !isTooBright;

  let advice_en = '';
  let advice_hi = '';

  if (isTooDark) {
    advice_en = 'Photo is too dark. Please take it in open daylight or turn on flashlight.';
    advice_hi = 'फोटो बहुत अंधेरी है। कृपया दिन के उजाले में या फ्लैशलाइट जलाकर लें।';
  } else if (isTooBright) {
    advice_en = 'Photo has heavy glare. Avoid direct sun reflection on the leaf/skin.';
    advice_hi = 'फोटो में बहुत तेज चमक है। सीधे सूरज की चकाचौंध से बचाकर फोटो लें।';
  } else if (isLowContrast) {
    advice_en = 'Photo appears blurry or washed out. Hold camera steady and close up.';
    advice_hi = 'फोटो धुंधली दिख रही है। कैमरे को स्थिर रखकर पास से साफ फोटो लें।';
  }

  const isAcceptable = !isTooDark && !isTooBright && !isLowContrast;

  return {
    isAcceptable,
    isTooDark,
    isTooBright,
    isLowContrast,
    averageBrightness: Math.round(avg),
    contrastVariance: Math.round(variance),
    advice_en,
    advice_hi,
  };
}
