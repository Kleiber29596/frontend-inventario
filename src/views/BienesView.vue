<script setup>
// agrega onBeforeUnmount, computed, watch si no estaban
import { ref, reactive, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import axios        from 'axios';
import FooterPage   from '@/components/page/footer/Component.vue';
import HeaderPage   from '@/components/page/header/Component.vue';
import { IconEdit } from '@tabler/icons-vue'
import { Toast }    from 'bootstrap'
import Pagination   from '@/components/paginacion/paginacion.vue'
import SearchInput  from '@/components/paginacion/searchInput.vue'
const BASE_URL =    import.meta.env.VITE_BASE_URL;

// === Estado ===
const bienes = ref([]);
const showCrear = ref(false)
const categorias = ref([]);
const subcategorias = ref([]);
const tiposBien = ref([]);
const marcas = ref([]);
const estadosFisicos = ref([]);
const modelos = ref([])
const loadingCrear = ref(false);
const toastSuccess = ref(null)
const errorCrear = ref(null)

//flags paginación

// NUEVO
const loadingLista = ref(false)
const errorLista = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)


// flags para editar
const isEdit = ref(false)
const idEdit = ref(null)
const toastMessage = ref('✅ Bien creado correctamente')

// formulario reactivo
const form = reactive({
  serial_bien: '',
  serial_equipo: '',
  color: '',
  tipo_bien_id: null,
  categoria_id: null,
  marca_id: null,
  modelo_id: null,
  estado_fisico_id: null,
  medida: '',
  valor_monetario: '',
  fecha_adquisicion: '',
})

// estado inicial para limpiar/rellenar
const initialForm = {
  serial_bien: '',
  serial_equipo: '',
  color: '',
  tipo_bien_id: null,
  categoria_id: null,
  marca_id: null,
  modelo_id: null,
  estado_fisico_id: null,
  medida: '',
  valor_monetario: '',
  fecha_adquisicion: '',
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value))
)

// NUEVO: pedir datos paginados
const fetchBienes = async () => {
  loadingLista.value = true
  errorLista.value = ''
  try {
    const { data } = await axios.get(`${BASE_URL}bienes/listar`, {
      params: { page: page.value, page_size: pageSize.value, q: search.value?.trim() || '' }
    })
    bienes.value = data.results
    total.value = data.total
  } catch (e) {
    errorLista.value = 'No se pudo cargar la lista'
  } finally {
    loadingLista.value = false
  }
}


// reemplaza tu onMounted original:
onMounted(async () => {
  try {
    // Ejecutar todas las peticiones iniciales en paralelo
    const [
      , // fetchBienes se llama a través del watch inicial
      catsResponse,
      tiposBienResponse,
      marcasResponse,
      modelosResponse,
      estadosFisicosResponse,
    ] = await Promise.all([
      fetchBienes(), // Pide la primera página de bienes
      axios.get(`${BASE_URL}catalogo_bien/categorias`),
      axios.get(`${BASE_URL}catalogo_bien/tipos_bien`),
      axios.get(`${BASE_URL}catalogo_bien/marcas`),
      axios.get(`${BASE_URL}catalogo_bien/modelos`),
      axios.get(`${BASE_URL}catalogo_bien/estados_fisicos`),
  
    ]);

    categorias.value = catsResponse.data;
    tiposBien.value = tiposBienResponse.data;
    marcas.value = marcasResponse.data;
    modelos.value = modelosResponse.data;
    estadosFisicos.value = estadosFisicosResponse.data;
  } catch (error) {
    console.error("Error al obtener datos", error);
  }
})

// cuando cambie page o pageSize, vuelve a cargar
watch([page, pageSize], fetchBienes)


// helpers de navegación
const goTo = (p) => {
  if (p < 1 || p > totalPages.value) return
  page.value = p
}

// === Abrir modal limpio (Crear) ===
const abrirModal = () => {
  Object.assign(form, initialForm);
  errorCrear.value = '';
  isEdit.value = false;
  idEdit.value = null;
  toastMessage.value = '✅ Bien creado correctamente';
  showCrear.value = true;
};

const mostrarToast = () => {
  const toastEl = toastSuccess.value
  const toast = new Toast(toastEl, { delay: 4000 })
  toast.show()
}

// === Abrir modal con datos (Editar) ===
const editarBien = (bien) => {
  console.log('Editar bien:', bien);
  // Mapear los nombres de texto a los IDs correspondientes para el formulario
  const tipoBienId = tiposBien.value.find(t => t.descripcion === bien.tipo_bien)?.id ?? null;
  const categoriaId = categorias.value.find(c => c.descripcion === bien.categoria)?.id ?? null;
  const marcaId = marcas.value.find(m => m.descripcion === bien.marca)?.id ?? null;
  const modeloId = modelos.value.find(m => m.descripcion === bien.modelo)?.id ?? null;
  const estadoFisicoId = estadosFisicos.value.find(e => e.nombre === bien.estado_fisico)?.id ?? null;

  Object.assign(form, {
    serial_bien: bien.serial_bien ?? '',
    serial_equipo: bien.serial_equipo ?? '',
    color: bien.color ?? '',
    tipo_bien_id: tipoBienId,
    categoria_id: categoriaId,
    marca_id: marcaId,
    modelo_id: bien.modelo_id ?? modeloId,
    estado_fisico_id: estadoFisicoId,
    medida: bien.medida ?? '',
    valor_monetario: bien.valor_monetario ?? '',
    fecha_adquisicion: (bien.fecha_adquisicion ?? '').slice(0, 10),
  })

  errorCrear.value = ''
  isEdit.value = true
  idEdit.value = bien.id
  toastMessage.value = '✅ Bien actualizado correctamente'
  showCrear.value = true
}

// === Guardar (crear/editar) ===
const guardarBien = async () => {
  errorCrear.value = '';
  loadingCrear.value = true;

  const url = isEdit.value && idEdit.value
    ? `${BASE_URL}bienes/editar/${idEdit.value}`
    : `${BASE_URL}bienes/crear`;
  const method = isEdit.value ? 'put' : 'post';

  try {
    await axios[method](url, form);
    await fetchBienes(); // Recargar la lista

    showCrear.value = false;
    Object.assign(form, initialForm);
    mostrarToast();
  } catch (error) {
    console.error(isEdit.value ? "Error al actualizar bien" : "Error al crear bien", error);
    errorCrear.value = error.response?.data?.detail || 'Error al guardar';
  } finally {
    loadingCrear.value = false;
  }
};



// debajo de totalPages
const pageWindow = computed(() => {
  const tp = totalPages.value
  if (tp <= 5) return Array.from({ length: tp }, (_, i) => i + 1)
  const start = Math.max(1, Math.min(page.value - 2, tp - 4))
  return [start, start + 1, start + 2, start + 3, start + 4]
})


// 🔎 búsqueda
const search = ref('')

// ⌨️ ref al input para el atajo
const searchInputEl = ref(null)

// util debounce (sin librerías)
function debounce(fn, delay = 400) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}

const debouncedSearch = debounce(() => {
  page.value = 1
  fetchBienes()
}, 400)

watch(search, () => debouncedSearch())

// Asegura que los campos de ID opcionales sean null si están vacíos
watch(() => form.modelo_id, (newValue) => {
  if (newValue === '') {
    form.modelo_id = null;
  }
});


</script>

<template>
  <main class="page-wrapper">
    <!-- Page header -->
    <HeaderPage :icon="['fas', 'box']" text="Bienes" />

    <div class="page-body mt-3 mb-3">
      <div class="container-xl">
        <div class="card">
          <!-- Toast -->
          <div class="toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3"
            role="alert" aria-live="assertive" aria-atomic="true" ref="toastSuccess">
            <div class="d-flex">
              <div class="toast-body">
                {{ toastMessage }}
              </div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
                aria-label="Close"></button>
            </div>
          </div>

          <div class="alert alert-danger alert-dismissible" role="alert" v-if="errorCrear">
            <div class="d-flex">
              <div>
                ⚠️ {{ errorCrear }}
              </div>
              <a class="btn-close" data-bs-dismiss="alert" aria-label="close" @click="errorCrear = false"></a>
            </div>
          </div>

          <div class="card-header">
            <div class="row w-full">
              <div class="col">
                <p class="text-secondary m-0">Listado de Bienes</p>
              </div>
              <div class="col-md-auto col-sm-12">
                <div class="ms-auto d-flex flex-wrap btn-list">
                  
                  <!-- Componente search input -->

                  <SearchInput v-model="search" />

                  <a href="#" class="btn btn-icon" aria-label="Button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      class="icon icon-1">
                      <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                      <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                      <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    </svg>
                  </a>
                  <a href="#" class="btn btn-0" title="Agregar bien" @click.prevent="abrirModal">Agregar</a>
                </div>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-vcenter card-table table-striped">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Estado Físico</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="bien in bienes" :key="bien.id">
                  <td>{{ bien.serial_bien }}</td>
                  <td>{{ bien.tipo_bien }}</td>
                  <td>{{ bien.categoria }}</td>
                  <td>{{ bien.marca }}</td>
                  <td>{{ bien.modelo }}</td>
                  <td>{{ bien.estado_fisico }}</td>
                  <td>{{ bien.fecha_adquisicion }}</td>
                  <td>
                    <a class="btn btn-action" @click.prevent="editarBien(bien)" title="Editar">
                      <IconEdit size="20" stroke-width="1.5" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <Pagination v-model:page="page" v-model:pageSize="pageSize" :total="total" />

          </div>

        </div>

        <!-- Modal reutilizable Crear/Editar -->
        <div v-if="showCrear" class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
          <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content card">
              <div class="card-header">
                <h3 class="card-title m-0">{{ isEdit ? 'Editar bien' : 'Nuevo bien' }}</h3>
                <button type="button" class="btn-close" aria-label="Close" @click="showCrear = false"></button>
              </div>

              <div class="card-body">
                <div v-if="errorCrear" class="alert alert-danger">{{ errorCrear }}</div>

                <div class="row g-2">
                  <div class="col-md-4">
                    <label class="form-label">Serial del Bien *</label>
                    <input v-model="form.serial_bien" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Serial del Equipo</label>
                    <input v-model="form.serial_equipo" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Color</label>
                    <input v-model="form.color" class="form-control" />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Tipo de Bien *</label>
                    <select v-model="form.tipo_bien_id" class="form-select">
                      <option :value="null" disabled>Selecciona…</option>
                      <option v-for="t in tiposBien" :key="t.id" :value="t.id">{{ t.descripcion }}</option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Categoría *</label>
                    <select v-model="form.categoria_id" class="form-select">
                      <option :value="null" disabled>Selecciona…</option>
                      <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.descripcion }}</option>
                    </select>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Marca *</label>
                    <select v-model="form.marca_id" class="form-select">
                      <option :value="null" disabled>Selecciona…</option>
                      <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.descripcion }}</option>
                    </select>
                  </div>

                    <div class="col-md-4">
                    <label class="form-label">Modelo *</label>
                    <select v-model="form.modelo_id" class="form-select">
                      <option :value="null" disabled>Selecciona…</option>
                      <option v-for="m in modelos" :key="m.id" :value="m.id">{{ m.descripcion }}</option>
                    </select>
                    </div>

                    <div class="col-md-4">
                    <label class="form-label">Estado Físico *</label>
                    <select v-model="form.estado_fisico_id" class="form-select">
                      <option :value="null" disabled>Selecciona…</option>
                      <option v-for="e in estadosFisicos" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                    </select>
                    </div>

                  <div class="col-md-4">
                    <label class="form-label">Medida</label>
                    <input v-model="form.medida" type="number" class="form-control" />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Valor Monetario *</label>
                    <input v-model="form.valor_monetario" type="number" step="0.01" class="form-control" />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Fecha de adquisición *</label>
                    <input v-model="form.fecha_adquisicion" type="date" class="form-control" />
                  </div>

          
                </div>
              </div>

              <div class="card-footer d-flex gap-2 justify-content-end">
                <button class="btn btn-secondary" :disabled="loadingCrear" @click="showCrear = false">Cancelar</button>
                <button class="btn btn-primary" :disabled="loadingCrear" @click="guardarBien">
                  {{ loadingCrear ? (isEdit ? 'Guardando cambios…' : 'Guardando…') : (isEdit ? 'Guardar cambios' :
                  'Guardar') }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="showCrear" class="modal-backdrop fade show"></div>
        <!-- Fin modal -->
      </div>
    </div>

    <!-- Page footer -->
    <FooterPage />
  </main>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
}
</style>
