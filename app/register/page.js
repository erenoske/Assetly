"use client"; 
import { useState } from 'react'; 
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import config from '../config/config';

export default function Register() {
  const router = useRouter(); 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');    

  const handleSubmit = async (e) => { 
      e.preventDefault();

      const res = await fetch(`${config.apiBaseUrl}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await res.json();
  
      if (res.ok) {
        if(data.success) {
          Cookies.set('user-email', email, { expires: 1 });
          router.push('/verify')
        } else {
          if (data.error = 'username_taken') {
            setMessage('Kullanıcı adı zaten kullanılmış.')
          }
        }
      } else {
        setMessage(data.message);
      }
  };

  return (
    <>
    <title>Assetly - Kayit Ol</title>
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
           <label className='label'>Kullanıcı Adı</label>
           <input 
             type="text"  
             value={username} 
             required="required"
             onChange={(e) => setUsername(e.target.value)} 
            /> 
         </div>
         <div className='login-input-box'>
           <label className='label'>Email</label>
           <input 
             type="email"  
             value={email} 
             required="required"
             onChange={(e) => setEmail(e.target.value)} 
            /> 
         </div>
         <div className='login-input-box'>
           <label className='label'>Şifre ( En az 6 karakterli olmalıdır )</label>
           <input 
             type="password" 
             value={password} 
             required="required"
             onChange={(e) => setPassword(e.target.value)} 
         /> 
         </div>

         <div className="form-check"> 
            <input className="form-check-input" type="checkbox"
            /> 
            <label className="form-check-label"> <a>Kullanıcı sözleşmesini</a> okuduğumu ve kabul ettiğimi onaylıyorum. </label> 
         </div>

         <button type="submit" className='main-button'>Kayıt Ol</button> 
     </form>
     <div>   
     <p>Zaten bir hesabınız var mı?      <Link href="/login">
        Giriş yapın. 
        </Link></p>
     </div>
    </div>

  </>
  );
}