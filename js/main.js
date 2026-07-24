// Inicializar el AudioManager de forma independiente con control de errores seguro
if (typeof AudioManager !== "undefined" && typeof AudioManager.init === "function") {
    try {
        AudioManager.init();
    } catch (e) {
        console.warn("Error al inicializar AudioManager:", e);
    }
}

// --- 1. CARGAR SUBTÍTULO ALEATORIO DESDE JSON (CON RESPALDO INSTANTÁNEO) ---
async function cargarSubtitulos() {
    const subtituloElement = document.getElementById("game-subtitle");
    if (!subtituloElement) return;

    // Frases de respaldo para visualización instantánea sin demora de red
    const frasesRespaldo = [
        "Nahum saca cap",
        "El sitio web"
    ];

    // Mostrar un subtítulo al instante para eliminar cualquier retraso visual
    const indiceRespaldo = Math.floor(Math.random() * frasesRespaldo.length);
    subtituloElement.textContent = frasesRespaldo[indiceRespaldo];

    try {
        // Cargar el JSON en segundo plano de manera optimizada para navegadores estrictos como Brave
        const response = await fetch("./js/subtitulos.json", { cache: "no-store" });
        if (!response.ok) throw new Error("Error HTTP: " + response.status);
        
        const data = await response.json();
        const lista = data?.subtitulos;

        // Si el JSON responde correctamente, reemplaza el texto de forma fluida
        if (Array.isArray(lista) && lista.length > 0) {
            const indiceAleatorio = Math.floor(Math.random() * lista.length);
            subtituloElement.textContent = lista[indiceAleatorio];
        }
    } catch (error) {
        console.warn("No se pudo cargar el JSON de subtítulos, manteniendo respaldo:", error);
    }
}

// Ejecutar de forma inmediata asegurando compatibilidad con múltiples dispositivos
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarSubtitulos);
} else {
    cargarSubtitulos();
}


// --- 2. CONTROLES DE BOTONES (MÚSICA Y TV) ---
document.addEventListener("DOMContentLoaded", () => {

    // Control de Música e Ícono
    const musicBtn = document.getElementById("music-btn");
    const musicIcon = document.getElementById("music-icon");

    if (musicBtn) {
        musicBtn.addEventListener("click", () => {
            if (typeof AudioManager !== "undefined" && typeof AudioManager.toggle === "function") {
                try {
                    const isPlaying = AudioManager.toggle(); 
                    if (musicIcon) {
                        musicIcon.src = isPlaying ? "./assets/ui/musicon.png" : "./assets/ui/musicoff.png";
                    }
                } catch (e) {
                    console.warn("Error al alternar audio:", e);
                }
            }
        });
    }

    // Control de TV Retro
    const tvBtn = document.getElementById("tv-btn");

    if (tvBtn) {
        let savedTVState = null;
        try {
            savedTVState = localStorage.getItem("retroTVMode");
        } catch (e) {
            console.warn("localStorage no disponible o bloqueado:", e);
        }

        // Inicia en true por defecto la primera vez, respetando cambios posteriores
        const isInitialRetro = savedTVState === null ? true : savedTVState === "true";

        if (isInitialRetro) {
            document.body.classList.add("retro-tv");
            tvBtn.classList.add("active");
        } else {
            document.body.classList.remove("retro-tv");
            tvBtn.classList.remove("active");
        }

        tvBtn.addEventListener("click", () => {
            const isRetro = document.body.classList.toggle("retro-tv");
            tvBtn.classList.toggle("active", isRetro);
            
            try {
                localStorage.setItem("retroTVMode", isRetro);
            } catch (e) {
                // Previene fallos si el navegador bloquea el almacenamiento local
            }
        });
    }
});
