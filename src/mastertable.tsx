import React, { useState, useEffect } from 'react';
import { RefreshCw, CreditCard as Edit2, Trash2 } from 'lucide-react';
import Papa from 'papaparse';
import { CSVItem, OrderedCSVItem } from './types';

interface MasterTableProps {
  orderedItems: OrderedCSVItem[];
  setOrderedItems: React.Dispatch<React.SetStateAction<OrderedCSVItem[]>>;
  onEdit?: (item: CSVItem, index: number) => void;
  onDelete?: (index: number) => void;
}

const MasterTable: React.FC<MasterTableProps> = ({ orderedItems, setOrderedItems, onEdit, onDelete }) => {
  const [items, setItems] = useState<CSVItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxaY0FXgYSKVrYoo-1k9bkSQDjZPKwpOnvQbYWB1QW4XT9rwU0GJUq4lN0YLRMXKXS4XHi2MsTfZLM/pub?gid=917352588&single=true&output=csv';

  const fetchCSVData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(CSV_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch CSV data');
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
          }
          setItems(results.data as CSVItem[]);
          setLoading(false);
        },
        error: (error) => {
          setError(`CSV parsing error: ${error.message}`);
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCSVData();
  }, []);

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('cleaning')) return '🧽';
    if (categoryLower.includes('box')) return '📦';
    if (categoryLower.includes('ustensil')) return '🍴';
    if (categoryLower.includes('plastic bag')) return '👜';
    if (categoryLower.includes('kitchen roll')) return '🧻';
    if (categoryLower.includes('cheese')) return '🧀';
    return '📋';
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('cleaning')) return '#ec4899';
    if (categoryLower.includes('box')) return '#f97316';
    if (categoryLower.includes('ustensil')) return '#3b82f6';
    if (categoryLower.includes('plastic bag')) return '#06b6d4';
    if (categoryLower.includes('kitchen roll')) return '#ef4444';
    if (categoryLower.includes('cheese')) return '#eab308';
    return '#6b7280';
  };

  const filteredItems = items.filter(item => 
    searchQuery === '' || 
    item.Item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.default_supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredItems.length > 0) {
        // Add first filtered item to order with quantity 1
        const itemToAdd: OrderedCSVItem = {
          ...filteredItems[0],
          quantity: 1
        };
        setOrderedItems(prev => [...prev, itemToAdd]);
        console.log(`Added "${filteredItems[0].Item_name}" to order with quantity 1`);
      } else if (searchQuery.trim()) {
        // Create new item with search query
        const newItem: OrderedCSVItem = {
          Item_name: searchQuery.trim(),
          category: 'New Item',
          default_supplier: 'Unknown',
          quantity: 1
        };
        setOrderedItems(prev => [...prev, newItem]);
        console.log(`Created new item "${searchQuery.trim()}" and added to order`);
      }
      setSearchQuery('');
    } else if (/^[1-9]$/.test(event.key) && searchQuery && filteredItems.length > 0) {
      event.preventDefault();
      const quantity = parseInt(event.key);
      const itemToAdd: OrderedCSVItem = {
        ...filteredItems[0],
        quantity
      };
      setOrderedItems(prev => [...prev, itemToAdd]);
      console.log(`Added "${filteredItems[0].Item_name}" to order with quantity ${quantity}`);
      setSearchQuery('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8" style={{ color: '#000' }}>
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span>Loading data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8" style={{ color: '#000' }}>
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={fetchCSVData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: '#666' }}>
        No items found in the spreadsheet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold" style={{ color: '#000' }}>Master Table ({items.length} items)</h2>
          <span className="text-sm" style={{ color: '#666' }}>Order: {orderedItems.length} items</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search items... (Enter to add, 1-9 for quantity)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ minWidth: '300px' }}
          />
          <button
            onClick={fetchCSVData}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Default Supplier
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span style={{ color: '#000' }}>{item.Item_name}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span style={{ color: '#000' }}>{item.category}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span style={{ color: '#000' }}>{item.default_supplier}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item, index)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Edit item"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(index)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete item"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasterTable;