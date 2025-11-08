<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'user-tag']" text="Asignaciones" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Asignaciones</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                            <button class="btn btn-primary ms-2" @click="openModal()">Nueva Asignacion</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Persona</th>
                                        <th>Departamento</th>
                                        <th>Fecha de Inicio</th>
                                        <th>Estatus</th>
                                      
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="6" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="asignacion in store.asignaciones" :key="asignacion.id">
                                        <td>{{ asignacion.id }}</td>
                                        <td>{{ asignacion.persona.primer_nombre }}</td>
                                        <td>{{ asignacion.departamento.nombre }}</td>
                                        <td>{{ asignacion.fecha_inicio }}</td>
                                        <td><span class="badge bg-success">{{ asignacion.estatus.descripcion }}</span></td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(asignacion)">
                                            <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                        <td>
                                            <a class="btn btn-action" @click="openDevolucionModal(asignacion)">
                                            <IconArrowBack size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.asignaciones.length === 0">
                                        <td colspan="6" class="text-center">No se encontraron asignaciones.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer">
                        <Pagination v-model:page="currentPage" v-model:pageSize="pageSize" :total="store.totalItems" />
                    </div>
                </div>
            </div>
        </div>

        <AsignacionForm :asignacion="selectedAsignacion" :showModal="showAsignacionModal" @close="closeCreateModal" />
        <UpdateAsignacionForm :asignacion="selectedAsignacion" :showModal="showUpdateAsignacionModal" @close="closeUpdateModal" />
        <DevolucionAsignacionModal :asignacion="selectedAsignacionForDevolucion" :showModal="showDevolucionModal" @close="closeDevolucionModal" />

    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAsignacionStore } from '@/stores/asignacionStore';
import HeaderPage from '@/components/page/header/Component.vue';
import AsignacionForm from '@/components/forms/AsignacionForm.vue';
import UpdateAsignacionForm from '@/components/forms/UpdateAsignacionForm.vue';
import DevolucionAsignacionModal from '@/components/modals/DevolucionAsignacionModal.vue';
import { IconEdit, IconArrowBack } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'

const store = useAsignacionStore();
const selectedAsignacion = ref(null);
const showAsignacionModal = ref(false);
const showUpdateAsignacionModal = ref(false);
const showDevolucionModal = ref(false);
const selectedAsignacionForDevolucion = ref(null);


// --- Nuevo Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// Función centralizada para cargar los datos
const fetchData = () => {
    store.fetchAsignaciones(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
    fetchData();
    store.fetchCatalogos();
});


// --- Watchers para Paginación y Búsqueda ---
watch([currentPage, pageSize, searchTerm], () => {
    fetchData();
});


const openModal = (asignacion = null) => {
    selectedAsignacion.value = asignacion;
    if (asignacion) {
        showUpdateAsignacionModal.value = true;
    } else {
        showAsignacionModal.value = true;
    }
};

const closeCreateModal = () => {
    showAsignacionModal.value = false;
    selectedAsignacion.value = null;
    store.fetchAsignaciones(); // Recargar lista al cerrar
};

const closeUpdateModal = () => {
    showUpdateAsignacionModal.value = false;
    selectedAsignacion.value = null;
    store.fetchAsignaciones(); // Recargar lista al cerrar
};

const openDevolucionModal = (asignacion) => {
    selectedAsignacionForDevolucion.value = asignacion;
    showDevolucionModal.value = true;
};

const closeDevolucionModal = () => {
    showDevolucionModal.value = false;
    selectedAsignacionForDevolucion.value = null;
    store.fetchAsignaciones(); // Recargar lista al cerrar
};

const search = () => {
    store.fetchAsignaciones(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchAsignaciones(page, store.searchTerm);
    }
};

</script>