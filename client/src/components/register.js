import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

const Register = () => {
  const [error,setError] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    let obj = {
      "name": e.target.elements.name.value,
      "email": e.target.elements.email.value,
      "password": e.target.elements.password.value,
      "role": document.getElementById('roles').value
    }
    console.log(obj);
    fetch('/api/register', {
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
      window.location.href = '/login';
    })
  }
  return ( <div>
    {error !== '' && <span className="errorMsg">{error}</span>}

    <h1>Register</h1>
    <form onSubmit={handleSubmit}>
    <div>  
        <label htmlFor="name">Name:
          <input type="text" name="name" />
        </label>
      </div>
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
      <div>
        <label htmlFor="role">Role:
          <select name="roles" id="roles">
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>
        </label>
      </div>
      <input type="submit" />
    </form>
    <div>
      Already have an account?
      <Link to="/login">Login</Link>
    </div>
  </div> );
}
 
export default Register;