import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useAsignacionStore = defineStore('asignacion', {
  state: () => ({
    asignaciones: [],
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
      bienes: [],
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
        this.asignaciones = response.data.items || [];
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
        const [departamentosRes, estatusAsignacionRes, estatusBienesRes] = await Promise.all([
          axios.get(`${BASE_URL}auxiliares/listar_dependencias`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/tipo?tipo=asignacion`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/tipo?tipo=bienes`),
        ]);
        this.catalogs.departamentos = departamentosRes.data;
        this.catalogs.estatus = estatusAsignacionRes.data;
        this.catalogs.estatusBienes = estatusBienesRes.data;
        this.catalogs.personas = []; // Personas se cargarán dinámicamente
      } catch (error) {
        console.error("Error al obtener catálogos:", error);
        this.catalogs.departamentos = [];
        this.catalogs.estatus = [];
        this.catalogs.estatusBienes = [];
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
        this.catalogs.personas = response.data;
      } catch (error) {
        console.error("Error al obtener personas por departamento:", error);
        this.catalogs.personas = [];
      }
    },
    async searchBienes(query) {
        if (this.catalogs.estatusBienes.length === 0) {
            await this.fetchCatalogos();
        }

        if (query.length < 2) {
            this.catalogs.bienes = [];
            return;
        }

        try {
            const estatusDisponible = this.catalogs.estatusBienes.find(e => e.descripcion && e.descripcion.toLowerCase() === 'disponible');
            const estatusId = estatusDisponible ? estatusDisponible.id : null;

            if (!estatusId) {
                console.error("ID for asset status 'Disponible' not found.");
                this.catalogs.bienes = [];
                return;
            }

            const response = await axios.get(`${BASE_URL}bienes/listar`, {
                params: { 
                    q: query, 
                    estatus_id: estatusId,
                    page: 1,
                    page_size: 10
                }
            });
            this.catalogs.bienes = response.data.items;
        } catch (error) {
            console.error("Error al buscar bienes:", error);
            this.catalogs.bienes = [];
        }
    }
  },
});