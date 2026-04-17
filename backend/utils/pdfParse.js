const globalScope = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : {};

function polyfillPdfParseGlobals() {
  if (globalScope.DOMMatrix && globalScope.Path2D && globalScope.ImageData) {
    return;
  }

  try {
    const canvas = require('@napi-rs/canvas');

    if (!globalScope.DOMMatrix && canvas.DOMMatrix) {
      globalScope.DOMMatrix = canvas.DOMMatrix;
    }
    if (!globalScope.ImageData && canvas.ImageData) {
      globalScope.ImageData = canvas.ImageData;
    }
    if (!globalScope.Path2D && canvas.Path2D) {
      globalScope.Path2D = canvas.Path2D;
    }
  } catch (error) {
    console.warn('pdf-parse polyfill warning: @napi-rs/canvas unavailable. DOMMatrix/Path2D may be missing.', error.message);
  }
}

polyfillPdfParseGlobals();

module.exports = require('pdf-parse');
