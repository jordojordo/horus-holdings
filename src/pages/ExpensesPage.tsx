import React from 'react';

import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';

const ExpensesPage: React.FC = () => {
  return (
    <div>
      <h1>Expenses</h1>
      <ExpenseForm />
      <ExpenseList />
    </div>
  );
};

export default ExpensesPage;
