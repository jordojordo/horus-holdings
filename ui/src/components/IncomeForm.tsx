import React, { useState } from 'react';

import { getServiceConfig } from '@/utils/service';
import FinancialForm from '@/components/FinancialForm';

const IncomeForm: React.FC = () => {
  const { apiUrl } = getServiceConfig();

  const [modalVisible, setModalVisible] = useState(false);

  function closeModal() {
    setModalVisible(false);
  }

  return (
    <>
      <button
        className="btn text-bold mt-5 mb-5"
        onClick={() => setModalVisible(true)}
      >
        Add Income
      </button>
      <FinancialForm kind="income" apiUrl={apiUrl} visible={modalVisible} onClose={closeModal} />
    </>
  );
};

export default IncomeForm;
