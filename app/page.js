"use client"; 
import { useState } from 'react'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {

  const router = useRouter(); 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [message, setMessage] = useState('');   

  const handleSubmit = async (e) => { 
      e.preventDefault();

      const res = await fetch('https://erenisgoren.com.tr/sinem/api/?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
  
      if (res.ok) {
        if (data.status === "success") {
          router.push('/yorumlar')
        } else {
          setMessage("Kullanıcı adı veya şifre hatalı.");
        }
      } else {
        const data = await res.json();
        setMessage(data.message);
      }
  };

  return (
    <>
    <title>Assetly - Giriş Yap</title>
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon.png" />
    <meta name="theme-color" content="#ffffff" />
    <div className='main-login'>
      <img
        src="/logo/logo-r.png"
        alt="Next.js logo"
        width={90}
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
     <p>Assetly'de yeni misiniz?      <Link href="/yorumlar">
         Bir hesap oluşturun.
        </Link></p>
     </div>
    </div>

  </>
  );
}
