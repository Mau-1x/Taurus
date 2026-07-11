import Hero from "../../components/home/Hero";
import Services from "../../components/home/Services";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import Brands from "../../components/home/Brands";
import Products from "../../components/home/Products";
import Testimonials from "../../components/home/Testimonials";
import ContactCTA from "../../components/home/ContactCTA";

function Home() {
  return (
    <>
      <Hero />
      <Services />
      <WhyChooseUs />
      <Brands />
      <Products />
      <Testimonials />
      <ContactCTA />
    </>
  );
}

export default Home;