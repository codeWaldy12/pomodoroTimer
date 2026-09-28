
import * as Storage from './storage.js';
import * as Timer from './timer.js';


function restaurer(cle, callback) {
    const valeurSauvegardee = Storage.getInformations(cle, "local");
    if (valeurSauvegardee !== null) {
        callback(valeurSauvegardee);
    }
}

restaurer("dureeSessionTravail", Timer.definirDureeSessionTravail);
restaurer("dureePauseCourte", Timer.definirDureePauseCourte);
restaurer("dureePauseLongue", Timer.definirDureePauseLongue);
restaurer("cycleRequis", Timer.definirDureeCycle);
restaurer("sonnerie", Timer.definirSon);
