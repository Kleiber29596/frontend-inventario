import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useDesincorporacionStore = defineStore('desincorporacion', {
  state: () => ({
    desincorporaciones: [],
    searchTerm: '',
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    searchTerm: '',
    catalogs: {
      personas: [],
      departamentos: [],
      estatus: [],
      bienes: [],
      motivos : [],
    },
  }),
  actions: {
    async fetchDesincorporaciones(page = 1, pageSize, search = '') {
      this.loading = true;
      try {
        const response = await axios.get(`${BASE_URL}desincorporaciones/desincorporaciones`, {
          params: {
            page,
            pageSize,
            q: search,
          },
        });
        this.desincorporaciones = response.data.results || [];
        this.asignaciones = response.data.results || [];
        this.totalItems = response.data.total || 0;
        this.totalPages = response.data.total_pages || 1;
        this.currentPage = response.data.current_page || 1;
      } catch (error) {
        console.error("Error al obtener desincorporaciones:", error);
      } finally {
        this.loading = false;
      }
    },
    async createDesincorporacion(desincorporacion) {
      this.loading = true;
      try {
        await axios.post(`${BASE_URL}desincorporaciones/crear`, desincorporacion);
        await this.fetchDesincorporaciones(); // Refresh list
        useToast().showToast('Desincorporación creada exitosamente');
      } catch (error) {
        console.error("Error al crear la desincorporación:", error);
        throw error;
        useToast().showToast('Error al crear la desincorporación', 'error');
      } finally {
        this.loading = false;
      }
    },
    async updateDesincorporacion(id, desincorporacion) {
      this.loading = true;
      try {
        await axios.put(`${BASE_URL}desincorporaciones/actualizar/${id}`, desincorporacion);
        await this.fetchDesincorporaciones(); // Refresh list
        useToast().showToast('Desincorporación actualizada exitosamente');
      } catch (error) {
        console.error("Error al actualizar la desincorporación:", error);
        throw error;
        useToast().showToast('Error al actualizar la desincorporación', 'error');
      } finally {
        this.loading = false;
      }
    },
    async fetchCatalogos() {
      this.loading = true;
      try {
        const [personasRes, departamentosRes, estatusRes, bienesRes, motivosRes] = await Promise.all([
          axios.get(`${BASE_URL}personas/select`),
          axios.get(`${BASE_URL}auxiliares/dependencias/select`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estatus/select?tipo=Desincorporacion`),
          axios.get(`${BASE_URL}bienes/para-select`), // Fetch all bienes
          axios.get(`${BASE_URL}auxiliares/motivos/select?tipo=Desincorporacion`),
          
        ]);
        this.catalogs.personas      = personasRes.data;
        this.catalogs.departamentos = departamentosRes.data;
        this.catalogs.estatus       = estatusRes.data;
        this.catalogs.bienes        = bienesRes.data;
        this.catalogs.motivos       = motivosRes.data;
      } catch (error) {
        console.error("Error al obtener catálogos:", error);
      } finally {
        this.loading = false;
      }
    },
    async cargarActa(id, file) {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('acta', file);
        await axios.post(`${BASE_URL}desincorporaciones/${id}/cargar-acta`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        await this.fetchDesincorporaciones(); // Refresh list
        useToast().showToast('Acta cargada exitosamente');
      } catch (error) {
        console.error("Error al cargar el acta:", error);
        useToast().showToast('Error al cargar el acta', 'error');
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
