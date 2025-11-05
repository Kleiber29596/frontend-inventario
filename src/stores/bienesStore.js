import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useBienesStore = defineStore('bienes', {
  state: () => ({
    bienes: [],
    loading: false,
    searchTerm: '',
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
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
    async fetchBienes(page = 1, pageSize = 10, searchTerm = '') {
      this.loading = true;
      try {
        const response = await axios.get(`${BASE_URL}bienes/listar`, {
          params: {
            page,
            page_size: pageSize,
            q: searchTerm,
          },
        });
        this.bienes = response.data.results || [];
        this.totalItems = response.data.total || 0;
        this.totalPages = response.data.total_pages || 1;
        this.currentPage = response.data.current_page || 1;
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
        await this.fetchBienes(1, 10, ''); // Refresh list
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
        await this.fetchBienes(1, 10, ''); // Refresh list
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