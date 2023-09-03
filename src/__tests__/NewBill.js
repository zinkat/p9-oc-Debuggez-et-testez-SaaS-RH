/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, within } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then newBill icon in vertical layout should be highlighted", () => {
      // Simulation de l'utilisateur connecté en tant qu'employé
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      // Création d'un élément racine pour le rendu de l'application
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Mise en place du gestionnaire de routage
      router();
      // Remplacement du contenu du corps du document par l'interface NewBillUI
      document.body.innerHTML = NewBillUI();
      // Navigation vers la page "NewBill"
      window.onNavigate(ROUTES_PATH.NewBill);
      // Recherche de l'icône "icon-mail" dans l'interface
      const MailIcon = screen.getByTestId("icon-mail");
      // //to-do write assertion
      // Vérification que l'icône "icon-mail" a la classe "active-icon"
      expect(MailIcon).toHaveClass("active-icon");
    });
  });
});

// test POST Bill
describe("When I do fill fields in correct format and I click on submit button", () => {
  test("Then the submission process should work properly, and I should be sent on the Bills Page", async () => {
    // Simulation de l'utilisateur connecté en tant qu'employé
    document.body.innerHTML = NewBillUI();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );

    // Création d'un élément racine pour le rendu de l'application
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    // Mise en place du gestionnaire de routage
    router();
    // Remplacement du contenu du corps du document par l'interface NewBillUI
    document.body.innerHTML = NewBillUI();
    // Navigation vers la page "NewBill"
    window.onNavigate(ROUTES_PATH.NewBill);
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    //prépare l'interface utilisateur de la page NewBill
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    //Simulation d'interaction avec l'interface utilisateur (remplir les champs, télécharger un fichier)
    const inputData = bills[0];
    //initialisation de formulaire
    const newBillForm = screen.getByTestId("form-new-bill");

    const handleSubmit = jest.fn(newBill.handleSubmit);
    const imageInput = screen.getByTestId("file");
    //fonction getFile crée un fichier simulé pour être téléchargé en utilisant l'élément <input type="file"> du formulaire.
    const getFile = (fileName, fileType) => {
      const file = new File(["img"], fileName, {
        type: [fileType],
      });

      return file;
    };
    //un fichier avec une extension "jpg" est simulé.
    const file = getFile(inputData.fileName, ["image/jpg"]);
    //vérification si fileValidation est appeléeavec les bons arguments
    const fileValidation = jest.spyOn(newBill, "fileValidation");
    const selectExpenseType = (expenseType) => {
      //selection d'un élement de la liste déroulante
      const dropdown = screen.getByRole("combobox");
      //sélection de l'option correspondant au type de dépense (expenseType) dans la liste déroulante.
      userEvent.selectOptions(
        dropdown,
        within(dropdown).getByRole("option", { name: expenseType })
      );
      return dropdown;
    };
    // fonctions utilitaires sont créées pour accéder facilement aux champs du formulaire.
    const getExpenseName = () => screen.getByTestId("expense-name");
    const getAmount = () => screen.getByTestId("amount");

    const getDate = () => screen.getByTestId("datepicker");

    const getVat = () => screen.getByTestId("vat");

    const getPct = () => screen.getByTestId("pct");

    const getCommentary = () => screen.getByTestId("commentary");
    // On remplit les champs de formulaire avec les données mock
    selectExpenseType(inputData.type);
    userEvent.type(getExpenseName(), inputData.name);
    fireEvent.change(getDate(), { target: { value: inputData.date } });
    userEvent.type(getAmount(), inputData.amount.toString());
    userEvent.type(getVat(), inputData.vat.toString());
    userEvent.type(getPct(), inputData.pct.toString());
    userEvent.type(getCommentary(), inputData.commentary);
    await userEvent.upload(imageInput, file); //le fichier simulé est téléchargé dans le champ de fichier.

    // On s'assure que les données entrées dans les champ obligatoire sont valides et les champ ne sont pas vide
    expect(selectExpenseType(inputData.type).validity.valueMissing).toBeFalsy();
    //expect(getDate().value).toEqual(inputData.date);
    expect(getDate().validity.valueMissing).toBeFalsy();
    expect(getAmount().validity.valueMissing).toBeFalsy();
    expect(getPct().validity.valueMissing).toBeFalsy();
    expect(fileValidation(file)).toBeTruthy();

    newBill.fileName = file.name;

    // On s'assure que le formulaire est soumettable
    const submitButton = screen.getByRole("button", { name: /envoyer/i });
    expect(submitButton.type).toBe("submit");

    // On soumet le formulaire en cliquant sur le bouton "Envoyer"
    newBillForm.addEventListener("submit", handleSubmit);
    userEvent.click(submitButton);
    //La fonction handleSubmit est appelée une seul fois
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    // On s'assure qu'on est bien renvoyé sur la page Bills
    expect(screen.getByText(/Mes notes de frais/i)).toBeVisible();
  });

  test("Then a new bill should be created", async () => {
    const createBill = jest.fn(mockStore.bills().create); // fonction qui surveille les appels à la méthode create du store
    const updateBill = jest.fn(mockStore.bills().update);
    //appelle la méthode createBill() pour créer une nouvelle facture et returne un objet avec 2 proprieté
    const { fileUrl, key } = await createBill();
    document.body.innerHTML = NewBillUI();
    expect(createBill).toHaveBeenCalledTimes(1);

    expect(key).toBe("1234");
    expect(fileUrl).toBe("https://localhost:3456/images/test.jpg");
    // simulation d'une mise à jour de la facture après sa création.
    const newBill = updateBill();

    expect(updateBill).toHaveBeenCalledTimes(1);

    await expect(newBill).resolves.toEqual({
      id: "47qAXb6fIm2zOKkLzMro",
      vat: "80",
      fileUrl:
        "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      status: "pending",
      type: "Hôtel et logement",
      commentary: "séminaire billed",
      name: "encore",
      fileName: "preview-facture-free-201801-pdf-1.jpg",
      date: "2004-04-04",
      amount: 400,
      commentAdmin: "ok",
      email: "a@a",
      pct: 20,
    });
  });

  // Champs non remplis

  describe("When I do not fill fields and I click on submit button", () => {
    test("Then it should stay on newBill page", () => {
      const setNewBill = () => {
        return new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
      };
      const newBill = setNewBill();

      const newBillForm = screen.getByTestId("form-new-bill");

      const handleSubmit = jest.spyOn(newBill, "handleSubmit");

      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);

      expect(handleSubmit).toHaveBeenCalledTimes(1);

      expect(newBillForm).toBeVisible();
    });
  });
  //  Valeur par défaut champ PCT -
  describe("When nothing has been typed in PCT input", () => {
    test("then the PCT should be 20 by default", () => {
      const setNewBill = () => {
        return new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
      };
      const newBill = setNewBill();

      const inputData = bills[0];

      const newBillForm = screen.getByTestId("form-new-bill");

      const handleSubmit = jest.spyOn(newBill, "handleSubmit");
      const updateBill = jest.spyOn(newBill, "updateBill");

      newBill.fileName = inputData.fileName;

      newBillForm.addEventListener("submit", handleSubmit);

      fireEvent.submit(newBillForm);

      expect(handleSubmit).toHaveBeenCalledTimes(1);

      expect(updateBill).toHaveBeenCalledWith(
        expect.objectContaining({
          pct: 20,
        })
      );
    });
  });
  //Bon format de fichier uploadé

  describe("When I am on NewBill page and I upload a file with an extension jpg, jpeg or png", () => {
    test("Then no error message for the file input should be displayed", () => {
      const setNewBill = () => {
        return new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
      };
      const newBill = setNewBill();

      const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
      const imageInput = screen.getByTestId("file");
      const fileValidation = jest.spyOn(newBill, "fileValidation");

      imageInput.addEventListener("change", handleChangeFile);

      fireEvent.change(imageInput, {
        target: {
          files: [
            new File(["image"], "image.jpg", {
              type: "image/jpg",
            }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalledTimes(1);
      expect(fileValidation.mock.results[0].value).toBeTruthy();
    });
  });
  describe("When an error occurs on API", () => {
    test("Then new bill is added to the API but fetch fails with '404 page not found' error", async () => {
      const setNewBill = () => {
        return new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
      };
      const newBill = setNewBill();

      const mockedBill = jest
        .spyOn(mockStore, "bills")
        .mockImplementationOnce(() => {
          return {
            create: jest.fn().mockRejectedValue(new Error("Erreur 404")),
          };
        });

      await expect(mockedBill().create).rejects.toThrow("Erreur 404");

      expect(mockedBill).toHaveBeenCalledTimes(1);

      expect(newBill.billId).toBeNull();
      expect(newBill.fileUrl).toBeNull();
      expect(newBill.fileName).toBeNull();
    });
  });
});
