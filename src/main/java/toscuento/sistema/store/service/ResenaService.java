package toscuento.sistema.store.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import toscuento.sistema.store.Repository.OrdenRepository;
import toscuento.sistema.store.Repository.ResenaRepository;
import toscuento.sistema.store.model.Resena;

import java.util.List;

@Service
public class ResenaService {

    @Autowired
    private ResenaRepository resenaRepository;

    @Autowired
    private OrdenRepository ordenRepository;

    public List<Resena> obtenerPorProductoId(Integer productoId) {
        return resenaRepository.findByProductoId(productoId);
    }

    public Resena guardarResena(Resena resena) throws Exception {
        Integer idCliente = resena.getCliente().getId();
        Integer idProducto = resena.getProducto().getId();

        boolean comproProducto = ordenRepository.haCompradoProducto(idCliente, idProducto);
        if (!comproProducto) {
            throw new Exception("Solo los clientes que han comprado este producto pueden dejar una opinión.");
        }

        boolean yaComento = resenaRepository.existsByClienteIdAndProductoId(idCliente, idProducto);
        if (yaComento) {
            throw new Exception("Ya has publicado una reseña para este producto en esta compra.");
        }

        return resenaRepository.save(resena);
    }
}