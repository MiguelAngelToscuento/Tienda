package toscuento.sistema.store.controller;

import org.hibernate.annotations.Audited;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import toscuento.sistema.store.Repository.OrdenRepository;
import toscuento.sistema.store.Repository.ProductoRepository;
import toscuento.sistema.store.model.DetalleOrden;
import toscuento.sistema.store.model.Orden;
import toscuento.sistema.store.model.Producto;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/orden")
@CrossOrigin(origins = "*", methods = {RequestMethod.POST, RequestMethod.GET})
public class OrdenController {
    private static final Logger logger = LoggerFactory.getLogger(OrdenController.class);

    @Autowired
    private OrdenRepository ordenRepository;
    @Autowired
    private ProductoRepository productoRepository;

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> save(@RequestBody Orden orden) {
        logger.info("Recibiendo nueva orden de compra...");
        try {
            // antes de guardar la orden, se restan los productos del stock
            if (orden.getDetalles() != null) {
                for (DetalleOrden detalle : orden.getDetalles()) {
                    // se busca el producto original en la base de datos
                    Producto productoBD = productoRepository.findById(detalle.getProducto().getId())
                            .orElseThrow(() -> new Exception("Producto no encontrado"));
                    // se resta la cantidad que el cliente compró
                    int nuevoStock = productoBD.getStock() - detalle.getCantidad();
                    // Si por algún error intentan comprar más de lo que hay, se detiene la compra
                    if (nuevoStock < 0) {
                        throw new Exception("Stock insuficiente para: " + productoBD.getTitulo());
                    }
                    // actualizar el producto y lo guardamos
                    productoBD.setStock(nuevoStock);
                    productoRepository.save(productoBD);
                }
            }
            Orden ordenGuardada = ordenRepository.save(orden);
            return createResponse(Boolean.TRUE, "¡Orden guardada con éxito!", ordenGuardada, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al procesar la orden", e);
            return createError(e);
        }
    }


    private ResponseEntity<Map<String, Object>> createResponse(Boolean success, String message, Object data, HttpStatus status){
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("data", data);
        return new ResponseEntity<>(response, status);
    }

    private ResponseEntity<Map<String, Object>> createError(Exception e){
        return createResponse(Boolean.FALSE, "Error al procesar el pago", e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
