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
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
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
    startOfDay(subDays(new Date(), 30)),
    endOfDay(new Date())
  ]);
  const [startDate, endDate] = dateRange;

  // Calculate totals
  useEffect(() => {
    const fullTotal = transactions.reduce((sum, t) => sum + (t.totalValue || 0), 0);
    setTotalSpent(fullTotal);
    const filteredTotal = filteredTransactions.reduce((sum, t) => sum + (t.totalValue || 0), 0);
    setFilteredTotal(filteredTotal);
  }, [transactions, filteredTransactions]);

  // Fetch transactions
  useEffect(() => {
    if (!agentId) {
      setLoading(false);
      setError("Please sign in to view history");
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "calculations"),
      where("agentId", "==", agentId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            timestamp: docData.timestamp?.toDate?.() || 
                      (docData.timestamp?.seconds ? new Date(docData.timestamp.seconds * 1000) : new Date())
          };
        });
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [agentId]);

  // Filter transactions
  useEffect(() => {
    if (transactions.length > 0) {
      const filtered = transactions.filter(t => {
        if (!t.timestamp) return false;
        const date = t.timestamp instanceof Date ? t.timestamp : new Date(t.timestamp);
        return date >= startDate && date <= endDate;
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

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setDateRange([
      start ? startOfDay(start) : startOfDay(subDays(new Date(), 30)),
      end ? endOfDay(end) : endOfDay(new Date())
    ]);
  };

  const formatDate = (date) => {
    try {
      return format(date instanceof Date ? date : new Date(date), 'PPpp');
    } catch {
      return 'Invalid date';
    }
  };

  if (!agentId) {
    return (
      <div className="error-message">
        <FaExclamationTriangle /> Please sign in to view history
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <div className="header-content">
          <FaHistory className="header-icon" />
          <h2>Calculation History</h2>
          {agentName && (
            <div className="agent-info">
              <FaUser /> {agentName}
            </div>
          )}
        </div>
        
        <div className="header-controls">
          <button 
            onClick={toggleFilters}
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            aria-expanded={showFilters}
          >
            <FaFilter /> {showFilters ? 'Hide Filters' : 'Filter'}
          </button>
          <button 
            onClick={handleRefresh}
            className="refresh-btn"
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
            className="filter-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              maxDate={new Date()}
              className="date-picker"
              placeholderText="Select date range"
              dateFormat="MMMM d, yyyy"
              withPortal
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="summary-cards">
        <div className="summary-card total-card">
          <FaMoneyBillWave />
          <div>
            <h3>Total Spent</h3>
            <p>{formatCurrency(totalSpent)}</p>
          </div>
        </div>
        
        <div className="summary-card filtered-card">
          <FaMoneyBillWave />
          <div>
            <h3>Filtered Total</h3>
            <p>{formatCurrency(filteredTotal)}</p>
            <small>
              {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
            </small>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>Last updated: {format(lastRefreshed, 'PPpp')}</span>
        {loading && <span className="loading-text">Loading...</span>}
        {filteredTransactions.length > 0 && (
          <span className="results-count">
            Showing {filteredTransactions.length} of {transactions.length}
          </span>
        )}
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions found</p>
          {transactions.length > 0 && (
            <button 
              onClick={() => setDateRange([
                startOfDay(subDays(new Date(), 365)),
                endOfDay(new Date())
              ])}
              className="show-all-btn"
            >
              Show All
            </button>
          )}
        </div>
      ) : (
        <div className="transactions-grid">
          {filteredTransactions.map(transaction => (
            <motion.div
              key={transaction.id}
              className="transaction-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="card-header">
                <FaCoins className="transaction-icon" />
                <span className="transaction-date">
                  <FaCalendarAlt /> {formatDate(transaction.timestamp)}
                </span>
              </div>
              
              <div className="transaction-details">
                <div className="detail-row">
                  <span>Weight:</span>
                  <span>{transaction.weight}g</span>
                </div>
                <div className="detail-row">
                  <span>Price:</span>
                  <span>{formatCurrency(transaction.pricePerUnit)}/unit</span>
                </div>
                <div className="detail-row">
                  <span>Units:</span>
                  <span>{transaction.effectiveUnits}</span>
                </div>
                <div className="detail-row total-row">
                  <span>Total:</span>
                  <span>{formatCurrency(transaction.totalValue)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;