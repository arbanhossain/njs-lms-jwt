import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Submission = () => {
  const handleGrade = (e) => {
    e.preventDefault();
    let obj = {
      marks: e.target.elements.marks.value,
      remarks: e.target.elements.remarks.value
    }
    fetch(`/api/assessment/${submission.assessment}/${submission._id}/grade`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify(obj)
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      window.location.href = `/`;
    })
  }

  const location = useLocation();
  const {submission, userInfo, assessment} = location.state;
  console.log(submission)

  return ( <div>
    <p>Assessment By: {assessment.mentor}</p>
    <p>Submitted By: {submission.student_name}</p>
    <h3>Files/Links</h3>
    {submission.files.map(file => (<p>{file}</p>))}
    <h3>Grade</h3>
    {submission.grade !== undefined && (<div>
      <p>Marks: {submission.grade.marks}</p>
      <p>Remarks: {submission.grade.remarks}</p>
    </div>)}
    {submission.grade === undefined && (<div>
      <p>No grade yet</p>
      {userInfo.role === 'mentor' && userInfo.uid === assessment.mentor && (
        <form onSubmit={handleGrade}>
        <div>
          <label htmlFor="marks">Marks</label>
          <input type="number" name="marks" id="marks" />
        </div>
        <div>
          <label htmlFor="remarks">Remarks</label>
          <input type="text" name="remarks" id="remarks" />
        </div>
        <div>
          <input type="submit" value="Grade" />
        </div>
      </form>
      )}
    </div>)}
  </div> );
}
 
export default Submission;