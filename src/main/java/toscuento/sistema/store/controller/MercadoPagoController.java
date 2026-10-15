package toscuento.sistema.store.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import toscuento.sistema.store.service.MercadoPagoService;

@RestController
@RequestMapping("/mp")
public class MercadoPagoController {
    @Autowired
    MercadoPagoService mercadoPagoService;

    @PostMapping("/crear-preferencia")
    public ResponseEntity<Map<String, Object>> crearPreferencia(@RequestBody Map<String, Object> data,
            HttpServletRequest request) {

        String originUrl = request.getHeader("Origin");

        if (originUrl == null) {
            originUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        }

        Double total = Double.parseDouble(data.get("total").toString());

        // Delegar la lógica al servicio
        String urlPago = mercadoPagoService.crearPreferenciaPago(total, originUrl);

        if (urlPago != null) {
            Map<String, Object> res = new HashMap<>();
            res.put("url_pago", urlPago);
            return ResponseEntity.ok(res);
        } else {
            return ResponseEntity.internalServerError().build();
        }
    }
}
