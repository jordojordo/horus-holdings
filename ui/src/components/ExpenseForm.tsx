import React from 'react';

import { getServiceConfig } from '@/utils/service';
import FinancialForm from '@/components/FinancialForm';

const ExpenseForm: React.FC = () => {
  const { apiUrl } = getServiceConfig();

  const url = `${ apiUrl }/expense`;

  return <FinancialForm formType="expense" apiUrl={url} />;
};

export default ExpenseForm;
