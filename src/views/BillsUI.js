import VerticalLayout from "./VerticalLayout.js";
import ErrorPage from "./ErrorPage.js";
import LoadingPage from "./LoadingPage.js";

import Actions from "./Actions.js";
// Fonction 'row' qui génère une ligne HTML pour une facture donnée.
const row = (bill) => {
  // Formatte la date de la facture, en utilisant 'bill.dateFormated' s'il existe, sinon 'bill.date' brut.
  const billDate = bill.dateFormated ?? bill.date;
  // Retourne une chaîne de caractères avec le modèle HTML d'une ligne de tableau pour la facture.
  return `
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${billDate}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `;
};

// Fonction 'rows' qui génère toutes les lignes du tableau HTML pour un ensemble de données de factures.
const rows = (data) => {
  // Vérifie si 'data' est défini et s'il contient des éléments (factures)
  return data && data.length
    ? data
        .sort((a, b) => (a.date < b.date ? 1 : -1)) // Trie les factures par date, du plus récent au plus ancien.
        .map((bill) => row(bill)) // Mappe chaque facture en une ligne HTML en utilisant la fonction 'row'.
        .join("") // Joint toutes les lignes en une seule chaîne de caractères.
    : "";
};

export default ({ data: bills, loading, error }) => {
  const modal = () => `
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `;
  // Gère les différents états de la page
  if (loading) {
    return LoadingPage(); // Appelle une fonction "LoadingPage" pour la page de chargement
  } else if (error) {
    return ErrorPage(error); // Appelle une fonction "ErrorPage" avec le message d'erreur
  }

  return `
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`;
};
