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
                Materiales = $"{s.IdRepuestoNavigation.Nombre} ({s.IdRepuestoNavigation.NumeroSerial})",
                TipoSolicitud = s.TipoSolicitud,
                Estado = s.EstadoSolicitud == "Aprobada" ? "Aprobado" :
                         s.EstadoSolicitud == "Rechazada" ? "Rechazado" :
                         s.EstadoSolicitud ?? "Pendiente",
                MotivoRechazo = s.MotivoRechazo
            }).ToList();

            return Ok(solicitudesReact);
        }

        [HttpPost]
        public async Task<IActionResult> CrearSolicitud([FromBody] NuevaSolicitudDTO request)
        {
            var solicitante = await _context.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == request.CorreoTecnico);
            if (solicitante == null) return BadRequest(new { mensaje = "Usuario solicitante no encontrado." });

            foreach (var idRepuesto in request.IdsRepuestos)
            {
                var repuesto = await _context.Repuestos.FindAsync(idRepuesto);
                if (repuesto == null || repuesto.EstadoOperativo != "Disponible") continue;

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
                repuesto.EstadoOperativo = "Reservado";
            }

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Solicitudes creadas y repuestos reservados exitosamente." });
        }

        [HttpPost("devolucion")]
        public async Task<IActionResult> CrearDevolucion([FromBody] NuevaDevolucionDTO request)
        {
            var solicitante = await _context.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == request.CorreoTecnico);
            if (solicitante == null) return BadRequest(new { mensaje = "Usuario no encontrado." });

            var repuesto = await _context.Repuestos.FindAsync(request.IdRepuesto);
            if (repuesto == null) return NotFound(new { mensaje = "Repuesto no encontrado." });

            var nuevaSolicitud = new Solicitude
            {
                IdUsuarioSolicitante = solicitante.IdUsuario,
                IdRepuesto = repuesto.IdRepuesto,
                TipoSolicitud = "Devolucion",
                EstadoSolicitud = "Pendiente",
                NotasAdicionales = "Devolución de equipo a bodega",
                FechaSolicitud = DateTime.Now
            };

            _context.Solicitudes.Add(nuevaSolicitud);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Solicitud de devolución enviada." });
        }

        [HttpPost("importacion")]
        public async Task<IActionResult> CrearImportacion([FromBody] NuevaImportacionDTO request)
        {
            var solicitante = await _context.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == request.CorreoTecnico);
            if (solicitante == null) return BadRequest(new { mensaje = "Usuario no encontrado." });

            // 1. Buscamos cualquier bodega válida para asignar temporalmente el repuesto virtual
            var bodegaTemporal = await _context.Bodegas.FirstOrDefaultAsync();
            if (bodegaTemporal == null) return BadRequest(new { mensaje = "No hay bodegas configuradas en el sistema." });

            // 2. Creamos el Repuesto Virtual
            var repuestoVirtual = new Repuesto
            {
                NumeroSerial = "REQ-" + new Random().Next(10000, 99999).ToString(),
                Nombre = request.ModeloRepuesto,
                Descripcion = "Pendiente de importación especial",
                IdBodega = bodegaTemporal.IdBodega,
                EstadoOperativo = "En Trámite" // Estado lógico especial
            };

            _context.Repuestos.Add(repuestoVirtual);
            await _context.SaveChangesAsync(); // Guardamos para que SQL genere el IdRepuesto

            // 3. Atamos la solicitud a este nuevo repuesto virtual
            var nuevaSolicitud = new Solicitude
            {
                IdUsuarioSolicitante = solicitante.IdUsuario,
                IdRepuesto = repuestoVirtual.IdRepuesto,
                TipoSolicitud = "Importación",
                EstadoSolicitud = "Pendiente",
                NotasAdicionales = request.Justificacion,
                FechaSolicitud = DateTime.Now
            };

            _context.Solicitudes.Add(nuevaSolicitud);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Solicitud de importación enviada al logístico." });
        }

        [HttpPut("procesar/{id}")]
        public async Task<IActionResult> ProcesarSolicitud(int id, [FromBody] ProcesarSolicitudDTO request)
        {
            var solicitud = await _context.Solicitudes
                .Include(s => s.IdRepuestoNavigation)
                .FirstOrDefaultAsync(s => s.IdSolicitud == id);

            if (solicitud == null) return NotFound(new { mensaje = "Solicitud no encontrada." });

            var logistico = await _context.Usuarios.FirstOrDefaultAsync(u => u.CorreoElectronico == request.CorreoLogistico);
            if (logistico != null) solicitud.IdUsuarioAtiende = logistico.IdUsuario;

            solicitud.FechaResolucion = DateTime.Now;

            if (request.EstadoNuevo == "Aprobado")
            {
                if (solicitud.TipoSolicitud == "Devolucion")
                {
                    solicitud.EstadoSolicitud = "Completada";
                    solicitud.IdRepuestoNavigation.EstadoOperativo = "Dado de baja";
                }
                else
                {
                    solicitud.EstadoSolicitud = "Aprobada";
                    solicitud.IdRepuestoNavigation.EstadoOperativo = "Entregado";
                }
            }
            else if (request.EstadoNuevo == "Rechazado")
            {
                solicitud.EstadoSolicitud = "Rechazada";
                solicitud.MotivoRechazo = request.MotivoRechazo;

                // Si es un despacho y se rechaza, la pieza vuelve al estante
                if (solicitud.TipoSolicitud == "Despacho")
                {
                    solicitud.IdRepuestoNavigation.EstadoOperativo = "Disponible";
                }
                // Si es una importación rechazada, el repuesto virtual se da de baja
                else if (solicitud.TipoSolicitud == "Importación")
                {
                    solicitud.IdRepuestoNavigation.EstadoOperativo = "Dado de baja";
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = $"Solicitud procesada." });
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
        public List<int> IdsRepuestos { get; set; } = new List<int>();
        public string Justificacion { get; set; } = null!;
    }

    public class NuevaDevolucionDTO
    {
        public string CorreoTecnico { get; set; } = null!;
        public int IdRepuesto { get; set; }
    }

    public class NuevaImportacionDTO
    {
        public string CorreoTecnico { get; set; } = null!;
        public string ModeloRepuesto { get; set; } = null!;
        public string Justificacion { get; set; } = null!;
    }

    public class ProcesarSolicitudDTO
    {
        public string EstadoNuevo { get; set; } = null!;
        public string? MotivoRechazo { get; set; }
        public string CorreoLogistico { get; set; } = null!;
    }
}