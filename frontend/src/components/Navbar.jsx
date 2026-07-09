import { NavLink } from "react-router-dom";

function Navbar() {
  const linkStyle = ({ isActive }) => ({
    padding: "10px 16px",
    textDecoration: "none",
    color: isActive ? "#fff" : "#ccc",
    backgroundColor: isActive ? "#2563eb" : "transparent",
    borderRadius: "6px",
    fontWeight: 500,
  });

  return (
    <nav
      style={{
        display: "flex",
        gap: "8px",
        padding: "12px 20px",
        backgroundColor: "#1a1a1a",
        flexWrap: "wrap",
      }}
    >
      <NavLink to="/" style={linkStyle} end>
        Espacios
      </NavLink>
      <NavLink to="/vehicles" style={linkStyle}>
        Vehículos
      </NavLink>
      <NavLink to="/rates" style={linkStyle}>
        Tarifas
      </NavLink>
      <NavLink to="/subscriptions" style={linkStyle}>
        Abonos
      </NavLink>
      <NavLink to="/check-in" style={linkStyle}>
        Ingreso
      </NavLink>
      <NavLink to="/sessions" style={linkStyle}>
        Sesiones
      </NavLink>
      <NavLink to="/occupancy" style={linkStyle}>
        Ocupación
      </NavLink>
    </nav>
  );
}

export default Navbar;