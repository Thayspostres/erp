// // //  <script src="../assets/cat_config/ui_modal_cat.js"></script>

// function openModal(mode, data = null) {



    
//     if (currentSheet === "CAT_PRODUCTOS" && mode === "add") {
//     return abrirModalMaestro();
// }

//     const modal = document.getElementById('formModal');
//     const container = document.getElementById('formInputs');
//     const footer = document.querySelector('.modal-footer');
//     const fields = CONFIG[currentSheet] || [];

//     if (!modal || !container || !footer || !Array.isArray(fields)) return;

//     modal.style.display = "flex";
//     document.getElementById('modalTitle').innerText =
//         mode === "add" ? "Registrar Nuevo" : "Editar Detalles";

//     container.innerHTML = fields.map((f, index) => {

//         if (!f || typeof f !== "object") return "";

//         if (f.type === "auto") {
//     const value = data && f.field ? (data[f.field] ?? "") : "";

//     return `<input type="hidden" name="${f.field}" value="${value}">`;
// }

//         const label = getFriendlyLabel(f.field || "");
//         const value = data && f.field ? (data[f.field] ?? "") : "";
//         const isReadOnly = f.type === "auto";

//         // ===== SELECT =====
//         if (f.type === "select") {
//             const sourceData = window.APP_CACHE?.[f.source] || [];

//             const options = Array.isArray(sourceData)
//                 ? sourceData.map(opt => {
//                     const val = opt?.[f.key] ?? "";
//                     const text = opt?.[f.display] ?? "";
//                     const selected = String(val) === String(value) ? "selected" : "";
//                     return `<option value="${val}" ${selected}>${text}</option>`;
//                 }).join('')
//                 : "";

//             return `
//             <div class="field-container">
//                 <label class="field-label">${label}</label>
//                 <div class="field-input">
//                     <select name="${f.field}" ${f.required ? "required" : ""}>
//                         <option value="">Seleccione...</option>
//                         ${options}
//                     </select>
//                 </div>
//             </div>`;
//         }

//         // ===== TEXTAREA =====
//         if (f.type === "textarea") {
//             return `
//             <div class="field-container full-width">
//                 <label class="field-label">${label}</label>
//                 <div class="field-input">
//                     <textarea name="${f.field}">${value}</textarea>
//                 </div>
//             </div>`;
//         }

//         // ===== CHECKBOX =====
//         if (f.type === "checkbox") {
//             const val = String(value || "1"); // default = 1

//             return `
//     <div class="field-container">
//         <label class="field-label">${label}</label>
//         <div class="field-input" style="display:flex; gap:15px; align-items:center;">
            
//             <label>
//                 <input type="radio" name="${f.field}" value="1" ${val === "1" ? "checked" : ""}>
//                 Sí
//             </label>

//             <label>
//                 <input type="radio" name="${f.field}" value="0" ${val === "0" ? "checked" : ""}>
//                 No
//             </label>

//         </div>
//     </div>`;
//         }

//         // ===== NUMBER =====
//         if (f.type === "number") {
//             return `
//             <div class="field-container">
//                 <label class="field-label">${label}</label>
//                 <div class="field-input">
//                     <input type="number"
//                         name="${f.field}"
//                         value="${value}"
//                         step="${f.step || "1"}"
//                         ${f.required ? "required" : ""}>
//                 </div>
//             </div>`;
//         }

//         // ===== TEXT DEFAULT =====
//         return `
//         <div class="field-container">
//             <label class="field-label">${label}</label>
//             <div class="field-input">
//                 <input type="text"
//                     name="${f.field}"
//                     value="${value}"
//                     ${f.required ? "required" : ""}
//                     ${isReadOnly ? "readonly" : ""}>
//             </div>
//         </div>`;

//     }).join('');

//     modal.dataset.mode = mode;

//     footer.innerHTML = `
//         ${mode === "edit" && data
//             ? `<button type="button" class="btn-delete-text" onclick="deleteRecord('${data[fields[0]?.field] || ""}')">Eliminar</button>`
//             : ''}

//         <button type="button" class="btn-base btn-cancel" onclick="closeModal()">Cancelar</button>

//         <button type="button" class="btn-base btn-save" onclick="saveRecord()">
//             ${mode === "edit" ? 'Actualizar' : 'Guardar'}
//         </button>
//     `;
// }




// function closeModal() {
//     const modal = document.getElementById("formModal");
//     // Lo volvemos a ocultar
//     modal.style.setProperty('display', 'none', 'important');
// }






  
// {/* <script src="../assets/cat_config/ui_modal_cat.js"></script> */}

function openModal(mode, data = null) {

    // Si estamos en Productos y es un registro nuevo
    if (currentSheet === "CAT_PRODUCTOS" && mode === "add") {
        return abrirModalMaestroProductos(); 
    }

    // Si estamos en Recetas y es un registro nuevo
    if (currentSheet === "CAT_RECETAS" && mode === "add") {
        return abrirModalMaestroReceta(); // <-- Nueva redirección
    }

    const modal = document.getElementById('formModal');
    const container = document.getElementById('formInputs');
    const footer = document.querySelector('.modal-footer');
    const fields = CONFIG[currentSheet] || [];

    if (!modal || !container || !footer || !Array.isArray(fields)) return;

    modal.style.display = "flex";
    document.getElementById('modalTitle').innerText =
        mode === "add" ? "Registrar Nuevo" : "Editar Detalles";

    // 🔥 HEADER SOLO PARA VARIANTES
    let headerHTML = "";
    if (currentSheet === "CAT_VARIANTES_PRODUCTO" && data) {
        const productos = window.APP_CACHE?.CAT_PRODUCTOS || [];
        const padre = productos.find(p => p.ID_BP === data.ID_BP) || {};

        headerHTML = `
            <div style="background:#f1f5f9;padding:10px;border-radius:6px;margin-bottom:15px;">
                <b>Producto Padre:</b><br>
                ${padre.ID_BP || ''} - ${padre.NOMBRE || ''}
            </div>
        `;
    }

    container.innerHTML = headerHTML + fields.map((f) => {

        if (!f || typeof f !== "object") return "";

        if (f.type === "auto") {
            const value = data && f.field ? (data[f.field] ?? "") : "";
            return `<input type="hidden" name="${f.field}" value="${value}">`;
        }

        const label = getFriendlyLabel(f.field || "");
        const value = data && f.field ? (data[f.field] ?? "") : "";
        const isReadOnly = f.type === "auto";

        // 🔥 IMAGEN (REUTILIZANDO TU SISTEMA)
        if (f.field === "IMAGEN_URL" || f.field === "IMAGEN_THUMB") {
            return `
            <div class="field-container">
                <label class="field-label">${label}</label>
                <div class="field-input">
                    ${
                        value
                        ? `<img src="${value}" style="width:80px;height:80px;border-radius:6px;margin-bottom:5px;">`
                        : 'Sin imagen'
                    }
                    <input type="file" name="IMAGEN_FILE">
                </div>
            </div>`;
        }

        // ===== SELECT =====
        if (f.type === "select") {
            const sourceData = window.APP_CACHE?.[f.source] || [];

            const options = Array.isArray(sourceData)
                ? sourceData.map(opt => {
                    const val = opt?.[f.key] ?? "";
                    const text = opt?.[f.display] ?? "";
                    const selected = String(val) === String(value) ? "selected" : "";
                    return `<option value="${val}" ${selected}>${text}</option>`;
                }).join('')
                : "";

            return `
            <div class="field-container">
                <label class="field-label">${label}</label>
                <div class="field-input">
                    <select name="${f.field}" ${f.required ? "required" : ""}>
                        <option value="">Seleccione...</option>
                        ${options}
                    </select>
                </div>
            </div>`;
        }

        // ===== TEXTAREA =====
        if (f.type === "textarea") {
            return `
            <div class="field-container full-width">
                <label class="field-label">${label}</label>
                <div class="field-input">
                    <textarea name="${f.field}">${value}</textarea>
                </div>
            </div>`;
        }

        // ===== CHECKBOX =====
        if (f.type === "checkbox") {
            const val = String(value || "1");

            return `
            <div class="field-container">
                <label class="field-label">${label}</label>
                <div class="field-input" style="display:flex; gap:15px;">
                    <label>
                        <input type="radio" name="${f.field}" value="1" ${val === "1" ? "checked" : ""}> Sí
                    </label>
                    <label>
                        <input type="radio" name="${f.field}" value="0" ${val === "0" ? "checked" : ""}> No
                    </label>
                </div>
            </div>`;
        }

        // ===== NUMBER =====
        if (f.type === "number") {
            return `
            <div class="field-container">
                <label class="field-label">${label}</label>
                <div class="field-input">
                    <input type="number"
                        name="${f.field}"
                        value="${value}"
                        step="${f.step || "1"}"
                        ${f.required ? "required" : ""}>
                </div>
            </div>`;
        }

        // ===== TEXT DEFAULT =====
        return `
        <div class="field-container">
            <label class="field-label">${label}</label>
            <div class="field-input">
                <input type="text"
                    name="${f.field}"
                    value="${value}"
                    ${f.required ? "required" : ""}
                    ${isReadOnly ? "readonly" : ""}>
            </div>
        </div>`;

    }).join('');

    modal.dataset.mode = mode;

    footer.innerHTML = `
        ${mode === "edit" && data
            ? `<button type="button" class="btn-delete-text" onclick="deleteRecord('${data[fields[0]?.field] || ""}')">Eliminar</button>`
            : ''}

        <button type="button" class="btn-base btn-cancel" onclick="closeModal()">Cancelar</button>

        <button type="button" class="btn-base btn-save" onclick="saveRecord()">
            ${mode === "edit" ? 'Actualizar' : 'Guardar'}
        </button>
    `;
}







