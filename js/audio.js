/*
====================================
    AUDIO MANAGER (Con Seguro Anti-Bloqueos)
====================================
*/
window.AudioManager = {
    audioNormal: null,
    audioSecreto: null,
    enabled: false,
    wasEnabled: false, 
    enSecreto: false,
    interactuado: false, // 🔒 Candado de seguridad táctil
    volume: 0.1,
    srcNormal: "./assets/audios/menu.ogg",
    srcSecreto: "./assets/audios/secreto.m4a", // ⚠️ Asegúrate del nombre correcto de tu pista secreta

    init() {
        console.log("AudioManager iniciado - Arquitectura de Estados");

        this.audioNormal = new Audio();
        this.audioNormal.loop = true;
        this.audioNormal.preload = "auto";
        this.audioNormal.volume = this.volume;
        this.audioNormal.src = this.srcNormal;

        this.audioSecreto = new Audio();
        this.audioSecreto.loop = true;
        this.audioSecreto.preload = "auto";
        this.audioSecreto.volume = this.volume;
        this.audioSecreto.src = this.srcSecreto;

        this.updateButton();
    },

    // --- Arranca la música correcta según la hora al tocar la pantalla ---
    iniciarExperienciaAudio() {
        this.interactuado = true; // 🔓 Quitamos el candado
        this.enabled = true;
        
        // 1. Forzamos a que el navegador registre los audios en la memoria
        this.audioNormal.load();
        this.audioSecreto.load();

        const audioActual = this.enSecreto ? this.audioSecreto : this.audioNormal;
        
        // 2. Intentamos reproducir con manejo estricto de éxito/error
        audioActual.play().then(() => {
            console.log("Audio desbloqueado e iniciado con éxito.");
            this.updateButton(); // Si tuvo éxito, actualizamos el botón a ON
        }).catch(error => {
            console.warn("Autoplay bloqueado por el navegador:", error);
            // Si el navegador lo bloqueó, apagamos el estado para que el usuario pueda usar el botón manual
            this.enabled = false;
            this.updateButton(); // Actualizamos el botón a OFF
        });

        // Lo ponemos en ON temporalmente (si falla, el catch de arriba lo corrige)
        this.updateButton();
    },

    toggle() {
        // Si no ha tocado la pantalla, ignorar clics fantasmas
        if (!this.interactuado) return this.enabled; 

        this.enabled = !this.enabled;
        const audioActual = this.enSecreto ? this.audioSecreto : this.audioNormal;

        if (this.enabled) {
            audioActual.play().then(() => {
                this.updateButton();
            }).catch(error => {
                console.log("Error al reproducir audio:", error);
                this.enabled = false;
                this.updateButton();
            });
        } else {
            audioActual.pause();
            this.updateButton();
        }

        return this.enabled;
    },

    activarSecreto() {
        this.enSecreto = true;
        this.wasEnabled = this.enabled;

        // Si estaba sonando la normal, se apaga de todos modos
        if (this.audioNormal && !this.audioNormal.paused) {
            this.audioNormal.pause();
        }

        this.enabled = true;

        // 🔒 ¿Ya quitó la pantalla de inicio? Solo así le damos "play" real
        if (this.interactuado) {
            this.audioSecreto.play().catch(error => {
                console.log("Error al reproducir audio secreto:", error);
                this.enabled = false;
            });
        } else {
            console.log("Audio en espera: Se reproducirá la pista secreta al tocar la pantalla.");
        }
        
        this.updateButton();
    },

    desactivarSecreto() {
        this.enSecreto = false;
        
        if (this.audioSecreto) {
            this.audioSecreto.pause();
            this.audioSecreto.currentTime = 0;
        }

        this.enabled = this.wasEnabled;

        // 🔒 ¿Ya quitó la pantalla de inicio? Solo así restauramos el audio normal
        if (this.interactuado && this.enabled) {
            this.audioNormal.play().catch(e => {
                console.log("Error restaurando normal:", e);
                this.enabled = false;
            });
        }

        this.updateButton();
    },

    updateButton() {
        const img = document.getElementById("music-icon") || document.querySelector("#music-btn img");
        if (!img) return;
        img.src = this.enabled ? "./assets/ui/musicon.png" : "./assets/ui/musicoff.png";
    }
};