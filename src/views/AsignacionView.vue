<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <!-- NOTA: He añadido un nuevo icono 'IconEye' para la acción de visualizar -->
        <HeaderPage :icon="['fas', 'user-tag']" :text="headerText" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">{{ listTitle }}</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                          
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>usuario del bien</th>
                                        <th>Departamento</th>
                                        <th>Fecha de Inicio</th>
                                        <th>Estatus</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="6" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="asignacion in store.asignaciones" :key="asignacion.id">
                                        <td>{{ asignacion.id }}</td>
                                        <td>{{ asignacion.usuario_bien.primer_nombre}} {{ asignacion.usuario_bien.primer_apellido }}</td>
                                        <td>{{ asignacion.departamento.nombre }}</td>
                                        <td>{{ asignacion.fecha_inicio }}</td>
                                        <td> <span class="badge" :class="getEstatusClass(asignacion.estatus?.descripcion)">
                                            {{ asignacion.estatus?.descripcion || 'N/A' }}
                                        </span>
                                        </td>
                                        <td>
                                            <a class="btn btn-action" title="Ver Detalles" @click="openDetallesModal(asignacion.id)">
                                                <IconEye size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" title="Editar" @click="openModal(asignacion)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                        <td>
                                            <a class="btn btn-action" title="Registrar Devolución" @click="openDevolucionModal(asignacion)">
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
        <AsignacionDetallesModal :showModal="showDetallesModal" :asignacion="store.asignacionSeleccionada" :loading="store.loading" @close="closeDetallesModal" />

    </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useAsignacionStore } from '@/stores/asignacionStore';
import { useAccountStore } from '@/stores/account.js';
// import { useAuthStore } from '@/stores/
import HeaderPage from '@/components/page/header/Component.vue';
import AsignacionForm from '@/components/forms/AsignacionForm.vue';
import UpdateAsignacionForm from '@/components/forms/UpdateAsignacionForm.vue';
import DevolucionAsignacionModal from '@/components/modals/DevolucionAsignacionModal.vue';
import AsignacionDetallesModal from '@/components/modals/AsignacionDetallesModal.vue';
import { IconEdit, IconArrowBack, IconEye } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'

const store = useAsignacionStore();
const authStore = useAccountStore();
const selectedAsignacion = ref(null);
const showAsignacionModal = ref(false);
const showUpdateAsignacionModal = ref(false);
const showDevolucionModal = ref(false);
const showDetallesModal = ref(false);
const selectedAsignacionForDevolucion = ref(null);


// --- Nuevo Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// --- Lógica de Roles ---
const isSolicitante = computed(() => authStore.user?.rol === 'solicitante');
const headerText = computed(() => 
    isSolicitante.value ? `Asignaciones de mi Departamento` : 'Asignaciones'
);
const listTitle = computed(() => 
    isSolicitante.value ? `Listado de Asignaciones de mi Departamento` : 'Listado de Asignaciones'
);

// Función centralizada para cargar los datos
const fetchData = () => {
    let departamentoId = null;
    if (isSolicitante.value) {
        departamentoId = authStore.user?.departamento_id;
    }
    // Pasamos el ID del departamento al fetch (la función en el store debe aceptarlo)
    store.fetchAsignaciones(currentPage.value, pageSize.value, searchTerm.value, departamentoId);
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

const openDetallesModal = (asignacionId) => {
    store.fetchAsignacionConDetalles(asignacionId);
    showDetallesModal.value = true;
};

const closeDetallesModal = () => {
    showDetallesModal.value = false;
    store.asignacionSeleccionada = null;
};

const getEstatusClass = (estatus) => {
    if (estatus === 'Activa') return 'bg-primary';
    if (estatus === 'Finalizada') return 'bg-success';
    return 'bg-secondary';
};

</script>