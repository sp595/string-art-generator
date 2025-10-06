export const en = {
  // Header
  header: {
    title: 'String Art Generator',
    subtitle: 'Upload an image and generate coordinates for string art'
  },

  // Image Uploader
  uploader: {
    dropzone: 'Click or drag an image here',
    formats: 'PNG, JPG, GIF up to 10MB',
    change: 'Click to change image'
  },

  // Image Cropper
  cropper: {
    title: 'Crop Image',
    instructions: 'Drag to move • Scroll to zoom',
    zoom: 'Zoom',
    reset: 'Reset',
    apply: 'Apply Crop',
    finalSize: 'Final size:',
    originalSize: 'Original image:'
  },

  // Parameters
  parameters: {
    title: 'Parameters',
    pins: {
      label: 'Number of Pins',
      description: 'Pins distributed on the circle'
    },
    minDistance: {
      label: 'Minimum Pin Distance',
      description: 'Minimum distance between consecutive pins'
    },
    maxLines: {
      label: 'Maximum Number of Lines',
      description: 'Total number of lines to generate'
    },
    lineWeight: {
      label: 'Line Weight',
      description: 'Intensity of each line (opacity)'
    },
    imageSize: {
      label: 'Image Size',
      description: 'Canvas dimension in pixels'
    },
    estimatedTime: 'Estimated time:',
    seconds: 'seconds'
  },

  // Advanced Options
  advanced: {
    toggle: 'Advanced Options',
    webWorker: {
      label: 'Use Web Worker (non-blocking UI)',
      description: 'Runs in separate thread - basic algorithm only'
    },
    algorithm: {
      label: 'Use Advanced Algorithm',
      description: 'Enables edge detection, look-ahead and adaptive weight'
    },
    edgeDetection: {
      label: 'Edge Detection (Sobel)',
      description: 'Prioritizes image edges'
    },
    lookahead: {
      label: 'Look-Ahead Algorithm',
      description: 'Considers future steps for better choices'
    },
    antialiasing: {
      label: 'Anti-Aliasing (Wu)',
      description: 'Smoother lines (slower)'
    },
    edgeWeight: {
      label: 'Edge Detection Weight',
      description: 'Balance between edges (1.0) and darkness (0.0)'
    },
    warnings: {
      advanced: 'Advanced algorithm: 5-10x slower',
      lookahead: 'Look-Ahead: +50% time',
      antialiasing: 'Anti-Aliasing: +100% time'
    }
  },

  // Actions
  actions: {
    generate: 'Generate String Art',
    generating: 'Generating',
    export: 'Export JSON Coordinates'
  },

  // Canvas
  canvas: {
    title: 'Preview',
    editCrop: 'Edit Crop',
    showOriginal: 'Show Original',
    showStringArt: 'Show String Art',
    download: 'Download Image',
    empty: 'Load an image to start',
    stats: {
      linesGenerated: 'Generated lines:',
      pinsUsed: 'Pins used:',
      lineWeight: 'Line weight:'
    }
  },

  // Loading States
  loading: {
    title: 'Generating String Art',
    states: {
      loadingImage: 'Loading image...',
      detectingEdges: 'Detecting edges...',
      calculatingPins: 'Calculating pin positions...',
      precalculatingLines: 'Pre-calculating lines...',
      generating: 'Generating string art...',
      complete: 'Complete!'
    },
    tips: {
      webWorker: 'Web Worker active - UI remains responsive!',
      blocking: 'Browser might appear frozen during processing'
    }
  },

  // Toast Messages
  toast: {
    imageLoaded: 'Image loaded! Crop the desired area.',
    imageCropped: 'Image cropped successfully!',
    generated: 'String art generated successfully! {lines} lines created.',
    jsonExported: 'JSON coordinates exported successfully!',
    imageDownloaded: 'PNG image downloaded successfully!',
    error: 'Error generating string art'
  }
}

export default en
