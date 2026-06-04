const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'pasteleria.db'));

// Tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL,
    categoria TEXT,
    emoji TEXT,
    color_from TEXT,
    color_to TEXT,
    badge TEXT,
    stock INTEGER DEFAULT 99
  );

  CREATE TABLE IF NOT EXISTS resenas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    autor TEXT NOT NULL,
    estrellas INTEGER NOT NULL CHECK(estrellas BETWEEN 1 AND 5),
    comentario TEXT,
    fecha TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(producto_id) REFERENCES productos(id)
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_nombre TEXT NOT NULL,
    cliente_email TEXT NOT NULL,
    total REAL NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    fecha TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pedido_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    FOREIGN KEY(pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY(producto_id) REFERENCES productos(id)
  );
`);

// Seed productos si la tabla está vacía
const count = db.prepare('SELECT COUNT(*) as c FROM productos').get();
if (count.c === 0) {
  const insert = db.prepare(`
    INSERT INTO productos (nombre, descripcion, precio, categoria, emoji, color_from, color_to, badge, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const productos = [
    ['Pastel de Vainilla Clásico', 'Esponjoso bizcocho de vainilla bourbon con crema de mantequilla y mermelada de fresas.', 28, 'Clásicos', '🎂', '#fce4d0', '#f9c4a0', 'Popular', 15],
    ['Selva Negra', 'Capas de bizcocho de chocolate con chantilly, cerezas y virutas de chocolate.', 35, 'Chocolate', '🍫', '#3a2318', '#6b3e2a', null, 10],
    ['Fresas con Crema', 'Bizcocho genovés con crema pastelera, fresas frescas y glaseado de frambuesa.', 30, 'Frutas', '🍓', '#fde8f0', '#f9c0d5', 'Nuevo', 12],
    ['Tarta de Limón', 'Base sablée, crema de limón siciliano y merengue italiano tostado.', 26, 'Frutas', '🍋', '#fff3cc', '#ffe080', null, 20],
    ['Pastel de Zanahoria', 'Húmedo bizcocho de zanahoria con nueces y frosting de queso crema.', 29, 'Sin gluten', '🌿', '#e8f5e9', '#a5d6a7', 'Sin gluten', 8],
    ['Red Velvet', 'Clásico americano con color rojo intenso y suave frosting de queso crema.', 34, 'Ocasiones', '🍰', '#5a3825', '#c96b6b', null, 10],
    ['Cheesecake de Blueberry', 'Base de galleta, relleno cremoso de queso y coulis de arándanos frescos.', 32, 'Frutas', '🫐', '#f3e5f5', '#ce93d8', 'Popular', 6],
    ['Pastel de Cumpleaños', 'Tres capas de vainilla con buttercream de colores y decoración festiva.', 40, 'Ocasiones', '🎉', '#d4843e', '#f5c97a', null, 5],
  ];
  for (const p of productos) insert.run(...p);
  console.log('✅ Base de datos inicializada con productos de ejemplo.');
}

module.exports = db;
