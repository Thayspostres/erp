/* ========= MOTOR DE TABLAS GLOBAL (LST, CAT, REL, CFG) ========= */

/**
 * 👉 Cambia de módulo / tabla activa
 * Soporta limpieza de títulos para LST_, CAT_, REL_ y CFG_
 */
/* ========= MOTOR DE RENDERIZADO UNIVERSAL ========= */
// Este archivo sirve para LST, CAT, REL y CFG en cualquier HTML

function loadModule(sheetName, element) {
    currentSheet = sheetName;

    // 1. Limpiar interfaz
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";

    document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
    if (element) element.classList.add('active');

    // 2. Título dinámico inteligente
    // const titleEl = document.getElementById('current-table-title');
    // if (titleEl) {
    //     // Limpia cualquier prefijo técnico al inicio
    //     titleEl.innerText = sheetName.replace(/^(CAT_|LST_|REL_|CFG_)/, "").replace(/_/g, ' ');
    // }
const title = document.getElementById('current-table-title');
    if (title) {
        title.innerText = sheetName.replace(" ", "").replace(/_/g, ' ');
    }
    renderSkeleton();

    // 3. Obtener datos del Cache (con validación de seguridad)
    const data = (window.APP_CACHE && window.APP_CACHE[sheetName]) ? window.APP_CACHE[sheetName] : [];

    renderData(data);
}

/* ========= ACTUALIZAR BADGES ========= */
/* ========= CONTADORES ========= */
function actualizarBadges() {
    Object.keys(CONFIG).forEach(sheet => {
        const data = Array.isArray(window.APP_CACHE?.[sheet])
            ? window.APP_CACHE[sheet]
            : [];
        updateBadge(sheet, data.length);
    });
}

/* ========= ESTRUCTURA (SKELETON) ========= */
function renderSkeleton() {
    const head = document.getElementById('table-head');
    const body = document.getElementById('table-body');
    if (!head || !body) return;

    const fields = COLUMNAS_VISIBLES[currentSheet] || [];
    const colspan = fields.length + 1;

    if (fields.length === 0) {
        head.innerHTML = "";
        body.innerHTML = `<tr><td colspan="${colspan}">⚠️ Sin configuración de columnas</td></tr>`;
        return;
    }

    head.innerHTML = fields.map(f => `
        <th style="text-align:center; position:sticky; top:0; background:#1e293b; color:white; z-index:10;">
            ${getFriendlyLabel(f)}
        </th>`).join('') + `<th style="text-align:center; position:sticky; top:0; background:#1e293b; color:white; z-index:10;">ACC</th>`;

    body.innerHTML = `<tr><td colspan="${colspan}">Cargando datos...</td></tr>`;
}

/* ========= RENDERIZADO DE DATOS ========= */

function renderData(data) {
    const body = document.getElementById('table-body');
    if (!body) return;

    const fields = COLUMNAS_VISIBLES[currentSheet] || [];
    const colspan = fields.length + 1;

    if (fields.length === 0 || !Array.isArray(data) || data.length === 0) {
        body.innerHTML = `<tr><td colspan="${colspan}" class="status-indicator danger">Sin datos</td></tr>`;
        return;
    }

    // Configuración de ID para botones
    const idFieldConfig = CONFIG[currentSheet]?.find(f => f.type === "auto")?.field;
    const idFieldForSort = idFieldConfig || "ID";

    let dataToDisplay = currentSheet.startsWith("CAT_") 
        ? [...data].sort((a, b) => String(b[idFieldForSort] ?? "").localeCompare(String(a[idFieldForSort] ?? ""), undefined, {numeric: true}))
        : [...data].reverse();

    body.innerHTML = dataToDisplay.map((row, index) => {
        const idFieldInRow = Object.keys(row).find(k => k.toUpperCase().startsWith("ID_"));
        const rowId = row[idFieldConfig] || row[idFieldInRow] || row.ID || Object.values(row)[0];
        const encoded = encodeURIComponent(JSON.stringify(row));
        
        const cells = fields.map(f => {
            let val = (row[f] !== undefined && row[f] !== null) ? row[f] : '';
            const campoConfig = CONFIG[currentSheet]?.find(c => c.field === f);

            // 1. LOOKUP (Convertir ID a Nombre)
            if (campoConfig?.type === "select" && campoConfig.source) {
                const tablaRel = window.APP_CACHE[campoConfig.source] || [];
                const reg = tablaRel.find(r => String(r[campoConfig.key]) === String(val));
                val = reg ? (reg[campoConfig.display] || val) : val;
            }

            // --- APLICACIÓN DE ESTADOS VISUALES ---

            // A. NOMBRES (Negritas)
            if (f.includes("NOMBRE")) {
                return `<td style="text-align:left; padding:10px; font-weight:bold; color:#1e293b;">${val}</td>`;
            }

            // B. COSTOS (Negritas + Subrayado + Moneda)
            const camposCosto = ["COSTO", "PRECIO", "IMPORTE", "TOTAL"];
            if (camposCosto.some(word => f.includes(word))) {
                const num = parseFloat(val) || 0;
                const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
                return `<td style="text-align:right; padding:10px; font-weight:bold; text-decoration:underline; color:#0369a1; font-family:monospace;">
                    ${fmt}
                </td>`;
            }

            // C. VIDA ÚTIL (Número + " Días")
            if (f === "VIDA_UTIL") {
                return `<td style="text-align:center; padding:10px;">${val} <span style="font-size:0.85em; color:#64748b;">días</span></td>`;
            }

            // D. IMAGEN THUMB (Ajustada al tamaño de la celda)
            if (f === "IMAGEN_THUMB") {
                return `<td style="text-align:center; padding:5px; width:80px; min-width:80px;">
                    <div style="width:100%; aspect-ratio:1/1; overflow:hidden; border-radius:4px; border:1px solid #e2e8f0;">
                        ${val ? `<img src="${val}" style="width:100%; height:100%; object-fit:cover;">` : '🚫'}
                    </div>
                </td>`;
            }

            // E. ACTIVO (Checkbox visual)
            if (f === "ACTIVO") {
                return `<td style="text-align:center;">${String(val) === "1" ? "✅" : "❌"}</td>`;
            }

            // F. FECHAS
            if (f.includes("FECHA") && val) {
                const fecha = new Date(val);
                return `<td style="text-align:center; padding:10px; font-size:0.9em;">${!isNaN(fecha) ? fecha.toLocaleDateString('es-MX') : val}</td>`;
            }

            return `<td style="text-align:left; padding:10px;">${val}</td>`;
        }).join('');

        return `
            <tr style="${index === 0 ? 'background-color:#f0f9ff;' : ''}">
                ${cells}
                <td style="text-align:center; white-space:nowrap;">
                    <button class="btn-edit" onclick="openModal('edit', JSON.parse(decodeURIComponent('${encoded}')))">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteRecord('${rowId}')" style="color:#ef4444; margin-left:10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    }).join('');
}
/* ========= RENDERIZADO DE DATOS (CON ID FLEXIBLE) ========= */
// function renderData(data) {
//     const body = document.getElementById('table-body');
//     if (!body) return;

//     const fields = COLUMNAS_VISIBLES[currentSheet] || [];
//     const colspan = fields.length + 1;

//     if (fields.length === 0 || !Array.isArray(data) || data.length === 0) {
//         const msg = fields.length === 0 ? "⚠️ Sin columnas definidas" : "Sin datos registrados";
//         body.innerHTML = `<tr><td colspan="${colspan}" class="status-indicator danger">${msg}</td></tr>`;
//         return;
//     }

//     // 1. Determinar campo de ID principal desde CONFIG
//     const idFieldConfig = CONFIG[currentSheet]?.find(f => f.type === "auto")?.field;
//     const idFieldForSort = idFieldConfig || "ID";

//     // 2. Ordenamiento inteligente (CAT_ vs Resto)
//     let dataToDisplay;
//     if (currentSheet.startsWith("CAT_")) {
//         dataToDisplay = [...data].sort((a, b) => 
//             String(b[idFieldForSort] ?? "").localeCompare(String(a[idFieldForSort] ?? ""), undefined, {numeric: true})
//         );
//     } else {
//         dataToDisplay = [...data].reverse();
//     }

//     // 3. Generar HTML
//     body.innerHTML = dataToDisplay.map((row, index) => {
        
//         // 🔥 BÚSQUEDA DE ID FLEXIBLE (Crítico para eliminar)
//         // Intentamos en este orden: 
//         // 1. El campo definido como 'auto' en CONFIG
//         // 2. Cualquier llave que empiece con 'ID_' (ej: ID_PRODUCTO)
//         // 3. El campo 'ID' a secas
//         // 4. El primer campo de la fila (como último recurso)
//         const idFieldInRow = Object.keys(row).find(k => k.toUpperCase().startsWith("ID_"));
//         const rowId = row[idFieldConfig] || row[idFieldInRow] || row.ID || row.id || Object.values(row)[0];

//         const encoded = encodeURIComponent(JSON.stringify(row));
//         const highlight = index === 0 ? 'style="background-color:#e0f2fe; border-left:5px solid #0284c7;"' : '';

//         const cells = fields.map(f => {
//             let val = (row[f] !== undefined && row[f] !== null) ? row[f] : '';

//             // Formateo SI/NO
//             if (f === "ACTIVO" || f === "ES_UNIDAD_BASE") {
//                 return `<td style="text-align:center;">${String(val) === "1" ? "✅ SI" : "❌ NO"}</td>`;
//             }

//             // Formateo IMÁGENES
//             if ((f === "IMAGEN_URL" || f === "IMAGEN_THUMB") && val) {
//                 return `<td style="text-align:center;">
//                     <img src="${val}" style="width:45px; height:45px; object-fit:cover; border-radius:5px; border:1px solid #ddd;">
//                 </td>`;
//             }

//             return `<td style="text-align:left; padding:10px;">${val}</td>`;
//         }).join('');

//         return `
//             <tr ${highlight}>
//                 ${cells}
//                 <td style="text-align:center; white-space:nowrap;">
//                     <button class="btn-edit" 
//                         onclick="openModal('edit', JSON.parse(decodeURIComponent('${encoded}')))">
//                         <i class="fas fa-edit"></i>
//                     </button>
//                     <button class="btn-delete" 
//                         onclick="deleteRecord('${rowId}')" 
//                         style="color:#ef4444; margin-left:10px; cursor:pointer;">
//                         <i class="fas fa-trash"></i>
//                     </button>
//                 </td>
//             </tr>`;
//     }).join('');

    
// }



