/**
 * CATALOG_OPERATIONS.JS
 * Gestión de Catálogos, Productos Maestro-Detalle y CRUD General
 */

/* ==========================================================================
   1. CONFIGURACIÓN Y VARIABLES GLOBALES
   ========================================================================== */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz3j7c9NYrOe7EghsSibKUWgpVe-YXpANkDYVbitOf3JD9xv9S-nN0luinwAb7IzFJxeg/exec";

// Estados temporales
window.imagenTemporalBase64 = "";
window.variantesTemporales = [];

window.relacionRecetaTemporales = [];
window.APP_CACHE = {};

let currentSheet = "CAT_MATERIA_PRIMA";
let productoBaseTemp = {};
let variantesTemp = [];

let recetaoBaseTemp = {};
let relacionRecetaTemp = [];
// Estructura de Diccionarios y Configuración
const CONFIG = {
    CAT_MATERIA_PRIMA: [
        { field: "ID_MP", type: "auto" },
        { field: "NOMBRE", type: "text", required: true, transform: "uppercaseFirst" },
        { field: "ID_UNIDAD", type: "select", source: "LST_UNIDADES", key: "ID_UNIDAD", display: "NOMBRE", required: true },
        { field: "PORCION_ENVASE", type: "number", step: "0.01", required: true },
        { field: "COSTO_ENVASE", type: "number", step: "0.01", required: true },
        { field: "CANTIDAD_BASE_TOTAL", type: "auto" },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "COSTO_CALCULADO", type: "auto" },
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
    CAT_RECETAS: [
        { field: "ID_RECETA", type: "auto" },
        { field: "ID_BP", type: "select", source: "CAT_PRODUCTOS", key: "ID_BP", display: "NOMBRE", required: true },
        { field: "ID_VARIANTE", type: "select", source: "CAT_VARIANTES_PRODUCTO", key: "ID_VARIANTE", display: "ID_VARIANTE", dependsOn: "ID_BP", required: true },
        { field: "PORCIONES", type: "number", required: true },
        { field: "COSTO_RECETA", type: "auto" },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "ACTIVO", type: "checkbox" }
    ],
    REL_RECETA_MP: [
        { field: "ID_REL_RECETA", type: "auto" },
        { field: "ID_RECETA", type: "select", source: "CAT_RECETAS", key: "ID_RECETA", display: "ID_RECETA", required: true },
        { field: "ID_MP", type: "select", source: "CAT_MATERIA_PRIMA", key: "ID_MP", display: "NOMBRE", required: true },
        { field: "ID_UNIDAD", type: "select", source: "LST_UNIDADES", key: "ID_UNIDAD", display: "NOMBRE", required: true },
        { field: "CANTIDAD", type: "number", step: "0.01", required: true },
        { field: "INSTRUCCIONES", type: "textarea" },
        { field: "COSTO_IMP_USADO", type: "auto" },
        { field: "FECHA_ALTA", type: "auto" },
        { field: "ACTIVO", type: "checkbox" }
    ]
};

const COLUMNAS_VISIBLES = {
    CAT_MATERIA_PRIMA: ["NOMBRE", "ID_UNIDAD", "PORCION_ENVASE", "COSTO_ENVASE", "COSTO_CALCULADO", "ACTIVO"],
    CAT_PRODUCTOS: ["NOMBRE", "ID_CATEGORIA", "ID_SABOR", "ACTIVO"],
    CAT_VARIANTES_PRODUCTO: ["IMAGEN_THUMB", "ID_BP", "ID_PRESENTACION", "VIDA_UTIL", "FECHA_ALTA", "ACTIVO"],
    CAT_RECETAS: ["ID_BP", "ID_VARIANTE", "PORCIONES", "COSTO_RECETA", "ACTIVO"],
    REL_RECETA_MP: ["ID_REL_RECETA", "ID_RECETA", "ID_MP", "ID_UNIDAD", "CANTIDAD", "INSTRUCCIONES", "COSTO_IMP_USADO", "FECHA_ALTA", "ACTIVO"]
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
        document.getElementById("bloque-variantes").style.display = "none"; // 🔥 FIX
        productoBaseTemp = {};
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

// =================================================
// ================= RECETAS =================
function abrirModalMaestroReceta() {

    const modal = document.getElementById("formModalReceta");
    if (!modal) return;

    // reset UI primero
    document.getElementById("formMaestroReceta")?.reset();

    // 🔥 limpiar estado (después del reset)
    resetRecetaState();

    // limpiar tabla ingredientes
    const tbody = document.getElementById("ingredientes-body");
    if (tbody) tbody.innerHTML = "";

    // ocultar sección ingredientes
    const section = document.getElementById("section-relacionReceta");
    if (section) section.classList.add("hidden");

    // desactivar botón guardar
    const btn = document.getElementById("btnFinalizarReceta");
    if (btn) btn.disabled = true;

    // 🔥 limpiar costo
    const costo = document.getElementById("receta_costo_total");
    if (costo) costo.value = "0.00";

    // cargar selects
    poblarSelectMaestro("receta_id_bp", "CAT_PRODUCTOS", "ID_BP", "NOMBRE");

    const selVar = document.getElementById("receta_id_variante");
    if (selVar) {
        selVar.innerHTML = `<option value="">Seleccione producto primero</option>`;
    }

    // abrir modal
    modal.style.display = "block";
}



function filtrarVariantesPorBP() {
    const bp = document.getElementById("receta_id_bp")?.value || "";

    const variantes = Array.isArray(window.APP_CACHE?.CAT_VARIANTES_PRODUCTO)
        ? window.APP_CACHE.CAT_VARIANTES_PRODUCTO
        : [];

    const filtradas = variantes.filter(v => String(v.ID_BP) === String(bp));

    const sel = document.getElementById("receta_id_variante");
    if (!sel) return;

    sel.innerHTML = `<option value="">Seleccione...</option>` +
        filtradas.map(v =>
            `<option value="${v.ID_VARIANTE}">${v.ID_VARIANTE}</option>`
        ).join("");
}

function validarBaseReceta() {
    const bp = document.getElementById("receta_id_bp")?.value || "";
    const variante = document.getElementById("receta_id_variante")?.value || "";
    const porciones = parseFloat(document.getElementById("receta_porciones")?.value || 0);
    const section = document.getElementById("section-relacionReceta");

    // Si falta algún dato importante, ocultamos la sección y salimos
    if (!bp || !variante || porciones <= 0) {
        if (section) section.classList.add("hidden");
        window.recetaBaseTemp = {}; // Limpiamos el temporal
        return;
    }

    const activo = document.getElementById("receta_activo")?.value || "";
    window.recetaBaseTemp = { bp, variante, porciones, activo };

    activarSeccionRelacionIngredientes();
}

function activarSeccionRelacionIngredientes() {
    const section = document.getElementById("section-relacionReceta");
    if (section) section.classList.remove("hidden");

    renderTablaSeleccionMP();
}

function renderTablaSeleccionMP() {
    const data = Array.isArray(window.APP_CACHE?.CAT_MATERIA_PRIMA)
        ? window.APP_CACHE.CAT_MATERIA_PRIMA
        : [];

    const container = document.getElementById("tabla-mp-container");
    if (!container) return;

    container.innerHTML = `
        <input type="text" id="buscador-mp" placeholder="Buscar..." onkeyup="filtrarMP()" />

        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>Ingrediente</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="tabla-mp-body">
                ${data.map(mp => {
        const activo = String(mp.ACTIVO) === "1";

        return `
                    <tr style="${!activo ? 'opacity:0.5;' : ''}">
                        <td>
                            <input type="checkbox"
                                ${!activo ? 'disabled' : ''}
                                onchange="toggleIngrediente('${mp.ID_MP}')">
                        </td>

                        <td>${mp.NOMBRE || ""}</td>

                        <td>

                           <button type="button"
    onclick="event.preventDefault(); event.stopPropagation(); verDetalleMP('${mp.ID_MP}')">
    👁️
</button>

<button type="button"
    id="btn-config-${mp.ID_MP}"
    disabled
    onclick="event.preventDefault(); event.stopPropagation(); abrirModalCantidad('${mp.ID_MP}', '${mp.NOMBRE || ""}')">
    ⚙️
</button>

<button type="button"
    id="btn-remove-${mp.ID_MP}"
    style="display:none;"
    onclick="event.preventDefault(); event.stopPropagation(); quitarIngrediente('${mp.ID_MP}')">
    ❌
</button>

                        </td>
                    </tr>
                    `;
    }).join("")}
            </tbody>
        </table>
    `;
}

function toggleIngrediente(id_mp) {
    const checkbox = document.querySelector(`#tabla-mp-body input[onchange*="${id_mp}"]`);
    const btnConfig = document.getElementById(`btn-config-${id_mp}`);

    if (!btnConfig) return;

    if (checkbox && checkbox.checked) {
        // Estado Activo
        btnConfig.disabled = false;
        btnConfig.style.background = "#22c55e";
        btnConfig.style.color = "#fff";
    } else {
        // Estado Desactivado (si se desmarca la casilla)
        btnConfig.disabled = true;
        btnConfig.style.background = ""; // Reset color
        btnConfig.style.color = "";
        // Si ya estaba en la lista de ingredientes, lo quitamos
        quitarIngrediente(id_mp);
    }
}

function quitarIngrediente(id_mp) {
    // eliminar del array
    window.relacionRecetaTemporales =
        window.relacionRecetaTemporales.filter(i => i.ID_MP != id_mp);

    // reset botón config
    const btnConfig = document.getElementById(`btn-config-${id_mp}`);
    if (btnConfig) {
        btnConfig.disabled = true; // 🔥 CLAVE
        btnConfig.removeAttribute("style");
    }

    // ocultar botón quitar
    const btnRemove = document.getElementById(`btn-remove-${id_mp}`);
    if (btnRemove) btnRemove.style.display = "none";

    // 🔥 DESMARCAR CHECKBOX (CLAVE)
    const checkbox = document.querySelector(`#tabla-mp-body input[onchange*="${id_mp}"]`);
    if (checkbox) checkbox.checked = false;

    // actualizar UI
    renderListaIngredientes();
    recalcularCostoTotal();
    validarRecetaCompleta();
}


function validarRecetaCompleta() {
    const checks = document.querySelectorAll("#tabla-mp-body input:checked");
    const listaTemp = window.relacionRecetaTemporales || [];
    const btn = document.getElementById("btnFinalizarReceta");

    // Habilitar solo si: 
    // 1. Hay al menos un check.
    // 2. La cantidad de checks coincide con la cantidad de configurados en el temporal.
    const todoConfigurado = checks.length > 0 && checks.length === listaTemp.length;

    if (btn) btn.disabled = !todoConfigurado;
}

function verDetalleMP(id_mp) {

    const data = Array.isArray(window.APP_CACHE?.CAT_MATERIA_PRIMA)
        ? window.APP_CACHE.CAT_MATERIA_PRIMA
        : [];

    const row = data.find(x => String(x.ID_MP) === String(id_mp));

    if (!row) {
        console.warn("MP no encontrada:", id_mp);
        return;
    }

    currentSheet = "CAT_MATERIA_PRIMA";

    openModal("edit", row);
}


// function verDetalleMP(id_mp) {
//     currentSheet = "CAT_MATERIA_PRIMA";
//     editRecord(id_mp);
// }

function filtrarMP() {
    const input = document.getElementById("buscador-mp");
    const filtro = (input?.value || "").toLowerCase();

    const filas = document.querySelectorAll("#tabla-mp-body tr");

    filas.forEach(tr => {
        const txt = (tr.innerText || "").toLowerCase();
        tr.style.display = txt.includes(filtro) ? "" : "none";
    });
}


// =================================================
// ================= RECETAS =================
function abrirModalCantidad(id_mp, nombre) {
    const modal = document.getElementById("modalCantidadMP");
    if (!modal) return;

    // 1. Mostrar nombres y IDs
    document.getElementById("mp_nombre").innerText = nombre || "";
    document.getElementById("mp_id").value = id_mp || "";

    // 2. Poblar unidad
    poblarSelectMaestro("mp_unidad", "LST_UNIDADES", "ID_UNIDAD", "ABREVIATURA");

    // 3. BUSCAR SI YA EXISTE EN EL TEMPORAL
    const itemExistente = (window.relacionRecetaTemporales || []).find(i => String(i.ID_MP) === String(id_mp));

    const inputCantidad = document.getElementById("mp_cantidad");
    const selectUnidad = document.getElementById("mp_unidad");

    if (itemExistente) {
        // Si existe, cargamos los datos guardados en la lista temporal
        if (inputCantidad) inputCantidad.value = itemExistente.CANTIDAD;
        if (selectUnidad) selectUnidad.value = itemExistente.ID_UNIDAD;
    } else {
        // Si es nuevo, limpiamos
        if (inputCantidad) inputCantidad.value = "";
        if (selectUnidad) selectUnidad.value = "";
    }

    modal.style.display = "block";
    modal.style.zIndex = "2000"; // Asegurar que esté encima (Punto 4)
}



function cerrarModalCantidad() {
    const modal = document.getElementById("modalCantidadMP");
    if (modal) modal.style.display = "none";
}





function confirmarIngrediente() {
    const id_mp = document.getElementById("mp_id")?.value || "";
    const unidad = document.getElementById("mp_unidad")?.value || "";
    const cantidad = parseFloat(document.getElementById("mp_cantidad")?.value || 0);

    if (!id_mp || !unidad || !isFinite(cantidad) || cantidad <= 0) {
        showToast("Datos incompletos o inválidos", "error");
        return;
    }

    const mpList = Array.isArray(window.APP_CACHE?.CAT_MATERIA_PRIMA)
        ? window.APP_CACHE.CAT_MATERIA_PRIMA
        : [];


    const mp = mpList.find(x => x.ID_MP == id_mp);

    if (!mp || !mp.ID_MP) {
        showToast("Materia prima no encontrada", "error");
        return;
    }

    const costoBase = parseFloat(mp.COSTO_CALCULADO || 0);
    const costo = costoBase * cantidad;




    // 🔥 EVITAR DUPLICADOS (CLAVE)
    const existeIndex = window.relacionRecetaTemporales.findIndex(i => i.ID_MP == id_mp);

    if (existeIndex !== -1) {
        // actualizar
        window.relacionRecetaTemporales[existeIndex] = {
            ID_MP: id_mp,
            NOMBRE: mp.NOMBRE || "",
            ID_UNIDAD: unidad,
            CANTIDAD: cantidad,
            COSTO_IMP_USADO: isNaN(costo) ? 0 : costo
        };
    } else {
        // agregar nuevo
        window.relacionRecetaTemporales.push({
            ID_MP: id_mp,
            NOMBRE: mp.NOMBRE || "",
            ID_UNIDAD: unidad,
            CANTIDAD: cantidad,
            COSTO_IMP_USADO: isNaN(costo) ? 0 : costo
        });
    }

    cerrarModalCantidad();

    // actualizar UI
    renderListaIngredientes();
    recalcularCostoTotal();

    // mostrar botón quitar
    const btnRemove = document.getElementById(`btn-remove-${id_mp}`);
    if (btnRemove) btnRemove.style.display = "inline-block";

    // 🔥 marcar checkbox automáticamente (PRO UX)
    const checkbox = document.querySelector(`#tabla-mp-body input[onchange*="${id_mp}"]`);
    if (checkbox) checkbox.checked = true;

    // 🔥 cambiar botón config a estado "ya configurado"
    const btnConfig = document.getElementById(`btn-config-${id_mp}`);
    if (btnConfig) {
        btnConfig.disabled = false;
        btnConfig.style.background = "#16a34a"; // verde más sólido
        btnConfig.style.color = "#fff";
    }

    // validar receta completa
    validarRecetaCompleta();
}



function renderListaIngredientes() {
    const tbody = document.getElementById("ingredientes-body");
    if (!tbody) return;

    const lista = Array.isArray(window.relacionRecetaTemporales)
        ? window.relacionRecetaTemporales
        : [];

    tbody.innerHTML = lista.map((item, i) => `
        <tr>
            <td>${item.NOMBRE}</td>
            <td>${item.CANTIDAD}</td>
            <td>${item.ID_UNIDAD}</td>
            <td>$${(item.COSTO_IMP_USADO || 0).toFixed(2)}</td>
            <td>
                <button type="button"
    onclick="event.preventDefault(); eliminarRelacionIngredientes(${i})">
    ❌
</button>
            </td>
        </tr>
    `).join("");

    const btn = document.getElementById("btnFinalizarReceta");
    if (btn) btn.disabled = lista.length === 0;
}

function eliminarRelacionIngredientes(index) {
    if (!Array.isArray(window.relacionRecetaTemporales)) return;

    window.relacionRecetaTemporales.splice(index, 1);

    renderListaIngredientes();
    recalcularCostoTotal();
}

function recalcularCostoTotal() {
    const lista = Array.isArray(window.relacionRecetaTemporales)
        ? window.relacionRecetaTemporales
        : [];

    const total = lista.reduce((acc, item) => {
        const val = parseFloat(item.COSTO_IMP_USADO || 0);
        return acc + (isNaN(val) ? 0 : val);
    }, 0);

    const input = document.getElementById("receta_costo_total");
    if (input) input.value = total.toFixed(2);
}


async function guardarRecetaCompleta() {
    const btn = document.getElementById("btnFinalizarReceta");

    // Efecto visual de click
    if (btn) {
        btn.style.transform = "scale(0.95)";
        setTimeout(() => btn.style.transform = "scale(1)", 100);
    }

    const base = window.recetaBaseTemp || {};
    const detalle = Array.isArray(window.relacionRecetaTemporales) ? window.relacionRecetaTemporales : [];

    // Validación de datos antes de enviar
    if (!base.bp || !base.variante || detalle.length === 0) {
        showToast("⚠️ Falta información base o ingredientes", "error");
        return;
    }

    const payload = {
        action: "save_receta_completa",
        // Especificamos todas las tablas que se ven afectadas por esta acción
        tablas_a_refrescar: ["CAT_RECETAS", "REL_RECETA_MP"], 
        header: {
            ID_BP: base.bp,
            ID_VARIANTE: base.variante,
            PORCIONES: base.porciones,
            ACTIVO: base.activo || "1"
        },
        items: detalle.map(i => ({
            ID_MP: i.ID_MP,
            ID_UNIDAD: i.ID_UNIDAD,
            CANTIDAD: i.CANTIDAD,
            INSTRUCCIONES: i.INSTRUCCIONES || "",
            COSTO_IMP_USADO: i.COSTO_IMP_USADO
        }))
    };

    try {
        
        closeModal();
        showLoader("Guardando Receta Completa...");

        const res = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const json = await res.json();

        if (json?.status === "success") {
            // 1. ACTUALIZACIÓN MASIVA DEL CACHÉ (Igual que en Maestro Productos)
            if (json.multiTablas) {
                for (const tablaNom in json.multiTablas) {
                    window.APP_CACHE[tablaNom] = json.multiTablas[tablaNom];
                }
            }

            // 2. LIMPIEZA DE ESTADOS TEMPORALES
            window.recetaBaseTemp = {};
            window.relacionRecetaTemporales = [];
            
            // Si tienes una función específica de reset, úsala:
            if (typeof resetRecetaState === "function") resetRecetaState();

            // 3. ACTUALIZACIÓN DE LA INTERFAZ
            // Cerramos todos los posibles modales abiertos en este flujo
            closeModal(); 
            const mReceta = document.getElementById("formModalReceta");
            if (mReceta) mReceta.style.display = "none";

            // 4. RECARGA DEL MÓDULO Y BADGES
            // Cambiamos a la tabla de recetas para ver el nuevo registro
            currentSheet = "CAT_RECETAS"; 
            loadModule("CAT_RECETAS");
            actualizarBadges();

            showToast("✅ Receta guardada y tablas actualizadas", "success");

        } else {
            throw new Error(json?.message || "Error desconocido");
        }

    } catch (e) {
        console.error("Error en guardarRecetaCompleta:", e);
        showToast("❌ Error al guardar la receta", "error");
    } finally {
        hideLoader();
    }
}

///////////////////////////
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

    // --- INTELIGENCIA DINÁMICA DE ACTUALIZACIÓN ---
    // Aquí definimos las relaciones para que el caché no quede obsoleto
    if (currentSheet === "CAT_PRODUCTOS" || currentSheet === "CAT_VARIANTES_PRODUCTO") {
        obj.tablas_a_refrescar = ["CAT_PRODUCTOS", "CAT_VARIANTES_PRODUCTO"];
    } 
    else if (currentSheet === "CAT_RECETAS" || currentSheet === "REL_RECETA_MP") {
        // SI EDITAS LA RECETA O UN INGREDIENTE SUELTO, REFRESCAMOS AMBAS
        obj.tablas_a_refrescar = ["CAT_RECETAS", "REL_RECETA_MP"];
    } 
    else {
        obj.tablas_a_refrescar = [currentSheet]; 
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
            // ACTUALIZACIÓN MASIVA DEL CACHÉ
            if (result.multiTablas) {
                for (const tablaNom in result.multiTablas) {
                    window.APP_CACHE[tablaNom] = result.multiTablas[tablaNom];
                }
            }

            loadModule(currentSheet);
            actualizarBadges();
            showToast(obj.action === "update" ? "✅ Editado correctamente" : "✅ Registrado correctamente");
            
            // Doble seguridad para cerrar modales
            closeModal();
            const mExtra = document.getElementById("formModal");
            if(mExtra) mExtra.style.display = "none";
            
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
    // Agregamos la advertencia sobre ingredientes
    if (!id || !confirm("¿Eliminar este registro? Si es una Receta, se eliminarán todos sus ingredientes vinculados.")) return;

    let tablasRefrescar = [currentSheet];
    
    // --- AQUÍ ESTÁ EL TRUCO ---
    if (currentSheet === "CAT_PRODUCTOS") {
        tablasRefrescar = ["CAT_PRODUCTOS", "CAT_VARIANTES_PRODUCTO"];
    } else if (currentSheet === "CAT_RECETAS") {
        // Si borramos receta, obligamos a refrescar los ingredientes también
        tablasRefrescar = ["CAT_RECETAS", "REL_RECETA_MP"];
    }

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
            // Sincronización masiva de caché (esto ya lo tienes, es vital)
            if (result.multiTablas) {
                for (const t in result.multiTablas) {
                    window.APP_CACHE[t] = result.multiTablas[t];
                }
            }
            loadModule(currentSheet);
            actualizarBadges();
            closeModal();
            showToast("🗑️ Eliminado y caché sincronizado");
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
    const m1 = document.getElementById("formModal");
    const m2 = document.getElementById("formModalProducto");
    const m3 = document.getElementById("formModalReceta");
    const m4 = document.getElementById("modalCantidadMP");

    if (m1) m1.style.display = "none";
    if (m2) m2.style.display = "none";
    if (m3) m3.style.display = "none";
    if (m4) m4.style.display = "none";

    document.getElementById("dynamicForm")?.reset();
    document.getElementById("formMaestroProducto")?.reset();
    document.getElementById("formMaestroReceta")?.reset();

    productoBaseTemp = {};
    variantesTemp = [];
}

function resetRecetaState() {
    window.recetaBaseTemp = {};
    window.relacionRecetaTemporales = [];
}

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

