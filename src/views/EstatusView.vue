<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'info-circle']" text="Estatus" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Estatus</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Estatus</button>
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
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.estatusList.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
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

        <EstatusForm :estatus="selectedEstatus" :showModal="showEstatusModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useEstatusStore } from '@/stores/estatusStore';
import HeaderPage from '@/components/page/header/Component.vue';
import EstatusForm from '@/components/forms/EstatusForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';

const store = useEstatusStore();
const selectedEstatus = ref(null);
const showEstatusModal = ref(false);

onMounted(() => {
    store.fetchEstatus();
});

const openModal = (estatus = null) => {
    selectedEstatus.value = estatus;
    showEstatusModal.value = true;
};

const closeModal = () => {
    showEstatusModal.value = false;
    selectedEstatus.value = null;
    store.fetchEstatus();
};

const deleteEstatus = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este estatus?')) {
        await store.deleteEstatus(id);
        store.fetchEstatus();
    }
};

const search = () => {
    store.fetchEstatus(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchEstatus(page, store.searchTerm);
    }
};
</script>
