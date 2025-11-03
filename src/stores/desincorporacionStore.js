import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useDesincorporacionStore = defineStore('desincorporacion', {
  state: () => ({
    desincorporaciones: [],
    paginacion: {
      total: 0,
      paginas: 0,
      pagina_actual: 1,
      siguiente: null,
      anterior: null,
    },
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
    async fetchDesincorporaciones(page = 1, search = '') {
      this.loading = true;
      try {
        const response = await axios.get(`${BASE_URL}desincorporaciones/listar`, {
          params: {
            page,
            q: search,
          },
        });
        this.desincorporaciones = response.data.results || [];
        this.paginacion = {
          total: response.data.total,
          paginas: response.data.paginas,
          pagina_actual: response.data.pagina_actual,
          siguiente: response.data.siguiente,
          anterior: response.data.anterior,
        };
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
      } catch (error) {
        console.error("Error al crear la desincorporación:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async updateDesincorporacion(id, desincorporacion) {
      this.loading = true;
      try {
        await axios.put(`${BASE_URL}desincorporaciones/actualizar/${id}`, desincorporacion);
        await this.fetchDesincorporaciones(); // Refresh list
      } catch (error) {
        console.error("Error al actualizar la desincorporación:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchCatalogos() {
      this.loading = true;
      try {
        const [personasRes, departamentosRes, estatusRes, bienesRes, motivosRes] = await Promise.all([
          axios.get(`${BASE_URL}personas/listar`),
          axios.get(`${BASE_URL}auxiliares/listar_dependencias`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/tipo?tipo=desincorporacion`),
          axios.get(`${BASE_URL}bienes/para-select`), // Fetch all bienes
          axios.get(`${BASE_URL}auxiliares/motivos?tipo=Desincorporación`),
          
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
    async uploadActaAndApprove(id, file) {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('file', file);
        // Assuming estatus_id 3 is for 'Aprobada'
        formData.append('estatus_id', 3);

        await axios.post(`${BASE_URL}desincorporaciones/upload-acta/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        await this.fetchDesincorporaciones(); // Refresh list
      } catch (error) {
        console.error("Error al adjuntar el acta y aprobar la desincorporación:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
