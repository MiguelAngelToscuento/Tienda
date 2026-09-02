package toscuento.sistema.store.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import toscuento.sistema.store.model.Tienda;

import java.util.List;
import java.util.Optional;

@Repository
public interface TiendaRepository extends JpaRepository<Tienda, Integer> {
    Optional<Tienda> findByUsuarioId(Integer id);
    List<Tienda> findByActivoTrue();
}
