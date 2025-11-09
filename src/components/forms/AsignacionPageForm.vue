<template>
    <!-- El formulario ya no está envuelto en un modal -->
    <form @submit.prevent="handleSubmit">
        <div class="row">
            <div class="col-md-6 mb-3">
                <label for="departamento" class="form-label">Departamento</label>
                <CustomVueSelect :options="store.catalogs.departamentos" v-model="form.departamento_id"
                    placeholder="Selecciona un departamento..." label="nombre" track-by="id" />
            </div>
            <div class="col-md-6 mb-3">
                <label for="persona" class="form-label">Persona</label>
                <CustomVueSelect :options="store.catalogs.personas" v-model="form.persona_id"
                    placeholder="Selecciona una persona..." label="primer_nombre" track-by="id" />
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label for="fecha_inicio" class="form-label">Fecha de Inicio</label>
                <input type="date" class="form-control" id="fecha_inicio" v-model="form.fecha_inicio">
            </div>
            <div class="col-md-6 mb-3">
                <label for="estatus" class="form-label">Estatus</label>
                <CustomVueSelect :options="store.catalogs.estatus" v-model="form.estatus_id"
                    placeholder="Selecciona un estatus..." label="descripcion" track-by="id" />
            </div>
        </div>
        <div class="mb-3">
            <label for="motivo" class="form-label">Motivo</label>
            <CustomVueSelect :options="store.catalogs.motivos" v-model="form.motivo"
                placeholder="Selecciona un motivo..." label="descripcion" track-by="id" />
        </div>

        <hr>

        <h5>Bienes Asignados</h5>
        <div class="mb-3">
            <label for="bienes-select" class="form-label">Buscar y Agregar Bienes</label>
            <CustomVueSelect :options="store.bienes" v-model="form.bienes_id" placeholder="Selecciona bienes..."
                label="label" track-by="id" :multiple="true" />
        </div>

        <!-- Los botones ahora están en un contenedor simple -->
        <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-secondary" @click="cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="store.loading">
                <span v-if="store.loading" class="spinner-border spinner-border-sm" role="status"
                    aria-hidden="true"></span>
                Guardar
            </button>
        </div>
    </form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAsignacionStore } from '@/stores/asignacionStore';
import { useSolicitudStore } from '@/stores/solicitudStore';
import { useRoute, useRouter } from 'vue-router';
import CustomVueSelect from '@/components/select/select-vue.vue'

const store = useAsignacionStore();
const solicitudStore = useSolicitudStore();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
    // Cargar catálogos y bienes en paralelo para más eficiencia
    await Promise.all([
        store.fetchCatalogos(),
        store.fetchBienes()
    ]);

    const solicitudId = route.query.solicitud_id;
    if (solicitudId) {
        form.value.solicitud_id = solicitudId;
        try {
            // Obtenemos los datos de la solicitud
            const solicitud = await solicitudStore.fetchSolicitudById(solicitudId);
            if (solicitud) {
                // Pre-cargamos el formulario con los datos de la solicitud
                form.value.departamento_id = solicitud.departamento_solicitante;
                form.value.motivo = solicitud.motivo_solicitud;
                // El solicitante de la solicitud es la persona que recibe la asignación
                form.value.persona_id = solicitud.solicitante.persona;
            }
        } catch (error) {
            console.error("No se pudo pre-cargar el formulario desde la solicitud:", error);
        }
    }
});

const form = ref({
    id: null,
    departamento_id: '',
    persona_id: '',
    fecha_inicio: new Date().toISOString().slice(0, 10), // Valor por defecto
    fecha_fin: null,
    estatus_id: '',
    motivo: null,
    bienes_id: [],
    solicitud_id: null, // Nuevo campo para el ID de la solicitud
});

// watch(() => form.value.departamento_id, (newVal) => {
//     form.value.persona_id = '';
//     // Si el nuevo valor es un objeto (como cuando se pre-carga), usamos su ID
//     const depId = typeof newVal === 'object' && newVal !== null ? newVal.id : newVal;
//     if (depId) {
//         // Aseguramos que newVal sea el ID, no el objeto completo
//         store.fetchPersonasPorDepartamento(depId);
//     }
// });

const cancel = () => {
    router.push('/asignaciones');
};

const handleSubmit = async () => {
    if (!form.value.persona_id || !form.value.departamento_id || !form.value.fecha_inicio) {
        alert('Por favor, completa los campos requeridos.');
        return;
    }

    const formValue = form.value;

    const payload = {
        departamento_id: formValue.departamento_id?.id,
        persona_id: formValue.persona_id?.id,
        estatus_id: formValue.estatus_id?.id,
        fecha_inicio: formValue.fecha_inicio,
        fecha_fin: formValue.fecha_fin,
        motivo: formValue.motivo?.id,
        solicitud_id: formValue.solicitud_id, // Incluimos el ID de la solicitud
        bienes: formValue.bienes_id.map(bien => ({
            bien_id: bien.id,
            condicion_retorno: ""
        }))
    };

    try {
        const response = await store.createAsignacion(payload);
        if (response) {
            router.push('/asignaciones'); // Redirigir a la lista de asignaciones
        }
    } catch (error) {
        alert('Ocurrió un error al guardar la asignación.');
        console.error(error);
    }
};
</script>