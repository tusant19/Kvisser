function referrerPath(fallback = "/") {
    if (typeof document === "undefined") return fallback;

    const referrer = document.referrer;
    if (!referrer) return fallback;

    try {
        const url = new URL(referrer, window.location.origin);
        if (url.origin !== window.location.origin) return fallback;
        return `${url.pathname}${url.search}${url.hash}` || fallback;
    } catch (error) {
        console.error(error);
        return fallback;
    }
}

export default referrerPath;
