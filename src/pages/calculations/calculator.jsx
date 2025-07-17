import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoldPrice } from '../../contexts/GoldPriceContext';
import { useTheme } from "../../contexts/ThemeContext";
import { formatCurrency } from '../../utils/currencyFormatter';
import { validateInput } from '../../utils/calculationValidation';
import { db } from '../../services/firebase';
import { collection, doc, setDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { FaCalculator, FaHistory, FaWeight, FaCoins, FaRedo, FaTimes } from 'react-icons/fa';
import './calculator.css';

const GoldCalculator = () => {
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [calculations, setCalculations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const { currentPrice, agentId } = useGoldPrice();
  const [customPrice, setCustomPrice] = useState('');
  const { theme } = useTheme();

  // Fetch calculation history
  useEffect(() => {
    if (!agentId) return;
    
    const q = query(
      collection(db, "calculations"),
      where("agentId", "==", agentId),
      orderBy("timestamp", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const calculationsData = [];
      querySnapshot.forEach((doc) => {
        calculationsData.push({ id: doc.id, ...doc.data() });
      });
      setCalculations(calculationsData);
    });

    return () => unsubscribe();
  }, [agentId]);

  const calculateGoldValue = async () => {
    try {
      validateInput(weight, "Weight");
      const priceToUse = customPrice || currentPrice;
      validateInput(priceToUse, "Price");
      
      const calculatedUnits = parseFloat(weight) / 0.8;
      const effectiveUnits = Math.floor(calculatedUnits * 100) / 100;
      
      const pounds = Math.floor(calculatedUnits);
      const remainingAfterPounds = (calculatedUnits - pounds) * 10;
      const blades = Math.floor(remainingAfterPounds);
      const remainingAfterBlades = (remainingAfterPounds - blades) * 10;
      const matches = Math.floor(remainingAfterBlades);
      
      const totalValue = effectiveUnits * parseFloat(priceToUse);
      
      const calculation = {
        pounds,
        blades,
        matches,
        calculatedUnits: parseFloat(calculatedUnits.toFixed(3)),
        effectiveUnits: parseFloat(effectiveUnits.toFixed(2)),
        totalValue,
        weight: parseFloat(weight),
        price: priceToUse,
        timestamp: new Date(),
        agentId
      };
      
      setResult(calculation);
      await saveCalculation(calculation);
      setError('');
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  const resetCalculator = () => {
    setWeight('');
    setCustomPrice('');
    setResult(null);
    setError('');
  };

  const saveCalculation = async (calculation) => {
    try {
      await setDoc(doc(collection(db, "calculations")), {
        ...calculation,
        timestamp: new Date()
      });
    } catch (err) {
      console.error("Error saving calculation:", err);
      setError("Failed to save calculation");
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <motion.div 
      className={`calculator-container ${theme}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="calculator-header"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FaCalculator className="header-icon" />
        <h2>Gold Value Calculator</h2>
        <p>Calculate your gold's worth based on current market prices</p>
        <button 
          onClick={toggleHistory}
          className="history-toggle"
        >
          <FaHistory /> {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </motion.div>

      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {showHistory && (
          <motion.div 
            className="history-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Calculation History</h3>
            {calculations.length === 0 ? (
              <p>No calculations yet</p>
            ) : (
              <ul className="history-list">
                {calculations.map((calc) => (
                  <li key={calc.id} className="history-item">
                    <div className="history-item-header">
                      <span>{calc.weight}g @ {formatCurrency(calc.price)}</span>
                      <span>{new Date(calc.timestamp?.seconds * 1000).toLocaleString()}</span>
                    </div>
                    <div className="history-item-details">
                      <span>Value: {formatCurrency(calc.totalValue)}</span>
                      <span>Units: {calc.effectiveUnits}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="input-section">
        <div className="input-group">
          <label>
            <FaWeight className="input-icon" />
            Weight (grams)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight in grams"
            className="gold-input"
            step="0.001"
            min="0"
          />
          <small className="input-hint">Enter weight to 3 decimal places</small>
        </div>
        
        <div className="input-group">
          <label>
            <FaCoins className="input-icon" />
            Current Price
          </label>
          <div className="price-display">
            {formatCurrency(currentPrice)} / unit
          </div>
          <input
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="Override current price"
            className="gold-input"
            step="0.01"
            min="0"
          />
        </div>
        
        <div className="button-group">
          <motion.button 
            onClick={calculateGoldValue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="calculate-button"
            disabled={!weight}
          >
            Calculate Value
          </motion.button>
          
          <motion.button 
            onClick={resetCalculator}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="clear-button"
          >
            <FaTimes /> Clear
          </motion.button>
          
          {result && (
            <motion.button 
              onClick={resetCalculator}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="recalculate-button"
            >
              <FaRedo /> New Calculation
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            className="result-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>
              <FaCoins className="result-icon" />
              Calculation Results
            </h3>
            
            <div className="calculation-breakdown">
              <div className="breakdown-step">
                <span>Weight Calculation:</span>
                <span>{weight}g ÷ 0.8 = {result.calculatedUnits.toFixed(3)} units</span>
              </div>
              <div className="breakdown-step">
                <span>Effective Units:</span>
                <span>{result.effectiveUnits.toFixed(2)} (0.005 ignored)</span>
              </div>
              <div className="breakdown-step">
                <span>Breakdown:</span>
                <span>{result.pounds} pounds, {result.blades} blades, {result.matches} matches</span>
              </div>
            </div>
            
            <div className="result-grid">
              <motion.div 
                className="result-card"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="result-label">Pounds</div>
                <div className="result-value">{result.pounds}</div>
              </motion.div>
              
              <motion.div 
                className="result-card"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="result-label">Blades</div>
                <div className="result-value">{result.blades}</div>
              </motion.div>
              
              <motion.div 
                className="result-card"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="result-label">Matches</div>
                <div className="result-value">{result.matches}</div>
                <small className="matches-note">(Not used in calculation)</small>
              </motion.div>
              
              <motion.div 
                className="result-card"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="result-label">Effective Units</div>
                <div className="result-value">{result.effectiveUnits.toFixed(2)}</div>
              </motion.div>
            </div>
            
            <motion.div 
              className="total-value"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="total-label">Total Value</div>
              <div className="total-amount">
                {formatCurrency(result.totalValue)}
              </div>
              <div className="calculation-note">
                Calculated as: {result.effectiveUnits.toFixed(2)} × {formatCurrency(customPrice || currentPrice)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GoldCalculator;