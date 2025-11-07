import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useEstadoFisicoStore = defineStore('estadoFisico', {
    state: () => ({
        estadosFisicos: [],
        estadoFisico: null,
        loading: false,
        searchTerm: '',
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
    }),
    actions: {
        async fetchEstadosFisicos(page = 1, pageSize = 10, searchTerm = '') {
            this.loading = true;
            try {
                const response = await axios.get(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos`, {
                    params: { page, page_size: pageSize, q: searchTerm }
                });
                this.estadosFisicos = response.data.results || [];
                this.totalItems = response.data.total || 0;
                this.totalPages = response.data.total_pages || 1;
                this.currentPage = response.data.current_page || 1;
            } catch (error) {
                useToast().showToast('Error al obtener los estados físicos', 'error');
            } finally {
                this.loading = false;
            }
        },
        async createEstadoFisico(estadoFisico) {
            this.loading = true;
            try {
                const response = await axios.post(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos`, estadoFisico);
                await this.fetchEstadosFisicos(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Estado físico creado exitosamente');
                return response.data;
            } catch (error) {
                useToast().showToast('Error al crear el estado físico', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateEstadoFisico(id, estadoFisico) {
            this.loading = true;
            try {
                const response = await axios.put(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos/${id}`, estadoFisico);
                await this.fetchEstadosFisicos(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Estado físico actualizado exitosamente');
                return response.data;
            } catch (error) {
                useToast().showToast('Error al actualizar el estado físico', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteEstadoFisico(id) {
            this.loading = true;
            try {
                await axios.delete(`${BASE_URL}auxiliares/catalogo-bienes/estados_fisicos/${id}`);
                await this.fetchEstadosFisicos(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Estado físico eliminado exitosamente');
            } catch (error) {
                useToast().showToast('Error al eliminar el estado físico', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
