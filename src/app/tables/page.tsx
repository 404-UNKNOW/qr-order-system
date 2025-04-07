'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, Table } from '@/lib/supabase';

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  async function fetchTables() {
    setLoading(true);
    try {
      const { data, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .order('table_number');

      if (tablesError) throw new Error(tablesError.message);
      setTables(data || []);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('加载餐桌时出错');
    } finally {
      setLoading(false);
    }
  }

  function showQRCode(table: Table) {
    setSelectedTable(table);
    setShowQRModal(true);
  }

  function getOrderUrl(tableNumber: string) {
    // 这里使用相对链接，在生产环境中应该使用完整的URL
    return `/order/${tableNumber}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 text-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">餐桌管理</h1>
          <Link href="/" className="text-white hover:text-purple-100">
            返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">所有餐桌</h2>
          <button
            onClick={fetchTables}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            刷新
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">没有找到餐桌，请在管理员界面添加餐桌</p>
            <Link 
              href="/admin"
              className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              前往管理界面
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold">桌号: {table.table_number}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        table.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {table.status === 'available' ? '空闲' : '使用中'}
                    </span>
                  </div>
                  <button
                    onClick={() => showQRCode(table)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded mt-2"
                  >
                    显示二维码
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 二维码弹窗 */}
      {showQRModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold mb-1">桌号: {selectedTable.table_number}</h3>
              <p className="text-gray-600 text-sm">扫描下方二维码开始点餐</p>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border rounded-lg">
                <QRCodeSVG
                  value={getOrderUrl(selectedTable.table_number)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setShowQRModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 