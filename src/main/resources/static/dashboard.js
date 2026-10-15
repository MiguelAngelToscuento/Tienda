// Verificar sesión de usuario y tienda
const usuarioId = localStorage.getItem("usuarioId");
const tiendaId = localStorage.getItem("tiendaId");

if (!usuarioId) {
  alert("Acceso denegado. Por favor, inicia sesión.");
  window.location.href = "index.html";
}

// Cerrar sesión
document
  .getElementById("btnCerrarSesion")
  .addEventListener("click", function () {
    localStorage.clear();
    alert("Sesión cerrada correctamente.");
    window.location.href = "index.html";
  });

// Guardar o actualizar producto
document
  .getElementById("formProducto")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const titulo = document.getElementById("prodNombre").value.trim();
    const categoria = document.getElementById("prodCategoria").value.trim();
    const descripcion = document.getElementById("prodDescripcion").value.trim();
    const precioTexto = document
      .getElementById("prodPrecio")
      .value.replace(/,/g, "");
    const precio = parseFloat(precioTexto);
    const stock = parseInt(document.getElementById("prodStock").value);

    if (titulo === "" || categoria === "" || descripcion === "") {
      alert(
        "Los campos de texto no pueden estar vaciós ni contener solo espacios.",
      );
      return;
    }
    if (isNaN(precio) || precio < 0) {
      alert("El precio debe ser un número válido mayor o igual a cero.");
      return;
    }
    if (isNaN(stock) || stock < 0) {
      alert("El stock no puede ser un número negativo.");
      return;
    }

    const idProducto = document.getElementById("prodId").value;
    const formData = new FormData();

    formData.append("titulo", document.getElementById("prodNombre").value);
    formData.append("precio", precio);
    formData.append("stock", document.getElementById("prodStock").value);
    formData.append(
      "categoria",
      document.getElementById("prodCategoria").value,
    );
    formData.append(
      "descripcion",
      document.getElementById("prodDescripcion").value,
    );
    formData.append("tiendaId", tiendaId);

    const inputImagen = document.getElementById("prodImagen");

    if (!idProducto && inputImagen.files.length === 0) {
      alert(
        "Debes subir una imagen obligatoriamente para registrar el producto.",
      );
      return;
    }

    if (inputImagen.files.length > 0) {
      const tamanoMB = inputImagen.files[0].size / (1024 * 1024);
      if (tamanoMB > 2) {
        alert(
          "La imagen es muy pesada. El tamaño máximo permitido es de 2 MB.",
        );
        inputImagen.value = ""; // Limpia el archivo seleccionado para que elija otro
        return;
      }
      formData.append("archivoImagen", inputImagen.files[0]);
    }

    const url = idProducto
      ? `/producto/update/${idProducto}`
      : "/producto/save";
    const metodo = idProducto ? "PUT" : "POST";

    fetch(url, {
      method: metodo,
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(idProducto ? "Producto actualizado." : "Producto publicado.");
          const miModal = document.getElementById("modalAgregarProducto");
          const modalBootstrap = bootstrap.Modal.getOrCreateInstance(miModal);
          modalBootstrap.hide();
          cargarProductos();
        } else {
          alert("Error al guardar: " + data.message);
        }
      })
      .catch((error) => console.error("Error al procesar el producto:", error));
  });

// Cargar datos en el modal para editar buscando por ID
window.editarProducto = function (idProducto) {
  const producto = productosGlobales.find((p) => p.id === idProducto);

  if (producto) {
    document.getElementById("tituloModalProducto").innerText =
      "Editar Artículo";
    document.getElementById("prodId").value = producto.id;
    document.getElementById("prodNombre").value = producto.titulo;
    document.getElementById("prodPrecio").value = producto.precio;
    document.getElementById("prodStock").value = producto.stock;
    document.getElementById("prodCategoria").value = producto.categoria;
    document.getElementById("prodDescripcion").value = producto.descripcion;
    document.getElementById("prodImagen").value = "";

    const miModal = document.getElementById("modalAgregarProducto");
    const modalBootstrap = bootstrap.Modal.getOrCreateInstance(miModal);
    modalBootstrap.show();
  }
};

// Limpiar modal para producto nuevo
document
  .getElementById("btnAgregarProd")
  .addEventListener("click", function () {
    document.getElementById("tituloModalProducto").innerText =
      "Registrar un Artículo";
    document.getElementById("formProducto").reset();
    document.getElementById("prodId").value = "";
  });

// Eliminar producto
function eliminarProducto(idProducto) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    fetch(`/producto/delete/${idProducto}`, {
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

// Reactivar producto inactivo
function reactivarProducto(idProducto) {
  if (confirm("¿Deseas volver a activar este producto?")) {
    fetch(`/producto/reactivate/${idProducto}`, {
      method: "PUT",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Producto reactivado.");
          cargarProductos();
        } else {
          alert("Error al reactivar: " + data.message);
        }
      })
      .catch((error) => console.error("Error al reactivar producto:", error));
  }
}

// Obtener productos desde el backend
function cargarProductos() {
  fetch(`/producto/tienda/${tiendaId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.data.length > 0) {
        procesarProductosDelServidor(data.data);
      } else {
        document.getElementById("listaProductos").innerHTML =
          '<div class="col-12 text-center text-muted"><p>Aún no tienes productos registrados.</p></div>';
      }
    })
    .catch((error) => console.error("Error al cargar productos", error));
}

// Obtener logo y nombre de la tienda
function cargarInfoTienda() {
  const idDelUsuario = localStorage.getItem("usuarioId");
  fetch(`/tienda/usuario/${idDelUsuario}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.data != null) {
        document.getElementById("textoNombreTienda").innerText =
          data.data.nombreTienda;
        if (data.data.urlLogo) {
          const imgLogo = document.getElementById("imgLogoTienda");
          imgLogo.src = data.data.urlLogo;
          imgLogo.style.display = "block";
        }
      }
    })
    .catch((error) => console.error("Error al cargar la tienda:", error));
}

// Elementos de interfaz (Pedidos vs Inventario)
const btnVerOrdenes = document.getElementById("btnVerOrdenes");
const contenedorProductosHTML = document.getElementById("listaProductos");
const contenedorPedidos = document.getElementById("listaPedidosRecibidos");
const tituloDashboard = document.getElementById("tituloDashboard");
const btnAgregarProd = document.getElementById("btnAgregarProd");
let viendoPedidos = false;

// Alternar entre inventario y pedidos
if (btnVerOrdenes) {
  btnVerOrdenes.addEventListener("click", function () {
    viendoPedidos = !viendoPedidos;
    if (viendoPedidos) {
      tituloDashboard.innerText = "Pedidos por Enviar";
      btnVerOrdenes.innerText = "Volver al Inventario";
      btnAgregarProd.style.display = "none";
      contenedorProductosHTML.style.display = "none";
      contenedorPedidos.style.display = "flex";
      cargarPedidosRecibidos();
    } else {
      tituloDashboard.innerText = "Gestión de Inventario";
      btnVerOrdenes.innerText = "Ver Pedidos Recibidos";
      btnAgregarProd.style.display = "inline-block";
      contenedorProductosHTML.style.display = "flex";
      contenedorPedidos.style.display = "none";
    }
  });
}

// Obtener pedidos recibidos
function cargarPedidosRecibidos() {
  fetch(`/orden/tienda/${tiendaId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.data.length > 0) {
        let html = "";
        data.data.reverse().forEach((orden) => {
          const nombreCliente = orden.cliente
            ? orden.cliente.nombreCompleto
            : "Cliente Desconocido";
          const direccion = orden.cliente
            ? orden.cliente.direccionEnvio
            : "Dirección no registrada";
          const telefono = orden.cliente
            ? orden.cliente.telefono
            : "Sin teléfono";
          let listaArticulos = "";

          orden.detalles.forEach((item) => {
            if (
              item.producto &&
              item.producto.tienda &&
              item.producto.tienda.id === parseInt(tiendaId)
            ) {
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
                        <ul class="list-unstyled ms-2 mb-0">${listaArticulos}</ul>
                    </div>
                    <div class="card-footer bg-light border-0">${botonAccion}</div>
                </div>
            </div>`;
        });
        contenedorPedidos.innerHTML = html;
      } else {
        contenedorPedidos.innerHTML = `<div class="col-12 text-center text-muted mt-5"><h5>Aún no tienes pedidos.</h5></div>`;
      }
    })
    .catch((error) => console.error("Error al cargar pedidos:", error));
}

// Cambiar estado del pedido
function cambiarEstadoEnvio(idOrden, nuevoEstado) {
  if (confirm(`¿Marcar este pedido como '${nuevoEstado}'?`)) {
    fetch(`/orden/update-status/${idOrden}`, {
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

// --- Lógica de Paginación y Filtrado ---
let productosGlobales = [];
let limitePorPagina = 12;

const urlParams = new URLSearchParams(window.location.search);
let categoriaActual = urlParams.get("categoria") || "Todas";
let paginaActual = parseInt(urlParams.get("pagina")) || 1;

document.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("filtroCategoria");
  if (selector) selector.value = categoriaActual;
});

function procesarProductosDelServidor(datosDelBackend) {
  productosGlobales = datosDelBackend;
  actualizarVista();
}

function actualizarVista() {
  // Filtrar productos
  let productosFiltrados = productosGlobales;
  if (categoriaActual !== "Todas") {
    productosFiltrados = productosGlobales.filter(
      (p) => p.categoria === categoriaActual,
    );
  }

  // Paginar resultados
  const totalPaginas =
    Math.ceil(productosFiltrados.length / limitePorPagina) || 1;
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;
  if (paginaActual < 1) paginaActual = 1;

  const inicio = (paginaActual - 1) * limitePorPagina;
  const fin = inicio + limitePorPagina;
  const productosPagina = productosFiltrados.slice(inicio, fin);

  // Actualizar botones de UI
  document.getElementById("indicadorPagina").innerText =
    `Página ${paginaActual} de ${totalPaginas}`;
  document.getElementById("btnAnterior").disabled = paginaActual === 1;
  document.getElementById("btnSiguiente").disabled =
    paginaActual === totalPaginas;

  // Actualizar URL
  const nuevaUrl = new URL(window.location);
  nuevaUrl.searchParams.set("categoria", categoriaActual);
  nuevaUrl.searchParams.set("pagina", paginaActual);
  window.history.pushState({}, "", nuevaUrl);

  const contenedor = document.getElementById("listaProductos");

  if (productosPagina.length === 0) {
    contenedor.innerHTML = `<div class="col-12 text-center mt-5"><h5 class="text-muted">No se encontraron productos.</h5></div>`;
    return;
  }

  let html = "";
  let categoriasUnicas = new Set();

  productosPagina.forEach((prod) => {
    if (prod.categoria) categoriasUnicas.add(prod.categoria);

    const imagen =
      prod.urlImagen ||
      "https://placehold.co/600x400/eeeeee/333333?text=Sin+Imagen";
    const isActivo = prod.activo !== false;
    const cardEstilo = isActivo
      ? ""
      : "opacity: 0.6; filter: grayscale(80%); background-color: #f8f9fa;";
    const badgeEtiqueta = isActivo
      ? ""
      : `<span class="badge bg-danger position-absolute" style="top: 10px; right: 10px; z-index: 2;">Inactivo</span>`;
    const botonAccion = isActivo
      ? `<button onclick="eliminarProducto(${prod.id})" class="btn btn-sm btn-outline-danger">Eliminar</button>`
      : `<button onclick="reactivarProducto(${prod.id})" class="btn btn-sm btn-outline-success">Reactivar</button>`;

    // Escapar el título para el atributo 'title' por si contiene comillas
    const tituloSeguro = prod.titulo.replace(/"/g, "&quot;");

    html += `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm position-relative" style="${cardEstilo}">
                    ${badgeEtiqueta}
                    <img src="${imagen}" class="card-img-top p-2" alt="${tituloSeguro}" style="height: 200px; object-fit: contain; background-color: #ffffff; width: 100%;">
                    <div class="card-body">
                        <h3 class="card-title fs-6 fw-bold" title="${tituloSeguro}" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em;">${prod.titulo}</h3>
                        <p class="card-text text-muted mb-1">Precio: $${formatearPrecio(prod.precio)}</p>
                        <p class="card-text text-muted">Stock: ${prod.stock} unidades</p>
                    </div>
                    <div class="card-footer border-top-0 d-flex justify-content-between" style="background-color: transparent;">
                        <!-- Se pasa únicamente el ID para evitar errores de sintaxis con texto especial -->
                        <button onclick="editarProducto(${prod.id})" class="btn btn-sm btn-outline-primary">Editar</button>
                        ${botonAccion}
                    </div>
                </div>
            </div>`;
  });

  contenedor.innerHTML = html;

  // Poblar dropdown de categorías del modal
  const datalistCategorias = document.getElementById("listaCategorias");
  if (datalistCategorias) {
    datalistCategorias.innerHTML = Array.from(categoriasUnicas)
      .map((c) => `<option value="${c}">`)
      .join("");
  }
}

// Cambiar categoría seleccionada
function cambiarCategoria(nuevaCategoria) {
  categoriaActual = nuevaCategoria;
  paginaActual = 1;
  actualizarVista();
}

// Cambiar de página
function cambiarPagina(delta) {
  paginaActual += delta;
  actualizarVista();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Dar formato monetario al precio
function formatearPrecio(precio) {
  return Number(precio).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

//formater el precio a moneda
document.getElementById("prodPrecio").addEventListener("blur", function (e) {
  let valorLimpio = e.target.value.replace(/,/g, "");
  let valor = parseFloat(valorLimpio);

  if (!isNaN(valor) && valor >= 0) {
    e.target.value = valor.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
});

// Inicialización de la vista
cargarInfoTienda();
cargarProductos();
