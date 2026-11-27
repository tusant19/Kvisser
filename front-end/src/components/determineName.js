
function determineName() {
    let subdomain = window.location.hostname.split('.')[0];
    console.log("Subdomain: " + subdomain);
    if (subdomain === 'kvisser') {
        return "Kvisser";
    } else if (subdomain === '192') {
        return "Kvisser";
    } else if (subdomain === 'localhost') {
        return "Kvisser";
    } else {
        return subdomain;
    }
}

export default determineName;