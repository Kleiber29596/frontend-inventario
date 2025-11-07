import Swal from 'sweetalert2';

export function useToast() {
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'custom-toast' // Puedes usar esta clase para estilos personalizados
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  const showToast = (title, icon = 'success') => {
    Toast.fire({ icon, title });
  };

  return { showToast };
}
