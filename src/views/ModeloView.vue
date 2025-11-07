<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'cube']" text="Modelos" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Modelos</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                            <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Modelo</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Descripción</th>
                                        <th>Marca</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="4" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="modelo in store.modelos" :key="modelo.id">
                                        <td>{{ modelo.id }}</td>
                                        <td>{{ modelo.descripcion }}</td>
                                        <td>{{ modelo.marca ? modelo.marca.descripcion : 'N/A' }}</td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(modelo)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deleteModelo(modelo.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.modelos.length === 0">
                                        <td colspan="4" class="text-center">No se encontraron modelos.</td>
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

        <ModeloForm :modelo="selectedModelo" :showModal="showModeloModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useModeloStore } from '@/stores/modeloStore';
import HeaderPage from '@/components/page/header/Component.vue';
import ModeloForm from '@/components/forms/ModeloForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'

const store = useModeloStore();
const selectedModelo = ref(null);
const showModeloModal = ref(false);

// --- Nuevo Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// Función centralizada para cargar los datos
const fetchData = () => {
    store.fetchModelos(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
    fetchData();
    store.fetchMarcas();
});

// --- Watchers para Paginación y Búsqueda ---
watch([currentPage, pageSize, searchTerm], () => {
    fetchData();
});

const openModal = (modelo = null) => {
    selectedModelo.value = modelo;
    showModeloModal.value = true;
};

const closeModal = () => {
    showModeloModal.value = false;
    selectedModelo.value = null;
    fetchData();
};

const deleteModelo = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este modelo?')) {
        await store.deleteModelo(id);
        fetchData();
    }
};
</script>
