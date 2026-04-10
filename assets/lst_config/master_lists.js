
//     // <script src="../assets/script/module_pages/master_lists.js"></script>
// const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxteSwDAwBshWCBDnydRmu8wC-QT9iyUwG2EJD6SOQ_l5XQEBnVm36QKmJ3mULcTOSUBQ/exec";

// const CONFIG = {
//     "LST_UNIDADES": ["ID_UNIDAD", "NOMBRE", "ABREVIATURA", "TIPO_UNIDAD", "ES_UNIDAD_BASE", "FACTOR_CONVERSION", "ACTIVO"],
//     "LST_TIPO_GASTO": ["ID_TP_GASTO", "NOMBRE", "DESCRIPCION", "ACTIVO"],
//     "LST_ESTADOS_PRODUCCION": ["ID_ESTADO_PROD", "NOMBRE", "COMENTARIO", "ACTIVO"],
//     "LST_ESTADOS_INVENTARIO": ["ID_ESTADO_INV", "NOMBRE", "COMENTARIO", "ACTIVO"],
//     "LST_SABORES": ["ID_SABOR", "NOMBRE", "COMENTARIO", "ACTIVO"],
//     "LST_PRESENTACIONES": ["ID_PRESENTACION", "NOMBRE", "COMENTARIO", "ACTIVO"],
//     "LST_CATEGORIAS": ["ID_CATEGORIA", "NOMBRE", "COMENTARIO", "ACTIVO"],
//     "LST_PUNTOS_VENTA": ["ID_PUNTO_V", "NOMBRE_LOCAL", "RESPONSABLE", "TELEFONO", "DIRECCIÓN", "PORCENTAJE", "DIAS_ENTREGA", "LIMITE_CREDITO", "FECHA_REGISTRO", "ACTIVO"]
// };


// const COLUMNAS_VISIBLES = {
//     "LST_UNIDADES": ["NOMBRE", "TIPO_UNIDAD", "ES_UNIDAD_BASE", "FACTOR_CONVERSION", "ACTIVO"],
//     "LST_TIPO_GASTO": ["NOMBRE", "DESCRIPCION", "ACTIVO"],
//     "LST_ESTADOS_PRODUCCION": ["NOMBRE", "COMENTARIO", "ACTIVO"],
//     "LST_ESTADOS_INVENTARIO": ["NOMBRE", "COMENTARIO", "ACTIVO"],
//     "LST_SABORES": ["NOMBRE", "COMENTARIO", "ACTIVO"],
//     "LST_PRESENTACIONES": ["NOMBRE", "COMENTARIO", "ACTIVO"],
//     "LST_CATEGORIAS": ["NOMBRE", "COMENTARIO", "ACTIVO"],
//     "LST_PUNTOS_VENTA": ["NOMBRE_LOCAL", "PORCENTAJE", "DIAS_ENTREGA", "ACTIVO"]
//     // Agrega aquí manualmente las columnas que quieras ver por cada tabla
// };



// // const CONFIG = {............

// // ===== UI LOADER + MENSAJES =====
// function showLoader(msg = "Procesando...") {
//     let loader = document.getElementById("globalLoader");

//     if (!loader) {
//         loader = document.createElement("div");
//         loader.id = "globalLoader";
//         // loader.innerHTML = `
//         //     <div style="background:white;padding:25px;border-radius:12px;text-align:center">
//         //         <div class="spinner"></div>
//         //         <p id="loaderText">${msg}</p>
//         //     </div>`;

//         loader.innerHTML = `
// <div style="background:white;padding:30px;border-radius:16px;text-align:center;width:200px">
//     <div class="spinner"></div>
//     <p id="loaderText" style="margin-top:15px;font-weight:600">${msg}</p>
// </div>`;
//         document.body.appendChild(loader);
//     }

//     loader.style.display = "flex";
//     document.getElementById("loaderText").innerText = msg;
// }

// function hideLoader() {
//     const loader = document.getElementById("globalLoader");
//     if (loader) loader.style.display = "none";
// }

// function showToast(msg, type = "success") {
//     const toast = document.createElement("div");
//     toast.className = `toast ${type}`;
//     toast.innerText = msg;

//     document.body.appendChild(toast);

//     setTimeout(() => toast.classList.add("show"), 50);
//     setTimeout(() => {
//         toast.classList.remove("show");
//         setTimeout(() => toast.remove(), 300);
//     }, 2500);
// }

// async function cargarInicial() {
//     try {
//         showLoader("Cargando sistema...");

//         const res = await fetch(WEB_APP_URL);
//         const result = await res.json();

//         window.APP_CACHE = result.data || {};

//         hideLoader();

//         document.dispatchEvent(new Event("ERP_READY"));

//     } catch (e) {
//         console.error("Error cargando sistema:", e);
//         hideLoader();
//         showToast("❌ Error cargando datos", "error");
//     }
// }



// let currentSheet = "LST_UNIDADES";

// // 🚀 CARGA REAL DEL SISTEMA
// cargarInicial();

// // 👇 ESTE SE QUEDA
// document.addEventListener("ERP_READY", iniciarModulo);

// function iniciarModulo() {
//     const first = document.querySelector('.module-btn');
//     loadModule("LST_UNIDADES", first);
//     actualizarBadges();
// }

// /* ========= BUSCADOR EN TIEMPO REAL ========= */
// function filtrarTabla() {
//     const input = document.getElementById("searchInput");
//     if (!input) return;
//     const filter = input.value.toUpperCase();
//     const rows = document.querySelector("#table-body").getElementsByTagName("tr");

//     for (let i = 0; i < rows.length; i++) {
//         // Busca en la columna NOMBRE (usualmente la segunda, índice 1)
//         const cellNombre = rows[i].getElementsByTagName("td")[1];
//         if (cellNombre) {
//             const textValue = cellNombre.textContent || cellNombre.innerText;
//             rows[i].style.display = textValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
//         }
//     }
// }

// /* ========= UTILIDADES DE ETIQUETAS ========= */
// function getFriendlyLabel(field) {
//     if (field.startsWith("ID_")) return "No";
//     if (field === "TIPO_UNIDAD") return "P. FISICA";
//     if (field === "ES_UNIDAD_BASE") return "EB";
//     if (field === "FACTOR_CONVERSION") return "FACTOR";
//     if (field === "ACTIVO") return "EA";
//     if (field === "ACCIONES") return "ACC";
//     return field.replace(/_/g, ' ');
// }







// /* ========= CAMBIAR MODULO ========= */
// function loadModule(sheetName, element) {
//     currentSheet = sheetName;

//     // Limpiar buscador al cambiar de tabla
//     const searchInput = document.getElementById("searchInput");
//     if (searchInput) searchInput.value = "";

//     document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
//     if (element) element.classList.add('active');
//     document.getElementById('current-table-title').innerText = sheetName.replace('LST_', '').replace(/_/g, ' ');

//     renderSkeleton();
//     const data = window.APP_CACHE[sheetName] || [];
//     renderData(data);
// }

// /* ========= CONTADORES ========= */
// function actualizarBadges() {
//     Object.keys(CONFIG).forEach(sheet => {
//         const data = window.APP_CACHE[sheet] || [];
//         updateBadge(sheet, data.length);
//     });
// }

// /* ========= TABLA ========= */
// /* ========= TABLA ========= */
// function renderSkeleton() {
//     const head = document.getElementById('table-head');

//     // PRIORIDAD: 1. Manual en COLUMNAS_VISIBLES | 2. Primeros 4 de CONFIG
//     const tableFields = COLUMNAS_VISIBLES[currentSheet] || CONFIG[currentSheet].slice(0, 4);

//     head.innerHTML = tableFields
//         .map(f => `<th style="text-align: center; position: sticky; top: 0; background: #1e293b; color: white;">${getFriendlyLabel(f)}</th>`).join('')
//         + `<th style="text-align: center; position: sticky; top: 0; background: #1e293b; color: white;">ACC</th>`;

//     document.getElementById('table-body').innerHTML = `<tr><td colspan="6">Cargando...</td></tr>`;
// }

// function renderData(data) {
//     // Usamos la misma lógica de selección de columnas
//     const tableFields = COLUMNAS_VISIBLES[currentSheet] || CONFIG[currentSheet].slice(0, 4);
//     const body = document.getElementById('table-body');

//     if (!Array.isArray(data) || data.length === 0) {
//         body.innerHTML = `<tr><td colspan="6" class="status-indicator danger">Sin datos</td></tr>`;
//         return;
//     }

//     const sortedData = [...data].sort((a, b) => {
//         const idField = CONFIG[currentSheet][0];
//         const valA = String(a[idField] || "");
//         const valB = String(b[idField] || "");
//         return valB.localeCompare(valA, undefined, { numeric: true });
//     });

//     body.innerHTML = sortedData.map((row, index) => {
//         let rowStyle = "";
//         if (index === 0) rowStyle = 'style="background-color: #e0f2fe; border-left: 5px solid #0284c7;"';

//         return `
//             <tr ${rowStyle}>
//                 ${tableFields.map(f => {
//             let val = row[f] || '';
//             if (f === "ACTIVO" || f === "ES_UNIDAD_BASE") {
//                 val = String(val) === "1" ? "✅ SI" : "❌ NO";
//             }
//             return `<td style="text-align: left; padding: 10px;">${val}</td>`;
//         }).join('')}
//                 <td style="text-align: center;"> 
//                     <button class="btn-edit" onclick='openModal("edit", ${JSON.stringify(row)})'>
//                         <i class="fas fa-edit"></i>
//                     </button>
//                 </td>
//             </tr>`;
//     }).join('');
// }
// /* ========= MODAL ========= */
// function openModal(mode, data = null) {
//     const modal = document.getElementById('formModal');
//     // Cambiamos el display a FLEX para que se vea y se centre



//     // modal.style.setProperty('display', 'flex', 'important');

//     modal.style.display = "flex";
//     const container = document.getElementById('formInputs');
//     const footer = document.querySelector('.modal-footer');
//     const fields = CONFIG[currentSheet];

//     document.getElementById('modalTitle').innerText = mode === "add" ? "Registrar Nuevo" : "Editar Detalles";

//     container.innerHTML = fields.map((f, index) => {
//         if (index === 0 && mode === "add") return "";

//         const labelText = getFriendlyLabel(f);
//         const isReadOnly = index === 0 && mode === "edit";
//         const value = data ? data[f] : '';

//         if (f === "ES_UNIDAD_BASE" || f === "ACTIVO") {
//             // Mejora en detección de radios
//             const currentVal = String(value);
//             const isCheckedSi = (mode === "add" || currentVal === "1") ? "checked" : "";
//             const isCheckedNo = (currentVal === "0") ? "checked" : "";

//             return `
//             <div class="field-container">
//                 <label class="field-label">${labelText}</label>
//                 <div class="radio-group-pro">
//                     <label class="radio-option">
//                         <input type="radio" name="${f}" value="1" ${isCheckedSi} onchange="toggleFactorConversion()"> 
//                         <span>SI (1)</span>
//                     </label>
//                     <label class="radio-option">
//                         <input type="radio" name="${f}" value="0" ${isCheckedNo} onchange="toggleFactorConversion()"> 
//                         <span>NO (0)</span>
//                     </label>
//                 </div>
//             </div>`;
//         }

//         const fullWidthFields = ['COMENTARIO', 'DESCRIPCION', 'NOMBRE', 'DIRECCIÓN'];
//         const isFullWidth = fullWidthFields.some(word => f.includes(word)) ? 'full-width' : '';

//         return `
//         <div class="field-container ${isFullWidth}">
//             <label class="field-label">${labelText}</label>
//             <div class="field-input">
//                 <input type="text" name="${f}" id="input_${f}" value="${value}" 
//                     placeholder="Escriba aquí..." ${isReadOnly ? "readonly" : ""} required>
//             </div>
//         </div>`;
//     }).join('');

//     modal.dataset.mode = mode;
//     footer.innerHTML = `
//         ${mode === "edit" ? `<button type="button" class="btn-delete-text" onclick="deleteRecord('${data[fields[0]]}')"><i class="fas fa-trash-alt"></i> Eliminar</button>` : ''}
//         <button type="button" class="btn-base btn-cancel" onclick="closeModal()">Cancelar</button>
//         <button type="button" class="btn-base btn-save" onclick="saveRecord()">
//             <i class="fas fa-check-circle"></i> ${mode === "edit" ? 'Actualizar' : 'Guardar'}
//         </button>`;

//     // modal.style.display = "block";
//     toggleFactorConversion();
// }

// function toggleFactorConversion() {
//     const radioUnidadBase = document.querySelector('input[name="ES_UNIDAD_BASE"]:checked');
//     const inputFactor = document.getElementById('input_FACTOR_CONVERSION');
//     if (!radioUnidadBase || !inputFactor) return;

//     if (radioUnidadBase.value === "1") {
//         inputFactor.value = "1";
//         inputFactor.readOnly = true;
//         inputFactor.style.backgroundColor = "#e2e8f0";
//     } else {
//         inputFactor.readOnly = false;
//         inputFactor.style.backgroundColor = "#f8fafc";
//         if (inputFactor.value === "1") inputFactor.value = "";
//     }
// }

// function closeModal() {
//     const modal = document.getElementById("formModal");
//     // Lo volvemos a ocultar
//     modal.style.setProperty('display', 'none', 'important');
// }
// /* ========= OPERACIONES (CRUD) ========= */




// /* ========= OPERACIONES (CRUD) ACTUALIZADAS CON DELAY ========= */
// // Master_lists.js - Versión Optimización Instantánea

// /* ... (Tus CONFIG y COLUMNAS_VISIBLES se mantienen igual) ... */

// async function saveRecord() {
//     const modal = document.getElementById('formModal');
//     const container = document.getElementById('formInputs');
//     const obj = {};

//     // Recolectar datos del formulario
//     container.querySelectorAll('input:not([type="radio"])')
//         .forEach(i => obj[i.name] = (i.value || "").trim());

//     container.querySelectorAll('input[type="radio"]:checked')
//         .forEach(r => obj[r.name] = r.value);

//     obj.tabla = currentSheet;
//     obj.action = modal.dataset.mode === "edit" ? "update" : "insertar";

//     try {
//         showLoader("Guardando cambios...");

//         // 1. Enviamos la petición por POST (usando fetch normal para recibir respuesta)
//         const response = await fetch(WEB_APP_URL, {
//             method: "POST",
//             body: JSON.stringify(obj)
//         });

//         const result = await response.json();

//         if (result.status === "success") {
//             // 2. ¡LA CLAVE! Actualizamos SOLO la tabla que cambió en el Cache Local
//             // El servidor ahora nos manda 'dataActualizada' con solo esa hoja
//             window.APP_CACHE[currentSheet] = result.dataActualizada;

//             // 3. Redibujamos la UI solo con los datos nuevos (INSTANTÁNEO)
//             loadModule(currentSheet);
//             actualizarBadges();

//             hideLoader();
//             closeModal();
//             showToast(obj.action === "update" ? "✅ Editado correctamente" : "✅ Registrado correctamente");
//         } else {
//             throw new Error(result.message);
//         }

//     } catch (e) {
//         console.error("Error en saveRecord:", e);
//         hideLoader();
//         showToast("❌ Error al guardar", "error");
//     }
// }

// async function deleteRecord(id) {
//     if (!id || !confirm("¿Eliminar este registro permanentemente?")) return;

//     try {
//         showLoader("Eliminando...");

//         const response = await fetch(WEB_APP_URL, {
//             method: "POST",
//             body: JSON.stringify({
//                 action: "delete",
//                 tabla: currentSheet,
//                 id: id
//             })
//         });

//         const result = await response.json();

//         if (result.status === "success") {
//             // Actualizamos solo la tabla afectada en memoria
//             window.APP_CACHE[currentSheet] = result.dataActualizada;

//             loadModule(currentSheet);
//             actualizarBadges();

//             hideLoader();
//             closeModal();
//             showToast("🗑️ Eliminado correctamente");
//         }
//     } catch (e) {
//         hideLoader();
//         showToast("❌ Error al eliminar", "error");
//     }
// }

// // Esta función ahora solo se usa para recargas manuales forzadas
// async function refrescarTodo() {
//     showLoader("Sincronizando sistema...");
//     const timestamp = new Date().getTime();
//     const res = await fetch(WEB_APP_URL + "?v=" + timestamp);
//     const result = await res.json();
//     window.APP_CACHE = result.data;
//     loadModule(currentSheet);
//     actualizarBadges();
//     hideLoader();
// }
// function updateBadge(sheetName, count) {
//     const btn = document.querySelector(`[onclick*="${sheetName}"] .status-indicator`);
//     if (!btn) return;

//     btn.innerText = count > 0 ? `${count} re...` : "Vacío";
//     btn.className = count > 0 ? "status-indicator success" : "status-indicator danger";
// }










// ===== CONFIG =====
//REF. POSICION ANTES DE REFC// ../assets/script/module_pages/listas_maestras/master_lists.js
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxOf290HJgDNlOqjmYk1uMwC3msymjxHmMK6WkLgLP1UwCUf2BeeeuzOiEa7WgVVY1n_Q/exec";

const CONFIG = {
    "LST_UNIDADES": ["ID_UNIDAD", "NOMBRE", "ABREVIATURA", "TIPO_UNIDAD", "ES_UNIDAD_BASE", "FACTOR_CONVERSION", "ACTIVO"],
    "LST_TIPO_GASTO": ["ID_TP_GASTO", "NOMBRE", "DESCRIPCION", "ACTIVO"],
    "LST_ESTADOS_PRODUCCION": ["ID_ESTADO_PROD", "NOMBRE", "COMENTARIO", "ACTIVO"],
    "LST_ESTADOS_INVENTARIO": ["ID_ESTADO_INV", "NOMBRE", "COMENTARIO", "ACTIVO"],
    "LST_SABORES": ["ID_SABOR", "NOMBRE", "COMENTARIO", "ACTIVO"],
    "LST_PRESENTACIONES": ["ID_PRESENTACION", "NOMBRE", "COMENTARIO", "ACTIVO"],
    "LST_CATEGORIAS": ["ID_CATEGORIA", "NOMBRE", "COMENTARIO", "ACTIVO"],
    "LST_PUNTOS_VENTA": ["ID_PUNTO_V", "NOMBRE_LOCAL", "RESPONSABLE", "TELEFONO", "DIRECCION", "PORCENTAJE", "DIAS_ENTREGA", "LIMITE_CREDITO", "FECHA_REGISTRO", "ACTIVO"],
};

const COLUMNAS_VISIBLES = {
    "LST_UNIDADES": ["NOMBRE", "TIPO_UNIDAD", "ES_UNIDAD_BASE", "FACTOR_CONVERSION", "ACTIVO"],
    "LST_TIPO_GASTO": ["NOMBRE", "DESCRIPCION", "ACTIVO"],
    "LST_ESTADOS_PRODUCCION": ["NOMBRE", "COMENTARIO", "ACTIVO"],
    "LST_ESTADOS_INVENTARIO": ["NOMBRE", "COMENTARIO", "ACTIVO"],
    "LST_SABORES": ["NOMBRE", "COMENTARIO", "ACTIVO"],
    "LST_PRESENTACIONES": ["NOMBRE", "COMENTARIO", "ACTIVO"],
    "LST_CATEGORIAS": ["NOMBRE", "COMENTARIO", "ACTIVO"],
    "LST_PUNTOS_VENTA": ["NOMBRE_LOCAL", "PORCENTAJE",	"DIAS_ENTREGA",	"LIMITE_CREDITO", "ACTIVO"]
    // Agrega aquí manualmente las columnas que quieras ver por cada tabla
};

// ===== INIT APP =====
//REF. POSICION ANTES DE REFC// ../assets/script/globalLoader.js

// ¿Qué hace cargarInicial()?// Es el bootstrap del sistema.// Carga TODO lo necesario antes de que la UI empiece a funcionar.
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
let currentSheet = "LST_UNIDADES";
// 🚀 CARGA REAL DEL SISTEMA
cargarInicial();
// 👇 ESTE SE QUEDA
document.addEventListener("ERP_READY", iniciarModulo);
function iniciarModulo() {
    const first = document.querySelector('.module-btn');
    loadModule("LST_UNIDADES", first);
    actualizarBadges();
}// *****************

// //REF. POSICION ANTES DE REFC// ../assets/script/search.js
//REF. POSICION ANTES DE REFC // ../assets/script/table.js

/* ========= UTILIDADES DE ETIQUETAS ========= */
function getFriendlyLabel(field) {
    if (field.startsWith("ID_")) return "No";
    if (field === "TIPO_UNIDAD") return "FAC";
    if (field === "ES_UNIDAD_BASE") return "EB";
    if (field === "FACTOR_CONVERSION") return "DIV";
    if (field === "ACTIVO") return "EA";
    if (field === "ACCIONES") return "ACC";
    return field.replace(/_/g, ' ');
}

// ===== HELPERS =====
//REF. POSICION ANTES DE REFC // ../assets/script/module_pages/listas_maestras/ui_master_lists.js


// ===== CRUD =====
/* ========= OPERACIONES (CRUD) ACTUALIZADAS CON DELAY ========= */// Master_lists.js - Versión Optimización Instantánea// 👉 Es la función que toma lo que escribiste en el formulario y lo guarda en el sistema

async function saveRecord() {
    const modal = document.getElementById('formModal');
    const container = document.getElementById('formInputs');
    const obj = {};

    // Recolectar datos del formulario
    container.querySelectorAll('input:not([type="radio"])')
        .forEach(i => obj[i.name] = (i.value || "").trim());

    container.querySelectorAll('input[type="radio"]:checked')
        .forEach(r => obj[r.name] = r.value);

    obj.tabla = currentSheet;
    obj.action = modal.dataset.mode === "edit" ? "update" : "insertar";

    // 🔥 LA CLAVE: Le decimos al GS qué tablas queremos de vuelta.
    // Por ahora solo la actual, pero el sistema ya queda listo para crecer.
    obj.tablas_a_refrescar = [currentSheet]; 

    try {
        closeModal(); // Cerramos primero para dar sensación de velocidad
        showLoader("Guardando cambios...");

        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(obj)
        });

        const result = await response.json();

        if (result.status === "success") {
            // 🔥 CAMBIO AQUÍ: Ahora procesamos 'multiTablas' en lugar de 'dataActualizada'
            if (result.multiTablas) {
                for (const t in result.multiTablas) {
                    window.APP_CACHE[t] = result.multiTablas[t];
                }
            }

            loadModule(currentSheet);
            actualizarBadges();
             closeModal();
            showToast(obj.action === "update" ? "✅ Editado correctamente" : "✅ Registrado correctamente");
        } else {
            throw new Error(result.message);
        }

    } catch (e) {
        console.error("Error en saveRecord:", e);
        showToast("❌ Error al guardar", "error");
    } finally {
        hideLoader();
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
                id: id,
                tablas_a_refrescar: [currentSheet] // 🔥 Refresco inteligente
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            // 🔥 CAMBIO AQUÍ: Procesar multiTablas
            if (result.multiTablas) {
                for (const t in result.multiTablas) {
                    window.APP_CACHE[t] = result.multiTablas[t];
                }
            }

            loadModule(currentSheet);
            actualizarBadges();
             closeModal();
            showToast("🗑️ Eliminado correctamente");
        }
    } catch (e) {
        console.error("Error en deleteRecord:", e);
        showToast("❌ Error al eliminar", "error");
    } finally {
        hideLoader();
    }
}

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
