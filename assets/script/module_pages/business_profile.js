
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzctPnBEK3mRXkqJQOlE7hDSbKstnBzpqc1LWkSnLsylKicbri6kQFhqtnbcI8STCINLQ/exec";

        window.onload = () => {
            document.getElementById('date-in').valueAsDate = new Date();
            init();
        };

        async function init() {
            const view = document.getElementById('main-view');
            view.innerHTML = `<div class='empty-state'><i class='fa-solid fa-circle-notch fa-spin fa-3x' style="color:var(--accent)"></i><p>Sincronizando información...</p></div>`;

            try {
                const res = await fetch(API_URL);
                const data = await res.json();

                if (data.status === "empty" || !data.NOMBRE_NEGOCIO) {
                    renderVacio();
                } else {
                    document.getElementById('status-text').innerText = "PANEL ACTIVO: " + data.NOMBRE_NEGOCIO;
                    toggleBtns(true);
                    renderPerfil(data);
                    fillForm(data);
                }
            } catch (e) {
                renderVacio();
            }
        }

        function renderPerfil(data) {
            const view = document.getElementById('main-view');
            view.innerHTML = `
                <div class="profile-card">
                    <div class="banner-container">
                        <img src="${data.BANNER_URL || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'}" class="banner-view">
                        <img src="${data.LOGO_URL || 'https://cdn-icons-png.flaticon.com/512/123/123403.png'}" class="logo-view">
                    </div>
                    
                    <div class="details">
                        <h1>${data.NOMBRE_NEGOCIO}</h1>
                        <p class="resp-name"><i class="fa-solid fa-award"></i> ${data.NOMBRE_RESPONSABLE}</p>
                        
                        <div class="grid-data">
                            <div class="data-item">
                                <label><i class="fa-solid fa-phone"></i> Teléfono</label>
                                <a href="tel:${data.TELEFONO}">${data.TELEFONO}</a>
                            </div>
                            <div class="data-item">
                                <label><i class="fa-brands fa-whatsapp"></i> WhatsApp</label>
                                <a href="https://wa.me/${data.WHATSAPP}" target="_blank">Contactar por Chat</a>
                            </div>
                            <div class="data-item">
                                <label><i class="fa-solid fa-envelope"></i> Email Oficial</label>
                                <a href="mailto:${data.EMAIL}">${data.EMAIL}</a>
                            </div>
                            <div class="data-item">
                                <label><i class="fa-solid fa-calendar-check"></i> Fecha de Registro</label>
                                <span>${new Date(data.FECHA_ALTA).toLocaleDateString('es-ES', {dateStyle:'long'})}</span>
                            </div>
                        </div>

                        <div class="multimedia-section">
                            <div class="embed-container">
                                ${data.MAPS_LINK ? 
                                `<div class="placeholder-embed">
                                    <i class="fa-solid fa-map-location-dot fa-3x"></i>
                                    <a href="${data.MAPS_LINK}" target="_blank" class="btn-add" style="text-decoration:none">ABRIR MAPA DE GOOGLE</a>
                                </div>` : 
                                `<div class="placeholder-embed"><i class="fa-solid fa-map-pin fa-2x"></i> Mapa no disponible</div>`}
                            </div>
                            
                            <div class="embed-container">
                                ${data.FACEBOOK_LINK ? 
                                `<div class="placeholder-embed">
                                    <i class="fa-brands fa-facebook fa-3x" style="color:#1877f2"></i>
                                    <a href="${data.FACEBOOK_LINK}" target="_blank" class="btn-add" style="background:#1877f2; text-decoration:none">VER PERFIL FACEBOOK</a>
                                </div>` : 
                                `<div class="placeholder-embed"><i class="fa-solid fa-share-nodes fa-2x"></i> Redes no vinculadas</div>`}
                            </div>
                        </div>

                        <div style="margin-top:30px; display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                            ${data.INSTAGRAM_LINK ? `<a href="${data.INSTAGRAM_LINK}" target="_blank" style="color:#e4405f"><i class="fa-brands fa-instagram fa-3x"></i></a>` : ''}
                            ${data.TIKTOK ? `<a href="${data.TIKTOK}" target="_blank" style="color:#000"><i class="fa-brands fa-tiktok fa-3x"></i></a>` : ''}
                            ${data.WEB_LINK ? `<a href="${data.WEB_LINK}" target="_blank" style="color:var(--accent)"><i class="fa-solid fa-globe fa-3x"></i></a>` : ''}
                        </div>

                        ${data.COMENTARIO ? `<div style="margin-top:30px; padding:20px; background:#fff9db; border-radius:12px; border-left:5px solid #f1c40f;">
                            <i class="fa-solid fa-quote-left" style="color:#f1c40f"></i> ${data.COMENTARIO}
                        </div>` : ''}
                    </div>
                </div>`;
        }

        function renderVacio() {
            document.getElementById('status-text').innerText = "SIN CONFIGURACIÓN";
            toggleBtns(false);
            document.getElementById('main-view').innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-store-slash fa-5x" style="color:#dfe6e9; margin-bottom:20px"></i>
                    <h2>No hay datos registrados</h2>
                    <p>Haz clic en "Nuevo Perfil" para comenzar a configurar tu negocio.</p>
                </div>`;
        }

        function fillForm(data) {
            const form = document.getElementById('form-perfil');
            for (let key in data) {
                if (form[key]) {
                    if(key === 'FECHA_ALTA') {
                        form[key].value = data[key].split('T')[0];
                    } else {
                        form[key].value = data[key];
                    }
                }
            }
        }

        document.getElementById('form-perfil').onsubmit = async function(e) {
            e.preventDefault();
            const btn = e.submitter;
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> GUARDANDO...";
            
            const obj = Object.fromEntries(new FormData(this).entries());
            
            try {
                await fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(obj) });
                alert("✅ Configuración guardada correctamente.");
                location.reload();
            } catch (err) {
                alert("Error al guardar.");
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        };

        function eliminar() {
            if(confirm("¿Estás seguro de eliminar el perfil? Se borrarán todos los datos.")) {
                fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({action:"delete"}) })
                .then(() => {
                    alert("Perfil eliminado.");
                    location.reload();
                });
            }
        }

        function toggleBtns(configurado) {
            document.getElementById('btn-add').style.display = configurado ? 'none' : 'flex';
            document.getElementById('btn-edit').disabled = !configurado;
            document.getElementById('btn-del').disabled = !configurado;
        }

        function openM() { document.getElementById('modal-f').style.display = 'block'; }
        function closeM() { document.getElementById('modal-f').style.display = 'none'; }
