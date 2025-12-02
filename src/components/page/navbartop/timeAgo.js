/**
 * Convierte una fecha ISO a un formato "hace X tiempo".
 * @param {string} dateString - La fecha en formato ISO (ej: "2024-11-30T14:20:05.123456Z").
 * @returns {string} - El tiempo transcurrido en formato legible.
 */
export function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);

    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30);
    const years = Math.round(days / 365);

    if (seconds < 60) return `hace ${seconds} segundos`;
    if (minutes < 60) return `hace ${minutes} minutos`;
    if (hours < 24) return `hace ${hours} horas`;
    if (days < 30) return `hace ${days} días`;
    if (months < 12) return `hace ${months} meses`;
    return `hace ${years} años`;
}

/**
 * Obtiene el ícono y color correspondiente al tipo de notificación.
 * @param {string} tipo - El tipo de notificación.
 * @returns {{icon: string, color: string}}
 */
export const getNotificationStyle = (tipo) => {
    switch (tipo) {
        case 'NUEVA_SOLICITUD':
            return { icon: 'ti-mail', color: 'bg-blue' };
        case 'SOLICITUD_APROBADA':
            return { icon: 'ti-circle-check', color: 'bg-green' };
        case 'SOLICITUD_RECHAZADA':
            return { icon: 'ti-circle-x', color: 'bg-red' };
        default:
            return { icon: 'ti-bell', color: 'bg-secondary' };
    }
};