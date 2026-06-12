using System;
using System.Collections.Generic;

namespace LogiCell.Server.Models;

public partial class Repuesto
{
    public int IdRepuesto { get; set; }

    public string NumeroSerial { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public int IdBodega { get; set; }

    public string? EstadoOperativo { get; set; }

    public virtual Bodega IdBodegaNavigation { get; set; } = null!;

    public virtual ICollection<Solicitude> Solicitudes { get; set; } = new List<Solicitude>();
}
