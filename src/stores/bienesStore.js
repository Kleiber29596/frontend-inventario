import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useBienesStore = defineStore('bienes', {
  state: () => ({
    bienes: [],
    bienesAsignados: [], // Para el formulario de desincorporación
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
        const response = await axios.get(`${BASE_URL}bienes/bienes`, {
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

    async fetchBienesAsignadosPorDepartamento(departamentoId) {
      if (!departamentoId) {
        this.bienesAsignados = [];
        return;
      }
      this.loading = true;
      try {
        const response = await axios.get(`${BASE_URL}bienes/devueltos-por-departamento/${departamentoId}`);
        this.bienesAsignados = response.data || [];
      } catch (error) {
        console.error("Error al obtener bienes asignados:", error);
        this.bienesAsignados = [];
        useToast().showToast('Error al cargar los bienes del departamento', 'error');
      } finally {
        this.loading = false;
      }
    },

    async createBien(bien) {
      this.loading = true;
      try {
        await axios.post(`${BASE_URL}bienes/crear`, bien);
        await this.fetchBienes(1, 10, ''); // Refresh list
        useToast().showToast('Bien creado exitosamente');
      } catch (error) {
        console.error("Error al crear el bien:", error);
        useToast().showToast('Error al crear el bien', 'error');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createBienesEnLote(payload) {
      this.loading = true;
      try {
        await axios.post(`${BASE_URL}bienes/crear-lote/`, payload);
        await this.fetchBienes(1, 10, ''); // Refresca la lista para mostrar los nuevos bienes
        useToast().showToast('Lote de bienes creado exitosamente');
      } catch (error) {
        console.error("Error al crear el lote de bienes:", error);
        const errorMessage = error.response?.data?.detail || 'Error al crear el lote de bienes';
        useToast().showToast(errorMessage, 'error');
        throw error; // Propaga el error para que el formulario pueda manejarlo
      } finally {
        this.loading = false;
      }
    },

    async updateBien(id, bien) {
      this.loading = true;
      try {
        await axios.put(`${BASE_URL}bienes/editar/${id}`, bien);
        await this.fetchBienes(1, 10, ''); // Refresh list
        useToast().showToast('Bien actualizado exitosamente');
      } catch (error) {
        console.error("Error al actualizar el bien:", error);
        useToast().showToast('Error al actualizar el bien', 'error');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBienById(id) {
      try {
        const response = await axios.get(`${BASE_URL}bienes/bienes/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error al obtener el bien ${id}:`, error);
        throw error;
      }
    },

    async fetchBienById(id) {
      try {
        const response = await axios.get(`${BASE_URL}bienes/bienes/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error al obtener el bien ${id}:`, error);
        throw error;
      }
    },

    async setupEditBien(id) {
      const [_, bienData] = await Promise.all([this.catalogos_bienes(), this.fetchBienById(id)]);
      return bienData;
    },

   
    async catalogos_bienes() {
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
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/categorias/select`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/tipos_bien/select`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/marcas/select`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/modelos/select`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos/select`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/colores/select`),
          axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estatus/select?tipo=Bienes`),

        ]);

        // --- APLICA LA LÓGICA DEFENSIVA AQUÍ ---
        this.catalogs.categorias = Array.isArray(catsResponse.data) ? catsResponse.data : [];
        this.catalogs.tiposBien = Array.isArray(tiposBienResponse.data) ? tiposBienResponse.data : [];
        this.catalogs.marcas = Array.isArray(marcasResponse.data) ? marcasResponse.data : [];
        this.catalogs.modelos = Array.isArray(modelosResponse.data) ? modelosResponse.data : [];
        this.catalogs.estadosFisicos = Array.isArray(estadosFisicosResponse.data) ? estadosFisicosResponse.data : [];
        this.catalogs.colores = Array.isArray(coloresResponse.data) ? coloresResponse.data : [];
        this.catalogs.estatus = Array.isArray(estatusResponse.data) ? estatusResponse.data : [];
      } catch (error) {
        console.error("Error al obtener catálogos de bienes:", error);
        // Asegurarse de que los catálogos sean arrays vacíos en caso de error
        Object.keys(this.catalogs).forEach(key => {
          this.catalogs[key] = [];
        });
      } finally {
        this.loading = false;
      }
    },

  },
});
