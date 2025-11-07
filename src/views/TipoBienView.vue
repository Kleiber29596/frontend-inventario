<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'tags']" text="Tipos de Bien" />

        <div class="page-body mt-3 mb-3">
            <div class="container-xl">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Tipos de Bien</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                            <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Tipo de Bien</button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-vcenter card-table table-striped">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th class="w-1">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="store.loading">
                                    <td colspan="2" class="text-center">Cargando...</td>
                                </tr>
                                <tr v-else-if="store.tiposBien.length === 0">
                                    <td colspan="2" class="text-center">No se encontraron tipos de bien.</td>
                                </tr>
                                <tr v-for="tipoBien in store.tiposBien" :key="tipoBien.id">
                                    <td>{{ tipoBien.descripcion }}</td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <a href="#" class="btn btn-action" @click.prevent="openModal(tipoBien)" title="Editar">
                                                <IconEdit size="20" stroke-width="1.5" />
                                            </a>
                                            <a href="#" class="btn btn-action text-danger" @click.prevent="deleteTipoBien(tipoBien.id)" title="Eliminar">
                                                <IconTrash size="20" stroke-width="1.5" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="card-footer">
                        <Pagination v-model:page="currentPage" v-model:pageSize="pageSize" :total="store.totalItems" />
                    </div>
                </div>
            </div>
        </div>

        <TipoBienForm :tipoBien="selectedTipoBien" :showModal="showTipoBienModal" @close="closeModal" />
    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';
import { useTipoBienStore } from '@/stores/tipoBienStore';
import HeaderPage from '@/components/page/header/Component.vue';
import TipoBienForm from '@/components/forms/TipoBienForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue';
import SearchInput from '@/components/paginacion/searchInput.vue';

const store = useTipoBienStore();
const selectedTipoBien = ref(null);
const showTipoBienModal = ref(false);

// --- Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

// --- Función centralizada para cargar los datos ---
const fetchData = () => {
    store.fetchTiposBien(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
    fetchData();
});

// --- Watchers para Paginación y Búsqueda ---
watch([currentPage, pageSize, searchTerm], () => {
    fetchData();
});

const openModal = (tipoBien = null) => {
    selectedTipoBien.value = tipoBien;
    showTipoBienModal.value = true;
};

const closeModal = () => {
    showTipoBienModal.value = false;
    selectedTipoBien.value = null;
    fetchData(); // Recargamos los datos de la página actual
};

const deleteTipoBien = async (id) => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, ¡eliminar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            store.deleteTipoBien(id);
        }
    });
};
</script>
