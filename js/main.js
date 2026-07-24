AudioManager.init();

document.addEventListener("DOMContentLoaded", () => {
    // --- CARGAR SUBTÍTULO ALEATORIO DESDE JSON ---
    async function cargarSubtitulos() {
        const subtituloElement = document.getElementById("game-subtitle");
        if (!subtituloElement) return;

        // Lista de respaldo por si el fetch falla en GitHub Pages
        const frasesRespaldo = [
            "Nahum saca cap",
            "El sitio web"
        ];

        try {
            // Probamos primero con ruta relativa limpia (ajustala si tu json está en /js/subtitulos.json)
            const response = await fetch("./subtitulos.json");
            if (!response.ok) throw new Error("No se pudo cargar el JSON");
            
            const data = await response.json();
            const lista = data.subtitulos;

            if (lista && lista.length > 0) {
                const indiceAleatorio = Math.floor(Math.random() * lista.length);
                subtituloElement.textContent = lista[indiceAleatorio];
                return;
            }
            throw new Error("Lista vacía");
        } catch (error) {
            console.warn("Usando subtítulo de respaldo por error de red:", error);
            const indiceAleatorio = Math.floor(Math.random() * frasesRespaldo.length);
            subtituloElement.textContent = frasesRespaldo[indiceAleatorio];
        }
    }

    cargarSubtitulos();

    // --- CONTROL DE MÚSICA E ICONO ---
    const musicBtn = document.getElementById("music-btn");
    const musicIcon = document.getElementById("music-icon");

    if (musicBtn && musicIcon) {
        musicBtn.onclick = () => {
            if (typeof AudioManager !== "undefined") {
                const isPlaying = AudioManager.toggle(); 
                musicIcon.src = isPlaying ? "./assets/ui/musicon.png" : "./assets/ui/musicoff.png";
            }
        };
    }

    // --- CONTROL DE TV RETRO ---
    const tvBtn = document.getElementById("tv-btn");

    if (tvBtn) {
        tvBtn.onclick = () => {
            const isRetro = document.body.classList.toggle("retro-tv");
            tvBtn.classList.toggle("active", isRetro);
            localStorage.setItem("retroTVMode", isRetro);
        };

        // Restaurar estado guardado
        if (localStorage.getItem("retroTVMode") === "true") {
            document.body.classList.add("retro-tv");
            tvBtn.classList.add("active");
        }
    }
});
