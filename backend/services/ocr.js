const Tesseract = require('tesseract.js');
const os = require('os');

async function extractMileage(imagePath) {
  try {
    const worker = await Tesseract.createWorker('eng', 1, {
      cachePath: os.tmpdir(),
      cacheMethod: 'write'
    });
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789',
    });
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();
    
    const result = text.trim();
    console.log("OCR raw result:", result);
    // Find the longest sequence of digits, often the odometer reading
    const matches = result.match(/\d+/g);
    if (!matches || matches.length === 0) return null;
    
    // Simple heuristic: return the largest number extracted
    let maxNum = -1;
    for (const match of matches) {
      const num = parseInt(match, 10);
      if (num > maxNum) maxNum = num;
    }
    
    return maxNum > 0 ? maxNum : null;
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
}

module.exports = { extractMileage };
