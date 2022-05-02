import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AssessmentForm from "./assessmentForm";
import AssessmentsList from "./assessmentsList";

const Dashboard = () => {
  const [logged, setLogged] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [formFlag, setFormFlag] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = '/login';
  }

  useEffect(() => {
    fetch('/api/user', {
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      setUserInfo(data);
    })
  }, [logged])

  if (localStorage.getItem('token') === null) return <Navigate to="/login" replace />
  else {
    fetch('/api/verify', {
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.error) window.location.href = '/login';
    })
  }


  return ( <div>
    <h1>Dashboard</h1>
    {userInfo !== {} && (<div>
      <p>{userInfo.name} ({userInfo.role})</p>
    </div>)}
    <AssessmentForm userInfo={userInfo} />
    <AssessmentsList userInfo={userInfo} />
    <button onClick={handleLogout}>Log Out</button>
  </div> );
}
 
export default Dashboard;