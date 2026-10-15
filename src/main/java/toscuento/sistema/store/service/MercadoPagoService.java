package toscuento.sistema.store.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class MercadoPagoService {
    private final String accessToken = "TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

    public String crearPreferenciaPago(Double total, String origenUrl) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        // cuerpo de la petición
        Map<String, Object> body = new HashMap<>();
        Map<String, Object> item = new HashMap<>();
        item.put("title", "Pedido en Fake Shop");
        item.put("quantity", 1);
        item.put("currency_id", "MXN");
        item.put("unit_price", total);
        body.put("items", Collections.singletonList(item));

        // url de retorno
        Map<String, String> backUrls = new HashMap<>();
        backUrls.put("success", origenUrl + "/catalogo.html");
        backUrls.put("failure", origenUrl + "/catalogo.html");
        backUrls.put("pending", origenUrl + "/catalogo.html");
        body.put("back_urls", backUrls);
        body.put("auto_return", "approved");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.mercadopago.com/checkout/preferences", entity, Map.class);
            return response.getBody().get("sandbox_init_point").toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

    }
}
