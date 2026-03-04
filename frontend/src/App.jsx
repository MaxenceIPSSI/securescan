import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GithubCard from "./components/GithubCard";
import ZipCard from "./components/ZipCard";
import Divider from "./components/Divider";
import Footer from "./components/Footer";

export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`page${mounted ? " mounted" : ""}`}>
      <Navbar />
      <Hero />
      <div className="cards-wrapper">
        <div className="cards-row">
          <GithubCard />
          <Divider />
          <ZipCard />
        </div>
      </div>
      <Footer />
    </div>
  );
}
