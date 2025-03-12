// Global constants
const canvas = document.getElementById('glCanvas'); // Get canvas element
const gl = canvas.getContext('webgl2'); // Get WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.1, 0.2, 0.3, 1.0);

// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
        gl_Position = aVertexPosition;
    }
`;

// Fragment shader program
const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main() {
        gl_FragColor = uColor;
    }
`;

// Initialize shaders
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
        color: gl.getUniformLocation(shaderProgram, 'uColor'),
    },
};

// Define the positions for the four quadrants
const positions = [
    // Bottom-left quadrant (Red)
    -1.0, -1.0,
     0.0, -1.0,
    -1.0,  0.0,
     0.0,  0.0,

    // Bottom-right quadrant (Green)
     0.0, -1.0,
     1.0, -1.0,
     0.0,  0.0,
     1.0,  0.0,

    // Top-left quadrant (Blue)
    -1.0,  0.0,
     0.0,  0.0,
    -1.0,  1.0,
     0.0,  1.0,

    // Top-right quadrant (Yellow)
     0.0,  0.0,
     1.0,  0.0,
     0.0,  1.0,
     1.0,  1.0,
];

// Define the colors for the four quadrants
const colors = [
    [0.0, 0.0, 1.0, 1.0], // Blue
    [1.0, 1.0, 0.0, 1.0], // Yellow
    [1.0, 0.0, 0.0, 1.0], // Red
    [0.0, 1.0, 0.0, 1.0], // Green
];

// Create a buffer for the positions
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Start rendering
render();

// Render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw each quadrant
    for (let i = 0; i < 4; i++) {
        // Set the color for the current quadrant
        gl.useProgram(programInfo.program);
        gl.uniform4fv(programInfo.uniformLocations.color, colors[i]);

        // Set the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            2,
            gl.FLOAT,
            false,
            0,
            i * 8 * 4 // Offset for each quadrant
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        // Draw the quadrant
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});

// Helper function to initialize a shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Helper function to create a shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
