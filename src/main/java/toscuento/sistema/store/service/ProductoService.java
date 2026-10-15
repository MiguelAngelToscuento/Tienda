package toscuento.sistema.store.service;

import org.aspectj.weaver.patterns.ExactAnnotationFieldTypePattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.endpoint.ProducibleOperationArgumentResolver;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import toscuento.sistema.store.Repository.ProductoRepository;
import toscuento.sistema.store.model.Producto;
import toscuento.sistema.store.model.Tienda;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductoService {
    public static final Logger logger = LoggerFactory.getLogger(ProductoService.class);

    @Autowired
    private ProductoRepository productoRepository;

    // método para ocultar productos de tiendas suspendidas
    public List<Producto> obtenerCatalogoActivo() {
        logger.info("Obteniendo catálogo filtrando tiendas suspendidas");
        return productoRepository.obtenerCatalogoActivo();
    }

    // lógica para guardar productos
    public Producto guardarProducto(String titulo, Double precio, Integer stock, String categoria, String descripcion,
            Integer tiendaId, MultipartFile archivoImagen) throws Exception {
        Producto producto = new Producto(); // objeto producto
        producto.setTitulo(titulo);
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setCategoria(categoria);
        producto.setDescripcion(descripcion);

        Tienda tienda = new Tienda(); // objeto tienda
        tienda.setId(tiendaId);
        producto.setTienda(tienda); // para que el producto esté ligado a la tienda, se le pone un id a la tienda y
                                    // se le pasa al objeto producto
        if (archivoImagen != null && !archivoImagen.isEmpty()) {
            producto.setUrlImagen(guardarImagenFisica(archivoImagen));
        }
        return productoRepository.save(producto); // una vez que el objeto producto tiene todos sus campo, se manda a la
                                                  // base de datos
    }

    // logica de actualizacion
    public Producto actualizarProductoCompleto(Integer id, String titulo, Double precio, Integer stock,
            String categoria, String descripcion, MultipartFile archivoImagen) throws Exception {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new Exception("Producto no encontrado"));

        producto.setTitulo(titulo);
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setCategoria(categoria);
        producto.setDescripcion(descripcion);

        if (archivoImagen != null && !archivoImagen.isEmpty()) {
            producto.setUrlImagen(guardarImagenFisica(archivoImagen));
        }
        return productoRepository.save(producto);
    }

    // lóica de baja lógica
    public void aplicarBajaLogica(Integer id) throws Exception {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new Exception("Producto no encontrado"));
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    // logica de reactivacion
    public void reactivarProducto(Integer id) throws Exception {
        Producto producto = productoRepository.findById(id).orElseThrow(() -> new Exception("Producto no encontrado"));
        producto.setActivo(true);
        productoRepository.save(producto);
    }

    private String guardarImagenFisica(MultipartFile archivoImagen) throws Exception {
        String rutaCarpeta = "uploads/productos/";
        Path rutaDirectorio = Paths.get(rutaCarpeta);

        if (!Files.exists(rutaDirectorio)) {
            Files.createDirectories(rutaDirectorio);
        }
        String nombreOriginal = archivoImagen.getOriginalFilename();
        String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        String nombreUnico = UUID.randomUUID().toString() + extension;

        Path rutaFisica = Paths.get(rutaCarpeta + nombreUnico);
        Files.copy(archivoImagen.getInputStream(), rutaFisica);

        return "/" + rutaCarpeta + nombreUnico;
    }

    public Optional<Producto> obtenerPorId(Integer id) {
        return productoRepository.findById(id);
    }

    public List<Producto> obtenerPorTienda(Integer idTienda) {
        return productoRepository.findByTiendaId(idTienda);
    }

    // actualizacion parcial de campos
    public Producto actualizarProducto(Integer id, Map<String, Object> fields) throws Exception {
        logger.info("Procesando actualización parcial para el producto con id: " + id);
        Producto producto = productoRepository.findById(id).orElseThrow();

        if (fields.containsKey("titulo"))
            producto.setTitulo((String) fields.get("titulo"));
        if (fields.containsKey("descripcion"))
            producto.setDescripcion((String) fields.get("descripcion"));
        if (fields.containsKey("categoria"))
            producto.setCategoria((String) fields.get("categoria"));
        if (fields.containsKey("precio"))
            producto.setPrecio((Double.valueOf(fields.get("precio").toString())));
        if (fields.containsKey("stock"))
            producto.setStock((Integer) fields.get("stock"));

        return productoRepository.save(producto);
    }

    // busqueda de productos
    public List<Producto> buscarProductos(String q) {
        logger.info("Buscando producto por: " + q);
        List<Producto> productos = productoRepository.obtenerCatalogoActivo();

        if (!q.contains("=")) {
            String busqueda = q.toLowerCase();
            return productos.stream().filter(producto -> producto.getTitulo().toLowerCase().contains(busqueda) ||
                    producto.getCategoria().toLowerCase().contains(busqueda) ||
                    producto.getDescripcion().toLowerCase().contains(busqueda)).toList();
        }

        String[] properties = q.split(",");
        for (String property : properties) {
            String[] propertyEntry = property.split("=");
            if (propertyEntry[0].equals("titulo")) {
                productos = productos.stream()
                        .filter(p -> p.getTitulo().toLowerCase().contains(propertyEntry[1].toLowerCase())).toList();
            }
            if (propertyEntry[0].equals("categoria")) {
                productos = productos.stream()
                        .filter(p -> p.getCategoria().toLowerCase().contains(propertyEntry[1].toLowerCase())).toList();
            }
            if (propertyEntry[0].equals("stock")) {
                productos = productos.stream()
                        .filter(p -> p.getStock().toString().contains(propertyEntry[1].toLowerCase())).toList();
            }
        }
        return productos;

    }
}