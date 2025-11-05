import { defineStore } from 'pinia';
import axios from '@/services/PostService';

export const useCategoriaStore = defineStore('categoria', {
    state: () => ({
        categorias: [],
        categoria: null,
        loading: false,
        error: null,
        searchTerm: '',
        paginacion: {
            total: 0,
            paginas: 1,
            pagina_actual: 1,
            anterior: false,
            siguiente: false,
        },
    }),
    actions: {
        async fetchCategorias(page = 1, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`/auxiliares/catalogo-bienes/categorias?page=${page}&search=${searchTerm}`);
                this.categorias = response.data.data;
                this.paginacion = response.data.paginacion;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createCategoria(categoria) {
            this.loading = true;
            try {
                const response = await axios.post('/auxiliares/catalogo-bienes/categorias', categoria);
                // Optionally, add the new category to the list or refresh the list
                this.fetchCategorias(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateCategoria(id, categoria) {
            this.loading = true;
            try {
                const response = await axios.put(`/auxiliares/catalogo-bienes/categorias/${id}`, categoria);
                // Optionally, update the category in the list or refresh the list
                this.fetchCategorias(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteCategoria(id) {
            this.loading = true;
            try {
                await axios.delete(`/auxiliares/catalogo-bienes/categorias/${id}`);
                // Optionally, remove the category from the list or refresh the list
                this.fetchCategorias(this.paginacion.pagina_actual, this.searchTerm);
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
