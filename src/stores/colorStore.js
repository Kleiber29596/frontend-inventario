import { defineStore } from 'pinia';
import axios from 'axios';
import { useToast } from '@/stores/useToast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useColorStore = defineStore('color', {
    state: () => ({
        colores: [],
        color: null,
        loading: false,
        error: null,
        searchTerm: '',
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
    }),
    actions: {
        async fetchColores(page = 1, pageSize = 10, searchTerm = '') { // Acepta pageSize
            this.loading = true;
            try {
                // Modificación crucial: usar page_size y q
                const response = await axios.get(
                    `${BASE_URL}auxiliares/catalogo-bienes/colores`, 
                    { params: { page, page_size: pageSize, q: searchTerm } }
                );

                this.colores = response.data.results || [];
                this.totalItems = response.data.total || 0;
                this.totalPages = response.data.total_pages || 1;
                this.currentPage = response.data.current_page || 1;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        async createColor(color) {
            this.loading = true;
            try {
                const response = await axios.post(`${BASE_URL}auxiliares/catalogo-bienes/colores/crear`, color);
                await this.fetchColores(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Color creado exitosamente');
                return response.data;
            } catch (error) {
                useToast().showToast('Error al crear el color', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateColor(id, color) {
            this.loading = true;
            try {
                const response = await axios.put(`${BASE_URL}auxiliares/catalogo-bienes/colores/actualizar/${id}`, color);
                await this.fetchColores(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Color actualizado exitosamente');
                return response.data;
            } catch (error) {
                useToast().showToast('Error al actualizar el color', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteColor(id) {
            this.loading = true;
            try {
                await axios.delete(`${BASE_URL}auxiliares/catalogo-bienes/colores/eliminar/${id}`);
                await this.fetchColores(this.currentPage, 10, this.searchTerm);
                useToast().showToast('Color eliminado exitosamente');
            } catch (error) {
                useToast().showToast('Error al eliminar el color', 'error');
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
