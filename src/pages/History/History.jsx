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
  // Initialize start and end dates carefully. subDays(new Date(), 30) gives you
  // exactly 30 days ago at the current time. Using startOfDay and endOfDay
  // makes the date ranges inclusive of the full days.
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
    // Check if start and end dates are the same day (ignoring time)
    if (startOfDay(start).getTime() === startOfDay(end).getTime()) {
      return format(start, 'MMMM d, yyyy');
    }
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
      // Construct the Firestore query with date range filters
      const q = query(
        collection(db, 'calculations'),
        where('agentId', '==', agentId),
        // Add date range filters directly to the query
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc') // Order by timestamp after filtering
      );

      const snapshot = await getDocs(q);

      const transactionsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Ensure timestamp is a proper Date object
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp?.seconds * 1000 || Date.now());

        return {
          id: doc.id,
          ...data,
          timestamp,
          weight: data.weight || 0,
          // Convert price to a number if it's stored as a string
          price: parseFloat(data.price) || 0, 
          totalValue: data.totalValue || 0,
          pounds: data.pounds || 0,
          blades: data.blades || 0,
          matches: data.matches || 0
        };
      });
      // The client-side filter and sort are no longer needed here
      // because Firestore has already filtered and sorted the data.
      // .filter(transaction => 
      //   isAfter(transaction.timestamp, startDate) && 
      //   isBefore(transaction.timestamp, endDate))
      // .sort((a, b) => b.timestamp - a.timestamp);

      const total = transactionsData.reduce((sum, t) => sum + (t.totalValue || 0), 0);

      setTransactions(transactionsData);
      setTotalSpent(total);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching transactions:', err);
      // More user-friendly error message if it's a Firestore error
      if (err.code === 'failed-precondition' && err.message.includes('The query requires an index')) {
          setError(`Failed to load calculations. Please ensure the necessary Firestore index is created. Details: ${err.message}`);
      } else {
          setError(`Failed to load calculations: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [agentId, startDate, endDate]); // Dependencies remain the same

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const dataToExport = transactions.map(transaction => ({
        'Date': format(transaction.timestamp, 'PPpp'),
        'Weight (g)': transaction.weight,
        'Price': transaction.price, // Keep as is or format as string for Excel
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
    // Ensure date is valid and is at the start of the day
    const newDate = date ? startOfDay(date) : startOfDay(subDays(new Date(), 30));
    setStartDate(newDate);
    // Adjust endDate if it becomes before new startDate
    if (isAfter(newDate, endDate)) {
      setEndDate(endOfDay(newDate));
    }
  };

  const handleEndDateChange = (date) => {
    // Ensure date is valid and is at the end of the day
    const newDate = date ? endOfDay(date) : endOfDay(new Date());
    setEndDate(newDate);
    // Adjust startDate if it becomes after new endDate
    if (isBefore(newDate, startDate)) {
      setStartDate(startOfDay(newDate));
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      // Ensure timestamp is a Date object before formatting
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      // Use current locale for formatting for better user experience
      // Alternatively, keep 'dd/MM/yyyy, HH:mm:ss' if that's a strict requirement.
      return format(date, 'dd/MM/yyyy, HH:mm:ss');
    } catch {
      return 'Invalid date';
    }
  };

  const formatCalculationDisplay = (transaction) => {
    // Ensure price is treated as a number for toFixed
    const formattedPrice = parseFloat(transaction.price).toFixed(2);
    return `${transaction.weight}g @ GHS ${formattedPrice}\n${formatTimestamp(transaction.timestamp)}\nValue: GHS ${formatCurrency(transaction.totalValue)}\nUnits: ${transaction.pounds}P ${transaction.blades}B ${transaction.matches}M`;
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
            disabled={transactions.length === 0 || loading || isExporting} // Disable export during export
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
              // Set a wider range for "Show Last Year's Transactions"
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