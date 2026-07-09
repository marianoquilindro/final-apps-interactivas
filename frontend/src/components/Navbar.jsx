import { NavLink } from "react-router-dom";

function Navbar() {
  const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  return (
    <nav className="navbar">
      <NavLink to="/" className={linkClass} end>
        Espacios
      </NavLink>
      <NavLink to="/vehicles" className={linkClass}>
        Vehículos
      </NavLink>
      <NavLink to="/rates" className={linkClass}>
        Tarifas
      </NavLink>
      <NavLink to="/subscriptions" className={linkClass}>
        Abonos
      </NavLink>
      <NavLink to="/check-in" className={linkClass}>
        Ingreso
      </NavLink>
      <NavLink to="/sessions" className={linkClass}>
        Sesiones
      </NavLink>
      <NavLink to="/occupancy" className={linkClass}>
        Ocupación
      </NavLink>
    </nav>
  );
}

export default Navbar;