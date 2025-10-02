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
        this.agregarCampoPremio = this.agregarCampoPremio.bind(this);
        this.toggleCamposSexo = this.toggleCamposSexo.bind(this);
        this.subirArchivo = this.subirArchivo.bind(this);
        this.previewImagen = this.previewImagen.bind(this);
        
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

        document.getElementById('sexo')?.addEventListener('change', (e) => {
            this.toggleCamposSexo(e.target.value);
        });

        document.getElementById('btnAgregarPremio')?.addEventListener('click', () => {
            this.agregarCampoPremio();
        });

        document.getElementById('btnCerrarQR')?.addEventListener('click', () => {
            this.cerrarModalQR();
        });

        // Eventos para previsualización de archivos
        document.getElementById('foto_file')?.addEventListener('change', (e) => {
            this.previewImagen(e.target.files[0], 'foto_preview');
        });

        document.getElementById('pdf_file')?.addEventListener('change', (e) => {
            this.previewPDF(e.target.files[0], 'pdf_preview');
        });
    }

    previewImagen(file, previewId) {
        const preview = document.getElementById(previewId);
        if (!preview) return;

        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert('La imagen es demasiado grande. Máximo 5MB.');
                document.getElementById('foto_file').value = '';
                preview.innerHTML = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `
                    <div class="preview-container">
                        <img src="${e.target.result}" alt="Vista previa" class="preview-image">
                        <button type="button" class="btn-remove-preview" onclick="document.getElementById('foto_file').value = ''; document.getElementById('${previewId}').innerHTML = '';">✕</button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    }

    previewPDF(file, previewId) {
        const preview = document.getElementById(previewId);
        if (!preview) return;

        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert('El PDF es demasiado grande. Máximo 10MB.');
                document.getElementById('pdf_file').value = '';
                preview.innerHTML = '';
                return;
            }

            preview.innerHTML = `
                <div class="preview-container">
                    <div class="pdf-preview">
                        <span class="pdf-icon">📄</span>
                        <span class="pdf-name">${file.name}</span>
                        <button type="button" class="btn-remove-preview" onclick="document.getElementById('pdf_file').value = ''; document.getElementById('${previewId}').innerHTML = '';">✕</button>
                    </div>
                </div>
            `;
        } else {
            preview.innerHTML = '';
        }
    }

    async subirArchivo(file, tipo) {
        if (!file) return null;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const fileName = `${tipo}_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
                    
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            file: e.target.result,
                            fileName: fileName,
                            fileType: file.type
                        })
                    });

                    const result = await response.json();
                    
                    if (response.ok) {
                        console.log(`✅ ${tipo} subido correctamente:`, result.url);
                        resolve(result.url);
                    } else {
                        throw new Error(result.error || 'Error subiendo archivo');
                    }
                } catch (error) {
                    console.error(`❌ Error subiendo ${tipo}:`, error);
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsDataURL(file);
        });
    }

    toggleCamposSexo(sexo) {
        const partosContainer = document.getElementById('partosContainer');
        const circunferenciaContainer = document.getElementById('circunferenciaContainer');
        
        if (partosContainer) {
            partosContainer.style.display = sexo === 'Hembra' ? 'block' : 'none';
        }
        
        if (circunferenciaContainer) {
            circunferenciaContainer.style.display = sexo === 'Macho' ? 'block' : 'none';
        }
    }

    agregarCampoPremio() {
        const container = document.getElementById('premiosContainer');
        const index = container.children.length;
        
        const premioDiv = document.createElement('div');
        premioDiv.className = 'premio-item';
        premioDiv.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';
        
        premioDiv.innerHTML = `
            <select class="premio-feria" style="flex: 2;">
                <option value="">Seleccionar feria</option>
                <option value="Mejor Vaca 2025">Mejor Vaca 2025</option>
                <option value="Higuey 2023">Higuey 2023</option>
                <option value="Puerto Plata 2025">Puerto Plata 2025</option>
                <option value="otro">Otro</option>
            </select>
            <input type="text" class="premio-feria-otro" placeholder="Nombre de feria" style="flex: 2; display: none;">
            <input type="text" class="premio-posicion" placeholder="Posición (ej: Primer Lugar)" style="flex: 2;">
            <button type="button" class="btn-eliminar-premio btn-secondary btn-small" style="flex: 1;">Eliminar</button>
        `;
        
        // Evento para mostrar campo "otro" cuando se seleccione esa opción
        const selectFeria = premioDiv.querySelector('.premio-feria');
        const inputOtro = premioDiv.querySelector('.premio-feria-otro');
        
        selectFeria.addEventListener('change', function() {
            inputOtro.style.display = this.value === 'otro' ? 'block' : 'none';
        });
        
        // Evento para eliminar este premio
        const btnEliminar = premioDiv.querySelector('.btn-eliminar-premio');
        btnEliminar.addEventListener('click', function() {
            container.removeChild(premioDiv);
        });
        
        container.appendChild(premioDiv);
    }

    obtenerPremios() {
        const premios = [];
        const premiosItems = document.querySelectorAll('.premio-item');
        
        premiosItems.forEach(item => {
            const feriaSelect = item.querySelector('.premio-feria');
            const feriaOtro = item.querySelector('.premio-feria-otro');
            const posicion = item.querySelector('.premio-posicion').value;
            
            let feria = feriaSelect.value;
            if (feria === 'otro' && feriaOtro.value.trim()) {
                feria = feriaOtro.value.trim();
            }
            
            if (feria && posicion) {
                premios.push({ feria, posicion });
            }
        });
        
        return premios;
    }

    cargarPremiosEnFormulario(premios) {
        const container = document.getElementById('premiosContainer');
        container.innerHTML = '';
        
        if (premios && Array.isArray(premios)) {
            premios.forEach(premio => {
                const premioDiv = document.createElement('div');
                premioDiv.className = 'premio-item';
                premioDiv.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';
                
                // Determinar si es una feria predefinida o "otro"
                const feriasPredefinidas = ['Mejor Vaca 2025', 'Higuey 2023', 'Puerto Plata 2025'];
                const esPredefinida = feriasPredefinidas.includes(premio.feria);
                const feriaSeleccionada = esPredefinida ? premio.feria : 'otro';
                
                premioDiv.innerHTML = `
                    <select class="premio-feria" style="flex: 2;">
                        <option value="">Seleccionar feria</option>
                        <option value="Mejor Vaca 2025" ${premio.feria === 'Mejor Vaca 2025' ? 'selected' : ''}>Mejor Vaca 2025</option>
                        <option value="Higuey 2023" ${premio.feria === 'Higuey 2023' ? 'selected' : ''}>Higuey 2023</option>
                        <option value="Puerto Plata 2025" ${premio.feria === 'Puerto Plata 2025' ? 'selected' : ''}>Puerto Plata 2025</option>
                        <option value="otro" ${!esPredefinida ? 'selected' : ''}>Otro</option>
                    </select>
                    <input type="text" class="premio-feria-otro" placeholder="Nombre de feria" 
                           value="${!esPredefinida ? premio.feria : ''}" 
                           style="flex: 2; ${!esPredefinida ? 'display: block;' : 'display: none;'}">
                    <input type="text" class="premio-posicion" placeholder="Posición (ej: Primer Lugar)" 
                           value="${premio.posicion}" style="flex: 2;">
                    <button type="button" class="btn-eliminar-premio btn-secondary btn-small" style="flex: 1;">Eliminar</button>
                `;
                
                // Eventos
                const selectFeria = premioDiv.querySelector('.premio-feria');
                const inputOtro = premioDiv.querySelector('.premio-feria-otro');
                
                selectFeria.addEventListener('change', function() {
                    inputOtro.style.display = this.value === 'otro' ? 'block' : 'none';
                });
                
                const btnEliminar = premioDiv.querySelector('.btn-eliminar-premio');
                btnEliminar.addEventListener('click', function() {
                    container.removeChild(premioDiv);
                });
                
                container.appendChild(premioDiv);
            });
        }
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
                foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop',
                pdf_url: '',
                fecha_creacion: new Date().toISOString(),
                url_perfil: `${window.location.origin}/animal.html?id=1`
            },
            {
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
                    <span class="genero-badge ${(animal.sexo || '').toLowerCase()}">
                        ${animal.sexo || 'Desconocido'}
                    </span>
                </div>
                
                ${animal.foto_url ? `
                    <img src="${animal.foto_url}" alt="${animal.nombre}" 
                         class="animal-foto" 
                         onerror="this.style.display='none'">
                ` : ''}
                
                <div class="animal-info">
                    <p><strong>Registro:</strong> ${animal.registro || 'N/A'}</p>
                    <p><strong>Raza:</strong> ${animal.raza || 'N/A'}</p>
                    <p><strong>Fecha Nac.:</strong> ${animal.fecha_nacimiento ? new Date(animal.fecha_nacimiento).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Peso:</strong> ${animal.peso || 'N/A'} kg</p>
                    <p><strong>Altura:</strong> ${animal.altura || 'N/A'} cm</p>
                    ${animal.sexo === 'Hembra' && animal.partos ? `
                        <p><strong>Partos:</strong> ${animal.partos}</p>
                    ` : ''}
                    ${animal.sexo === 'Macho' && animal.circunferencia_escrotal ? `
                        <p><strong>Circ. Escrotal:</strong> ${animal.circunferencia_escrotal} cm</p>
                    ` : ''}
                    ${animal.premios && animal.premios.length > 0 ? `
                        <p><strong>Premios:</strong> ${animal.premios.length}</p>
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
            this.toggleCamposSexo('');
            document.getElementById('premiosContainer').innerHTML = '';
            document.getElementById('foto_preview').innerHTML = '';
            document.getElementById('pdf_preview').innerHTML = '';
        }
        
        modal.style.display = 'block';
    }

    llenarFormulario(animal) {
        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value || '';
        };
        
        setValue('animalId', animal.id);
        setValue('registro', animal.registro);
        setValue('nombre', animal.nombre);
        setValue('raza', animal.raza);
        setValue('sexo', animal.sexo);
        setValue('fecha_nacimiento', animal.fecha_nacimiento);
        setValue('partos', animal.partos || 0);
        setValue('circunferencia_escrotal', animal.circunferencia_escrotal);
        setValue('peso', animal.peso);
        setValue('altura', animal.altura);
        setValue('foto_url', animal.foto_url);
        setValue('pdf_url', animal.pdf_url);
        
        // Mostrar preview de imagen si existe
        if (animal.foto_url) {
            document.getElementById('foto_preview').innerHTML = `
                <div class="preview-container">
                    <img src="${animal.foto_url}" alt="Vista previa" class="preview-image">
                    <small>Imagen actual - Subir nueva imagen para reemplazar</small>
                </div>
            `;
        }
        
        // Mostrar preview de PDF si existe
        if (animal.pdf_url) {
            const pdfName = animal.pdf_url.split('/').pop() || 'documento.pdf';
            document.getElementById('pdf_preview').innerHTML = `
                <div class="preview-container">
                    <div class="pdf-preview">
                        <span class="pdf-icon">📄</span>
                        <span class="pdf-name">${pdfName}</span>
                        <small>PDF actual - Subir nuevo PDF para reemplazar</small>
                    </div>
                </div>
            `;
        }
        
        this.toggleCamposSexo(animal.sexo || '');
        this.cargarPremiosEnFormulario(animal.premios);
    }

    async guardarAnimal() {
        const btnSubmit = document.getElementById('btnSubmit');
        const originalText = btnSubmit.textContent;
        
        try {
            // 1. Deshabilitar botón y mostrar loading
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Guardando...';
            
            // 2. Obtener valores del formulario
            const animalId = document.getElementById('animalId').value;
            const registro = document.getElementById('registro').value;
            const nombre = document.getElementById('nombre').value;
            const raza = document.getElementById('raza').value;
            const sexo = document.getElementById('sexo').value;
            const fecha_nacimiento = document.getElementById('fecha_nacimiento').value;
            const partos = document.getElementById('partos').value;
            const circunferencia_escrotal = document.getElementById('circunferencia_escrotal').value;
            const peso = document.getElementById('peso').value;
            const altura = document.getElementById('altura').value;
            const foto_file = document.getElementById('foto_file').files[0];
            const pdf_file = document.getElementById('pdf_file').files[0];
            const foto_url_existente = document.getElementById('foto_url').value;
            const pdf_url_existente = document.getElementById('pdf_url').value;

            // 3. Validar campos obligatorios
            if (!registro || !nombre || !raza || !sexo || !fecha_nacimiento || !peso || !altura) {
                alert('⚠️ Por favor, completa todos los campos obligatorios');
                return;
            }

            // 4. Subir archivos si se seleccionaron nuevos
            let foto_url = foto_url_existente;
            let pdf_url = pdf_url_existente;

            if (foto_file) {
                foto_url = await this.subirArchivo(foto_file, 'foto');
            }

            if (pdf_file) {
                pdf_url = await this.subirArchivo(pdf_file, 'pdf');
            }

            const baseUrl = window.location.origin;
            
            // 5. Crear objeto animal con IDs consistentes
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

            // Obtener premios
            const premios = this.obtenerPremios();

            const nuevoAnimal = {
                id: idFinal,
                registro: registro,
                nombre: nombre,
                raza: raza,
                sexo: sexo,
                fecha_nacimiento: fecha_nacimiento,
                partos: sexo === 'Hembra' ? parseInt(partos) || 0 : null,
                circunferencia_escrotal: sexo === 'Macho' ? parseFloat(circunferencia_escrotal) || null : null,
                peso: parseFloat(peso),
                altura: parseFloat(altura),
                premios: premios,
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
            
            this.cerrarModal();
            this.mostrarAnimales();
            
        } catch (error) {
            console.error('❌ Error al guardar:', error);
            alert('⚠️ Error: No se pudo guardar en Supabase: ' + error.message);
        } finally {
            // Rehabilitar botón
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
        }
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