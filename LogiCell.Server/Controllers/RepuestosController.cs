using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogiCell.Server.Models;

namespace LogiCell.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RepuestosController : ControllerBase
    {
        private readonly LogiCellDbContext _context;

        public RepuestosController(LogiCellDbContext context)
        {
            _context = context;
        }

        // 1. READ: Listar todo el inventario
        [HttpGet]
        public async Task<IActionResult> GetRepuestos()
        {
            var repuestos = await _context.Repuestos
                .Include(r => r.IdBodegaNavigation) // Traemos los datos de la bodega
                .Select(r => new RepuestoResponseDTO
                {
                    IdRepuesto = r.IdRepuesto,
                    NumeroSerial = r.NumeroSerial,
                    Nombre = r.Nombre,
                    Descripcion = r.Descripcion,
                    Bodega = r.IdBodegaNavigation.NombreBodega, // Mapeamos el nombre para React
                    EstadoOperativo = r.EstadoOperativo
                })
                .ToListAsync();

            return Ok(repuestos);
        }

        // 2. CREATE: Ingresar nuevo repuesto
        [HttpPost]
        public async Task<IActionResult> CrearRepuesto([FromBody] CreateRepuestoDTO request)
        {
            // Validar que el serial no exista ya en la base de datos
            var existeSerial = await _context.Repuestos.AnyAsync(r => r.NumeroSerial == request.NumeroSerial);
            if (existeSerial) return BadRequest(new { mensaje = "El número de serial ya está registrado en el inventario." });

            // Buscar el ID de la bodega según el nombre que envía React ("Metro Este", "Huetar", etc.)
            var bodegaDb = await _context.Bodegas.FirstOrDefaultAsync(b => b.NombreBodega == request.Bodega);
            if (bodegaDb == null) return BadRequest(new { mensaje = "La bodega especificada no es válida." });

            var nuevoRepuesto = new Repuesto
            {
                NumeroSerial = request.NumeroSerial,
                Nombre = request.Nombre,
                Descripcion = request.Descripcion,
                IdBodega = bodegaDb.IdBodega,
                EstadoOperativo = "Disponible" // Estado por defecto 
            };

            _context.Repuestos.Add(nuevoRepuesto);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Repuesto ingresado al inventario con éxito." });
        }

        // 3. UPDATE: Editar datos del repuesto
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarRepuesto(int id, [FromBody] EditRepuestoDTO request)
        {
            var repuesto = await _context.Repuestos.FindAsync(id);
            if (repuesto == null) return NotFound(new { mensaje = "Repuesto no encontrado." });

            // Validar que si cambiaron el serial, el nuevo no le pertenezca a otro repuesto
            var existeSerial = await _context.Repuestos.AnyAsync(r => r.NumeroSerial == request.NumeroSerial && r.IdRepuesto != id);
            if (existeSerial) return BadRequest(new { mensaje = "El número de serial ya está en uso por otro componente." });

            // Buscar la nueva bodega si la cambiaron
            var bodegaDb = await _context.Bodegas.FirstOrDefaultAsync(b => b.NombreBodega == request.Bodega);
            if (bodegaDb == null) return BadRequest(new { mensaje = "La bodega de destino no es válida." });

            repuesto.NumeroSerial = request.NumeroSerial;
            repuesto.Nombre = request.Nombre;
            repuesto.Descripcion = request.Descripcion;
            repuesto.IdBodega = bodegaDb.IdBodega;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Componente modificado correctamente." });
        }

        // 4. DELETE LÓGICO: Dar de baja un repuesto
        [HttpPut("dar-baja/{id}")]
        public async Task<IActionResult> DarDeBaja(int id)
        {
            var repuesto = await _context.Repuestos.FindAsync(id);
            if (repuesto == null) return NotFound(new { mensaje = "Repuesto no encontrado." });

            // Cambiamos el estado en lugar de borrarlo
            repuesto.EstadoOperativo = "Dado de baja";

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "El componente ha sido dado de baja exitosamente." });
        }
    }

    // --- DTOs (Moldes para comunicarse con React) ---
    public class RepuestoResponseDTO
    {
        public int IdRepuesto { get; set; }
        public string NumeroSerial { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public string Bodega { get; set; } = null!;
        public string? EstadoOperativo { get; set; }
    }

    public class CreateRepuestoDTO
    {
        public string NumeroSerial { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public string Bodega { get; set; } = null!;
    }

    public class EditRepuestoDTO
    {
        public string NumeroSerial { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public string Bodega { get; set; } = null!;
    }
}