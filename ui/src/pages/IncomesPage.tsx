import React from 'react';

import IncomeForm from '@/components/IncomeForm';
import IncomeList from '@/components/IncomeList';

const IncomesPage: React.FC = () => {
  return (
    <div>
      <h1>Incomes</h1>
      <IncomeForm />
      <IncomeList />
    </div>
  );
};

export default IncomesPage;
