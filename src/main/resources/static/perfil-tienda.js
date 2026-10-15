// Variables globales para mantener los productos y el filtro actual en memoria
let productosDeLaTienda = [];
let categoriaTiendaActual = "";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const idTienda = params.get("id");
  let nombreTiendaUrl = params.get("nombre");

  if (!idTienda) {
    alert("No se especificó ninguna tienda.");
    window.location.href = "catalogo.html";
    return;
  }

  if (nombreTiendaUrl) {
    const nombreLimpio = nombreTiendaUrl
      .split("-")
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");

    document.getElementById("tituloTienda").innerText = nombreLimpio;
    document.title = nombreLimpio + " - Fake Shop";
  } else {
    document.getElementById("tituloTienda").innerText =
      "Vendedor Independiente";
  }

  fetch(`/producto/tienda/${idTienda}`)
    .then((res) => res.json())
    .then((data) => {
      const contenedor = document.getElementById("listaProductosTienda");

      if (data.success && data.data && data.data.length > 0) {
        // Extraer el logo
        const tiendaInfo = data.data[0].tienda;
        if (tiendaInfo && tiendaInfo.urlLogo) {
          document.getElementById("imgLogoPerfilTienda").src =
            tiendaInfo.urlLogo;
        }

        // Guardar solo los productos activos en la memoria global
        productosDeLaTienda = data.data.filter((prod) => prod.activo !== false);

        if (productosDeLaTienda.length > 0) {
          renderizarFiltrosTienda();
          renderizarProductosTienda(productosDeLaTienda);
        } else {
          contenedor.innerHTML =
            '<div class="col-12 text-center text-muted mt-5">Esta tienda no tiene productos activos.</div>';
        }
      } else {
        contenedor.innerHTML =
          '<div class="col-12 text-center text-muted mt-5">Esta tienda aún no ha publicado productos.</div>';
      }
    })
    .catch((err) => {
      console.error("Error al cargar los productos de la tienda:", err);
      document.getElementById("listaProductosTienda").innerHTML =
        '<div class="col-12 text-center text-danger mt-5">Ocurrió un error al cargar la tienda. Inténtalo más tarde.</div>';
    });
});

// Extrae las categorías únicas y dibuja los botones
function renderizarFiltrosTienda() {
  const contenedorFiltros = document.getElementById("contenedorFiltrosTienda");
  if (!contenedorFiltros) return;

  const categorias = [...new Set(productosDeLaTienda.map((p) => p.categoria))];

  let html = `<button class="btn btn-${categoriaTiendaActual === "" ? "primary" : "outline-primary"} text-nowrap" onclick="filtrarTienda('')">Todas</button>`;

  categorias.forEach((cat) => {
    if (!cat) return;
    const btnClass =
      categoriaTiendaActual === cat ? "primary" : "outline-primary";
    html += `<button class="btn btn-${btnClass} text-nowrap" onclick="filtrarTienda('${cat}')">${cat}</button>`;
  });

  contenedorFiltros.innerHTML = html;
}

// Ejecuta el filtro cuando se hace clic en un botón
window.filtrarTienda = function (categoria) {
  categoriaTiendaActual = categoria;
  renderizarFiltrosTienda(); // Para actualizar los colores de los botones seleccionados

  if (categoria === "") {
    renderizarProductosTienda(productosDeLaTienda);
  } else {
    const filtrados = productosDeLaTienda.filter(
      (p) => p.categoria === categoria,
    );
    renderizarProductosTienda(filtrados);
  }
};

// Dibuja las tarjetas basándose en la lista que recibe
function renderizarProductosTienda(lista) {
  const contenedor = document.getElementById("listaProductosTienda");

  if (lista.length === 0) {
    contenedor.innerHTML =
      '<div class="col-12 text-center text-muted mt-5">No hay productos en esta categoría.</div>';
    return;
  }

  let html = "";
  lista.forEach((prod) => {
    const imagen =
      prod.urlImagen ||
      "https://placehold.co/400x400/eeeeee/333333?text=Sin+Imagen";
    const nombreUrl = encodeURIComponent(
      prod.titulo.trim().toLowerCase().replace(/\s+/g, "-"),
    );
    const descProd = prod.descripcion ? prod.descripcion : "sin-descripcion";
    const descUrl = encodeURIComponent(
      descProd.trim().toLowerCase().replace(/\s+/g, "-").substring(0, 50),
    );

    html += `
      <div class="col-md-3 col-sm-6 mb-4">
          <div class="card h-100 shadow-sm border-0 position-relative" style="cursor: pointer;" onclick="window.location.href='detalle.html?id=${prod.id}&nombre=${nombreUrl}&descripcion=${descUrl}'">
              <img src="${imagen}" class="card-img-top p-2" alt="${prod.titulo}" style="height: 200px; object-fit: contain; background-color: #ffffff; width: 100%;">
              <div class="card-body pb-2">
                  <span class="badge bg-secondary mb-2">${prod.categoria}</span>
                  <h6 class="card-title mb-1 fw-bold text-dark" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em;">${prod.titulo}</h6>
                  <p class="text-success fw-bold fs-5 mb-1">$${formatearPrecioTienda(prod.precio)}</p>
                  <p class="text-muted small mb-0">${prod.stock} disponibles</p>
              </div>
              <div class="card-footer bg-white border-0 d-grid">
                  <button class="btn btn-outline-primary btn-sm">Ver producto completo</button>
              </div>
          </div>
      </div>
    `;
  });

  contenedor.innerHTML = html;
}

// Función auxiliar para el formato de moneda exclusivo de esta vista
function formatearPrecioTienda(precio) {
  return Number(precio).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
