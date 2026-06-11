using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogiCell.Server.Models;

namespace LogiCell.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly LogiCellDbContext _context;

        public AuthController(LogiCellDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Buscamos el usuario e INCLUIMOS la tabla Roles para saber su nombre de perfil
            var usuario = await _context.Usuarios
                .Include(u => u.IdRolNavigation) // <- EF Core suele llamar así a la relación. (Ver nota abajo)
                .FirstOrDefaultAsync(u =>
                    u.CorreoElectronico == request.Correo &&
                    u.ContrasenaHash == request.Contrasena);

            // 1. Validar si existe o si la contraseña es correcta
            if (usuario == null)
            {
                return Unauthorized(new { mensaje = "Correo o contraseña incorrectos." });
            }

            // 2. Validar si el usuario está activo (aprovechando tu columna EstadoActivo)
            if (usuario.EstadoActivo == false)
            {
                return Unauthorized(new { mensaje = "El usuario se encuentra inactivo. Contacte al administrador." });
            }

            // 3. Inicio de sesión exitoso
            return Ok(new
            {
                mensaje = "Inicio de sesión exitoso",
                rol = usuario.IdRolNavigation.NombreRol // Extraemos el texto "Tecnico", "Logistico", etc.
            });
        }
    }

    // La clase Request se queda igual porque así es como React envía el JSON
    public class LoginRequest
    {
        public string Correo { get; set; } = null!;
        public string Contrasena { get; set; } = null!;
    }
}
