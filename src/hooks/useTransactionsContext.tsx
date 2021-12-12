import { createContext, useEffect, useState, ReactNode, useContext } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: string;
  category: string;
  createdAt: string;
}

type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;

interface TransactionsProviderProps {
  children: ReactNode;
}

interface TransactionContextData {
  transactions: Transaction[];
  createTransaction: (transaction: TransactionInput) => Promise<void>;
  removeTransaction: (transactionId: number) => void;
}

export const TransactionsContext = createContext<TransactionContextData>(
  {} as TransactionContextData
);

export function TransactionProvider({ children }: TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.get('/transactions')
      .then(response => setTransactions(response.data))

  }, []);

  async function createTransaction(transactionInput: TransactionInput) {
    try {
      const response = await api.post('/transactions', {
        ...transactionInput,
        createdAt: new Date(),
      })

      const transaction = response.data;

      setTransactions([
        ...transactions,
        transaction,
      ]);
    } catch {
      toast.error('Erro na adição da transação');
    }
  }

  async function removeTransaction(transactionId: number) {
    try {
      const updatedTransaction = [...transactions];
      const transactionIndex = updatedTransaction.findIndex(transaction => transaction.id === transactionId);

      if (transactionIndex >= 0) {
        updatedTransaction.splice(transactionIndex, 1);
      } else {
        throw Error();
      }

      const response = await api.delete('/transactions/' + transactionId)

      // check for error response
      if (response.data.ok) {
        // get error message from body or default to response status
        const error = (response.data && response.data.message) || response.status;
        return Promise.reject(error);
      }

      setTransactions(updatedTransaction);
    } catch {
      toast.error('Erro na remoção da transação');
    }

  };

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