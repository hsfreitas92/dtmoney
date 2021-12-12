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
    fetch('http://localhost:3333/transactions')
      .then(response => response.json())
      .then(response => setTransactions(response))

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

  const removeTransaction = (transactionId: number) => {
    try {
      const updatedTransaction = [...transactions];
      const transactionIndex = updatedTransaction.findIndex(transaction => transaction.id === transactionId);

      if (transactionIndex >= 0) {
        updatedTransaction.splice(transactionIndex, 1);
      } else {
        throw Error();
      }

      fetch('http://localhost:3333/transactions/' + transactionId, { method: 'DELETE' })
        .then(async response => {
          const data = await response.json();

          // check for error response
          if (!response.ok) {
            // get error message from body or default to response status
            const error = (data && data.message) || response.status;
            return Promise.reject(error);
          }

          setTransactions(updatedTransaction);
        })
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