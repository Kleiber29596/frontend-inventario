import { defineStore } from 'pinia';
import axios from '@/services/PostService';

export const useMotivoStore = defineStore('motivo', {
    state: () => ({
        motivos: [],
        motivo: null,
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
        async fetchMotivos(page = 1, searchTerm = '', tipo = null) {
            this.loading = true;
            try {
                let url = `/auxiliares/motivos?page=${page}&search=${searchTerm}`;
                if (tipo) {
                    url += `&tipo=${tipo}`;
                }
                const response = await axios.get(url);
                this.motivos = response.data.data;
                this.paginacion = response.data.paginacion;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        },
        // Placeholder for createMotivo, updateMotivo, deleteMotivo if they are added later
        async createMotivo(motivo) {
            console.warn('createMotivo action not implemented for Motivo model.');
            // Example: const response = await axios.post('/auxiliares/motivos', motivo);
            // this.fetchMotivos(this.paginacion.pagina_actual, this.searchTerm);
            // return response.data;
        },
        async updateMotivo(id, motivo) {
            console.warn('updateMotivo action not implemented for Motivo model.');
            // Example: const response = await axios.put(`/auxiliares/motivos/${id}`, motivo);
            // this.fetchMotivos(this.paginacion.pagina_actual, this.searchTerm);
            // return response.data;
        },
        async deleteMotivo(id) {
            console.warn('deleteMotivo action not implemented for Motivo model.');
            // Example: await axios.delete(`/auxiliares/motivos/${id}`);
            // this.fetchMotivos(this.paginacion.pagina_actual, this.searchTerm);
        },
    },
});
