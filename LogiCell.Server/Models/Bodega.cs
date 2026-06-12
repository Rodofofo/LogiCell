using System;
using System.Collections.Generic;

namespace LogiCell.Server.Models;

public partial class Bodega
{
    public int IdBodega { get; set; }

    public string NombreBodega { get; set; } = null!;

    public string Ubicacion { get; set; } = null!;

    public virtual ICollection<Repuesto> Repuestos { get; set; } = new List<Repuesto>();
}
