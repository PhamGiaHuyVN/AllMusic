import React, { useState, useEffect, useRef } from 'react';
//usestate(quan ly trang thai)
//khi bao bien trang trang thai noi bo, khi gia tri thay doi react se re-reder ui
//luu thong tin user vao input, trang thai dong mo modal, gio hang, so dem

//useEffect(xu ly side effect)
//thuc hien cac nhiem vu ngoai luong chinh
//goi api lay du lieu, lang nghe su kien, lam viec voi setInterval, setTimeout, cap nhat thu cong DOM

//useRef(tham chieu khong gay re-render)
//tao ra doi tuong {current : value} luu giu gia tri xuyen suot cac lan render ma khong lam components bi re-render, cap nhat truc tiep cac phan tu DOM
//tu focus vao o input, luu tru ID cua timer/interval, luu tru gia tri cu cua state de so sanh

import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import UploadForm from './components/UploadForm';
import TrackList from './components/TrackList';
import AuthModal from './components/AuthModal'; // Đảm bảo đúng đường dẫn tới file AuthModal của bạn

function MusicApp() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Tự động khôi phục phiên đăng nhập từ localStorage
  //kiem tra xem bo nho trinh duyet co luu san thong tin dang nhap
  //cua user tu lan dang nhap truoc hay khong. Neu co doc du lieu do 
  //ra chuyen tu chuoi JSON thanh object va luu vao useState. Giup
  //user khong bi mat phien dang nhap khi F5
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);


  //xu ly dang xuat 
  //xoa du lieu xac thuc (toker , user) trong localstorage
  //cap nhat user = null -> setUser(null) re-render lam an cac tinh nang
  //cua nguoi da dang nhap
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div>
      <Navbar
        /*truyen bien user xuong navber de biet hien thi dang nhap hay dang xuat */
        /*truyen ham kich hoat mo modal setisauthopen va handlelogout xuong duoi cac cac nut cua navbar goi toi */

        user={user} 
        onOpenAuth={() => setIsAuthOpen(true)} 
        
        onLogout={handleLogout} 
      />

      <AuthModal 
        /*nhan isopen de quyet dinh hien thi hay an modal */
        /*onclose ham tat modal setisauthopen(false)*/
        /*onloginsuccess , thay doi userdata */
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={(userData) => setUser(userData)} 
      />

      {/* Dùng điều kiện kiểm tra người dùng đã đăng nhập chưa để hiển thị Upload form */}
      {user ? (
        <UploadForm onUploadSuccess={loadTracks} />
      ) : (
        <div className="p-4 bg-yellow-50 text-yellow-800 border rounded-lg text-center">
          Vui lòng <b>Đăng nhập</b> để thực hiện Tải Lên bài hát mới.
        </div>
      )}
        {/*toan tu true false ? (...) (...) */}
    </div>
  );
}

export default MusicApp;