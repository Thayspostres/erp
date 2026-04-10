 // // // <script src="../assets/script/module_pages/xx.js"></script>
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzctPnBEK3mRXkqJQOlE7hDSbKstnBzpqc1LWkSnLsylKicbri6kQFhqtnbcI8STCINLQ/exec";

/* ================= VARIABLES GLOBALES DE PRODUCTO ================= */




const CONFIG = {

    CAT_MATERIA_PRIMA: [
        { field: "ID_MP", type: "auto" },
        { field: "NOMBRE", type: "text", required: true, transform: "uppercaseFirst" },
        {
            field: "ID_UNIDAD", type: "select",
            source: "LST_UNIDADES", key: "ID_UNIDAD", display: "NOMBRE", required: true
        },
        { field: "PORCION_ENVASE", type: "number", step: "0.01", required: true },
        { field: "COSTO_PORCION", type: "number", step: "0.01", required: true },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "COMENTARIO", type: "textarea" },
        { field: "ACTIVO", type: "checkbox" }
    ],

    CAT_PRODUCTOS: [
        { field: "ID_BP", type: "auto" },
        { field: "NOMBRE", type: "text", required: true, transform: "uppercaseFirst" },
        {
            field: "ID_CATEGORIA", type: "select",
            source: "LST_CATEGORIAS", key: "ID_CATEGORIA", display: "NOMBRE", required: true
        },
        {
            field: "ID_SABOR", type: "select",
            source: "LST_SABORES", key: "ID_SABOR", display: "NOMBRE", required: true
        },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "ACTIVO", type: "checkbox" }
    ],

    CAT_VARIANTES_PRODUCTO: [
        { field: "ID_VARIANTE", type: "auto" },
        {
            field: "ID_BP", type: "select",
            source: "CAT_PRODUCTOS", key: "ID_BP", display: "NOMBRE", required: true
        },
        {
            field: "ID_PRESENTACION", type: "select",
            source: "LST_PRESENTACIONES", key: "ID_PRESENTACION", display: "NOMBRE", required: true
        },
        { field: "VIDA_UTIL", type: "number", min: 0, max: 30 },
        { field: "IMAGEN_URL", type: "text" },
        { field: "IMAGEN_THUMB", type: "text" },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "ACTIVO", type: "checkbox" },
        { field: "IMAGEN_ID", type: "auto" }
    ],

    CAT_RECETAS: [
        { field: "ID_RECETA", type: "auto" },
        {
            field: "ID_BP", type: "select",
            source: "CAT_PRODUCTOS", key: "ID_BP", display: "NOMBRE", required: true
        },
        {
            field: "ID_VARIANTE", type: "select",
            source: "CAT_VARIANTES_PRODUCTO", key: "ID_VARIANTE", display: "ID_VARIANTE",
            dependsOn: "ID_BP", required: true
        },
        { field: "PORCIONES", type: "number", required: true },
        { field: "COSTO_RECETA", type: "auto" },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "ACTIVO", type: "checkbox" }
    ],

    REL_RECETA_MP: [
        { field: "ID_REL_RECETA", type: "auto" },
        {
            field: "ID_RECETA", type: "select",
            source: "CAT_RECETAS", key: "ID_RECETA", display: "ID_RECETA", required: true
        },
        {
            field: "ID_MP", type: "select",
            source: "CAT_MATERIA_PRIMA", key: "ID_MP", display: "NOMBRE", required: true
        },
        {
            field: "ID_UNIDAD", type: "select",
            source: "LST_UNIDADES", key: "ID_UNIDAD", display: "NOMBRE", required: true
        },
        { field: "CANTIDAD", type: "number", step: "0.01", required: true },
        { field: "INSTRUCCIONES", type: "textarea" },
        { field: "COSTO_CALCULADO", type: "auto" },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "ACTIVO", type: "checkbox" }
    ]

};
const COLUMNAS_VISIBLES = {
    CAT_MATERIA_PRIMA: ["NOMBRE", "ID_UNIDAD", "PORCION_ENVASE", "COSTO_PORCION", "ACTIVO"],
    CAT_PRODUCTOS: ["NOMBRE", "ID_CATEGORIA", "ID_SABOR", "ACTIVO"],
    CAT_VARIANTES_PRODUCTO: ["ID_VARIANTE", "ID_BP", "ID_PRESENTACION", "VIDA_UTIL", "IMAGEN_URL", "IMAGEN_THUMB", "FECHA_ALTA", "ACTIVO", "IMAGEN_ID"],
    CAT_RECETAS: ["ID_BP", "ID_VARIANTE", "PORCIONES", "COSTO_RECETA", "ACTIVO"],
    REL_RECETA_MP: ["ID_REL_RECETA", "ID_RECETA", "ID_MP", "ID_UNIDAD", "CANTIDAD", "INSTRUCCIONES", "COSTO_CALCULADO", "FECHA_ALTA", "ACTIVO"]
};





/* ================= VARIABLES GLOBALES ================= */
let currentSheet = "CAT_MATERIA_PRIMA";
let variantesTemporales = [];
window.imagenTemporalBase64 = "";


/* ================= IMAGEN ================= */
function convertirImagenABase64() {
    const input = document.getElementById("input_foto_variante");
    const file = input?.files?.[0];

    if (!file) {
        window.imagenTemporalBase64 = "";
        return;
    }

    const reader = new FileReader();
    reader.onloadend = function () {
        window.imagenTemporalBase64 = reader.result || "";
    };
    reader.readAsDataURL(file);
}


/* ================= INIT ================= */

/* ================= CARGA INICIAL ================= */
async function cargarInicial() {
    try {
        const res = await fetch(WEB_APP_URL);
        const result = await res.json();
        window.APP_CACHE = result.data || {};
        document.dispatchEvent(new Event("ERP_READY"));
    } catch (e) {
        console.error("Error cargando datos:", e);
    }
}

cargarInicial();
document.addEventListener("ERP_READY", iniciarModulo);

function iniciarModulo() {
    const first = document.querySelector('.module-btn');
    loadModule("CAT_MATERIA_PRIMA", first);
    actualizarBadges();
}




/* ================= VARIANTES ================= */
function agregarVarianteALista() {
    const p = document.getElementById("id_presentacion");
    const vInput = document.getElementById("vida_util");

    const idPresentacion = p?.value || "";
    const vidaUtil = vInput?.value || "";
    const nombrePres = p?.options[p.selectedIndex]?.text || "";

    if (!idPresentacion || !vidaUtil) return;

    variantesTemporales.push({
        ID_PRESENTACION: idPresentacion,
        VIDA_UTIL: vidaUtil,
        NOMBRE_PRESENTACION: nombrePres,
        IMAGEN_BASE64: window.imagenTemporalBase64 || ""
    });

    renderVariantes();

    // limpiar
    if (vInput) vInput.value = "";
    if (p) p.selectedIndex = 0;
    window.imagenTemporalBase64 = "";
}

function eliminarVariante(index) {
    if (!Array.isArray(variantesTemporales)) return;
    variantesTemporales.splice(index, 1);
    renderVariantes();
}

function renderVariantes() {
    const tbody = document.getElementById("lista-variantes-body");

    tbody.innerHTML = variantesTemporales.map((item, i) => `
        <tr>
            <td>${item.NOMBRE_PRESENTACION}</td>
            <td>${item.VIDA_UTIL} días</td>
            <td>${item.IMAGEN_BASE64 ? "🖼️ OK" : "—"}</td>
            <td>
                <button type="button" onclick="eliminarVariante(${i})">❌</button>
            </td>
        </tr>
    `).join("");

    document.getElementById("btnFinalizar").disabled = variantesTemporales.length === 0;
}


/* ================= MOTOR ================= */
function loadModule(sheetName, element) {
    currentSheet = sheetName;

    document.querySelectorAll('.module-btn')
        .forEach(b => b.classList.remove('active'));

    if (element) element.classList.add('active');

    const title = document.getElementById('current-table-title');
    if (title) {
        title.innerText = sheetName.replace("CAT_", "").replace(/_/g, " ");
    }

    renderSkeleton();

    const data = Array.isArray(window.APP_CACHE?.[sheetName])
        ? window.APP_CACHE[sheetName]
        : [];

    const idField = CONFIG[sheetName]?.find(f => f.type === "auto")?.field || "ID_MP";

    data.sort((a, b) => {
        const idA = parseInt(String(a[idField]).replace(/\D/g, '')) || 0;
        const idB = parseInt(String(b[idField]).replace(/\D/g, '')) || 0;
        return idB - idA;
    });

    renderData(data);
}

function renderSkeleton() {
    const head = document.getElementById("table-head");
    const visibles = COLUMNAS_VISIBLES[currentSheet] || [];

    const fields = CONFIG[currentSheet]
        .filter(f => visibles.includes(f.field));

    head.innerHTML =
        fields.map(f => `<th>${f.label || f.field}</th>`).join("") +
        "<th>ACCIONES</th>";
}

function renderData(data) {
    const visibles = COLUMNAS_VISIBLES[currentSheet] || [];
    const fields = CONFIG[currentSheet]
        .filter(f => visibles.includes(f.field));

    const body = document.getElementById("table-body");

    if (!Array.isArray(data) || data.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="${fields.length + 1}" class="status-indicator danger">
                    Sin datos
                </td>
            </tr>`;
        return;
    }

    body.innerHTML = data.map(row => {
        const cols = fields.map(f => {
            let val = getDisplayValue(f, row[f.field]);

            if (f.field === "ACTIVO") {
                val = String(val) === "1" ? "✅ Activo" : "❌ Inactivo";
            }

            if (f.field === "FECHA_ALTA") {
                val = val ? new Date(val).toLocaleDateString() : "";
            }

            return `<td>${val ?? ""}</td>`;
        }).join("");

        return `
            <tr>
                ${cols}
                <td>
                    <button class="btn-edit" onclick='openModal("edit",${JSON.stringify(row)})'>
                        ✏️
                    </button>
                </td>
            </tr>`;
    }).join("");
}

function getDisplayValue(fieldConfig, value) {
    if (!fieldConfig || fieldConfig.type !== "select") return value;

    const lista = Array.isArray(window.APP_CACHE?.[fieldConfig.source])
        ? window.APP_CACHE[fieldConfig.source]
        : [];

    const encontrado = lista.find(x =>
        String(x[fieldConfig.key]) === String(value)
    );

    return encontrado ? encontrado[fieldConfig.display] : value;
}











/* ================= MODAL GENÉRICO CORREGIDO ================= */
/* ================= MODAL ================= */
function openModal(mode, data = null) {

    // 👉 usar modal maestro para productos
    if (currentSheet === "CAT_PRODUCTOS" && mode === "add") {
        abrirModalMaestro();
        return;
    }

    const modal = document.getElementById("formModal");
    const container = document.getElementById("formInputs");
    const fields = CONFIG[currentSheet] || [];

    const primaryKeyField = fields.find(f => f.type === "auto")?.field;

    document.getElementById("modalTitle").innerText =
        mode === "add" ? "Nuevo Registro" : "Editar Registro";

    container.innerHTML = fields.map(f => {

        let val = data ? data[f.field] : "";

        // 🔹 ID oculto
        if (f.type === "auto") {
            return `<input type="hidden" name="${f.field}" value="${val || ""}">`;
        }

        // 🔹 defaults
        if (mode === "add" && f.field === "FECHA_ALTA") return "";
        if (mode === "add" && f.field === "ACTIVO") val = "1";

        let inputHtml = "";

        switch (f.type) {

            case "select":
                const lista = Array.isArray(window.APP_CACHE?.[f.source])
                    ? window.APP_CACHE[f.source]
                    : [];

                const options = lista.map(opt => `
                    <option value="${opt[f.key] || ""}"
                        ${String(val) === String(opt[f.key]) ? "selected" : ""}>
                        ${opt[f.display] || ""}
                    </option>
                `).join("");

                inputHtml = `
                    <select name="${f.field}" required>
                        <option value="">Seleccione...</option>
                        ${options}
                    </select>`;
                break;

            case "textarea":
                inputHtml = `<textarea name="${f.field}" rows="3">${val || ""}</textarea>`;
                break;

            case "checkbox":
                const checkedSi = String(val) === "1" ? "checked" : "";
                const checkedNo = String(val) === "0" ? "checked" : "";

                inputHtml = `
                    <div class="radio-group-pro">
                        <label><input type="radio" name="${f.field}" value="1" ${checkedSi}> SI</label>
                        <label><input type="radio" name="${f.field}" value="0" ${checkedNo}> NO</label>
                    </div>`;
                break;

            case "number":
                inputHtml = `
                    <input type="number" step="${f.step || "0.01"}"
                        name="${f.field}" value="${val || ""}" required>`;
                break;

            case "date":
                const dateVal = val
                    ? new Date(val).toISOString().split("T")[0]
                    : "";

                inputHtml = `<input type="date" name="${f.field}" value="${dateVal}">`;
                break;

            default:
                inputHtml = `<input type="text" name="${f.field}" value="${val || ""}" required>`;
        }

        return `
            <div class="form-group">
                <label>${f.label || f.field}</label>
                ${inputHtml}
            </div>
        `;
    }).join("");

    const currentID = data ? data[primaryKeyField] : null;

    document.querySelector(".modal-footer").innerHTML = `
        ${mode === "edit" ? `
            <button type="button" class="btn-cancelar"
                style="background:#dc3545;color:white;"
                onclick="deleteRecord('${currentID}')">
                Eliminar
            </button>` : ""}

        <button type="button" class="btn-cancelar" onclick="closeModal()">
            Cancelar
        </button>

        <button type="button" class="btn-guardar" onclick="saveRecord()">
            Guardar
        </button>
    `;

    modal.dataset.mode = mode;
    modal.style.display = "block";
}


/* ================= SAVE ================= */
async function saveRecord() {

    const modal = document.getElementById("formModal");
    const form = document.getElementById("dynamicForm");

    const obj = {};

    // 🔹 inputs normales
    form.querySelectorAll("input:not([type='radio']), select, textarea")
        .forEach(i => {
            if (!i.name) return;
            obj[i.name] = (i.value || "").trim();
        });

    // 🔹 radios (solo UNA vez)
    form.querySelectorAll("input[type='radio']:checked")
        .forEach(r => {
            if (!r.name) return;
            obj[r.name] = r.value;
        });

    obj.tabla = currentSheet;
    obj.action = modal.dataset.mode === "edit" ? "update" : "insertar";

    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(obj)
        });

        closeModal();
        setTimeout(refrescarCache, 1500);

    } catch (e) {
        console.error(e);
        alert("Error al guardar");
    }
}


/* ================= REFRESH ================= */
async function refrescarCache() {
    try {
        const res = await fetch(WEB_APP_URL);
        const result = await res.json();

        window.APP_CACHE = result.data || [];

        loadModule(currentSheet);
        actualizarBadges();

    } catch (e) {
        console.error("Error refrescando:", e);
    }
}


/* ================= DELETE ================= */
async function deleteRecord(id) {

    if (!id || id === "null" || id === "undefined") {
        return alert("ID no válido");
    }

    if (!confirm("¿Eliminar este registro?")) return;

    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({
                action: "delete",
                tabla: currentSheet,
                id: id
            })
        });

        closeModal();
        setTimeout(refrescarCache, 1500);

    } catch (e) {
        console.error(e);
        alert("Error eliminando");
    }
}
/* ================= MAESTRO PRODUCTO (MODAL ESPECIAL) ================= */
/* ================= MAESTRO PRODUCTO (MODAL ESPECIAL) ================= */
function abrirModalMaestro() {
    const m = document.getElementById("formModalProducto");

    document.getElementById("formMaestroProducto")?.reset();
    document.getElementById("lista-variantes-body").innerHTML = "";
    document.getElementById("section-variantes").classList.add("hidden");
    document.getElementById("container-btn-variante").style.display = "none";
    document.getElementById("btnFinalizar").disabled = true;

    variantesTemporales = [];

    poblarSelectMaestro("id_categoria", "LST_CATEGORIAS", "ID_CATEGORIA", "NOMBRE");
    poblarSelectMaestro("id_sabor", "LST_SABORES", "ID_SABOR", "NOMBRE");

    m.style.display = "block";
}

function poblarSelectMaestro(domId, source, key, display) {
    const sel = document.getElementById(domId);
    const data = Array.isArray(window.APP_CACHE?.[source]) ? window.APP_CACHE[source] : [];

    if (!sel) return;

    sel.innerHTML = `<option value="">Seleccione...</option>` +
        data.map(opt => `<option value="${opt[key] || ""}">${opt[display] || ""}</option>`).join("");
}

function validarCamposBase() {
    const n = document.getElementById("nombre_bp")?.value || "";
    const c = document.getElementById("id_categoria")?.value || "";
    const s = document.getElementById("id_sabor")?.value || "";

    document.getElementById("container-btn-variante").style.display =
        (n && c && s) ? "block" : "none";
}

function activarSeccionVariantes() {
    document.getElementById("section-variantes").classList.remove("hidden");

    poblarSelectMaestro("id_presentacion", "LST_PRESENTACIONES", "ID_PRESENTACION", "NOMBRE");
}



function agregarVarianteAListaRender() {
    const tbody = document.getElementById("lista-variantes-body");

    tbody.innerHTML = variantesTemporales.map((item, i) => `
        <tr>
            <td>${item.ID_PRESENTACION}</td>
            <td>${item.VIDA_UTIL} días</td>
            <td>${item.IMAGEN_BASE64 ? "📷" : "—"}</td>
            <td>
                <button type="button" onclick="eliminarVariante(${i})">❌</button>
            </td>
        </tr>
    `).join("");

    document.getElementById("btnFinalizar").disabled = variantesTemporales.length === 0;
}

async function guardarTodoMaestro(e) {
    if (e) e.preventDefault();

    const obj = {
        action: "insertar_maestro_producto",
        NOMBRE: document.getElementById("nombre_bp")?.value || "",
        ID_CATEGORIA: document.getElementById("id_categoria")?.value || "",
        ID_SABOR: document.getElementById("id_sabor")?.value || "",
        ACTIVO: document.getElementById("activo_bp")?.value || "1",
        variantes: Array.isArray(variantesTemporales) ? variantesTemporales : []
    };

    if (!obj.NOMBRE || !obj.ID_CATEGORIA || !obj.ID_SABOR) {
        return alert("Faltan datos base");
    }

    if (obj.variantes.length === 0) {
        return alert("Agrega al menos una variante.");
    }

    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(obj)
        });

        closeModal();
        setTimeout(refrescarCache, 1500);

    } catch (e) {
        console.error(e);
        alert("Error al guardar maestro");
    }
}
/* ================= UTILIDADES ================= */
function closeModal() {
    document.getElementById("formModal").style.display = "none";
    document.getElementById("formModalProducto").style.display = "none";
    document.getElementById("dynamicForm").reset();
    document.getElementById("formMaestroProducto").reset();
}

function actualizarBadges() {
    const sheets = Object.keys(CONFIG);
    sheets.forEach(sheet => {
        const data = Array.isArray(window.APP_CACHE?.[sheet]) ? window.APP_CACHE[sheet] : [];
        const btn = document.querySelector(`[onclick*="${sheet}"] .status-indicator`);
        if (btn) {
            btn.innerText = data.length > 0 ? `${data.length} registros` : "Vacío";
            btn.className = data.length > 0 ? "status-indicator success" : "status-indicator danger";
        }
    });
}

window.onclick = (event) => { 
    if (event.target === document.getElementById("formModal") || event.target === document.getElementById("formModalProducto")) {
        closeModal();
    } 
};