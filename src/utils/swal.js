import Swal from 'sweetalert2';

const BTIX_SWAL = Swal.mixin({
    customClass: {
        popup: 'btix-swal-popup',
        title: 'btix-swal-title',
        htmlContainer: 'btix-swal-html',
        confirmButton: 'btix-swal-confirm',
        cancelButton: 'btix-swal-cancel',
        icon: 'btix-swal-icon',
    },
    buttonsStyling: false,
    heightAuto: false,
});

export const showSuccess = (title, text) => {
    return BTIX_SWAL.fire({
        icon: 'success',
        title,
        text,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
    });
};

export const showError = (title, text) => {
    return BTIX_SWAL.fire({
        icon: 'error',
        title,
        text,
        confirmButtonText: 'MENGERTI',
    });
};

export const showConfirm = (title, text, confirmText = 'YA, LANJUTKAN', cancelText = 'BATALKAN') => {
    return BTIX_SWAL.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true,
    });
};

export const showInfo = (title, text) => {
    return BTIX_SWAL.fire({
        icon: 'info',
        title,
        text,
        confirmButtonText: 'OKE',
    });
};

export const showToast = (title, icon = 'success') => {
    return BTIX_SWAL.fire({
        title,
        icon,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
};

export default BTIX_SWAL;
