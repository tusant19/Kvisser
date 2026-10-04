
let apiBaseUrl = "";



if (import.meta.env.DEV) {
    if (import.meta.env.VITE_API_DEV_BASE_URL != null) {
        apiBaseUrl = import.meta.env.VITE_API_DEV_BASE_URL;
    }
}
else {
    if (import.meta.env.VITE_API_PROD_BASE_URL != null) {
        apiBaseUrl = import.meta.env.VITE_API_PROD_BASE_URL;
    }
}

export default apiBaseUrl;