import Swal from "sweetalert2";

type SuccessAlertOptions = {
  title: string;
  text?: string;
};

export function showSuccessAlert({
  title,
  text,
}: SuccessAlertOptions) {

    let timerInterval = 0;

  return Swal.fire({
    icon: "success",
    title,
    text,
    target: document.body,
    position: "center",  
    timer: 4000,
    timerProgressBar: true,  
    background: "#FFFFFF",
    color: "#1F2937", 
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: false,

     customClass: {
      container: "sellsys-swal-container",
      popup: "sellsys-swal-popup", 
      htmlContainer: "sellsys-swal-text",
      confirmButton: "sellsys-swal-confirm-button",
    },

    didOpen: () => {
        Swal.showLoading();  
    },
    willClose: () => {
        clearInterval(timerInterval);
    }
  });
}

type DeleteConfirmationOptions = {
  productName: string;
};

export async function showDeleteProductConfirmation({
  productName,
}: DeleteConfirmationOptions): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar producto?",
    text: `"${productName}" será eliminado permanentemente.`,
    position: "center",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    width: 440,
    padding: "2rem",
    background: "#FFFFFF",
    color: "#1F2937",
    backdrop: "rgba(15, 23, 42, 0.62)",
    allowOutsideClick: false,
    allowEscapeKey: false,
    buttonsStyling: false,

    customClass: {
      container: "sellsys-swal-container",
      popup: "sellsys-swal-popup",
      title: "sellsys-swal-title",
      htmlContainer: "sellsys-swal-text",
      confirmButton:
        "sellsys-swal-delete-button",
      cancelButton:
        "sellsys-swal-cancel-button",
    },
  });

  return result.isConfirmed;
}


type ErrorAlertOptions = {
  title: string;
  text?: string;
};

export function showErrorAlert({
  title,
  text,
}: ErrorAlertOptions) {
  return Swal.fire({
    icon: "error",
    title,
    text,
    position: "center",
    confirmButtonText: "Aceptar",
    width: 440,
    padding: "2rem",
    background: "#FFFFFF",
    color: "#1F2937",
    backdrop: "rgba(15, 23, 42, 0.62)",
    allowOutsideClick: false,
    allowEscapeKey: false,
    buttonsStyling: false,

    customClass: {
      container: "sellsys-swal-container",
      popup: "sellsys-swal-popup",
      title: "sellsys-swal-title",
      htmlContainer: "sellsys-swal-text",
      confirmButton:
        "sellsys-swal-confirm-button",
    },
  });
}