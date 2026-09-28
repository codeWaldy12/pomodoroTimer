
import * as Storage from './storage.js';
import * as Pomodoro from './pomodoro.js';


function restaurer(cle, callback) {
    const valeurSauvegardee = Storage.getInformations(cle, "local");
    if (valeurSauvegardee !== null) {
        callback(valeurSauvegardee);
    }
}

restaurer("dureeSessionTravail", Pomodoro.definirDureeSessionTravail);
restaurer("dureePauseCourte", Pomodoro.definirDureePauseCourte);
restaurer("dureePauseLongue", Pomodoro.definirDureePauseLongue);
restaurer("cycleRequis", Pomodoro.definirDureeCycle);
restaurer("sonnerie", Pomodoro.definirSon);

const etatSauvegarde = Storage.getInformations("etat", "session");
if (etatSauvegarde !== null) {
    Pomodoro.definirEtat(etatSauvegarde);
}