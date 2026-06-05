#  La Pastelería — Sitio Web Completo

Aplicación web con catálogo, carrito de compras, reseñas por producto y sistema de pedidos.

## Estructura del proyecto

```
pasteleria/
├── backend/
│   ├── server.js        ← Servidor Express + todas las rutas API
│   ├── db.js            ← Base de datos SQLite (se crea automáticamente)
│   └── package.json
└── frontend/
    └── public/
        └── index.html   ← Frontend completo (una sola página)
```

---

## Instalación y arranque

### 1. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 2. Iniciar el servidor

```bash
node server.js
```

### 3. Abrir en el navegador

```
http://localhost:3000
```

¡Eso es todo! El servidor sirve el frontend automáticamente.

---

## 🔌 API disponible

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Listar todos los productos |
| GET | `/api/productos?categoria=Frutas` | Filtrar por categoría |
| GET | `/api/productos/:id` | Detalle de un producto |
| GET | `/api/productos/:id/resenas` | Reseñas de un producto |
| POST | `/api/productos/:id/resenas` | Publicar reseña |
| POST | `/api/pedidos` | Crear pedido desde carrito |
| GET | `/api/pedidos` | Ver todos los pedidos (admin) |

### Ejemplo: Crear un pedido

```json
POST /api/pedidos
{
  "cliente_nombre": "Ana López",
  "cliente_email": "ana@email.com",
  "items": [
    { "producto_id": 1, "cantidad": 2 },
    { "producto_id": 3, "cantidad": 1 }
  ]
}
```

### Ejemplo: Publicar reseña

```json
POST /api/productos/1/resenas
{
  "autor": "María",
  "estrellas": 5,
  "comentario": "Delicioso, lo recomiendo mucho!"
}
```

---

##  Funcionalidades incluidas

- **Catálogo** con filtros por categoría
- **Selector de cantidad** (+/−) por producto
- **Carrito lateral** con cantidades editables y total en tiempo real
- **Reseñas** con calificación de estrellas por producto
- **Formulario de pedido** con resumen antes de confirmar
- **Base de datos SQLite** (no requiere instalar nada adicional)
- **8 productos** de ejemplo incluidos

---

##  Próximos pasos sugeridos

- Agregar autenticación con JWT
- Panel de administración para gestionar productos y pedidos
- Pasarela de pago (Stripe)
- Notificaciones por email al confirmar pedido
- Subida de imágenes reales para los productos
