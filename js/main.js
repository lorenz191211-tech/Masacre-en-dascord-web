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
    INTERFAZ
==================================================
*/

document.addEventListener("DOMContentLoaded", () => {


    /*
    ==============================================
        ELEMENTOS
    ==============================================
    */

    const subtitle =
        document.getElementById("game-subtitle");

    const musicBtn =
        document.getElementById("music-btn");

    const musicIcon =
        document.getElementById("music-icon");

    const tvBtn =
        document.getElementById("tv-btn");

    const backBtn =
        document.getElementById("back-btn");

    const menuButtons =
        document.querySelectorAll(".gameMenu button");

    const submenus =
        document.querySelectorAll(".submenu");

    let submenuActual = null;



    /*
    ==============================================
        SUBTÍTULOS
    ==============================================
    */

    async function cargarSubtitulos() {

        if (!subtitle) return;

        const respaldo = [

            "Nahum saca cap",

            "El sitio web"

        ];

        subtitle.textContent =
            respaldo[
                Math.floor(
                    Math.random() * respaldo.length
                )
            ];

        try {

            const response =
                await fetch(
                    "./js/subtitulos.json",
                    {
                        cache: "no-store"
                    }
                );

            if (!response.ok)
                throw new Error(response.status);

            const data =
                await response.json();

            if (

                Array.isArray(data.subtitulos) &&
                data.subtitulos.length

            ) {

                subtitle.textContent =
                    data.subtitulos[
                        Math.floor(
                            Math.random() *
                            data.subtitulos.length
                        )
                    ];

            }

        }

        catch (err) {

            console.warn(
                "No se pudieron cargar los subtítulos.",
                err
            );

        }

    }

    cargarSubtitulos();



    /*
    ==============================================
        MÚSICA
    ==============================================
    */

    musicBtn?.addEventListener("click", () => {

        try {

            const activo =
                window.AudioManager?.toggle?.();

            if (musicIcon) {

                musicIcon.src =

                    activo ?

                    "./assets/ui/musicon.png"

                    :

                    "./assets/ui/musicoff.png";

            }

        }

        catch (e) {

            console.warn(e);

        }

    });



    /*
    ==============================================
        TV RETRO
    ==============================================
    */

    if (tvBtn) {

        let retro = true;

        try {

            const saved =
                localStorage.getItem(
                    "retroTVMode"
                );

            if (saved !== null) {

                retro =
                    saved === "true";

            }

        }

        catch (e) {}



        function aplicarRetro(activo) {

            document.body.classList.toggle(

                "retro-tv",

                activo

            );

            tvBtn.classList.toggle(

                "active",

                activo

            );

        }



        aplicarRetro(retro);



        tvBtn.addEventListener("click", () => {

            retro = !retro;

            aplicarRetro(retro);

            try {

                localStorage.setItem(

                    "retroTVMode",

                    retro

                );

            }

            catch (e) {}

        });

    }



    /*
    ==============================================
        SUBMENÚS
    ==============================================
    */

    function cerrarTodos() {

        submenus.forEach(menu => {

            menu.classList.add("hidden");

        });

    }



    function abrirSubmenu(id) {

        cerrarTodos();

        const submenu =
            document.getElementById(id);

        if (!submenu) return;

        submenu.classList.remove("hidden");

        submenuActual = submenu;

        document.body.classList.add(

            "submenu-active"

        );

        backBtn?.classList.remove("hidden");

    }



    function volverMenu() {

        cerrarTodos();

        submenuActual = null;

        document.body.classList.remove(

            "submenu-active"

        );

        backBtn?.classList.add("hidden");

    }



    /*
    ==============================================
        EVENTOS MENÚ
    ==============================================
    */

    menuButtons.forEach(btn => {

        btn.addEventListener("click", () => {

            const destino =
                btn.dataset.target;

            const url =
                btn.dataset.url;

            if (destino) {

                abrirSubmenu(destino);

                return;

            }

            if (url) {

                window.location.href =

                    url;

            }

        });

    });



    backBtn?.addEventListener(

        "click",

        volverMenu

    );

});