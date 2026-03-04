import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className={`page${mounted ? " mounted" : ""}`}>
      <Navbar />
      <Outlet />
    </div>
  );
}
