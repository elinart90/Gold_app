import { useEffect, useState, useCallback } from 'react';
import GoldLayout from '../../layouts/GoldLayout';
import { useGoldPrice } from '../../contexts/GoldPriceContext';
import { motion } from 'framer-motion';
import { FaCoins, FaChartLine, FaHistory, FaCalculator, FaUser } from 'react-icons/fa';
import { GiGoldBar } from 'react-icons/gi';
import { formatCurrency } from '../../utils/currencyFormatter';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GoldDashboard = () => {
  const { currentPrice, history, loading, error, agentName } = useGoldPrice();
  const [dailyChange, setDailyChange] = useState(0);
  const [isPositiveChange, setIsPositiveChange] = useState(true);
  const [timeframe, setTimeframe] = useState('daily');
  const [chartData, setChartData] = useState(null);

  const processChartData = useCallback(() => {
    if (history.length === 0) return;

    let labels = [];
    let dataPoints = [];
    const color = isPositiveChange ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)';
    const now = new Date();

    const filteredData = history.filter(item => {
      const itemDate = new Date(item.timestamp);
      switch (timeframe) {
        case 'daily':
          return itemDate.getDate() === now.getDate();
        case 'weekly':
          return itemDate > new Date(now.setDate(now.getDate() - 7));
        case 'monthly':
          return itemDate.getMonth() === now.getMonth();
        default:
          return true;
      }
    }).reverse();

    filteredData.forEach(item => {
      const date = new Date(item.timestamp);
      const label = timeframe === 'daily' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      labels.push(label);
      dataPoints.push(item.price);
    });

    setChartData({
      labels,
      datasets: [{
        label: 'Gold Price',
        data: dataPoints,
        borderColor: color,
        backgroundColor: color,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(255, 206, 86, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    });
  }, [history, timeframe, isPositiveChange]);

  useEffect(() => {
    if (history.length > 0) {
      processChartData();
    }
  }, [history, timeframe, processChartData]);

  useEffect(() => {
    if (history.length > 1) {
      const today = history[0].price;
      const yesterday = history[1].price;
      const change = ((today - yesterday) / yesterday) * 100;
      setDailyChange(change.toFixed(2));
      setIsPositiveChange(change >= 0);
    }
  }, [history]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Price: ${formatCurrency(context.raw)}`
        }
      }
    },
    scales: {
      y: {
        ticks: { callback: (value) => formatCurrency(value) }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  if (error) {
    return (
      <GoldLayout>
        <div className="error-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '3rem', color: 'gold' }}
          >
            <GiGoldBar />
          </motion.div>
          <h3>Error Loading Data</h3>
          <p>{error.message || 'Failed to load gold data'}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </GoldLayout>
    );
  }

  if (loading) {
    return (
      <GoldLayout>
        <div className="loading-container">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '3rem', color: 'gold' }}
          >
            <GiGoldBar />
          </motion.div>
          <p>Loading gold data...</p>
        </div>
      </GoldLayout>
    );
  }

  return (
    <GoldLayout>
      <motion.div
        className="dashboard-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {agentName && (
          <motion.div className="agent-welcome" variants={itemVariants}>
            <div className="agent-info">
              <FaUser className="agent-icon" />
              <div>
                <p className="welcome-text">Welcome back,</p>
                <h2 className="agent-name">{agentName}</h2>
              </div>
            </div>
            <div className="current-date">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </motion.div>
        )}

        <motion.div className="dashboard-header" variants={itemVariants}>
          <h1><FaCoins /> Gold Dashboard</h1>
          <p className="dashboard-subtitle">Track and analyze gold prices in real-time</p>
        </motion.div>
        
        <motion.div className="price-card" variants={itemVariants}>
          <div className="price-display">
            <div className="price-icon">
              <GiGoldBar size={40} />
            </div>
            <div className="price-content">
              <h3>Current Gold Price</h3>
              <motion.p 
                className="current-price"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {formatCurrency(currentPrice)} / unit
              </motion.p>
              {history.length > 1 && (
                <div className={`price-change ${isPositiveChange ? 'positive' : 'negative'}`}>
                  <FaChartLine />
                  <span>{dailyChange}% {isPositiveChange ? '↑' : '↓'}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="dashboard-grid">
          {[
            { icon: <FaCalculator size={24} />, title: 'Gold Calculator', 
              desc: 'Calculate the value of your gold based on current prices', link: '/gold/calculator', className: 'calculator' },
            { icon: <FaHistory size={24} />, title: 'Price History', 
              desc: 'View historical gold price data and trends', link: '/gold/history', className: 'history' },
            { icon: <FaChartLine size={24} />, title: 'Market Analysis', 
              desc: 'Get insights into gold market trends', link: '/gold/analysis', className: 'analysis' },
            { icon: <FaCoins size={24} />, title: 'Gold News', 
              desc: 'Latest news and updates about gold market', link: '/gold/news', className: 'news' }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-card" 
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            >
              <div className={`feature-icon ${feature.className}`}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <a href={feature.link} className="feature-link">Go to {feature.title.split(' ')[0]} →</a>
            </motion.div>
          ))}
        </div>

        {chartData && (
          <motion.div className="gold-chart-container" variants={itemVariants}>
            <div className="chart-header">
              <h3>Price Trend</h3>
              <div className="timeframe-selector">
                {['daily', 'weekly', 'monthly'].map((time) => (
                  <button 
                    key={time}
                    className={timeframe === time ? 'active' : ''}
                    onClick={() => setTimeframe(time)}
                  >
                    {time.charAt(0).toUpperCase() + time.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <motion.div 
              className="chart-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Line data={chartData} options={chartOptions} />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </GoldLayout>
  );
};

export default GoldDashboard;