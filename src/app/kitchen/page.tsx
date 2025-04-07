'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, Order } from '@/lib/supabase';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 设置实时订阅
    const subscription = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    // 初始加载
    fetchOrders();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .in('status', ['pending', 'preparing'])
        .order('created_at');

      if (ordersError) throw new Error(ordersError.message);
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('加载订单时出错');
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: number, status: 'preparing' | 'completed') {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw new Error(error.message);
      
      // 手动更新本地状态，以防实时更新失败
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('更新订单状态时出错');
    }
  }

  function formatOrderTime(createdAt: string) {
    const date = new Date(createdAt);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">厨房视图</h1>
          <Link href="/" className="text-white hover:text-green-100">
            返回首页
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">待处理订单</h2>
          <button 
            onClick={fetchOrders}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
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
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">目前没有待处理的订单</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-lg shadow overflow-hidden border-t-4 ${
                  order.status === 'pending' ? 'border-yellow-500' : 'border-blue-500'
                }`}
              >
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">
                      桌号: {order.table_number}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status === 'pending' ? '新订单' : '准备中'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    时间: {order.created_at ? formatOrderTime(order.created_at) : '未知'}
                  </p>
                </div>

                <div className="p-4">
                  <h4 className="font-medium mb-2">订单详情:</h4>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <div>
                          <span className="font-medium">
                            {item.menu_item?.name || '未知商品'}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            x{item.quantity}
                          </span>
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              备注: {item.notes}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 flex justify-between">
                  {order.status === 'pending' ? (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
                    >
                      开始准备
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                    >
                      完成订单
                    </button>
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