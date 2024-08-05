import type { TimeRangePickerProps } from 'antd';
import type { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Space } from 'antd';

import useViewport from '../hooks/useViewport';

import '../assets/style/DateRange.css';

const { RangePicker } = DatePicker;

interface DateRangePickerProps {
  initialStartDate?: Dayjs;
  initialEndDate?: Dayjs;
  onDateRangeChange?: (start: Dayjs, end: Dayjs) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  initialStartDate,
  initialEndDate,
  onDateRangeChange,
}) => {
  const { width } = useViewport();
  const isMobile = width < 725;

  const today = dayjs();
  const oneMonthAgo = dayjs().subtract(1, 'month');

  const [startDate, setStartDate] = useState<Dayjs>(initialStartDate || oneMonthAgo);
  const [endDate, setEndDate] = useState<Dayjs>(initialEndDate || today);

  const onRangeChange = (dates: null | (Dayjs | null)[]) => {
    if ( dates && dates.length === 2 && dates[0] && dates[1] ) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);

      if ( onDateRangeChange ) {
        onDateRangeChange(dates[0], dates[1]);
      }
    }
  };

  const rangePresets: TimeRangePickerProps['presets'] = [
    {
      label: 'Next 7 Days',
      value: [dayjs(), dayjs().add(7, 'day')],
    },
    {
      label: 'Next 14 Days',
      value: [dayjs(), dayjs().add(14, 'day')],
    },
    {
      label: 'Next 30 Days',
      value: [dayjs(), dayjs().add(30, 'day')],
    },
    {
      label: 'Next 3 Months',
      value: [dayjs(), dayjs().add(3, 'month')],
    },
    {
      label: 'Next 6 Months',
      value: [dayjs(), dayjs().add(6, 'month')],
    },
    {
      label: 'Next 1 Year',
      value: [dayjs(), dayjs().add(1, 'year')],
    },
    {
      label: 'Next 2 Years',
      value: [dayjs(), dayjs().add(2, 'year')],
    }
  ];

  return (
    <div className="range-container">
      <Space direction="vertical" size={12} className="mt-10">
        <div>
          Date Range:
        </div>
        <RangePicker
          presets={rangePresets}
          onChange={onRangeChange}
          defaultValue={[startDate, endDate]}
        />
      </Space>
    </div>
  );
};

export default DateRangePicker;
