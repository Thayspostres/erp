// loadModule(sheetName, element)// 👉 Cambia de módulo / tabla activa// 🧠 Qué hace paso a paso// 1. 📌 Guarda qué módulo estás usando
/* ========= CAMBIARMODULO ========= */
function loadModule(sheetName, element) {
    currentSheet = sheetName;

    // Limpiar buscador al cambiar de tabla
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";

    document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
    if (element) element.classList.add('active');
    document.getElementById('current-table-title').innerText = sheetName.replace('LST_', '').replace(/_/g, ' ');

    renderSkeleton();
    const data = window.APP_CACHE[sheetName] || [];
    renderData(data);
}

/* ========= CONTADORES ========= */
function actualizarBadges() {
    Object.keys(CONFIG).forEach(sheet => {
        const data = window.APP_CACHE[sheet] || [];
        updateBadge(sheet, data.length);
    });
}


// .......................................................................................................

/* ========= TABLA (SKELETON) ========= */
/* ========= TABLA (SKELETON) ========= */
function renderSkeleton() {
    const head = document.getElementById('table-head');
    const body = document.getElementById('table-body');
    if (!head || !body) return;

    const tableFields = Array.isArray(COLUMNAS_VISIBLES[currentSheet])
        ? COLUMNAS_VISIBLES[currentSheet]
        : [];

    const colspan = tableFields.length + 1;

    if (tableFields.length === 0) {
        head.innerHTML = "";
        body.innerHTML = `<tr><td colspan="${colspan}">⚠️ Sin configuración de columnas</td></tr>`;
        return;
    }

    head.innerHTML = tableFields
        .map(f => `<th style="text-align:center; position:sticky; top:0; background:#1e293b; color:white; z-index:10;">
            ${getFriendlyLabel(f)}
        </th>`).join('')
        + `<th style="text-align:center; position:sticky; top:0; background:#1e293b; color:white; z-index:10;">ACC</th>`;

    body.innerHTML = `<tr><td colspan="${colspan}">Cargando datos...</td></tr>`;
}

/* ========= TABLA (RENDERIZADO DE DATOS) ========= */
function renderData(data) {
    const body = document.getElementById('table-body');
    if (!body) return;

    const tableFields = Array.isArray(COLUMNAS_VISIBLES[currentSheet])
        ? COLUMNAS_VISIBLES[currentSheet]
        : [];

    const colspan = tableFields.length + 1;

    if (tableFields.length === 0) {
        body.innerHTML = `<tr><td colspan="${colspan}">⚠️ Sin columnas definidas</td></tr>`;
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        body.innerHTML = `<tr><td colspan="${colspan}" class="status-indicator danger">Sin datos registrados</td></tr>`;
        return;
    }

    // 🔥 1. Invertimos para ver lo más nuevo arriba
    const dataDisplay = [...data].reverse();

    body.innerHTML = dataDisplay.map((row, index) => {
        
        // 🔥 2. IDENTIFICACIÓN DINÁMICA DEL ID (Crítico para que Eliminar funcione)
        // Buscamos en este orden: campo 'auto' en CONFIG, luego cualquier llave que empiece con 'ID_', luego 'ID'
        const idFieldInConfig = CONFIG[currentSheet]?.find(f => f.type === "auto")?.field;
        const idFieldInRow = Object.keys(row).find(k => k.startsWith("ID_"));
        const rowId = row[idFieldInConfig] || row[idFieldInRow] || row.ID || "";

        const highlight = index === 0
            ? 'style="background-color:#e0f2fe; border-left:5px solid #0284c7;"'
            : '';

        const encodedData = encodeURIComponent(JSON.stringify(row));

        const cells = tableFields.map(f => {
            let val = (row && row[f] !== undefined && row[f] !== null) ? row[f] : '';
            if (f === "ACTIVO" || f === "ES_UNIDAD_BASE") {
                val = String(val) === "1" ? "✅ SI" : "❌ NO";
            }
            return `<td style="text-align:left; padding:10px;">${val}</td>`;
        }).join('');

        return `
            <tr ${highlight}>
                ${cells}
                <td style="text-align:center; white-space:nowrap;">
                    
                    <button class="btn-edit" 
                        data-row="${encodedData}"
                        onclick="openModal('edit', JSON.parse(decodeURIComponent(this.dataset.row)))">
                        <i class="fas fa-edit"></i>
                    </button>

                    <button class="btn-delete" 
                        onclick="deleteRecord('${rowId}')" 
                        style="color: #050505fd; margin-left: 10px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>

                </td>
            </tr>`;
    }).join('');
}