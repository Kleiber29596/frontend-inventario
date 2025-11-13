import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CustomersView from '../views/CustomersView.vue'
import ProfileView from '../views/ProfileView.vue'
import { useAccountStore } from '../stores/account';
import { useToast } from '@/stores/useToast';
import RoleView from '@/views/RoleView.vue'
import BienesView from '@/views/BienesView.vue'
import PrestamosView from '@/views/PrestamosView.vue' // No usado, se puede eliminar
import AsignacionView from '@/views/AsignacionView.vue'
import DesincorporacionView from '@/views/DesincorporacionView.vue'
import AsignacionFormView from '@/views/AsignacionFormView.vue'
import SolicitudesView from '@/views/SolicitudesView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // { path: '/:pathMatch(.*)*', redirect: '/no-encontrada' },
    // { path: "/no-encontrada", component: NoEncontrada, beforeEnter: (to, from, next) => { if (token) { next() } else { next('/'); } }, },
    {
      path: '/', // La ruta de login ahora apunta al nuevo componente
      name: 'login', // El nombre de la ruta de login
      component: () => import('../views/account/Login.vue'),
      meta: {
        requiredAuth: false
      }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomersView,
      meta: { // Ruta de ejemplo, protegida para admin
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/categorias',
      name: 'categorias',
      component: CustomersView,
      meta: { // Ruta de ejemplo, protegida para admin
        requiresAdmin: true,
        requiredAuth: true,
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/cajas',
      name: 'cajas',
      component: CustomersView,
      meta: { // Ruta de ejemplo, protegida para admin
        requiresAdmin: true,
        requiredAuth: true,
      }
    },
    {
      path: '/correos',
      name: 'correos',
      component: CustomersView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/archivos',
      name: 'archivos',
      component: CustomersView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/mensajes',
      name: 'mensajes',
      component: CustomersView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/facebook',
      name: 'facebook',
      component: CustomersView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/a',
      name: 'a',
      component: CustomersView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/b',
      name: 'b',
      component: CustomersView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/c',
      name: 'c',
      component: CustomersView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/d',
      name: 'd',
      component: CustomersView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/role',
      name: 'role',
      component: RoleView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/f',
      name: 'f',
      component: CustomersView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/bienes', // Corregido a minúsculas para consistencia
      name: 'bienes',
      component: BienesView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },


    {
      path: '/solicitudes',
      name: 'solicitudes',
      component: SolicitudesView,
      meta: { requiredAuth: true } // Accesible para ambos roles
     
    },
    
    {
      path: '/prestamos', // Corregido a minúsculas
      name: 'prestamos',
      component: PrestamosView,
      meta: { requiresAdmin: true, requiredAuth: true }
    },
    {
      path: '/asignaciones',
      name: 'asignaciones',
      component: AsignacionView,
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/asignaciones/crear',
      name: 'asignacion-crear',
      component: AsignacionFormView,
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/desincorporaciones',
      name: 'desincorporaciones',
      component: DesincorporacionView,
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/desincorporaciones/crear',
      name: 'desincorporacion-crear',
      component: () => import('@/views/DesincorporacionPageForm.vue'),
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    // Rutas de Configuración
    {
      path: '/configuracion/categorias',
      name: 'configuracion-categorias',
      component: () => import('@/views/CategoriaView.vue'),
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/modelos',
      name: 'configuracion-modelos',
      component: () => import('@/views/ModeloView.vue'),
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/motivos',
      name: 'configuracion-motivos',
      component: () => import('@/views/MotivoView.vue'),
      meta: { // Accesible para ambos roles
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/dependencias',
      name: 'configuracion-dependencias',
      component: () => import('@/views/DependenciaView.vue'),
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/colores',
      name: 'configuracion-colores',
      component: () => import('@/views/ColorView.vue'),
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/tipos-bien',
      name: 'configuracion-tipos-bien',
      component: () => import('@/views/TipoBienView.vue'),
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/estados-fisicos',
      name: 'configuracion-estados-fisicos',
      component: () => import('@/views/EstadoFisicoView.vue'),
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/estatus',
      name: 'configuracion-estatus',
      component: () => import('@/views/EstatusView.vue'),
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/personas',
      name: 'configuracion-personas',
      component: () => import('@/views/PersonaView.vue'),
      meta: {
        requiresAdmin: true,
        requiredAuth: true
      }
    },


  ]
})

// Ruta guard
router.beforeEach(async (to, from, next) => {
  const accountStore = useAccountStore(); // Usamos el store de cuenta
  const { showToast } = useToast();
  const authRequired = to.meta.requiredAuth;

  if (accountStore.isAuthenticated && to.name === 'login') {
    return next('/home'); // Evita que los usuarios autenticados accedan al login
  }

  if (authRequired && !accountStore.isAuthenticated) {
    // Intenta verificar el token si no está en el estado pero podría estar en sessionStorage
    const isValid = await accountStore.verifyToken();
    if (!isValid) {
      return next('/'); // Si el token no es válido, redirige al login
    }
  }

  // Después de verificar la autenticación, verificamos los permisos de administrador
  if (to.meta.requiresAdmin && !accountStore.isAdmin) {
    // Si la ruta requiere ser admin y el usuario no lo es, redirige
    // a una página segura, como la de solicitudes.
    showToast('No tiene permisos suficientes', 'warning');
    return next('/solicitudes');
  }

  next(); // Si no hay problemas, permite el acceso a la ruta
});

export default router;