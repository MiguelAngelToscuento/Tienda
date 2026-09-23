// Guardar datos del perfil del cliente
const formPerfil = document.getElementById("formCliente");

if (formPerfil) {
  formPerfil.addEventListener("submit", function (e) {
    e.preventDefault();

    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
      alert("Error de sesión. Por favor, inicia sesión nuevamente.");
      window.location.href = "index.html";
      return;
    }

    const nuevoCliente = {
      nombreCompleto: document.getElementById("nombreCliente").value,
      telefono: document.getElementById("telCliente").value,
      direccionEnvio: document.getElementById("dirCliente").value,
      usuario: { id: parseInt(usuarioId) },
    };

    fetch("http://localhost:8080/cliente/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoCliente),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("¡Perfil guardado con éxito!");
          localStorage.setItem("clienteId", data.data.id);
          window.location.href = "catalogo.html";
        } else {
          alert("Hubo un error: " + data.message);
        }
      })
      .catch((error) => console.error("Error al registrar:", error));
  });
}

// Cerrar sesión del usuario
const btnSalir = document.getElementById("btnCerrarSesionCat");
if (btnSalir) {
  btnSalir.addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "index.html";
  });
}

// Variables globales del sistema
let productosGlobales = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let filtroActivo = "";
let busquedaActiva = "";
let paginaActual = 1;
const productosPorPagina = 8;

// Configuración principal del catálogo
const contenedorCatalogo = document.getElementById("catalogoGlobal");

if (contenedorCatalogo) {
  // Búsqueda de productos por texto
  const inputBusqueda = document.getElementById("inputBusqueda");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", function (e) {
      busquedaActiva = e.target.value;
      paginaActual = 1;
      actualizarUrlYRenderizar();
    });
  }

  // Mostrar ventana emergente de pago
  const btnPagar = document.getElementById("btnPagar");
  if (btnPagar) {
    btnPagar.addEventListener("click", function () {
      if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
      }

      const offcanvasElement = document.getElementById("carritoLateral");
      const offcanvasInstance =
        bootstrap.Offcanvas.getInstance(offcanvasElement) ||
        new bootstrap.Offcanvas(offcanvasElement);
      offcanvasInstance.hide();

      const total = carrito.reduce(
        (sum, item) => sum + item.precio * item.cantidad,
        0,
      );
      document.getElementById("checkoutTotal").innerText = total.toFixed(2);

      const modalPago = new bootstrap.Modal(
        document.getElementById("modalCheckout"),
      );
      modalPago.show();
    });
  }

  // Alternar vistas según el método de pago seleccionado
  const radiosPago = document.querySelectorAll(".opciones-pago");
  const btnConfirmarCompra = document.getElementById("btnConfirmarCompra");

  radiosPago.forEach((radio) => {
    radio.addEventListener("change", function () {
      document.getElementById("cajaTarjeta").style.display =
        this.value === "Tarjeta" ? "block" : "none";
      document.getElementById("cajaPaypal").style.display =
        this.value === "PayPal" ? "block" : "none";
      document.getElementById("cajaOxxo").style.display =
        this.value === "Oxxo" ? "block" : "none";

      if(btnConfirmarCompra) {
          btnConfirmarCompra.style.display = this.value === "PayPal" ? "none" : "block";
      }
    });
  });

  // Registrar la orden de compra en la base de datos
  function guardarOrdenEnBaseDeDatos(metodoElegido) {
    const clienteId = localStorage.getItem("clienteId");
    if (!clienteId) {
      alert("Error: No se encontró tu perfil de cliente. Por favor inicia sesión");
      return;
    }

    const nuevaOrden = {
      cliente: { id: parseInt(clienteId) },
      total: carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
      metodoPago: metodoElegido,
      detalles: carrito.map((item) => ({
        producto: { id: parseInt(item.id) },
        cantidad: parseInt(item.cantidad),
        precioUnitario: parseFloat(item.precio),
      })),
    };

    fetch("http://localhost:8080/orden/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaOrden),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          if (metodoElegido === "Oxxo") {
            alert("¡Orden generada! proximamente se habilitará un código de barras para completar el pago.");
          } else {
            alert("¡Pago aprobado! Compra realizada con éxito, tu pedido está en camino.");
          }
          carrito = [];
          guardarCarrito();
          window.location.reload();
        } else {
          alert("Hubo un problema al procesar el pago: " + data.message);
        }
      })
      .catch((error) => console.error("Error al procesar la compra: ", error));
  }

  // Procesar pago con Tarjeta u Oxxo
  if (btnConfirmarCompra) {
    btnConfirmarCompra.addEventListener("click", function () {
      const metodoElegido = document.querySelector('input[name="metodoPago"]:checked').value;
      btnConfirmarCompra.innerText = "Procesando pago...";
      btnConfirmarCompra.disabled = true;
      guardarOrdenEnBaseDeDatos(metodoElegido);
    });
  }

  // Inyección de botones de pago con PayPal
  if (window.paypal) {
    paypal.Buttons({
      createOrder: function(data, actions) {
        const totalCarrito = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2);
        return actions.order.create({
          purchase_units: [{
            amount: { value: totalCarrito }
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(detallesPago) {
          console.log("Pago exitoso vía PayPal:", detallesPago);
          guardarOrdenEnBaseDeDatos("PayPal");
        });
      },
      onError: function(err) {
        console.error("Error en el pago con PayPal", err);
        alert("El pago fue cancelado o hubo un error de conexión con PayPal.");
      }
    }).render('#paypal-button-container');
  }

  // Aplicar filtro por categoría
  window.aplicarFiltro = function (categoria) {
    filtroActivo = categoria;
    paginaActual = 1;
    actualizarUrlYRenderizar();
  };

  // Actualizar URL con parámetros de búsqueda y renderizar
  function actualizarUrlYRenderizar() {
    const params = new URLSearchParams();
    if (filtroActivo) params.set("categoria", filtroActivo);
    if (busquedaActiva) params.set("q", busquedaActiva);
    if (paginaActual > 1) params.set("pagina", paginaActual);

    const nuevaUrl =
      window.location.pathname +
      (params.toString() ? "?" + params.toString() : "");
    window.history.pushState({ path: nuevaUrl }, "", nuevaUrl);

    ejecutarFiltroLocales();
    renderizarFiltros();
  }

  // Filtrar lista de productos localmente
  function ejecutarFiltroLocales() {
    let filtrados = productosGlobales;

    if (filtroActivo) {
      filtrados = filtrados.filter((p) => p.categoria === filtroActivo);
    }
    if (busquedaActiva) {
      const texto = busquedaActiva.toLowerCase();
      filtrados = filtrados.filter(
        (p) =>
          p.titulo.toLowerCase().includes(texto) ||
          p.categoria.toLowerCase().includes(texto),
      );
    }

    renderizarProductos(filtrados);
  }

  // Leer parámetros de la URL al cargar la página
  function leerUrlYFiltrar() {
    const params = new URLSearchParams(window.location.search);
    filtroActivo = params.get("categoria") || "";
    busquedaActiva = params.get("q") || "";
    paginaActual = parseInt(params.get("pagina")) || 1;

    const inputB = document.getElementById("inputBusqueda");
    if (inputB) inputB.value = busquedaActiva;

    ejecutarFiltroLocales();
    renderizarFiltros();
  }

  // Detectar navegación del navegador (botones atrás/adelante)
  window.addEventListener("popstate", () => {
    leerUrlYFiltrar();
  });

  // Dibujar botones de categorías en pantalla
  function renderizarFiltros() {
    const contenedor = document.getElementById("contenedorFiltros");
    if (!contenedor) return;
    const categorias = [...new Set(productosGlobales.map((p) => p.categoria))];
    let html = `<button class="btn btn-${filtroActivo === "" ? "primary" : "outline-primary"} text-nowrap" onclick="aplicarFiltro('')">Todas</button>`;
    categorias.forEach((cat) => {
      if (!cat) return;
      const btnClass = filtroActivo === cat ? "primary" : "outline-primary";
      html += `<button class="btn btn-${btnClass} text-nowrap" onclick="aplicarFiltro('${cat}')">${cat}</button>`;
    });
    contenedor.innerHTML = html;
  }

  // Obtener todos los productos desde el servidor
  function cargarCatalogoCompleto() {
    fetch("http://localhost:8080/producto/findAll")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          productosGlobales = data.data;
          leerUrlYFiltrar();
          actualizarVistaCarrito();
          actualizarVistaFavoritos();
        }
      })
      .catch((error) => console.error("Error al cargar el catálogo: ", error));
  }

  cargarCatalogoCompleto();
}

// Dibujar tarjetas de productos con paginación
function renderizarProductos(lista) {
  const contenedor = document.getElementById("catalogoGlobal");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML =
      '<h5 class="text-center w-100 text-muted mt-5">No se encontraron productos.</h5>';
    document.getElementById("textoPaginacion").innerText = "Página 0 de 0";
    document.getElementById("btnAnterior").disabled = true;
    document.getElementById("btnSiguiente").disabled = true;
    return;
  }

  const totalPaginas = Math.ceil(lista.length / productosPorPagina);
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;
  if (paginaActual < 1) paginaActual = 1;
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPaginados = lista.slice(inicio, fin);

  let html = "";
  productosPaginados.forEach((prod) => {
    const imagen = prod.urlImagen || "https://via.placeholder.com/200?text=Sin+Imagen";
    const esFavorito = favoritos.some((fav) => fav.id === prod.id);
    const corazonEmoji = esFavorito ? "❤️" : "🤍";
    const nombreTienda = prod.tienda && prod.tienda.nombreTienda ? prod.tienda.nombreTienda : "Vendedor independiente";

    html += `
        <div class="col-md-3 col-sm-6 mb-4">
            <div class="card h-100 shadow-sm border-0 position-relative">
                <button onclick="toggleFavorito(${prod.id}, '${prod.titulo}', ${prod.precio}, '${imagen}')"
                        class="btn btn-light shadow-sm position-absolute"
                        style="top: 10px; right: 10px; border-radius: 50%; width: 40px; height: 40px; z-index: 10;">
                    ${corazonEmoji}
                </button>
                <img src="${imagen}" class="card-img-top" style="height: 180px; object-fit: cover; cursor: pointer;" onclick="abrirDetalleProducto(${prod.id})">
                <div class="card-body pb-2">
                    <span class="badge bg-secondary mb-2">${prod.categoria}</span>
                    <h6 class="card-title text-truncate mb-1" style="cursor: pointer;" onclick="abrirDetalleProducto(${prod.id})">${prod.titulo}</h6>
                    <p class="small text-primary mb-2 fw-bold text-truncate" title="Vendido por: ${nombreTienda}">
                       🏪 ${nombreTienda}
                    </p>
                    <p class="text-success fw-bold fs-5 mb-1">$${prod.precio.toFixed(2)}</p>
                    <p class="text-muted small mb-0">Stock: ${prod.stock} disponibles</p>
                </div>
                <div class="card-footer bg-white border-0 d-grid">
                    <button onclick="agregarAlCarrito(${prod.id}, '${prod.titulo}', ${prod.precio}, ${prod.stock})" class="btn btn-primary btn-sm">Agregar al carrito</button>
                </div>
            </div>
        </div>
    `;
  });

  contenedor.innerHTML = html;
  document.getElementById("textoPaginacion").innerText = `Página ${paginaActual} de ${totalPaginas}`;
  document.getElementById("btnAnterior").disabled = paginaActual === 1;
  document.getElementById("btnSiguiente").disabled = paginaActual === totalPaginas;
}

// Cambiar de página en el catálogo
window.cambiarPagina = function (direccion) {
  paginaActual += direccion;
  actualizarUrlYRenderizar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Agregar un producto al carrito de compras
function agregarAlCarrito(id, titulo, precio, stock) {
  const itemExistente = carrito.find((item) => item.id === id);

  if (itemExistente) {
    if (itemExistente.cantidad >= stock) {
      alert("¡Límite alcanzado! No hay más stock disponible de este producto.");
      return;
    }
    itemExistente.cantidad++;
  } else {
    if (stock <= 0) {
      alert("Este producto está agotado por el momento.");
      return;
    }
    carrito.push({ id, titulo, precio, cantidad: 1, stockMaximo: stock });
  }
  guardarCarrito();
}

// Modificar la cantidad de un producto en el carrito
function cambiarCantidad(id, delta) {
  const item = carrito.find((item) => item.id === id);
  if (item) {
    if (delta > 0 && item.cantidad >= item.stockMaximo) {
      alert("No puedes agregar más, has alcanzado el stock disponible.");
      return;
    }
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      carrito = carrito.filter((prod) => prod.id !== id);
    }
    guardarCarrito();
  }
}

// Guardar estado del carrito en almacenamiento local
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarVistaCarrito();
}

// Actualizar interfaz visual del carrito de compras
function actualizarVistaCarrito() {
  const contenedor = document.getElementById("listaCarrito");
  const spanTotal = document.getElementById("totalCarrito");
  const badgeCarrito = document.getElementById("badgeCarrito");

  if (!contenedor) return;

  if (carrito.length === 0) {
    contenedor.innerHTML =
      '<p class="text-muted text-center mt-4">El carrito está vacío</p>';
    spanTotal.innerText = "0.00";
    badgeCarrito.innerText = "0";
    return;
  }

  let html = "";
  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach((item) => {
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
    html += `
        <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <div style="width: 60%">
                <h6 class="mb-0 text-truncate">${item.titulo}</h6>
                <small class="text-muted">$${item.precio.toFixed(2)} c/u</small>
            </div>
            <div class="d-flex align-items-center">
                <button onclick="cambiarCantidad(${item.id}, -1)" class="btn btn-sm btn-outline-secondary px-2">-</button>
                <span class="mx-2 fw-bold">${item.cantidad}</span>
                <button onclick="cambiarCantidad(${item.id}, 1)" class="btn btn-sm btn-outline-secondary px-2">+</button>
            </div>
        </div>
    `;
  });

  contenedor.innerHTML = html;
  spanTotal.innerText = total.toFixed(2);
  badgeCarrito.innerText = cantidadTotal;
}

// Obtener y mostrar el historial de pedidos del cliente
function cargarMisCompras() {
  const clienteId = localStorage.getItem("clienteId");
  if (!clienteId) return;

  fetch(`http://localhost:8080/orden/cliente/${clienteId}`)
    .then((response) => response.json())
    .then((data) => {
      const contenedor = document.getElementById("listaMisCompras");

      if (data.success && data.data.length > 0) {
        let html = "";
        data.data.reverse().forEach((orden) => {
          let colorEstado = "bg-secondary";
          if (orden.estadoEnvio === "Preparando") colorEstado = "bg-warning text-dark";
          if (orden.estadoEnvio === "Enviado") colorEstado = "bg-primary";
          if (orden.estadoEnvio === "Entregado") colorEstado = "bg-success";

          let listaArticulos = "";
          if (orden.detalles && orden.detalles.length > 0) {
            orden.detalles.forEach((item) => {
              let nombreProd = item.producto ? item.producto.titulo : "Producto";
              listaArticulos += `
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-1 border-0" style="font-size: 14px;">
                        <span><span class="badge bg-light text-dark border me-2">${item.cantidad}x</span> ${nombreProd}</span>
                        <span class="text-muted">$${(item.cantidad * item.precioUnitario).toFixed(2)}</span>
                    </li>`;
            });
          } else {
            listaArticulos = `<li class="list-group-item px-0 py-1 border-0 text-muted small">Detalles no disponibles</li>`;
          }

          html += `
            <div class="card shadow-sm border-0 border-start border-4 border-primary mb-3">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <div>
                        <small class="text-muted m-0">PEDIDO N° ${orden.id}</small>
                    </div>
                    <span class="badge ${colorEstado} fs-6">${orden.estadoEnvio || "Procesando"}</span>
                </div>
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <p class="mb-1 fw-bold">Total Pagado: $${orden.total.toFixed(2)}</p>
                            <p class="text-muted small mb-0">Método de pago: ${orden.metodoPago || "No especificado"}</p>
                        </div>
                        <div class="col-md-4 text-end">
                            <button onclick="toggleDetalles(${orden.id})" class="btn btn-sm btn-outline-primary">Ver detalles</button>
                        </div>
                    </div>

                    <div id="detalles-${orden.id}" class="mt-3 pt-2 border-top" style="display: none;">
                        <h6 class="small text-muted mb-2">Artículos en el pedido:</h6>
                        <ul class="list-group list-group-flush">
                            ${listaArticulos}
                        </ul>
                    </div>
                </div>
            </div>
          `;
        });
        contenedor.innerHTML = html;
      } else {
        contenedor.innerHTML =
          '<div class="text-center text-muted p-4">Aún no tienes pedidos registrados.</div>';
      }
    })
    .catch((error) => console.error("Error al cargar historial: ", error));
}

// Mostrar u ocultar detalles de una orden específica
function toggleDetalles(idOrden) {
  const caja = document.getElementById(`detalles-${idOrden}`);
  if (caja.style.display === "none") {
    caja.style.display = "block";
  } else {
    caja.style.display = "none";
  }
}

// Agregar o quitar producto de la lista de favoritos
function toggleFavorito(id, titulo, precio, imagen) {
  const index = favoritos.findIndex((fav) => fav.id === id);

  if (index > -1) {
    favoritos.splice(index, 1);
  } else {
    favoritos.push({ id, titulo, precio, imagen });
  }

  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  ejecutarFiltroLocales();
  actualizarVistaFavoritos();
}

// Actualizar interfaz visual de favoritos
function actualizarVistaFavoritos() {
  const contenedor = document.getElementById("listaFavoritos");
  const badge = document.getElementById("badgeFavoritos");

  if (!contenedor) return;

  badge.innerText = favoritos.length;

  if (favoritos.length === 0) {
    contenedor.innerHTML =
      '<p class="text-muted text-center mt-4">Aún no tienes favoritos</p>';
    return;
  }

  let html = "";
  favoritos.forEach((item) => {
    html += `
        <div class="card border-0 shadow-sm">
            <div class="row g-0 align-items-center">
                <div class="col-4">
                    <img src="${item.imagen}" class="img-fluid rounded-start" style="height: 80px; object-fit: cover; width: 100%;">
                </div>
                <div class="col-8">
                    <div class="card-body p-2">
                        <h6 class="card-title text-truncate mb-1 small">${item.titulo}</h6>
                        <p class="text-success fw-bold mb-1 small">$${item.precio.toFixed(2)}</p>
                        <div class="d-flex justify-content-between mt-2">
                            <button onclick="toggleFavorito(${item.id})" class="btn btn-sm btn-outline-danger" style="font-size: 11px;">Eliminar</button>
                            <button onclick="agregarAlCarrito(${item.id}, '${item.titulo}', ${item.precio}, 99)" class="btn btn-sm btn-primary" style="font-size: 11px;">Al carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
  });

  contenedor.innerHTML = html;
}

// Mostrar ventana con detalles completos del producto
function abrirDetalleProducto(id) {
    const prod = productosGlobales.find(p => p.id === id);
    if (!prod) return;

    document.getElementById("detalleImagen").src = prod.urlImagen || "https://via.placeholder.com/400?text=Sin+Imagen";
    document.getElementById("detalleCategoria").innerText = prod.categoria;
    document.getElementById("detalleTitulo").innerText = prod.titulo;
    document.getElementById("detalleTienda").innerText = prod.tienda && prod.tienda.nombreTienda ? prod.tienda.nombreTienda : "Vendedor independiente";
    document.getElementById("detallePrecio").innerText = prod.precio.toFixed(2);
    document.getElementById("detalleDescripcion").innerText = prod.descripcion || "El vendedor no incluyó una descripción para este producto.";
    document.getElementById("detalleStock").innerText = prod.stock;

    document.getElementById("btnDetalleAgregarCarrito").onclick = () => {
        agregarAlCarrito(prod.id, prod.titulo, prod.precio, prod.stock);
        bootstrap.Modal.getInstance(document.getElementById('modalDetalleProducto')).hide();
        new bootstrap.Offcanvas(document.getElementById('carritoLateral')).show();
    };

    document.getElementById("resenaProductoId").value = prod.id;
    cargarResenas(prod.id);
    renderizarRecomendados(prod.categoria, prod.id);

    new bootstrap.Modal(document.getElementById('modalDetalleProducto')).show();
}

// Obtener y dibujar reseñas de un producto
function cargarResenas(idProducto) {
    fetch(`http://localhost:8080/resena/producto/${idProducto}`)
        .then(res => res.json())
        .then(data => {
            const contenedor = document.getElementById("listaResenas");
            if (data.success && data.data.length > 0) {
                let html = "";
                data.data.forEach(r => {
                    const estrellas = "⭐".repeat(r.calificacion);
                    const fecha = new Date(r.fechaCreacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
                    const autor = r.cliente && r.cliente.nombreCompleto ? r.cliente.nombreCompleto : "Comprador Verificado";

                    html += `
                        <div class="mb-3 border-bottom pb-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="fw-bold fs-6">${estrellas}</span>
                                <span class="text-muted" style="font-size: 11px;">${fecha}</span>
                            </div>
                            <p class="m-0 mt-1 text-dark" style="font-size: 14px;">${r.comentario}</p>
                            <small class="text-muted mt-2 d-block">Por: ${autor}</small>
                        </div>
                    `;
                });
                contenedor.innerHTML = html;
            } else {
                contenedor.innerHTML = '<p class="text-muted small m-0 text-center py-4">Aún no hay opiniones para este producto. ¡Sé el primero en calificarlo!</p>';
            }
        })
        .catch(err => console.error("Error al cargar reseñas:", err));
}

// Guardar una nueva reseña en la base de datos
const formResena = document.getElementById("formResena");
if (formResena) {
    formResena.addEventListener("submit", function (e) {
        e.preventDefault();

        const clienteId = localStorage.getItem("clienteId");
        if (!clienteId) {
            alert("Necesitas iniciar sesión para poder dejar una opinión sobre este producto.");
            return;
        }

        const idProducto = document.getElementById("resenaProductoId").value;
        const nuevaResena = {
            calificacion: parseInt(document.getElementById("resenaCalificacion").value),
            comentario: document.getElementById("resenaComentario").value,
            producto: { id: parseInt(idProducto) },
            cliente: { id: parseInt(clienteId) }
        };

        fetch("http://localhost:8080/resena/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaResena)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById("resenaComentario").value = "";
                cargarResenas(idProducto);
            } else {
                alert("Error al guardar la reseña: " + data.message);
            }
        })
        .catch(err => console.error("Error al enviar reseña:", err));
    });
}

// Mostrar productos similares de la misma categoría
function renderizarRecomendados(categoria, idActual) {
    const contenedor = document.getElementById("listaRecomendados");
    const recomendados = productosGlobales.filter(p => p.categoria === categoria && p.id !== idActual).slice(0, 3);

    if (recomendados.length === 0) {
        contenedor.innerHTML = '<p class="text-muted small p-3 bg-light rounded text-center">No hay otros productos similares en esta categoría.</p>';
        return;
    }

    let html = "";
    recomendados.forEach(prod => {
        const imagen = prod.urlImagen || "https://via.placeholder.com/150";
        html += `
            <div class="card border-0 shadow-sm" style="cursor:pointer;" onclick="abrirDetalleProducto(${prod.id})">
                <div class="row g-0 align-items-center">
                    <div class="col-4">
                        <img src="${imagen}" class="img-fluid rounded-start" style="height: 90px; object-fit: cover; width: 100%;">
                    </div>
                    <div class="col-8">
                        <div class="card-body p-2 px-3">
                            <h6 class="card-title mb-1 text-truncate" style="font-size: 13px;">${prod.titulo}</h6>
                            <p class="text-success fw-bold m-0 fs-6">$${prod.precio.toFixed(2)}</p>
                            <small class="text-primary" style="font-size: 11px;">Envío disponible</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    contenedor.innerHTML = html;
}