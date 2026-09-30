package toscuento.sistema.store.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import toscuento.sistema.store.Repository.OrdenRepository;
import toscuento.sistema.store.Repository.ResenaRepository;
import toscuento.sistema.store.model.Resena;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resena")
@CrossOrigin(origins = "*", methods = { RequestMethod.GET, RequestMethod.POST })
public class ResenaController {

    private static final Logger logger = LoggerFactory.getLogger(ResenaController.class);

    @Autowired
    private ResenaRepository resenaRepository;

    @Autowired
    private OrdenRepository ordenRepository;

    // mandar a llamar al service para que se puedan publicar las reseñas

    @GetMapping("/producto/{id}")
    public ResponseEntity<Map<String, Object>> getResenasByProducto(@PathVariable Integer id) {
        try {
            List<Resena> resenas = resenaRepository.findByProductoId(id);
            return createResponse(Boolean.TRUE, "Reseñas obtenidas con éxito", resenas, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al obtener reseñas", e);
            return createError(e);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveResena(@RequestBody Resena resena) {
        try {
            // extraer los ids del cliente y del producto que está en el json
            Integer idCliente = resena.getCliente().getId();
            Integer idProducto = resena.getProducto().getId();

            // validar en base de datos si existe compra
            boolean comproProducto = ordenRepository.haCompradoProducto(idCliente, idProducto);

            // si no lo ha comprado se bloquela el guardado y se devuelve el error
            if (!comproProducto) {
                return createResponse(Boolean.FALSE,
                        "Solo los clientes que han comprado este producto pueden dejar una opinión.", null,
                        HttpStatus.FORBIDDEN);
            }

            Resena resenaGuardada = resenaRepository.save(resena);
            return createResponse(Boolean.TRUE, "Reseña publicada con éxito", resenaGuardada, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al guardar reseña", e);
            return createError(e);
        }
    }

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