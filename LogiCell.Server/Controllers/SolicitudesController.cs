using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogiCell.Server.Models;
using System;

namespace LogiCell.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SolicitudesController : ControllerBase
    {
        private readonly LogiCellDbContext _context;

        public SolicitudesController(LogiCellDbContext context)
        {
            _context = context;
        }

        // 1. READ: Obtener todas las solicitudes
        [HttpGet]
        public async Task<IActionResult> GetSolicitudes()
        {
            var solicitudesDb = await _context.Solicitudes
                .Include(s => s.IdUsuarioSolicitanteNavigation)
                .Include(s => s.IdRepuestoNavigation)
                .OrderByDescending(s => s.FechaSolicitud)
                .ToListAsync();

            var solicitudesReact = solicitudesDb.Select(s => new SolicitudResponseDTO
            {
                IdSolicitud = s.IdSolicitud,
                Tecnico = s.IdUsuarioSolicitanteNavigation.CorreoElectronico,
                Fecha = s.FechaSolicitud?.ToString("dd/MM/yyyy") ?? "",
                SitioMotivo = s.NotasAdicionales ?? "Sin justificación",
                // Mostramos el nombre y el serial para que el logístico sepa exactamente qué es
                Materiales = $"{s.IdRepuestoNavigation.Nombre} ({s.IdRepuestoNavigation.NumeroSerial})",
                TipoSolicitud = s.TipoSolicitud,
                // Adaptamos la base de datos (Aprobada/Rechazada) a lo que React tiene en sus etiquetas (Aprobado/Rechazado)
                Estado = s.EstadoSolicitud == "Aprobada" ? "Aprobado" :
                         s.EstadoSolicitud == "Rechazada" ? "Rechazado" :
                         s.EstadoSolicitud ?? "Pendiente",
                MotivoRechazo = s.MotivoRechazo
            }).ToList();

            return Ok(solicitudesReact);
        }

        // 2. CREATE: Enviar nueva solicitud (Carrito del Técnico)
        [HttpPost]
        public async Task<IActionResult> CrearSolicitud([FromBody] NuevaSolicitudDTO request)
        {
            // Buscar al técnico usando el correo (que ya tienes guardado en el localStorage de React)
            var solicitante = await _context.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == request.CorreoTecnico);
            if (solicitante == null) return BadRequest(new { mensaje = "Usuario solicitante no encontrado." });

            // Procesar el carrito: Si hay 3 repuestos, se crean 3 solicitudes independientes
            foreach (var idRepuesto in request.IdsRepuestos)
            {
                var repuesto = await _context.Repuestos.FindAsync(idRepuesto);
                // Si alguien más se lo llevó en la fracción de segundo antes, lo ignoramos
                if (repuesto == null || repuesto.EstadoOperativo != "Disponible")
                {
                    continue;
                }

                // 1. Nace la solicitud
                var nuevaSolicitud = new Solicitude
                {
                    IdUsuarioSolicitante = solicitante.IdUsuario,
                    IdRepuesto = repuesto.IdRepuesto,
                    TipoSolicitud = "Despacho",
                    EstadoSolicitud = "Pendiente",
                    NotasAdicionales = request.Justificacion,
                    FechaSolicitud = DateTime.Now
                };

                _context.Solicitudes.Add(nuevaSolicitud);

                // 2. Reacción en cadena: El repuesto desaparece del catálogo disponible
                repuesto.EstadoOperativo = "Reservado";
            }

            // Entity Framework guarda las nuevas solicitudes y actualiza los repuestos en una sola transacción
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Solicitudes creadas y repuestos reservados exitosamente." });
        }

        // 3. UPDATE: Procesar Solicitud (El Logístico aprueba o rechaza)
        [HttpPut("procesar/{id}")]
        public async Task<IActionResult> ProcesarSolicitud(int id, [FromBody] ProcesarSolicitudDTO request)
        {
            var solicitud = await _context.Solicitudes
                .Include(s => s.IdRepuestoNavigation)
                .FirstOrDefaultAsync(s => s.IdSolicitud == id);

            if (solicitud == null) return NotFound(new { mensaje = "Solicitud no encontrada." });

            // Registrar quién fue el logístico que atendió el caso
            var logistico = await _context.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == request.CorreoLogistico);
            if (logistico != null)
            {
                solicitud.IdUsuarioAtiende = logistico.IdUsuario;
            }

            solicitud.FechaResolucion = DateTime.Now;

            // Reacciones en cadena dependiendo del botón presionado en React
            if (request.EstadoNuevo == "Aprobado")
            {
                solicitud.EstadoSolicitud = "Aprobada";
                solicitud.IdRepuestoNavigation.EstadoOperativo = "Entregado";
            }
            else if (request.EstadoNuevo == "Rechazado")
            {
                solicitud.EstadoSolicitud = "Rechazada";
                solicitud.MotivoRechazo = request.MotivoRechazo;
                // Devolvemos la pieza al estante para que otro técnico pueda pedirla
                solicitud.IdRepuestoNavigation.EstadoOperativo = "Disponible";
            }

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = $"Solicitud procesada correctamente." });
        }
    }

    // --- DTOs ---
    public class SolicitudResponseDTO
    {
        public int IdSolicitud { get; set; }
        public string Tecnico { get; set; } = null!;
        public string Fecha { get; set; } = null!;
        public string SitioMotivo { get; set; } = null!;
        public string Materiales { get; set; } = null!;
        public string TipoSolicitud { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public string? MotivoRechazo { get; set; }
    }

    public class NuevaSolicitudDTO
    {
        public string CorreoTecnico { get; set; } = null!;
        public List<int> IdsRepuestos { get; set; } = new List<int>(); // Arreglo para el carrito
        public string Justificacion { get; set; } = null!;
    }

    public class ProcesarSolicitudDTO
    {
        public string EstadoNuevo { get; set; } = null!;
        public string? MotivoRechazo { get; set; }
        public string CorreoLogistico { get; set; } = null!;
    }
}
