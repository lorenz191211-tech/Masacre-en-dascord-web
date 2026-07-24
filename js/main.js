// Inicializar el AudioManager de forma independiente con control de errores seguro
if (typeof AudioManager !== "undefined" && typeof AudioManager.init === "function") {
    try {
        AudioManager.init();
    } catch (e) {
        console.warn("Error al inicializar AudioManager:", e);
    }
}

// --- 1. CARGAR SUBTÍTULO ALEATORIO DESDE JSON ---
async function cargarSubtitulos() {
    const subtituloElement = document.getElementById("game-subtitle");
    if (!subtituloElement) return;

    // Respaldo por si el JSON falla
    const frasesRespaldo = [
        "Nahum saca cap",
        "El sitio web"
    ];

    try {
        const response = await fetch("./js/subtitulos.json", { cache: "no-store" });
        if (!response.ok) throw new Error("Error HTTP: " + response.status);
        
        const data = await response.json();
        const lista = data?.subtitulos;

        if (Array.isArray(lista) && lista.length > 0) {
            const indiceAleatorio = Math.floor(Math.random() * lista.length);
            subtituloElement.textContent = lista[indiceAleatorio];
            return;
        }
    } catch (error) {
        console.warn("No se pudo cargar el JSON de subtítulos, usando respaldo:", error);
    }

    // Respaldo automático si falla el fetch
    const indiceAleatorio = Math.floor(Math.random() * frasesRespaldo.length);
    subtituloElement.textContent = frasesRespaldo[indiceAleatorio];
}

// Ejecutar la carga del subtítulo de forma segura
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
        // Uso de 'pointerup' o 'click' optimizado para evitar retrasos y bloqueos en móviles y Brave
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
        // Manejo seguro de localStorage por restricciones de privacidad estrictas en Brave/Safari
        let savedTVState = null;
        try {
            savedTVState = localStorage.getItem("retroTVMode");
        } catch (e) {
            console.warn("localStorage no disponible o bloqueado:", e);
        }

        // Si ya existe un registro previo, respeta la elección del usuario ("true" o "false").
        const isInitialRetro = savedTVState === null ? true : savedTVState === "true";

        if (isInitialRetro) {
            document.body.classList.add("retro-tv");
            tvBtn.classList.add("active");
        } else {
            document.body.classList.remove("retro-tv");
            tvBtn.classList.remove("active");
        }

        // Evento de clic unificado para todos los navegadores
        tvBtn.addEventListener("click", () => {
            const isRetro = document.body.classList.toggle("retro-tv");
            tvBtn.classList.toggle("active", isRetro);
            
            try {
                localStorage.setItem("retroTVMode", isRetro);
            } catch (e) {
                // Previene que colapse la app si el navegador bloquea el almacenamiento local
            }
        });
    }
});
