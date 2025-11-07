import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useModeloStore = defineStore('modelo', {
    state: () => ({
        modelos: [],
        modelo: null,
        marcas: [],
        loading: false,
        error: null,
        searchTerm: '',
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
    }),
    actions: {
        async fetchModelos(page = 1, pageSize = 10, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`${BASE_URL}auxiliares/catalogo-bienes/modelos?page=${page}&page_size=${pageSize}&q=${searchTerm}`);
                this.modelos = response.data.results || [];
                this.totalItems = response.data.total || 0;
                this.totalPages = response.data.total_pages || 1;
                this.currentPage = response.data.current_page || 1;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },

        async fetchModelos(page = 1, pageSize = 10, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`${BASE_URL}auxiliares/catalogo-bienes/modelos?page=${page}&page_size=${pageSize}&q=${searchTerm}`);
                this.modelos = response.data.results || [];
                this.totalItems = response.data.total || 0;
                this.totalPages = response.data.total_pages || 1;
                this.currentPage = response.data.current_page || 1;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },

        async createModelo(modelo) {
            this.loading = true;
            try {
                const response = await axios.post(`${BASE_URL}auxiliares/catalogo-bienes/modelos`, modelo);
                this.fetchModelos(1, 10, '');
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateModelo(id, modelo) {
            this.loading = true;
            try {
                const response = await axios.put(`${BASE_URL}auxiliares/catalogo-bienes/modelos/${id}`, modelo);
                this.fetchModelos(1, 10, '');
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteModelo(id) {
            this.loading = true;
            try {
                await axios.delete(`${BASE_URL}auxiliares/catalogo-bienes/modelos/${id}`);
                this.fetchModelos(1, 10, '');
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchMarcas() {
            this.loading = true;
            try {
              const response = await axios.get(`${BASE_URL}auxiliares/catalogo-bienes/marcas/select`);
              this.marcas    = response.data || [];
            } catch (error) {
              console.error("Error al obtener catálogos:", error);
              this.marcas = [];
            } finally {
              this.loading = false;
            }
          },
    },
});
