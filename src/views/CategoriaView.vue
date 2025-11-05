<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'tags']" text="Categorías" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Categorías</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <button class="btn btn-primary ms-2" @click="openModal()">Nueva Categoría</button>
                            </div>
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
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.categorias.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
                        <ul class="pagination m-0 ms-auto">
                            <li class="page-item" :class="{ disabled: !store.paginacion.anterior }">
                                <a class="page-link" href="#" @click.prevent="changePage(store.paginacion.pagina_actual - 1)">anterior</a>
                            </li>
                            <li class="page-item" v-for="page in store.paginacion.paginas" :key="page" :class="{ active: page === store.paginacion.pagina_actual }">
                                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: !store.paginacion.siguiente }">
                                <a class="page-link" href="#" @click.prevent="changePage(store.paginacion.pagina_actual + 1)">siguiente</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <CategoriaForm :categoria="selectedCategoria" :showModal="showCategoriaModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCategoriaStore } from '@/stores/categoriaStore';
import HeaderPage from '@/components/page/header/Component.vue';
import CategoriaForm from '@/components/forms/CategoriaForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';

const store = useCategoriaStore();
const selectedCategoria = ref(null);
const showCategoriaModal = ref(false);

onMounted(() => {
    store.fetchCategorias();
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

const search = () => {
    store.fetchCategorias(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchCategorias(page, store.searchTerm);
    }
};
</script>
