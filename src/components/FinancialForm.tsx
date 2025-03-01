import React, { useState, useCallback, useEffect, FormEvent } from 'react';
import axios from 'axios';
import {
  Modal, Checkbox, Form, Input, InputNumber, DatePicker, Select, Space, message
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

interface FinancialFormProps {
  formType: 'income' | 'expense';
  apiUrl: string;
  itemType?: 'expense' | 'income';
  additionalFields?: React.JSX.Element;
  itemToUpdate?: Item;
  closeModal?: () => void;
}

const FinancialForm: React.FC<FinancialFormProps> = ({
  formType, apiUrl, additionalFields, itemToUpdate, closeModal
}) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<Dayjs | null | undefined>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<string | null>(null);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Dayjs | null | undefined>(null);

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
      let data: Income | Expense;

      data = {
        description,
        amount,
        category,
        date,
        recurring,
        recurrenceType,
        recurrenceEndDate
      } as Income | Expense;

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
        if (error?.response?.status === 400) {
          message.error(error.response.data.error);
        } else if (error?.response?.status === 401) {
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
    if (date) {
      setDate(date);
    }
  };

  const handleRecurrenceEndDateChange: DatePickerProps['onChange'] = (date) => {
    if (date) {
      setRecurrenceEndDate(date);
    }
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
          <>
            <Form.Item>
              <button className="btn text-bold mr-4" onClick={(e) => handleModalVisible(e)}>
                Cancel
              </button>
              <button className="btn text-bold mt-5 mb-5" onClick={() => handleSubmit()}>
                {itemToUpdate ? 'Save' : 'Add'}
              </button>
            </Form.Item>
          </>
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
            category
          }}
        >
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Form.Item name="description" label="Description" rules={[{
              required: true,
              message:  'Please enter a description'
            }]}>
              <Input onChange={(e) => setDescription(e.target.value)} />
            </Form.Item>
            <Form.Item name="amount" label="Amount" rules={[{
              required: true,
              message:  'Please enter an amount'
            }]}>
              <InputNumber type="number" onChange={(e) => setAmount(e as number)} />
            </Form.Item>
            <Form.Item name="date" label="Date">
              <DatePicker value={date} onChange={handleDateChange} />
            </Form.Item>
            <Form.Item name="category" label="Category" rules={[{ message: 'Please enter a category' }]}>
              <Input onChange={(e) => setCategory(e.target.value)} />
            </Form.Item>
            <Form.Item name="recurring" valuePropName="checked">
              <Checkbox onChange={(e) => setRecurring(e.target.checked)}>
                Recurring
              </Checkbox>
            </Form.Item>
            {recurring && (
              <>
                <Form.Item name="recurrenceType" label="Recurrence Type" rules={[{
                  required: true,
                  message:  'Please select a recurrence type'
                }]}>
                  <Select onChange={(e) => setRecurrenceType(e)}>
                    <Option value="bi-weekly">Bi-Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="bi-monthly">Bi-Monthly</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="recurrenceEndDate" label="Recurrence End Date">
                  <DatePicker value={recurrenceEndDate} onChange={handleRecurrenceEndDateChange} />
                </Form.Item>
              </>
            )}
            {additionalFields}
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default FinancialForm;
