export const translations = {
    en: {
        title: "Your opinion",
        success: "Feedback sent successfully!",
        rateLimit: "Too many requests. Please wait.",
        error: "Connection failed. Please try again.",
        clientError: "Please check your input and try again.",
        serverError: "Server issue. Please try again later.",
        connectivityError: "No internet connection. Check your connection and retry.",
        unexpectedError: "Something went wrong. Please try again.",
        ratingError: "Rating must be between 1 and 5.",
        commentError: "Comment is too long (max 1000 characters).",
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
        clientError: "Por favor, revisa tu entrada e intenta de nuevo.",
        serverError: "Problema del servidor. Intenta de nuevo más tarde.",
        connectivityError: "Sin conexión a internet. Verifica tu conexión y reintenta.",
        unexpectedError: "Algo salió mal. Intenta de nuevo.",
        ratingError: "La calificación debe estar entre 1 y 5.",
        commentError: "El comentario es demasiado largo (máx. 1000 caracteres).",
        commentPlaceholder: "Comentario...",
        submit: "Enviar",
        retry: "Reintentar",
        cancel: "Cancelar",
    },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
