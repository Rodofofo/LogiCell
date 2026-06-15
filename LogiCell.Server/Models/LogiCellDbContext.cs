using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace LogiCell.Server.Models;

public partial class LogiCellDbContext : DbContext
{
    public LogiCellDbContext()
    {
    }

    public LogiCellDbContext(DbContextOptions<LogiCellDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Bodega> Bodegas { get; set; }

    public virtual DbSet<InformacionPersonal> InformacionPersonals { get; set; }

    public virtual DbSet<Repuesto> Repuestos { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Solicitude> Solicitudes { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=.\\SQLEXPRESS;Database=LogiCellDB;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bodega>(entity =>
        {
            entity.HasKey(e => e.IdBodega).HasName("PK__Bodegas__42B6674207C67F97");

            entity.Property(e => e.NombreBodega).HasMaxLength(100);
            entity.Property(e => e.Ubicacion).HasMaxLength(200);
        });

        modelBuilder.Entity<InformacionPersonal>(entity =>
        {
            entity.HasKey(e => e.IdInformacion).HasName("PK__Informac__60626411776E8F4B");

            entity.ToTable("InformacionPersonal");

            entity.HasIndex(e => e.IdUsuario, "UQ__Informac__5B65BF96FB16F039").IsUnique();

            entity.Property(e => e.NombreCompleto).HasMaxLength(150);
            entity.Property(e => e.NumeroEmpleado).HasMaxLength(50);
            entity.Property(e => e.Telefono).HasMaxLength(20);

            entity.HasOne(d => d.IdUsuarioNavigation).WithOne(p => p.InformacionPersonal)
                .HasForeignKey<InformacionPersonal>(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Informacion_Usuarios");
        });

        modelBuilder.Entity<Repuesto>(entity =>
        {
            entity.HasKey(e => e.IdRepuesto).HasName("PK__Repuesto__318BBE67F1A42E89");

            entity.HasIndex(e => e.NumeroSerial, "UQ__Repuesto__C1C28FA55DF2A934").IsUnique();

            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.EstadoOperativo)
                .HasMaxLength(50)
                .HasDefaultValue("Disponible");
            entity.Property(e => e.Nombre).HasMaxLength(150);
            entity.Property(e => e.NumeroSerial).HasMaxLength(100);

            entity.HasOne(d => d.IdBodegaNavigation).WithMany(p => p.Repuestos)
                .HasForeignKey(d => d.IdBodega)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Repuestos_Bodegas");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.IdRol).HasName("PK__Roles__2A49584C2F571FD5");

            entity.HasIndex(e => e.NombreRol, "UQ__Roles__4F0B537FD0C26B51").IsUnique();

            entity.Property(e => e.NombreRol).HasMaxLength(50);
        });

        modelBuilder.Entity<Solicitude>(entity =>
        {
            entity.HasKey(e => e.IdSolicitud).HasName("PK__Solicitu__36899CEFBA899DA1");

            entity.Property(e => e.DescripcionImportacion).HasMaxLength(255);
            entity.Property(e => e.EstadoSolicitud)
                .HasMaxLength(50)
                .HasDefaultValue("Pendiente");
            entity.Property(e => e.FechaEsperadaDevolucion).HasColumnType("datetime");
            entity.Property(e => e.FechaResolucion).HasColumnType("datetime");
            entity.Property(e => e.FechaSolicitud)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.MotivoRechazo).HasMaxLength(255);
            entity.Property(e => e.NotasAdicionales).HasMaxLength(500);
            entity.Property(e => e.TipoSolicitud).HasMaxLength(50);

            entity.HasOne(d => d.IdRepuestoNavigation).WithMany(p => p.Solicitudes)
                .HasForeignKey(d => d.IdRepuesto)
                .HasConstraintName("FK_Solicitudes_Repuestos");

            entity.HasOne(d => d.IdUsuarioAtiendeNavigation).WithMany(p => p.SolicitudeIdUsuarioAtiendeNavigations)
                .HasForeignKey(d => d.IdUsuarioAtiende)
                .HasConstraintName("FK_Solicitudes_Logistico");

            entity.HasOne(d => d.IdUsuarioSolicitanteNavigation).WithMany(p => p.SolicitudeIdUsuarioSolicitanteNavigations)
                .HasForeignKey(d => d.IdUsuarioSolicitante)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Solicitudes_Tecnico");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__Usuarios__5B65BF9742857664");

            entity.HasIndex(e => e.CorreoElectronico, "UQ__Usuarios__531402F3D5895B87").IsUnique();

            entity.Property(e => e.ContrasenaHash).HasMaxLength(255);
            entity.Property(e => e.CorreoElectronico).HasMaxLength(100);
            entity.Property(e => e.EstadoActivo).HasDefaultValue(true);

            entity.HasOne(d => d.IdRolNavigation).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.IdRol)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Usuarios_Roles");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
