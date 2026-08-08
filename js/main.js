/*
==================================================
    INICIALIZACIÓN DEL AUDIO
==================================================
*/
try {
    window.AudioManager?.init?.();
} catch (e) {
    console.warn("Error al inicializar AudioManager:", e);
}

/*
==================================================
    INTERFAZ Y LÓGICA PRINCIPAL
==================================================
*/
document.addEventListener("DOMContentLoaded", () => {

    /*
    ==============================================
        ELEMENTOS Y VARIABLES GLOBALES
    ==============================================
    */
    const subtitle = document.getElementById("game-subtitle");
    const musicBtn = document.getElementById("music-btn");
    const musicIcon = document.getElementById("music-icon");
    const tvBtn = document.getElementById("tv-btn");
    const backBtn = document.getElementById("back-btn");
    const menuButtons = document.querySelectorAll(".gameMenu button");
    const submenus = document.querySelectorAll(".submenu");
    
    const codigoInput = document.getElementById("codigo-input");
    const codigoBtn = document.getElementById("codigo-btn");
    const resultadoDiv = document.getElementById("resultado-secreto");

    let submenuActual = null;
    let modoMalditoActivo = null; 
    let baseCodigos = {};

    /*
    ==============================================
        0. PANTALLA DE INICIO (PRESS START)
    ==============================================
    */
    const pantallaInicio = document.getElementById("pantalla-inicio");

    if (pantallaInicio) {
        const arrancarJuego = (e) => {
            // Evitamos que un click y un touchend disparen esto dos veces a la vez
            if (pantallaInicio.classList.contains("oculto")) return;

            // Ocultar pantalla de inicio con fundido suave
            pantallaInicio.classList.add("oculto");

            // Disparar la música dinámicamente
            try {
                if (window.AudioManager && typeof window.AudioManager.iniciarExperienciaAudio === "function") {
                    window.AudioManager.iniciarExperienciaAudio();
                } 
            } catch (error) {
                console.warn("No se pudo iniciar el audio desde el inicio:", error);
            }

            // Remover listeners para limpiar memoria
            window.removeEventListener("touchend", arrancarJuego);
            window.removeEventListener("click", arrancarJuego);
            window.removeEventListener("keydown", arrancarJuego);
        };

        // Escuchar touchend (vital para desbloquear audio en móviles), clics y CUALQUIER TECLA de la PC
        window.addEventListener("touchend", arrancarJuego, { once: true });
        window.addEventListener("click", arrancarJuego, { once: true });
        window.addEventListener("keydown", arrancarJuego, { once: true });
    }

    /*
    ==============================================
        1. EVENTO NOCTURNO EN VIVO (2 AM - 10 AM)
    ==============================================
    */
    function verificarHoraMaldita() {
        const horaActual = new Date().getHours();
        const esHoraMaldita = horaActual >= 2 && horaActual < 10;
        
        if (modoMalditoActivo === esHoraMaldita) return; 
        
        modoMalditoActivo = esHoraMaldita;
        
        const btnSecreto = document.querySelector('[data-target="menu-secreto"]');
        const botonesNormales = Array.from(menuButtons).filter(
            btn => btn.dataset.target !== "menu-secreto"
        );

        if (esHoraMaldita) {
            botonesNormales.forEach(btn => btn.style.display = "none");
            if (btnSecreto) btnSecreto.style.display = "block";
            document.body.classList.add("menu-secreto-activo");
            
            if (window.AudioManager && typeof window.AudioManager.activarSecreto === 'function') {
                window.AudioManager.activarSecreto();
            }
        } else {
            botonesNormales.forEach(btn => btn.style.display = "block");
            if (btnSecreto) btnSecreto.style.display = "none";
            document.body.classList.remove("menu-secreto-activo");
            
            if (window.AudioManager && typeof window.AudioManager.desactivarSecreto === 'function') {
                window.AudioManager.desactivarSecreto();
            }
        }
    }

    verificarHoraMaldita();
    setInterval(verificarHoraMaldita, 10000);
    
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) verificarHoraMaldita();
    });

    /*
    ==============================================
        2. SUBTÍTULOS
    ==============================================
    */
    async function cargarSubtitulos() {
        if (!subtitle) return;
        
        const respaldo = ["Nahum saca cap", "El sitio web"];
        subtitle.textContent = respaldo[Math.floor(Math.random() * respaldo.length)];

        try {
            const response = await fetch("./js/subtitulos.json", { cache: "no-store" });
            if (!response.ok) throw new Error(response.status);
            
            const data = await response.json();
            if (Array.isArray(data.subtitulos) && data.subtitulos.length) {
                subtitle.textContent = data.subtitulos[Math.floor(Math.random() * data.subtitulos.length)];
            }
        } catch (err) {
            console.warn("No se pudieron cargar los subtítulos.", err);
        }
    }
    
    cargarSubtitulos();

    /*
    ==============================================
        3. MÚSICA Y TV RETRO
    ==============================================
    */
    musicBtn?.addEventListener("click", () => {
        try {
            window.AudioManager?.toggle?.();
        } catch (e) {
            console.warn("Error con el botón de música:", e);
        }
    });

    if (tvBtn) {
        let retro = true;
        try {
            const saved = localStorage.getItem("retroTVMode");
            if (saved !== null) retro = saved === "true";
        } catch (e) {}

        function aplicarRetro(activo) {
            document.body.classList.toggle("retro-tv", activo);
            tvBtn.classList.toggle("active", activo);
        }

        aplicarRetro(retro);

        tvBtn.addEventListener("click", () => {
            retro = !retro;
            aplicarRetro(retro);
            try { localStorage.setItem("retroTVMode", retro); } catch (e) {}
        });
    }

    /*
    ==============================================
        4. SUBMENÚS Y NAVEGACIÓN
    ==============================================
    */
    function cerrarTodos() {
        submenus.forEach(menu => menu.classList.add("hidden"));
    }

    function abrirSubmenu(id) {
        cerrarTodos();
        const submenu = document.getElementById(id);
        if (!submenu) return;
        
        submenu.classList.remove("hidden");
        submenuActual = submenu;
        document.body.classList.add("submenu-active");
        backBtn?.classList.remove("hidden");

        if (id === "menu-secreto" && !modoMalditoActivo) {
            document.body.classList.add("menu-secreto-activo"); 
            if (window.AudioManager && typeof window.AudioManager.activarSecreto === 'function') {
                window.AudioManager.activarSecreto();
            }
        }

        window.TypewriterEffect?.ejecutar(submenu);
    }

    function volverMenu() {
        cerrarTodos();
        submenuActual = null;
        document.body.classList.remove("submenu-active");
        backBtn?.classList.add("hidden");

        if (document.body.classList.contains("menu-secreto-activo") && !modoMalditoActivo) {
            document.body.classList.remove("menu-secreto-activo"); 
            if (window.AudioManager && typeof window.AudioManager.desactivarSecreto === 'function') {
                window.AudioManager.desactivarSecreto();
            }
        }
    }

    menuButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const destino = btn.dataset.target;
            const url = btn.dataset.url;
            
            if (destino) {
                abrirSubmenu(destino);
            } else if (url) {
                window.location.href = url;
            }
        });
    });

    backBtn?.addEventListener("click", volverMenu);

    /*
    ==============================================
        5. SISTEMA DE CÓDIGOS SECRETOS (JSON)
    ==============================================
    */
    async function cargarCodigos() {
        try {
            const respuesta = await fetch("./js/codigos.json");
            if (!respuesta.ok) throw new Error(respuesta.status);
            baseCodigos = await respuesta.json();
        } catch (error) {
            console.warn("No se pudo cargar el archivo de códigos:", error);
        }
    }

    cargarCodigos();

    async function verificarCodigo() {
        if (!codigoInput || !resultadoDiv) return;

        const inputVal = codigoInput.value.trim();

        try {
            const listaCodigos = Array.isArray(baseCodigos.codigos) ? baseCodigos.codigos : [];
            const encontrado = listaCodigos.find(item => item.codigo === inputVal);

            if (encontrado) {
                if (encontrado.tipo === "txt") {
                    const txtResponse = await fetch(encontrado.archivo, { cache: "no-store" });
                    if (!txtResponse.ok) throw new Error(txtResponse.status);

                    const textoPlano = await txtResponse.text();

                    resultadoDiv.innerHTML = `<p class="lectura"></p>`;
                    const pLectura = resultadoDiv.querySelector(".lectura");
                    pLectura.textContent = textoPlano;

                    window.TypewriterEffect?.ejecutar(resultadoDiv);
                } else {
                    resultadoDiv.textContent = "El código existe, pero su tipo no está soportado.";
                }
            } else {
                resultadoDiv.textContent = "Código inválido o desconocido...";
            }
        } catch (error) {
            console.error("Error al cargar el contenido:", error);
            resultadoDiv.textContent = "Error de sistema en la red de Dascord.";
        }
    }

    codigoBtn?.addEventListener("click", verificarCodigo);
    codigoInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            verificarCodigo();
        }
    });
});
