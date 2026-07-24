/*
====================================
    AUDIO MANAGER
====================================
*/

window.AudioManager = {

    audio: null,

    enabled: false,

    volume: 0.45,

    src: "./assets/audios/Menu.ogg",

    init() {

        console.log("AudioManager iniciado");

        this.audio = new Audio();

        this.audio.loop = true;

        this.audio.preload = "auto";

        this.audio.volume = this.volume;

        this.audio.src = this.src;

        this.updateButton();

    },

    toggle() {

        this.enabled = !this.enabled;

        if (this.enabled) {

            this.audio.play()

            .catch(error => {

                console.log("Error al reproducir audio:", error);

                this.enabled = false;

                this.updateButton(); // Devuelve el icono a musicoff si falla el audio

            });

        } else {

            this.audio.pause();

            this.audio.currentTime = 0;

        }

        this.updateButton();

        return this.enabled;

    },

    updateButton() {

        // Buscar la imagen por ID o seleccionándola dentro del botón
        const img = document.getElementById("music-icon") || document.querySelector("#music-btn img");

        if (!img) return;

        // Cambiar la ruta de la imagen en lugar de textContent
        img.src = this.enabled 
            ? "./assets/ui/musicon.png" 
            : "./assets/ui/musicoff.png";

    }

};
