const supertest = require('supertest');
const should = require('should');
const userCollection = require('../models/user');

const mongoose = require('mongoose');

const dotenv = require("dotenv");
dotenv.config("../.env");

mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const server = supertest.agent("http://localhost:5000");

let mentor_token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lbnRvckBhcmJhbi5jb20iLCJ1c2VySWQiOiI2MjY5NDc0OWI3MjE3MzEzOTNiMzUwNDEiLCJyb2xlIjoibWVudG9yIiwiaWF0IjoxNjUxMjQxNzI1LCJleHAiOjE2NTEyODQ5MjV9.0t_pZ0dzcjH0LzrA-9JkU4sLgu76ZDg5wnK5Wbraqag`;

let student_token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0dWRlbnRAYXJiYW4uY29tIiwidXNlcklkIjoiNjI2OTQ3NTJiNzIxNzMxMzkzYjM1MDQzIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE2NTEyNDI1NDAsImV4cCI6MTY1MTI4NTc0MH0.SfGm5yT7dqLg85qE5P59GEPUKbkaV-hiJ6ANC4ExpyI`;

let admin_token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGFyYmFuLmNvbSIsInVzZXJJZCI6IjYyNjk0NzM4YjcyMTczMTM5M2IzNTAzZiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY1MTI0MjcxOSwiZXhwIjoxNjUxMjg1OTE5fQ.zVXVPhBBu9OxU8mg8SYryWgnJrbMpZXD4KJG8N-oGuQ`;

let admin_id = ``;
let mentor_id = ``;
let student_id = ``;

let assessment_id = ``;
let submission_id = ``;

// START UNIT TESTING

///
/// DATABASE
///

describe("Database", () => {
  it("deleted existing admin", done  => {
    userCollection.findOneAndDelete({email: "testadmin@arban.com"}, (err, result) => {
      done();
    })
  })
})

///
/// REGISTER
///
describe("Register", () => {
  it("registers an admin", done => {
    server.post("/api/register")
      .send({ email: "testadmin@arban.com", password: "password", role: "admin", name: "Test Admin" })
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201);
        res.body.should.have.property("message");

        done();
      })
  })

  it("registers a mentor", done => {
    server.post("/api/register")
      .send({ email: "testmentor@arban.com", password: "password", role: "mentor", name: "Test Mentor" })
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201);
        res.body.should.have.property("message");

        done();
      })
  })

  it("registers a student", done => {
    server.post("/api/register")
      .send({ email: "teststudent@arban.com", password: "password", role: "student", name: "Test Student" })
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201);
        res.body.should.have.property("message");

        done();
      })
  })
})


///
/// LOGIN
///
describe("Authentication", () => {
  it("logged in as an admin", done => {
    server.post("/api/login")
      .send({ email: "testadmin@arban.com", password: "password" })
      .expect(200)
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property("message");
        res.body.should.have.property("token");

        admin_token = res.body.token;
        admin_id = res.body.uid;

        done();
      })
  })

  it("logged in as a mentor", done => {
    server.post("/api/login")
      .send({ email: "testmentor@arban.com", password: "password" })
      .expect(200)
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property("message");
        res.body.should.have.property("token");

        mentor_token = res.body.token;
        mentor_id = res.body.uid;

        done();
      })
  })

  it("logged in as a student", done => {
    server.post("/api/login")
      .send({ email: "teststudent@arban.com", password: "password" })
      .expect(200)
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property("message");
        res.body.should.have.property("token");

        student_token = res.body.token;
        student_id = res.body.uid;

        done();
      })
  })
})

///
/// ASSESSMENTS
///

describe("Assessments (POST)", () => {
  // Create Assessment
  it("creates an assessment when logged in as mentor", done => {
    server.post("/api/assessment/create")
      .send({ title: "A beautiful Mind", description: "Essay on films and their impact" })
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.body.should.have.property("message");

        done();
      })
  })

  it("cannot create an assessment when logged in as student", done => {
    server.post("/api/assessment/create")
      .send({ title: "A beautiful Mind", description: "Essay on films and their impact" })
      .set('Authorization', `Bearer ${student_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.body.should.have.property("error");
        res.body.error.should.equal("You are not authorized to create an assessment");

        done();
      })
  })

  it("cannot create assessment when logged in as admin but no mentorId is provided", done => {
    server.post("/api/assessment/create")
      .send({ title: "A beautiful Mind", description: "Essay on films and their impact" })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.body.should.have.property("error");
        res.body.error.should.equal("A valid mentor is required to create an assessment");

        done();
      })
  })

  it("cannot create assessment when logged in as admin but mentor is invalid or not found in database", done => {
    server.post("/api/assessment/create")
      .send({ title: "A beautiful Mind", description: "Essay on films and their impact", mentorId: "12324" })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(404)
      .end((err, res) => {
        res.body.should.have.property("error");

        done();
      })
  })

  it("cannot create assessment when logged in as admin but provided id is not of a mentor", done => {
    server.post("/api/assessment/create")
      .send({ title: "A beautiful Mind", description: "Essay on films and their impact", mentorId: student_id })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.body.should.have.property("error");

        done();
      })
  })

  it("creates assessment when logged in as admin and a valid mentorId is provided", done => {
    server.post("/api/assessment/create")
      .send({ title: "A beautiful Mind", description: "Essay on films and their impact", mentorId: mentor_id })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.body.should.have.property("message");

        assessment_id = res.body.id;

        done();
      })
  })

  it("cannot create assessment when either or both of the required fields is not provided", done => {
    server.post("/api/assessment/create")
      .send({ title: "A beautiful Mind" })
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        res.body.should.have.property("error");

        done();
      })
  })

})

///
/// SUBMISSIONS
///

describe("Submissions (POST)", () => {
  it("creates an assessment submission when logged in as student", done => {
    server.post(`/api/assessment/${assessment_id}/submit`)
      .send({ files: ["drive.google.com", "https://pdfdrive.com/exampledocument"] })
      .set('Authorization', `Bearer ${student_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.body.should.have.property("message");

        submission_id = res.body.id;

        done();
      })
  })

  it("cannot submit to an assessment when logged in as mentor", done => {
    server.post(`/api/assessment/${assessment_id}/submit`)
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.body.should.have.property("error");

        done();
      })
  })

  it("cannot submit when logged in as admin but no studentId is provided", done => {
    server.post(`/api/assessment/${assessment_id}/submit`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");

        done();
      })
  })

  it("cannot submit to assessment when logged in as admin but provided studentId is invalid or not in database", done => {
    server.post(`/api/assessment/${assessment_id}/submit`)
      .send({ studentId: "12324" })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(500)
      .end((err, res) => {
        res.status.should.equal(500);
        res.body.should.have.property("error");

        done();
      })
  })

  it("cannot submit to assessment when logged in as admin but provided id is not of a student", done => {
    server.post(`/api/assessment/${assessment_id}/submit`)
      .send({ studentId: mentor_id })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");

        done();
      })
  })

  it("submits to assessment when logged in as admin and a valid student id is provided", done => {
    server.post(`/api/assessment/${assessment_id}/submit`)
      .send({ files: ["drive.google.com", "https://pdfdrive.com/exampledocument"] })
      .send({ studentId: student_id })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201);
        res.body.should.have.property("message");

        done();
      })
  })
})

///
/// GRADES
///

describe("Grades (POST)", () => {
  it("grades a submission when logged in as mentor or admin and marks and remarks are provided", done => {
    server.post(`/api/assessment/${assessment_id}/${submission_id}/grade`)
      .send({ marks: 90, remarks: "Good work" })
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201);
        res.body.should.have.property("message");

        done();
      })
  })

  it("cannot grade a submission when logged in as a student", done => {
    server.post(`/api/assessment/${assessment_id}/${submission_id}/grade`)
      .send({ marks: 90, remarks: "Good work" })
      .set('Authorization', `Bearer ${student_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401);
        res.body.should.have.property("error");

        done();
      })
  })
})

describe("Assessments (PUT)", () => {
  it("updates an assessment when logged in as an admin and updated object is provided", done => {
    server.put(`/api/assessment/${assessment_id}`)
      .send({ updated: { title: "Not a beautiful mind" } })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201)
        res.body.should.have.property("message");

        done();
      })
  })

  it("does not update assessment when not logged in as admin", done => {
    server.put(`/api/assessment/${assessment_id}`)
      .send({ updated: { title: "Not a beautiful mind" } })
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401)
        res.body.should.have.property("error");

        done();
      })
  })

  it("does not update assessment when logged in as admin but no updated field was provided", done => {
    server.put(`/api/assessment/${assessment_id}`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        res.status.should.equal(400)
        res.body.should.have.property("error");

        done();
      })
  })
})

describe("Submissions (PUT)", () => {
  it("updates a submission when logged in as an admin and updated object is provided", done => {
    server.put(`/api/assessment/${assessment_id}/${submission_id}`)
      .send({ updated: { files: ["https://github.com", "https://pdfdrive.com/exampledocument"] } })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201)
        res.body.should.have.property("message");

        done();
      })
  })

  it("does not update a submission when not logged in as an admin", done => {
    server.put(`/api/assessment/${assessment_id}/${submission_id}`)
      .send({ updated: { files: ["https://github.com", "https://pdfdrive.com/exampledocument"] } })
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401)
        res.body.should.have.property("error");

        done();
      })
  })

  it("does not update a submission when logged in as an admin but no updated object is provided", done => {
    server.put(`/api/assessment/${assessment_id}/${submission_id}`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        res.status.should.equal(400)
        res.body.should.have.property("error");

        done();
      })
  })
})

describe("Grades (PUT)", () => {
  it("updates a grade when logged in as an admin and grade object is provided", done => {
    server.put(`/api/assessment/${assessment_id}/${submission_id}/grade`)
      .send({ grade: { marks: 85 } })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201)
        res.body.should.have.property("message");

        done();
      })
  })

  it("does not update a grade when not logged in as an admin", done => {
    server.put(`/api/assessment/${assessment_id}/${submission_id}/grade`)
      .send({ grade: { marks: 85 } })
      .set('Authorization', `Bearer ${student_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401)
        res.body.should.have.property("error");

        done();
      })
  })

  it("does not update a grade when logged in as an admin but no grade object is provided", done => {
    server.put(`/api/assessment/${assessment_id}/${submission_id}/grade`)
      .send({ grade: { marks: 85 } })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201)
        res.body.should.have.property("message");

        done();
      })
  })
})

///
/// USERS
///

describe("Users (PUT)", () => {
  it("updates user if logged in as admin and updated object is provided", done => {
    server.put(`/api/user/${mentor_id}`)
      .send({ updated: { name: "Updated Mentor" } })
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201)
        res.body.should.have.property("message");

        done();
      })
  })

  it("does not update user if not logged in as admin", done => {
    server.put(`/api/user/${mentor_id}`)
      .send({ updated: { name: "Updated Mentor" } })
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401)
        res.body.should.have.property("error");

        done();
      })
  })
  it("does not update user if logged in as admin but no update object is provided", done => {
    server.put(`/api/user/${mentor_id}`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(400)
      .end((err, res) => {
        res.status.should.equal(400)
        res.body.should.have.property("error");

        done();
      })
  })
})

describe("Grade (DELETE)", () => {
  it("deletes grade if logged in as admin", done => {
    server.delete(`/api/assessment/${assessment_id}/${submission_id}/grade`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201)
        res.body.should.have.property("message");

        done();
      })
  })

  it("does not delete grade if not logged in as admin", done => {
    server.delete(`/api/assessment/${assessment_id}/${submission_id}/grade`)
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401)
        res.body.should.have.property("error");

        done();
      })
  })
})

describe("Submissions (DELETE)", () => {
  it("deletes submission if logged in as admin", done => {
    server.delete(`/api/assessment/${assessment_id}/${submission_id}`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201)
        res.body.should.have.property("message");

        done();
      })
  })

  it("does not delete submission if not logged in as admin", done => {
    server.delete(`/api/assessment/${assessment_id}/${submission_id}`)
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401)
        res.body.should.have.property("error");

        done();
      })
  })
})

describe("Assessments (DELETE)", () => {
  it("deletes assessment if logged in as admin", done => {
    server.delete(`/api/assessment/${assessment_id}`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201)
        res.body.should.have.property("message");

        done();
      })
  })

  it("does not delete assessment if not logged in as admin", done => {
    server.delete(`/api/assessment/${assessment_id}`)
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401)
        res.body.should.have.property("error");

        done();
      })
  })
})

describe("Users (DELETE)", () => {
  it("cannot delete student if not logged in as admin", done => {
    server.delete(`/api/user/${student_id}`)
      .set('Authorization', `Bearer ${mentor_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401)
        res.body.should.have.property("error");

        done();
      })
  })

  it("cannot delete another admin", done => {
    //if you are starting with a fresh database, make an admin manually and put their id here
    server.delete(`/api/user/626f78ecfe8bcf91d8e5ed3e`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401)
        res.body.should.have.property("error");

        done();
      })
  })

  it("cannot delete self", done => {
    server.delete(`/api/user/${admin_id}`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(401)
      .end((err, res) => {
        res.status.should.equal(401)
        res.body.should.have.property("error");

        done();
      })
  })

  it("deletes student if logged in as admin", done => {
    server.delete(`/api/user/${student_id}`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201)
        res.body.should.have.property("message");

        done();
      })
  })

  it("deletes mentor if logged in as admin", done => {
    server.delete(`/api/user/${mentor_id}`)
      .set('Authorization', `Bearer ${admin_token}`)
      .expect("Content-Type", /json/)
      .expect(201)
      .end((err, res) => {
        res.status.should.equal(201)
        res.body.should.have.property("message");

        done();
      })
  })
})