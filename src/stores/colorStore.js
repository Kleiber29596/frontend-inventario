import { defineStore } from 'pinia';
import axios from 'axios';

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
       currentPage: 1, // El valor que viene del backend
    }),
    actions: {
        async fetchColores(page = 1, pageSize = 10, searchTerm = '') { // Acepta pageSize
            this.loading = true;
            try {
                // Modificación crucial: usar page_size y q
                const response = await axios.get(
                    `${BASE_URL}auxiliares/catalogo-bienes/colores?page=${page}&page_size=${pageSize}&q=${searchTerm}`
                );
                console.log(response.data);

                // Asumiendo que tu backend devuelve: { results: [...], total: 29 }
                this.colores  = response.data.results || [];
                this.totalItems  = response.data.results.total || 0;
                this.totalItems  = response.data.total || 0;
                this.totalPages  = response.data.total_pages || 1; 
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
                const response = await axios.post(`${BASE_URL}auxiliares/catalogo-bienes/colores`, color);
                // Optionally, add the new color to the list or refresh the list
                this.fetchColores(1, 10, '');
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async updateColor(id, color) {
            this.loading = true;
            try {
                const response = await axios.put(`/auxiliares/catalogo-bienes/colores/${id}`, color);
                // Optionally, update the color in the list or refresh the list
                this.fetchColores(1, 10, '');
                return response.data;
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async deleteColor(id) {
            this.loading = true;
            try {
                await axios.delete(`${BASE_URL}auxiliares/catalogo-bienes/colores/${id}`);
                // Optionally, remove the color from the list or refresh the list
                this.fetchColores(1, 10, '');
            } catch (error) {
                this.error = error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
