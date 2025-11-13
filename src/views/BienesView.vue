<template>
  <main class="page-wrapper">
    <HeaderPage :icon="['fas', 'box']" text="Bienes" />

    <div class="page-body mt-3 mb-3">
      <div class="container-xl">
        <div class="card">
          <div class="toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3"
            role="alert" aria-live="assertive" aria-atomic="true" ref="toastSuccess">
            <div class="d-flex">
              <div class="toast-body">{{ toastMessage }}</div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
                aria-label="Close"></button>
            </div>
          </div>

          <div class="card-header d-flex justify-content-between">
            <p class="text-secondary m-0">Listado de Bienes</p>
            <div class="d-flex gap-2">
              <SearchInput v-model="searchTerm" />
              <a href="#" class="btn btn-primary ms-2" title="Agregar bien" @click.prevent="openForm()">Agregar</a>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-vcenter card-table table-striped">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Estado Físico</th>
                  <th>Fecha</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="store.loading">
                  <td colspan="9" class="text-center">Cargando...</td>
                </tr>
                <tr v-for="bien in store.bienes" :key="bien.id">
                  <td>{{ bien.serial_bien }}</td>
                  <td>{{ bien.tipo_bien.descripcion }}</td>
                  <td>{{ bien.marca.descripcion }}</td>
                  <td>{{ bien.modelo.descripcion }}</td>
                  <td>{{ bien.estado_fisico.nombre }}</td>
                  <td>{{ bien.fecha_adquisicion }}</td>
                  <td> <span class="badge" :class="getEstatusClass(bien.estatus?.descripcion)">
                      {{ bien.estatus?.descripcion || 'N/A' }}
                    </span>
                  </td>
                  <td>
                    <a class="btn btn-action" @click.prevent="openForm(true, bien)" title="Editar">
                      <IconEdit size="20" stroke-width="1.5" />
                    </a>
                  </td>
                </tr>
                <tr v-if="!store.loading && store.bienes.length === 0">
                  <td colspan="9" class="text-center">No se encontraron bienes.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="card-footer">
            <Pagination v-model:page="currentPage" v-model:pageSize="pageSize" :total="store.totalItems" />
          </div>
        </div>

        <BienesForm :showForm="showForm" :isEdit="isEdit" :bienData="bienData" @close="closeForm"
          @submit="handleSubmit" />
      </div>
    </div>

    <FooterPage />
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useBienesStore } from '@/stores/bienesStore';
import FooterPage from '@/components/page/footer/Component.vue';
import HeaderPage from '@/components/page/header/Component.vue';
import { IconEdit } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue';
import SearchInput from '@/components/paginacion/searchInput.vue';
import BienesForm from '@/components/forms/BienesForm.vue';
import { Toast } from 'bootstrap';
import { storeToRefs } from 'pinia';


const store = useBienesStore();

const showForm = ref(false);
const isEdit = ref(false);
const bienData = ref(null);
const toastSuccess = ref(null);
const toastMessage = ref('');

// --- New Local State for Pagination/Search ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// Centralized function to fetch data
const fetchData = () => {
  store.fetchBienes(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
  fetchData();
  store.catalogos_bienes()
});

// --- Watchers for Pagination and Search ---
watch([currentPage, pageSize, searchTerm], () => {
  fetchData();
});

const openForm = async (edit = false, data = null) => {
  isEdit.value = edit;
  if (edit && data) {
    // Modo Edición: Carga todo lo necesario antes de mostrar el formulario
    try {
      // Llama a la acción maestra que carga catálogos y el bien específico
      const bienParaEditar = await store.setupEditBien(data.id);
      bienData.value = bienParaEditar; // Pasa los datos completos y "frescos" al formulario
      showForm.value = true;
    } catch (error) {
      console.error("Error al preparar la edición del bien:", error);
    }
  } else {
    // Modo Creación: Simplemente abre el formulario vacío
    bienData.value = null;
    showForm.value = true;
  }
};

const closeForm = () => {
  showForm.value = false;
  isEdit.value = false;
  bienData.value = null;
  fetchData(); // Refetch data on close
};

const handleSubmit = () => {
  toastMessage.value = isEdit.value ? '✅ Bien actualizado correctamente' : '✅ Bien creado correctamente';
  const toast = new Toast(toastSuccess.value);
  toast.show();
  fetchData(); // Refetch data on submit
};

const getEstatusClass = (estatus) => {
  switch (estatus) {
    case 'Disponible':
      return 'bg-success';
    case 'Asignado':
      return 'bg-primary';
    case 'Desincorporado':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};
</script>
