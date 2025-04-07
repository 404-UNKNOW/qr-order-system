import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">扫码点餐系统</h1>
          <p className="text-gray-600">选择您的登录方式</p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/admin" 
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md text-center transition duration-200"
          >
            管理员登录
          </Link>
          
          <Link 
            href="/kitchen" 
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md text-center transition duration-200"
          >
            厨房登录
          </Link>
          
          <Link 
            href="/tables" 
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-md text-center transition duration-200"
          >
            查看餐桌
          </Link>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>扫描餐桌上的二维码开始点餐</p>
        </div>
      </div>
    </div>
  );
}
