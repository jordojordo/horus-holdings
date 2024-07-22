import React from 'react';
import FinancialForm from './FinancialForm';

const IncomeForm: React.FC = () => {
  const apiUrl = `${ import.meta.env.VITE_API_URL }/api/incomes`;

  return <FinancialForm formType="income" apiUrl={apiUrl} />;
};

export default IncomeForm;
