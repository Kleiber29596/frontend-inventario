<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'building']" text="Dependencias" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Dependencias</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                            <button class="btn btn-primary ms-2" @click="openModal()">Nueva Dependencia</button>
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
                                    <tr v-for="dependencia in store.dependencias" :key="dependencia.id">
                                        <td>{{ dependencia.id }}</td>
                                        <td>{{ dependencia.nombre }}</td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(dependencia)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deleteDependencia(dependencia.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.dependencias.length === 0">
                                        <td colspan="3" class="text-center">No se encontraron dependencias.</td>
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

        <DependenciaForm :dependencia="selectedDependencia" :showModal="showDependenciaModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useDependenciaStore } from '@/stores/dependenciaStore';
import HeaderPage from '@/components/page/header/Component.vue';
import DependenciaForm from '@/components/forms/DependenciaForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'

const store = useDependenciaStore();
const selectedDependencia = ref(null);
const showDependenciaModal = ref(false);

// --- Nuevo Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// Función centralizada para cargar los datos
const fetchData = () => {
    store.fetchDependencias(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
    fetchData();
});

// --- Watchers para Paginación y Búsqueda ---
watch([currentPage, pageSize, searchTerm], () => {
    fetchData();
});

const openModal = (dependencia = null) => {
    selectedDependencia.value = dependencia;
    showDependenciaModal.value = true;
};

const closeModal = () => {
    showDependenciaModal.value = false;
    selectedDependencia.value = null;
    fetchData();
};

const deleteDependencia = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar esta dependencia?')) {
        await store.deleteDependencia(id);
        fetchData();
    }
};
</script>
