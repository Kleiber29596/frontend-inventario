<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'heartbeat']" text="Estados Físicos" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Estados Físicos</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                            <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Estado Físico</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="3" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="estadoFisico in store.estadosFisicos" :key="estadoFisico.id">
                                        <td>{{ estadoFisico.id }}</td>
                                        <td>{{ estadoFisico.nombre }}</td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(estadoFisico)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deleteEstadoFisico(estadoFisico.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.estadosFisicos.length === 0">
                                        <td colspan="3" class="text-center">No se encontraron estados físicos.</td>
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

        <EstadoFisicoForm :estadoFisico="selectedEstadoFisico" :showModal="showEstadoFisicoModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useEstadoFisicoStore } from '@/stores/estadoFisicoStore';
import HeaderPage from '@/components/page/header/Component.vue';
import EstadoFisicoForm from '@/components/forms/EstadoFisicoForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'

const store = useEstadoFisicoStore();
const selectedEstadoFisico = ref(null);
const showEstadoFisicoModal = ref(false);

// --- Nuevo Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// Función centralizada para cargar los datos
const fetchData = () => {
    store.fetchEstadosFisicos(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
    fetchData();
});

// --- Watchers para Paginación y Búsqueda ---
watch([currentPage, pageSize, searchTerm], () => {
    fetchData();
});

const openModal = (estadoFisico = null) => {
    selectedEstadoFisico.value = estadoFisico;
    showEstadoFisicoModal.value = true;
};

const closeModal = () => {
    showEstadoFisicoModal.value = false;
    selectedEstadoFisico.value = null;
    fetchData();
};

const deleteEstadoFisico = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este estado físico?')) {
        await store.deleteEstadoFisico(id);
        fetchData();
    }
};
</script>
