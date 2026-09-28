import { storage } from './storage.js';

// affichage du minuteur
const timerDecompte = document.querySelector(".timer__decompte");
const timerIndicateur = document.querySelector(".timer__indicateur");
const timerCycleCount = document.querySelector(".cycle__count");
const nbrCycleCount = document.querySelector(".nbr__cycle");
const timerEtat = document.querySelector(".timer__etat");
let pastilles = document.querySelectorAll(".timer__etat li");

// boutons d'action
const btnDemarrerPause = document.querySelector("#btn-demarrer-pause");
const btnReset = document.querySelector("#btn-reset");

// réglages : champs
const session = document.querySelector("#session");
const inputPauseCourte = document.querySelector("#pause-courte");
const inputPauseLongue = document.querySelector("#pause-longue");
const inputCycleAvantPauseLongue = document.querySelector("#cycle_avant_pause_longue");
const choisirSonnerie = document.querySelector("#choisir-sonnerie");

// réglages : textes affichés à côté des champs
const reglageMinuteSession = document.querySelector("#reglage__minute-session");
const reglageMinuteCourte = document.querySelector("#reglage__minute-courte");
const reglageMinuteLongue = document.querySelector("#reglage__minute-longue");
const reglageCycle = document.querySelector(".reglage__cycle");


// sonneries disponibles

const sons = {
    "piano-sonnerie": "assets/sounds/default-piano.wav",
    "flute-sonnerie": "assets/sounds/flute.wav",
    "alarme-sonnerie": "assets/sounds/alarm.wav",
    "laser-sonnerie": "assets/sounds/laser.wav",
    "game-over-sonnerie": "assets/sounds/game-over.wav",
    "intro-sonnerie": "assets/sounds/intro.wav",
    "telephone-sonnerie": "assets/sounds/telephone.wav"
};

// réglages de l'utilisateur 

let dureeSessionTravail = 1500;
let dureePauseCourte = 300;
let dureePauseLongue = 900;
let cycleRequis = 4;
let sonChoisi = "piano-sonnerie";

// état de la session en cours 

let tempsRestant = dureeSessionTravail;
let phaseActuelle = "Travail";
let cycleActuel = 0;

let pomodoroTimer = null;

const son = new Audio(sons[sonChoisi]);

function enMinutes(secondes) {
    return Math.round(secondes / 60);
}

function affichageTemps(temps) {
    timerDecompte.textContent =
        Math.floor(temps / 60).toString().padStart(2, "0") + ":" +
        (temps % 60).toString().padStart(2, "0");
}

// génère les pastilles, puis recolore celles des cycles déjà terminés

function genererPastilles(nombre) {
    timerEtat.innerHTML = "";

    for (let i = 0; i < nombre; i++) {
        timerEtat.appendChild(document.createElement("li"));
    }

    pastilles = timerEtat.querySelectorAll("li");

    for (let i = 1; i <= cycleActuel; i++) {
        mettreAJourPastilles(i);
    }
}

// colore la pastille d'un cycle terminé

function mettreAJourPastilles(cycle) {
    const pastilleActuelle = pastilles[cycle - 1];
    if (pastilleActuelle) {
        pastilleActuelle.classList.add("timer__etat-termine");
    }
}

function reinitialiserPastilles() {
    pastilles.forEach(li => li.classList.remove("timer__etat-termine"));
}

// bloque ou débloque les champs de réglages

function verrouillerReglages(verrouille) {
    document.querySelectorAll("input, #choisir-sonnerie").forEach(champ => {
        champ.disabled = verrouille;
    });
}

function enregistrementPreference(element, callback) {
    element.addEventListener("change", e => {
        callback(+e.currentTarget.value * 60);
    });
}

// session de travail 

export function definirDureeSessionTravail(valeur) {
    dureeSessionTravail = valeur;
    session.value = enMinutes(valeur);
    reglageMinuteSession.textContent = enMinutes(valeur) + " min";

    if (phaseActuelle === "Travail") {
        tempsRestant = dureeSessionTravail;
        affichageTemps(tempsRestant);
    }
}

enregistrementPreference(session, (valeur) => {
    definirDureeSessionTravail(valeur);
    storage("dureeSessionTravail", dureeSessionTravail, "local");
});

// pause courte

export function definirDureePauseCourte(valeur) {
    dureePauseCourte = valeur;
    inputPauseCourte.value = enMinutes(valeur);
    reglageMinuteCourte.textContent = enMinutes(valeur) + " min";

    if (phaseActuelle === "Pause courte") {
        tempsRestant = dureePauseCourte;
        affichageTemps(tempsRestant);
    }
}

enregistrementPreference(inputPauseCourte, (valeur) => {
    definirDureePauseCourte(valeur);
    storage("dureePauseCourte", dureePauseCourte, "local");
});

// pause longue 

export function definirDureePauseLongue(valeur) {
    dureePauseLongue = valeur;
    inputPauseLongue.value = enMinutes(valeur);
    reglageMinuteLongue.textContent = enMinutes(valeur) + " min";

    if (phaseActuelle === "Pause longue") {
        tempsRestant = dureePauseLongue;
        affichageTemps(tempsRestant);
    }
}

enregistrementPreference(inputPauseLongue, (valeur) => {
    definirDureePauseLongue(valeur);
    storage("dureePauseLongue", dureePauseLongue, "local");
});

// nombre de cycles avant la pause longue 

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

// son de fin de phase

export function definirSon(valeur) {
    if (!sons[valeur]) return;

    sonChoisi = valeur;
    son.src = sons[valeur];
    choisirSonnerie.value = valeur;
}

choisirSonnerie.addEventListener("change", e => {
    definirSon(e.currentTarget.value);
    storage("sonnerie", sonChoisi, "local");
});

// basculer sur une nouvelle phase 

function indicateurDePhase(duree, phase, cycle) {
    verrouillerReglages(false);
    btnDemarrerPause.innerText = "Démarrer";

    clearInterval(pomodoroTimer);
    pomodoroTimer = null;

    tempsRestant = duree;
    affichageTemps(tempsRestant);

    phaseActuelle = phase;
    timerIndicateur.textContent = phaseActuelle;

    timerCycleCount.textContent = cycle;
}

// fin d'une phase 

function finDePhase(duree, phase, cycle) {
    son.play().catch(erreur => {
        console.error("Impossible de jouer le son :", erreur);
    });
    indicateurDePhase(duree, phase, cycle);
}

function decompte() {
    if (pomodoroTimer !== null) return;

    pomodoroTimer = setInterval(() => {
        tempsRestant--;
        affichageTemps(tempsRestant);

        if (phaseActuelle === "Travail" && tempsRestant <= 0) {
            cycleActuel++;
            mettreAJourPastilles(cycleActuel);

            if (cycleActuel < cycleRequis) {
                finDePhase(dureePauseCourte, "Pause courte", cycleActuel);
            } else {
                finDePhase(dureePauseLongue, "Pause longue", cycleActuel);
            }
        } else if (phaseActuelle === "Pause courte" && tempsRestant <= 0) {
            finDePhase(dureeSessionTravail, "Travail", cycleActuel);
        } else if (phaseActuelle === "Pause longue" && tempsRestant <= 0) {
            cycleActuel = 0;
            finDePhase(dureeSessionTravail, "Travail", cycleActuel);
            reinitialiserPastilles();
        }
    }, 1); // TODO : remettre 1000 avant la mise en production
}

// alterne entre démarrer et mettre en pause

btnDemarrerPause.addEventListener("click", () => {
    if (pomodoroTimer === null) {
        decompte();
        btnDemarrerPause.innerText = "Pause";
        verrouillerReglages(true);
    } else {
        clearInterval(pomodoroTimer);
        pomodoroTimer = null;
        btnDemarrerPause.innerText = "Démarrer";
        verrouillerReglages(false);
    }
});

// remet tout à zéro, sur la dernière durée de travail choisie

btnReset.addEventListener("click", () => {
    cycleActuel = 0;
    indicateurDePhase(dureeSessionTravail, "Travail", cycleActuel);
    reinitialiserPastilles();
});

// sauvegarde l'état juste avant la fermeture ou le rechargement de la page

window.addEventListener("beforeunload", () => {
    storage("etat", { tempsRestant, phaseActuelle, cycleActuel }, "session");
    verrouillerReglages(false);
});

// remet en place l'état sauvegardé 

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

genererPastilles(cycleRequis);