var commentModel = require("../models/comment");

var commentController = (app) => {
  app.get("/comment/:id", (req, res) => {
    var articleId = req.params.id
    commentModel.find({ articleId }, (err, docs) => {
      if (err) {
        return res.status(500).json({ msg: "Error occurred when fetching all saved comments"});
      }
      console.log('getComment/:id : ', docs)
      return res.status(200).json({ comments: docs });
    });
  });

  app.post("/comment", (req, res) => {
    var comment = req.body;
    commentModel.create(comment, (err, c) => {
      if (err) {
        return res.status(500).json({ msg: "Failed to save comment"});
      }
      console.log("postComment", c)
      return res.status(201).json({
        comment: c
      })
    })
  })

  app.delete("/comment/:id", (req, res) => {
    var commentId = req.params.id
    commentModel.deleteOne({ _id: commentId }, (err) => {
      if (err) {
        return res.status(500).json({ msg: "Failed to delete comment" })
      }
      return res.status(200).json({
        msg: "Successfully deleted comment"
      })
    })
  })
}

module.exports = commentController