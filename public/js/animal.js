// Configuración - API PARA PRODUCCIÓN
const API_URL = '/api/animales';

class PerfilAnimal {
    constructor() {
        this.animal = null;
        this.qrLibraryLoaded = false;
        this.loadQRLibrary();
        this.init();
    }

    init() {
        this.cargarPerfil();
    }

    loadQRLibrary() {
        // Verificar si la librería ya está cargada
        if (typeof QRCode !== 'undefined') {
            this.qrLibraryLoaded = true;
            console.log('✅ Librería QRCode ya cargada en animal.js');
            return;
        }

        // Cargar la librería dinámicamente
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.onload = () => {
            this.qrLibraryLoaded = true;
            console.log('✅ Librería QRCode cargada correctamente en animal.js');
        };
        script.onerror = () => {
            console.error('❌ Error cargando la librería QRCode en animal.js');
        };
        document.head.appendChild(script);
    }

    async cargarPerfil() {
        const urlParams = new URLSearchParams(window.location.search);
        const animalId = urlParams.get('id');

        if (!animalId) {
            this.mostrarError('ID de animal no especificado');
            return;
        }

        try {
            console.log('📡 Cargando perfil del animal desde localStorage...');
            const animalesStorage = localStorage.getItem('animales');
            
            if (!animalesStorage) {
            throw new Error('No hay datos en localStorage');
            }
            
            const animales = JSON.parse(animalesStorage);
            console.log('📊 Datos recibidos:', animales);
            
            // Buscar el animal por ID
            this.animal = animales.find(a => a.id === animalId);
            
            if (this.animal) {
            console.log('✅ Animal encontrado:', this.animal);
            this.mostrarPerfil();
            } else {
            console.log('❌ Animal no encontrado, ID:', animalId);
            this.mostrarError('Animal no encontrado');
            }
            
        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
            this.mostrarPerfilEjemplo(animalId);
        }
    }

    mostrarPerfilEjemplo(animalId) {
        console.log('📝 Mostrando perfil de ejemplo...');
        
        // Datos de ejemplo basados en el ID
        const animalesEjemplo = {
            '1': {
                id: '1',
                nombre: 'Max',
                genero: 'Macho',
                peso: '25',
                edad: '3',
                gestaciones: '0',
                foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
                pdf_url: '',
                fecha_creacion: '2025-02-10T10:30:00.000Z',
                url_perfil: window.location.href
            },
            '2': {
                id: '2',
                nombre: 'Luna',
                genero: 'Hembra',
                peso: '20',
                edad: '2',
                gestaciones: '1',
                foto_url: 'https://images.unsplash.com/photo-1560809454-c93b5a4c8140?w=400&h=300&fit=crop',
                pdf_url: '',
                fecha_creacion: '2025-02-10T11:00:00.000Z',
                url_perfil: window.location.href
            }
        };

        this.animal = animalesEjemplo[animalId];
        
        if (this.animal) {
            this.mostrarPerfil();
        } else {
            this.mostrarError('Animal no encontrado. Prueba con ID: 1 o 2');
        }
    }

    mostrarPerfil() {
        document.getElementById('nombreAnimal').textContent = this.animal.nombre;
        
        const contenido = `
            <div class="perfil-info">
                ${this.animal.foto_url ? 
                    `<img src="${this.animal.foto_url}" alt="${this.animal.nombre}" class="perfil-foto" onerror="this.style.display='none'">` 
                    : '<div class="perfil-foto placeholder">Sin imagen</div>'}
                
                <div class="info-group">
                    <h3>Información Básica</h3>
                    <p><strong>Nombre:</strong> ${this.animal.nombre}</p>
                    <p><strong>Género:</strong> ${this.animal.genero}</p>
                    <p><strong>Peso:</strong> ${this.animal.peso} kg</p>
                    <p><strong>Edad:</strong> ${this.animal.edad} años</p>
                    ${this.animal.genero === 'Hembra' && this.animal.gestaciones ? 
                        `<p><strong>Número de Gestaciones:</strong> ${this.animal.gestaciones}</p>` 
                        : ''}
                </div>

                ${this.animal.pdf_url ? `
                <div class="info-group">
                    <h3>Documentación</h3>
                    <p>
                        <strong>Pedigree:</strong> 
                        <a href="${this.animal.pdf_url}" target="_blank" style="color: #3498db;">
                            Ver PDF del Pedigree
                        </a>
                    </p>
                </div>
                ` : ''}

                <div class="qr-container">
                    <h3>QR para Compartir</h3>
                    <div id="qrcode"></div>
                    <p style="font-size: 14px; color: #666; margin-top: 10px;">
                        Escanea este código para acceder a este perfil
                    </p>
                </div>

                <button class="btn-descargar-pdf" onclick="window.print()">
                    📄 Descargar Perfil como PDF
                </button>
            </div>
        `;

        document.getElementById('perfilContent').innerHTML = contenido;
        
        // Pequeño delay para asegurar que el DOM se actualizó
        setTimeout(() => {
            this.generarQR();
        }, 100);
    }

    generarQR() {
        console.log('🔍 Iniciando generación de QR...');
        console.log('QRCode disponible:', typeof QRCode !== 'undefined');
        console.log('Estado librería cargada:', this.qrLibraryLoaded);
        
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) {
            console.error('❌ No se encuentra el contenedor con id "qrcode"');
            return;
        }

        // Verificar si la librería QRCode está cargada
        if (!this.qrLibraryLoaded || typeof QRCode === 'undefined') {
            console.error('❌ Librería QRCode no cargada');
            qrContainer.innerHTML = `
                <div style="color: #e74c3c; text-align: center; padding: 20px;">
                    <p>La librería QR se está cargando...</p>
                    <p style="font-size: 12px;">Por favor, espera un momento.</p>
                    <button onclick="perfil.generarQR()" style="margin-top: 10px; padding: 5px 10px;">
                        Reintentar
                    </button>
                </div>
            `;
            
            // Reintentar después de 1 segundo
            setTimeout(() => {
                this.generarQR();
            }, 1000);
            return;
        }

        qrContainer.innerHTML = '<p>Generando código QR...</p>';
        const urlCompleta = window.location.href;
        console.log('🔗 URL para QR:', urlCompleta);

        try {
            // Limpiar el contenedor
            qrContainer.innerHTML = '';
            
            // Usar la misma librería que funciona en app.js
            new QRCode(qrContainer, {
                text: urlCompleta,
                width: 150,
                height: 150,
                colorDark: "#2c3e50",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            console.log('✅ QR generado correctamente en animal.js');
            
        } catch (error) {
            console.error('❌ Error generando QR:', error);
            qrContainer.innerHTML = `
                <div style="color: #e74c3c; text-align: center;">
                    <p>Error generando el código QR</p>
                    <p style="font-size: 12px;">${error.message}</p>
                    <button onclick="perfil.generarQR()" style="margin-top: 10px; padding: 5px 10px;">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    mostrarError(mensaje) {
        document.getElementById('perfilContent').innerHTML = `
            <div class="perfil-info">
                <h2>Error</h2>
                <p>${mensaje}</p>
                <div style="margin-top: 20px;">
                    <p><strong>IDs de ejemplo para probar:</strong></p>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li><a href="?id=1" style="color: #3498db;">Perfil de Max (ID: 1)</a></li>
                        <li><a href="?id=2" style="color: #3498db;">Perfil de Luna (ID: 2)</a></li>
                    </ul>
                </div>
                <a href="/" style="color: #3498db; display: inline-block; margin-top: 15px;">← Volver al Dashboard</a>
            </div>
        `;
    }
}

// Inicialización mejorada para animal.js
function initPerfilAnimal() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.perfil = new PerfilAnimal();
            console.log('✅ Perfil con API inicializado correctamente');
        });
    } else {
        window.perfil = new PerfilAnimal();
        console.log('✅ Perfil con API inicializado correctamente');
    }
}

initPerfilAnimal();