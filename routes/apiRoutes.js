const express = require("express");
const router = express.Router()
const jwt = require("jsonwebtoken");
const User = require("../models/user")
const Assessment = require("../models/assessment")
const auth = require("../middleware/jwt")
const Submission = require("../models/submission");
const { renderString } = require("nunjucks");

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API."
  });
});

router.post("/login", (req, res) => {
  try {
    User.findOne({ email: req.body.email }, function (err, user) {
      if (err) {
        console.log(err)
        return res.status(401).json({
          error: "Auth failed"
        });
      }
      if (!user) {
        console.log("No user found.")
        return res.status(401).json({
          error: "Auth failed"
        });
      }
      if (!user.validPassword(req.body.password)) {
        req.flash('error', 'Wrong password');
        return res.status(401).json({
          error: "Auth failed"
        });
      }
      if (user) {
        console.log("logged in")
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
            role: user.role
          },
          process.env.SECRET,
          {
            expiresIn: "12h"
          }
        );
        res.status(200).json({
          message: "Auth successful",
          token: token,
          uid: user._id
        });
      }
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: `${err}`
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    console.log(req.body.email, req.body.password);
    if (req.body.role !== "admin" && req.body.role !== "mentor" && req.body.role !== "student") {
      return res.status(400).json({
        error: "Role should be admin, student or mentor"
      });
    }
    const user = new User();
    user.email = req.body.email;
    user.role = req.body.role;
    user.password = user.encryptPassword(req.body.password);
    user.created_At = Date.now();
    user.save((error, result) => {
      if (error) {
        console.log(err)
        res.status(500).json({
          error: "An error has occured when saving the user"
        })
      } else {
        res.status(201).json({
          message: "User created."
        });
      }
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      error: "An error has occured while trying to register"
    })
  }
});

router.post('/assessment/create', auth.checkToken, (req, res) => {
  console.log(req.decoded);
  try {
    if (req.decoded.role === "student") {
      return res.status(401).json({ error: "You are not authorized to create an assessment" });
    }
    if (req.decoded.role === "admin" && req.body.mentorId === undefined) {
      return res.status(400).json({ error: "A valid mentor is required to create an assessment" });
    }
    let assessment = new Assessment();
    assessment.title = req.body.title;
    assessment.description = req.body.description;
    assessment.deadline = Date.now();
    assessment.created_at = Date.now();
    User.findOne({ _id: req.decoded.role === "mentor" ? req.decoded.userId : req.body.mentorId }, (err, user) => {
      if (user) {
        if (user.role !== "mentor") return res.status(401).json({ error: "Not a mentor" });
        assessment.mentor = user;
      }
      else return res.status(404).json({ error: "No user found" })

      assessment.save((error, result) => {
        if (error) {
          console.log(error)
          res.status(500).json({
            error: "An error has occured while trying to save the assessment"
          })
        } else {
          res.status(201).json({
            message: "Assessment created.",
            id: result._id
          });
        }
      })
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.post("/assessment/:assessmentID/submit", auth.checkToken, (req, res) => {
  // console.log(req.decoded);
  if (req.decoded.role === "mentor") {
    return res.status(401).json({ error: "You are not authorized to submit an assessment" });
  }
  if (req.decoded.role === "admin" && req.body.studentId === undefined) {
    return res.status(400).json({ error: "A valid student is required to submit an assessment" });
  }
  let submission = new Submission();
  submission.submission_date = Date.now();
  if (req.body.grade && req.decoded.role === "admin") submission.grade = req.body.grade;
  try {
    Promise.all([
      Assessment.findOne({ _id: req.params.assessmentID }),
      User.findOne({ _id: req.decoded.role === "student" ? req.decoded.userId : req.body.studentId })
    ]).then(([assessment, user]) => {
      if (!assessment) return res.status(404).json({ error: "No such assessment found" })
      if(!user) return res.status(404).json({ error: "No such student found" })
      if (assessment) {
        submission.assessment = assessment;
      }
      if (user) {
        if (user.role !== 'student') return res.status(400).json({ error: "A valid student is required to submit an assessment" });
        submission.student = user;
      }
      submission.save((error, result) => {
        if (error) {
          res.status(500).json({
            error: `${error}`
          })
        } else {
          res.status(201).json({
            message: "Submission created.",
            id: result._id
          });
        }
      })
    }).catch(err => {
      res.status(500).json({
        error: `${err}`
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.post("/assessment/:assessmentID/:submissionID/grade", auth.checkToken, (req, res) => {
  if(req.decoded.role === 'student') return res.status(401).json({ error: "You are not authorized to grade" });
  let grade = {marks: req.body.marks, remarks: req.body.remarks};
  try {
    Submission.findOneAndUpdate({_id: req.params.submissionID}, {grade: grade}, (err, submission) => {
      if (err) return res.status(500).json({ error: "Could not grade" });
      return res.status(201).json({ message: "Graded" });
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.put("/assessment/:assessmentID", auth.checkToken, (req, res) => {
  if (req.decoded.role !== "admin") return res.status(401).json({ error: "You are not authorized to update an assessment" })
  if (req.body.updated === undefined) return res.status(400).json({ error: "No updated fields were found" })

  try {
    Assessment.findOneAndUpdate({ _id: req.params.assessmentID }, { $set: req.body.updated }, (err, result) => {
      if(err) return res.status(500).json({ error: "Could not update assessment" });
      return res.status(201).json({ message: "Assessment updated" });
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.put("/assessment/:assessmentID/:submissionID", auth.checkToken, (req, res) => {
  if (req.decoded.role !== "admin") return res.status(401).json({ error: "You are not authorized to update a submission" })
  if (req.body.updated === undefined) return res.status(400).json({ error: "No updated fields were found" })
  try {
    Submission.findOneAndUpdate({ _id: req.params.submissionID }, {$set: req.body.updated}, (err, result) => {
      if(err) return res.status(500).json({ error: "Could not update submission" })
      return res.status(201).json({message: "Submission updated"})  
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.put("/assessment/:assessmentID/:submissionID/grade", auth.checkToken, (req, res) => {
  if (req.decoded.role !== "admin") return res.status(401).json({ error: "You are not authorized to edit a user" })
  if (req.body.grade === undefined) return res.status(401).json({ error: "No updated fields were found" })
  try {
    Submission.findOneAndUpdate({ _id: req.params.submissionID }, { $set: {grade: req.body.grade} }, (err, result) => {
      if (err) return res.status(500).json({ error: "Could not update grade" })
      return res.status(201).json({ message: "Grade updated" })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.put("/user/:uid", auth.checkToken, (req, res) => {
  if (req.decoded.role !== "admin") return res.status(401).json({ error: "You are not authorized to edit a user" })
  if (req.body.updated === undefined) return res.status(400).json({ error: "No updated fields were found" })
  try {
    User.findOneAndUpdate({ _id: req.params.uid }, { $set: req.body.updated }, (err, result) => {
      if(err) return res.status(500).json({ error: "Could not update user" });
      return res.status(201).json({ message: "User updated" });
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.delete("/assessment/:assessmentID", auth.checkToken, (req, res) => {
  if (req.decoded.role !== "admin") return res.status(401).json({ error: "You are not authorized to delete an assessment" })
  try {
    Assessment.findOneAndDelete({ _id: req.params.assessmentID }, (err, assessment) => {
      if(err) return res.status(500).json({ error: "Could not delete assessment" });
      return res.status(201).json({ message: "Assessment deleted" });
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.delete("/assessment/:assessmentID/:submissionID/grade", auth.checkToken, (req, res) => {
  if (req.decoded.role !== "admin") return res.status(401).json({ error: "You are not authorized to delete a grade" })
  try {
    Submission.findOneAndUpdate({ _id: req.params.submissionID }, { $unset: { grade: "" } }, (err, submission) => {
      if (err) return res.status(500).json({ error: "Could not delete grade" });
      return res.status(201).json({ message: "Deleted grade" })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.delete("/assessment/:assessmentID/:submissionID", auth.checkToken, (req, res) => {
  if(req.decoded.role !== "admin") return res.status(401).json({ error: "You are not authorized to delete a submission" });
  try {
    Submission.findOneAndDelete({ _id: req.params.submissionID }, (err, submission) => {
      if (err) return res.status(500).json({ error: "Could not delete submission" })
      return res.status(201).json({ message: "Submission deleted" })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.delete("/user/:uid", auth.checkToken, (req, res) => {
  if (req.decoded.role !== "admin") return res.status(401).json({ error: "You are not authorized to delete a user" });
  if (req.decoded.userId === req.params.uid) return res.status(401).json({ error: "You cannot delete yourself" });
  try {
    User.findOne({ _id: req.params.uid }, (err, user) => {
      if (err) return res.status(404).json({ error: "Could not find user" });
      if (user) {
        if (user.role === "admin") return res.status(401).json({ error: "You cannot delete an admin" });
        User.deleteOne({ _id: req.params.uid }, (err, result) => {
          if (err) return res.status(500).json({ error: "Could not delete user" });
          return res.status(201).json({ message: "User deleted" });
        })
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: `${error}`
    })
  }
})

router.get("/user/:uid", auth.checkToken, (req, res) => {
  try {
    User.findOne({ _id: req.params.uid }, function (err, user) {
      if (err) {
        console.log(err)
        return res.status(401).json({
          message: "User does not exist."
        });
      }
      if (user) {
        return res.status(200).json({
          message: "user found",
          uid: user._id,
          email: user.email,
          role: user.role,
          joined: user.created_At
        });
      }
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err
    });
  }
});

module.exports = router