using System;
using System.Collections.Generic;

namespace LogiCell.Server.Models;

public partial class InformacionPersonal
{
    public int IdInformacion { get; set; }

    public int IdUsuario { get; set; }

    public string NombreCompleto { get; set; } = null!;

    public string? Telefono { get; set; }

    public string? NumeroEmpleado { get; set; }

    public string? RegionAsignada { get; set; }

    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
}
