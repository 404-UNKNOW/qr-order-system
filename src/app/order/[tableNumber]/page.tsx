'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase, Menu, OrderItem } from '@/lib/supabase';

type CartItem = OrderItem & {
  menu_item: Menu;
};

type MenuCategory = {
  name: string;
  items: Menu[];
};

export default function OrderPage() {
  const params = useParams();
  const tableNumber = params.tableNumber as string;
  
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    setLoading(true);
    try {
      const { data, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category');

      if (menuError) throw new Error(menuError.message);
      
      // 将菜单分类
      const categorizedMenu: MenuCategory[] = [];
      const categories = new Set<string>();
      
      // 先收集所有分类
      data?.forEach(item => categories.add(item.category));
      
      // 然后为每个分类创建对象
      categories.forEach(category => {
        categorizedMenu.push({
          name: category,
          items: data?.filter(item => item.category === category) || []
        });
      });
      
      setMenuCategories(categorizedMenu);
      
      // 设置默认激活的分类
      if (categorizedMenu.length > 0) {
        setActiveCategory(categorizedMenu[0].name);
      }
      
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('加载菜单时出错');
    } finally {
      setLoading(false);
    }
  }

  function addToCart(menuItem: Menu) {
    setCart(prevCart => {
      // 检查购物车中是否已存在该商品
      const existingItemIndex = prevCart.findIndex(
        item => item.menu_id === menuItem.id
      );

      if (existingItemIndex >= 0) {
        // 如果存在，增加数量
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        // 如果不存在，添加新项目
        return [
          ...prevCart,
          {
            id: Date.now(), // 临时ID
            order_id: 0, // 临时值，提交时会被替换
            menu_id: menuItem.id,
            quantity: 1,
            price: menuItem.price,
            menu_item: menuItem
          }
        ];
      }
    });
  }

  function removeFromCart(itemId: number) {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }

  function updateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  }

  function calculateTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  async function submitOrder() {
    if (cart.length === 0) return;
    
    setOrderSubmitting(true);
    try {
      // 1. 创建订单
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_number: tableNumber,
          status: 'pending',
          total_amount: calculateTotal()
        })
        .select()
        .single();

      if (orderError) throw new Error(orderError.message);
      
      // 2. 添加订单项
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_id: item.menu_id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw new Error(itemsError.message);
      
      // 3. 更新餐桌状态
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('table_number', tableNumber);
        
      if (tableError) throw new Error(tableError.message);
      
      // 订单成功
      setOrderSuccess(true);
      setCart([]);
      
    } catch (err) {
      console.error('Error submitting order:', err);
      alert('提交订单时出错，请重试');
    } finally {
      setOrderSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-orange-500 text-white shadow p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">扫码点餐 - 桌号 {tableNumber}</h1>
          <button 
            className="relative bg-white text-orange-500 px-3 py-1 rounded-full text-sm font-medium"
            onClick={() => setShowCart(true)}
          >
            购物车 ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">正在加载菜单...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col md:flex-row">
          {/* 分类导航 */}
          <div className="md:w-1/4 bg-white shadow-md p-4 md:sticky md:top-20 md:self-start">
            <h2 className="font-bold text-gray-700 mb-4">菜品分类</h2>
            <nav className="space-y-2">
              {menuCategories.map(category => (
                <button
                  key={category.name}
                  className={`w-full text-left px-4 py-2 rounded-md ${
                    activeCategory === category.name
                      ? 'bg-orange-100 text-orange-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>

          {/* 菜品列表 */}
          <div className="md:w-3/4 p-4">
            {menuCategories
              .filter(category => activeCategory === '' || category.name === activeCategory)
              .map(category => (
                <div key={category.name} className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    {category.name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {category.items.map(item => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden flex"
                      >
                        <div className="relative w-24 h-24 flex-shrink-0">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                              <span className="text-gray-400">无图片</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <h3 className="font-bold text-gray-800">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500 flex-1">
                            {item.description}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-orange-600 font-bold">
                              ¥{item.price.toFixed(2)}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 购物车弹窗 */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-t-lg md:rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">购物车</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">购物车为空</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map(item => (
                    <li key={item.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <h3 className="font-medium">{item.menu_item.name}</h3>
                        <p className="text-sm text-gray-500">
                          ¥{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full w-7 h-7 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="mx-2 w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full w-7 h-7 flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-3 text-red-500 hover:text-red-700"
                        >
                          删除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t p-4">
              <div className="flex justify-between mb-4">
                <span className="font-bold">总计:</span>
                <span className="font-bold text-orange-600">
                  ¥{calculateTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={submitOrder}
                disabled={cart.length === 0 || orderSubmitting}
                className={`w-full py-3 rounded-lg text-white font-medium ${
                  cart.length === 0 || orderSubmitting
                    ? 'bg-gray-400'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {orderSubmitting ? '提交中...' : '提交订单'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 订单成功提示 */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-2xl font-bold mb-2">订单提交成功!</h3>
            <p className="text-gray-600 mb-6">
              您的订单已提交，厨师很快会开始准备。请耐心等待。
            </p>
            <button
              onClick={() => setOrderSuccess(false)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
            >
              返回菜单
            </button>
          </div>
        </div>
      )}
    </div>
  );
}