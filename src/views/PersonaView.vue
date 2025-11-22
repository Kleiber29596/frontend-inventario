<template>
    <main class="page-wrapper">
        <!-- Page header -->
        <HeaderPage :icon="['fas', 'users']" text="Personas" />

        <div class="page-body mt-3 mb-3">
            <div class="container-xl">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <p class="text-secondary m-0">Listado de Personas</p>
                        <div class="d-flex gap-2">
                            <SearchInput v-model="searchTerm" />
                            <button class="btn btn-primary ms-2" @click.prevent="openForm(false)">Nueva Persona</button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-vcenter card-table table-striped">
                            <thead>
                                <tr>
                                    <th>Nac.</th>
                                    <th>Cédula</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Cargo</th>
                                    <th>Activo</th>
                                    <th class="w-1">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="store.loading">
                                    <td colspan="7" class="text-center">Cargando...</td>
                                </tr>
                                <tr v-else-if="store.personas.length === 0">
                                    <td colspan="7" class="text-center">No se encontraron personas.</td>
                                </tr>
                                <tr v-for="persona in store.personas" :key="persona.id">
                                    <td>{{ persona.nacionalidad }}</td>
                                    <td>{{ persona.cedula }}</td>
                                    <td>{{ persona.primer_nombre }}</td>
                                    <td>{{ persona.primer_apellido }}</td>
                                    <td>{{ persona.cargo }}</td>
                                    <td>
                                        <span :class="['badge', persona.Estado ? 'bg-success' : 'bg-danger']">
                                            {{ persona.Estado ? 'Sí' : 'No' }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <a href="#" class="btn btn-action" @click.prevent="openForm(true, persona)" title="Editar">
                                                <IconEdit size="20" stroke-width="1.5" />
                                            </a>
                                            <a href="#" class="btn btn-action text-danger" @click.prevent="handleDelete(persona.id)" title="Eliminar">
                                                <IconTrash size="20" stroke-width="1.5" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="card-footer">
                        <Pagination v-model:page="currentPage" v-model:pageSize="pageSize" :total="store.totalItems" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Form -->
        <div v-if="showForm" class="modal fade show d-block" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content card">
                    <div class="card-header">
                        <h3 class="card-title m-0">{{ isEdit ? 'Editar Persona' : 'Nueva Persona' }}</h3>
                        <button type="button" class="btn-close" @click="closeForm"></button>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="submitForm">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Nacionalidad *</label>
                                    <select class="form-select" v-model="form.nacionalidad" required>
                                        <option value="V">Venezolano (V)</option>
                                        <option value="E">Extranjero (E)</option>
                                    </select>
                                </div>
                                <div class="col-md-8 mb-3">
                                    <label class="form-label">Cédula *</label>
                                    <input type="text" class="form-control" v-model="form.cedula" placeholder="12345678" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Primer Nombre *</label>
                                    <input type="text" class="form-control" v-model="form.primer_nombre" placeholder="Juan" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Primer Apellido *</label>
                                    <input type="text" class="form-control" v-model="form.primer_apellido" placeholder="Perez" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Correo *</label>
                                    <input type="email" class="form-control" v-model="form.correo" placeholder="juan.perez@example.com" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Número de Contacto</label>
                                    <input type="text" class="form-control" v-model="form.num_contacto" placeholder="0412-1234567" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Cargo *</label>
                                    <input type="text" class="form-control" v-model="form.cargo" placeholder="Analista" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Dependencia *</label>
                                    <CustomVueSelect
                                        v-model="form.dependencia_id" 
                                        :options="asignacionStore.catalogs.departamentos"
                                        placeholder="Selecciona una dependencia..."
                                        label="nombre"
                                        track-by="id"
                                        required />
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" v-model="form.Estado">
                                        <span class="form-check-label">Activo</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="card-footer d-flex gap-2 justify-content-end">
                        <button class="btn btn-secondary" @click="closeForm">Cancelar</button>
                        <button class="btn btn-primary" :disabled="store.loading" @click="submitForm">
                            {{ store.loading ? 'Guardando...' : 'Guardar' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showForm" class="modal-backdrop fade show"></div>

    </main>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue';
import Swal from 'sweetalert2';
import { usePersonaStore } from '@/stores/personaStore';
import { useAsignacionStore } from '@/stores/asignacionStore'; // 1. Importar el store correcto
import HeaderPage from '@/components/page/header/Component.vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import Pagination from '@/components/paginacion/paginacion.vue'
import CustomVueSelect from '@/components/select/select-vue.vue';
import SearchInput from '@/components/paginacion/searchInput.vue'

const store = usePersonaStore();
const asignacionStore = useAsignacionStore(); // 2. Crear instancia del store

const currentPage = ref(1);
const pageSize = ref(10);
const searchTerm = ref('');

const showForm = ref(false);
const isEdit = ref(false);

const form = reactive({
    id: null,
    nacionalidad: 'V',
    cedula: '',
    primer_nombre: '',
    primer_apellido: '',
    correo: '',
    num_contacto: '',
    cargo: '',
    Estado: true,
    dependencia_id: null,
});

const fetchData = () => {
    store.fetchPersonas(currentPage.value, pageSize.value, searchTerm.value);
};

onMounted(() => {
    fetchData();
    asignacionStore.fetchCatalogos(); // 3. Llamar a la función desde el store correcto
});

watch([currentPage, pageSize, searchTerm], fetchData, { immediate: false });

const resetForm = () => {
    Object.assign(form, {
        id: null, nacionalidad: 'V', cedula: '', primer_nombre: '',
       primer_apellido: '', correo: '',
        num_contacto: '', cargo: '', Estado: true,
        dependencia_id: null,
    });
};

const openForm = (edit = false, data = null) => {
    isEdit.value = edit;
    if (edit && data) {
        Object.assign(form, { ...data, dependencia_id: data.dependencia || null });
    } else {
        resetForm();
    }
    showForm.value = true;
};

const closeForm = () => {
    showForm.value = false;
    resetForm();
};

const submitForm = async () => {
    // Construimos el payload explícitamente para evitar campos no deseados.
    const payload = {
        ...form, // Usamos el spread operator para copiar todos los campos del formulario reactivo
        dependencia: form.dependencia_id?.id || form.dependencia_id, // Aseguramos que se envíe solo el ID.
    };
    delete payload.dependencia_id; // Eliminamos la clave original para evitar duplicados

    try {
        if (isEdit.value) {
            await store.updatePersona(form.id, payload);
        } else {
            await store.createPersona(payload);
        }
        closeForm();
    } catch (error) {
        // El toast de error ya se muestra desde el store
    }
};

const handleDelete = (id) => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, ¡eliminar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            store.deletePersona(id);
        }
    });
};
</script>
