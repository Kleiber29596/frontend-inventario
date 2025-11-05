<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'heartbeat']" text="Estados Físicos" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Estados Físicos</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Estado Físico</button>
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
                                    <tr v-for="estadoFisico in store.estadosFisicos" :key="estadoFisico.id">
                                        <td>{{ estadoFisico.id }}</td>
                                        <td>{{ estadoFisico.nombre }}</td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(estadoFisico)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deleteEstadoFisico(estadoFisico.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.estadosFisicos.length === 0">
                                        <td colspan="3" class="text-center">No se encontraron estados físicos.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.estadosFisicos.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
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

        <EstadoFisicoForm :estadoFisico="selectedEstadoFisico" :showModal="showEstadoFisicoModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useEstadoFisicoStore } from '@/stores/estadoFisicoStore';
import HeaderPage from '@/components/page/header/Component.vue';
import EstadoFisicoForm from '@/components/forms/EstadoFisicoForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';

const store = useEstadoFisicoStore();
const selectedEstadoFisico = ref(null);
const showEstadoFisicoModal = ref(false);

onMounted(() => {
    store.fetchEstadosFisicos();
});

const openModal = (estadoFisico = null) => {
    selectedEstadoFisico.value = estadoFisico;
    showEstadoFisicoModal.value = true;
};

const closeModal = () => {
    showEstadoFisicoModal.value = false;
    selectedEstadoFisico.value = null;
    store.fetchEstadosFisicos();
};

const deleteEstadoFisico = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este estado físico?')) {
        await store.deleteEstadoFisico(id);
        store.fetchEstadosFisicos();
    }
};

const search = () => {
    store.fetchEstadosFisicos(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchEstadosFisicos(page, store.searchTerm);
    }
};
</script>
