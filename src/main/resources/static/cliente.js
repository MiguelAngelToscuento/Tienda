// Guardar perfil
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

// Cerrar sesión
const btnSalir = document.getElementById("btnCerrarSesionCat");
if (btnSalir) {
  btnSalir.addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "index.html";
  });
}

// Variables globales
let productosGlobales = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let filtroActivo = "";
let busquedaActiva = "";

// Operaciones del catálogo
const contenedorCatalogo = document.getElementById("catalogoGlobal");

if (contenedorCatalogo) {
  // Búsqueda
  // Búsqueda
  const inputBusqueda = document.getElementById("inputBusqueda");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", function (e) {
      busquedaActiva = e.target.value;
      actualizarUrlYRenderizar();
    });
  }

  // Modal de pago
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

  // Vistas de métodos de pago
  const radiosPago = document.querySelectorAll(".opciones-pago");
  radiosPago.forEach((radio) => {
    radio.addEventListener("change", function () {
      document.getElementById("cajaTarjeta").style.display =
        this.value === "Tarjeta" ? "block" : "none";
      document.getElementById("cajaPaypal").style.display =
        this.value === "PayPal" ? "block" : "none";
      document.getElementById("cajaOxxo").style.display =
        this.value === "Oxxo" ? "block" : "none";
    });
  });

  // Confirmar compra
  const btnConfirmarCompra = document.getElementById("btnConfirmarCompra");
  if (btnConfirmarCompra) {
    btnConfirmarCompra.addEventListener("click", function () {
      const clienteId = localStorage.getItem("clienteId");
      if (!clienteId) {
        alert(
          "Error: No se encontró tu perfil de cliente. Por favor inicia sesión",
        );
        return;
      }

      const metodoElegido = document.querySelector(
        'input[name="metodoPago"]:checked',
      ).value;

      btnConfirmarCompra.innerText = "Procesando pago...";
      btnConfirmarCompra.disabled = true;

      const nuevaOrden = {
        cliente: { id: parseInt(clienteId) },
        total: carrito.reduce(
          (sum, item) => sum + item.precio * item.cantidad,
          0,
        ),
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
              alert(
                "¡Orden generada! Revisa tu correo para obtener tu código de barras OXXO.",
              );
            } else {
              alert(
                "¡Pago aprobado! Compra realizada con éxito, tu pedido está en camino.",
              );
            }

            carrito = [];
            guardarCarrito();
            window.location.reload();
          } else {
            alert("Hubo un problema al procesar el pago: " + data.message);
            btnConfirmarCompra.innerText = "Pagar Ahora";
            btnConfirmarCompra.disabled = false;
          }
        })
        .catch((error) => {
          console.error("Error al procesar la compra: ", error);
          btnConfirmarCompra.innerText = "Pagar Ahora";
          btnConfirmarCompra.disabled = false;
        });
    });
  }

  // Funciones de filtro y url
  window.aplicarFiltro = function (categoria) {
    filtroActivo = categoria;
    actualizarUrlYRenderizar();
  };

  function actualizarUrlYRenderizar() {
    const params = new URLSearchParams();
    if (filtroActivo) params.set("categoria", filtroActivo);
    if (busquedaActiva) params.set("q", busquedaActiva);

    const nuevaUrl =
      window.location.pathname +
      (params.toString() ? "?" + params.toString() : "");
    window.history.pushState({ path: nuevaUrl }, "", nuevaUrl);

    ejecutarFiltroLocales();
    renderizarFiltros();
  }

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

  function leerUrlYFiltrar() {
    const params = new URLSearchParams(window.location.search);
    filtroActivo = params.get("categoria") || "";
    busquedaActiva = params.get("q") || "";

    const inputB = document.getElementById("inputBusqueda");
    if (inputB) inputB.value = busquedaActiva;

    ejecutarFiltroLocales();
    renderizarFiltros();
  }

  window.addEventListener("popstate", () => {
    leerUrlYFiltrar();
  });

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

// Renderizar productos
function renderizarProductos(lista) {
  const contenedor = document.getElementById("catalogoGlobal");
  if (!contenedor) return;

  if (lista.length === 0) {
    contenedor.innerHTML =
      '<h5 class="text-center w-100 text-muted mt-5">No se encontraron productos.</h5>';
    return;
  }

  let html = "";
  lista.forEach((prod) => {
    const imagen =
      prod.urlImagen || "https://via.placeholder.com/200?text=Sin+Imagen";
    const esFavorito = favoritos.some((fav) => fav.id === prod.id);
    const corazonEmoji = esFavorito ? "❤️" : "🤍";

    html += `
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm border-0 position-relative">
                    <button onclick="toggleFavorito(${prod.id}, '${prod.titulo}', ${prod.precio}, '${imagen}')" 
                            class="btn btn-light shadow-sm position-absolute" 
                            style="top: 10px; right: 10px; border-radius: 50%; width: 40px; height: 40px; z-index: 10;">
                        ${corazonEmoji}
                    </button>
                    <img src="${imagen}" class="card-img-top" style="height: 180px; object-fit: cover;">
                    <div class="card-body">
                        <span class="badge bg-secondary mb-2">${prod.categoria}</span>
                        <h6 class="card-title text-truncate">${prod.titulo}</h6>
                        <p class="text-success fw-bold fs-5">$${prod.precio.toFixed(2)}</p>
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
}

// Operaciones del carrito
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

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarVistaCarrito();
}

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

// Historial de compras
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
          if (orden.estadoEnvio === "Preparando")
            colorEstado = "bg-warning text-dark";
          if (orden.estadoEnvio === "Enviado") colorEstado = "bg-primary";
          if (orden.estadoEnvio === "Entregado") colorEstado = "bg-success";

          let listaArticulos = "";
          if (orden.detalles && orden.detalles.length > 0) {
            orden.detalles.forEach((item) => {
              let nombreProd = item.producto
                ? item.producto.titulo
                : "Producto";
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

function toggleDetalles(idOrden) {
  const caja = document.getElementById(`detalles-${idOrden}`);
  if (caja.style.display === "none") {
    caja.style.display = "block";
  } else {
    caja.style.display = "none";
  }
}

// Favoritos
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
