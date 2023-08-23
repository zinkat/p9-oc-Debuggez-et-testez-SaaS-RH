/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import mockedStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      //expect(windowIcon).toHaveClass("active-icon")//vérification si l'icône a une classe CSS appelée "active-icon".
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
// describe("When I click on New Bill Button", () => {
//   test("Then I should be sent on New Bill form", () => {
//     const onNavigate = pathname => {
//       document.body.innerHTML = ROUTES({ pathname });
//     };
//  // Simulation de l'utilisateur connecté en tant qu'employé
//     Object.defineProperty(window, "localStorage", {
//       value: localStorageMock,
//     });
//     window.localStorage.setItem(
//       "user",
//       JSON.stringify({
//         type: "Employee",
//       })
//     );
//     // Création d'une instance nouvelle facture
//     const bills = new Bills({
//       document,
//       onNavigate,
//       store: mockedStore,
//       localStorage: window.localStorage,
//     });

//     document.body.innerHTML = BillsUI({ data: bills });

// // Recherche du bouton "Nouvelle note de frais" dans l'interface
//     const buttonNewBill = screen.getByRole("button", {
//       name: /nouvelle note de frais/i,
//     });
//     expect(buttonNewBill).toBeTruthy();

//     // Écoute de l'événement de clic sur le bouton
//     const handleClickNewBill = jest.fn(bills.handleClickNewBill);
//     buttonNewBill.addEventListener("click", handleClickNewBill);
//     userEvent.click(buttonNewBill);

//     // Vérification que la fonction de gestion de clic a été appelée
//     expect(handleClickNewBill).toHaveBeenCalled();
//   });
// });

// describe("When I click on one eye icon", () => {
//   test("Then a modal should open", async () => {

//     // La fonction onNavigate simule la navigation en modifiant le contenu du corps (body) du document.
//     const onNavigate = pathname => {
//       document.body.innerHTML = ROUTES({ pathname });
//     };

//     // Simulation de l'utilisateur connecté en tant qu'employé
//     Object.defineProperty(window, "localStorage", {
//       value: localStorageMock,
//     });

//     window.localStorage.setItem(
//       "user",
//       JSON.stringify({
//         type: "Employee",
//       })
//     );
//  // Création d'une instance de Bills avec les paramètres nécessaires
//     const billsPage = new Bills({
//       document,
//       onNavigate,
//       store: mockedStore,
//       localStorage: window.localStorage,
//     });
//  // Préparation de l'interface utilisateur de Bills
//     document.body.innerHTML = BillsUI({ data: bills });
//  // Recherche de toutes les icônes d'œil dans l'interface
//     const iconEyes = screen.getAllByTestId("icon-eye");
//     // Écoute de l'événement de clic sur l'icône d'œil
//     const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);

//     const modale = document.getElementById("modaleFile");

//     // Mock de la fenêtre modale Bootstrap
//     $.fn.modal = jest.fn(() => modale.classList.add("show")); //mock de la modale Bootstrap
//   // Itération sur toutes les icônes d'œil
//     iconEyes.forEach(iconEye => {
//       iconEye.addEventListener("click", () => handleClickIconEye(iconEye));
//       userEvent.click(iconEye);
//      // Vérification que la fonction de gestion de clic a été appelée
//       expect(handleClickIconEye).toHaveBeenCalled();
//     // Vérification que la modale a la classe "show"
//       expect(modale).toHaveClass("show");
//     });
//   });
// });

