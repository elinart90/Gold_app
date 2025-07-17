import { useState, useEffect } from 'react';
import { useGoldPrice } from '../../contexts/GoldPriceContext';
import { 
  FaHistory, 
  FaUser, 
  FaCoins, 
  FaCalendarAlt,
  FaSync,
  FaExclamationTriangle,
  FaFilter
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/currencyFormatter';
import { format, subDays, isWithinInterval } from 'date-fns';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState([
    subDays(new Date(), 7), // Default: last 7 days
    new Date()
  ]);
  const [startDate, endDate] = dateRange;

  // Fetch transactions from Firestore
  useEffect(() => {
    if (!agentId || agentId === "") {
      setLoading(false);
      setError("Agent ID not found. Please sign in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, "calculations"),
        where("agentId", "==", agentId),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const transactionsData = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            transactionsData.push({ 
              id: doc.id, 
              ...data,
              type: "calculation",
              pricePerUnit: data.price,
              timestamp: data.timestamp?.toDate?.() || data.timestamp
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
    } catch (err) {
      console.error("Error setting up listener:", err);
      setError("Error initializing data listener");
      setLoading(false);
    }
  }, [agentId]);

  // Filter transactions by date range
  useEffect(() => {
    if (transactions.length > 0) {
      const filtered = transactions.filter(transaction => {
        if (!transaction.timestamp) return false;
        const transactionDate = transaction.timestamp instanceof Date ? 
          transaction.timestamp : new Date(transaction.timestamp);
        return isWithinInterval(transactionDate, {
          start: startDate,
          end: endDate
        });
      });
      setFilteredTransactions(filtered);
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

  const transactionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { opacity: 0, x: -50 }
  };

  if (!agentId || agentId === "") {
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
          <button 
            onClick={toggleFilters}
            className="filter-button"
          >
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
              <div className="date-picker-group">
                <label>From:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setDateRange([date, endDate])}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={new Date()}
                  className="date-picker-input"
                />
              </div>
              <div className="date-picker-group">
                <label>To:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setDateRange([startDate, date])}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  className="date-picker-input"
                />
              </div>
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
                  <div className="transaction-amount compact">
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