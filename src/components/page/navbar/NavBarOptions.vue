<script setup>
import Items from './NavBarOptionsItems.vue';
import ItemsSub from './NavBarOptionsItemsSub.vue';
</script>

<template>
  <div class="collapse navbar-collapse dropdown" id="sidebar-menu">
    <ul class="navbar-nav pt-lg-2 pb-lg-2 d-flex gap-1">

      <!-- Inicio -->
      <Items :icon="['fas', 'home']" name="Inicio" routs="/home" />

      <!-- Bienes -->
      <Items :icon="['fas', 'layer-group']" name="Bienes" routs="/bienes" />

      <!-- Solicitudes -->
      <Items :icon="['fas', 'file-alt']" name="Solicitudes" routs="/solicitudes" />

      <!-- Movimientos -->
      <li>
        <ItemsSub name="Movimientos" :icon="['fas', 'exchange-alt']" active="#active3" />
        <div
          id="active3"
          class="collapse rounded-2 bg-gray-700"
          data-bs-parent="#sidebar-menu"
        >
          <ul class="navbar-nav d-flex gap-1">
            <Items class="mt-1" :icon="['fas', 'handshake']" name="Asignaciones" routs="/asignaciones" />
            <Items :icon="['fas', 'trash']" name="Desincorporaciones" routs="/desincorporaciones" />
            <Items :icon="['fas', 'people-arrows']" name="Reasignaciones" routs="/reasignaciones" />
          </ul>
        </div>
      </li>

      <!-- Usuarios -->
      <Items :icon="['fas', 'users']" name="Usuarios" routs="/usuarios" />

      <!-- Configuraciones -->
      <li>
        <ItemsSub name="Configuraciones" :icon="['fas', 'gear']" active="#configuracionSubMenu" />
        <div
          id="configuracionSubMenu"
          class="collapse rounded-2 bg-gray-700"
          data-bs-parent="#sidebar-menu"
        >
          <ul class="navbar-nav d-flex gap-1">
            <Items class="mt-1" :icon="['fas', 'tags']" name="Categorías" routs="/configuracion/categorias" />
            <Items :icon="['fas', 'cube']" name="Modelos" routs="/configuracion/modelos" />
            <Items :icon="['fas', 'lightbulb']" name="Motivos" routs="/configuracion/motivos" />
            <Items :icon="['fas', 'building']" name="Dependencias" routs="/configuracion/dependencias" />
            <Items :icon="['fas', 'palette']" name="Colores" routs="/configuracion/colores" />
            <Items :icon="['fas', 'boxes']" name="Tipos de Bien" routs="/configuracion/tipos-bien" />
            <Items :icon="['fas', 'heartbeat']" name="Estados Físicos" routs="/configuracion/estados-fisicos" />
            <Items :icon="['fas', 'info-circle']" name="Estatus" routs="/configuracion/estatus" />
            <Items :icon="['fas', 'users']" name="Personas" routs="/configuracion/personas" />
          </ul>
        </div>
      </li>

    </ul>
  </div>
</template>
