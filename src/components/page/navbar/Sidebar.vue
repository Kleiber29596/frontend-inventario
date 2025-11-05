<template>
  <aside class="navbar navbar-vertical navbar-expand-lg" data-bs-theme="dark">
    <div class="container-fluid">
      <!-- Toggler para móvil -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#sidebar-menu"
        aria-controls="sidebar-menu"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Logo -->
      <div class="navbar-brand navbar-brand-autodark">
        <a href="#">
          <svg xmlns="http://www.w3.org/2000/svg" width="110" height="32" viewBox="0 0 232 68" class="navbar-brand-image">
            <!-- Logo simplificado -->
            <path
              d="M64.6 16.2C63 9.9 58.1 5 51.8 3.4 40 1.5 28 1.5 16.2 3.4 9.9 5 5 9.9 3.4 16.2 1.5 28 1.5 40 3.4 51.8 5 58.1 9.9 63 16.2 64.6c11.8 1.9 23.8 1.9 35.6 0C58.1 63 63 58.1 64.6 51.8c1.9-11.8 1.9-23.8 0-35.6z"
              fill="#066fd1"
            />
          </svg>
        </a>
      </div>

      <!-- Menú de navegación -->
      <div class="collapse navbar-collapse" id="sidebar-menu">
        <ul class="navbar-nav pt-lg-3">
          <!-- Elementos del menú -->
          <li class="nav-item" v-for="item in menuItems" :key="item.id" :class="{ active: item.active }">
            <a class="nav-link" :href="item.url">
              <span class="nav-link-icon d-md-none d-lg-inline-block">
                <component :is="item.icon" />
              </span>
              <span class="nav-link-title">{{ item.title }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script>
import { defineComponent } from 'vue'

// Componentes de iconos
const HomeIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
      <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
    </svg>
  `
}

const PackageIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
      <path d="M12 12l8 -4.5" />
      <path d="M12 12l0 9" />
      <path d="M12 12l-8 -4.5" />
    </svg>
  `
}

const FormIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 11l3 3l8 -8" />
      <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" />
    </svg>
  `
}

export default defineComponent({
  name: 'AppSidebar',
  components: {
    HomeIcon,
    PackageIcon,
    FormIcon
  },
  data() {
    return {
      menuItems: [
        {
          id: 1,
          title: 'Inicio',
          url: './',
          icon: 'HomeIcon',
          active: true
        },
        {
          id: 2,
          title: 'Interfaz',
          url: '#navbar-base',
          icon: 'PackageIcon',
          active: false
        },
        {
          id: 3,
          title: 'Formularios',
          url: './form-elements.html',
          icon: 'FormIcon',
          active: false
        }
      ]
    }
  },
  methods: {
    setActiveItem(itemId) {
      this.menuItems.forEach(item => {
        item.active = item.id === itemId
      })
    }
  }
})
</script>

<style scoped>
.navbar-vertical {
  background-color: var(--tblr-bg-surface-dark);
}

.nav-link {
  color: var(--tblr-body-color-light);
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--tblr-primary);
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-link.active {
  color: var(--tblr-primary);
  background-color: rgba(255, 255, 255, 0.1);
}

.navbar-brand-image {
  fill: currentColor;
}
</style>