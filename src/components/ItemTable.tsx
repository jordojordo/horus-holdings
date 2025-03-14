import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Table, Input, Button, Space, Dropdown, ConfigProvider
} from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';

import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { FilterDropdownProps, FilterValue, SorterResult, SortOrder } from 'antd/es/table/interface';

import { useSocketContext } from '@/context/SocketContext';
import { getServiceConfig } from '@/utils/service';

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

interface TableParams {
  filters?: Record<string, FilterValue | null>;
  sortField?: string;
  sortOrder?: SortOrder;
}

const ItemTable: React.FC<ItemTableProps> = ({ itemType }) => {
  const { apiUrl } = getServiceConfig();
  const { setOnMessage } = useSocketContext();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  // For the Update form:
  const [itemToUpdate, setItemToUpdate] = useState<Item | null>(null);
  const [updateKey, setUpdateKey] = useState<number>(0);

  // antd Table parameters (filters, sorters, etc.)
  const tableParams = useRef<TableParams>({});
  const setTableParams = (params: TableParams) => {
    tableParams.current = params;
  };

  // ----------------------------------
  // 1) Fetch data
  // ----------------------------------
  const fetchItems = async() => {
    try {
      setLoading(true);
      const response = await axios.get(`${ apiUrl }/${ itemType }`);

      setItems(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [itemType]);

  // Socket listeners
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

  // ----------------------------------
  // 2) Delete and Update handlers
  // ----------------------------------
  const handleDelete = async(id: number) => {
    try {
      await axios.delete(`${ apiUrl }/${ itemType }/${ id }`);
      setItems((prev) => prev.filter((item) => item.id !== id));
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

  // ----------------------------------
  // 3) Custom search filter for Description
  // ----------------------------------
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: string
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters?: () => void) => {
    clearFilters?.();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: keyof Item): TableColumnType<Item> => ({
    filterDropdown: (props: FilterDropdownProps) => {
      const {
        setSelectedKeys, selectedKeys, confirm, clearFilters, close
      } = props;

      return (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Search ${ dataIndex }`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex as string)
            }
            style={{
              marginBottom: 8,
              display:      'block'
            }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex as string)
              }
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => {
                handleReset(clearFilters);
                confirm({ closeDropdown: false });
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                confirm({ closeDropdown: false });
                setSearchText((selectedKeys as string[])[0]);
                setSearchedColumn(dataIndex as string);
              }}
            >
              Filter
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                close();
              }}
            >
              close
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) => record[dataIndex] ? record[dataIndex]!
      .toString()
      .toLowerCase()
      .includes((value as string).toLowerCase()) : false,
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text: string) => searchedColumn === dataIndex ? (
      <Highlighter
        highlightStyle={{
          backgroundColor: '#ffc069',
          padding:         0
        }}
        searchWords={[searchText]}
        autoEscape
        textToHighlight={text ? text.toString() : ''}
      />
    ) : (
      text
    ),
  });

  // ----------------------------------
  // 4) Table columns
  // ----------------------------------
  const columns: ColumnsType<Item> = [
    {
      title:          'Description',
      dataIndex:      'description',
      key:            'description',
      ...getColumnSearchProps('description'),
      sorter:         (a, b) => a.description.localeCompare(b.description),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title:          'Amount',
      dataIndex:      'amount',
      key:            'amount',
      sorter:         (a, b) => a.amount - b.amount,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title:     'Category',
      dataIndex: 'category',
      key:       'category',
      filters:   [
        ...Array.from(new Set(items.map((item) => item.category || 'Uncategorized'))).map(
          (cat) => ({
            text:  cat,
            value: cat,
          })
        ),
      ],
      onFilter: (value, record) => (record.category || 'Uncategorized') === value,
      width:    '20%',
    },
    {
      title:          'Date',
      dataIndex:      'date',
      key:            'date',
      sorter:         (a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime(),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title:     'Recurring?',
      dataIndex: 'recurring',
      key:       'recurring',
      filters:   [
        {
          text:  'Recurring',
          value: true
        },
        {
          text:  'Not Recurring',
          value: false
        },
      ],
      onFilter: (value, record) => record.recurring === value,
      render:   (recurring) => (recurring ? 'Yes' : 'No'),
      width:    '10%',
    },
    {
      title:  'Actions',
      key:    'actions',
      render: (_text, record) => {
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key:   '1',
                  label: <span onClick={() => handleUpdate(record)}>Update</span>,
                },
                {
                  key:   '2',
                  label: <span onClick={() => handleDelete(record.id)}>Delete</span>,
                },
              ],
            }}
          >
            <a className="action-dots">
              <MoreOutlined style={{ color: 'var(--purple-dark)' }}/>
            </a>
          </Dropdown>
        );
      },
    },
  ];

  // ----------------------------------
  // 5) onChange for sorting/filter/pagination
  // ----------------------------------
  const handleTableChange: TableProps<Item>['onChange'] = (_pagination, filters, sorter) => {
    // If we were doing server-side calls, we’d capture the params here
    // and call the backend with &sort=field&order=asc, etc.
    // For client-side, antd will do it automatically if we define sorter / filters in columns.

    const sortResult = sorter as SorterResult<Item>;

    setTableParams({
      filters,
      sortField: sortResult.field?.toString(),
      sortOrder: sortResult.order,
    });
  };

  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Table: {
              bodySortBg:                  'var(--background-tertiary)',
              borderColor:                 'var(--foreground-secondary)',
              cellFontSize:                14,
              cellPaddingBlock:            16,
              cellPaddingInline:           16,
              expandIconBg:                'var(--background-primary)',
              filterDropdownBg:            'var(--background-secondary)',
              filterDropdownMenuBg:        'var(--background-secondary)',
              fixedHeaderSortActiveBg:     'var(--background-tertiary)',
              footerBg:                    'var(--background-secondary)',
              footerColor:                 'var(--foreground-primary)',
              headerBg:                    'var(--background-secondary)',
              headerBorderRadius:          8,
              headerColor:                 'var(--foreground-primary)',
              headerFilterHoverBg:         'var(--background-tertiary)',
              headerSortActiveBg:          'var(--background-tertiary)',
              headerSortHoverBg:           'var(--background-tertiary)',
              headerSplitColor:            'var(--foreground-secondary)',
              rowExpandedBg:               'var(--background-tertiary)',
              rowHoverBg:                  'var(--blue-medium)',
              rowSelectedBg:               'var(--blue-light)',
              rowSelectedHoverBg:          'var(--blue-medium)',
              stickyScrollBarBg:           'var(--foreground-tertiary)',
              stickyScrollBarBorderRadius: 100,
              colorBgContainer:            'var(--background-secondary)',
              colorText:                   'var(--foreground-primary)',
            },
          },
        }}
      >
        <Table<Item>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={items}
          onChange={handleTableChange}
          pagination={{ pageSize: 10 }}
          style={{
            backgroundColor: 'var(--background-primary)',
            color:           'var(--foreground-primary)',
          }}
        />
      </ConfigProvider>

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
