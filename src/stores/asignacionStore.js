import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useAsignacionStore = defineStore('asignacion', {
  state: () => ({
    asignaciones: [],
    bienes: [],
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
      estatus: [], // For assignments
      estatusBienes: [], // For assets
      motivos: [],
    },
  }),
  actions: {
    async fetchAsignaciones(page = 1, search = '') {
      this.loading = true;
      try {
        const response = await axios.get(`${BASE_URL}asignaciones/listar`, {
          params: {
            page,
            q: search,
          },

        });
        this.asignaciones = response.data.results || [];
        this.paginacion = {
          total: response.data.total,
          paginas: response.data.paginas,
          pagina_actual: response.data.pagina_actual,
          siguiente: response.data.siguiente,
          anterior: response.data.anterior,
        };
      } catch (error) {
        console.error("Error al obtener asignaciones:", error);
        this.asignaciones = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchBienes() {
      this.loading = true;
      try {
      const response = await axios.get(`${BASE_URL}bienes/para-select`);
      this.bienes = response.data;
      } catch (error) {
      console.error("Error al obtener bienes:", error);
      this.bienes = [];
      } finally {
      this.loading = false;
      }
    },

     

    async createAsignacion(asignacion) {
      this.loading = true;
      try {
        await axios.post(`${BASE_URL}asignaciones/crear`, asignacion);
        await this.fetchAsignaciones(); // Refresh list
      } catch (error) {
        console.error("Error al crear la asignación:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async updateAsignacion(id, asignacion) {
      this.loading = true;
      try {
        await axios.put(`${BASE_URL}asignaciones/actualizar/${id}`, asignacion);
        await this.fetchAsignaciones(); // Refresh list
      } catch (error) {
        console.error("Error al actualizar la asignación:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchCatalogos() {
      this.loading = true;
      try {
        const [departamentosRes, estatusAsignacionRes, estatusBienesRes, motivosRes] = await Promise.all([
          axios.get(`${BASE_URL}auxiliares/listar_dependencias`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/tipo?tipo=asignacion`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/tipo?tipo=bienes`),
          axios.get(`${BASE_URL}auxiliares/motivos?tipo=Asignacion`)
        ]);
        this.catalogs.departamentos = Array.isArray(departamentosRes.data) ? departamentosRes.data : [];
        this.catalogs.estatus       = Array.isArray(estatusAsignacionRes.data) ? estatusAsignacionRes.data : [];
        this.catalogs.estatusBienes = Array.isArray(estatusBienesRes.data) ? estatusBienesRes.data : [];
        this.catalogs.motivos = Array.isArray(motivosRes.data) ? motivosRes.data : [];
        this.catalogs.personas = []; // Personas se cargarán dinámicamente
      } catch (error) {
        console.error("Error al obtener catálogos:", error);
        this.catalogs.departamentos = [];
        this.catalogs.estatus = [];
        this.catalogs.estatusBienes = [];
        this.catalogs.motivos = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchPersonasPorDepartamento(departamentoId) {
      if (!departamentoId) {
        this.catalogs.personas = [];
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}personas/listar`, {
          params: { departamento_id: departamentoId },
        });
        this.catalogs.personas = Array.isArray(response.data) ? response.data : response.data.items || [];
      } catch (error) {
        console.error("Error al obtener personas por departamento:", error);
        this.catalogs.personas = [];
      }
    },
    
  },
});