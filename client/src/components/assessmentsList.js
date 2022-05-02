import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AssessmentsList = ({userInfo}) => {
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    fetch(`/api/assessment`, {
      mode: "cors",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Accept": "application/json"
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      setAssessments(data.data);
    })
  }, [])

  return ( <div>
    <h1>Assessments</h1>
    <ul>
    {assessments.map(assessment => (<li>
      {assessment.title} - <Link to={`/assessment/${assessment._id}`} state={{assessment:assessment, userInfo:userInfo }}>View Details</Link>
    </li>))}

    </ul>
  </div> );
}
 
export default AssessmentsList;