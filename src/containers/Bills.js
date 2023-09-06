import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    //console.log(icon);
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    $("#modaleFile")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    $("#modaleFile").modal("show");
  };

  getBills = () => {
    if (this.store) {
      //console.log(this.store);
      // Vérifie si l'objet "store" est défini
      // L'objet "store" doit être disponible pour effectuer cette opération.
      // Récupère une liste de factures à partir du store
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          // Appelle la méthode "list()" sur l'objet "bills" du store pour récupérer une liste de factures.
          // récupération des données.
          const bills = snapshot.map((doc) => {
            // Itère sur chaque élément de la liste des factures (snapshot).
            try {
              // Essaye de formater les données de la facture, y compris la date et le statut.
              // Si les données sont valides, elles sont formatées avec les fonctions "formatDate" et "formatStatus".
              return {
                ...doc,
                date: doc.date, //retourner et  Conserve la date d'origine.
                dateFormated: formatDate(doc.date), //formatte la date
                status: formatStatus(doc.status), //formatte le statut
              };
            } catch (e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              //console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date, // conserve la date d'origine
                status: formatStatus(doc.status), //// Formatte le statut
              };
            }
          });
          console.log("length", bills.length);
          return bills; /// Retourne le tableau de factures, qu'elles soient formatées ou non.
        });
    }
  };
}
