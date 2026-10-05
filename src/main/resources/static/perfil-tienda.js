document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const idTienda = params.get("id");
  let nombreTiendaUrl = params.get("nombre");

  //ver que la url tenga la tienda valida
  if (!idTienda) {
    alert("No se especificó ninguna tienda.");
    window.location.href = "catalogo.html";
    return;
  }

  //formato de url para mostrar el nombre
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

  // 1. PETICIÓN SEPARADA PARA CARGAR EL LOGO DE LA TIENDA
  fetch(`http://localhost:8080/tienda/${idTienda}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.data && data.data.urlLogo) {
        document.getElementById("imgLogoPerfilTienda").src = data.data.urlLogo;
      }
    })
    .catch((err) =>
      console.error("Error al cargar el logo de la tienda:", err),
    );

  // 2. PETICIÓN PARA CARGAR LOS PRODUCTOS DE LA TIENDA
  fetch(`http://localhost:8080/producto/tienda/${idTienda}`)
    .then((res) => res.json())
    .then((data) => {
      const contenedor = document.getElementById("listaProductosTienda");

      if (data.success && data.data && data.data.length > 0) {
        let html = "";

        data.data.forEach((prod) => {
          if (prod.activo === false) return;

          const imagen =
            prod.urlImagen ||
            "https://placehold.co/400x400/eeeeee/333333?text=Sin+Imagen";

          const nombreUrl = encodeURIComponent(
            prod.titulo.trim().toLowerCase().replace(/\s+/g, "-"),
          );
          const descProd = prod.descripcion
            ? prod.descripcion
            : "sin-descripcion";
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
                                    
                                    <p class="text-success fw-bold fs-5 mb-1">$${formatearPrecio(prod.precio)}</p>
                                    <p class="text-muted small mb-0">${prod.stock} disponibles</p>
                                </div>
                                <div class="card-footer bg-white border-0 d-grid">
                                    <button class="btn btn-outline-primary btn-sm">Ver producto completo</button>
                                </div>
                            </div>
                        </div>
                    `;
        });

        contenedor.innerHTML =
          html ||
          '<div class="col-12 text-center text-muted mt-5">Esta tienda no tiene productos activos.</div>';
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
