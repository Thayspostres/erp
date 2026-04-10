/**
 * CATALOG_OPERATIONS.JS
 * Gestión de Catálogos, Productos Maestro-Detalle y CRUD General
 */

/* ==========================================================================
   1. CONFIGURACIÓN Y VARIABLES GLOBALES
   ========================================================================== */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxOf290HJgDNlOqjmYk1uMwC3msymjxHmMK6WkLgLP1UwCUf2BeeeuzOiEa7WgVVY1n_Q/exec";

// Estados temporales
window.imagenTemporalBase64 = "";
window.variantesTemporales = [];
window.APP_CACHE = {};

let currentSheet = "CAT_MATERIA_PRIMA";
let productoBaseTemp = {};
let variantesTemp = [];

// Estructura de Diccionarios y Configuración
const CONFIG = {
    CAT_MATERIA_PRIMA: [
        { field: "ID_MP", type: "auto" },
        { field: "NOMBRE", type: "text", required: true, transform: "uppercaseFirst" },
        { field: "ID_UNIDAD", type: "select", source: "LST_UNIDADES", key: "ID_UNIDAD", display: "NOMBRE", required: true },
        { field: "PORCION_ENVASE", type: "number", step: "0.01", required: true },
        { field: "COSTO_PORCION", type: "number", step: "0.01", required: true },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "COMENTARIO", type: "textarea" },
        { field: "ACTIVO", type: "checkbox" }
    ],
    CAT_PRODUCTOS: [
        { field: "ID_BP", type: "auto" },
        { field: "NOMBRE", type: "text", required: true, transform: "uppercaseFirst" },
        { field: "ID_CATEGORIA", type: "select", source: "LST_CATEGORIAS", key: "ID_CATEGORIA", display: "NOMBRE", required: true },
        { field: "ID_SABOR", type: "select", source: "LST_SABORES", key: "ID_SABOR", display: "NOMBRE", required: true },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "ACTIVO", type: "checkbox" }
    ],
    CAT_VARIANTES_PRODUCTO: [
        { field: "ID_VARIANTE", type: "auto" },
        { field: "ID_BP", type: "select", source: "CAT_PRODUCTOS", key: "ID_BP", display: "NOMBRE", required: true },
        { field: "ID_PRESENTACION", type: "select", source: "LST_PRESENTACIONES", key: "ID_PRESENTACION", display: "NOMBRE", required: true },
        { field: "VIDA_UTIL", type: "number", min: 0, max: 30 },
        { field: "IMAGEN_URL", type: "text" },
        { field: "IMAGEN_THUMB", type: "text" },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "ACTIVO", type: "checkbox" },
        { field: "IMAGEN_ID", type: "auto" }
    ],
    // CAT_RECETAS: [
    //     { field: "ID_RECETA", type: "auto" },
    //     { field: "ID_BP", type: "select", source: "CAT_PRODUCTOS", key: "ID_BP", display: "NOMBRE", required: true },
    //     { field: "ID_VARIANTE", type: "select", source: "CAT_VARIANTES_PRODUCTO", key: "ID_VARIANTE", display: "ID_VARIANTE", dependsOn: "ID_BP", required: true },
    //     { field: "PORCIONES", type: "number", required: true },
    //     { field: "COSTO_RECETA", type: "auto" },
    //     { field: "FECHA_ALTA", type: "auto" },
    //     { field: "ACTIVO", type: "checkbox" }
    // ],
    // REL_RECETA_MP: [
    //     { field: "ID_REL_RECETA", type: "auto" },
    //     { field: "ID_RECETA", type: "select", source: "CAT_RECETAS", key: "ID_RECETA", display: "ID_RECETA", required: true },
    //     { field: "ID_MP", type: "select", source: "CAT_MATERIA_PRIMA", key: "ID_MP", display: "NOMBRE", required: true },
    //     { field: "ID_UNIDAD", type: "select", source: "LST_UNIDADES", key: "ID_UNIDAD", display: "NOMBRE", required: true },
    //     { field: "CANTIDAD", type: "number", step: "0.01", required: true },
    //     { field: "INSTRUCCIONES", type: "textarea" },
    //     { field: "COSTO_CALCULADO", type: "auto" },
    //     { field: "FECHA_ALTA", type: "auto" },
    //     { field: "ACTIVO", type: "checkbox" }
    // ]
};

const COLUMNAS_VISIBLES = {
    CAT_MATERIA_PRIMA: ["NOMBRE", "ID_UNIDAD", "PORCION_ENVASE", "COSTO_PORCION", "ACTIVO"],
    CAT_PRODUCTOS: ["NOMBRE", "ID_CATEGORIA", "ID_SABOR", "ACTIVO"],
    CAT_VARIANTES_PRODUCTO: ["ID_VARIANTE", "ID_BP", "ID_PRESENTACION", "VIDA_UTIL", "ACTIVO", "IMAGEN_THUMB"],
    // CAT_RECETAS: ["ID_BP", "ID_VARIANTE", "PORCIONES", "COSTO_RECETA", "ACTIVO"],
    // REL_RECETA_MP: ["ID_REL_RECETA", "ID_RECETA", "ID_MP", "ID_UNIDAD", "CANTIDAD", "INSTRUCCIONES", "COSTO_CALCULADO", "FECHA_ALTA", "ACTIVO"]
};

/* ==========================================================================
   2. INICIALIZACIÓN (INIT APP)
   ========================================================================== */

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

// Escuchador para iniciar módulo al estar listo
document.addEventListener("ERP_READY", iniciarModulo);

function iniciarModulo() {
    const first = document.querySelector('.module-btn');
    loadModule("CAT_MATERIA_PRIMA", first);
    actualizarBadges();
}

// Carga real al inicio
cargarInicial();

/* ==========================================================================
   3. LÓGICA DE PRODUCTOS (MAESTRO-DETALLE)
   ========================================================================== */

function abrirModalMaestroProductos() {
    const m = document.getElementById("formModalProducto");
    document.getElementById("formMaestroProducto")?.reset();
    document.getElementById("lista-variantes-body").innerHTML = "";
    document.getElementById("section-variantes").classList.add("hidden");
    document.getElementById("container-btn-variante").style.display = "none";
    document.getElementById("btnFinalizar").disabled = true;

    window.variantesTemporales = [];

    poblarSelectMaestro("id_categoria", "LST_CATEGORIAS", "ID_CATEGORIA", "NOMBRE");
    poblarSelectMaestro("id_sabor", "LST_SABORES", "ID_SABOR", "NOMBRE");

    m.style.display = "block";
}

function validarCamposBase() {
    const n = document.getElementById("nombre_bp")?.value || "";
    const c = document.getElementById("id_categoria")?.value || "";
    const s = document.getElementById("id_sabor")?.value || "";

    document.getElementById("container-btn-variante").style.display =
        (n && c && s) ? "block" : "none";
}

/**
 * Valida la primera parte del formulario y desbloquea variantes.
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

function activarSeccionVariantes() {
    document.getElementById("section-variantes").classList.remove("hidden");
    poblarSelectMaestro("id_presentacion", "LST_PRESENTACIONES", "ID_PRESENTACION", "NOMBRE");
}

function agregarVarianteALista() {
    const p = document.getElementById("id_presentacion");
    const v = document.getElementById("vida_util")?.value;

    if (!p?.value || !v) return;

    const imagen = window.imagenTemporalBase64 || "";

    window.variantesTemporales.push({
        ID_PRESENTACION: p.value || "",
        NOMBRE_PRESENTACION: p.options[p.selectedIndex]?.text || "",
        VIDA_UTIL: v || "",
        IMAGEN_BASE64: imagen
    });

    agregarVarianteAListaRender();

    // Limpiar campos internos
    document.getElementById("input_foto_variante").value = "";
    window.imagenTemporalBase64 = "";
}

function agregarVarianteAListaRender() {
    const tbody = document.getElementById("lista-variantes-body");
    tbody.innerHTML = window.variantesTemporales.map((item, i) => `
        <tr>
            <td>${item.NOMBRE_PRESENTACION || item.ID_PRESENTACION}</td>
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

    document.getElementById("btnFinalizar").disabled = window.variantesTemporales.length === 0;
}

function eliminarVariante(index) {
    if (!Array.isArray(window.variantesTemporales)) return;
    window.variantesTemporales.splice(index, 1);
    agregarVarianteAListaRender(); 
}

/**
 * Función genérica para Insertar o Editar registros en cualquier tabla (CRUD)
 */
async function saveRecord() {
    const modal = document.getElementById('formModal');
    const container = document.getElementById('formInputs');
    const obj = {};

    if (!container) return;

    // 1. Recolección de datos del formulario dinámico
    container.querySelectorAll('input:not([type="radio"]):not([type="checkbox"])').forEach(i => {
        if (i.name) obj[i.name] = (i.value !== undefined && i.value !== null) ? String(i.value).trim() : "";
    });

    container.querySelectorAll('input[type="checkbox"]').forEach(ch => { 
        if (ch.name) obj[ch.name] = ch.checked ? 1 : 0; 
    });

    container.querySelectorAll('select').forEach(s => { 
        if (s.name) obj[s.name] = s.value || ""; 
    });

    container.querySelectorAll('textarea').forEach(t => { 
        if (t.name) obj[t.name] = (t.value || "").trim(); 
    });

    container.querySelectorAll('input[type="radio"]:checked').forEach(r => { 
        if (r.name) obj[r.name] = r.value; 
    });

    // Procesamiento de imagen
    const fileInput = document.querySelector('input[name="IMAGEN_FILE"]');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        obj.IMAGEN_BASE64 = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result || "");
            reader.readAsDataURL(fileInput.files[0]);
        });
    }

    obj.tabla = currentSheet;
    obj.action = modal?.dataset?.mode === "edit" ? "update" : "insertar";

    // --- INTELIGENCIA DINÁMICA ---
    // Definimos qué tablas queremos que el servidor nos devuelva frescas
    if (currentSheet === "CAT_PRODUCTOS" || currentSheet === "CAT_VARIANTES_PRODUCTO") {
        obj.tablas_a_refrescar = ["CAT_PRODUCTOS", "CAT_VARIANTES_PRODUCTO"];
    } else if (currentSheet === "CAT_RECETAS") {
        obj.tablas_a_refrescar = ["CAT_RECETAS", "REL_RECETA_MP"];
    } else {
        obj.tablas_a_refrescar = [currentSheet]; // Por defecto solo la actual
    }

    // Validación rápida de Unidad
    const moduloRequiereUnidad = CONFIG[currentSheet]?.some(f => f.field === "ID_UNIDAD");
    if (moduloRequiereUnidad && !obj.ID_UNIDAD) {
        showToast("Seleccione una unidad", "error");
        return;
    }

    try {
        closeModal(); 
        showLoader("RELOADING..."); 

        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(obj)
        });
        const result = await response.json();

        if (result.status === "success") {
            // PROCESAR MULTITABLAS (Actualización inteligente del caché)
            if (result.multiTablas) {
                for (const tablaNom in result.multiTablas) {
                    window.APP_CACHE[tablaNom] = result.multiTablas[tablaNom];
                }
            }

            loadModule(currentSheet);
            actualizarBadges();
            showToast(obj.action === "update" ? "✅ Editado correctamente" : "✅ Registrado correctamente");
            closeModal();
        } else {
            throw new Error(result.message || "Error desconocido");
        }
    } catch (e) {
        console.error("Error en saveRecord:", e);
        showToast("❌ Error al guardar", "error");
    } finally {
        hideLoader();
    }
}

/**
 * Función especial para guardar Producto Maestro y sus Variantes
 */
async function guardarTodoMaestro(e) {
    if (e) e.preventDefault();
    
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
        variantes: listaVariantes,
        // PEDIMOS AMBAS TABLAS PARA EL CACHÉ
        tablas_a_refrescar: ["CAT_PRODUCTOS", "CAT_VARIANTES_PRODUCTO"]
    };

    if (!obj.NOMBRE || !obj.ID_CATEGORIA || !obj.ID_SABOR) {
        showToast("Complete los datos base del producto", "error");
        return;
    }

    try {
        closeModal(); 
        showLoader("GUARDANDO MAESTRO..."); 

        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(obj)
        });
        
        const resJson = await response.json();

        if (resJson.status === "success") {
            // Actualización masiva de caché
            if (resJson.multiTablas) {
                for (const t in resJson.multiTablas) {
                    window.APP_CACHE[t] = resJson.multiTablas[t];
                }
            }

            showToast("✅ Producto y variantes guardados", "success");
            loadModule("CAT_PRODUCTOS");
            actualizarBadges();
            closeModal();
        } else {
            showToast("❌ " + (resJson.message || "Error"), "error");
        }
    } catch (err) {
        console.error("Error en guardarTodoMaestro:", err);
        showToast("❌ Error de conexión", "error");
    } finally {
        hideLoader();
    }
}

/**
 * Función para eliminar registros
 */
async function deleteRecord(id) {
    if (!id || !confirm("¿Eliminar este registro permanentemente?")) return;

    // Lógica dinámica de refresco para eliminaciones
    let tablasRefrescar = [currentSheet];
    if (currentSheet === "CAT_PRODUCTOS") tablasRefrescar = ["CAT_PRODUCTOS", "CAT_VARIANTES_PRODUCTO"];

    try {
        showLoader("ELIMINANDO..."); 

        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ 
                action: "delete", 
                tabla: currentSheet, 
                id: id,
                tablas_a_refrescar: tablasRefrescar
            })
        });
        const result = await response.json();

        if (result.status === "success") {
            if (result.multiTablas) {
                for (const t in result.multiTablas) {
                    window.APP_CACHE[t] = result.multiTablas[t];
                }
            }

            loadModule(currentSheet);
            actualizarBadges();
            closeModal();
            showToast("🗑️ Eliminado correctamente");
        } else {
            showToast("❌ No se pudo eliminar", "error");
        }
    } catch (e) {
        console.error("Error en deleteRecord:", e);
        showToast("❌ Error al eliminar", "error");
    } finally {
        hideLoader();
    }
}
/* ==========================================================================
   5. UTILIDADES (IMAGENES, SELECTS, UI)
   ========================================================================== */

function convertirImagenABase64() {
    const input = document.getElementById("input_foto_variante");
    const file = input?.files?.[0];
    if (!file) { window.imagenTemporalBase64 = ""; return; }
    const reader = new FileReader();
    reader.onloadend = () => { window.imagenTemporalBase64 = reader.result || ""; };
    reader.readAsDataURL(file);
}

function poblarSelectMaestro(domId, source, key, display) {
    const sel = document.getElementById(domId);
    const data = Array.isArray(window.APP_CACHE?.[source]) ? window.APP_CACHE[source] : [];
    if (!sel) return;
    sel.innerHTML = `<option value="">Seleccione...</option>` +
        data.map(opt => `<option value="${opt[key] || ""}">${opt[display] || ""}</option>`).join("");
}

function getFriendlyLabel(field) {
    if (field === "COLUMNAS_VISIBLES") return "COLUMNAS_VISIBLES";
    return field.replace(/_/g, ' ');
}

function closeModal() {
    document.getElementById("formModal").style.display = "none";
    document.getElementById("formModalProducto").style.display = "none";
    document.getElementById("dynamicForm")?.reset();
    document.getElementById("formMaestroProducto")?.reset();
    
    // Limpieza de estados
    productoBaseTemp = {};
    variantesTemp = [];
}

window.onclick = (event) => { 
    if (event.target === document.getElementById("formModal") || event.target === document.getElementById("formModalProducto")) {
        closeModal();
    } 
};

/* ==========================================================================
   6. REFRESH / BADGES
   ========================================================================== */

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