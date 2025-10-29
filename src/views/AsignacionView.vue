<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'user-tag']" text="Asignaciones" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Asignaciones</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <button class="btn btn-primary ms-2" @click="openModal()">Nueva Asignación</button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Persona</th>
                                        <th>Departamento</th>
                                        <th>Fecha de Inicio</th>
                                        <th>Estatus</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="6" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="asignacion in store.asignaciones" :key="asignacion.id">
                                        <td>{{ asignacion.id }}</td>
                                        <td>{{ asignacion.persona.nombre_completo }}</td>
                                        <td>{{ asignacion.departamento.nombre }}</td>
                                        <td>{{ asignacion.fecha_inicio }}</td>
                                        <td><span class="badge">{{ asignacion.estatus.nombre }}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-warning" @click="openModal(asignacion)">Editar</button>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.asignaciones.length === 0">
                                        <td colspan="6" class="text-center">No se encontraron asignaciones.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.asignaciones.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
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

        <AsignacionForm :asignacion="selectedAsignacion" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAsignacionStore } from '@/stores/asignacionStore';
import HeaderPage from '@/components/page/header/Component.vue';
import AsignacionForm from '@/components/forms/AsignacionForm.vue';
import { Modal } from 'bootstrap';

const store = useAsignacionStore();
const selectedAsignacion = ref(null);
let modalInstance = null;

onMounted(() => {
    store.fetchAsignaciones();
    store.fetchCatalogos();
    modalInstance = new Modal(document.getElementById('asignacionModal'));
});

const openModal = (asignacion = null) => {
    selectedAsignacion.value = asignacion;
    modalInstance.show();
};

const closeModal = () => {
    modalInstance.hide();
    selectedAsignacion.value = null;
    store.fetchAsignaciones(); // Recargar lista al cerrar
};

const search = () => {
    store.fetchAsignaciones(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchAsignaciones(page, store.searchTerm);
    }
};

</script>