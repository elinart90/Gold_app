import { useState, useEffect, useCallback } from 'react';
import { useGoldPrice } from '../../contexts/GoldPriceContext';
import {
  FaHistory,
  FaUser,
  FaCoins,
  FaCalendarAlt,
  FaSync,
  FaExclamationTriangle,
  FaFilter,
  FaMoneyBillWave,
  FaFileExcel
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/currencyFormatter';
import { format, subDays, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import * as XLSX from 'xlsx';
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
  const [startDate, setStartDate] = useState(startOfDay(subDays(new Date(), 30)));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [isExporting, setIsExporting] = useState(false);

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

  const fetchTransactions = useCallback(async () => {
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
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);

      const transactionsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate?.() || 
                        new Date(data.timestamp?.seconds * 1000 || Date.now());

        return {
          id: doc.id,
          ...data,
          timestamp,
          weight: data.weight || 0,
          price: data.price || 0,
          totalValue: data.totalValue || 0,
          pounds: data.pounds || 0,
          blades: data.blades || 0,
          matches: data.matches || 0
        };
      }).filter(transaction => 
        isAfter(transaction.timestamp, startDate) && 
        isBefore(transaction.timestamp, endDate))
        .sort((a, b) => b.timestamp - a.timestamp);

      const total = transactionsData.reduce((sum, t) => sum + (t.totalValue || 0), 0);

      setTransactions(transactionsData);
      setTotalSpent(total);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(`Failed to load calculations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [agentId, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const dataToExport = transactions.map(transaction => ({
        'Date': format(transaction.timestamp, 'PPpp'),
        'Weight (g)': transaction.weight,
        'Price': transaction.price,
        'Total Value': transaction.totalValue,
        'Pounds': transaction.pounds,
        'Blades': transaction.blades,
        'Matches': transaction.matches,
        'Agent': agentName
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `Gold_Transactions_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  const toggleFilters = () => setShowFilters((prev) => !prev);

  const handleStartDateChange = (date) => {
    const newDate = date ? startOfDay(date) : startOfDay(subDays(new Date(), 30));
    setStartDate(newDate);
    if (isAfter(newDate, endDate)) {
      setEndDate(endOfDay(newDate));
    }
  };

  const handleEndDateChange = (date) => {
    const newDate = date ? endOfDay(date) : endOfDay(new Date());
    setEndDate(newDate);
    if (isBefore(newDate, startDate)) {
      setStartDate(startOfDay(newDate));
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return format(date, 'dd/MM/yyyy, HH:mm:ss');
    } catch {
      return 'Invalid date';
    }
  };

  const formatCalculationDisplay = (transaction) => {
    return `${transaction.weight}g @ GHS ${transaction.price.toFixed(2)}\n${formatTimestamp(transaction.timestamp)}\nValue: GHS ${formatCurrency(transaction.totalValue)}\nUnits: ${transaction.pounds}P ${transaction.blades}B ${transaction.matches}M`;
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
            <FaSync className={loading ? 'spinning' : ''} /> Refresh
          </button>
          <button 
            onClick={exportToExcel}
            className="export-button"
            disabled={transactions.length === 0 || loading}
          >
            <FaFileExcel className={isExporting ? 'spinning' : ''} /> Export
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
                <label>Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate}
                  className="date-input"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
              <div className="date-picker-group">
                <label>End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  className="date-input"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
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
        {transactions.length > 0 && (
          <span className="results-count">
            Showing {transactions.length} records
          </span>
        )}
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationTriangle /> {error}
          <button onClick={fetchTransactions} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading calculations...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <p>No calculations found for selected date range</p>
          <button
            onClick={() => {
              setStartDate(startOfDay(subDays(new Date(), 365)));
              setEndDate(endOfDay(new Date()));
            }}
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
                    <span className="transaction-type">Gold Calculation</span>
                    <span className="transaction-date">
                      <FaCalendarAlt /> {formatTimestamp(transaction.timestamp)}
                    </span>
                  </div>
                  <div className="transaction-info">
                    <pre>{formatCalculationDisplay(transaction)}</pre>
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