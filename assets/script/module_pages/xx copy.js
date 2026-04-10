
    // // // <script src="../assets/script/module_pages/xx.js"></script>
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzctPnBEK3mRXkqJQOlE7hDSbKstnBzpqc1LWkSnLsylKicbri6kQFhqtnbcI8STCINLQ/exec";

/* ================= VARIABLES GLOBALES DE PRODUCTO ================= */


window.imagenTemporalBase64 = "";



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
    CAT_VARIANTES_PRODUCTO: ["ID_VARIANTE", "ID_BP", "ID_PRESENTACION", "VIDA_UTIL", "ACTIVO", "IMAGEN_THUMB"],
    CAT_RECETAS: ["ID_BP", "ID_VARIANTE", "PORCIONES", "COSTO_RECETA", "ACTIVO"],
    REL_RECETA_MP: ["ID_REL_RECETA", "ID_RECETA", "ID_MP", "ID_UNIDAD", "CANTIDAD", "INSTRUCCIONES", "COSTO_CALCULADO", "FECHA_ALTA", "ACTIVO"]
};

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
        console.log("Imagen capturada OK");
    };

    reader.readAsDataURL(file);
}


function eliminarVariante(index) {
    if (!Array.isArray(variantesTemporales)) return;

    variantesTemporales.splice(index, 1);

    agregarVarianteALista(); // re-render seguro
}        










let productoBaseTemp = {};
let variantesTemp = [];

/* ==========================================================================
   LÓGICA DE PRODUCTOS (MAESTRO-DETALLE)
   ========================================================================== */

/**
 * Valida la primera parte del formulario (Nombre, Cat, Sabor)
 * y desbloquea la sección de variantes.
 */
function validarBaseProducto() {
    const n = document.getElementById("base_nombre")?.value.trim();
    const c = document.getElementById("base_categoria")?.value;
    const s = document.getElementById("base_sabor")?.value;

    if (n && n.length > 2 && c && s) {
        document.getElementById("bloque-variantes").style.display = "block";
        productoBaseTemp = { nombre: n, categoria: c, sabor: s };
        showToast("✅ Base validada. Agregue las variantes.", "success");
    } else {
        showToast("❌ Complete los campos principales correctamente", "error");
    }
}


let currentSheet = "CAT_MATERIA_PRIMA";
window.variantesTemporales = [];
window.imagenTemporalBase64 = "";
// ACTUALIZADA: Reemplaza tu agregarVarianteALista por esta
function agregarVarianteALista() {
    const p = document.getElementById("id_presentacion");
    const v = document.getElementById("vida_util")?.value;

    if (!p?.value || !v) return;

    const imagen = window.imagenTemporalBase64 || "";

    variantesTemporales.push({
        ID_PRESENTACION: p.value || "",
        NOMBRE_PRESENTACION: p.options[p.selectedIndex]?.text || "",
        VIDA_UTIL: v || "",
        IMAGEN_BASE64: imagen // 🔥 CORRECTO
    });

    document.getElementById("lista-variantes-body").innerHTML =
        variantesTemporales.map((item, i) => `
        <tr>
            <td>${item.NOMBRE_PRESENTACION}</td>
            <td>${item.VIDA_UTIL} días</td>
            <td>
                ${item.IMAGEN_BASE64 
                    ? `<img src="${item.IMAGEN_BASE64}" style="width:40px;height:40px;object-fit:cover;border-radius:5px;">`
                    : '❌'}
            </td>
            <td>
                <button type="button" onclick="eliminarVariante(${i})">❌</button>
            </td>
        </tr>
    `).join("");

    document.getElementById("btnFinalizar").disabled = variantesTemporales.length === 0;

    document.getElementById("input_foto_variante").value = "";
    window.imagenTemporalBase64 = "";
}

/**
 * Dibuja la tabla de variantes dentro del modal
 */
function renderTablaVariantesTemp() {
    const body = document.getElementById("lista-variantes-body");
    if (!body) return;

    body.innerHTML = variantesTemp.map((v, index) => `
        <tr>
            <td>${v.nombre_pres}</td>
            <td>${v.VIDA_UTIL} días</td>
            <td>
                <button class="btn-delete-icon" onclick="quitarVarianteTemp(${index})">❌</button>
            </td>
        </tr>
    `).join('');
}

function quitarVarianteTemp(index) {
    variantesTemp.splice(index, 1);
    renderTablaVariantesTemp();
    if (variantesTemp.length === 0) {
        document.getElementById("btn-finalizar").disabled = true;
    }
}

/**
 * Envío final de Producto + Variantes al servidor
 */
async function guardarTodoMaestro(e) {
    if (e) e.preventDefault();

    // FIX: la UI usa variantesTemporales, no variantesTemp
    const listaVariantes = Array.isArray(window.variantesTemporales) ? window.variantesTemporales : [];

    if (listaVariantes.length === 0) {
        showToast("Agregue al menos una variante", "error");
        return;
    }

    const obj = {
        action: "insertar_maestro_producto",
        NOMBRE: document.getElementById("nombre_bp")?.value || "",
        ID_CATEGORIA: document.getElementById("id_categoria")?.value || "",
        ID_SABOR: document.getElementById("id_sabor")?.value || "",
        ACTIVO: document.getElementById("activo_bp")?.value || "1",
        variantes: listaVariantes
    };

    if (!obj.NOMBRE || !obj.ID_CATEGORIA || !obj.ID_SABOR) {
        showToast("Complete los datos base del producto", "error");
        return;
    }

    try {
        showLoader("Guardando Producto Completo...");

        // FIX: sin mode:"no-cors" para poder leer la respuesta
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(obj)
        });

        const resJson = await response.json();

        if (resJson.status === "success") {
            // FIX: si el servidor devuelve dataActualizada, usarla; sino re-fetch
            if (Array.isArray(resJson.dataActualizada)) {
                window.APP_CACHE["CAT_PRODUCTOS"] = resJson.dataActualizada;
            } else {
                const freshRes = await fetch(WEB_APP_URL);
                const freshResult = await freshRes.json();
                if (freshResult.data && typeof freshResult.data === "object") {
                    window.APP_CACHE = freshResult.data;
                }
            }

            showToast("\u2705 Producto y variantes guardados", "success");
            closeModal();
            loadModule("CAT_PRODUCTOS");
        } else {
            showToast("\u274C " + (resJson.message || "Error desconocido"), "error");
        }
    } catch (err) {
        console.error("Error guardarTodoMaestro:", err);
        showToast("\u274C Error de conexión", "error");
    } finally {
        hideLoader();
    }
}

/* ==========================================================================
   CRUD GENERAL Y UTILIDADES (Refactorizado)
   ========================================================================== */

function poblarSelectMaestro(domId, source, key, display) {
    const sel = document.getElementById(domId);
    if (!sel) return;
    const data = window.APP_CACHE?.[source] || [];
    sel.innerHTML = `<option value="">Seleccione...</option>` +
        data.map(opt => `<option value="${opt[key]}">${opt[display]}</option>`).join("");
}

function closeModal() {
    const modal = document.getElementById("formModal");
    if (modal) modal.style.display = "none";
    
    // IMPORTANTE: Limpiar variables para que el próximo producto no herede datos
    productoBaseTemp = {};
    variantesTemp = [];
}
// ===== INIT APP =====
//REF. POSICION ANTES DE REFC //"../assets/script/globalLoader.js"></script>// // *****// // ¿Qué hace cargarInicial()?// // Es el bootstrap del sistema.// // Carga TODO lo necesario antes de que la UI empiece a funcionar.
async function cargarInicial() {
    try {
        showLoader("Cargando sistema...");

        const res = await fetch(WEB_APP_URL);
        const result = await res.json();

        window.APP_CACHE = result.data || {};

        hideLoader();

        document.dispatchEvent(new Event("ERP_READY"));

    } catch (e) {
        console.error("Error cargando sistema:", e);
        hideLoader();
        showToast("❌ Error cargando datos", "error");
    }
}

// 🚀 CARGA REAL DEL SISTEMA
cargarInicial();
// 👇 ESTE SE QUEDA
document.addEventListener("ERP_READY", iniciarModulo);
function iniciarModulo() {
    const first = document.querySelector('.module-btn');
    loadModule("CAT_MATERIA_PRIMA", first);
    actualizarBadges();
}// // *****


// ===== HELPERS =====


//REF. POSICION ANTES DE REFC //"../assets/script/table.js"></script>
//REF. POSICION ANTES DE REFC //"../assets/script/search.js"></script>

/* ========= UTILIDADES DE ETIQUETAS ========= */
function getFriendlyLabel(field) {

    if (field === "COLUMNAS_VISIBLES") return "COLUMNAS_VISIBLES";
    // if (field === "TIPO_UNIDAD") return "P. FISICA";
    // if (field === "ES_UNIDAD_BASE") return "EB";
    // if (field === "FACTOR_CONVERSION") return "FACTOR";
    // if (field === "ACTIVO") return "EA";
    // if (field === "ACCIONES") return "ACC";
    return field.replace(/_/g, ' ');
}

//REF. POSICION ANTES DE REFC //"../assets/cat_config/ui_modal_cat.js"></script>



// ===== CRUD =====
/* ========= OPERACIONES (CRUD) ACTUALIZADAS CON DELAY ========= */// Master_lists.js - Versión Optimización Instantánea// 👉 Es la función que toma lo que escribiste en el formulario y lo guarda en el sistema
async function saveRecord() {
    const modal = document.getElementById('formModal');
    const container = document.getElementById('formInputs');
    const obj = {};

    if (!container) return;

    // =========================
    // RECOLECCIÓN COMPLETA 🔥
    // =========================

    // INPUTS (except checkbox y radio)
    container.querySelectorAll('input:not([type="radio"]):not([type="checkbox"])')
        .forEach(i => {
            if (!i.name) return;
            obj[i.name] = (i.value !== undefined && i.value !== null)
                ? String(i.value).trim()
                : "";
        });

    // CHECKBOX
    container.querySelectorAll('input[type="checkbox"]')
        .forEach(ch => {
            if (!ch.name) return;
            obj[ch.name] = ch.checked ? 1 : 0;
        });

    // SELECTS 🔥 (FIX REAL)
    container.querySelectorAll('select')
        .forEach(s => {
            if (!s.name) return;
            obj[s.name] = s.value || "";
        });

    // TEXTAREA
    container.querySelectorAll('textarea')
        .forEach(t => {
            if (!t.name) return;
            obj[t.name] = (t.value || "").trim();
        });

    // RADIO
    container.querySelectorAll('input[type="radio"]:checked')
        .forEach(r => {
            if (!r.name) return;
            obj[r.name] = r.value;
        });

    // =========================
    // META
    // =========================

    obj.tabla = currentSheet;
obj.action = modal?.dataset?.mode === "edit" ? "update" : "insertar";

// 🔥 VALIDACIÓN: solo aplica a módulos que realmente tienen ID_UNIDAD
const moduloRequiereUnidad = CONFIG[currentSheet]?.some(f => f.field === "ID_UNIDAD");
if (moduloRequiereUnidad && !obj.ID_UNIDAD) {
    showToast("Seleccione una unidad", "error");
    return;
}

try {
    showLoader("Guardando cambios...");


        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(obj)
        });

        const result = await response.json();

        if (result.status === "success") {

            // FIX: si el servidor devuelve dataActualizada, actualiza solo ese módulo.
            // Si no la devuelve, recarga todo el cache desde el servidor (como hace F5).
            if (Array.isArray(result.dataActualizada)) {
                window.APP_CACHE[currentSheet] = result.dataActualizada;
            } else {
                const freshRes = await fetch(WEB_APP_URL);
                const freshResult = await freshRes.json();
                if (freshResult.data && typeof freshResult.data === "object") {
                    window.APP_CACHE = freshResult.data;
                }
            }

            // Refrescar UI
            loadModule(currentSheet);
            actualizarBadges();

            hideLoader();
            closeModal();

            showToast(
                obj.action === "update"
                    ? "✅ Editado correctamente"
                    : "✅ Registrado correctamente"
            );

        } else {
            throw new Error(result.message || "Error desconocido");
        }

    } catch (e) {
        console.error("Error en saveRecord:", e);
        hideLoader();
        showToast("❌ Error al guardar", "error");
    }
}
async function deleteRecord(id) {
    if (!id || !confirm("¿Eliminar este registro permanentemente?")) return;

    try {
        showLoader("Eliminando...");

        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "delete",
                tabla: currentSheet,
                id: id
            })
        });

        const result = await response.json();

        if (result.status === "success") {

            // FIX: mismo patrón que saveRecord
            if (Array.isArray(result.dataActualizada)) {
                window.APP_CACHE[currentSheet] = result.dataActualizada;
            } else {
                const freshRes = await fetch(WEB_APP_URL);
                const freshResult = await freshRes.json();
                if (freshResult.data && typeof freshResult.data === "object") {
                    window.APP_CACHE = freshResult.data;
                }
            }

            loadModule(currentSheet);
            actualizarBadges();

            hideLoader();
            closeModal();
            showToast("🗑️ Eliminado correctamente");
        }

    } catch (e) {
        console.error(e);
        hideLoader();
        showToast("❌ Error al eliminar", "error");
    }
}





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
            IMAGEN_URL: window.imagenTemporalBase64
            <td>
                <button type="button" onclick="eliminarVariante(${i})">❌</button>
            </td>
        </tr>
    `).join("");
 
    document.getElementById("btnFinalizar").disabled = variantesTemporales.length === 0;
}
 

function closeModal() {
    document.getElementById("formModal").style.display = "none";
    document.getElementById("formModalProducto").style.display = "none";
    document.getElementById("dynamicForm").reset();
    document.getElementById("formMaestroProducto").reset();
}
window.onclick = (event) => { 
    if (event.target === document.getElementById("formModal") || event.target === document.getElementById("formModalProducto")) {
        closeModal();
    } 
};
 
// ===== REFRESH / BADGES =====
// Esta función ahora solo se usa para recargas manuales forzadas
async function refrescarTodo() {
    showLoader("Sincronizando sistema...");
    const timestamp = new Date().getTime();
    const res = await fetch(WEB_APP_URL + "?v=" + timestamp);
    const result = await res.json();
    window.APP_CACHE = result.data;
    loadModule(currentSheet);
    actualizarBadges();
    hideLoader();
}
function updateBadge(sheetName, count) {
    const el = document.getElementById("badge-" + sheetName);
    if (!el) {
        console.warn("Badge no encontrado:", sheetName);
        return;
    }
 
    el.innerText = count > 0 ? `${count} re...` : "Vacío";
    el.className = "status-indicator " + (count > 0 ? "success" : "danger");
}
 
//  SOLO AGREGA ESTO EN saveRecord (YA LO TIENES CASI)
// const fileInput = document.querySelector('input[name="IMAGEN_FILE"]');

// if (fileInput && fileInput.files && fileInput.files[0]) {
//     const base64 = await new Promise(resolve => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result || "");
//         reader.readAsDataURL(fileInput.files[0]);
//     });

//     obj.IMAGEN_BASE64 = base64;
// }