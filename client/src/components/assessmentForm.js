import { useState } from "react";

const AssessmentForm = ({userInfo}) => {
  const [flag, setFlag] = useState(false)

  const handleSubmit = (e) => {
    console.log(e.target.elements.title.value, e.target.elements.description.value)
    fetch(`/api/assessment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({title: e.target.elements.title.value, description: e.target.elements.description.value})
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      window.location.href = `/dashboard`;
    })
  }

  return ( <div>
    {userInfo.role === "mentor" && <button onClick={() => {setFlag(!flag)}}>{flag === false ? 'Create Assessment' : 'Hide'}</button>}
    {flag === true && <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label><br />
          <input type="text" name="title" id="title" />
        </div>
        <div>
          <label htmlFor="description">Description</label><br />
          <textarea name="description" id="description" cols="30" rows="10"></textarea>
        </div>
        <div>
          <input type="submit" value="Create" />
        </div>
      </form>  
    </div>}
  </div> );
}
 
export default AssessmentForm;