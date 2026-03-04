import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <Link to="/" className="logo">Secure<span>Scan</span></Link>
      <div className="nav-badge">OWASP Top 10 · 2025</div>
    </nav>
  );
}
