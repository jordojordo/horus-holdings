import React from 'react';

import useAuth from '@/hooks/useAuth';

import LoadingSpinner from '@/components/LoadingSpinner';
import FlowChart from '@/components/FlowChart';

const DashboardPage: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <FlowChart />
      </div>
    </div>
  );
};

export default DashboardPage;
