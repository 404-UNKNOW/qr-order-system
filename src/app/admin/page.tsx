'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, Menu, Table } from '@/lib/supabase';

export default function AdminPage() {
  const [menuItems, setMenuItems] = useState<Menu[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 获取菜品数据
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .order('category');
        
        if (menuError) throw new Error(menuError.message);
        setMenuItems(menuData || []);
        
        // 获取餐桌数据
        const { data: tableData, error: tableError } = await supabase
          .from('tables')
          .select('*')
          .order('table_number');
        
        if (tableError) throw new Error(tableError.message);
        setTables(tableData || []);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('加载数据时出错');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white shadow rounded-lg p-4 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">管理员控制台</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            返回首页
          </Link>
        </header>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b">
            <nav className="flex">
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'menu'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('menu')}
              >
                菜单管理
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'tables'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('tables')}
              >
                餐桌管理
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'orders'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                订单管理
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-10">
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <>
                {activeTab === 'menu' && (
                  <div>
                    <div className="flex justify-between mb-4">
                      <h2 className="text-xl font-semibold">菜单项目</h2>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                        添加菜品
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              名称
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              价格
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              分类
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              状态
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {menuItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  ¥{item.price.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {item.category}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    item.available
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {item.available ? '可用' : '不可用'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                  编辑
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  删除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'tables' && (
                  <div>
                    <div className="flex justify-between mb-4">
                      <h2 className="text-xl font-semibold">餐桌管理</h2>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                        添加餐桌
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tables.map((table) => (
                        <div
                          key={table.id}
                          className="bg-white border rounded-lg shadow-sm p-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">
                              桌号: {table.table_number}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                table.status === 'available'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {table.status === 'available' ? '空闲' : '占用'}
                            </span>
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                              查看二维码
                            </button>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">订单管理</h2>
                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md mb-6">
                      <p className="text-yellow-700">
                        暂时没有活跃订单。订单将在顾客点餐后显示在这里。
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 