using System;
using System.Collections.Generic;

namespace LogiCell.Server.Models;

public partial class Solicitude
{
    public int IdSolicitud { get; set; }

    public int IdUsuarioSolicitante { get; set; }

    public int? IdUsuarioAtiende { get; set; }

    public int IdRepuesto { get; set; }

    public string TipoSolicitud { get; set; } = null!;

    public string? EstadoSolicitud { get; set; }

    public string? MotivoRechazo { get; set; }

    public string? NotasAdicionales { get; set; }

    public DateTime? FechaSolicitud { get; set; }

    public DateTime? FechaResolucion { get; set; }

    public DateTime? FechaEsperadaDevolucion { get; set; }

    public virtual Repuesto IdRepuestoNavigation { get; set; } = null!;

    public virtual Usuario? IdUsuarioAtiendeNavigation { get; set; }

    public virtual Usuario IdUsuarioSolicitanteNavigation { get; set; } = null!;
}
