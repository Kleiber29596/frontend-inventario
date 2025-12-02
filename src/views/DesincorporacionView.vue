<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'trash-alt']" text="Desincorporaciones" /> 

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
                                        <th>Motivo</th>
                                        <th>Persona Responsable</th>
                                        <th>Fecha</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="6" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="desincorporacion in store.desincorporaciones" :key="desincorporacion.id">
                                        <td>{{ desincorporacion.id }}</td>
                                        <td>{{ desincorporacion.motivo.descripcion}} </td>
                                        <td>{{ desincorporacion.persona_responsable.primer_nombre + ' ' + desincorporacion.persona_responsable.primer_apellido}}</td>
                                        <td>{{ desincorporacion.fecha_desincorporacion }}</td>
                                            <!-- <button class="btn btn-sm btn-warning" @click="openModal(desincorporacion)">Editar</button> -->
                                        <td class="d-flex gap-1">
                                            <a href="#" class="btn btn-action" title="Ver Detalles" @click.prevent="openDetailModal(desincorporacion)">
                                                <IconEye size="24" stroke-width="1.5" />
                                            </a>
                                            <a href="#" class="btn btn-action" title="Generar Acta" @click.prevent="generarActa(desincorporacion)">
                                                <IconPrinter size="24" stroke-width="1.5" />
                                            </a>
                                            <!-- <a class="btn btn-action" @click.prevent="openModal(desincorporacion)">
                                            <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click.prevent="openAdjuntarActaModal(desincorporacion)" title="Adjuntar Acta">
                                            <IconPaperclip size="24" stroke-width="1.5" />
                                            </a> -->
                                        </td>
                                      
                                    </tr>
                                    <tr v-if="!store.loading && store.desincorporaciones.length === 0">
                                        <td colspan="6" class="text-center">No se encontraron desincorporaciones.</td>
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

        <DesincorporacionForm :desincorporacion="selectedDesincorporacion" @close="closeModal" />
        <AdjuntarActaModal :desincorporacion="selectedDesincorporacionForActa" @close="closeModal" />
        <DesincorporacionDetailModal :showModal="showDetailModal" :desincorporacionData="selectedDesincorporacionForDetail" @close="closeDetailModal" />

    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useDesincorporacionStore } from '@/stores/desincorporacionStore';
import HeaderPage from '@/components/page/header/Component.vue';
import DesincorporacionForm from '@/components/forms/DesincorporacionForm.vue';
import DesincorporacionDetailModal from '@/components/modals/DesincorporacionDetailModal.vue'; // 1. Importar el nuevo modal
import AdjuntarActaModal from '@/components/modals/AdjuntarActaModal.vue';
import { Modal } from 'bootstrap';
import { IconEdit, IconArrowBack, IconPaperclip, IconEye, IconPrinter } from '@tabler/icons-vue';
const store = useDesincorporacionStore();
const selectedDesincorporacion = ref(null);
let modalInstance = null;

let adjuntarActaModalInstance = null;
const selectedDesincorporacionForActa = ref(null);
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'



// --- Estado para el modal de detalles ---
const showDetailModal = ref(false);
const selectedDesincorporacionForDetail = ref(null);

// --- Nuevo Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// Función centralizada para cargar los datos
const fetchData = () => {
    store.fetchDesincorporaciones(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
    fetchData();
    store.fetchCatalogos();
    modalInstance = new Modal(document.getElementById('desincorporacionModal'));
    adjuntarActaModalInstance = new Modal(document.getElementById('adjuntarActaModal'));
});



// --- Watchers para Paginación y Búsqueda ---
watch([currentPage, pageSize, searchTerm], () => {
    fetchData();
});

const openModal = (desincorporacion = null) => {
    selectedDesincorporacion.value = desincorporacion;
    modalInstance.show();
};

const openAdjuntarActaModal = (desincorporacion) => {
    selectedDesincorporacionForActa.value = desincorporacion;
    adjuntarActaModalInstance.show();
};

// 2. Funciones para controlar el modal de detalles
const openDetailModal = (desincorporacion) => {
    selectedDesincorporacionForDetail.value = desincorporacion; // Corregido: pasar el objeto completo
    showDetailModal.value = true;
};

const closeDetailModal = () => {
    showDetailModal.value = false;
    selectedDesincorporacionForDetail.value = null; // Corregido: limpiar la variable correcta
};

const closeModal = () => {
    modalInstance.hide();
    selectedDesincorporacion.value = null;
    store.fetchDesincorporaciones(); // Recargar lista al cerrar
};

const search = () => {
    store.fetchDesincorporaciones(1, store.searchTerm);
};


const generarActa = (desincorporacion) => {
    store.generarActaDesincorporacion(desincorporacion);
};




</script>