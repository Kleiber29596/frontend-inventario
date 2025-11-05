import { defineStore } from 'pinia';
import axios from '@/services/PostService';

export const useColorStore = defineStore('color', {
    state: () => ({
        colores: [],
        color: null,
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
        async fetchColores(page = 1, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`/auxiliares/catalogo-bienes/colores?page=${page}&search=${searchTerm}`);
                this.colores = response.data.data;
                this.paginacion = response.data.paginacion;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        // Placeholder for createColor, updateColor, deleteColor if they are added later
        async createColor(color) {
            console.warn('createColor action not implemented for Color model.');
            // Example: const response = await axios.post('/auxiliares/catalogo-bienes/colores', color);
            // this.fetchColores(this.paginacion.pagina_actual, this.searchTerm);
            // return response.data;
        },
        async updateColor(id, color) {
            console.warn('updateColor action not implemented for Color model.');
            // Example: const response = await axios.put(`/auxiliares/catalogo-bienes/colores/${id}`, color);
            // this.fetchColores(this.paginacion.pagina_actual, this.searchTerm);
            // return response.data;
        },
        async deleteColor(id) {
            console.warn('deleteColor action not implemented for Color model.');
            // Example: await axios.delete(`/auxiliares/catalogo-bienes/colores/${id}`);
            // this.fetchColores(this.paginacion.pagina_actual, this.searchTerm);
        },
    },
});
