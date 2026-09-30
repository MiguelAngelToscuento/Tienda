package toscuento.sistema.store.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import toscuento.sistema.store.model.Orden;

public interface OrdenRepository extends JpaRepository<Orden, Integer> {
    @Query("SELECT DISTINCT o FROM Orden o JOIN o.detalles d WHERE d.producto.tienda.id = :tiendaId")
    List<Orden> findByTiendaId(@Param("tiendaId") Integer tiendaId);

    List<Orden> findByClienteId(Integer clienteId);

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Orden o JOIN o.detalles d WHERE o.cliente.id = :clienteId AND d.producto.id = :productoId")
    boolean haCompradoProducto(@Param("clienteId") Integer clienteId, @Param("productoId") Integer productoId);
}
