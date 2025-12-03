import axios from "axios";
import { defineStore } from 'pinia';
import Swal from "sweetalert2";
import { useToast } from '@/stores/useToast';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const initialUser = JSON.parse(sessionStorage.getItem("user") || "null");

export const useAccountStore = defineStore('account', {
    state: () => ({
        user: initialUser, // Contendrá la información del usuario (id, username, groups)
        loadingPage: false,

        profile: {}, // Perfil del usuario que filtra la API de la función filterProfile
        gmail: null,
        listgmail: [],
    }),
    getters: {
        isAuthenticated: (state) => !!state.user?.token,
        // Comprobación de roles insensible a mayúsculas/minúsculas para mayor robustez.
        isInGroup: (state) => (groupName) => {
            const groups = state.user?.groups?.map(g => g.toLowerCase()) || [];
            return groups.includes(groupName.toLowerCase());
        },
        // Getter para saber si el usuario es administrador
        isAdmin: (state) => (state.user?.is_superuser || state.user?.groups?.map(g => g.toLowerCase()).includes('administrador')),
        // Getter para saber si el usuario es solicitante
        isSolicitante: (state) => (state.user?.groups?.map(g => g.toLowerCase()).includes('solicitante')),
        // Getter para verificar permisos específicos
        hasPermission: (state) => (permission) => {
            return state.user?.permissions?.includes(permission) || false;
        },
        username: (state) => state.user?.username || 'Usuario',
    },
    actions: {
        // Funciones para manejar la gestión de la cuenta
        async login(username, password) {
            try {
                this.loadingPage = true;
                const response = await axios.post(`${BASE_URL}auth/login`, { 'username': username, 'password': password });

                if (response.status === 200) {
                    const token = response.data.access;

                    // Extraemos los nombres de los grupos del objeto de usuario
                    const groupNames = response.data.user?.groups?.map(g => g.name) || [];
                    const permissions = response.data.permissions || []; // Leemos la lista de permisos del nivel superior

                    const userData = {
                        token,
                        id: response.data.user.id,
                        username: response.data.user.username,
                        groups: groupNames,
                        is_superuser: response.data.user.is_superuser,
                        departamento_id: response.data.user.persona?.dependencia?.id, // Guardamos el ID del departamento
                        permissions: permissions, // Guardamos los permisos
                    };
                    sessionStorage.setItem("user", JSON.stringify(userData));
                    this.user = userData;

                    return response;
                }
                return false;
            } catch (error) {
                this.loadingPage = false;
                const { showToast } = useToast();
                switch (error.response?.status) {
                    case 401:
                        showToast(error.response.data.detail || 'Credenciales inválidas', 'error');
                        break;
                    case 409:
                        showToast(error.response.data.message || 'La cuenta se encuentra inactiva', 'error');
                        break;
                    default:
                        showToast('Servicio no disponible. Inténtalo de nuevo.', 'error');
                        break;
                }
                return false
            } finally {
                this.loadingPage = false;
            }
        },
        async verifyToken() {
            try {
                const userSession = JSON.parse(sessionStorage.getItem("user") || "null");
                if (!userSession?.token) {
                    this.logout();
                    return false;
                }

                const response = await axios.get(`${BASE_URL}api/v1/auth/account/validate-token`, {
                    headers: { Authorization: `Bearer ${userSession.token}` },
                });
                
                if (response.data.statusCode === 200) {
                    this.user = userSession;
                    return true;
                }

                this.logout();
                return false;
            } catch (error) {
                if (error?.response?.data?.statusCode === 401) {
                    this.logout();
                    return false;
                }

                this.logout();
                return false;
            }
        },
        logout(router) {
            sessionStorage.clear();
            this.user = null;
            if (router) {
                router.push('/');
            } else {
                // Si no se pasa el router, recargamos para ir al login.
                window.location.href = '/';
            }
        },
        async filterProfile() {
            try {
                const user = JSON.parse(sessionStorage.getItem("user") || "{}");

                const headers = { Authorization: `Bearer ${user.token}` };
                const response = await axios.get(`${BASE_URL}api/v1/account/filter/profile`, { headers });

                if (response.data.statusCode === 200) {
                    this.profile = response.data.data;
                }

            } catch (error) {
                switch (error?.response?.data?.statusCode) {
                    case 401:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Tu sesión ha expirado",
                            confirmButtonText: "Volver a iniciar sesión",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Redirigir a la página de login
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                    default:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Servicio no disponible",
                            confirmButtonText: "Verificar servicio",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Redirigir a la página de login
                                window.location.reload(); // Recarga la página actual
                            }
                        });

                        break;
                }

                // this.isAuthenticated === false;
                // sessionStorage.clear();
            } 
        },
        async updateProfile(profile) {
            try {
                const user = JSON.parse(sessionStorage.getItem("user") || "{}");

                const headers = { Authorization: `Bearer ${user.token}` };
                const response = await axios.put(`${BASE_URL}api/v1/account/update/profile`,
                    {
                        'origen': profile.origen,
                        'ci': profile.ci,
                        'first_name': profile.first_name,
                        'last_name': profile.last_name,
                        'birthdate': profile.birthdate,
                        'phone': profile.phone,
                    },
                    {
                        headers
                    });

                if (response.data.statusCode === 200) {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        customClass: {
                            popup: 'custom-toast'
                        },
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer)
                            toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                    });
                    Toast.fire({
                        icon: 'success',
                        title: response?.data?.message
                    })
                    return true;
                }

                return false;
            } catch (error) {
                switch (error.response?.data?.statusCode) {
                    case 401:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Tu sesión ha expirado",
                            confirmButtonText: "Volver a iniciar sesión",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Redirigir a la página de login
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                    case 422:
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                            didOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer)
                                toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                        Toast.fire({
                            icon: 'error',
                            title: error?.response?.data?.message
                        })
                        break;

                    default:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Servicio no disponible",
                            confirmButtonText: "Verificar servicio",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                }

                return false;
            } finally {
                // Lógica de finalización si es necesaria
            }
        },
        async updateNameUser(username) {
            try {
                const user = JSON.parse(sessionStorage.getItem("user") || "{}");
                const headers = { Authorization: `Bearer ${user.token}` };
                const response = await axios.put(`${BASE_URL}api/v1/account/update/username`,
                    {
                        'username': username,
                    },
                    {
                        headers
                    });

                if (response.data.statusCode === 200) {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        customClass: {
                            popup: 'custom-toast'
                        },
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer)
                            toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                    });
                    Toast.fire({
                        icon: 'success',
                        title: response?.data?.message
                    })
                    return true;
                }

                return false;
            } catch (error) {
                switch (error.response?.data?.statusCode) {
                    case 401:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Tu sesión ha expirado",
                            confirmButtonText: "Volver a iniciar sesión",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Redirigir a la página de login
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                    case 422:
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                            didOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer)
                                toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                        Toast.fire({
                            icon: 'error',
                            title: error?.response?.data?.message
                        })
                        break;

                    default:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Servicio no disponible",
                            confirmButtonText: "Verificar servicio",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                }

                return false;
            } finally {
                // Lógica de finalización si es necesaria
            }
        },
        async newPassword(currentPassword, password) {
            try {
                const user = JSON.parse(sessionStorage.getItem("user") || "{}");
                const headers = { Authorization: `Bearer ${user.token}` };
                const response = await axios.put(`${BASE_URL}api/v1/account/update/password`,
                    {
                        'currentPassword': currentPassword,
                        'password': password,
                    },
                    {
                        headers
                    });

                if (response.data.statusCode === 200) {
                    // Lógica de éxito, por ejemplo, un toast
                    return true;
                }

                return false;
            } catch (error) {
                switch (error.response?.data?.statusCode) {
                    case 401:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Tu sesión ha expirado",
                            confirmButtonText: "Volver a iniciar sesión",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Redirigir a la página de login
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                    case 409:
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                            didOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer)
                                toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                        Toast.fire({
                            icon: 'error',
                            title: error?.response?.data?.message
                        })
                        break;

                    default:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Servicio no disponible",
                            confirmButtonText: "Verificar servicio",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                }

                // return false;
            } finally {
                // Lógica de finalización si es necesaria
            }
        },
        async newGmail(newGmail) {
            try {
                const user = JSON.parse(sessionStorage.getItem("user") || "{}");
                const headers = { Authorization: `Bearer ${user.token}` };

                // Realizar la solicitud PUT con axios
                const response = await axios.post(`${BASE_URL}api/v1/correo/create`,
                    {
                        'email': newGmail
                    },
                    {
                        headers
                    }
                );

                if (response.data.statusCode === 201) {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        customClass: {
                            popup: 'custom-toast'
                        },
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer)
                            toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                    });
                    Toast.fire({
                        icon: 'success',
                        title: response?.data?.message
                    })
                    return true;
                }

                return false;
            } catch (error) {
                switch (error.response?.data?.statusCode) {
                    case 401:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Tu sesión ha expirado",
                            confirmButtonText: "Volver a iniciar sesión",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Redirigir a la página de login
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                    case 409:
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                            didOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer)
                                toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                        Toast.fire({
                            icon: 'error',
                            title: error?.response?.data?.message
                        })
                        break;
                    default:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Servicio no disponible",
                            confirmButtonText: "Verificar servicio",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                }

                // return false;
            } finally {
                // Lógica de finalización si es necesaria
            }
        },
        async listGmail() {
            try {
                const user = JSON.parse(sessionStorage.getItem("user") || "{}");
                const headers = { Authorization: `Bearer ${user.token}` };
                const response = await axios.get(`${BASE_URL}api/v1/correo/read`, { headers });

                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return response.data.data;
            } catch (error) {
                // Re-lanzamos el error para que Vue Query lo capture
                throw error;
            }
        },
        async activeGmail(id) {
            try {
                const user = JSON.parse(sessionStorage.getItem("user") || "{}");
                const headers = { Authorization: `Bearer ${user.token}` };

                // Realizar la solicitud PUT con axios
                const response = await axios.put(`${BASE_URL}api/v1/account/active/correo`,
                    {
                        'id': id,
                    },
                    {
                        headers
                    });

                if (response.data.statusCode === 200) {
                    return true;
                }
                return false;
            } catch (error) {
                switch (error.response?.data?.statusCode) {
                    case 401:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Tu sesión ha expirado",
                            confirmButtonText: "Volver a iniciar sesión",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Redirigir a la página de login
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                    case 409:
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                            didOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer)
                                toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                        Toast.fire({
                            icon: 'error',
                            title: error?.response?.data?.message
                        })
                        break;

                    default:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Servicio no disponible",
                            confirmButtonText: "Verificar servicio",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                }

                // return false;
            } finally {
                // Lógica de finalización si es necesaria
            }
        },
        async deleteGmail(id) {
            try {
                const user = JSON.parse(sessionStorage.getItem("user") || "{}");
                const headers = { Authorization: `Bearer ${user.token}` };

                // Realizar la solicitud PUT con axios
                const response = await axios.put(`${BASE_URL}api/v1/correo/delete/${id}`,
                    {
                        'id': id,
                    },
                    {
                        headers
                    });

                if (response.data.statusCode === 200) {
                    return true;
                }
                return false;
            } catch (error) {
                switch (error.response?.data?.statusCode) {
                    case 401:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Tu sesión ha expirado",
                            confirmButtonText: "Volver a iniciar sesión",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Redirigir a la página de login
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                    case 409:
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                            didOpen: (toast) => {
                                toast.addEventListener('mouseenter', Swal.stopTimer)
                                toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                        Toast.fire({
                            icon: 'error',
                            title: error?.response?.data?.message
                        })
                        break;

                    default:
                        await Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: error?.response?.data?.message || "Servicio no disponible",
                            confirmButtonText: "Verificar servicio",
                            confirmButtonColor: "#1877f2",  // Aquí estableces el color del botón
                            allowOutsideClick: false,  // Bloquea clic fuera del modal
                            allowEscapeKey: false,      // Desactiva cerrar con ESC
                            showCloseButton: false,     // Oculta la "X" de cerrar
                            showCancelButton: false,    // Asegura que no haya botón alternativo
                            focusConfirm: true,        // Enfoca automáticamente el botón
                            customClass: {
                                popup: 'custom-toast-error'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload(); // Recarga la página actual
                            }
                        });
                        break;
                }

                // return false;
            } finally {
                // Lógica de finalización si es necesaria
            }
        }
    },
});

// Configura los interceptores de Axios para verificar el token automáticamente
axios.interceptors.request.use(
    (config) => {
        const userString = sessionStorage.getItem("user");
        if (userString) {
            const userData = JSON.parse(userString);
            if (userData && userData.token) {
                config.headers.Authorization = `Bearer ${userData.token}`;
            }
        }
        // Si la petición es FormData, no se debe tocar el Content-Type.
        if (config.data instanceof FormData) {
            if (config.headers) {
                delete config.headers['Content-Type'];
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Manejo de respuestas con error 401 (token expirado o no válido)
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Si la respuesta tiene un error 401, deslogueamos al usuario
        if (error.response && error.response.status === 401) {
            sessionStorage.clear();

        }
        return Promise.reject(error);
    }
);
