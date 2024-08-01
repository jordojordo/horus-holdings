import React from 'react';

import { getWebsocketConfig } from '../utils/service';
import FinancialForm from './FinancialForm';

const ExpenseForm: React.FC = () => {
  const { apiUrl } = getWebsocketConfig();

  const url = `${ apiUrl }/expenses`;

  return <FinancialForm formType="expense" apiUrl={url} />;
};

export default ExpenseForm;
