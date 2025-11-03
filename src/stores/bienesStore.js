import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useBienesStore = defineStore('bienes', {
  state: () => ({
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
      categorias: [],
      subcategorias: [],
      tiposBien: [],
      marcas: [],
      estadosFisicos: [],
      modelos: [],
      colores: [],
      estatus: [],
    },
  }),
  actions: {
    async fetchBienes(page = 1, search = '') {
      this.loading = true;
      try {
        const response = await axios.get(`${BASE_URL}bienes/listar`, {
          params: {
            page,
            q: search,
          },
        });
        this.bienes = response.data.results || [];
        this.paginacion = {
          total: response.data.total,
          paginas: response.data.paginas,
          pagina_actual: response.data.pagina_actual,
          siguiente: response.data.siguiente,
          anterior: response.data.anterior,
        };
      } catch (error) {
        console.error("Error al obtener bienes:", error);
        this.bienes = [];
      } finally {
        this.loading = false;
      }
    },

    async createBien(bien) {
      this.loading = true;
      try {
        await axios.post(`${BASE_URL}bienes/crear`, bien);
        await this.fetchBienes(); // Refresh list
      } catch (error) {
        console.error("Error al crear el bien:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateBien(id, bien) {
      this.loading = true;
      try {
        await axios.put(`${BASE_URL}bienes/editar/${id}`, bien);
        await this.fetchBienes(); // Refresh list
      } catch (error) {
        console.error("Error al actualizar el bien:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async catalogos_bienes() {
      if (this.catalogs.tiposBien.length > 0) return;
      this.loading = true;
      try {
        const [
          catsResponse,
          tiposBienResponse,
          marcasResponse,
          modelosResponse,
          estadosFisicosResponse,
          coloresResponse,
          estatusResponse,
        ] = await Promise.all([
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/categorias`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/tipos_bien`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/marcas`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/modelos`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/colores`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/tipo?tipo=bienes`),

        ]);

        this.catalogs.categorias = catsResponse.data;
        this.catalogs.tiposBien = tiposBienResponse.data;
        this.catalogs.marcas = marcasResponse.data;
        this.catalogs.modelos = modelosResponse.data;
        this.catalogs.estadosFisicos = estadosFisicosResponse.data;
        this.catalogs.colores = coloresResponse.data;
        this.catalogs.estatus = estatusResponse.data;
      } catch (error) {
        console.error("Error al obtener catálogos de bienes:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});