// // assets/script/app_boot.js
// const API = "https://script.google.com/macros/s/AKfycbxteSwDAwBshWCBDnydRmu8wC-QT9iyUwG2EJD6SOQ_l5XQEBnVm36QKmJ3mULcTOSUBQ/exec";

// window.APP_CACHE = {};
// window.APP_READY = false;

// async function bootERP(){

//     // evitar recargar si ya existe cache
//     if(window.APP_READY){
//         console.log("ERP ya estaba cargado");
//         return;
//     }

//     console.log("Iniciando carga ERP...");

//     try{

//         if(!API){
//             throw new Error("API no definida");
//         }

//         const res = await fetch(API);

//         if(!res.ok){
//             throw new Error("Respuesta del servidor inválida");
//         }

//         const data = await res.json();

//         // validar datos recibidos
//         if(!data || typeof data !== "object"){
//             throw new Error("Datos ERP inválidos");
//         }

//         window.APP_CACHE = data;
//         window.APP_READY = true;

//         console.log("ERP cache cargado", window.APP_CACHE);

//         document.dispatchEvent(new Event("ERP_READY"));

//     }catch(err){

//         console.error("Error cargando ERP:", err);

//         window.APP_READY = false;

//     }

// // }

// // window.addEventListener("load", bootERP);







// //   <script src="../assets/script/app_boot.js"></script>

// const API = "https://script.google.com/macros/s/AKfycbxteSwDAwBshWCBDnydRmu8wC-QT9iyUwG2EJD6SOQ_l5XQEBnVm36QKmJ3mULcTOSUBQ/exec";

// window.APP_CACHE = {};
// window.APP_READY = false;

// async function bootERP() {
    
//     if (window.APP_READY) {
//         console.log("ERP ya estaba cargado");
//         return;
//     }
    
//     console.log("Iniciando carga ERP...");
    
//     try {
        
//         if (!API) {
//             throw new Error("API no definida");
//         }
        
//         const res = await fetch(API);
        
//         if (!res.ok) {
//             throw new Error("Respuesta del servidor inválida");
//         }
        
//         const result = await res.json();
        
//         // 🔥 VALIDACIÓN SEGURA
//         if (!result || typeof result !== "object") {
//             throw new Error("Datos ERP inválidos");
//         }
        
//         // 🔥 CLAVE: usar SOLO data
//         const data = result.data || {};
        
//         if (typeof data !== "object") {
//             throw new Error("Estructura ERP inválida");
//         }
        
//         window.APP_CACHE = data;
//         window.APP_READY = true;
        
//         console.log("ERP cache cargado", window.APP_CACHE);
        
//         document.dispatchEvent(new Event("ERP_READY"));
        
//     } catch (err) {
        
//         console.error("Error cargando ERP:", err);
//         window.APP_READY = false;
        
//     }
// }

// window.addEventListener("load", bootERP);






//   <script src="../assets/script/app_boot.js"></script>

const API =  "https://script.google.com/macros/s/AKfycbxOf290HJgDNlOqjmYk1uMwC3msymjxHmMK6WkLgLP1UwCUf2BeeeuzOiEa7WgVVY1n_Q/exec";
window.APP_CACHE = {};
window.APP_READY = false;

async function bootERP() {

    if (window.APP_READY) {
        console.log("ERP ya estaba cargado");
        return;
    }

    console.log("Iniciando carga ERP...");

    try {

        if (!API) {
            throw new Error("API no definida");
        }

        const res = await fetch(API);

        if (!res || !res.ok) {
            throw new Error("Respuesta del servidor inválida");
        }

        const result = await res.json();

        if (!result || typeof result !== "object") {
            throw new Error("Datos ERP inválidos");
        }

        // 🔥 SIEMPRE MISMA ESTRUCTURA
        const data = result.data;

        if (!data || typeof data !== "object") {
            throw new Error("Estructura ERP inválida");
        }

        // 🔥 VALIDACIÓN EXTRA (evita nulls raros)
        Object.keys(data).forEach(k => {
            if (!Array.isArray(data[k])) {
                data[k] = [];
            }
        });

        window.APP_CACHE = data;
        window.APP_READY = true;

        console.log("✅ ERP cache cargado", window.APP_CACHE);

        document.dispatchEvent(new Event("ERP_READY"));

    } catch (err) {

        console.error("💥 Error cargando ERP:", err);
        window.APP_READY = false;

    }
}

window.addEventListener("load", bootERP);

