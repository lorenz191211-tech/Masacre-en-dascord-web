AudioManager.init();

document.getElementById("music-btn").onclick = () => {
    AudioManager.toggle();
};
document.addEventListener("DOMContentLoaded", () => {
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

