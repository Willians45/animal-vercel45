// server.js - Versión para Vercel
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// IMPORTANTE: Para Vercel, la ruta de la base de datos debe ser relativa
const dbFile = path.join(__dirname, 'public', 'data', 'db.json');

// Middleware para permitir peticiones desde tu frontend y parsear JSON
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para la página de perfil de animal
app.get('/animal.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'animal.html'));
});

// Ruta para OBTENER todos los animales
app.get('/api/animales', async (req, res) => {
  try {
    console.log('📖 Leyendo base de datos...');
    const data = await fs.readFile(dbFile, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.animales || []);
  } catch (error) {
    console.error('❌ Error leyendo la base de datos:', error);
    
    // Si el archivo no existe, crear uno por defecto
    if (error.code === 'ENOENT') {
      const datosIniciales = { animales: [] };
      await fs.writeFile(dbFile, JSON.stringify(datosIniciales, null, 2));
      res.json([]);
    } else {
      res.status(500).json({ error: 'No se pudieron cargar los datos' });
    }
  }
});

// Ruta para GUARDAR la lista completa de animales
app.post('/api/animales', async (req, res) => {
  try {
    const nuevosAnimales = req.body;
    console.log('💾 Guardando animales:', nuevosAnimales.length);
    
    // Validar que sea un array
    if (!Array.isArray(nuevosAnimales)) {
      return res.status(400).json({ error: 'Los datos deben ser un array' });
    }

    // Guarda el array de animales dentro de un objeto que contiene la clave "animales"
    const datosParaGuardar = { animales: nuevosAnimales };
    await fs.writeFile(dbFile, JSON.stringify(datosParaGuardar, null, 2));
    
    res.json({ 
      success: true, 
      message: `Datos guardados correctamente (${nuevosAnimales.length} animales)`,
      count: nuevosAnimales.length
    });
  } catch (error) {
    console.error('❌ Error guardando en la base de datos:', error);
    res.status(500).json({ error: 'No se pudieron guardar los datos' });
  }
});

// Ruta de salud para verificar que el servidor funciona
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de animales funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejar todas las demás rutas para SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`🐾 Servidor ejecutándose en http://localhost:${port}`);
    console.log(`📁 Ruta de DB: ${dbFile}`);
  });
}

// Exportar para Vercel
module.exports = app;