/**
 * API do Gestor e slug da landing page cadastrada em Landing Pages.
 * Local usa a API da máquina; produção usa api.convertix.net.br.
 */
(function () {
    var host = window.location.hostname;
    var isLocal = host === "localhost" || host === "127.0.0.1";

    window.CONVERTIX_GESTOR_API = isLocal
        ? "http://localhost:5000"
        : "https://api.convertix.net.br";

    window.CONVERTIX_LANDING_SLUG = "convertix";
})();
