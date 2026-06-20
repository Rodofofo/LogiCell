public class UsuarioCreacionDTO
{
    public string Correo { get; set; }
    public string Password { get; set; }
    public string Rol { get; set; } // Nombre del rol ("Técnico", etc)
    public string NombreCompleto { get; set; }
    public string Telefono { get; set; }
    public string NumeroEmpleado { get; set; }
}