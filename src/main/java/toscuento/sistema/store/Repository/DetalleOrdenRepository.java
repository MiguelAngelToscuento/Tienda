package toscuento.sistema.store.Repository;

import toscuento.sistema.store.model.DetalleOrden; // Ajusta el import si tu clase se llama diferente (ej. OrdenDetalle)
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DetalleOrdenRepository extends JpaRepository<DetalleOrden, Integer> {

    @Query("SELECT COALESCE(SUM(d.cantidad), 0) FROM DetalleOrden d WHERE d.producto.tienda.id = :tiendaId")
    Integer sumarVentasPorTienda(@Param("tiendaId") Integer tiendaId);
}