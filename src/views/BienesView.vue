
<template>
  <main class="page-wrapper">
    <HeaderPage :icon="['fas', 'box']" text="Bienes" />

    <div class="page-body mt-3 mb-3">
      <div class="container-xl">
        <div class="card">
          <div class="toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3" role="alert" aria-live="assertive" aria-atomic="true" ref="toastSuccess">
            <div class="d-flex">
              <div class="toast-body">{{ toastMessage }}</div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
          </div>

          <div class="card-header">
            <div class="row w-full">
              <div class="col">
                <p class="text-secondary m-0">Listado de Bienes</p>
              </div>
              <div class="col-md-auto col-sm-12">
                <div class="ms-auto d-flex flex-wrap btn-list">
                  <SearchInput v-model="search" />
                  <a href="#" class="btn btn-0" title="Agregar bien" @click.prevent="openForm(false)">Agregar</a>
                </div>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-vcenter card-table table-striped">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Estado Físico</th>
                  <th>Fecha</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="8" class="text-center">Cargando...</td>
                </tr>
                <tr v-for="bien in bienes" :key="bien.id">
                  <td>{{ bien.serial_bien }}</td>
                  <td>{{ bien.tipo_bien }}</td>
                  <td>{{ bien.categoria }}</td>
                  <td>{{ bien.marca }}</td>
                  <td>{{ bien.modelo }}</td>
                  <td>{{ bien.estado_fisico }}</td>
                  <td>{{ bien.fecha_adquisicion }}</td>
                  <td><span class="badge bg-success">{{bien.estatus}}</span></td>
                  <td>
                    <a class="btn btn-action" @click.prevent="openForm(true, bien)" title="Editar">
                      <IconEdit size="20" stroke-width="1.5" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <Pagination v-model:page="page" :pageSize="paginacion.paginas" :total="paginacion.total" />

          </div>
        </div>

        <BienesForm
          :showForm="showForm"
          :isEdit="isEdit"
          :bienData="bienData"
          @close="closeForm"
          @submit="handleSubmit"
        />
      </div>
    </div>

    <FooterPage />
  </main>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useBienesStore } from '@/stores/bienesStore';
import FooterPage from '@/components/page/footer/Component.vue';
import HeaderPage from '@/components/page/header/Component.vue';
import { IconEdit } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue';
import SearchInput from '@/components/paginacion/searchInput.vue';
import BienesForm from '@/components/forms/BienesForm.vue';
import { Toast } from 'bootstrap';

const bienesStore = useBienesStore();
const { bienes, paginacion, loading } = storeToRefs(bienesStore);

const showForm = ref(false);
const isEdit = ref(false);
const bienData = ref(null);
const toastSuccess = ref(null);
const toastMessage = ref('');

const page = ref(1);
const search = ref('');

const fetchBienes = () => {
  bienesStore.fetchBienes(page.value, search.value);

};

onMounted(() => {
  fetchBienes();
});

watch([page, search], fetchBienes, { deep: true });

const openForm = (edit = false, data = null) => {
  isEdit.value = edit;
  bienData.value = data;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  isEdit.value = false;
  bienData.value = null;
};

const handleSubmit = () => {
  toastMessage.value = isEdit.value ? '✅ Bien actualizado correctamente' : '✅ Bien creado correctamente';
  const toast = new Toast(toastSuccess.value);
  toast.show();
  fetchBienes();
};
</script>
