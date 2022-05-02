import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

const Login = () => {
  const [error, setError] = useState('');

  if (localStorage.getItem('token') !== null) {
    fetch('/api/verify', {
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.error);
      return <Navigate to="/dashboard" replace /> 
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    let obj = { 
      email: e.target.elements.email.value,
      password: e.target.elements.password.value 
    }
    console.log(obj);
    fetch('/api/login', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(obj)
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setError(data.error);
        return;
      }
      setError('');
      if (data.token !== undefined) {
        console.log(data);
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      }
    })
  }
  return ( 
  <div>
    {error !== '' && <span className="errorMsg">{error}</span>}
    <h1>Login</h1>
    <form onSubmit={handleSubmit}>
      <div>  
        <label htmlFor="email">Email:
          <input type="email" name="email" />
        </label>
      </div>
      <div>  
        <label htmlFor="password">Password:
          <input type="password" name="password" />
        </label>
      </div>
      <input type="submit" />
    </form>
    <div>
      Don't have an account?
      <Link to='/register' >Register</Link>
    </div>
  </div> );
}
 
export default Login;