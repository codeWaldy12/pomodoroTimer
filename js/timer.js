export const timerDecompte = document.querySelector(".timer__decompte");
export const timerCycleCount = document.querySelector(".cycle__count");
export const nbrCycleCount = document.querySelector(".nbr__cycle");
export const timerIndicateur = document.querySelector(".timer__indicateur");
export const timerEtat = document.querySelector(".timer__etat");
export let pastilles = document.querySelectorAll(".timer__etat li");
export const btnDemarrerPause = document.querySelector("#btn-demarrer-pause");
export const btnReset = document.querySelector("#btn-reset");
export const session = document.querySelector("#session")
export const inputPauseCourte = document.querySelector("#pause-courte");
export const inputPauseLongue = document.querySelector("#pause-longue");
export const inputCycleAvantPauseLongue = document.querySelector("#cycle_avant_pause_longue");
export const reglageMinuteSession = document.querySelector("#reglage__minute-session");
export const reglageMinuteCourte = document.querySelector("#reglage__minute-courte");
export const reglageMinuteLongue = document.querySelector("#reglage__minute-longue");
export const reglageCycle = document.querySelector(".reglage__cycle");

let valueInput = null;
let dureeSessionTravail = 1500;
let tempsRestant = 1500;
let dureePauseCourte = 300;
let dureePauseLongue = 900;
let cycleActuel = 0;
let cycleRequis = 4;

export function affichageTemps(temps) {
    return timerDecompte.textContent = (Math.floor(temps / 60)).toString().padStart(2, "0") + ":" + (temps % 60).toString().padStart(2, "0")
}

// generer les pastilles en fonction du cycle choisi par l'utilisateur 

function genererPastilles(nombre) {
    timerEtat.innerHTML = "";

    for (let i = 0; i < nombre; i++) {
        const li = document.createElement("li");
        timerEtat.appendChild(li);
    }

    pastilles = timerEtat.querySelectorAll("li");
}

genererPastilles(cycleRequis);

// colorer une pastille lorsqu'une session de travail est terminée 

function mettreAJourPastilles(cycle) {
    const pastilleActuelle = pastilles[cycle - 1];
    if (pastilleActuelle) {
        pastilleActuelle.classList.add("timer__etat-termine");
    }
}

// enregistrer les prefereences de durées de l'utilisateur 

function enregistrementPreference(element, callback) {
    element.addEventListener("change", e => {
        valueInput = +e.currentTarget.value;
        const valeurEnregistree = valueInput * 60;
        callback(valeurEnregistree);
    });
}

// sauvegardder de la durée de la session de travail 

enregistrementPreference(session, (valeur) => {
    dureeSessionTravail = valeur;
    reglageMinuteSession.textContent = Math.floor(dureeSessionTravail / 60) + " min";

    if (phaseActuelle === "Travail") {
        tempsRestant = dureeSessionTravail;
        affichageTemps(tempsRestant);
    }

    if (pomodoroTimer !== null) {
        clearInterval(pomodoroTimer);
        pomodoroTimer = null;
        btnDemarrerPause.innerText = "Démarrer";
    }
});

// sauvegarder la durée de la Pause courte 

enregistrementPreference(inputPauseCourte, (valeur) => {
    dureePauseCourte = valeur;
    reglageMinuteCourte.textContent = Math.floor(dureePauseCourte / 60) + " min";
});

// sauvegarder la dureé de la Pause longue 

enregistrementPreference(inputPauseLongue, (valeur) => {
    dureePauseLongue = valeur;
    reglageMinuteLongue.textContent = Math.floor(dureePauseLongue / 60) + " min";
});

// sauvegarder le maximun de cycle avant une Pause longue 

inputCycleAvantPauseLongue.addEventListener("change", (e) => {
    cycleRequis = +e.currentTarget.value;
    nbrCycleCount.textContent = cycleRequis;
    reglageCycle.textContent = cycleRequis + " cycle";
    genererPastilles(cycleRequis);
});

let pomodoroTimer = null;
let phaseActuelle = "Travail";

function indicateurDePhase(duree, phase, cycle) {
    btnDemarrerPause.innerText = "Démarrer";

    clearInterval(pomodoroTimer);
    pomodoroTimer = null;

    tempsRestant = duree;
    affichageTemps(tempsRestant);

    phaseActuelle = phase;
    timerIndicateur.textContent = phaseActuelle;

    timerCycleCount.textContent = cycle;
}

export function decompte() {
    pomodoroTimer = setInterval(() => {
        tempsRestant--;
        affichageTemps(tempsRestant);
        mettreAJourPastilles(cycleActuel);
        if (phaseActuelle === "Travail" && tempsRestant <= 0) {
            cycleActuel++;
            mettreAJourPastilles(cycleActuel);
            if (cycleActuel !== cycleRequis) {
                indicateurDePhase(dureePauseCourte, "Pause courte", cycleActuel);
            } else {
                indicateurDePhase(dureePauseLongue, "Pause longue", cycleActuel);
            }
        } else if (phaseActuelle === "Pause courte" && tempsRestant <= 0) {
            indicateurDePhase(dureeSessionTravail, "Travail", cycleActuel);
        } else if (phaseActuelle === "Pause longue" && tempsRestant <= 0) {
            cycleActuel = 0;
            indicateurDePhase(dureeSessionTravail, "Travail", cycleActuel);
            reinitialiserPastilles();
        }
    }, 10);
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

// réinitialiser tout le timer a la derniere preference sauvegardée

function reinitialiserPastilles() {
    document.querySelectorAll(".timer__etat li").forEach(li => {
        li.classList.remove("timer__etat-termine");
    });
}

btnReset.addEventListener("click", () => {
    cycleActuel = 0;
    indicateurDePhase(dureeSessionTravail, "Travail", cycleActuel);
    reinitialiserPastilles();
});





