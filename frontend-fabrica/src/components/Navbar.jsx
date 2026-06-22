import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Clientes", end: true },
  { to: "/productos", label: "Productos" },
  { to: "/ingredientes", label: "Ingredientes" },
  { to: "/ventas", label: "Ventas" },
];

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-md fabrica-navbar py-3 mb-4">
      <div className="container">
        <span className="navbar-brand">
          <span className="brand-mark">●</span> Fábrica de Pastas
        </span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          style={{ borderColor: "rgba(251,246,238,0.3)" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto gap-1">
            {links.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
