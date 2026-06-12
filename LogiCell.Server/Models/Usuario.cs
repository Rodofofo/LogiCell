using System;
using System.Collections.Generic;

namespace LogiCell.Server.Models;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string CorreoElectronico { get; set; } = null!;

    public string ContrasenaHash { get; set; } = null!;

    public int IdRol { get; set; }

    public bool? EstadoActivo { get; set; }

    public virtual Role IdRolNavigation { get; set; } = null!;

    public virtual InformacionPersonal? InformacionPersonal { get; set; }

    public virtual ICollection<Solicitude> SolicitudeIdUsuarioAtiendeNavigations { get; set; } = new List<Solicitude>();

    public virtual ICollection<Solicitude> SolicitudeIdUsuarioSolicitanteNavigations { get; set; } = new List<Solicitude>();
}
