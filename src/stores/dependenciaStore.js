import { defineStore } from 'pinia';
import axios from '@/services/PostService';

export const useDependenciaStore = defineStore('dependencia', {
    state: () => ({
        dependencias: [],
        dependencia: null,
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
        async fetchDependencias(page = 1, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`/auxiliares/listar_dependencias?page=${page}&search=${searchTerm}`);
                this.dependencias = response.data.data;
                this.paginacion = response.data.paginacion;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createDependencia(dependencia) {
            console.warn('createDependencia action not explicitly defined in API for Dependencia model.');
            // Assuming a POST endpoint might be /auxiliares/dependencia or similar
            // try {
            //     const response = await axios.post('/auxiliares/dependencia', dependencia);
            //     this.fetchDependencias(this.paginacion.pagina_actual, this.searchTerm);
            //     return response.data;
            // } catch (error) {
            //     this.error = error;
            //     throw error;
            // }
        },
        async updateDependencia(id, dependencia) {
            this.loading = true;
            try {
                const response = await axios.put(`/auxiliares/dependencia/${id}`, dependencia);
                this.fetchDependencias(this.paginacion.pagina_actual, this.searchTerm);
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteDependencia(id) {
            console.warn('deleteDependencia action not explicitly defined in API for Dependencia model.');
            // Assuming a DELETE endpoint might be /auxiliares/dependencia/{id} or similar
            // try {
            //     await axios.delete(`/auxiliares/dependencia/${id}`);
            //     this.fetchDependencias(this.paginacion.pagina_actual, this.searchTerm);
            // } catch (error) {
            //     this.error = error;
            //     throw error;
            // }
        },
    },
});
