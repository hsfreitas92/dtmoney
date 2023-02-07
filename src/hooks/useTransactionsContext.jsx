import { createContext, useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';

export const TransactionsContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get('/transactions')
      .then(response => setTransactions(response.data.transactions))
  }, []);

  async function createTransaction(transactionInput) {
    try {
      const response = await api.post('/transactions', {
        ...transactionInput,
        createdAt: new Date(),
      })

      const { transaction } = response.data;

      setTransactions([
        ...transactions,
        transaction,
      ]);
    } catch {
      toast.error('Erro na adição da transação');
    }
  }

  async function removeTransaction(transactionId) {
    try {
      const updatedTransaction = [...transactions];
      const transactionIndex = updatedTransaction.findIndex(transaction => transaction.id === transactionId);
  
      if (transactionIndex < 0) {
        throw new Error('Transaction not found');
      }
  
      updatedTransaction.splice(transactionIndex, 1);
  
      const response = await api.delete(`/transactions/${transactionId}`);
  
      if (!response.data.ok) {
        throw new Error(response.data.message || response.status);
      }
  
      setTransactions(updatedTransaction);
    } catch (error) {
      console.error(error);
      toast.error('Erro na remoção da transação');
    }
  }  

  return (
    <TransactionsContext.Provider value={{ transactions, createTransaction, removeTransaction }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionsContext);

  return context;
}