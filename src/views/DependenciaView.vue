<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'building']" text="Dependencias" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Dependencias</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <button class="btn btn-primary ms-2" @click="openModal()">Nueva Dependencia</button>
                            </div>
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
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.dependencias.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
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

        <DependenciaForm :dependencia="selectedDependencia" :showModal="showDependenciaModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDependenciaStore } from '@/stores/dependenciaStore';
import HeaderPage from '@/components/page/header/Component.vue';
import DependenciaForm from '@/components/forms/DependenciaForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';

const store = useDependenciaStore();
const selectedDependencia = ref(null);
const showDependenciaModal = ref(false);

onMounted(() => {
    store.fetchDependencias();
});

const openModal = (dependencia = null) => {
    selectedDependencia.value = dependencia;
    showDependenciaModal.value = true;
};

const closeModal = () => {
    showDependenciaModal.value = false;
    selectedDependencia.value = null;
    store.fetchDependencias();
};

const deleteDependencia = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar esta dependencia?')) {
        // Assuming a deleteDependencia action will be added to the store if needed
        // await store.deleteDependencia(id);
        alert('Funcionalidad de eliminación no implementada para dependencias.');
        store.fetchDependencias();
    }
};

const search = () => {
    store.fetchDependencias(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchDependencias(page, store.searchTerm);
    }
};
</script>
