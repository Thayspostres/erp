// loadModule(sheetName, element)// 👉 Cambia de módulo / tabla activa// 🧠 Qué hace paso a paso// 1. 📌 Guarda qué módulo estás usando

// {/* <script src="../assets/cat_config/table_cat_op.js"></script> */}

// table_cat_op.js
/* ========= CAMBIAR MODULO ========= */
function loadModule(sheetName, element) {
    currentSheet = sheetName;

    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";

    document.querySelectorAll('.module-btn')
        .forEach(b => b.classList.remove('active'));

    if (element) element.classList.add('active');

    const title = document.getElementById('current-table-title');
    if (title) {
        title.innerText = sheetName.replace("CAT_", "").replace(/_/g, ' ');
    }

    renderSkeleton();

    const data = Array.isArray(window.APP_CACHE?.[sheetName])
        ? window.APP_CACHE[sheetName]
        : [];

    renderData(data);
}


/* ========= CONTADORES ========= */
function actualizarBadges() {
    Object.keys(CONFIG).forEach(sheet => {
        const data = Array.isArray(window.APP_CACHE?.[sheet])
            ? window.APP_CACHE[sheet]
            : [];
        updateBadge(sheet, data.length);
    });
}


/* ========= TABLA ========= */
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
        body.innerHTML = `<tr><td colspan="${colspan}">⚠️ Sin columnas definidas</td></tr>`;
        return;
    }

    head.innerHTML =
        tableFields.map(f => `
            <th style="text-align:center;position:sticky;top:0;background:#1e293b;color:white;">
                ${getFriendlyLabel(f)}
            </th>
        `).join('') +
        `<th style="text-align:center;position:sticky;top:0;background:#1e293b;color:white;">ACC</th>`;

    body.innerHTML = `<tr><td colspan="${colspan}">Cargando...</td></tr>`;
}


/* ========= RENDER DATA (🔥 CON IMÁGENES) ========= */
/* ========= RENDER DATA (🔥 CON IMÁGENES E ID FLEXIBLE) ========= */
function renderData(data) {
    const body = document.getElementById('table-body');
    if (!body) return;

    const tableFields = Array.isArray(COLUMNAS_VISIBLES[currentSheet])
        ? COLUMNAS_VISIBLES[currentSheet]
        : [];

    const colspan = tableFields.length + 1;

    if (tableFields.length === 0) {
        body.innerHTML = `<tr><td colspan="${colspan}">⚠️ Sin columnas configuradas</td></tr>`;
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        body.innerHTML = `<tr><td colspan="${colspan}" class="status-indicator danger">Sin datos</td></tr>`;
        return;
    }

    // --- IDENTIFICACIÓN DEL CAMPO ID PARA EL SORT ---
    const idFieldForSort = CONFIG[currentSheet]?.find(f => f.type === "auto")?.field || "ID";

    const sortedData = [...data].sort((a, b) => {
        const valA = String(a?.[idFieldForSort] ?? "");
        const valB = String(b?.[idFieldForSort] ?? "");
        return valB.localeCompare(valA, undefined, { numeric: true });
    });

    body.innerHTML = sortedData.map((row, index) => {

        // --- TÉCNICA DE BÚSQUEDA DE ID FLEXIBLE ---
        // 1. Buscamos el campo 'auto' en CONFIG
        // 2. Si no, buscamos cualquier llave que empiece con 'ID_'
        // 3. Por último, probamos con 'ID' a secas
        const idFieldInConfig = CONFIG[currentSheet]?.find(f => f.type === "auto")?.field;
        const idFieldInRow = Object.keys(row).find(k => k.startsWith("ID_"));
        const rowId = row[idFieldInConfig] || row[idFieldInRow] || row.ID || "";

        const highlight = index === 0
            ? 'style="background-color:#e0f2fe;border-left:5px solid #0284c7;"'
            : '';

        const encoded = encodeURIComponent(JSON.stringify(row));

        const cells = tableFields.map(f => {
            let val = (row && row[f] !== undefined && row[f] !== null) ? row[f] : '';

            // ✅ Formateo de Booleanos/Activo
            if (f === "ACTIVO" || f === "ES_UNIDAD_BASE") {
                val = String(val) === "1" ? "✅ SI" : "❌ NO";
            }

            // 🔥 IMÁGENES
            if ((f === "IMAGEN_URL" || f === "IMAGEN_THUMB") && val) {
                return `<td style="text-align:center;">
                    <img src="${val}" 
                         style="width:50px;height:50px;object-fit:cover;border-radius:5px;">
                </td>`;
            }

            return `<td style="text-align:left;padding:10px;">${val}</td>`;
        }).join('');

        return `
            <tr ${highlight}>
                ${cells}
                <td style="text-align:center; white-space:nowrap;"> 
                    
                    <button class="btn-edit"
                        data-row="${encoded}"
                        onclick="openModal('edit', JSON.parse(decodeURIComponent(this.dataset.row)))">
                        <i class="fas fa-edit"></i>
                    </button>

                    <button class="btn-delete" 
                        onclick="deleteRecord('${rowId}')" 
                        style="color: #f51010; margin-left: 10px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>

                </td>
            </tr>
        `;
    }).join('');
}