package toscuento.sistema.store.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import toscuento.sistema.store.Repository.DetalleOrdenRepository;
import toscuento.sistema.store.Repository.ResenaRepository;
import toscuento.sistema.store.Repository.TiendaRepository;
import toscuento.sistema.store.model.Tienda;
import toscuento.sistema.store.model.Usuario;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TiendaService {

    public static final Logger logger = LoggerFactory.getLogger(TiendaService.class);

    @Autowired
    private TiendaRepository tiendaRepository;

    @Autowired
    private DetalleOrdenRepository detalleOrdenRepository;

    @Autowired
    private ResenaRepository resenaRepository;

    @Autowired
    private JavaMailSender mailSender; // Inyectado para enviar correos

    public List<Tienda> obtenerTodas() {
        logger.info("Obteniendo todas las tiendas y calculando estadísticas");
        List<Tienda> tiendas = tiendaRepository.findAll();

        // Inyectamos los cálculos de ventas y prestigio
        for (Tienda tienda : tiendas) {
            Integer ventas = detalleOrdenRepository.sumarVentasPorTienda(tienda.getId());
            Double promedio = resenaRepository.calcularPromedioPorTienda(tienda.getId());

            tienda.setTotalVentas(ventas != null ? ventas : 0);
            tienda.setCalificacionPromedio(promedio != null ? Math.round(promedio * 10.0) / 10.0 : 0.0);
        }
        return tiendas;
    }

    // Lógica de archivos movida desde el controlador
    public Tienda guardarConLogo(String nombreTienda, String rfc, Integer usuarioId, MultipartFile archivoLogo)
            throws Exception {
        logger.info("Guardando una nueva tienda y procesando logo");
        Tienda tienda = new Tienda();
        tienda.setNombreTienda(nombreTienda);
        tienda.setRfc(rfc);

        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        tienda.setUsuario(usuario);

        if (archivoLogo != null && !archivoLogo.isEmpty()) {
            String rutaCarpeta = "uploads/logos/";
            Path rutaDirectorio = Paths.get(rutaCarpeta);

            if (!Files.exists(rutaDirectorio)) {
                Files.createDirectories(rutaDirectorio);
            }

            String nombreOriginal = archivoLogo.getOriginalFilename();
            String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
            String nombreUnico = UUID.randomUUID().toString() + extension;

            Path rutaFisica = Paths.get(rutaCarpeta + nombreUnico);
            Files.copy(archivoLogo.getInputStream(), rutaFisica);

            tienda.setUrlLogo("/" + rutaCarpeta + nombreUnico);
        }

        return tiendaRepository.save(tienda);
    }

    public Tienda updateTienda(Integer id, Map<String, Object> fields) throws Exception {
        logger.info("Procesando actualización parcial para la tienda id: " + id);
        Tienda tienda = obtenerPorId(id);

        if (fields.containsKey("nombreTienda"))
            tienda.setNombreTienda((String) fields.get("nombreTienda"));
        if (fields.containsKey("rfc"))
            tienda.setRfc((String) fields.get("rfc"));
        if (fields.containsKey("urlLogo"))
            tienda.setUrlLogo((String) fields.get("urlLogo"));

        return tiendaRepository.save(tienda);
    }

    public void eliminar(Integer id) {
        logger.info("Eliminando tienda de la base de datos id: " + id);
        tiendaRepository.deleteById(id);
    }

    public Tienda obtenerPorUsuarioId(Integer idUsuario) {
        logger.info("Buscando tienda para el usuario con id:" + idUsuario);
        return tiendaRepository.findByUsuarioId(idUsuario).orElse(null);
    }

    public Tienda obtenerPorId(Integer id) throws Exception {
        return tiendaRepository.findById(id)
                .orElseThrow(() -> new Exception("Tienda no encontrada con el id: " + id));
    }

    // Lógica de suspensión y envío de correos centralizada
    public Tienda cambiarEstadoOperativo(Integer id, String accion, String motivo) throws Exception {
        Tienda tienda = obtenerPorId(id);

        // Cambiar el estado booleano
        boolean estadoActual = tienda.getActivo() != null ? tienda.getActivo() : false;
        boolean nuevoEstado = !estadoActual; // Si era true pasa a false, y viceversa
        tienda.setActivo(nuevoEstado);
        tiendaRepository.save(tienda);

        // Si el JavaScript no envió la acción, la deducimos automáticamente
        if (accion == null || accion.isEmpty()) {
            accion = nuevoEstado ? "restaurar" : "suspender";
        }

        // Preparar el correo
        String correoDueno = tienda.getUsuario().getCorreo();
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(correoDueno);

        // Evaluar qué tipo de correo mandar
        if ("suspender".equals(accion)) {
            mensaje.setSubject("Aviso Importante: Tu tienda ha sido suspendida");
            mensaje.setText("Hola " + tienda.getNombreTienda() + ",\n\n" +
                    "Lamentamos informarte que tu tienda ha sido suspendida de nuestra plataforma.\n\n" +
                    "Motivo de la suspensión:\n" + (motivo != null ? motivo : "Incumplimiento de políticas") + "\n\n" +
                    "Si crees que esto es un error, por favor comunícate con soporte.");

            mailSender.send(mensaje);
            logger.info("Correo de suspensión enviado a: " + correoDueno);

        } else if ("restaurar".equals(accion)) {
            mensaje.setSubject("¡Buenas noticias! Tu tienda ha sido restaurada");
            mensaje.setText("Hola " + tienda.getNombreTienda() + ",\n\n" +
                    "Nos complace informarte que la suspensión de tu tienda ha sido levantada.\n\n" +
                    "Tus productos vuelven a estar visibles en el catálogo y ya puedes operar con normalidad.\n\n" +
                    "¡Te deseamos mucho éxito en tus ventas!");

            mailSender.send(mensaje);
            logger.info("Correo de restauración enviado a: " + correoDueno);
        }

        return tienda;
    }
}