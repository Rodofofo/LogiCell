using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogiCell.Server.Models;

namespace LogiCell.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly LogiCellDbContext _context;

        public UsuariosController(LogiCellDbContext context)
        {
            _context = context;
        }

        // 1. READ: Listar usuarios
        [HttpGet]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Include(u => u.IdRolNavigation)
                .Select(u => new {
                    u.IdUsuario,
                    u.CorreoElectronico,
                    Rol = u.IdRolNavigation.NombreRol,
                    u.EstadoActivo
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        // 2. CREATE: Crear usuario
        [HttpPost]
        public async Task<IActionResult> CrearUsuario([FromBody] CreateUsuarioRequest request)
        {
            var existeCorreo = await _context.Usuarios.AnyAsync(u => u.CorreoElectronico == request.CorreoElectronico);
            if (existeCorreo) return BadRequest(new { mensaje = "El correo ya está registrado." });

            var nuevoUsuario = new Usuario
            {
                CorreoElectronico = request.CorreoElectronico,
                ContrasenaHash = request.Contrasena,
                IdRol = request.IdRol,
                EstadoActivo = true
            };

            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Usuario creado exitosamente" });
        }

        // 3. UPDATE: Editar usuario
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarUsuario(int id, [FromBody] EditUsuarioRequest request)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado." });

            // Verificar que el nuevo correo no pertenezca a otro usuario
            var existeCorreo = await _context.Usuarios.AnyAsync(u => u.CorreoElectronico == request.CorreoElectronico && u.IdUsuario != id);
            if (existeCorreo) return BadRequest(new { mensaje = "El correo ya está en uso por otro colaborador." });

            usuario.CorreoElectronico = request.CorreoElectronico;
            usuario.IdRol = request.IdRol;

            // Solo actualizamos la contraseña si el admin escribió una nueva
            if (!string.IsNullOrWhiteSpace(request.Contrasena))
            {
                usuario.ContrasenaHash = request.Contrasena;
            }

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Usuario actualizado correctamente." });
        }

        // 4. DELETE: Activar/Desactivar usuario (Soft Delete)
        [HttpPut("toggle-estado/{id}")]
        public async Task<IActionResult> ToggleEstado(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado." });

            // Extraemos el valor, si por alguna razón es nulo, lo tratamos como falso y luego lo invertimos
            usuario.EstadoActivo = !(usuario.EstadoActivo ?? false);

            await _context.SaveChangesAsync();

            // Comparamos explícitamente con "== true" 
            var accion = usuario.EstadoActivo == true ? "activado" : "desactivado";
            return Ok(new { mensaje = $"El usuario ha sido {accion}." });
        }
    }

    // --- CLASES AUXILIARES (DTOs) ---
    public class CreateUsuarioRequest
    {
        public string CorreoElectronico { get; set; } = null!;
        public string Contrasena { get; set; } = null!;
        public int IdRol { get; set; }
    }

    public class EditUsuarioRequest
    {
        public string CorreoElectronico { get; set; } = null!;
        public string? Contrasena { get; set; } // Es opcional
        public int IdRol { get; set; }
    }
}