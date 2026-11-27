let siteBaseUrl = "";
let subdomain = window.location.hostname.split('.')[0];
if (subdomain === 'kvisser') {
    siteBaseUrl = "https://kvisser.santtu.uk";
} else if (subdomain === '192') {
    siteBaseUrl = "http://192.168.68.100:5173";
} else if (subdomain === 'kysely') {
    siteBaseUrl = "https://kysely.santtu.uk";
} else if (subdomain === 'localhost') {
    siteBaseUrl = "http://localhost:5173";
}

if (siteBaseUrl === "") {
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
}

export default siteBaseUrl;