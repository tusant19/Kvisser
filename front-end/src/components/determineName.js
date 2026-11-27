
function determineName() {
    let subdomain = window.location.hostname.split('.')[0];
    if (subdomain === 'kvisser') {
        return "Kvisser";
    } else if (subdomain === '192') {
        return "Kvisser";
    } else if (subdomain === 'localhost') {
        return "Kvisser";
    } else {
        subdomain = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
        return subdomain;
    }
}

export default determineName;