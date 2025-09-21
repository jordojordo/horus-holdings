import type { FinancialItem, RecurrencePayload } from '@/types';

import React, { useState, useEffect } from 'react';
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
  message,
} from 'antd';
import dayjs from 'dayjs';

import { useTheme, THEME } from '@/context/ThemeContext';

import RecurrenceBuilder from '@/components/RecurrenceBuilder';

type ItemKind = 'income' | 'expense';

interface FinancialFormProps {
  apiUrl: string;
  visible: boolean;
  onClose: () => void;
  itemToUpdate?: FinancialItem;
  kind: ItemKind;
  additionalFields?: React.JSX.Element;
}

const FinancialForm: React.FC<FinancialFormProps> = ({
  apiUrl, visible, onClose, itemToUpdate, kind, additionalFields
}) => {
  const { currentTheme } = useTheme();

  const colors = {
    backgroundColor: currentTheme === THEME.LIGHT ? '#CFC5BF' : '#594a4e',
    color:           currentTheme === THEME.LIGHT ? '#33272a' : '#fffffe',
  };

  const modalStyles = {
    header:  { backgroundColor: colors.backgroundColor },
    body:    { backgroundColor: colors.backgroundColor },
    content: { backgroundColor: colors.backgroundColor },
  };

  const isUpdate = Boolean(itemToUpdate?.id);
  const [recurring, setRecurring] = useState(false);

  const [form] = Form.useForm();

  const [recurrence, setRecurrence] = useState<RecurrencePayload>({
    recurrenceKind:    'none',
    anchorDate:        dayjs().format('YYYY-MM-DD'),
    timezone:          Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekendAdjustment: 'none',
    includeDates:      [],
    excludeDates:      [],
  });

  useEffect(() => {
    if (isUpdate && itemToUpdate) {
      form.setFieldsValue({
        description: itemToUpdate.description,
        amount:      itemToUpdate.amount,
        category:    itemToUpdate.category || undefined,
        date:        itemToUpdate.date ? dayjs(itemToUpdate.date) : undefined,
      });
      setRecurrence({
        recurrenceKind:    itemToUpdate.recurrenceKind || 'none',
        rrule:             itemToUpdate.rrule || undefined,
        anchorDate:        itemToUpdate.anchorDate || dayjs().format('YYYY-MM-DD'),
        endDate:           itemToUpdate.endDate || null,
        count:             itemToUpdate.count || null,
        timezone:          itemToUpdate.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        weekendAdjustment: itemToUpdate.weekendAdjustment || 'none',
        includeDates:      itemToUpdate.includeDates || [],
        excludeDates:      itemToUpdate.excludeDates || [],
      });
    } else {
      form.resetFields();
      setRecurrence({
        recurrenceKind:    'none',
        anchorDate:        dayjs().format('YYYY-MM-DD'),
        timezone:          Intl.DateTimeFormat().resolvedOptions().timeZone,
        weekendAdjustment: 'none',
        includeDates:      [],
        excludeDates:      [],
      });
    }
  }, [isUpdate, itemToUpdate, form]);

  async function handleSubmit() {
    const values = await form.validateFields();
    const payload = {
      description: values.description,
      amount:      Number(values.amount),
      category:    values.category || null,
      date:        values.date ? values.date.format('YYYY-MM-DD') : null,
      recurrence,
    };

    try {
      if (isUpdate) {
        const id = itemToUpdate?.id;

        if (kind === 'income') {
          await axios.put(`${ apiUrl }/income/${ id }`, payload);
        } else {
          await axios.put(`${ apiUrl }/expense/${ id }`, payload);
        }

        message.success('Updated successfully');
      } else {
        if (kind === 'income') {
          await axios.post(`${ apiUrl }/income`, payload);
        } else {
          await axios.post(`${ apiUrl }/expense`, payload);
        }

        message.success('Created successfully');
      }

      onClose();
    } catch (error: any) {
      console.warn('Save failed: ', error);

      if (error?.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Save failed');
      }
    }
  }

  return (
    <Modal
      open={visible}
      title={isUpdate ? 'Update Item' : 'Add Item'}
      styles={modalStyles}
      centered
      onCancel={onClose}
      onOk={handleSubmit}
      destroyOnHidden
      footer={() => (
        <Form.Item>
          <button
            className="btn text-bold mr-4"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn text-bold mt-5 mb-5"
            onClick={() => handleSubmit()}
          >
            {itemToUpdate ? 'Save' : 'Add'}
          </button>
        </Form.Item>
      )}
      modalRender={(dom) => (
        <Form
          layout="vertical"
          form={form}
          name="form_in_modal"
          initialValues={{ modifier: 'public' }}
          clearOnDestroy
        >
          {dom}
        </Form>
      )}
    >
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="category" label="Category">
          <Select allowClear options={[
            {
              label: 'General',
              value: 'general'
            },
            {
              label: 'Housing',
              value: 'housing'
            },
            {
              label: 'Food',
              value: 'food'
            },
          ]} />
        </Form.Item>
        <Form.Item name="date" label="One-off date (when not recurring)">
          <DatePicker />
        </Form.Item>

        <Form.Item name="recurring" valuePropName="checked">
          <Checkbox
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
          >
            Recurring
          </Checkbox>
        </Form.Item>

        <Space direction="vertical" style={{ width: '100%' }}>
          {recurring && (

            <RecurrenceBuilder
              value={recurrence}
              onChange={setRecurrence}
              previewApiBase={apiUrl}
            />
          )}
          {additionalFields}
        </Space>
      </Space>
    </Modal>
  );
};

export default FinancialForm;
