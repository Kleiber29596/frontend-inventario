import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/account/Login.vue'
import HomeView from '../views/HomeView.vue'
import CustomersView from '../views/CustomersView.vue'
import ProfileView from '../views/ProfileView.vue'
import { useAccountStore } from '../stores/account'; // Asegúrate de importar el store correctamente
import RoleView from '@/views/RoleView.vue'
import BienesView from '@/views/BienesView.vue'
import PrestamosView from '@/views/PrestamosView.vue'
import AsignacionView from '@/views/AsignacionView.vue'
import DesincorporacionView from '@/views/DesincorporacionView.vue'
import SolicitudesView from '@/views/SolicitudesView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // { path: '/:pathMatch(.*)*', redirect: '/no-encontrada' },
    // { path: "/no-encontrada", component: NoEncontrada, beforeEnter: (to, from, next) => { if (token) { next() } else { next('/'); } }, },
    {
      path: '/',
      name: 'login',
      component: Login,
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
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/categorias',
      name: 'categorias',
      component: CustomersView,
      meta: {
        requiredAuth: true
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
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/correos',
      name: 'correos',
      component: CustomersView
    },
    {
      path: '/archivos',
      name: 'archivos',
      component: CustomersView
    },
    {
      path: '/mensajes',
      name: 'mensajes',
      component: CustomersView
    },
    {
      path: '/facebook',
      name: 'facebook',
      component: CustomersView
    },
    {
      path: '/correos',
      name: 'correos',
      component: CustomersView
    },
    {
      path: '/a',
      name: 'a',
      component: CustomersView
    },
    {
      path: '/b',
      name: 'b',
      component: CustomersView
    },
    {
      path: '/c',
      name: 'c',
      component: CustomersView
    },
    {
      path: '/d',
      name: 'd',
      component: CustomersView
    },
    {
      path: '/role',
      name: 'role',
      component: RoleView
    },
    {
      path: '/f',
      name: 'f',
      component: CustomersView
    },
    {
      path: '/Bienes',
      name: 'Bienes',
      component: BienesView
    },


    {
      path: '/solicitudes',
      name: 'solicitudes',
      component: SolicitudesView
     
    },
    
    {
      path: '/Prestamos',
      name: 'Prestámos',
      component: PrestamosView
    },
    {
      path: '/asignaciones',
      name: 'asignaciones',
      component: AsignacionView,
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/desincorporaciones',
      name: 'desincorporaciones',
      component: DesincorporacionView,
      meta: {
        requiredAuth: true
      }
    },
    // Rutas de Configuración
    {
      path: '/configuracion/categorias',
      name: 'configuracion-categorias',
      component: () => import('@/views/CategoriaView.vue'),
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/modelos',
      name: 'configuracion-modelos',
      component: () => import('@/views/ModeloView.vue'),
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/motivos',
      name: 'configuracion-motivos',
      component: () => import('@/views/MotivoView.vue'),
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/dependencias',
      name: 'configuracion-dependencias',
      component: () => import('@/views/DependenciaView.vue'),
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/colores',
      name: 'configuracion-colores',
      component: () => import('@/views/ColorView.vue'),
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/tipos-bien',
      name: 'configuracion-tipos-bien',
      component: () => import('@/views/TipoBienView.vue'),
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/estados-fisicos',
      name: 'configuracion-estados-fisicos',
      component: () => import('@/views/EstadoFisicoView.vue'),
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/estatus',
      name: 'configuracion-estatus',
      component: () => import('@/views/EstatusView.vue'),
      meta: {
        requiredAuth: true
      }
    },
    {
      path: '/configuracion/personas',
      name: 'configuracion-personas',
      component: () => import('@/views/PersonaView.vue'),
      meta: {
        requiredAuth: true
      }
    },


  ]
})

// Ruta guard
router.beforeEach(async (to, from, next) => {
  const accountStore = useAccountStore(); // Usamos el store de cuenta

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  // if (user.token && accountStore.isAuthenticated) {
  //   // Verifica el token si el usuario no está autenticado
  //   const isValid = await accountStore.verifyToken();

  //   if (!isValid) {
  //     return next('/'); // Redirige al login si el token no es válido
  //   }
  // }

  if (accountStore.isAuthenticated && to.name === 'login') {
    return next('/home'); // Evita que los usuarios autenticados accedan al login
  }

  if (to.meta.requiredAuth && !accountStore.isAuthenticated) {
    return next('/'); // Redirige al login si no está autenticado
  }

  next(); // Si no hay problemas, permite el acceso a la ruta
});

export default router;