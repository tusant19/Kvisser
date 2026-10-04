let siteBaseUrl = "";


if (import.meta.env.DEV) {
    if (import.meta.env.VITE_API_DEV_BASE_URL != null) {
        siteBaseUrl = import.meta.env.VITE_DEV_SITE_BASE_URL;
    }
}
else {
    if (import.meta.env.VITE_API_PROD_BASE_URL != null) {
        siteBaseUrl = import.meta.env.VITE_SITE_BASE_URL;
    }
}

export default siteBaseUrl;