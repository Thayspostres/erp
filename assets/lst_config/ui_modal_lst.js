
{/* <script src="../assets/script/module_pages/listas_maestras/ui_master_lists.js"></script> */}
/* ========= MODAL ========= */
function openModal(mode, data = null) {
    const modal = document.getElementById('formModal');
    // Cambiamos el display a FLEX para que se vea y se centre

    // modal.style.setProperty('display', 'flex', 'important');

    modal.style.display = "flex";
    const container = document.getElementById('formInputs');
    const footer = document.querySelector('.modal-footer');
    const fields = CONFIG[currentSheet];

    document.getElementById('modalTitle').innerText = mode === "add" ? "Registrar Nuevo" : "Editar Detalles";

    container.innerHTML = fields.map((f, index) => {
        if (index === 0 && mode === "add") return "";

        const labelText = getFriendlyLabel(f);
        const isReadOnly = index === 0 && mode === "edit";
        const value = data ? data[f] : '';

        if (f === "ES_UNIDAD_BASE" || f === "ACTIVO") {
            // Mejora en detección de radios
            const currentVal = String(value);
            const isCheckedSi = (mode === "add" || currentVal === "1") ? "checked" : "";
            const isCheckedNo = (currentVal === "0") ? "checked" : "";

            return `
            <div class="field-container">
                <label class="field-label">${labelText}</label>
                <div class="radio-group-pro">
                    <label class="radio-option">
                        <input type="radio" name="${f}" value="1" ${isCheckedSi} onchange="toggleFactorConversion()"> 
                        <span>SI (1)</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="${f}" value="0" ${isCheckedNo} onchange="toggleFactorConversion()"> 
                        <span>NO (0)</span>
                    </label>
                </div>
            </div>`;
        }

        const fullWidthFields = ['COMENTARIO', 'DESCRIPCION', 'NOMBRE', 'DIRECCION'];
        const isFullWidth = fullWidthFields.some(word => f.includes(word)) ? 'full-width' : '';

        return `
        <div class="field-container ${isFullWidth}">
            <label class="field-label">${labelText}</label>
            <div class="field-input">
                <input type="text" name="${f}" id="input_${f}" value="${value}" 
                    placeholder="Escriba aquí..." ${isReadOnly ? "readonly" : ""} required>
            </div>
        </div>`;
    }).join('');

    modal.dataset.mode = mode;
    footer.innerHTML = `
        ${mode === "edit" ? `<button type="button" class="btn-delete-text" onclick="deleteRecord('${data[fields[0]]}')"><i class="fas fa-trash-alt"></i> Eliminar</button>` : ''}
        <button type="button" class="btn-base btn-cancel" onclick="closeModal()">Cancelar</button>
        <button type="button" class="btn-base btn-save" onclick="saveRecord()">
            <i class="fas fa-check-circle"></i> ${mode === "edit" ? 'Actualizar' : 'Guardar'}
        </button>`;

    // modal.style.display = "block";
    toggleFactorConversion();
}

function toggleFactorConversion() {
    const radioUnidadBase = document.querySelector('input[name="ES_UNIDAD_BASE"]:checked');
    const inputFactor = document.getElementById('input_FACTOR_CONVERSION');
    if (!radioUnidadBase || !inputFactor) return;

    if (radioUnidadBase.value === "1") {
        inputFactor.value = "1";
        inputFactor.readOnly = true;
        inputFactor.style.backgroundColor = "#e2e8f0";
    } else {
        inputFactor.readOnly = false;
        inputFactor.style.backgroundColor = "#f8fafc";
        if (inputFactor.value === "1") inputFactor.value = "";
    }
}

function closeModal() {
    const modal = document.getElementById("formModal");
    // Lo volvemos a ocultar
    modal.style.setProperty('display', 'none', 'important');
}