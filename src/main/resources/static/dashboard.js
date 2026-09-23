// Verificar sesión de usuario y tienda
const usuarioId = localStorage.getItem("usuarioId");
const tiendaId = localStorage.getItem("tiendaId");

if (!usuarioId) {
  alert("Acceso denegado. Por favor, inicia sesión.");
  window.location.href = "index.html";
}

// Cerrar sesión del vendedor
document.getElementById("btnCerrarSesion").addEventListener("click", function () {
  localStorage.clear();
  alert("Sesion cerrada correctamente.");
  window.location.href = "index.html";
});

// Guardar o actualizar producto
document.getElementById("formProducto").addEventListener("submit", function (e) {
  e.preventDefault();

  const idProducto = document.getElementById("prodId").value;
  const formData = new FormData();

  formData.append("titulo", document.getElementById("prodNombre").value);
  formData.append("precio", document.getElementById("prodPrecio").value);
  formData.append("stock", document.getElementById("prodStock").value);
  formData.append("categoria", document.getElementById("prodCategoria").value);
  formData.append("descripcion", document.getElementById("prodDescripcion").value);
  formData.append("tiendaId", tiendaId);

  const inputImagen = document.getElementById("prodImagen");
  if (inputImagen.files.length > 0) {
    formData.append("archivoImagen", inputImagen.files[0]);
  }

  const url = idProducto
    ? `http://localhost:8080/producto/update/${idProducto}`
    : "http://localhost:8080/producto/save";
  const metodo = idProducto ? "PUT" : "POST";

  fetch(url, {
    method: metodo,
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(idProducto ? "Producto actualizado exitosamente." : "Producto publicado exitosamente.");
        const miModal = document.getElementById("modalAgregarProducto");
        const modalBootstrap = bootstrap.Modal.getOrCreateInstance(miModal);
        modalBootstrap.hide();
        cargarProductos();
      } else {
        alert("Error al guardar: " + data.message);
      }
    })
    .catch((error) => console.error("Error al procesar el producto: ", error));
});

// Cargar datos del producto en el formulario para editar
function editarProducto(id, titulo, precio, stock, categoria, descripcion, urlImagen) {
  document.getElementById("tituloModalProducto").innerText = "Editar Artículo";

  document.getElementById("prodId").value = id;
  document.getElementById("prodNombre").value = titulo;
  document.getElementById("prodPrecio").value = precio;
  document.getElementById("prodStock").value = stock;
  document.getElementById("prodCategoria").value = categoria;
  document.getElementById("prodDescripcion").value = descripcion;
  document.getElementById("prodImagen").value = "";

  const miModal = document.getElementById("modalAgregarProducto");
  const modalBootstrap = bootstrap.Modal.getOrCreateInstance(miModal);
  modalBootstrap.show();
}

// Limpiar formulario al registrar un nuevo artículo
document.getElementById("btnAgregarProd").addEventListener("click", function () {
  document.getElementById("tituloModalProducto").innerText = "Registrar un Artículo";
  document.getElementById("formProducto").reset();
  document.getElementById("prodId").value = "";
});

// Eliminar producto
function eliminarProducto(idProducto) {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    fetch(`http://localhost:8080/producto/delete/${idProducto}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Producto eliminado.");
          cargarProductos();
        } else {
          alert("Error al eliminar: " + data.message);
        }
      })
      .catch((error) => console.error("Error al eliminar producto:", error));
  }
}

// Cargar y mostrar lista de productos de la tienda
function cargarProductos() {
  fetch(`http://localhost:8080/producto/tienda/${tiendaId}`)
    .then((response) => response.json())
    .then((data) => {
      const contenedorLista = document.getElementById("listaProductos");
      const datalistCategorias = document.getElementById("listaCategorias");

      if (data.success && data.data.length > 0) {
        let html = "";
        let categoriasUnicas = new Set();

        data.data.forEach((prod) => {
          if (prod.categoria) categoriasUnicas.add(prod.categoria);

          const imagen = prod.urlImagen || "https://via.placeholder.com/150?text=Sin+Imagen";
          const isActivo = prod.activo !== false;

          const cardEstilo = isActivo ? "" : "opacity: 0.6; filter: grayscale(80%); background-color: #f8f9fa;";
          const badgeEtiqueta = isActivo ? "" : `<span class="badge bg-danger position-absolute" style="top: 10px; right: 10px; z-index: 2;">Inactivo</span>`;
          const botonAccion = isActivo
            ? `<button onclick="eliminarProducto(${prod.id})" class="btn btn-sm btn-outline-danger">Eliminar</button>`
            : `<button onclick="reactivarProducto(${prod.id})" class="btn btn-sm btn-outline-success">Reactivar</button>`;

          html += `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm position-relative" style="${cardEstilo}">
                    ${badgeEtiqueta}
                    <img src="${imagen}" class="card-img-top" alt="${prod.titulo}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title text-truncate">${prod.titulo}</h5>
                        <p class="card-text text-muted mb-1">Precio: $${prod.precio.toFixed(2)}</p>
                        <p class="card-text text-muted">Stock: ${prod.stock} unidades</p>
                    </div>
                    <div class="card-footer border-top-0 d-flex justify-content-between" style="background-color: transparent;">
                        <button onclick="editarProducto(${prod.id}, '${prod.titulo}', ${prod.precio}, ${prod.stock}, '${prod.categoria}', '${prod.descripcion}', '${prod.urlImagen}')" class="btn btn-sm btn-outline-primary">Editar</button>
                        ${botonAccion}
                    </div>
                </div>
            </div>`;
        });

        contenedorLista.innerHTML = html;

        if (datalistCategorias) {
          datalistCategorias.innerHTML = Array.from(categoriasUnicas)
            .map((c) => `<option value="${c}">`)
            .join("");
        }
      } else {
        contenedorLista.innerHTML = '<div class="col-12 text-center text-muted"><p>Aún no tienes productos registrados.</p></div>';
      }
    })
    .catch((error) => console.error("Error al cargar productos", error));
}

// Reactivar un producto inactivo
function reactivarProducto(idProducto) {
  if (confirm("¿Deseas volver a activar este producto para que aparezca en el catálogo público?")) {
    fetch(`http://localhost:8080/producto/reactivate/${idProducto}`, {
      method: "PUT",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Producto reactivado exitosamente.");
          cargarProductos();
        } else {
          alert("Error al reactivar: " + data.message);
        }
      })
      .catch((error) => console.error("Error al reactivar producto:", error));
  }
}

// Cargar información de la tienda en el encabezado
function cargarInfoTienda() {
  const idDelUsuario = localStorage.getItem("usuarioId");

  fetch(`http://localhost:8080/tienda/usuario/${idDelUsuario}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.data != null) {
        document.getElementById("textoNombreTienda").innerText = data.data.nombreTienda;
        if (data.data.urlLogo) {
          const imgLogo = document.getElementById("imgLogoTienda");
          imgLogo.src = data.data.urlLogo;
          imgLogo.style.display = "block";
        }
      }
    })
    .catch((error) => console.error("Error al cargar la tienda: ", error));
}

// Variables de interfaz para el panel de gestión
const btnVerOrdenes = document.getElementById("btnVerOrdenes");
const contenedorProductos = document.getElementById("listaProductos");
const contenedorPedidos = document.getElementById("listaPedidosRecibidos");
const tituloDashboard = document.getElementById("tituloDashboard");
const btnAgregarProd = document.getElementById("btnAgregarProd");
let viendoPedidos = false;

// Alternar vista entre inventario y pedidos recibidos
if (btnVerOrdenes) {
  btnVerOrdenes.addEventListener("click", function () {
    viendoPedidos = !viendoPedidos;
    if (viendoPedidos) {
      tituloDashboard.innerText = "Pedidos por Enviar";
      btnVerOrdenes.innerText = "Volver al Inventario";
      btnAgregarProd.style.display = "none";
      contenedorProductos.style.display = "none";
      contenedorPedidos.style.display = "flex";
      cargarPedidosRecibidos();
    } else {
      tituloDashboard.innerText = "Gestión de Inventario";
      btnVerOrdenes.innerText = "Ver Pedidos Recibidos";
      btnAgregarProd.style.display = "inline-block";
      contenedorProductos.style.display = "flex";
      contenedorPedidos.style.display = "none";
    }
  });
}

// Cargar y mostrar lista de pedidos recibidos
function cargarPedidosRecibidos() {
  fetch(`http://localhost:8080/orden/tienda/${tiendaId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.data.length > 0) {
        let html = "";
        data.data.reverse().forEach((orden) => {

          const nombreCliente = orden.cliente ? orden.cliente.nombreCompleto : "Cliente Desconocido";
          const direccion = orden.cliente ? orden.cliente.direccionEnvio : "Dirección no registrada";
          const telefono = orden.cliente ? orden.cliente.telefono : "Sin teléfono";
          let listaArticulos = "";

          orden.detalles.forEach((item) => {
            if (item.producto && item.producto.tienda && item.producto.tienda.id === parseInt(tiendaId)) {
              listaArticulos += `<li class="small mb-1">• ${item.cantidad}x ${item.producto.titulo} <span class="text-success">($${item.precioUnitario})</span></li>`;
            }
          });

          let botonAccion = "";
          if (orden.estadoEnvio === "Preparando" || !orden.estadoEnvio) {
            botonAccion = `<button onclick="cambiarEstadoEnvio(${orden.id}, 'Enviado')" class="btn btn-warning w-100 fw-bold">Marcar como Enviado</button>`;
          } else if (orden.estadoEnvio === "Enviado") {
            botonAccion = `<button onclick="cambiarEstadoEnvio(${orden.id}, 'Entregado')" class="btn btn-success w-100 fw-bold">Marcar como Entregado</button>`;
          } else {
            botonAccion = `<button class="btn btn-secondary w-100 fw-bold" disabled>Pedido Finalizado</button>`;
          }

          html += `
            <div class="col-md-6 mb-4">
                <div class="card shadow-sm border-0 border-top border-4 border-warning h-100">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-muted">ORDEN #${orden.id}</span>
                        <span class="badge bg-dark">${orden.estadoEnvio || "Preparando"}</span>
                    </div>
                    <div class="card-body">
                        <h6 class="text-primary mb-3">Datos de Envío:</h6>
                        <p class="mb-1 small"><strong>Comprador:</strong> ${nombreCliente}</p>
                        <p class="mb-1 small"><strong>Dirección:</strong> ${direccion}</p>
                        <p class="mb-3 small"><strong>Teléfono:</strong> ${telefono}</p>

                        <h6 class="text-primary mb-2">Artículos a enviar:</h6>
                        <ul class="list-unstyled ms-2 mb-0">
                            ${listaArticulos}
                        </ul>
                    </div>
                    <div class="card-footer bg-light border-0">
                        ${botonAccion}
                    </div>
                </div>
            </div>
          `;
        });
        contenedorPedidos.innerHTML = html;
      } else {
        contenedorPedidos.innerHTML = `<div class="col-12 text-center text-muted mt-5"><h5>Aún no tienes pedidos registrados.</h5><p>¡Sigue publicando tus productos!</p></div>`;
      }
    })
    .catch((error) => console.error("Error al cargar pedidos: ", error));
}

// Actualizar el estado de envío de un pedido
function cambiarEstadoEnvio(idOrden, nuevoEstado) {
  if (confirm(`¿Estás seguro de marcar este pedido como '${nuevoEstado}'? El cliente verá esta actualización.`)) {
    fetch(`http://localhost:8080/orden/update-status/${idOrden}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estadoEnvio: nuevoEstado }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          cargarPedidosRecibidos();
        } else {
          alert("Error al actualizar el estado: " + data.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  }
}

// Inicializar datos al cargar la página
cargarProductos();
cargarInfoTienda();