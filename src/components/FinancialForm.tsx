import React, { useState, useCallback, useEffect, FormEvent } from 'react';
import axios from 'axios';
import {
  Modal,
  Checkbox,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Space,
  message
} from 'antd';
import dayjs from 'dayjs';

import type { DatePickerProps } from 'antd';
import type { Dayjs } from 'dayjs';
import type { Item } from '@/components/ItemTable';

import useAuth from '@/hooks/useAuth';
import { useTheme, THEME } from '@/context/ThemeContext';
import { Expense } from '@/types/Expense';
import { Income } from '@/types/Income';

import '@/assets/style/FinancialForm.css';

const { Option } = Select;

// A separate component to handle the recurrence fields
interface RecurringSectionProps {
  recurrenceType: string | null;
  onRecurrenceTypeChange: (value: string) => void;
  recurrenceEndDate: Dayjs | null;
  onRecurrenceEndDateChange: DatePickerProps['onChange'];
  customRecurrenceDays: string;
  onCustomRecurrenceDaysChange: (value: string) => void;
}

const RecurringSection: React.FC<RecurringSectionProps> = ({
  recurrenceType,
  onRecurrenceTypeChange,
  recurrenceEndDate,
  onRecurrenceEndDateChange,
  customRecurrenceDays,
  onCustomRecurrenceDaysChange,
}) => {
  return (
    <>
      <Form.Item
        name="recurrenceType"
        label="Recurrence Type"
        rules={[{
          required: true,
          message:  'Please select a recurrence type'
        }]}
      >
        <Select value={recurrenceType || undefined} onChange={onRecurrenceTypeChange}>
          <Option value="bi-weekly">Bi-Weekly</Option>
          <Option value="monthly">Monthly</Option>
          <Option value="bi-monthly">Bi-Monthly</Option>
          <Option value="custom">Custom</Option>
        </Select>
      </Form.Item>
      <Form.Item name="recurrenceEndDate" label="Recurrence End Date">
        <DatePicker value={recurrenceEndDate} onChange={onRecurrenceEndDateChange} />
      </Form.Item>
      {recurrenceType === 'custom' && (
        <Form.Item
          name="customRecurrenceDays"
          label="Custom Recurrence Days (comma-separated)"
        >
          <Input
            placeholder="e.g., 1,15"
            value={customRecurrenceDays}
            onChange={(e) => onCustomRecurrenceDaysChange(e.target.value)}
          />
        </Form.Item>
      )}
    </>
  );
};

interface FinancialFormProps {
  formType: 'income' | 'expense';
  apiUrl: string;
  itemType?: 'expense' | 'income';
  additionalFields?: React.JSX.Element;
  itemToUpdate?: Item;
  closeModal?: () => void;
}

const FinancialForm: React.FC<FinancialFormProps> = ({
  formType,
  apiUrl,
  additionalFields,
  itemToUpdate,
  closeModal,
}) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<string | null>(null);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Dayjs | null>(null);
  const [customRecurrenceDays, setCustomRecurrenceDays] = useState<string>('');

  const colors = {
    backgroundColor: currentTheme === THEME.LIGHT ? '#CFC5BF' : '#594a4e',
    color:           currentTheme === THEME.LIGHT ? '#33272a' : '#fffffe',
  };

  const modalStyles = {
    header:  { backgroundColor: colors.backgroundColor },
    body:    { backgroundColor: colors.backgroundColor },
    content: { backgroundColor: colors.backgroundColor },
  };

  const resetForm = useCallback(() => {
    setDescription('');
    setAmount(0);
    setDate(null);
    setCategory(null);
    setRecurring(false);
    setRecurrenceType(null);
    setRecurrenceEndDate(null);
    setCustomRecurrenceDays('');
  }, [formType, user]);

  useEffect(() => {
    if (itemToUpdate) {
      const itemDate = dayjs(itemToUpdate.date);
      const itemRecurrenceEndDate = dayjs(itemToUpdate.recurrenceEndDate);

      setDescription(itemToUpdate.description);
      setAmount(itemToUpdate.amount);
      setDate(itemDate.isValid() ? itemDate : null);
      setCategory(itemToUpdate.category);
      setRecurring(itemToUpdate.recurring);
      setRecurrenceType(itemToUpdate.recurrenceType);
      setRecurrenceEndDate(itemRecurrenceEndDate.isValid() ? itemRecurrenceEndDate : null);
      if (itemToUpdate.customRecurrenceDays && Array.isArray(itemToUpdate.customRecurrenceDays)) {
        setCustomRecurrenceDays(itemToUpdate.customRecurrenceDays.join(','));
      } else {
        setCustomRecurrenceDays('');
      }
      setModalVisible(true);
    } else {
      resetForm();
    }
  }, [itemToUpdate, resetForm]);

  const handleModalVisible = (e: FormEvent) => {
    e.preventDefault();
    resetForm();
    setModalVisible(false);
  };

  const handleSubmit = async() => {
    try {
      // If "custom" recurrence is selected, parse the custom days string into an array of numbers.
      let parsedCustomRecurrenceDays: number[] | undefined = undefined;

      if (recurrenceType === 'custom' && customRecurrenceDays) {
        parsedCustomRecurrenceDays = customRecurrenceDays
          .split(',')
          .map((day) => parseInt(day.trim()))
          .filter((day) => !isNaN(day));
      }

      const data: Income | Expense = {
        description,
        amount,
        category,
        date,
        recurring,
        recurrenceType,
        recurrenceEndDate,
        ...(recurrenceType === 'custom' && { customRecurrenceDays: parsedCustomRecurrenceDays })
      };

      if (itemToUpdate) {
        data.id = itemToUpdate.id;
        await axios.put(`${ apiUrl }/${ data.id }`, data);
      } else {
        await axios.post(apiUrl, data);
      }

      resetForm();
      setModalVisible(false);

      if (itemToUpdate && closeModal) {
        closeModal();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          message.error(error.response.data.error);
        } else if (error.response.status === 401) {
          message.error('You are not authorized to perform this action');
        } else {
          message.error('An unexpected error occurred');
        }
      } else {
        message.error('An unexpected error occurred');
      }
    }
  };

  const handleDateChange: DatePickerProps['onChange'] = (date) => {
    setDate(date || null);
  };

  const handleRecurrenceEndDateChange: DatePickerProps['onChange'] = (date) => {
    setRecurrenceEndDate(date || null);
  };

  return (
    <>
      {!itemToUpdate && (
        <button className="btn text-bold mt-5 mb-5" onClick={() => setModalVisible(true)}>
          Add {formType.charAt(0).toUpperCase() + formType.slice(1)}
        </button>
      )}
      <Modal
        open={modalVisible}
        title={itemToUpdate ? `Update ${ formType }` : `Add ${ formType }`}
        onCancel={(e) => handleModalVisible(e)}
        destroyOnClose
        centered
        styles={modalStyles}
        footer={() => (
          <Form.Item>
            <button className="btn text-bold mr-4" onClick={(e) => handleModalVisible(e)}>
              Cancel
            </button>
            <button className="btn text-bold mt-5 mb-5" onClick={() => handleSubmit()}>
              {itemToUpdate ? 'Save' : 'Add'}
            </button>
          </Form.Item>
        )}
      >
        <Form
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            description,
            amount,
            date,
            recurring,
            recurrenceType,
            recurrenceEndDate,
            category,
            customRecurrenceDays,
          }}
        >
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{
                required: true,
                message:  'Please enter a description'
              }]}
            >
              <Input
                onChange={(e) => setDescription(e.target.value)}
                value={description}
              />
            </Form.Item>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{
                required: true,
                message:  'Please enter an amount'
              }]}
            >
              <InputNumber
                onChange={(e) => setAmount(e as number)}
                value={amount}
              />
            </Form.Item>
            <Form.Item name="date" label="Date">
              <DatePicker value={date} onChange={handleDateChange} />
            </Form.Item>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ message: 'Please enter a category' }]}
            >
              <Input
                onChange={(e) => setCategory(e.target.value)}
                value={category || undefined}
              />
            </Form.Item>
            <Form.Item name="recurring" valuePropName="checked">
              <Checkbox
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
              >
                Recurring
              </Checkbox>
            </Form.Item>
            {recurring && (
              <RecurringSection
                recurrenceType={recurrenceType}
                onRecurrenceTypeChange={setRecurrenceType}
                recurrenceEndDate={recurrenceEndDate}
                onRecurrenceEndDateChange={handleRecurrenceEndDateChange}
                customRecurrenceDays={customRecurrenceDays}
                onCustomRecurrenceDaysChange={setCustomRecurrenceDays}
              />
            )}
            {additionalFields}
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default FinancialForm;
