<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'users']" text="Personas" />

        <div class="page-body mt-3 mb-3">
            <div class="ps-3 pe-3">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Personas</h3>
                        <div class="ms-auto">
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Buscar..." v-model="store.searchTerm" @keyup.enter="search">
                                <button class="btn btn-outline-secondary" type="button" @click="search">Buscar</button>
                                <button class="btn btn-primary ms-2" @click="openModal()">Nueva Persona</button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cédula</th>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Cargo</th>
                                        <th>Activo</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="store.loading">
                                        <td colspan="9" class="text-center">Cargando...</td>
                                    </tr>
                                    <tr v-for="persona in store.personas" :key="persona.id">
                                        <td>{{ persona.id }}</td>
                                        <td>{{ persona.cedula }}</td>
                                        <td>{{ persona.primer_nombre }} </td>
                                        <td>{{ persona.primer_apellido }}</td>
                                        <td>{{ persona.cargo }}</td>
                                        <td>
                                            <span :class="['badge', persona.activo ? 'bg-success' : 'bg-danger']">
                                                {{ persona.activo ? 'Sí' : 'No' }}
                                            </span>
                                        </td>
                                        <td>
                                            <a class="btn btn-action" @click="openModal(persona)">
                                                <IconEdit size="24" stroke-width="1.5" />
                                            </a>
                                            <a class="btn btn-action" @click="deletePersona(persona.id)">
                                                <IconTrash size="24" stroke-width="1.5" />
                                            </a>
                                        </td>
                                    </tr>
                                    <tr v-if="!store.loading && store.personas.length === 0">
                                        <td colspan="9" class="text-center">No se encontraron personas.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer d-flex align-items-center">
                        <p class="m-0 text-muted">Mostrando <span>{{ store.personas.length }}</span> de <span>{{ store.paginacion.total }}</span> entradas</p>
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

        <PersonaForm :persona="selectedPersona" :showModal="showPersonaModal" @close="closeModal" />

    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePersonaStore } from '@/stores/personaStore';
import HeaderPage from '@/components/page/header/Component.vue';
import PersonaForm from '@/components/forms/PersonaForm.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';

const store = usePersonaStore();
const selectedPersona = ref(null);
const showPersonaModal = ref(false);

onMounted(() => {
    store.fetchPersonas();
});

const openModal = (persona = null) => {
    selectedPersona.value = persona;
    showPersonaModal.value = true;
};

const closeModal = () => {
    showPersonaModal.value = false;
    selectedPersona.value = null;
    store.fetchPersonas();
};

const deletePersona = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar esta persona?')) {
        await store.deletePersona(id);
        store.fetchPersonas();
    }
};

const search = () => {
    store.fetchPersonas(1, store.searchTerm);
};

const changePage = (page) => {
    if (page > 0 && page <= store.paginacion.paginas) {
        store.fetchPersonas(page, store.searchTerm);
    }
};
</script>
