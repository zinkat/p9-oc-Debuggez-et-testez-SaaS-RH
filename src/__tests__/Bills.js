/**
 * @jest-environment jsdom
 */
import { screen, waitFor, within } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js"; // Données mocké de notes de frais
import { ROUTES_PATH, ROUTES } from "../constants/routes";// Chemins et routes constants
import { localStorageMock } from "../__mocks__/localStorage.js";// Implémentation mocké de localStorage
import mockedStore from "../__mocks__/store"; //Implémentation mocké du store
import router from "../app/Router.js"; // Gestionnaire de routes
import Bills from "../containers/Bills.js";// Composant Bills à tester

jest.mock("../app/store", () => mockedStore);// Mock du store pour les tests

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Simulation de l'utilisateur connecté en tant qu'employé
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
       // Attente de l'affichage de l'icône de fenêtre
      await waitFor(() => screen.getByTestId("icon-window"));
      // Sélection de l'icône de fenêtre
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon"); //vérification si l'icône a une classe CSS appelée "active-icon".
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      // Extraction des dates des notes de frais affichées
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
        // Fonction pour tri anti-chronologique
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      // Tri des dates dans l'ordre anti-chronologique
      const datesSorted = [...dates].sort(antiChrono);
       // Vérification si les dates affichées sont triées correctement
      expect(dates).toEqual(datesSorted);
    });
// test : comportement lorsque l'utilisateur clique sur le bouton "Nouvelle note de frais"
    describe("When I click on New Bill Button", () => {
      test("Then I should be sent on New Bill form", () => {
        // Fonction de simulation de navigation
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        // Simulation de l'utilisateur connecté en tant qu'employé
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        // Création d'une instance nouvelle facture
        const bills = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });
        // Remplacement du contenu du corps du document par l'interface des notes de frais

        document.body.innerHTML = BillsUI({ data: bills });

        // Recherche du bouton "Nouvelle note de frais" dans l'interface
        const buttonNewBill = screen.getByRole("button", {
          name: /nouvelle note de frais/i,
        });
        // Vérification que le bouton a été trouvé
        expect(buttonNewBill).toBeTruthy();

        // Écoute de l'événement de clic sur le bouton
        const handleClickNewBill = jest.fn(bills.handleClickNewBill);
        buttonNewBill.addEventListener("click", handleClickNewBill);
        userEvent.click(buttonNewBill);

        // Vérification que la fonction de gestion de clic a été appelée
        expect(handleClickNewBill).toHaveBeenCalled();
      });
    });

    describe("When I click on one eye icon", () => {
      test("Then a modal should open", async () => {
        // La fonction onNavigate simule la navigation en modifiant le contenu du corps (body) du document.
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Simulation de l'utilisateur connecté en tant qu'employé
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        // Création d'une instance de Bills avec les paramètres nécessaires
        const billsPage = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });
        // Préparation de l'interface utilisateur de Bills
        document.body.innerHTML = BillsUI({ data: bills });
        // Recherche de toutes les icônes d'œil dans l'interface
        const iconEyes = screen.getAllByTestId("icon-eye");
        // Écoute de l'événement de clic sur l'icône d'œil
        const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);
 // Récupération de l'élément de la fenêtre modale
        const modale = document.getElementById("modaleFile");

        // Mock de la fonction modal Bootstrap pour montrer la modale
        $.fn.modal = jest.fn(() => modale.classList.add("show")); 
        // Itération sur toutes les icônes d'œil
        iconEyes.forEach((iconEye) => {
           // Écoute de l'événement de clic sur l'icône d'œil
          iconEye.addEventListener("click", () => handleClickIconEye(iconEye));
           // Simulation d'un clic sur l'icône d'œil
          userEvent.click(iconEye);
          // Vérification que la fonction de gestion de clic a été appelée
          expect(handleClickIconEye).toHaveBeenCalled();
           // Vérification que la fenêtre modale a la classe "show" pour s'afficher
          expect(modale).toHaveClass("show");
        });
      });
    });

    describe("When I went on Bills page and it is loading", () => {
      test("Then, Loading page should be rendered", () => {
        // Remplacer le contenu du corps du document avec l'interface BillsUI en mode "loading"
        document.body.innerHTML = BillsUI({ loading: true });
        // Vérification que le texte "Loading..." est visible à l'écran
        expect(screen.getByText("Loading...")).toBeVisible();
           // Réinitialisation du contenu du corps du document à une chaîne vide
        document.body.innerHTML = "";
      });
    });

    describe("When I am on Bills page but back-end send an error message", () => {
      test("Then, Error page should be rendered", () => {
        // Remplacer le contenu du corps du document avec l'interface BillsUI en mode "error"
        document.body.innerHTML = BillsUI({ error: "error message" });
          // Vérification que le texte "Erreur" est visible à l'écran
        expect(screen.getByText("Erreur")).toBeVisible();
        // Réinitialisation du contenu du corps du document à une chaîne vide
        document.body.innerHTML = "";
      });
    });

    
// test d'intégration GET
    describe("When I navigate to Bills Page as Employee", () => {
      test("fetches bills from mock API GET", async () => {
        // Espionnage de la fonction "bills" du store pour le test
        jest.spyOn(mockedStore, "bills");
            // Simulation d'un utilisateur connecté en tant qu'employé
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        );
      // Création d'un élément racine pour le rendu de l'application
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        // Mise en place du gestionnaire de routage
        router();
        window.onNavigate(ROUTES_PATH.Bills);
// Attente de l'affichage du texte "Mes notes de frais"
        await waitFor(() => screen.getByText("Mes notes de frais"));
// Recherche du bouton "Nouvelle note de frais" et de la liste des notes
        const newBillBtn = await screen.findByRole("button", {
          name: /nouvelle note de frais/i,
        });
        const billsTableRows = screen.getByTestId("tbody");
// Vérification de l'existence du bouton et de la liste des notes
        expect(newBillBtn).toBeTruthy();
        expect(billsTableRows).toBeTruthy();
        // Vérification du nombre de lignes de notes
        expect(within(billsTableRows).getAllByRole("row")).toHaveLength(4);
      });

      test("fetches bills from an API and fails with 404 message error", async () => {
          // Simulation de l'échec de la requête GET avec un message d'erreur 404
        mockedStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        
    // Simulation de la navigation vers la page des notes de frais
        window.onNavigate(ROUTES_PATH.Bills);
        // Attente d'une "prochaine fois" de traitement (dans ce cas, échec de la requête)
        await new Promise(process.nextTick);
         // Vérification de la présence du message d'erreur 404
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockedStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});

