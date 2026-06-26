const Footer = () => {
    const anioActual = new Date().getFullYear();

    return (
        <footer className="bg-dark border-top border-secondary py-3 mt-auto">
            <div className="container-fluid px-4 d-flex justify-content-between align-items-center">
                {/* Cambiamos text-muted por text-light */}
                <div className="text-light small">
                    &copy; {anioActual} <strong>LogiCell</strong> - Proyecto Control de Entrega de Repuestos.
                </div>
                {/* Cambiamos text-muted por text-light */}
                <div className="text-light small">
                    <i className="bi bi-shield-check text-success me-1"></i>
                    Sistema Seguro
                </div>
            </div>
        </footer>
    );
};

export default Footer;