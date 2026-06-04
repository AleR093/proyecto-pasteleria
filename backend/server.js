const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ─────────────────────────────────────────────
// PRODUCTOS
// ─────────────────────────────────────────────

// GET /api/productos  — lista completa (o filtrada por categoría)
app.get('/api/productos', (req, res) => {
  const { categoria } = req.query;
  let rows;
  if (categoria && categoria !== 'Todos') {
    rows = db.prepare('SELECT * FROM productos WHERE categoria = ?').all(categoria);
  } else {
    rows = db.prepare('SELECT * FROM productos').all();
  }
  // Adjuntar promedio de estrellas y total de reseñas
  const stmt = db.prepare(
    'SELECT AVG(estrellas) as promedio, COUNT(*) as total FROM resenas WHERE producto_id = ?'
  );
  rows = rows.map(p => {
    const r = stmt.get(p.id);
    return { ...p, promedio_estrellas: r.promedio ? parseFloat(r.promedio.toFixed(1)) : 0, total_resenas: r.total };
  });
  res.json(rows);
});

// GET /api/productos/:id
app.get('/api/productos/:id', (req, res) => {
  const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

// ─────────────────────────────────────────────
// RESEÑAS
// ─────────────────────────────────────────────

// GET /api/productos/:id/resenas
app.get('/api/productos/:id/resenas', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM resenas WHERE producto_id = ? ORDER BY fecha DESC'
  ).all(req.params.id);
  res.json(rows);
});

// POST /api/productos/:id/resenas
app.post('/api/productos/:id/resenas', (req, res) => {
  const { autor, estrellas, comentario } = req.body;
  if (!autor || !estrellas) return res.status(400).json({ error: 'Faltan campos requeridos' });
  if (estrellas < 1 || estrellas > 5) return res.status(400).json({ error: 'Estrellas debe ser entre 1 y 5' });

  const info = db.prepare(
    'INSERT INTO resenas (producto_id, autor, estrellas, comentario) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, autor, estrellas, comentario || '');

  const nueva = db.prepare('SELECT * FROM resenas WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(nueva);
});

// ─────────────────────────────────────────────
// PEDIDOS (CARRITO → ORDEN)
// ─────────────────────────────────────────────

// POST /api/pedidos  — confirmar carrito
app.post('/api/pedidos', (req, res) => {
  const { cliente_nombre, cliente_email, items } = req.body;
  if (!cliente_nombre || !cliente_email || !items?.length)
    return res.status(400).json({ error: 'Faltan datos del pedido' });

  // Calcular total y verificar stock
  let total = 0;
  for (const item of items) {
    const p = db.prepare('SELECT * FROM productos WHERE id = ?').get(item.producto_id);
    if (!p) return res.status(404).json({ error: `Producto ${item.producto_id} no encontrado` });
    if (p.stock < item.cantidad)
      return res.status(400).json({ error: `Stock insuficiente para "${p.nombre}"` });
    total += p.precio * item.cantidad;
    item._precio = p.precio;
  }

  // Transacción: crear pedido + items + descontar stock
  const crearPedido = db.transaction(() => {
    const pedidoId = db.prepare(
      'INSERT INTO pedidos (cliente_nombre, cliente_email, total) VALUES (?, ?, ?)'
    ).run(cliente_nombre, cliente_email, total).lastInsertRowid;

    for (const item of items) {
      db.prepare(
        'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)'
      ).run(pedidoId, item.producto_id, item.cantidad, item._precio);
      db.prepare('UPDATE productos SET stock = stock - ? WHERE id = ?').run(item.cantidad, item.producto_id);
    }
    return pedidoId;
  });

  const pedidoId = crearPedido();
  const pedido   = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
  res.status(201).json({ mensaje: '¡Pedido confirmado!', pedido });
});

// GET /api/pedidos  — listar todos (admin)
app.get('/api/pedidos', (req, res) => {
  const pedidos = db.prepare('SELECT * FROM pedidos ORDER BY fecha DESC').all();
  res.json(pedidos);
});

// ─────────────────────────────────────────────
// SPA fallback
// ─────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🎂  La Pastelería corriendo en http://localhost:${PORT}\n`);
});
