import { API_BASE_URL, DEFAULT_API_HEADERS, REQUEST_TIMEOUT_MS } from '../config';

const withTimeout = (promise, timeoutMs = REQUEST_TIMEOUT_MS) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out.')), timeoutMs);
        }),
    ]);
};

export const buildApiUrl = (path) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = async (path, options = {}) => {
    const hasBody = options.body instanceof FormData;
    const headers = {
        ...DEFAULT_API_HEADERS,
        ...(hasBody ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
    };

    const response = await withTimeout(fetch(buildApiUrl(path), {
        ...options,
        headers,
    }));

    const rawText = await response.text();
    let payload = null;

    try {
        payload = rawText ? JSON.parse(rawText) : null;
    } catch (error) {
        payload = rawText;
    }

    if (!response.ok) {
        const message =
            payload?.error ||
            payload?.message ||
            `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload;
};

export const buildImageFormData = (uri, fieldName = 'image', fileName = 'photo.jpg') => {
    const formData = new FormData();
    const extension = uri?.split('.').pop()?.toLowerCase() || 'jpg';
    const normalizedExtension = extension === 'jpg' ? 'jpeg' : extension;

    formData.append(fieldName, {
        uri,
        name: fileName,
        type: `image/${normalizedExtension}`,
    });

    return formData;
};
