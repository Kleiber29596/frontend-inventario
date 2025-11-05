<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'palette']" text="Colores" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Colores</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Color</button>
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
                                    <tr v-for="color in store.colores" :key="color.id">
                                        <td>{{ color.id }}</td>
                                        <td>{{ color.descripcion }}</td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(color)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deleteColor(color.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.colores.length === 0">
                                        <td colspan="3" class="text-center">No se encontraron colores.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.colores.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
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

        <ColorForm :color="selectedColor" :showModal="showColorModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useColorStore } from '@/stores/colorStore';
import HeaderPage from '@/components/page/header/Component.vue';
import ColorForm from '@/components/forms/ColorForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';

const store = useColorStore();
const selectedColor = ref(null);
const showColorModal = ref(false);

onMounted(() => {
    store.fetchColores();
});

const openModal = (color = null) => {
    selectedColor.value = color;
    showColorModal.value = true;
};

const closeModal = () => {
    showColorModal.value = false;
    selectedColor.value = null;
    store.fetchColores();
};

const deleteColor = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este color?')) {
        // Assuming a deleteColor action will be added to the store if needed
        // await store.deleteColor(id);
        alert('Funcionalidad de eliminación no implementada para colores.');
        store.fetchColores();
    }
};

const search = () => {
    store.fetchColores(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchColores(page, store.searchTerm);
    }
};
</script>
