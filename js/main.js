AudioManager.init();

document.addEventListener("DOMContentLoaded", () => {
    // --- CARGAR SUBTÍTULO ALEATORIO DESDE JSON ---
    const subtituloElement = document.getElementById("game-subtitle");

    if (subtituloElement) {
        fetch("./js/subtitulos.json") // Asegurate de poner la ruta correcta si está dentro de una carpeta
            .then(response => response.json())
            .then(data => {
                const lista = data.subtitulos;
                if (lista && lista.length > 0) {
                    const indiceAleatorio = Math.floor(Math.random() * lista.length);
                    subtituloElement.textContent = lista[indiceAleatorio];
                }
            })
            .catch(error => {
                console.error("No se pudo cargar el archivo de subtítulos:", error);
                subtituloElement.textContent = "El sitio web"; // Texto por defecto si falla
            });
    }

    // --- CONTROL DE MÚSICA E ICONO ---
    const musicBtn = document.getElementById("music-btn");
    const musicIcon = document.getElementById("music-icon");

    if (musicBtn && musicIcon) {
        musicBtn.onclick = () => {
            // Alternar estado en AudioManager
            if (typeof AudioManager !== "undefined") {
                const isPlaying = AudioManager.toggle(); 
                
                // Cambiar imagen según el estado de reproducción
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
        }
    }
});

