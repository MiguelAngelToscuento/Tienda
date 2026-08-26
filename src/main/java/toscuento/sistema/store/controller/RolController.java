package toscuento.sistema.store.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import toscuento.sistema.store.model.Rol;
import toscuento.sistema.store.service.RolService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/rol")
public class RolController {

    private static final Logger logger = LoggerFactory.getLogger(RolController.class);

    @Autowired
    private RolService rolService;

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> guardarRol(@RequestBody Rol rol) {
        logger.info("Peticion recibida para guardar rol");
        Map<String, Object> response = new HashMap<>();

        try {
            Rol nuevoRol = rolService.guardarRol(rol);
            response.put("success", true);
            response.put("message", "Rol guardado exitosamente");
            response.put("data", nuevoRol);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error al guardar el rol: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error al guardar el rol");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}