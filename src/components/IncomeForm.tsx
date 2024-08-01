import React from 'react';

import { getWebsocketConfig } from '../utils/service';
import FinancialForm from './FinancialForm';

const IncomeForm: React.FC = () => {
  const { apiUrl } = getWebsocketConfig();

  const url = `${ apiUrl }/incomes`;

  return <FinancialForm formType="income" apiUrl={url} />;
};

export default IncomeForm;
