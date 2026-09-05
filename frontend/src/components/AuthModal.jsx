import React, { useState } from 'react';

function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const res = await fetch(`https://allmusic-6k3l.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      if (isLogin) {
        // Lưu token và thông tin user vào localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
        onClose();
      } else {
        alert('🎉 Đăng ký thành công! Hãy đăng nhập.');
        setIsLogin(true);
      }
    } catch (err) {
      setError('Lỗi kết nối Server!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-black">✕</button>
        
        <div className="flex border-b mb-4">
          <button
            className={`flex-1 py-2 font-bold ${isLogin ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setIsLogin(true)}
          >
            Đăng Nhập
          </button>
          <button
            className={`flex-1 py-2 font-bold ${!isLogin ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setIsLogin(false)}
          >
            Đăng Ký
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold">
            {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;