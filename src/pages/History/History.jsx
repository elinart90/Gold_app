import { useState, useEffect } from 'react';
import { useGoldPrice } from '../../contexts/GoldPriceContext';
import { 
  FaHistory, 
  FaUser, 
  FaCoins, 
  FaCalendarAlt,
  FaSync,
  FaExclamationTriangle,
  FaFilter,
  FaMoneyBillWave
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/currencyFormatter';
import { format, subDays, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './History.css';

const TransactionHistory = () => {
  const { agentId, agentName } = useGoldPrice();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState([
    startOfDay(subDays(new Date(), 30)), // Default: last 30 days
    endOfDay(new Date())
  ]);
  const [startDate, endDate] = dateRange;

  // Calculate totals whenever transactions or filters change
  useEffect(() => {
    const fullTotal = transactions.reduce((sum, transaction) => sum + (transaction.totalValue || 0), 0);
    setTotalSpent(fullTotal);
    
    const currentFilteredTotal = filteredTransactions.reduce((sum, transaction) => sum + (transaction.totalValue || 0), 0);
    setFilteredTotal(currentFilteredTotal);
  }, [transactions, filteredTransactions]);

  // Fetch transactions from Firestore
  useEffect(() => {
    if (!agentId) {
      setLoading(false);
      setError("Agent ID not found. Please sign in again.");
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "calculations"),
      where("agentId", "==", agentId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const transactionsData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let timestamp;
          
          // Handle timestamp conversion
          if (data.timestamp?.toDate) {
            timestamp = data.timestamp.toDate();
          } else if (data.timestamp?.seconds) {
            timestamp = new Date(data.timestamp.seconds * 1000);
          } else {
            timestamp = new Date(data.timestamp);
          }

          transactionsData.push({ 
            id: doc.id, 
            ...data,
            timestamp,
            type: "calculation",
            pricePerUnit: data.price
          });
        });
        
        setTransactions(transactionsData);
        setLoading(false);
        setLastRefreshed(new Date());
      },
      (error) => {
        console.error("Error fetching transactions:", error);
        setError("Failed to load calculations. Please check your connection.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [agentId]);

  // Filter transactions by date range
  useEffect(() => {
    if (transactions.length > 0) {
      const filtered = transactions.filter(transaction => {
        if (!transaction.timestamp) return false;
        
        // Ensure we have a proper Date object
        const transactionDate = transaction.timestamp instanceof Date ? 
          transaction.timestamp : 
          new Date(transaction.timestamp);
          
        // Compare dates without time components
        const transactionDay = startOfDay(transactionDate);
        const startDay = startOfDay(startDate);
        const endDay = endOfDay(endDate);

        return transactionDay >= startDay && transactionDay <= endDay;
      });
      
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions([]);
    }
  }, [transactions, startDate, endDate]);

  const handleRefresh = () => {
    setLastRefreshed(new Date());
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return format(date, 'PPpp');
    } catch {
      return 'Invalid date';
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setDateRange([
      start ? startOfDay(start) : startOfDay(subDays(new Date(), 30)),
      end ? endOfDay(end) : endOfDay(new Date())
    ]);
  };

  const transactionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { opacity: 0, x: -50 }
  };

  if (!agentId) {
    return (
      <div className="transaction-history">
        <div className="error-message">
          <FaExclamationTriangle /> Please sign in to view history
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <div className="header-title">
          <FaHistory size={24} />
          <h2>Calculation History</h2>
          {agentName && (
            <div className="agent-info">
              <FaUser /> {agentName}
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <button onClick={toggleFilters} className="filter-button">
            <FaFilter /> {showFilters ? 'Hide Filters' : 'Filter'}
          </button>
          <button 
            onClick={handleRefresh}
            className="refresh-button"
            disabled={loading}
          >
            <FaSync className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Total Spending Summary */}
      <div className="total-summary-container">
        <div className="total-summary-card">
          <FaMoneyBillWave className="summary-icon" />
          <div className="summary-details">
            <span className="summary-label">Total Spent (All Time)</span>
            <span className="summary-amount">{formatCurrency(totalSpent)}</span>
          </div>
        </div>
        
        <div className="total-summary-card">
          <FaMoneyBillWave className="summary-icon" />
          <div className="summary-details">
            <span className="summary-label">Total Spent (Filtered)</span>
            <span className="summary-amount">{formatCurrency(filteredTotal)}</span>
            <small className="date-range">
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </small>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="date-filter-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="date-range-picker">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
                maxDate={new Date()}
                isClearable
                placeholderText="Select date range"
                className="date-range-input"
                dateFormat="MMMM d, yyyy"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="last-refreshed">
        Last updated: {format(lastRefreshed, 'PPpp')}
        {loading && ' (Loading...)'}
        {filteredTransactions.length > 0 && (
          <span className="results-count">
            Showing {filteredTransactions.length} of {transactions.length} records
          </span>
        )}
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <p>Loading calculations...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <p>No calculations found for selected date range</p>
          {transactions.length > 0 && (
            <button 
              onClick={() => setDateRange([
                startOfDay(subDays(new Date(), 365)),
                endOfDay(new Date())
              ])}
              className="show-all-button"
            >
              Show All Transactions
            </button>
          )}
        </div>
      ) : (
        <div className="transactions-list">
          <AnimatePresence>
            {filteredTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                className="transaction-card"
                variants={transactionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <div className="transaction-icon">
                  <FaCoins />
                </div>
                <div className="transaction-details">
                  <div className="transaction-meta">
                    <span className="transaction-type calculation">
                      Gold Calculation
                    </span>
                    <span className="transaction-date">
                      <FaCalendarAlt /> {formatTimestamp(transaction.timestamp)}
                    </span>
                  </div>
                  <div className="transaction-amount">
                    <div>
                      <span className="label">Weight:</span>
                      <span>{transaction.weight}g</span>
                    </div>
                    <div>
                      <span className="label">Price:</span>
                      <span>{formatCurrency(transaction.pricePerUnit)}/unit</span>
                    </div>
                    <div>
                      <span className="label">Units:</span>
                      <span>{transaction.effectiveUnits}</span>
                    </div>
                    <div className="total-amount">
                      <span className="label">Total:</span>
                      <span>{formatCurrency(transaction.totalValue)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;