'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// 定义类型
interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  available: boolean;
}

interface OrderItem {
  id: number;
  order_id: number;
  menu_item?: MenuItem;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: number;
  table_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

interface Table {
  id: number;
  table_number: string;
  status: string;
  qr_code?: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeTab, setActiveTab] = useState('menu');

  // 认证检查
  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth === 'true') {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    
    checkAuth();
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 简单示例，实际应用中应该使用加密存储和验证
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('用户名或密码错误');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  async function fetchData() {
    try {
      // 获取菜单项
      const { data: menuData } = await supabase
        .from('menu_items')
        .select('*')
        .order('category');
      setMenuItems(menuData || []);

      // 获取订单
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .order('created_at', { ascending: false });
      setOrders(ordersData || []);

      // 获取餐桌
      const { data: tablesData } = await supabase
        .from('tables')
        .select('*')
        .order('table_number');
      setTables(tablesData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">管理员登录</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
            >
              登录
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 管理面板UI
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">餐厅管理系统</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchData}
              className="text-white bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
            >
              刷新
            </button>
            <button 
              onClick={handleLogout}
              className="text-white hover:text-blue-200"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* 选项卡导航 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="flex border-b">
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'menu' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('menu')}
            >
              菜单管理
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              订单管理
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'tables' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tables')}
            >
              餐桌管理
            </button>
          </div>
        </div>

        {/* 不同选项卡内容 */}
        {activeTab === 'menu' && (
          <MenuManagement 
            menuItems={menuItems} 
            refreshData={fetchData} 
          />
        )}
        
        {activeTab === 'orders' && (
          <OrderManagement 
            orders={orders} 
          />
        )}
        
        {activeTab === 'tables' && (
          <TableManagement 
            tables={tables} 
            refreshData={fetchData} 
          />
        )}
      </main>
    </div>
  );
}

// 菜单管理组件
interface MenuManagementProps {
  menuItems: MenuItem[];
  refreshData: () => void;
}

function MenuManagement({ menuItems, refreshData }: MenuManagementProps) {
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    available: true
  });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setNewItem({
      ...newItem,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemToSave = {
        ...newItem,
        price: parseFloat(newItem.price)
      };
      
      let result;
      if (editingItem) {
        // 更新
        result = await supabase
          .from('menu_items')
          .update(itemToSave)
          .eq('id', editingItem.id);
      } else {
        // 新增
        result = await supabase
          .from('menu_items')
          .insert(itemToSave);
      }
      
      if (result.error) throw new Error(result.error.message);
      
      // 重置表单和刷新数据
      setNewItem({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category: '',
        available: true
      });
      setEditingItem(null);
      refreshData();
    } catch (err) {
      console.error('Error saving menu item:', err);
      alert('保存菜品时出错');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      image_url: item.image_url || '',
      category: item.category,
      available: item.available
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个菜品吗？')) return;
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      refreshData();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('删除菜品时出错');
    }
  };

  // 按类别分组显示菜单
  const groupedMenuItems = menuItems.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingItem ? '编辑菜品' : '添加新菜品'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                菜品名称
              </label>
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                类别
              </label>
              <input
                type="text"
                name="category"
                value={newItem.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                价格
              </label>
              <input
                type="number"
                name="price"
                value={newItem.price}
                onChange={handleInputChange}
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                图片URL
              </label>
              <input
                type="text"
                name="image_url"
                value={newItem.image_url}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              name="description"
              value={newItem.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              rows={2}
            ></textarea>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="available"
              checked={newItem.available}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              可供应
            </label>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingItem ? '更新' : '添加'}
            </button>
            
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setNewItem({
                    name: '',
                    description: '',
                    price: '',
                    image_url: '',
                    category: '',
                    available: true
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">菜单列表</h2>
        
        {Object.keys(groupedMenuItems).length === 0 ? (
          <p className="text-gray-500 text-center py-4">暂无菜品</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-3">
                  {category}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(item => (
                    <div 
                      key={item.id} 
                      className={`border rounded-lg p-4 ${!item.available ? 'bg-gray-50' : ''}`}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.name}</h4>
                        <span className="text-green-600 font-medium">
                          ¥{item.price.toFixed(2)}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      {!item.available && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                          不可供应
                        </span>
                      )}
                      
                      <div className="flex justify-end space-x-2 mt-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 订单管理组件
interface OrderManagementProps {
  orders: Order[];
}

function OrderManagement({ orders }: OrderManagementProps) {
  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'pending': return '待处理';
      case 'preparing': return '准备中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">订单管理</h2>
      
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-4">暂无订单</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    订单 #{order.id} - 桌号: {order.table_number}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  下单时间: {formatDateTime(order.created_at)}
                </p>
              </div>
              
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">菜品</th>
                      <th className="text-center py-2">数量</th>
                      <th className="text-right py-2">价格</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="py-2">
                          {item.menu_item?.name || '未知商品'}
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-1">备注: {item.notes}</p>
                          )}
                        </td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">¥{item.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} className="py-2 text-right font-medium">总计:</td>
                      <td className="py-2 text-right font-medium">¥{order.total_amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 餐桌管理组件
interface TableManagementProps {
  tables: Table[];
  refreshData: () => void;
}

function TableManagement({ tables, refreshData }: TableManagementProps) {
  const [newTable, setNewTable] = useState({
    table_number: '',
    status: 'available'
  });
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTable({
      ...newTable,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result;
      if (editingTable) {
        // 更新
        result = await supabase
          .from('tables')
          .update(newTable)
          .eq('id', editingTable.id);
      } else {
        // 新增
        result = await supabase
          .from('tables')
          .insert(newTable);
      }
      
      if (result.error) throw new Error(result.error.message);
      
      // 重置表单和刷新数据
      setNewTable({
        table_number: '',
        status: 'available'
      });
      setEditingTable(null);
      refreshData();
    } catch (err) {
      console.error('Error saving table:', err);
      alert('保存餐桌时出错');
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setNewTable({
      table_number: table.table_number,
      status: table.status
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个餐桌吗？')) return;
    
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      refreshData();
    } catch (err) {
      console.error('Error deleting table:', err);
      alert('删除餐桌时出错');
    }
  };

  // 生成餐桌的QR码URL
  const getQRCodeUrl = (tableNumber: string) => {
    // 使用当前网站的域名
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : '';
    
    // 创建完整的点餐URL
    const orderUrl = `${baseUrl}/order/${encodeURIComponent(tableNumber)}`;
    
    // 使用Google Charts API生成QR码
    return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(orderUrl)}`;
  };

  // 更新QR码到数据库
  const updateQrCode = async (tableId: number, tableNumber: string) => {
    try {
      const qrCodeUrl = getQRCodeUrl(tableNumber);
      
      const { error } = await supabase
        .from('tables')
        .update({ qr_code: qrCodeUrl })
        .eq('id', tableId);
        
      if (error) throw new Error(error.message);
      refreshData();
    } catch (err) {
      console.error('Error updating QR code:', err);
      alert('更新QR码时出错');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingTable ? '编辑餐桌' : '添加新餐桌'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                餐桌号
              </label>
              <input
                type="text"
                name="table_number"
                value={newTable.table_number}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                name="status"
                value={newTable.status}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="available">可用</option>
                <option value="occupied">已占用</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingTable ? '更新' : '添加'}
            </button>
            
            {editingTable && (
              <button
                type="button"
                onClick={() => {
                  setEditingTable(null);
                  setNewTable({
                    table_number: '',
                    status: 'available'
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">餐桌列表</h2>
        
        {tables.length === 0 ? (
          <p className="text-gray-500 text-center py-4">暂无餐桌</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map(table => (
              <div key={table.id} className="border rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <h3 className="font-medium">餐桌 {table.table_number}</h3>
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
                
                <div className="space-y-3">
                  {table.qr_code ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={table.qr_code}
                        alt={`桌号 ${table.table_number} 的QR码`}
                        className="w-full max-w-[200px] border p-2"
                      />
                      <button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            // 打开新窗口查看大图
                            window.open(table.qr_code, '_blank');
                          }
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        查看大图
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <p className="text-sm text-gray-500 mb-2">尚未生成QR码</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => updateQrCode(table.id, table.table_number)}
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      {table.qr_code ? '更新QR码' : '生成QR码'}
                    </button>
                    
                    <div className="flex justify-between space-x-2">
                      <button
                        onClick={() => handleEdit(table)}
                        className="flex-1 bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(table.id)}
                        className="flex-1 bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 