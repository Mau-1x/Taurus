import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/home/Hero";
import Services from "../../components/home/Services";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import Brands from "../../components/home/Brands";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <WhyChooseUs />
      <Brands />
    </>
  );
}

export default Home;