// Configuración - API PARA PRODUCCIÓN
const API_URL = '/api/animales';

class DashboardAnimales {
    constructor() {
        this.animales = [];
        this.qrLibraryLoaded = false;
        
        // Bind de métodos para mantener el contexto
        this.mostrarAnimales = this.mostrarAnimales.bind(this);
        this.mostrarDatosEjemplo = this.mostrarDatosEjemplo.bind(this);
        this.cargarAnimales = this.cargarAnimales.bind(this);
        this.mostrarQR = this.mostrarQR.bind(this);
        this.guardarAnimal = this.guardarAnimal.bind(this);
        this.eliminarAnimal = this.eliminarAnimal.bind(this);
        
        this.loadQRLibrary();
        this.init();
    }

    init() {
        console.log('🚀 Iniciando dashboard con Supabase...');
        this.bindEvents();
        this.cargarAnimales();
    }

    loadQRLibrary() {
        if (typeof QRCode !== 'undefined') {
            this.qrLibraryLoaded = true;
            console.log('✅ Librería QRCode ya cargada');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.onload = () => {
            this.qrLibraryLoaded = true;
            console.log('✅ Librería QRCode cargada correctamente');
        };
        script.onerror = () => {
            console.error('❌ Error cargando la librería QRCode');
        };
        document.head.appendChild(script);
    }

    bindEvents() {
        // Bind de eventos con arrow functions para mantener el contexto
        document.getElementById('btnNuevoAnimal')?.addEventListener('click', () => {
            this.mostrarModal();
        });

        document.getElementById('formAnimal')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarAnimal();
        });

        document.getElementById('btnCancelar')?.addEventListener('click', () => {
            this.cerrarModal();
        });

        document.getElementById('genero')?.addEventListener('change', (e) => {
            this.toggleGestaciones(e.target.value);
        });

        document.getElementById('btnCerrarQR')?.addEventListener('click', () => {
            this.cerrarModalQR();
        });
    }

    async cargarAnimales() {
        try {
            console.log('📡 Cargando datos desde Supabase...');
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            this.animales = await response.json();
            console.log('🐕 Animales cargados:', this.animales);
            this.mostrarAnimales();
            
        } catch (error) {
            console.error('❌ Error cargando animales:', error);
            this.mostrarErrorCarga('No se pudieron cargar los datos del servidor.');
        }
    }

    mostrarErrorCarga(mensaje) {
        const container = document.getElementById('listaAnimales');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-state">
                <h3>❌ Error de Conexión</h3>
                <p>${mensaje}</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <strong>Para solucionar:</strong>
                    <ol style="text-align: left; margin: 10px 0;">
                        <li>Verifica tu conexión a internet</li>
                        <li>Recarga la página</li>
                        <li>Si el problema persiste, contacta al administrador</li>
                    </ol>
                </div>
                <button onclick="dashboard.mostrarDatosEjemplo()" class="btn-primary">
                    Usar Datos de Ejemplo (sin guardar)
                </button>
            </div>
        `;
    }

    mostrarDatosEjemplo() {
        console.log('📝 Mostrando datos de ejemplo...');
        this.animales = [
            {
                id: '1',
                nombre: 'Max',
                genero: 'Macho',
                peso: '25',
                edad: '3',
                gestaciones: '0',
                foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
                pdf_url: '',
                fecha_creacion: new Date().toISOString(),
                url_perfil: `${window.location.origin}/animal.html?id=1`
            },
            {
                id: '2',
                nombre: 'Luna',
                genero: 'Hembra',
                peso: '20',
                edad: '2',
                gestaciones: '1',
                foto_url: 'https://images.unsplash.com/photo-1560809454-c93b5a4c8140?w=300&h=200&fit=crop',
                pdf_url: '',
                fecha_creacion: new Date().toISOString(),
                url_perfil: `${window.location.origin}/animal.html?id=2`
            }
        ];
        this.mostrarAnimales();
    }

    mostrarAnimales() {
        const container = document.getElementById('listaAnimales');
        if (!container) {
            console.error('❌ No se encuentra el contenedor listaAnimales');
            return;
        }
        
        if (this.animales.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No hay animales registrados</h3>
                    <p>Haz clic en "Nuevo Animal" para agregar el primero</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.animales.map(animal => `
            <div class="animal-card">
                <div class="animal-header">
                    <h3>${animal.nombre || 'Sin nombre'}</h3>
                    <span class="genero-badge ${(animal.genero || '').toLowerCase()}">
                        ${animal.genero || 'Desconocido'}
                    </span>
                </div>
                
                ${animal.foto_url ? `
                    <img src="${animal.foto_url}" alt="${animal.nombre}" 
                         class="animal-foto" 
                         onerror="this.style.display='none'">
                ` : ''}
                
                <div class="animal-info">
                    <p><strong>Peso:</strong> ${animal.peso || 'N/A'} kg</p>
                    <p><strong>Edad:</strong> ${animal.edad || 'N/A'} años</p>
                    ${animal.genero === 'Hembra' && animal.gestaciones ? `
                        <p><strong>Gestaciones:</strong> ${animal.gestaciones}</p>
                    ` : ''}
                    ${animal.pdf_url ? `
                        <p><strong>Pedigree:</strong> 
                            <a href="${animal.pdf_url}" target="_blank">Ver PDF</a>
                        </p>
                    ` : ''}
                </div>
                
                <div class="animal-actions">
                    <button onclick="dashboard.mostrarQR('${animal.id}')" class="btn-primary btn-small">
                        QR
                    </button>
                    <button onclick="dashboard.editarAnimal('${animal.id}')" class="btn-primary btn-small">
                        Editar
                    </button>
                    <button onclick="dashboard.eliminarAnimal('${animal.id}')" class="btn-secondary btn-small">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleGestaciones(genero) {
        const container = document.getElementById('gestionesContainer');
        if (container) {
            container.style.display = genero === 'Hembra' ? 'block' : 'none';
        }
    }

    mostrarModal(animal = null) {
        const modal = document.getElementById('modalAnimal');
        const titulo = document.getElementById('modalTitulo');
        
        if (!modal || !titulo) return;
        
        if (animal) {
            titulo.textContent = 'Editar Animal';
            this.llenarFormulario(animal);
        } else {
            titulo.textContent = 'Nuevo Animal';
            document.getElementById('formAnimal')?.reset();
            const animalIdInput = document.getElementById('animalId');
            if (animalIdInput) animalIdInput.value = '';
            this.toggleGestaciones('');
        }
        
        modal.style.display = 'block';
    }

    llenarFormulario(animal) {
        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value || '';
        };
        
        setValue('animalId', animal.id);
        setValue('nombre', animal.nombre);
        setValue('genero', animal.genero);
        setValue('peso', animal.peso);
        setValue('edad', animal.edad);
        setValue('gestaciones', animal.gestaciones || 0);
        setValue('foto_url', animal.foto_url);
        setValue('pdf_url', animal.pdf_url);
        
        this.toggleGestaciones(animal.genero || '');
    }

    async guardarAnimal() {
        // 1. Obtener elementos del formulario
        const form = document.getElementById('formAnimal');
        if (!form) {
            console.error('❌ No se encontró el formulario');
            return;
        }

        // 2. Obtener valores directamente para verificación
        const animalId = document.getElementById('animalId').value;
        const nombre = document.getElementById('nombre').value;
        const genero = document.getElementById('genero').value;
        const peso = document.getElementById('peso').value;
        const edad = document.getElementById('edad').value;
        const gestaciones = document.getElementById('gestaciones').value;
        const foto_url = document.getElementById('foto_url').value;
        const pdf_url = document.getElementById('pdf_url').value;

        // 3. Log values for debugging
        console.log('📝 Valores del formulario:', {
            animalId, nombre, genero, peso, edad, gestaciones, foto_url, pdf_url
        });

        // 4. Validar campos obligatorios
        if (!nombre || !genero || !peso || !edad) {
            alert('⚠️ Por favor, completa los campos obligatorios: Nombre, Género, Peso y Edad');
            return;
        }

        const baseUrl = window.location.origin;
        
        // 5. CORRECCIÓN PRINCIPAL: Crear objeto animal con IDs consistentes
        let idFinal = animalId;
        let urlPerfilFinal = '';
        
        if (!animalId) {
            // NUEVO ANIMAL: Generar nuevo ID y URL
            idFinal = this.generarId();
            urlPerfilFinal = `${baseUrl}/animal.html?id=${idFinal}`;
        } else {
            // EDITAR ANIMAL: Mantener ID existente y buscar URL actual
            const animalExistente = this.animales.find(a => a.id === animalId);
            urlPerfilFinal = animalExistente ? 
                animalExistente.url_perfil : 
                `${baseUrl}/animal.html?id=${animalId}`;
        }

        const nuevoAnimal = {
            id: idFinal,
            nombre: nombre,
            genero: genero,
            peso: parseFloat(peso),
            edad: parseInt(edad),
            gestaciones: parseInt(gestaciones) || 0,
            foto_url: foto_url,
            pdf_url: pdf_url,
            fecha_creacion: new Date().toISOString(),
            url_perfil: urlPerfilFinal
        };

        console.log('💾 Guardando animal:', nuevoAnimal);
        
        // 6. Actualizar array local
        if (animalId) {
            // EDICIÓN: Encontrar y actualizar animal existente
            const index = this.animales.findIndex(a => a.id === animalId);
            if (index !== -1) {
                // Mantener la fecha_creacion original durante edición
                nuevoAnimal.fecha_creacion = this.animales[index].fecha_creacion;
                this.animales[index] = { ...this.animales[index], ...nuevoAnimal };
                console.log('✏️ Animal editado:', nuevoAnimal);
            } else {
                console.error('❌ No se encontró el animal a editar');
                alert('Error: No se encontró el animal para editar');
                return;
            }
        } else {
            // NUEVO ANIMAL: Agregar al array
            this.animales.push(nuevoAnimal);
            console.log('🆕 Nuevo animal agregado:', nuevoAnimal);
        }
        
        // 7. Guardar en Supabase
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.animales)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('✅ ¡Animal guardado permanentemente en Supabase!');
            } else {
                throw new Error(result.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('❌ Error al guardar:', error);
            alert('⚠️ Error: No se pudo guardar en Supabase.');
        }
        
        this.cerrarModal();
        this.mostrarAnimales();
    }

    generarId() {
        return 'animal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    editarAnimal(id) {
        const animal = this.animales.find(a => a.id === id);
        if (animal) {
            this.mostrarModal(animal);
        } else {
            alert('Animal no encontrado');
        }
    }

    async eliminarAnimal(id) {
        if (!confirm('¿Estás seguro de eliminar este animal?')) return;

        try {
            // Actualizar lista local
            this.animales = this.animales.filter(a => a.id !== id);
            
            // Guardar cambios en Supabase
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.animales)
            });
            
            if (response.ok) {
                console.log('🗑️ Animal eliminado:', id);
                alert('✅ Animal eliminado permanentemente de Supabase');
            } else {
                throw new Error('Error al eliminar en Supabase');
            }
        } catch (error) {
            console.error('❌ Error al eliminar:', error);
            alert('⚠️ Error: No se pudo eliminar el animal de Supabase');
        }
        
        this.mostrarAnimales();
    }

    mostrarQR(animalId) {
        if (!this.qrLibraryLoaded) {
            alert('La librería QR no se ha cargado todavía. Por favor, espera un momento y vuelve a intentarlo.');
            return;
        }

        const animal = this.animales.find(a => a.id === animalId);
        if (!animal) {
            alert('Animal no encontrado');
            return;
        }

        const modal = document.getElementById('modalQR');
        const qrContainer = document.getElementById('qrcode');

        if (!modal || !qrContainer) {
            alert('Error: No se encontró el modal QR. Verifica tu HTML.');
            return;
        }

        qrContainer.innerHTML = '<p>Generando QR...</p>';
        
        const urlCompleta = animal.url_perfil || `${window.location.origin}/animal.html?id=${animalId}`;
        console.log('🔗 Generando QR para:', urlCompleta);

        try {
            qrContainer.innerHTML = '';
            
            new QRCode(qrContainer, {
                text: urlCompleta,
                width: 200,
                height: 200,
                colorDark: "#2c3e50",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            console.log('✅ QR generado correctamente');
            modal.style.display = 'block';

        } catch (error) {
            console.error('❌ Error generando QR:', error);
            alert('Error generando el código QR: ' + error.message);
        }
    }

    cerrarModalQR() {
        const modal = document.getElementById('modalQR');
        if (modal) {
            modal.style.display = 'none';
            const qrContainer = document.getElementById('qrcode');
            if (qrContainer) {
                qrContainer.innerHTML = '';
            }
        }
    }

    cerrarModal() {
        const modal = document.getElementById('modalAnimal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Inicialización mejorada
function initDashboard() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.dashboard = new DashboardAnimales();
        });
    } else {
        window.dashboard = new DashboardAnimales();
    }
}

initDashboard();