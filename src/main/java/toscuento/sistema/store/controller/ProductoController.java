package toscuento.sistema.store.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import toscuento.sistema.store.Repository.ProductoRepository;
import toscuento.sistema.store.model.Producto;
import toscuento.sistema.store.model.Tienda;
import toscuento.sistema.store.service.ProductoService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.dao.DataIntegrityViolationException;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/producto")
@CrossOrigin(origins = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE,
        RequestMethod.PUT })
public class ProductoController {
    // logica del catálogo

    private static final Logger logger = LoggerFactory.getLogger(ProductoController.class);

    @Autowired
    private ProductoService productoService;

    // para el catalogo
    @GetMapping("/findAll")
    public ResponseEntity<Map<String, Object>> findAll() {
        logger.info("Buscando todos los productos del catálogo principal");
        try {
            // metodo para ocultar los productos de las tiendas que están suspendidas
            List<Producto> productos = productoService.obtenerCatalogoActivo();
            return createResponse(Boolean.TRUE, "Lista de productos", productos, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al buscar todos los productos", e);
            return createError(e);
        }
    }

    @GetMapping("findAll/{q}")
    public ResponseEntity<Map<String, Object>> findAll(@PathVariable("q") String q) {
        logger.info("Buscando productos con filtro: " + q);
        try {
            List<Producto> productos = productoService.buscarProductos(q);
            return createResponse(Boolean.TRUE, "Búsqueda exitosa", productos, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al buscar productos con filtro", e);
            return createError(e);
        }
    }

    @GetMapping("findById/{id}")
    public ResponseEntity<Map<String, Object>> findById(@PathVariable("id") Integer id) {
        logger.info("Buscando producto con id: " + id);
        try {
            Optional<Producto> producto = productoService.obtenerPorId(id);
            if (producto.isPresent()) {
                return createResponse(Boolean.TRUE, "Producto encontrado", producto, HttpStatus.OK);
            } else {
                return createResponse(Boolean.FALSE, "Producto no encontrado", null, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return createError(e);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> save(
            @RequestParam("titulo") String titulo,
            @RequestParam("precio") Double precio,
            @RequestParam("stock") Integer stock,
            @RequestParam("categoria") String categoria,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("tiendaId") Integer tiendaId,
            @RequestParam(value = "archivoImagen", required = false) MultipartFile archivoImagen) {
        logger.info("Petición recibida: Guardando nuevo producto");
        try {
            Producto productoGuardado = productoService.guardarProducto(titulo, precio, stock, categoria, descripcion,
                    tiendaId, archivoImagen);
            return createResponse(Boolean.TRUE, "Producto publicado con éxito", productoGuardado, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al guardar producto", e);
            return createError(e);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable("id") Integer id,
            @RequestParam("titulo") String titulo,
            @RequestParam("precio") Double precio,
            @RequestParam("stock") Integer stock,
            @RequestParam("categoria") String categoria,
            @RequestParam("descripcion") String descripcion,
            @RequestParam(value = "archivoImagen", required = false) MultipartFile archivoImagen) {
        logger.info("Petición recibida: Actualizando producto id " + id);
        try {
            Producto productoActualizado = productoService.actualizarProductoCompleto(id, titulo, precio, stock,
                    categoria, descripcion, archivoImagen);
            return createResponse(Boolean.TRUE, "Producto actualizado correctamente", productoActualizado,
                    HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al actualizar el producto", e);
            return createError(e);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Integer id) {
        logger.info("Petición recibida: Baja lógica de producto id " + id);
        try {
            productoService.aplicarBajaLogica(id);
            return createResponse(Boolean.TRUE, "Producto eliminado correctamente", null, HttpStatus.OK);
        } catch (Exception e) {
            return createError(e);
        }
    }

    @PutMapping("/reactivate/{id}")
    public ResponseEntity<Map<String, Object>> reactivate(@PathVariable("id") Integer id) {
        logger.info("Petición recibida: Reactivar producto id " + id);
        try {
            productoService.reactivarProducto(id);
            return createResponse(Boolean.TRUE, "Producto reactivado correctamente", null, HttpStatus.OK);
        } catch (Exception e) {
            return createError(e);
        }
    }

    @GetMapping("/tienda/{idTienda}")
    public ResponseEntity<Map<String, Object>> findByTienda(@PathVariable("idTienda") Integer idTienda) {
        logger.info("Buscando productos de la tienda id: " + idTienda);
        try {
            List<Producto> productos = productoService.obtenerPorTienda(idTienda);
            return createResponse(Boolean.TRUE, "Productos de la tienda", productos, HttpStatus.OK);
        } catch (Exception e) {
            return createError(e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
        Optional<Producto> producto = productoService.obtenerPorId(id);
        Map<String, Object> response = new HashMap<>();

        if (producto.isPresent()) {
            response.put("success", true);
            response.put("data", producto.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Producto no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Funciones auxiliares
    private ResponseEntity<Map<String, Object>> createResponse(Boolean success, String message, Object data,
            HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("data", data);
        return new ResponseEntity<>(response, status);
    }

    private ResponseEntity<Map<String, Object>> createError(Exception e) {
        return createResponse(Boolean.FALSE, "Ups, algo salió mal", e.fillInStackTrace(),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

}