export interface Feedback {
    projectId: string;
    userId: string;
    rating: number;
    comment?: string;
    deviceInfo: {
        userAgent: string;
        url: string;
    };
    timestamp: string;
}

export interface SDKConfig {
    projectId: string;
    apiKey: string;
    apiEndpoint?: string;
    debug?: boolean;
    locale?: "en" | "es";
    theme?: {
        primaryColor?: string;
    };
    onSuccess?: (feedback: Feedback) => void;
    onError?: (error: Error) => void;
}
