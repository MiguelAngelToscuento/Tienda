document.addEventListener("DOMContentLoaded", () => {
  //extar el id del producto de url
  const params = new URLSearchParams(window.location.search);
  const idProducto = params.get("id");

  //si se ingresa al detalle.html sin un id se retorna al catálogo
  if (!idProducto) {
    window.location.href = "catalogo.html";
    return;
  }

  //info del producto
  //fetch(`http://localhost:8080/producto/${idProducto}`)
  fetch(`/producto/${idProducto}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.data) {
        const prod = data.data;

        //rellenar interfaz
        document.getElementById("detalleImagen").src =
          prod.urlImagen || "https://via.placeholder.com/400?text=Sin+Imagen";
        document.getElementById("detalleCategoria").innerText = prod.categoria;
        document.getElementById("detalleTitulo").innerText = prod.titulo;
        document.title = prod.titulo + " - Fake Shop";
        const elementoTienda = document.getElementById("detalleTienda");
        if (prod.tienda && prod.tienda.id && prod.tienda.nombreTienda) {
          const nombreTiendaUrl = encodeURIComponent(
            prod.tienda.nombreTienda.trim().toLowerCase().replace(/\s+/g, "-"),
          );
          elementoTienda.innerHTML = `<a href="perfil-tienda.html?id=${prod.tienda.id}&nombre=${nombreTiendaUrl}" class="text-primary text-decoration-none fw-bold" style="cursor: pointer;">${prod.tienda.nombreTienda}</a>`;
        } else {
          elementoTienda.innerHTML = `<span class="text-muted">Vendedor independiente</span>`;
        }
        document.getElementById("detallePrecio").innerText = formatearPrecio(
          prod.precio,
        );
        document.getElementById("detalleDescripcion").innerText =
          prod.descripcion || "Sin descripción adicional.";
        document.getElementById("detalleStock").innerText = prod.stock;

        //bton de agregar al carrito
        actualizarVistaCarrito();
        actualizarVistaFavoritos();

        //estado inicial del boton de favoritos
        const btnFavorito = document.getElementById("btnDetalleFavorito");
        let esFav = favoritos.some((fav) => fav.id === prod.id);
        btnFavorito.innerText = esFav ? "❤️" : "🤍";

        //logica del bton agregar al carrito
        document.getElementById("btnDetalleAgregarCarrito").onclick = () => {
          agregarAlCarrito(prod.id, prod.titulo, prod.precio, prod.stock);
          actualizarVistaCarrito();
        };

        //logica del boton de favoritos
        btnFavorito.onclick = () => {
          const imgFallback =
            prod.urlImagen || "https://via.placeholder.com/200?text=Sin+Imagen";
          toggleFavorito(prod.id, prod.titulo, prod.precio, imgFallback);
          esFav = !esFav;
          btnFavorito.innerText = esFav ? "❤️️" : "🤍";
        };

        // Preparar carga de reseñas y recomendaciones
        document.getElementById("resenaProductoId").value = prod.id;
        cargarResenas(prod.id);
        cargarRecomendadosIndependiente(prod.categoria, prod.id);
      } else {
        alert("Producto no encontrado");
        window.location.href = "catalogo.html";
      }
    })
    .catch((err) => console.error("Error al cargar el producto; ", err));
});

// Función independiente para recomendaciones en la página de detalle
function cargarRecomendadosIndependiente(categoria, idActual) {
  //fetch("http://localhost:8080/producto/findAll")
  fetch("/producto/findAll")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const recomendados = data.data
          .filter(
            (p) => p.categoria === categoria && p.id !== parseInt(idActual),
          )
          .slice(0, 3);

        const contenedor = document.getElementById("listaRecomendados");

        if (recomendados.length === 0) {
          contenedor.innerHTML =
            '<p class="text-muted small p-3 bg-light rounded text-center">No hay otros productos similares en esta categoría.</p>';
          return;
        }

        let html = "";
        recomendados.forEach((prod) => {
          const imagen = prod.urlImagen || "https://via.placeholder.com/150";
          //generar nombre para la url
          const nombreUrl = encodeURIComponent(
            prod.titulo.trim().toLowerCase().replace(/\s+/g, "-"),
          );
          html += `
                        <div class="card border-0 shadow-sm" style="cursor:pointer;" onclick="window.location.href='detalle.html?id=${prod.id}&nombre=${nombreUrl}'">
                            <div class="row g-0 align-items-center">
                                <div class="col-4">
                                    <img src="${imagen}" class="img-fluid rounded-start" style="height: 90px; object-fit: cover; width: 100%;">
                                </div>
                                <div class="col-8">
                                    <div class="card-body p-2 px-3">
                                        <h6 class="card-title mb-1 text-truncate" style="font-size: 13px;">${prod.titulo}</h6>
                                        <p class="text-success fw-bold m-0 fs-6">$${formatearPrecio(prod.precio)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
        });
        contenedor.innerHTML = html;
      }
    });
  function formatearPrecio(precio) {
    return Number(precio).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
