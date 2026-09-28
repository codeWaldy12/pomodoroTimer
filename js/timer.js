import {storage, getInformations} from './storage.js';

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
export const choisirSonnerie = document.querySelector("#choisir-sonnerie");
export const sonnerieImport = document.querySelector("#importer-son");

let valueInput = null;
let dureeSessionTravail = 1500;
let tempsRestant = 1500;
let dureePauseCourte = 300;
let dureePauseLongue = 900;
let cycleActuel = 0;
let cycleRequis = 4;
const sons = {
    "piano-sonnerie": "assets/sounds/default-piano.wav",
    "flute-sonnerie": "assets/sounds/flute.wav",
}
let sonChoisi = sons["piano-sonnerie"];
const son = new Audio(sonChoisi);

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

export function definirDureeSessionTravail(valeur) {
    dureeSessionTravail = valeur;
    session.value = Math.round(valeur / 60);
    reglageMinuteSession.textContent = Math.round(valeur / 60) + " min";

    if (phaseActuelle === "Travail") {
        tempsRestant = dureeSessionTravail;
        affichageTemps(tempsRestant);
    }
}

enregistrementPreference(session, (valeur) => {
    definirDureeSessionTravail(valeur);

    if (pomodoroTimer !== null) {
        clearInterval(pomodoroTimer);
        pomodoroTimer = null;
        btnDemarrerPause.innerText = "Démarrer";
    }

    storage("dureeSessionTravail", dureeSessionTravail, "local");
});

// sauvegarder la durée de la Pause courte 

export function definirDureePauseCourte(valeur) {
    dureePauseCourte = valeur;
    inputPauseCourte.value = Math.round(valeur / 60);
    reglageMinuteCourte.textContent = Math.round(valeur / 60) + " min";
}

enregistrementPreference(inputPauseCourte, (valeur) => {
    definirDureePauseCourte(valeur);
    storage("dureePauseCourte", dureePauseCourte, "local");
});

// sauvegarder la dureé de la Pause longue 

export function definirDureePauseLongue(valeur) {
    dureePauseLongue = valeur;
    inputPauseLongue.value = Math.round(valeur / 60);
    reglageMinuteLongue.textContent = Math.round(valeur / 60) + " min";
}

enregistrementPreference(inputPauseLongue, (valeur) => {
    definirDureePauseLongue(valeur);
    storage("dureePauseLongue", dureePauseLongue, "local");
});

// sauvegarder le maximun de cycle avant une Pause longue 

export function definirDureeCycle(valeur) {
    cycleRequis = valeur;
    inputCycleAvantPauseLongue.value = valeur;
    nbrCycleCount.textContent = valeur;
    reglageCycle.textContent = valeur + " cycle";
    genererPastilles(valeur);
}

inputCycleAvantPauseLongue.addEventListener("change", (e) => {
    definirDureeCycle(+e.currentTarget.value);
    storage("cycleRequis", cycleRequis, "local");
});

// selectionner la sonnerie 

export function definirSon(valeur) {
    sonChoisi = valeur;
    son.src = sons[valeur];
    choisirSonnerie.value = valeur;
}

choisirSonnerie.addEventListener("change", e => {
    const valeur = e.currentTarget.value;
    definirSon(valeur);
    storage("sonnerie", valeur, "local");
});

let pomodoroTimer = null;
let phaseActuelle = "Travail";

// indique la phase actuelle du pomodoro 

export function indicateurDePhase(duree, phase, cycle) {
    btnDemarrerPause.innerText = "Démarrer";

    clearInterval(pomodoroTimer);
    pomodoroTimer = null;

    tempsRestant = duree;
    affichageTemps(tempsRestant);

    phaseActuelle = phase;
    timerIndicateur.textContent = phaseActuelle;

    timerCycleCount.textContent = cycle;

    son.play().catch(erreur => {
        console.error("Impossible de jouer le son :", erreur);
    });

}

export function decompte() {
    pomodoroTimer = setInterval(() => {
        tempsRestant--;
        affichageTemps(tempsRestant);
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
    }, 1000);
}

// alterner entrer demarrer et mettre en pause le decompte 

btnDemarrerPause.addEventListener("click", () => {
    if (pomodoroTimer === null) {
        decompte();
        btnDemarrerPause.innerText = "Pause";
        document.querySelectorAll("input, #choisir-sonnerie").forEach(entrer => entrer.disabled = true)
    } else {
        clearInterval(pomodoroTimer);
        pomodoroTimer = null;
        btnDemarrerPause.innerText = "Démarrer";
        document.querySelectorAll("input, #choisir-sonnerie").forEach(entrer => entrer.disabled = false)
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

// sauvegarder la session de l'utilisateur au moment de la fermeture ou du rechargement de la page 

window.addEventListener("beforeunload", () => {
    storage("etat", { tempsRestant, phaseActuelle, cycleActuel }, "session");
});

export function definirEtat(etat) {
    tempsRestant = etat.tempsRestant;
    phaseActuelle = etat.phaseActuelle;
    cycleActuel = etat.cycleActuel;

    affichageTemps(tempsRestant);
    timerIndicateur.textContent = phaseActuelle;
    timerCycleCount.textContent = cycleActuel;

    reinitialiserPastilles();
    for (let i = 1; i <= cycleActuel; i++) {
        mettreAJourPastilles(i);
    }
}