import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FaCalculator, FaHistory, FaQuestionCircle, FaSun, FaMoon } from 'react-icons/fa';
import './gold.css';

const GoldNav = () => {
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { path: "/gold/calculator", label: "Calculator", icon: <FaCalculator /> },
    { path: "/gold/history", label: "History", icon: <FaHistory /> },
    { path: "/gold/help", label: "Help", icon: <FaQuestionCircle /> }
  ];

  return (
    <motion.nav 
      className={`gold-nav ${theme}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="nav-container">
        <div className="nav-logo">
          <span className="gold-text">GOLD</span> Calculator
        </div>
        
        <ul className="nav-links">
          {navItems.map((item, index) => (
            <motion.li 
              key={item.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={item.path} className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            </motion.li>
          ))}
          
          <motion.li 
            className="theme-toggle"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <button onClick={toggleTheme} className="theme-button">
              {theme === 'light' ? (
                <>
                  <FaMoon className="theme-icon" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <FaSun className="theme-icon" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </motion.li>
        </ul>
      </div>
    </motion.nav>
  );
};

export default GoldNav;