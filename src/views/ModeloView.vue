<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'cube']" text="Modelos" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Modelos</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Modelo</button>
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
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.modelos.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
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

        <ModeloForm :modelo="selectedModelo" :showModal="showModeloModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useModeloStore } from '@/stores/modeloStore';
import HeaderPage from '@/components/page/header/Component.vue';
import ModeloForm from '@/components/forms/ModeloForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';

const store = useModeloStore();
const selectedModelo = ref(null);
const showModeloModal = ref(false);

onMounted(() => {
    store.fetchModelos();
});

const openModal = (modelo = null) => {
    selectedModelo.value = modelo;
    showModeloModal.value = true;
};

const closeModal = () => {
    showModeloModal.value = false;
    selectedModelo.value = null;
    store.fetchModelos();
};

const deleteModelo = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este modelo?')) {
        await store.deleteModelo(id);
        store.fetchModelos();
    }
};

const search = () => {
    store.fetchModelos(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchModelos(page, store.searchTerm);
    }
};
</script>
