// server.js - Versión con Supabase
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    console.log('📖 Leyendo animales desde Supabase...');
    
    const { data, error } = await supabase
      .from('animales')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} animales cargados desde Supabase`);
    res.json(data || []);
    
  } catch (error) {
    console.error('❌ Error leyendo la base de datos:', error);
    res.status(500).json({ error: 'No se pudieron cargar los datos' });
  }
});

// Ruta para GUARDAR la lista completa de animales
app.post('/api/animales', async (req, res) => {
  try {
    const nuevosAnimales = req.body;
    console.log('💾 Guardando animales en Supabase:', nuevosAnimales.length);
    
    // Validar que sea un array
    if (!Array.isArray(nuevosAnimales)) {
      return res.status(400).json({ error: 'Los datos deben ser un array' });
    }

    // Primero eliminamos todos los registros existentes
    const { error: deleteError } = await supabase
      .from('animales')
      .delete()
      .not('id', 'is', null);

    if (deleteError) {
      console.error('❌ Error eliminando datos anteriores:', deleteError);
      throw deleteError;
    }

    console.log('✅ Datos anteriores eliminados');

    // Si no hay animales nuevos, retornar éxito
    if (nuevosAnimales.length === 0) {
      return res.json({ 
        success: true, 
        message: 'Base de datos limpiada correctamente',
        count: 0
      });
    }

    // Luego insertamos los nuevos animales
    const { data, error: insertError } = await supabase
      .from('animales')
      .insert(nuevosAnimales)
      .select();

    if (insertError) {
      console.error('❌ Error insertando nuevos datos:', insertError);
      throw insertError;
    }

    console.log(`✅ ${data.length} animales guardados en Supabase`);
    
    res.json({ 
      success: true, 
      message: `Datos guardados correctamente (${nuevosAnimales.length} animales)`,
      count: nuevosAnimales.length,
      data: data
    });
    
  } catch (error) {
    console.error('❌ Error guardando en la base de datos:', error);
    res.status(500).json({ error: 'No se pudieron guardar los datos: ' + error.message });
  }
});

// Ruta para OBTENER un animal específico por ID
app.get('/api/animales/:id', async (req, res) => {
  try {
    const animalId = req.params.id;
    console.log('🔍 Buscando animal con ID:', animalId);
    
    const { data, error } = await supabase
      .from('animales')
      .select('*')
      .eq('id', animalId)
      .single();

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    if (!data) {
      console.log('❌ Animal no encontrado:', animalId);
      return res.status(404).json({ error: 'Animal no encontrado' });
    }

    console.log('✅ Animal encontrado:', data.nombre);
    res.json(data);
    
  } catch (error) {
    console.error('❌ Error buscando animal:', error);
    res.status(500).json({ error: 'Error buscando animal: ' + error.message });
  }
});

// Ruta de salud para verificar que el servidor funciona
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión con Supabase
    const { data, error } = await supabase
      .from('animales')
      .select('count')
      .limit(1);

    const supabaseStatus = error ? 'ERROR' : 'CONNECTED';
    
    res.json({ 
      status: 'OK', 
      message: 'Servidor de animales funcionando',
      supabase: supabaseStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      status: 'WARNING', 
      message: 'Servidor funcionando pero con errores en Supabase',
      supabase: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Manejar todas las demás rutas para SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`🐾 Servidor ejecutándose en http://localhost:${port}`);
    console.log(`🗄️  Conectado a Supabase: ${supabaseUrl ? '✅' : '❌'}`);
  });
}

// Exportar para Vercel
module.exports = app;