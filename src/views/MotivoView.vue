<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'lightbulb']" text="Motivos" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Motivos</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                            <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Motivo</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Descripción</th>
                                        <th>Tipo</th>
                                        <th>Activo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="5" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="motivo in store.motivos" :key="motivo.id">
                                        <td>{{ motivo.id }}</td>
                                        <td>{{ motivo.descripcion }}</td>
                                        <td>{{ motivo.tipo }}</td>
                                        <td>
                                            <span :class="['badge', motivo.activo ? 'bg-success' : 'bg-danger']">
                                                {{ motivo.activo ? 'Sí' : 'No' }}
                                            </span>
                                        </td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(motivo)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deleteMotivo(motivo.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.motivos.length === 0">
                                        <td colspan="5" class="text-center">No se encontraron motivos.</td>
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

        <MotivoForm :motivo="selectedMotivo" :showModal="showMotivoModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useMotivoStore } from '@/stores/motivoStore';
import HeaderPage from '@/components/page/header/Component.vue';
import MotivoForm from '@/components/forms/MotivoForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'

const store = useMotivoStore();
const selectedMotivo = ref(null);
const showMotivoModal = ref(false);

// --- Nuevo Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// Función centralizada para cargar los datos
const fetchData = () => {
    store.fetchMotivos(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
    fetchData();
});

// --- Watchers para Paginación y Búsqueda ---
watch([currentPage, pageSize, searchTerm], () => {
    fetchData();
});

const openModal = (motivo = null) => {
    selectedMotivo.value = motivo;
    showMotivoModal.value = true;
};

const closeModal = () => {
    showMotivoModal.value = false;
    selectedMotivo.value = null;
    fetchData();
};

const deleteMotivo = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este motivo?')) {
        await store.deleteMotivo(id);
        fetchData();
    }
};
</script>
