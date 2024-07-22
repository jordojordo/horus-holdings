import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

import { useWebSocketContext } from '../context/WebSocketContext';

import FinancialForm from './FinancialForm';

import '../assets/style/ItemTable.css';

export interface Item {
  id: number;
  description: string;
  amount: number;
  category?: string | null;
  date: string | null;
  recurring: boolean;
  recurrenceType: string | null;
  recurrenceEndDate: string | null;
}

interface ItemTableProps {
  itemType: 'expenses' | 'incomes';
}

const ItemTable: React.FC<ItemTableProps> = ({ itemType }) => {
  const { setOnMessage } = useWebSocketContext();

  const [items, setItems] = useState<Item[]>([]);
  const [itemToUpdate, setItemToUpdate] = useState<Item | null>(null);
  const [updateKey, setUpdateKey] = useState<number>(0);

  const apiUrl = `${ import.meta.env.VITE_API_URL }/api`;

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

  const handleItemChange = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      const t = message.type.split('_')[1];

      if ( message.type === `new_${ t }` ) {
        setItems((prevItems) => [...prevItems, message.data]);
      }

      if ( message.type === `update_${ t }` ) {
        setItems((prevItems) => prevItems.map((item) => {
          if ( item.id === message.data.id ) {
            return {
              ...item,
              ...message.data
            };
          }

          return item;
        }));
      }
    },
    []
  );

  useEffect(() => {
    setOnMessage(handleItemChange);
  }, [handleItemChange, setOnMessage]);

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
      <table className="item-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            {itemType === 'expenses' && <th>Category</th>}
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{item.amount}</td>
              {itemType === 'expenses' && <td>{item.category}</td>}
              <td>{item.date}</td>
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
