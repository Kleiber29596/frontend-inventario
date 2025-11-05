import { defineStore } from 'pinia';
import axios from '@/services/PostService';

export const useModeloStore = defineStore('modelo', {
    state: () => ({
        modelos: [],
        modelo: null,
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
        async fetchModelos(page = 1, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`/auxiliares/catalogo-bienes/modelos?page=${page}&search=${searchTerm}`);
                this.modelos = response.data.data;
                this.paginacion = response.data.paginacion;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createModelo(modelo) {
            this.loading = true;
            try {
                const response = await axios.post('/auxiliares/catalogo-bienes/modelos', modelo);
                this.fetchModelos(this.paginacion.pagina_actual, this.searchTerm);
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
                const response = await axios.put(`/auxiliares/catalogo-bienes/modelos/${id}`, modelo);
                this.fetchModelos(this.paginacion.pagina_actual, this.searchTerm);
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
                await axios.delete(`/auxiliares/catalogo-bienes/modelos/${id}`);
                this.fetchModelos(this.paginacion.pagina_actual, this.searchTerm);
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
