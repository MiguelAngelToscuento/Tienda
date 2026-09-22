package toscuento.sistema.store.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import toscuento.sistema.store.Repository.ResenaRepository;
import toscuento.sistema.store.model.Resena;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resena")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST})
public class ResenaController {

    @Autowired
    private ResenaRepository resenaRepository;

    @GetMapping("/producto/{id}")
    public ResponseEntity<Map<String, Object>> getResenasByProducto(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Resena> resenas = resenaRepository.findByProductoId(id);
            response.put("success", true);
            response.put("data", resenas);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveResena(@RequestBody Resena resena) {
        Map<String, Object> response = new HashMap<>();
        try {
            Resena guardada = resenaRepository.save(resena);
            response.put("success", true);
            response.put("data", guardada);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}