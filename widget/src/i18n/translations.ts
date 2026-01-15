export const translations = {
    en: {
        title: "Your opinion",
        success: "Feedback sent successfully!",
        rateLimit: "Too many requests. Please wait.",
        error: "Connection failed. Please try again.",
        commentPlaceholder: "Comment...",
        submit: "Send",
        retry: "Retry",
        cancel: "Cancel",
    },
    es: {
        title: "Tu opinión",
        success: "¡Comentario enviado!",
        rateLimit: "Demasiadas solicitudes. Espera por favor.",
        error: "Fallo de conexión. Intenta de nuevo.",
        commentPlaceholder: "Comentario...",
        submit: "Enviar",
        retry: "Reintentar",
        cancel: "Cancelar",
    },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
