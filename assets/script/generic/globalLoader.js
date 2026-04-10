
// ===== UI LOADER + MENSAJES (#globalLoader)=====
function showLoader(msg = "Procesando...") {
    let loader = document.getElementById("globalLoader");

    if (!loader) {
        loader = document.createElement("div");
        loader.id = "globalLoader";
        // loader.innerHTML = `
        //     <div style="background:white;padding:25px;border-radius:12px;text-align:center">
        //         <div class="spinner"></div>
        //         <p id="loaderText">${msg}</p>
        //     </div>`;

        loader.innerHTML = `
<div style="background:white;padding:30px;border-radius:16px;text-align:center;width:200px">
    <div class="spinner"></div>
    <p id="loaderText" style="margin-top:15px;font-weight:600">${msg}</p>
</div>`;
        document.body.appendChild(loader);
    }

    loader.style.display = "flex";
    document.getElementById("loaderText").innerText = msg;
}

function hideLoader() {
    const loader = document.getElementById("globalLoader");
    if (loader) loader.style.display = "none";
}

function showToast(msg, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = msg;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
