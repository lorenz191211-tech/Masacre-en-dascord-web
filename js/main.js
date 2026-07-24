// Inicializar el AudioManager de forma independiente
if (typeof AudioManager !== "undefined") {
    AudioManager.init();
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
        // Probá cambiando la ruta a "subtitulos.json" o "./subtitulos.json" según dónde lo tengas guardado
        const response = await fetch("./js/subtitulos.json");
        if (!response.ok) throw new Error("Error HTTP: " + response.status);
        
        const data = await response.json();
        const lista = data.subtitulos;

        if (lista && lista.length > 0) {
            const indiceAleatorio = Math.floor(Math.random() * lista.length);
            subtituloElement.textContent = lista[indiceAleatorio];
            return;
        }
    } catch (error) {
        console.warn("No se pudo cargar el JSON de subtítulos, usando respaldo:", error);
    }

    // Si falla el fetch, muestra una frase de respaldo automáticamente
    const indiceAleatorio = Math.floor(Math.random() * frasesRespaldo.length);
    subtituloElement.textContent = frasesRespaldo[indiceAleatorio];
}

// Ejecutar la carga del subtítulo
cargarSubtitulos();


// --- 2. CONTROLES DE BOTONES (MÚSICA Y TV) ---
// Usamos DOMContentLoaded asegurando que los elementos ya existan en pantalla
document.addEventListener("DOMContentLoaded", () => {

    // Control de Música e Ícono
    const musicBtn = document.getElementById("music-btn");
    const musicIcon = document.getElementById("music-icon");

    if (musicBtn) {
        musicBtn.addEventListener("click", () => {
            if (typeof AudioManager !== "undefined") {
                const isPlaying = AudioManager.toggle(); 
                if (musicIcon) {
                    musicIcon.src = isPlaying ? "./assets/ui/musicon.png" : "./assets/ui/musicoff.png";
                }
            }
        });
    }

    // Control de TV Retro
    const tvBtn = document.getElementById("tv-btn");

    if (tvBtn) {
        // Restaurar estado guardado al iniciar
        if (localStorage.getItem("retroTVMode") === "true") {
            document.body.classList.add("retro-tv");
            tvBtn.classList.add("active");
        }

        tvBtn.addEventListener("click", () => {
            const isRetro = document.body.classList.toggle("retro-tv");
            tvBtn.classList.toggle("active", isRetro);
            localStorage.setItem("retroTVMode", isRetro);
        });
    }
});
