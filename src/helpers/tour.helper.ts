import { driver } from "driver.js";
import "driver.js/dist/driver.css";

type DriverStep = {
  element: string;
  popover?: {
    title?: string;
    description?: string;
    position?: "top" | "left" | "right" | "bottom";
  };
};

export const startTour = () => {
  const steps: DriverStep[] = [
    {
      element: "#step-pictures",
      popover: {
        title: "Carga de archivos",
        description:
          "Selecciona tus imágenes, el archivo Excel con tu listado de predios aquí.",
        position: "bottom",
      },
    },
    {
      element: "#step-archivos",
      popover: {
        title: "Carga de archivos",
        description: "Selecciona tus imágenes y el archivo Excel aquí.",
        position: "bottom",
      },
    },
    {
      element: "#step-origen",
      popover: {
        title: "Carga de Imagenes  y PDFs",
        description:
          "Selecciona la carpeta con tus imágenes o PDFs aquí. <br/> <strong>Nota:</strong> Debes seleccionar una carpeta completa.",
        position: "bottom",
      },
    },
    {
      element: "#step-excel",
      popover: {
        title: "Carga de lista de predios",
        description:
          "Selecciona el archivo Excel que contiene la lista de predios aquí.",
        position: "bottom",
      },
    },
    {
      element: "#step-columnas",
      popover: {
        title: "Seleccionar columna",
        description:
          "Elige la columna del Excel que contiene el numero predial.",
        position: "bottom",
      },
    },
    {
      element: "#step-imagen",
      popover: {
        title: "Vista previa",
        description: "Aquí puedes rotar o navegar entre imágenes.",
        position: "bottom",
      },
    },
    {
      element: "#step-predio",
      popover: {
        title: "Organizar imágenes",
        description:
          "Selecciona el predio y asigna la categoría y la unidad para guardar el archivo a organizar.",
        position: "left",
      },
    },
    {
      element: "#step-lista-predios",
      popover: {
        title: "Lista de predios",
        description:
          "Selecciona el predio que deseas asignar a la categoría y unidad.",
        position: "bottom",
      },
    },
    {
      element: "#step-categoria",
      popover: {
        title: "Categoría",
        description: "Selecciona la categoría que deseas asignar al arvicho.",
        position: "bottom",
      },
    },
    {
      element: "#step-unidad",
      popover: {
        title: "Unidad",
        description: "Selecciona la unidad que deseas asignar al archivo.",
        position: "bottom",
      },
    },
    {
      element: "#step-organizar",
      popover: {
        title: "Organizar",
        description:
          "Una vez seleccionado el predio, la categoría y la unidad, haz click en organizar para guardar el archivo.",
        position: "bottom",
      },
    },
    {
      element: "#step-preview",
      popover: {
        title: "Vista de carpetas",
        description: "Aquí puedes ver el listado de archivos organizados.",
        position: "top",
      },
    },
    {
      element: "#step-download",
      popover: {
        title: "Descargar ZIP",
        description: "Descarga el ZIP con todos los archivos organizados.",
        position: "top",
      },
    },
    {
      element: "#step-lista-archivos",
      popover: {
        title: "Lista de archivos",
        description: "Aquí puedes ver el listado de archivos organizados.",
        position: "top",
      },
    },
    {
      element: "#finish",
      popover: {
        title: '<img style="width: 270px; height: 206.65px; margin-bottom: 10px; border-radius: 5px;" src="https://i.imgur.com/3WpTnyA.gif">',
        description: "¡Listo! Ahora puedes guardar tus archivos organizados.",
        position: "top",
      },
    },
  ];

  const driverObj = driver({
    animate: true,
    allowClose: true,
    showProgress: true,
    nextBtnText: "Siguiente",
    prevBtnText: "Anterior",
    doneBtnText: "Finalizar",
    steps,
  });

  driverObj.drive();
};
