import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useSolicitudStore = defineStore('solicitud', {
  state: () => ({
    solicitudes: [],
    loading: false,
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    catalogs: {
      departamentos: [],
      motivos: [],
      estatus: [],
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
      this.loading = true;
      try {
        const [deptosRes, motivosRes, estatusRes] = await Promise.all([
          axios.get(`${BASE_URL}auxiliares/dependencias/select`),
          axios.get(`${BASE_URL}auxiliares/motivos/select?tipo=Solicitud`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estatus/select?tipo=Solicitud`),
        ]);

        this.catalogs.departamentos = Array.isArray(deptosRes.data) ? deptosRes.data : [];
        this.catalogs.motivos = Array.isArray(motivosRes.data) ? motivosRes.data : [];
        this.catalogs.estatus = Array.isArray(estatusRes.data) ? estatusRes.data : [];
      } catch (error) {
        console.error("Error al obtener catálogos de solicitud:", error);
        useToast().showToast('Error al cargar catálogos', 'error');
      } finally {
        this.loading = false;
      }
    },

    async createSolicitud(solicitud) {
      try {
        await axios.post(`${BASE_URL}solicitudes-bienes/crear`, solicitud);
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
      try {
        const response = await axios.get(`${BASE_URL}solicitudes-bienes/solicitudes/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error al obtener la solicitud ${id}:`, error);
        useToast().showToast('Error al obtener los detalles de la solicitud', 'error');
        throw error;
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