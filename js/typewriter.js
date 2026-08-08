/* ==================================================
   MOTOR PROFESSIONAL TYPEWRITER (GSAP + Splitting.js)
   ================================================== */

const TypewriterConfig = {
    velocidadStagger: 0.12 // Segundos entre cada letra (menor es más rápido)
};

/**
 * Preprocesa la sintaxis customizada §config/palabra 
 * convirtiéndola en etiquetas HTML estándar legibles por Splitting.js
 */
function preprocesarSintaxisTerror(htmlOriginal) {
    // Expresión regular mejorada que captura la sintaxis §.../palabra
    const regex = /§([^/]+)\/([^\s<]+)/g;
    return htmlOriginal.replace(regex, (match, configStr, palabra) => {
        let clases = [];
        let estilosArr = [];

        const partes = configStr.split(',');
        for (let parte of partes) {
            parte = parte.trim();
            if (parte === '~') clases.push('efecto-temblor');
            else if (parte === '-') clases.push('efecto-glitch');
            else if (parte === '%') clases.push('efecto-susurro');
            else if (parte.startsWith('#') && parte.length === 7) {
                estilosArr.push(`color: ${parte}`);
            }
        }

        return `<span class="${clases.join(' ')}" style="${estilosArr.join('; ')}">${palabra}</span>`;
    });
}

/**
 * Función principal que barre los contenedores y ejecuta las animaciones
 */
async function escribirEnContenedor(selectorOContenedor = document) {
    const contenedor = typeof selectorOContenedor === "string"
        ? document.querySelector(selectorOContenedor)
        : selectorOContenedor;

    if (!contenedor) return;

    const parrafos = contenedor.querySelectorAll("p.lectura");
    if (!parrafos.length) return;

    for (const p of parrafos) {
        // Si no tiene el atributo guardado, lo guardamos desde el innerHTML o textContent actual
        if (!p.hasAttribute("data-raw-text")) {
            let textoCrudo = p.innerHTML.trim();
            let textoConSaltos = textoCrudo.replace(/\r?\n/g, "<br>");
            p.setAttribute("data-raw-text", textoConSaltos);
        }

        // 1. Transformar sintaxis personalizada a HTML seguro manteniendo los <br> y espacios
        let htmlProcesado = preprocesarSintaxisTerror(p.getAttribute("data-raw-text"));
        p.innerHTML = htmlProcesado;

        // 2. Ejecutar Splitting.js
        Splitting({ target: p, by: 'chars' });

        // 3. Preparar opacidades iniciales sin afectar espacios en blanco ni saltos de línea
        p.querySelectorAll('.char').forEach(char => {
            if (char.textContent && char.textContent.trim() !== '') {
                char.style.opacity = '0';
            } else {
                char.style.opacity = '1'; // Los espacios y saltos se muestran de inmediato
            }
        });

        p.classList.add("escribiendo");

        // 4. Animación ultra fluida impulsada por GSAP Timeline/Stagger
        await new Promise(resolve => {
            gsap.to(p.querySelectorAll('.char'), {
                opacity: 1,
                duration: 0.02,
                stagger: TypewriterConfig.velocidadStagger,
                ease: "none",
                onComplete: () => {
                    p.classList.remove("escribiendo");
                    resolve();
                }
            });
        });
    }
}

// Bucle estético global para el Glitch estilo Minecraft (§-)
if (typeof window !== 'undefined' && !window.__glitchEngineRunning) {
    window.__glitchEngineRunning = true;
    setInterval(() => {
        const glitches = document.querySelectorAll('.efecto-glitch .char');
        const codex = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        
        glitches.forEach(el => {
            if (el.style.opacity === '1' && el.textContent && el.textContent.trim() !== '') {
                el.textContent = codex.charAt(Math.floor(Math.random() * codex.length));
            }
        });
    }, 70);
}

// API Pública Global
window.TypewriterEffect = {
    ejecutar: escribirEnContenedor,
    config: TypewriterConfig,
    cambiarVelocidad(nuevoStagger) {
        this.config.velocidadStagger = nuevoStagger;
    }
};
