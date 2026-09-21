export const timerDecompte = document.querySelector(".timer__decompte");
export const timerCycleCount = document.querySelector(".cycle__count");
export const nbrCycleCount = document.querySelector(".nbr__cycle");
export const timerEtat = document.querySelector(".timer__etat li");
export const btnDemarrerPause = document.querySelector("#btn-demarrer-pause");
export const btnReset = document.querySelector("#btn-reset");
export const session = document.querySelector("#session")
export let valueInput = null;
export let dureeSessionTravail = 1500;
export let tempsRestant = 1500;

export function affichageTemps(temps) {
    return timerDecompte.textContent = (Math.floor(temps / 60)).toString().padStart(2, "0") + ":" + (temps % 60).toString().padStart(2, "0")
}

// enregistrer la prefereence de la durée de la session de l'utilisateur 

session.addEventListener("change", e => {
    valueInput = +e.currentTarget.value;
    dureeSessionTravail = valueInput * 60;
    tempsRestant = dureeSessionTravail;
    if (pomodoroTimer !== null) {
        clearInterval(pomodoroTimer);
        pomodoroTimer = null;
    }
    affichageTemps(tempsRestant);
});

export let pomodoroTimer = null;

export function decompte() {
    pomodoroTimer = setInterval(() => {
        tempsRestant--;
        affichageTemps(tempsRestant);

        if (tempsRestant <= 0) {

            clearInterval(pomodoroTimer);
            tempsRestant = dureeSessionTravail;

            pomodoroTimer = null;
            btnDemarrerPause.innerText = "Démarrer";
        }
    }, 1000);
}

// alterner entrer demarrer et mettre en pause le decompte 

btnDemarrerPause.addEventListener("click", () => {
    if (pomodoroTimer === null) {
        decompte();
        btnDemarrerPause.innerText = "Pause";
    } else {
        clearInterval(pomodoroTimer);
        pomodoroTimer = null;
        btnDemarrerPause.innerText = "Démarrer";
    }
});

// réinitialiser le decompte a la derniere preference sauvegardée

btnReset.addEventListener("click", () => {
    tempsRestant = dureeSessionTravail;
    clearInterval(pomodoroTimer);
    pomodoroTimer = null;
    btnDemarrerPause.innerText = "Démarrer";
    affichageTemps(tempsRestant);
});



