<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'tags']" text="Categorías" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                            <p class="text-secondary m-0">Listado de Préstamos</p>
                            <div class="d-flex gap-2">
                                <SearchInput v-model="searchTerm" />
                                <button class="btn btn-primary ms-2" @click="openModal()">Nueva Categoría</button>
                            </div>
                        </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Descripción</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="3" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="categoria in store.categorias" :key="categoria.id">
                                        <td>{{ categoria.id }}</td>
                                        <td>{{ categoria.descripcion }}</td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(categoria)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deleteCategoria(categoria.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.categorias.length === 0">
                                        <td colspan="3" class="text-center">No se encontraron categorías.</td>
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

        <CategoriaForm :categoria="selectedCategoria" :showModal="showCategoriaModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useCategoriaStore } from '@/stores/categoriaStore';
import HeaderPage from '@/components/page/header/Component.vue';
import CategoriaForm from '@/components/forms/CategoriaForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue'
import SearchInput from '@/components/paginacion/searchInput.vue'






const store = useCategoriaStore();
const selectedCategoria = ref(null);
const showCategoriaModal = ref(false);

// --- Nuevo Estado Local para Paginación/Búsqueda ---
const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref(''); // Usaremos esta en lugar de store.searchTerm



// Función centralizada para cargar los datos
const fetchData = () => {
    store.fetchCategorias(currentPage.value, pageSize.value, searchTerm.value);


};


onMounted(() => {
    fetchData();

});

// --- Watchers para Paginación y Búsqueda ---
// Cuando cualquiera de estos cambie, recargamos los datos.
watch([currentPage, pageSize, searchTerm], () => {
    fetchData();
});


const openModal = (categoria = null) => {
    selectedCategoria.value = categoria;
    showCategoriaModal.value = true;
};

const closeModal = () => {
    showCategoriaModal.value = false;
    selectedCategoria.value = null;
    store.fetchCategorias();
};

const deleteCategoria = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
        await store.deleteCategoria(id);
        store.fetchCategorias();
    }
};


</script>
