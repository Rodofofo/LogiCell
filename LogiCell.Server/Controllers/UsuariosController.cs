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

        // Método para listar todos los usuarios
        [HttpGet]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuarios = await _context.Usuarios
                .Include(u => u.IdRolNavigation) // Traemos la tabla Roles
                .Select(u => new {
                    u.IdUsuario,
                    u.CorreoElectronico,
                    Rol = u.IdRolNavigation.NombreRol,
                    u.EstadoActivo
                })
                .ToListAsync();

            return Ok(usuarios);
        }
    }
}
