import React from 'react';
import { Flex, Spin } from 'antd';

import '@/assets/style/LoadingSpinner.css';

const LoadingSpinner: React.FC = () => (
  <Flex align="center" gap="middle" className='loading-container'>
    <Spin size="large" />
  </Flex>
);

export default LoadingSpinner;
