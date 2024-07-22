import React from 'react';

import FinancialForm from './FinancialForm';

const ExpenseForm: React.FC = () => {
  const apiUrl = `${ import.meta.env.VITE_API_URL }/api/expenses`;

  return <FinancialForm formType="expense" apiUrl={apiUrl} />;
};

export default ExpenseForm;
