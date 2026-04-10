
function toggleConfig() {
    const submenu = document.getElementById("menu-config");
    const btn = document.getElementById("btn-config");

    // Cambia la visibilidad del submenú
    submenu.classList.toggle("show");

    // Resalta el botón principal si el menú está abierto
    if (submenu.classList.contains("show")) {
        btn.classList.add("active-config");
    } else {
        btn.classList.remove("active-config");
    }
}
