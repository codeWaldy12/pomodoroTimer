export const timerDecompte = document.querySelector(".timer__decompte");
export const timerCycleCount = document.querySelector(".cycle__count");
export const nbrCycleCount = document.querySelector(".nbr__cycle");
export const timerEtat = document.querySelector(".timer__etat li");
export const btnDemarerPause = document.querySelector("#btn-demarer-pause");
export const btnReset = document.querySelector("#btn-reset");
export const session = document.querySelector("#session")
export let valueInput;
export let tempsRestant = 1500;

export function affichageTemps() {
    return timerDecompte.textContent = (Math.floor(tempsRestant / 60)).toString().padStart(2, "0") + ":" + (tempsRestant % 60).toString().padStart(2, "0")
}

session.addEventListener("change", e => {
    valueInput = e.currentTarget.value;
    tempsRestant = valueInput * 60;
    if (pomodoroTimer !== null) {
        clearInterval(pomodoroTimer);
    }
    affichageTemps();
});

export let pomodoroTimer = null;

export function decompte() {
    pomodoroTimer = setInterval(() => {
        tempsRestant--;
        affichageTemps();
        if (tempsRestant <= 0) {
            clearInterval(pomodoroTimer);
            pomodoroTimer = null;
            btnDemarerPause.innerText = "Demarer";
        }
    }, 1000);
}

btnDemarerPause.addEventListener("click", () => {
    if (pomodoroTimer === null) {
        decompte();
        btnDemarerPause.innerText = "Pause";
    } else {
        clearInterval(pomodoroTimer);
        pomodoroTimer = null;
        btnDemarerPause.innerText = "Demarer";
    }
})

