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
                // NUEVO: Agregamos la fecha límite extraída de la base de datos
                FechaLimite = s.FechaEsperadaDevolucion?.ToString("dd/MM/yyyy") ?? "N/A", 
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
                // Guardamos la decisión del técnico en las notas para que el logístico y el sistema lo sepan
                NotasAdicionales = $"Estado reportado por técnico: {request.EstadoFisico}",
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

            var bodegaMetroEste = await _context.Bodegas.FirstOrDefaultAsync(b => b.NombreBodega == "Metro Este");
            if (bodegaMetroEste == null) return BadRequest(new { mensaje = "La bodega Metro Este no está configurada." });

            var repuestoVirtual = new Repuesto
            {
                NumeroSerial = "REQ-" + new Random().Next(10000, 99999).ToString(), 
                Nombre = request.ModeloRepuesto,
                Descripcion = "Pendiente de importación especial",
                IdBodega = bodegaMetroEste.IdBodega,
                EstadoOperativo = "En Trámite" 
            };

            _context.Repuestos.Add(repuestoVirtual);
            await _context.SaveChangesAsync(); 

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

                    if (solicitud.NotasAdicionales != null && solicitud.NotasAdicionales.Contains("Disponible"))
                    {
                        solicitud.IdRepuestoNavigation.EstadoOperativo = "Disponible";
                    }
                    else
                    {
                        solicitud.IdRepuestoNavigation.EstadoOperativo = "Dado de baja";
                    }
                }
                else
                {
                    // Toda solicitud aprobada que NO sea devolución (Despacho o Importación) pasa a Entregado al técnico
                    solicitud.EstadoSolicitud = "Aprobada";
                    solicitud.IdRepuestoNavigation.EstadoOperativo = "Entregado";
                    solicitud.FechaEsperadaDevolucion = DateTime.Now.AddMonths(1);
                }
            }
            else if (request.EstadoNuevo == "Rechazado")
            {
                solicitud.EstadoSolicitud = "Rechazada";
                solicitud.MotivoRechazo = request.MotivoRechazo;
                
                if (solicitud.TipoSolicitud == "Despacho")
                {
                    solicitud.IdRepuestoNavigation.EstadoOperativo = "Disponible";
                }
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
        public string FechaLimite { get; set; } = null!; // NUEVO
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
        public string EstadoFisico { get; set; } = null!; // NUEVO
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