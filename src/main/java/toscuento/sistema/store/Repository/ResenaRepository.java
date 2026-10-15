package toscuento.sistema.store.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import toscuento.sistema.store.model.Resena;
import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Integer> {
    // Busca todas las reseñas de un producto en específico
    List<Resena> findByProductoId(Integer idProducto);

    @Query("SELECT COALESCE(AVG(r.calificacion), 0.0) FROM Resena r WHERE r.producto.tienda.id = :tiendaId")
    Double calcularPromedioPorTienda(@Param("tiendaId") Integer tiendaId);

    boolean existsByClienteIdAndProductoId(Integer clienteId, Integer productoId);
}