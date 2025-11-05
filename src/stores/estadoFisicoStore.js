import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useEstadoFisicoStore = defineStore('estadoFisico', {
    state: () => ({
        estadosFisicos: [],
        estadoFisico: null,
        loading: false,
        error: null,
        searchTerm: '',
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
    }),
    actions: {
        async fetchEstadosFisicos(page = 1, pageSize = 10, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos?page=${page}&page_size=${pageSize}&q=${searchTerm}`);
                this.estadosFisicos = response.data.results || [];
                this.totalItems = response.data.total || 0;
                this.totalPages = response.data.total_pages || 1;
                this.currentPage = response.data.current_page || 1;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createEstadoFisico(estadoFisico) {
            this.loading = true;
            try {
                const response = await axios.post(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos`, estadoFisico);
                this.fetchEstadosFisicos(1, 10, '');
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateEstadoFisico(id, estadoFisico) {
            this.loading = true;
            try {
                const response = await axios.put(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos/${id}`, estadoFisico);
                this.fetchEstadosFisicos(1, 10, '');
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteEstadoFisico(id) {
            this.loading = true;
            try {
                await axios.delete(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos/${id}`);
                this.fetchEstadosFisicos(1, 10, '');
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
