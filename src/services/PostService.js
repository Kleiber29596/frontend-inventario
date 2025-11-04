import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const PostService = {
    uploadActa: async (desincorporacionId, file) => {
        try {
            const formData = new FormData();
            formData.append('acta', file);

            const response = await axios.post(`${API_URL}/desincorporaciones/${desincorporacionId}/cargar-acta`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default PostService;