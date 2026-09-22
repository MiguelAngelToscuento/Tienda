package toscuento.sistema.store.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import toscuento.sistema.store.model.Resena;
import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Integer> {
    // Busca todas las reseñas de un producto en específico
    List<Resena> findByProductoId(Integer idProducto);
}