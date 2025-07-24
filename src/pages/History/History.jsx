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
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './History.css';

const TransactionHistory = () => {
  const { agentId, agentName } = useGoldPrice();
  const [transactions, setTransactions] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState([
    startOfDay(subDays(new Date(), 30)),
    endOfDay(new Date())
  ]);

  const [startDate, endDate] = dateRange;

  const transactionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { opacity: 0, x: -50 }
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return 'Invalid range';
    if (start.getTime() === end.getTime()) return format(start, 'MMMM d, yyyy');
    if (start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const fetchTransactions = async () => {
    if (!agentId) {
      setLoading(false);
      setError('Please sign in to view history');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'calculations'),
        where('agentId', '==', agentId),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);

      const transactionsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate?.()
          ? data.timestamp.toDate()
          : new Date(data.timestamp?.seconds ? data.timestamp.seconds * 1000 : Date.now());

        return {
          id: doc.id,
          ...data,
          timestamp,
          type: 'calculation',
          pricePerUnit: data.price
        };
      });

      const total = transactionsData.reduce((sum, t) => sum + (t.totalValue || 0), 0);

      setTransactions(transactionsData);
      setTotalSpent(total);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load calculations');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
    setLastRefreshed(new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, startDate, endDate]);

  const handleRefresh = () => {
    fetchTransactions();
    setLastRefreshed(new Date());
  };

  const toggleFilters = () => setShowFilters((prev) => !prev);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setDateRange([
      start ? startOfDay(start) : startOfDay(subDays(new Date(), 30)),
      end ? endOfDay(end) : endOfDay(new Date())
    ]);
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return format(date, 'PPpp');
    } catch {
      return 'Invalid date';
    }
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
          <button onClick={handleRefresh} className="refresh-button" disabled={loading}>
            <FaSync className={loading ? 'spinning' : ''} /> Refresh
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

      <div className="total-summary-container">
        <div className="total-summary-card">
          <FaMoneyBillWave className="summary-icon" />
          <div className="summary-details">
            <span className="summary-label">Total Spent</span>
            <span className="summary-amount">{formatCurrency(totalSpent)}</span>
            <small className="date-range">{formatDateRange(startDate, endDate)}</small>
          </div>
        </div>
      </div>

      <div className="last-refreshed">
        Last updated: {format(lastRefreshed, 'PPpp')}
        {loading && ' (Loading...)'}
        {!loading && transactions.length > 0 && (
          <span className="results-count">Showing {transactions.length} records</span>
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
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <p>No calculations found for selected date range</p>
          <button
            onClick={() =>
              setDateRange([
                startOfDay(subDays(new Date(), 365)),
                endOfDay(new Date())
              ])
            }
            className="show-all-button"
          >
            Show Last Year's Transactions
          </button>
        </div>
      ) : (
        <div className="transactions-list">
          <AnimatePresence>
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                className="transaction-card"
                variants={transactionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="transaction-icon">
                  <FaCoins />
                </div>
                <div className="transaction-details">
                  <div className="transaction-meta">
                    <span className="transaction-type calculation">Gold Calculation</span>
                    <span className="transaction-date">
                      <FaCalendarAlt /> {formatTimestamp(transaction.timestamp)}
                    </span>
                  </div>
                  <div className="transaction-amount">
                    <div>
                      <span className="label">Weight:</span>
                      <span>{transaction.weight || 0}g</span>
                    </div>
                    <div>
                      <span className="label">Price:</span>
                      <span>{formatCurrency(transaction.pricePerUnit || 0)}/unit</span>
                    </div>
                    <div>
                      <span className="label">Units:</span>
                      <span>{transaction.effectiveUnits || 0}</span>
                    </div>
                    <div className="total-amount">
                      <span className="label">Total:</span>
                      <span>{formatCurrency(transaction.totalValue || 0)}</span>
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
