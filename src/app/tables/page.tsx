'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  async function fetchTables() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number');
      
      if (error) throw new Error(error.message);
      setTables(data || []);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('加载餐桌数据时出错');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-xl font-semibold text-gray-800">餐桌列表</h2>
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
            <p className="text-gray-500">目前没有餐桌信息</p>
            <p className="mt-2 text-sm text-gray-500">请在管理员面板添加餐桌</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div 
                key={table.id} 
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      餐桌 {table.table_number}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        table.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {table.status === 'available' ? '可用' : '已占用'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {table.qr_code ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={table.qr_code}
                        alt={`桌号 ${table.table_number} 的QR码`}
                        className="w-full max-w-[200px] h-auto mx-auto border p-2"
                      />
                      <p className="mt-3 text-center text-sm text-gray-500">
                        扫描此二维码进入点餐页面
                      </p>
                      <div className="mt-3 flex justify-center">
                        <a
                          href={table.qr_code}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 text-sm"
                          download={`table-${table.table_number}-qrcode.png`}
                        >
                          下载QR码
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-gray-500">此餐桌尚未生成QR码</p>
                      <p className="mt-2 text-sm text-gray-500">
                        请在管理员面板为此餐桌生成QR码
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 