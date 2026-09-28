export function storage(cle, valeur, typeDeSauvegarde) {
    const valeurConvertie = JSON.stringify(valeur)
    if (typeDeSauvegarde === "local") {
        localStorage.setItem(
            cle,
            valeurConvertie
        );
    } else if (typeDeSauvegarde === "session") {
        sessionStorage.setItem(
            cle,
            valeurConvertie
        )
    }

}

export function getInformations(cle, typeDeSauvegarde) {
    let datas = null;
    if(typeDeSauvegarde === "local") {
        datas = localStorage.getItem(cle);
        if(datas !== null) {
            datas = JSON.parse(datas);
        }
    } else if(typeDeSauvegarde === "session") {
        datas = sessionStorage.getItem(cle);
        if(datas !== null) {
            datas = JSON.parse(datas);
        }
    }

    return datas;
}
