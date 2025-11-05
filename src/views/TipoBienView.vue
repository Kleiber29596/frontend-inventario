<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'boxes']" text="Tipos de Bien" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Tipos de Bien</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <button class="btn btn-primary ms-2" @click="openModal()">Nuevo Tipo de Bien</button>
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
                                    <tr v-for="tipoBien in store.tiposBien" :key="tipoBien.id">
                                        <td>{{ tipoBien.id }}</td>
                                        <td>{{ tipoBien.descripcion }}</td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(tipoBien)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deleteTipoBien(tipoBien.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.tiposBien.length === 0">
                                        <td colspan="3" class="text-center">No se encontraron tipos de bien.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.tiposBien.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
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

        <TipoBienForm :tipoBien="selectedTipoBien" :showModal="showTipoBienModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTipoBienStore } from '@/stores/tipoBienStore';
import HeaderPage from '@/components/page/header/Component.vue';
import TipoBienForm from '@/components/forms/TipoBienForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';

const store = useTipoBienStore();
const selectedTipoBien = ref(null);
const showTipoBienModal = ref(false);

onMounted(() => {
    store.fetchTiposBien();
});

const openModal = (tipoBien = null) => {
    selectedTipoBien.value = tipoBien;
    showTipoBienModal.value = true;
};

const closeModal = () => {
    showTipoBienModal.value = false;
    selectedTipoBien.value = null;
    store.fetchTiposBien();
};

const deleteTipoBien = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este tipo de bien?')) {
        await store.deleteTipoBien(id);
        store.fetchTiposBien();
    }
};

const search = () => {
    store.fetchTiposBien(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchTiposBien(page, store.searchTerm);
    }
};
</script>
