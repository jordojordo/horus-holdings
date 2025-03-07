import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

import { useSocketContext } from '@/context/SocketContext';
import { getServiceConfig } from '@/utils/service';
import { generateRandomKey } from '@/utils/string';

import FinancialForm from '@/components/FinancialForm';

import '@/assets/style/ItemTable.css';

export interface Item {
  id: number;
  description: string;
  amount: number;
  category: string | null;
  date: string | null;
  recurring: boolean;
  recurrenceType: string | null;
  recurrenceEndDate: string | null;
  customRecurrenceDays: number[] | null;
}

interface ItemTableProps {
  itemType: 'expense' | 'income';
}

const ItemTable: React.FC<ItemTableProps> = ({ itemType }) => {
  const { setOnMessage } = useSocketContext();

  const [items, setItems] = useState<Item[]>([]);
  const [itemToUpdate, setItemToUpdate] = useState<Item | null>(null);
  const [updateKey, setUpdateKey] = useState<number>(0);

  const { apiUrl } = getServiceConfig();

  const fetchItems = useCallback(async() => {
    try {
      const response = await axios.get(`${ apiUrl }/${ itemType }`);

      setItems(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [apiUrl, itemType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    // Listen for NEW
    setOnMessage(`new_${ itemType }`, (payload) => {
      setItems((prev) => [...prev, payload.data]);
    });

    // Listen for UPDATE
    setOnMessage(`update_${ itemType }`, (payload) => {
      setItems((prev) => prev.map((item) => (item.id === payload.data.id ? payload.data : item)));
    });
  }, [itemType, setOnMessage]);

  const handleDelete = async(id: number) => {
    try {
      await axios.delete(`${ apiUrl }/${ itemType }/${ id }`);

      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = (item: Item) => {
    setItemToUpdate(item);
    setUpdateKey((prevKey) => prevKey + 1);
  };

  const closeUpdateModal = () => {
    setItemToUpdate(null);
  };

  return (
    <>
      <div className="table-container">
        <table className="item-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id + generateRandomKey(4)}>
                <td>{item.description}</td>
                <td>{item.amount}</td>
                <td>{item.category || '-'}</td>
                <td>{item.date ?? '-'}</td>
                <td>
                  <Dropdown
                    dropdownRender={() => (
                      <div className='action-dropdown'>
                        <a className="" onClick={() => handleUpdate(item)}>Update</a>
                        <a className="" onClick={() => handleDelete(item.id)}>Delete</a>
                      </div>
                    )}
                  >
                    <a  className='action-dots' onClick={(e) => e.preventDefault()}>
                      <MoreOutlined />
                    </a>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {itemToUpdate && (
        <FinancialForm
          key={updateKey}
          formType={itemType.slice(0, -1) as 'income' | 'expense'}
          apiUrl={`${ apiUrl }/${ itemType }`}
          itemType={itemType}
          itemToUpdate={itemToUpdate}
          closeModal={closeUpdateModal}
        />
      )}
    </>
  );
};

export default ItemTable;
