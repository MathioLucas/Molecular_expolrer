/**
 * Utility functions for WebGL detection and support
 */

/**
 * Checks if WebGL is supported in the current browser
 * 
 * @returns {boolean} True if WebGL is supported, false otherwise
 */
export function checkWebGLSupport(): boolean {
  try {
    // Try to create a WebGL context
    const canvas = document.createElement('canvas');
    
    // Try WebGL 1.0 first
    let gl = canvas.getContext('webgl');
    
    // Fall back to experimental-webgl
    if (!gl) {
      gl = canvas.getContext('experimental-webgl');
    }
    
    // If we still don't have a context, try WebGL 2.0
    if (!gl) {
      gl = canvas.getContext('webgl2');
    }
    
    // If any of these worked, WebGL is supported
    return !!gl;
  } catch (e) {
    console.error('Error checking WebGL support:', e);
    return false;
  }
}

/**
 * Gets detailed information about WebGL capabilities
 * 
 * @returns {Object} Object containing WebGL support details
 */
export function getWebGLInfo(): Record<string, any> {
  try {
    const canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl') || 
             canvas.getContext('experimental-webgl') ||
             canvas.getContext('webgl2');
    
    if (!gl) {
      return { supported: false };
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    return {
      supported: true,
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      isWebGL2: canvas.getContext('webgl2') !== null,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      extensions: gl.getSupportedExtensions()
    };
  } catch (e) {
    console.error('Error getting WebGL info:', e);
    return { supported: false, error: e.message };
  }
}

/**
 * Checks if the device likely has hardware acceleration for WebGL
 * 
 * @returns {boolean} True if hardware acceleration is likely available
 */
export function hasHardwareAcceleration(): boolean {
  try {
    const webGLInfo = getWebGLInfo();
    
    if (!webGLInfo.supported) {
      return false;
    }
    
    // Check for software renderers in the renderer string
    const renderer = webGLInfo.renderer?.toLowerCase() || '';
    const isSoftwareRenderer = 
      renderer.includes('swiftshader') || 
      renderer.includes('software') || 
      renderer.includes('llvmpipe') || 
      renderer.includes('virtio') ||
      renderer.includes('virtualbox');
    
    return !isSoftwareRenderer;
  } catch (e) {
    return false;
  }
}