document.addEventListener("DOMContentLoaded", () => {
    const selectAudio = new Audio('assets/audios/Select.wav');
    const pressedAudio = new Audio('assets/audios/Pressedmenu.wav');

    selectAudio.volume = 0.8;
    pressedAudio.volume = 0.8;

    let currentActiveButton = null;

    function handlePointerMove(clientX, clientY) {
        const element = document.elementFromPoint(clientX, clientY);
        const button = element ? element.closest('.gameMenu button') : null;

        if (button) {
            if (currentActiveButton !== button) {
                if (currentActiveButton) {
                    currentActiveButton.classList.remove('active-hover');
                }
                currentActiveButton = button;
                button.classList.add('active-hover');

                selectAudio.currentTime = 0;
                selectAudio.play().catch(error => {
                    console.log("Audio de selección bloqueado:", error);
                });
            }
        } else {
            if (currentActiveButton) {
                currentActiveButton.classList.remove('active-hover');
                currentActiveButton = null;
            }
        }
    }

    // Usamos pointermove global para rastrear tanto el mouse en PC como el dedo en móvil
    window.addEventListener('pointermove', (e) => {
        handlePointerMove(e.clientX, e.clientY);
    });

    window.addEventListener('pointerdown', (e) => {
        const button = e.target.closest('.gameMenu button');
        if (button) {
            handlePointerMove(e.clientX, e.clientY);
            
            pressedAudio.currentTime = 0;
            pressedAudio.play().catch(error => {
                console.log("Audio presionado bloqueado:", error);
            });
            
            button.classList.add('is-pressed');
        }
    });

    window.addEventListener('pointerup', (e) => {
        if (currentActiveButton) {
            currentActiveButton.classList.remove('is-pressed');
        }
    });
});
