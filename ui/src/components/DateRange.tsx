import type { TimeRangePickerProps } from 'antd';
import type { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { DatePicker, Space } from 'antd';

import '@/assets/style/DateRange.css';

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
  const today = dayjs();
  const oneMonthAgo = dayjs().subtract(1, 'month');

  const [startDate, setStartDate] = useState<Dayjs>(initialStartDate || oneMonthAgo);
  const [endDate, setEndDate] = useState<Dayjs>(initialEndDate || today);

  const onRangeChange = (dates: null | (Dayjs | null)[]) => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);

      if (onDateRangeChange) {
        onDateRangeChange(dates[0], dates[1]);
      }
    }
  };

  const rangePresets: TimeRangePickerProps['presets'] = [
    {
      label: 'Last 1 Year',
      value: [dayjs().subtract(1, 'year'), dayjs()],
    },
    {
      label: 'Last 6 Months',
      value: [dayjs().subtract(6, 'month'), dayjs()],
    },
    {
      label: 'Last 3 Months',
      value: [dayjs().subtract(3, 'month'), dayjs()],
    },
    {
      label: 'Last 30 Days',
      value: [dayjs().subtract(30, 'day'), dayjs()],
    },
    {
      label: 'Last Quarter',
      value: (() => {
        const currentDate = dayjs();
        const currentMonth = currentDate.month(); // 0-indexed month
        const currentQuarter = Math.floor(currentMonth / 3) + 1;
        let start;
        let end;

        if (currentQuarter === 1) {
          // When in Q1, last quarter is Q4 of the previous year.
          start = dayjs().subtract(1, 'year').month(9).date(1); // October 1st
          end = dayjs().subtract(1, 'year').month(11).endOf('month'); // December 31st
        } else {
          // For Q2, Q3, Q4, last quarter falls within the current year.
          start = dayjs().startOf('year').add((currentQuarter - 2) * 3, 'month');
          end = dayjs().startOf('year').add((currentQuarter - 1) * 3, 'month').subtract(1, 'day');
        }

        return [start, end];
      })(),
    },
    {
      label: 'Year-To-Date',
      value: [dayjs().startOf('year'), dayjs()],
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
  ];

  return (
    <div className="range-container">
      <Space direction="vertical" size={12} className="mt-10">
        <div>Date Range:</div>
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
