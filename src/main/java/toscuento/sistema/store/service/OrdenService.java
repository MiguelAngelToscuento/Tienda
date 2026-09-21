package toscuento.sistema.store.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import toscuento.sistema.store.model.Orden;
import toscuento.sistema.store.Repository.OrdenRepository;

import java.util.List;

@Service
public class OrdenService {

    @Autowired
    private OrdenRepository ordenRepository;

    // metodo para registrar la compra cuando el cliente paga en el carrito
    public Orden guardar(Orden orden) {
        return ordenRepository.save(orden);
    }

    // metodo para consultar el historial de pedidos de un cliente específico
    public List<Orden> obtenerPorClienteId(Integer clienteId) {
        return ordenRepository.findByClienteId(clienteId);
    }

    // metodo para buscar una orden específica por su ID (Para actualizar envíos)
    public Orden obtenerPorId(Integer id) throws Exception {
        return ordenRepository.findById(id)
                .orElseThrow(() -> new Exception("Orden no encontrada"));
    }

    // metodo para consultar las órdenes que le han hecho a una tienda especíco
    public List<Orden> obtenerPorTiendaId(Integer tiendaId) {
        return ordenRepository.findByTiendaId(tiendaId);
    }
}