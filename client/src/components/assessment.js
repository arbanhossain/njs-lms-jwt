import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Assessment = () => {
  const location = useLocation();
  const [submissions, setSubmissions] = useState([])
  const [links, setLinks] = useState([])
  const { assessment, userInfo } = location.state

  const handleSubmit = () => {
    console.log(links)
    fetch(`/api/assessment/${assessment._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({files: links})
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      window.location.href = `/dashboard`
    })
  }
  
  const handleLinkSubmit = () => {
    let val = document.getElementById('linkInput').value;
    if(links.includes(val) === false) setLinks([...links, val])
  }

  useEffect(() => {
    fetch(`/api/assessment/${assessment._id}/submissions`, {
      mode: 'cors',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json"
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log(data.data);
      setSubmissions(data.data);
    })
  }, [])

  return ( <div>
    <Link to="/dashboard">Back</Link>
    <h1>Assessment</h1>
    <h2>{assessment.title}</h2>
    <p>{assessment.description}</p>
    <h1>Submissions</h1>
    {submissions !== undefined && submissions.length === 0 && (<div>
      <p>No submissions yet</p>
      {userInfo.role === 'student' && (<div>
        <div>
          {links.map(link => (<p>{link}</p>))}
        </div>
        <div>
          <input type="text" name="linkInput" id="linkInput" placeholder='Enter file/document URL' />
          <input type="button" value="Add" onClick={handleLinkSubmit} />
        </div>
        <div>
          <input type="button" value="Submit" onClick={handleSubmit} />
        </div>
      </div>)}
    </div>)}
    <ul>
      {submissions !== undefined && submissions.map(submission => (<li>
        {submission.student_name} - <Link to={`/submissions/${submission._id}`} state={{submission: submission, userInfo: userInfo, assessment: assessment}} >View Details</Link>
      </li>))}
    </ul>
  </div> );
}
 
export default Assessment;