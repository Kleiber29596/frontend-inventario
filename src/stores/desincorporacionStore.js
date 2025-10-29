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
    },
  }),
  actions: {
    async fetchDesincorporaciones(page = 1, search = '') {
      this.loading = true;
      try {
        const response = await axios.get(`${BASE_URL}gestion/desincorporaciones/listar`, {
          params: {
            page,
            q: search,
          },
        });
        this.desincorporaciones = response.data.items;
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
        await axios.post(`${BASE_URL}gestion/desincorporaciones/crear`, desincorporacion);
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
        await axios.put(`${BASE_URL}gestion/desincorporaciones/actualizar/${id}`, desincorporacion);
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
        const [personasRes, departamentosRes, estatusRes] = await Promise.all([
          axios.get(`${BASE_URL}auxiliares/personas/listar`),
          axios.get(`${BASE_URL}auxiliares/dependencias/listar`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estatus?tipo=desincorporacion`),
        ]);
        this.catalogs.personas = personasRes.data.items;
        this.catalogs.departamentos = departamentosRes.data.items;
        this.catalogs.estatus = estatusRes.data.items;
      } catch (error) {
        console.error("Error al obtener catálogos:", error);
      } finally {
        this.loading = false;
      }
    },
    async searchBienes(query) {
        if (query.length < 2) {
            this.catalogs.bienes = [];
            return;
        }
        try {
            const response = await axios.get(`${BASE_URL}gestion/bienes/listar`, {
                params: { q: query }
            });
            this.catalogs.bienes = response.data.items;
        } catch (error) {
            console.error("Error al buscar bienes:", error);
        }
    }
  },
});
