(async () => {
    const canvas = document.getElementById('smokeCanvas') || document.getElementById('tu-canvas') || document.querySelector('canvas');
    if (!canvas) return;

    // 1. Cargar Configuración JSON con valores por defecto robustos
    let cfg;
    try {
        const response = await fetch('js/config.json');
        cfg = await response.json();
    } catch (e) {
        console.error("Error al cargar config.json, usando valores por defecto:", e);
        cfg = { 
            archivoShader: "humo.txt", 
            velocidad: 1.0,
            frecuencia: 1.0,
            oscilacion: { habilitado: true, frecuencia: 0.4, rango: 2.2 },
            transformacion: { zoom: 1.0, rotacion: 0.0 },
            usarColoresPersonalizados: true,
            colores: {
                base: [0.21, 0.06, 0.06],
                medio: [0.65, 0.12, 0.08],
                brillante: [1.0, 0.45, 0.15],
                brillo: 1.0,
                contraste: 1.0,
                saturacion: 1.0,
                invertirColores: false
            },
            extras: { resolucionEscala: 0.70 }
        };
    }

    // 2. Cargar el Shader externo dinámicamente
    let rawShaderSource = "";
    const shaderFileName = cfg.archivoShader || 'humo.txt';
    const shaderPath = `assets/shaders/${shaderFileName}`;
    
    try {
        const shaderResponse = await fetch(shaderPath);
        if (!shaderResponse.ok) throw new Error(`HTTP ${shaderResponse.status}`);
        rawShaderSource = await shaderResponse.text();
    } catch (e) {
        console.error(`Error al cargar el shader desde ${shaderPath}:`, e);
        return;
    }

    // 3. TRANSPILADOR UNIVERSAL DE GODOT A WEBGL
    function convertGodotToWebGL(source) {
        if (!source.includes('shader_type') && !source.includes('fragment()')) {
            return source; // Es un shader GLSL estándar
        }

        let glsl = source;

        // Limpiar sintaxis propia de Godot
        glsl = glsl.replace(/shader_type\s+canvas_item\s*;/gi, '');
        glsl = glsl.replace(/:\s*source_color/gi, '');
        glsl = glsl.replace(/:\s*hint_range\([^)]+\)/gi, '');

        // Eliminar valores por defecto en uniforms para prevenir fallos de compilación en WebGL
        glsl = glsl.replace(/(uniform\s+[\w\d]+\s+[\w\d]+)\s*=[^;]+;/gi, '$1;');

        // Evitar conflictos con macros de tiempo
        glsl = glsl.replace(/#define\s+iTime\b/gi, '// #define iTime');

        // Mapear función principal y salidas de color
        glsl = glsl.replace(/void\s+fragment\s*\(\s*\)/gi, 'void main(void)');
        glsl = glsl.replace(/\bCOLOR\b/g, 'gl_FragColor');

        // Inyectar cabecera estándar de compatibilidad WebGL
        const header = `
#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform vec2  resolution;

#ifndef TIME
#define TIME time
#endif

#ifndef iTime
#define iTime time
#endif

#define UV (gl_FragCoord.xy / resolution.xy)
        `;

        return header + '\n' + glsl;
    }

    const fragmentShaderSource = convertGodotToWebGL(rawShaderSource);

    // 4. Inicializar Contexto WebGL
    const gl = canvas.getContext('webgl', { 
        powerPreference: "high-performance", 
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false
    }) || canvas.getContext('experimental-webgl');
    
    if (!gl) return;

    const vertices = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Error compilando Shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error vinculando Programa:', gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    const posAttrLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttrLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0);

    // 5. SISTEMA HÍBRIDO DINÁMICO DE UNIFORMS
    function applyDynamicUniforms(currentTimeSec, currentCalculatedSpeed) {
        const resLoc = gl.getUniformLocation(program, 'resolution');
        if (resLoc) gl.uniform2f(resLoc, canvas.width, canvas.height);

        const timeLoc = gl.getUniformLocation(program, 'time');
        if (timeLoc) gl.uniform1f(timeLoc, currentTimeSec);

        // Diccionario universal y puente de nombres (Conecta JSON con las variables del Shader GD)
        const availableValues = {
            // Puente para tu shader de humo actual (Godot)
            colorA: cfg.colores?.base || [0.2, 0.0, 0.1],
            colorB: cfg.colores?.medio || [0.7, 0.3, 0.4],
            colorC: cfg.colores?.brillante || [1.0, 0.2, 0.4],
            speed: currentCalculatedSpeed,
            discomode: cfg.discomode ? 1 : 0,

            // Variables de respaldo por si utilizas otros shaders en el futuro
            u_frequency: cfg.frecuencia ?? 1.0,
            u_zoom: cfg.transformacion?.zoom ?? 1.0,
            u_rotation: cfg.transformacion?.rotacion ?? 0.0,
            u_brightness: cfg.colores?.brillo ?? 1.0,
            u_contrast: cfg.colores?.contraste ?? 1.0,
            u_saturation: cfg.colores?.saturacion ?? 1.0,
            u_invert: cfg.colores?.invertirColores ? 1 : 0,
            u_useCustomColors: cfg.usarColoresPersonalizados ? 1 : 0,
            u_colorBase: cfg.colores?.base || [0.21, 0.06, 0.06],
            u_colorMid: cfg.colores?.medio || [0.65, 0.12, 0.08],
            u_colorBright: cfg.colores?.brillante || [1.0, 0.45, 0.15],
            u_band1: cfg.extras?.corteBanda1 || [0.08, 0.45],
            u_band2: cfg.extras?.corteBanda2 || [0.55, 0.85],
            u_useVignette: cfg.extras?.usarVineta ? 1 : 0,
            u_vignettePower: cfg.extras?.fuerzaVineta ?? 0.28,
            u_vignetteMin: cfg.extras?.oscuridadVineta ?? 0.35
        };

        // Inspección automática de uniforms activos en el programa compilado
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const info = gl.getActiveUniform(program, i);
            if (!info) continue;
            const name = info.name;
            const loc = gl.getUniformLocation(program, name);
            
            if (availableValues[name] !== undefined) {
                const val = availableValues[name];
                if (Array.isArray(val)) {
                    if (val.length === 3) {
                        // Corrección de gamma sRGB -> Linear para recuperar el brillo y tono original de Godot
                        const isColor = name.toLowerCase().includes('color') || name.toLowerCase().includes('col');
                        const processedVal = isColor ? val.map(c => Math.pow(Math.max(0, c), 2.2)) : val;
                        gl.uniform3fv(loc, processedVal);
                    } else if (val.length === 2) {
                        gl.uniform2fv(loc, val);
                    }
                } else if (typeof val === 'number') {
                    if (info.type === gl.INT || info.type === gl.BOOL) {
                        gl.uniform1i(loc, val);
                    } else {
                        gl.uniform1f(loc, val);
                    }
                }
            }
        }
    }

    function resizeCanvas() {
        const scale = cfg.extras?.resolucionEscala || 0.7;
        canvas.width = Math.floor(window.innerWidth * scale);
        canvas.height = Math.floor(window.innerHeight * scale);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 6. Bucle de Renderizado con soporte para Oscilación de Velocidad del JSON
    let accumulatedTime = 0.0;
    let lastTime = performance.now();
    
    const baseSpeed = cfg.velocidad ?? 1.0;
    const oscEnabled = cfg.oscilacion?.habilitado ?? false;
    const oscFreq = cfg.oscilacion?.frecuencia ?? 0.5;
    const oscRange = cfg.oscilacion?.rango ?? 2.0;

    function render(currentTime) {
        const deltaTime = (currentTime - lastTime) * 0.001;
        lastTime = currentTime;

        let currentSpeed = baseSpeed;

        if (oscEnabled) {
            const totalSeconds = currentTime * 0.001;
            currentSpeed = baseSpeed + Math.sin(totalSeconds * oscFreq * Math.PI * 2.0) * oscRange;
        }

        accumulatedTime += deltaTime * currentSpeed;

        // Pasamos el tiempo acumulado y la velocidad calculada al sistema dinámico
        applyDynamicUniforms(accumulatedTime, currentSpeed);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
})();
