import React from 'react';

import { getServiceConfig } from '../utils/service';
import FinancialForm from './FinancialForm';

const IncomeForm: React.FC = () => {
  const { apiUrl } = getServiceConfig();

  const url = `${ apiUrl }/incomes`;

  return <FinancialForm formType="income" apiUrl={url} />;
};

export default IncomeForm;
