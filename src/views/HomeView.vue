<template>
  <main class="page-wrapper">
    <!-- Page header -->
    <HeaderPage :icon="['fas', 'chart-simple']" text="Dashboard de Operaciones" />

    <!-- Page body -->
    <div class="page-body mt-3 mb-3">
      <div class="container-xl">
        <!-- Fila de Filtros de Fecha -->
        <div class="row g-2 align-items-end mb-4">
          <div class="col-md-3">
            <label class="form-label">Fecha de Inicio</label>
            <flat-pickr v-model="fechas.inicio" :config="flatpickrConfig" class="form-control" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Fecha de Fin</label>
            <flat-pickr v-model="fechas.fin" :config="flatpickrConfig" class="form-control" />
          </div>
          <div class="col-auto">
            <button class="btn btn-primary" @click="aplicarFiltro" :disabled="store.loading">
              <span v-if="store.loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Aplicar Filtro
            </button>
          </div>
        </div>

        <!-- Fila de Indicadores (Refactorizada) -->
        <div class="row row-deck row-cards mb-4">
          <div class="col-12">
            <div class="row row-cards">

              <!-- Asignaciones -->
              <div class="col-sm-6 col-lg-3">
                <div class="card card-sm">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-auto">
                        <span class="bg-primary text-white avatar">
                          <div v-html="svg.client"></div>
                        </span>
                      </div>
                      <div class="col">
                        <div class="font-weight-medium">
                          Asignaciones
                        </div>
                        <div class="text-muted">
                          {{ store.stats.resumenOperaciones.asignaciones || 0 }} operaciones
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desincorporaciones -->
              <div class="col-sm-6 col-lg-3">
                <div class="card card-sm">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-auto">
                        <span class="bg-danger text-white avatar">
                          <div v-html="svg.customers"></div>
                        </span>
                      </div>
                      <div class="col">
                        <div class="font-weight-medium">
                          Desincorporaciones
                        </div>
                        <div class="text-muted">
                          {{ store.stats.resumenOperaciones.desincorporaciones || 0 }} operaciones
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Devoluciones -->
              <div class="col-sm-6 col-lg-3">
                <div class="card card-sm">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-auto">
                        <span class="bg-warning text-white avatar">
                          <div v-html="svg.appliances"></div>
                        </span>
                      </div>
                      <div class="col">
                        <div class="font-weight-medium">
                          Devoluciones
                        </div>
                        <div class="text-muted">
                          {{ store.stats.resumenOperaciones.devoluciones || 0 }} operaciones
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Componente de estadísticas (gráficas) -->
        <DashboardStats />
      </div>
    </div>

    <FooterPage />
  </main>
</template>

<script setup>
import { reactive, onMounted, watch } from "vue";
// Ya no necesitamos startOfMonth y endOfMonth, pero date-fns sigue siendo usado en el store.
import HeaderPage from '@/components/page/header/Component.vue';
import FooterPage from '@/components/page/footer/Component.vue';
import DashboardStats from '@/components/modals/DashboardStats.vue';
import svg from '@/assets/svg/icons-svg.json';
import { useDashboardStore } from '@/components/modals/dashboardStore';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

const store = useDashboardStore();

const fechas = reactive({
  // Por defecto, el rango de fechas será el día actual.
  inicio: new Date(),
  fin: new Date(),
});

const flatpickrConfig = {
  dateFormat: "Y-m-d",
  locale: Spanish,
};

const aplicarFiltro = () => {
  if (fechas.inicio && fechas.fin) {
    store.fetchDashboardStats(fechas.inicio, fechas.fin);
  }
};

// Observamos cambios en las fechas para volver a cargar los datos automáticamente.
watch(fechas, () => {
  aplicarFiltro();
});

onMounted(() => {
  aplicarFiltro();
});
</script>
