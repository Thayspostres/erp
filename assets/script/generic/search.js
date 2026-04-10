
// filtrarTabla() → BUSCADOR EN TIEMPO REAL
// Esto es básicamente tu filtro instantáneo de tabla.
// El usuario escribe… y las filas desaparecen o aparecen como por magia.
/* ========= BUSCADOR EN TIEMPO REAL ========= */
function filtrarTabla() {
    const input = document.getElementById("searchInput");
    if (!input) return;
    const filter = input.value.toUpperCase();
    const rows = document.querySelector("#table-body").getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        // Busca en la columna NOMBRE (usualmente la segunda, índice 1)
        const cellNombre = rows[i].getElementsByTagName("td")[1];
        if (cellNombre) {
            const textValue = cellNombre.textContent || cellNombre.innerText;
            rows[i].style.display = textValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}
