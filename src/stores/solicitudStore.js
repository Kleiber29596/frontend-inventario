import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useSolicitudStore = defineStore('solicitud', {
  state: () => ({
    solicitudes: [],
    solicitudSeleccionada: null, // Para el modal de detalles
    loading: false,
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    catalogs: {
      departamentos: [],
      motivos: [],
      estatus: [],
      personas: [],
    },
  }),
  actions: {
    async fetchSolicitudes(page = 1, pageSize = 10, search = '') {
      this.loading = true;
      try {
        const response = await axios.get(`${BASE_URL}solicitudes-bienes/solicitudes`, {
          params: { page, pageSize, q: search },
        });
        this.solicitudes = response.data.results || [];
        this.totalItems = response.data.total || 0;
        this.totalPages = response.data.total_pages || 1;
        this.currentPage = response.data.current_page || 1;
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
        this.solicitudes = [];
        useToast().showToast('Error al cargar las solicitudes', 'error');
      } finally {
        this.loading = false;
      }
    },

    async fetchCatalogos() {
      try {
        // Ahora solo cargamos los catálogos que no dependen del tipo de solicitud
        const [deptosRes, estatusRes] = await Promise.all([
          axios.get(`${BASE_URL}auxiliares/dependencias/select`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estatus/select?tipo=Solicitud`),
        ]);

        this.catalogs.departamentos = Array.isArray(deptosRes.data) ? deptosRes.data : [];
        this.catalogs.estatus = Array.isArray(estatusRes.data) ? estatusRes.data : [];
      } catch (error) {
        console.error("Error al obtener catálogos de solicitud:", error);
        useToast().showToast('Error al cargar catálogos', 'error');
      }
    },

    async fetchMotivosPorTipo(tipo) {
      if (!tipo) {
        this.catalogs.motivos = [];
        return;
      }
      try {
        // El tipo de motivo en el backend es 'Asignacion' o 'Desincorporacion' (primera letra mayúscula)
        const tipoMotivo = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
        const response = await axios.get(`${BASE_URL}auxiliares/motivos/select?tipo=${tipoMotivo}`);
        this.catalogs.motivos = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error(`Error al obtener motivos para ${tipo}:`, error);
        this.catalogs.motivos = [];
        useToast().showToast('Error al cargar los motivos', 'error');
      }
    },

    async fetchPersonasPorDepartamento(departamentoId) {
      if (!departamentoId) {
        this.catalogs.personas = [];
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}personas/por-departamento/${departamentoId}`);
        console.log("Respuesta de personas por departamento:", response);
        this.catalogs.personas = Array.isArray(response.data) ? response.data : response.data.items || [];
      } catch (error) {
        console.error("Error al obtener personas por departamento:", error);
        this.catalogs.personas = [];
        useToast().showToast('Error al cargar los usuarios', 'error');
      }
    },

    async createSolicitud(solicitud) {
      try {
         // Buscamos el ID del estatus "Pendiente" en los catálogos ya cargados.
        const estatusPendiente = this.catalogs.estatus.find(e => e.descripcion === 'Pendiente' && e.tipo_estatus === 'Solicitud');
        // Creamos una copia del objeto de solicitud para no mutar el original.
        const payload = { ...solicitud };

        // Si encontramos el estatus "Pendiente", lo asignamos por defecto.
        if (estatusPendiente) payload.estatus_id = estatusPendiente.id;
        await axios.post(`${BASE_URL}solicitudes-bienes/crear`, payload);
        useToast().showToast('Solicitud creada exitosamente');
        await this.fetchSolicitudes();
      } catch (error) {
        console.error("Error al crear la solicitud:", error);
        useToast().showToast('Error al crear la solicitud', 'error');
        throw error;
      }
    },

    async updateSolicitud(id, solicitud) {
      try {
        await axios.put(`${BASE_URL}solicitudes-bienes/actualizar/${id}`, solicitud);
        useToast().showToast('Solicitud actualizada exitosamente');
        await this.fetchSolicitudes();
      } catch (error) {
        console.error("Error al actualizar la solicitud:", error);
        useToast().showToast('Error al actualizar la solicitud', 'error');
        throw error;
      }
    },

    async deleteSolicitud(id) {
      try {
        await axios.delete(`${BASE_URL}solicitudes-bienes/eliminar/${id}`);
        useToast().showToast('Solicitud eliminada exitosamente');
        await this.fetchSolicitudes();
      } catch (error) {
        console.error("Error al eliminar la solicitud:", error);
        useToast().showToast('Error al eliminar la solicitud', 'error');
        throw error;
      }
    },

    async fetchSolicitudById(id) {
      this.loading = true;
      this.solicitudSeleccionada = null;
      try {
        const response = await axios.get(`${BASE_URL}solicitudes-bienes/solicitudes/${id}`);
        this.solicitudSeleccionada = response.data;
        return this.solicitudSeleccionada; // Devolvemos por si se necesita en el componente
      } catch (error) {
        console.error(`Error al obtener la solicitud ${id}:`, error);
        useToast().showToast('Error al obtener los detalles de la solicitud', 'error');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async aprobarSolicitud(id) {
      this.loading = true;
      try {
        await axios.put(`${BASE_URL}solicitudes-bienes/${id}/aprobar`);
        useToast().showToast('Solicitud aprobada exitosamente');
        await this.fetchSolicitudes();
      } catch (error) {
        console.error("Error al aprobar la solicitud:", error);
        useToast().showToast('Error al aprobar la solicitud', 'error');
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});