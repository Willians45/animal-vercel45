// Configuración - API PARA PRODUCCIÓN
const API_URL = '/api/animales';

// Configurar PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

class PerfilAnimal {
    constructor() {
        this.animal = null;
        this.qrLibraryLoaded = false;
        this.pdfViewer = null;
        this.currentPdfPage = 1;
        this.totalPdfPages = 0;
        this.loadQRLibrary();
        this.init();
    }

    init() {
        this.cargarPerfil();
    }

    loadQRLibrary() {
        if (typeof QRCode !== 'undefined') {
            this.qrLibraryLoaded = true;
            console.log('✅ Librería QRCode ya cargada en animal.js');
            return;
        }

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
            console.log('📡 Cargando perfil del animal desde API...');
            const response = await fetch(`${API_URL}/${animalId}`);
            
            if (response.status === 404) {
                throw new Error('Animal no encontrado');
            }
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            this.animal = await response.json();
            console.log('✅ Animal encontrado:', this.animal);
            this.mostrarPerfil();
            
        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
            this.mostrarPerfilEjemplo(animalId);
        }
    }

    mostrarPerfilEjemplo(animalId) {
        console.log('📝 Mostrando perfil de ejemplo...');
        
        const animalesEjemplo = {
            '1': {
                id: '1',
                registro: 'RD ASD 11234',
                nombre: 'MISS SUAREZ 04/24 ET',
                raza: 'Brahman',
                sexo: 'Hembra',
                fecha_nacimiento: '2024-08-29',
                partos: 3,
                circunferencia_escrotal: null,
                peso: 450,
                altura: 145,
                premios: [
                    { feria: 'Mejor Vaca 2025', posicion: 'Primer Lugar' },
                    { feria: 'Higuey 2023', posicion: 'Tercer Lugar' },
                    { feria: 'Puerto Plata 2025', posicion: 'Primer Lugar' }
                ],
                foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
                pdf_url: '',
                fecha_creacion: '2025-02-10T10:30:00.000Z',
                url_perfil: window.location.href
            },
            '2': {
                id: '2',
                registro: 'RD ASD 11235',
                nombre: 'TORO BRAVO 01/23',
                raza: 'Brahman',
                sexo: 'Macho',
                fecha_nacimiento: '2023-01-15',
                partos: null,
                circunferencia_escrotal: 38.5,
                peso: 650,
                altura: 155,
                premios: [
                    { feria: 'Mejor Vaca 2025', posicion: 'Segundo Lugar' }
                ],
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

    async mostrarPerfil() {
        document.getElementById('nombreAnimal').textContent = this.animal.nombre;
        
        const contenido = `
            <div class="perfil-info">
                ${this.animal.foto_url ? 
                    `<img src="${this.animal.foto_url}" alt="${this.animal.nombre}" class="perfil-foto" onerror="this.style.display='none'">` 
                    : '<div class="perfil-foto placeholder">Sin imagen</div>'}
                
                <div class="info-group">
                    <h3>Información Básica</h3>
                    <p><strong>Registro:</strong> ${this.animal.registro}</p>
                    <p><strong>Nombre:</strong> ${this.animal.nombre}</p>
                    <p><strong>Raza:</strong> ${this.animal.raza}</p>
                    <p><strong>Sexo:</strong> ${this.animal.sexo}</p>
                    <p><strong>Fecha de Nacimiento:</strong> ${this.animal.fecha_nacimiento ? new Date(this.animal.fecha_nacimiento).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Peso:</strong> ${this.animal.peso} kg</p>
                    <p><strong>Altura:</strong> ${this.animal.altura} cm</p>
                    ${this.animal.sexo === 'Hembra' && this.animal.partos !== null ? 
                        `<p><strong>Partos:</strong> ${this.animal.partos}</p>` 
                        : ''}
                    ${this.animal.sexo === 'Macho' && this.animal.circunferencia_escrotal !== null ? 
                        `<p><strong>Circunferencia Escrotal:</strong> ${this.animal.circunferencia_escrotal} cm</p>` 
                        : ''}
                </div>

                ${this.animal.premios && this.animal.premios.length > 0 ? `
                <div class="info-group">
                    <h3>Premios</h3>
                    <ul style="text-align: left; list-style-type: none; padding: 0;">
                        ${this.animal.premios.map(premio => `
                            <li style="margin-bottom: 8px;">
                                <strong>${premio.feria}:</strong> ${premio.posicion}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                ${this.animal.pdf_url ? `
                <div class="info-group">
                    <h3>Documentación - Pedigree</h3>
                    <div class="pdf-viewer-container">
                        <div class="pdf-controls">
                            <button class="btn-pdf-prev btn-small" onclick="perfil.prevPage()">← Anterior</button>
                            <span class="pdf-page-info">Página <span id="currentPage">1</span> de <span id="totalPages">1</span></span>
                            <button class="btn-pdf-next btn-small" onclick="perfil.nextPage()">Siguiente →</button>
                        </div>
                        <div class="pdf-canvas-container">
                            <canvas id="pdfCanvas"></canvas>
                        </div>
                        <div class="pdf-loading" id="pdfLoading">
                            <p>Cargando PDF...</p>
                        </div>
                    </div>
                    <div class="pdf-actions">
                        <a href="${this.animal.pdf_url}" target="_blank" class="btn-primary btn-small" style="display: none;">
                            Abrir PDF original
                        </a>
                        <a href="${this.animal.pdf_url}" download class="btn-secondary btn-small" style="display: none;">
                            Descargar PDF
                        </a>
                    </div>
                </div>
                ` : `
                <div class="info-group">
                    <h3>Documentación</h3>
                    <div class="pdf-viewer-placeholder">
                        <p>No hay PDF de pedigree disponible</p>
                    </div>
                </div>
                `}

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
        
        // Cargar PDF si existe
        if (this.animal.pdf_url) {
            setTimeout(() => {
                this.cargarPDF(this.animal.pdf_url);
            }, 500);
        }
        
        // Generar QR
        setTimeout(() => {
            this.generarQR();
        }, 100);
    }

    async cargarPDF(pdfUrl) {
        try {
            document.getElementById('pdfLoading').style.display = 'block';
            
            // Cargar el PDF
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;
            
            this.totalPdfPages = pdf.numPages;
            this.currentPdfPage = 1;
            this.pdfDoc = pdf;
            
            document.getElementById('totalPages').textContent = this.totalPdfPages;
            document.getElementById('currentPage').textContent = this.currentPdfPage;
            
            await this.renderPage(this.currentPdfPage);
            
            document.getElementById('pdfLoading').style.display = 'none';
            
        } catch (error) {
            console.error('Error cargando PDF:', error);
            document.getElementById('pdfLoading').innerHTML = '<p>Error cargando el PDF</p>';
        }
    }

    async renderPage(pageNumber) {
        try {
            const page = await this.pdfDoc.getPage(pageNumber);
            const canvas = document.getElementById('pdfCanvas');
            const ctx = canvas.getContext('2d');
            
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            document.getElementById('currentPage').textContent = pageNumber;
            
        } catch (error) {
            console.error('Error renderizando página:', error);
        }
    }

    nextPage() {
        if (this.currentPdfPage < this.totalPdfPages) {
            this.currentPdfPage++;
            this.renderPage(this.currentPdfPage);
        }
    }

    prevPage() {
        if (this.currentPdfPage > 1) {
            this.currentPdfPage--;
            this.renderPage(this.currentPdfPage);
        }
    }

    generarQR() {
        // ... (mantener el mismo código de generación de QR)
        console.log('🔍 Iniciando generación de QR...');
        console.log('QRCode disponible:', typeof QRCode !== 'undefined');
        console.log('Estado librería cargada:', this.qrLibraryLoaded);
        
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) {
            console.error('❌ No se encuentra el contenedor con id "qrcode"');
            return;
        }

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
            
            setTimeout(() => {
                this.generarQR();
            }, 1000);
            return;
        }

        qrContainer.innerHTML = '<p>Generando código QR...</p>';
        const urlCompleta = window.location.href;
        console.log('🔗 URL para QR:', urlCompleta);

        try {
            qrContainer.innerHTML = '';
            
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
            console.log('✅ Perfil con Supabase inicializado correctamente');
        });
    } else {
        window.perfil = new PerfilAnimal();
        console.log('✅ Perfil con Supabase inicializado correctamente');
    }
}

initPerfilAnimal();