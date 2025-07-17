// src/layouts/GoldLayout.jsx
import GoldNav from '../pages/gold/GoldNav';
import Footer from "../components/footer/Footer"

const GoldLayout = ({ children }) => {
  return (
    <div className="gold-layout">
      <GoldNav />
      <main className="gold-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default GoldLayout; 