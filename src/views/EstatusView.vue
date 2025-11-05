<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'info-circle']" text="Estatus" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Estatus</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                            <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Estatus</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Descripción</th>
                                        <th>Tipo de Estatus</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="4" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="estatus in store.estatusList" :key="estatus.id">
                                        <td>{{ estatus.id }}</td>
                                        <td>{{ estatus.descripcion }}</td>
                                        <td>{{ estatus.tipo_estatus }}</td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(estatus)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deleteEstatus(estatus.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.estatusList.length === 0">
                                        <td colspan="4" class="text-center">No se encontraron estatus.</td>
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

        <EstatusForm :estatus="selectedEstatus" :showModal="showEstatusModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useEstatusStore } from '@/stores/estatusStore';
import HeaderPage from '@/components/page/header/Component.vue';
import EstatusForm from '@/components/forms/EstatusForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'

const store = useEstatusStore();
const selectedEstatus = ref(null);
const showEstatusModal = ref(false);

// --- Nuevo Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// Función centralizada para cargar los datos
const fetchData = () => {
    store.fetchEstatus(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
    fetchData();
});

// --- Watchers para Paginación y Búsqueda ---
watch([currentPage, pageSize, searchTerm], () => {
    fetchData();
});

const openModal = (estatus = null) => {
    selectedEstatus.value = estatus;
    showEstatusModal.value = true;
};

const closeModal = () => {
    showEstatusModal.value = false;
    selectedEstatus.value = null;
    fetchData();
};

const deleteEstatus = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este estatus?')) {
        await store.deleteEstatus(id);
        fetchData();
    }
};
</script>
