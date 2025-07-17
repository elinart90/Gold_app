import { motion } from 'framer-motion';
import { 
  FaQuestionCircle, 
  FaWeight, 
  FaCalculator, 
  FaCoins,
  FaHome,
  FaExchangeAlt,
  FaChartLine,
  FaUserCog,
  FaBell,
  FaFilter,
  FaFileExport
} from 'react-icons/fa';
import './Help.css';

const Help = () => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        duration: 0.7,
        ease: "backOut"
      }
    }
  };

  const hoverEffect = {
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const bounce = {
    hover: {
      y: -5,
      transition: {
        yoyo: Infinity,
        duration: 0.6
      }
    }
  };

  return (
    <motion.div 
      className="help-container"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {/* Animated Header */}
      <motion.div className="help-header" variants={item}>
        <motion.div 
          className="icon-container"
          animate={{ 
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1.1, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 4,
            ease: "easeInOut"
          }}
        >
          <FaQuestionCircle className="header-icon" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Gold App User Guide
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Everything you need to navigate the app
        </motion.p>
      </motion.div>

      {/* App Navigation Section */}
      <motion.section 
        className="help-card navigation"
        variants={item}
        whileHover={hoverEffect}
      >
        <div className="card-header">
          <FaHome className="card-icon" />
          <h3>Main Navigation</h3>
        </div>
        <div className="card-content">
          <motion.div className="nav-grid">
            {[
              { icon: <FaHome />, title: "Dashboard", desc: "View portfolio summary" },
              { icon: <FaExchangeAlt />, title: "Transactions", desc: "Buy/sell history" },
              { icon: <FaChartLine />, title: "Market Trends", desc: "Price charts" },
              { icon: <FaUserCog />, title: "Profile", desc: "Account settings" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="nav-item"
                variants={item}
                whileHover="hover"
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <motion.div className="nav-icon" variants={bounce}>
                  {item.icon}
                </motion.div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Key Features Section */}
      <motion.section 
        className="help-card features"
        variants={item}
        whileHover={hoverEffect}
      >
        <div className="card-header">
          <FaBell className="card-icon" />
          <h3>Key Features</h3>
        </div>
        <div className="card-content">
          <motion.ul className="feature-list">
            {[
              "Real-time gold price tracking",
              "Instant buy/sell transactions",
              "Portfolio value calculator",
              "Custom price alerts",
              "Transaction history export"
            ].map((feature, index) => (
              <motion.li
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ x: 5 }}
              >
                {feature}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.section>

      {/* Weight Conversion Section */}
      <motion.section 
        className="help-card"
        variants={item}
        whileHover={hoverEffect}
      >
        <div className="card-header">
          <FaWeight className="card-icon" />
          <h3>Weight Conversion</h3>
        </div>
        <div className="card-content">
          <p>Convert grams to trading units:</p>
          <motion.div 
            className="formula-box"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <code>Weight (g) ÷ 0.8 = Units</code>
          </motion.div>
          <motion.div 
            className="example-box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>Example: 10g ÷ 0.8 = 12.5 units</p>
            <div className="unit-breakdown">
              <motion.div 
                className="unit-item"
                whileHover={{ scale: 1.05 }}
              >
                <strong>Pounds:</strong> Whole number (12)
              </motion.div>
              <motion.div 
                className="unit-item"
                whileHover={{ scale: 1.05 }}
              >
                <strong>Blades:</strong> First decimal (5)
              </motion.div>
              <motion.div 
                className="unit-item"
                whileHover={{ scale: 1.05 }}
              >
                <strong>Matches:</strong> Second decimal (0)
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Value Calculation Section */}
      <motion.section 
        className="help-card"
        variants={item}
        whileHover={hoverEffect}
      >
        <div className="card-header">
          <FaCalculator className="card-icon" />
          <h3>Value Calculation</h3>
        </div>
        <div className="card-content">
          <p>Calculate your gold's value:</p>
          <motion.div 
            className="formula-box highlight"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 0 0px rgba(212, 175, 55, 0.2)",
                "0 0 0 8px rgba(212, 175, 55, 0)",
                "0 0 0 0px rgba(212, 175, 55, 0)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <code>Units × Current Price = Total Value</code>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Example: 12.5 units × $50 = $625
          </motion.p>
        </div>
      </motion.section>

      {/* Transaction Guide */}
      <motion.section 
        className="help-card transaction-guide"
        variants={item}
        whileHover={hoverEffect}
      >
        <div className="card-header">
          <FaFilter className="card-icon" />
          <h3>Transaction Guide</h3>
        </div>
        <div className="card-content">
          <motion.div className="guide-steps">
            <motion.div 
              className="step"
              whileHover={{ x: 5 }}
            >
              <span>1</span>
              <p>Use the date filter <FaFilter /> to find specific transactions</p>
            </motion.div>
            <motion.div 
              className="step"
              whileHover={{ x: 5 }}
            >
              <span>2</span>
              <p>Click <FaFileExport /> to export your history</p>
            </motion.div>
            <motion.div 
              className="step"
              whileHover={{ x: 5 }}
            >
              <span>3</span>
              <p>Tap any transaction for details</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Complete Example Section */}
      <motion.section 
        className="help-card example"
        variants={item}
        whileHover={{
          ...hoverEffect.hover,
          scale: 1.02
        }}
      >
        <div className="card-header">
          <FaCoins className="card-icon" />
          <h3>Complete Example</h3>
        </div>
        <div className="card-content">
          <motion.div className="example-flow">
            <motion.div 
              className="flow-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Input Gold</h4>
                <p>10g gold @ $50/unit</p>
              </div>
            </motion.div>
            <motion.div 
              className="flow-arrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              ↓
            </motion.div>
            <motion.div 
              className="flow-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Convert to Units</h4>
                <p>10 ÷ 0.8 = 12.5 units</p>
              </div>
            </motion.div>
            <motion.div 
              className="flow-arrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              ↓
            </motion.div>
            <motion.div 
              className="flow-step result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Total Value</h4>
                <p>12.5 × 50 = $625</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Help Footer */}
      <motion.footer 
        className="help-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p>Need more help? Contact support@example.com</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Contact Support
        </motion.button>
      </motion.footer>
    </motion.div>
  );
};

export default Help;