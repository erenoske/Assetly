"use client"; 
import { useEffect } from 'react';
import { useState } from 'react'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function Home() {

  useEffect(() => {
    const token = Cookies.get('user-token');
    if (token) {
      router.push('/');
    }
  }, []);

  const router = useRouter(); 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [message, setMessage] = useState('');   

  const handleSubmit = async (e) => { 
      e.preventDefault();

    const res = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (res.ok) {
      if (data.success) {
        router.push('/') 
      } else {
        setMessage('hata')
      }
    } else {
      setMessage('Giriş başarısız. Lütfen kullanıcı adı ve şifrenizi kontrol edin.')
    }
  
  };

  return (
    <>
    <title>Assetly - Giriş Yap</title>
    <div className='main-login'>
      <img
        src="/logo/logo-r.png"
        alt="Assetly Logo"
        width={90}
        height={90}
      />
      <h1 className="font-light text-2xl">Assetly'ye Giriş Yap</h1>
      <form className='login-box' onSubmit={handleSubmit}> 
      {message && 
      
       <div className='r-box'>
        <p>{message}</p>
       </div>

      } 
         <div className='login-input-box'>
           <label className='label'>Kullanıcı Adı</label>
           <input 
             type="text"  
             value={username} 
             required="required"
             onChange={(e) => setUsername(e.target.value)} 
            /> 
         </div>
         <div className='login-input-box'>
           <label className='label'>Şifre</label>
           <input 
             type="password" 
             value={password} 
             required="required"
             onChange={(e) => setPassword(e.target.value)} 
         /> 
         </div>

         <button type="submit" className='main-button'>Giriş Yap</button> 
     </form>
     <div>   
     <p>Zaten bir hesabınız var mı?      <Link href="/register">
         Bir hesap oluşturun.
        </Link></p>
     </div>
    </div>

  </>
  );
}
