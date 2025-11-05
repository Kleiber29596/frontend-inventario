import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useDependenciaStore = defineStore('dependencia', {
    state: () => ({
        dependencias: [],
        dependencia: null,
        loading: false,
        error: null,
        searchTerm: '',
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
    }),
    actions: {
        async fetchDependencias(page = 1, pageSize = 10, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`${BASE_URL}auxiliares/listar_dependencias?page=${page}&page_size=${pageSize}&q=${searchTerm}`);
                this.dependencias = response.data.results || [];
                this.totalItems = response.data.total || 0;
                this.totalPages = response.data.total_pages || 1;
                this.currentPage = response.data.current_page || 1;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createDependencia(dependencia) {
            this.loading = true;
            try {
                const response = await axios.post(`${BASE_URL}auxiliares/crear_dependencia`, dependencia);
                this.fetchDependencias(1, 10, '');
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateDependencia(id, dependencia) {
            this.loading = true;
            try {
                const response = await axios.put(`${BASE_URL}auxiliares/editar_dependencia/${id}`, dependencia);
                this.fetchDependencias(1, 10, '');
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteDependencia(id) {
            this.loading = true;
            try {
                await axios.delete(`${BASE_URL}auxiliares/eliminar_dependencia/${id}`);
                this.fetchDependencias(1, 10, '');
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
