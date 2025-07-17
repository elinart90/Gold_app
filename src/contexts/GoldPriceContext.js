import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth } from '../services/firebase';
import { doc, getDoc, setDoc, collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const GoldPriceContext = createContext();

export const GoldPriceProvider = ({ children }) => {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [history, setHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // Fetch price history
  const fetchHistory = useCallback(async () => {
    const q = query(
      collection(db, "priceHistory"),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    const historyData = [];
    querySnapshot.forEach((doc) => {
      historyData.push(doc.data());
    });
    setHistory(historyData);
  }, []);

  // Update gold price
  const updatePrice = useCallback(async (newPrice) => {
    await setDoc(doc(db, "goldPrices", "current"), { price: newPrice });
    await setDoc(doc(db, "priceHistory", Date.now().toString()), {
      price: newPrice,
      timestamp: new Date()
    });
    setCurrentPrice(newPrice);
    fetchHistory();
  }, [fetchHistory]);

  // Fetch current gold price
  const fetchCurrentPrice = useCallback(async () => {
    const docRef = doc(db, "goldPrices", "current");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setCurrentPrice(docSnap.data().price);
    }
    setLoading(false);
  }, []);

  // Fetch transactions for the current agent
  const fetchTransactions = useCallback(async () => {
    if (!agentId) return;
    
    setTransactionsLoading(true);
    try {
      const q = query(
        collection(db, "transactions"),
        where("agentId", "==", agentId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const transactionsData = [];
      querySnapshot.forEach((doc) => {
        transactionsData.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  }, [agentId]);

  // Fetch agent data when auth state changes
  const fetchAgentData = useCallback(async (user) => {
    try {
      if (user) {
        const docRef = doc(db, "agents", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAgentName(docSnap.data().agentName || '');
          setAgentId(user.uid);
          fetchTransactions(); // Fetch transactions after setting agent
        }
      } else {
        setAgentName('');
        setAgentId('');
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching agent data:", error);
    }
  }, [fetchTransactions]);

  // Record a new transaction
  const recordTransaction = useCallback(async (transactionData) => {
    try {
      const transactionRef = doc(collection(db, "transactions"));
      await setDoc(transactionRef, {
        ...transactionData,
        agentId,
        agentName,
        timestamp: new Date()
      });
      fetchTransactions(); // Refresh transactions after recording
    } catch (error) {
      console.error("Error recording transaction:", error);
      throw error;
    }
  }, [agentId, agentName, fetchTransactions]);

  // Initialize auth listener and fetch data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchAgentData(user);
    });

    fetchCurrentPrice();
    fetchHistory();

    return () => unsubscribe();
  }, [fetchAgentData, fetchCurrentPrice, fetchHistory]);

  return (
    <GoldPriceContext.Provider value={{ 
      currentPrice, 
      updatePrice, 
      history,
      transactions,
      transactionsLoading,
      recordTransaction,
      fetchTransactions, // Make sure to expose this
      loading,
      agentName,
      agentId
    }}>
      {children}
    </GoldPriceContext.Provider>
  );
};

export const useGoldPrice = () => useContext(GoldPriceContext);