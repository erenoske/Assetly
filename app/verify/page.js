"use client"; 
import Cookies from 'js-cookie';
import { useState } from "react";
import config from '../config/config';
import { useRouter } from 'next/navigation';

export default function Verify() {
  const router = useRouter(); 
  const email = Cookies.get('user-email');
  const [code, setUsername] = useState(''); 
  const [message, setMessage] = useState('Doğrulama kodu mail adresine gönderildi.');   
  
  const handleSubmit = async (e) => { 
      e.preventDefault();
  
      const res = await fetch(`${config.apiBaseUrl}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        router.push('/')
      } else {
        setMessage(data.message);
      }
  };

  return (
    <>
    <title>Assetly - Verify</title>
    <div className='main-login'>
      <img
        src="/logo/logo-r.png"
        alt="Assetly Logo"
        width={90}
        height={90}
      />
      <h1 className="font-light text-2xl">Assetly'ye Kayıt Ol</h1>
      <form className='login-box' onSubmit={handleSubmit}> 
      {message && 
      
       <div className='r-box'>
        <p>{message}</p>
       </div>

      } 
         <div className='login-input-box'>
           <label className='label'>Doğrulama Kodu</label>
           <input
             type="text" 
             value={code}
             maxLength={6}
             pattern="\d{6}"
             required
             onChange={(e) => {
               const value = e.target.value;
               if (/^\d{0,6}$/.test(value)) {
                 setUsername(value);
               }
             }}
           />
         </div>

         <button type="submit" className='main-button'>Doğrula</button> 
     </form>
     <div>   
     </div>
    </div>
  </>
  );
}