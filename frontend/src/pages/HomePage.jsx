import "../App.css";
import Hero from "../components/Hero";
import GithubCard from "../components/GithubCard";
import ZipCard from "../components/ZipCard";
import Divider from "../components/Divider";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="cards-wrapper">
        <div className="cards-row">
          <GithubCard />
          <Divider />
          <ZipCard />
        </div>
      </div>
      <Footer />
    </>
  );
}
