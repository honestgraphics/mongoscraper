var articleModel = require("../models/article");
var commentModel = require("../models/comment")

var articleController = (app) => {
  app.get("/articles", (req, res) => {
    articleModel.find({}, (err, docs) => {
      if (err) {
        return res.status(500).json({ msg: "Error occurred when fetching all saved articles"});
      }
      return res.status(200).json({ articles: docs });
    });
  });

  app.get("/article/:id/comments", (req, res) => {
    commentModel.find({ articleId: req.params.id }, (err, docs) => {
      if (err) {
        return res.status(500).json({ msg: "Failed to fetch comments for specified article"})
      }
      return res.status(200).json({ comments: docs })
    })
  })

  app.post("/article", (req, res) => {
    var article = req.body
    articleModel.create(article, (err, a) => {
      if (err) {
        console.log("err: ", err)
        return res.status(500).json({ msg: "Failed to save article"});
      }
      return res.status(201).json({ article: a })
    })
  })

  app.delete("/article/:id", (req, res) => {
    var articleId = req.params.id
    articleModel.deleteOne({ _id: articleId }, (err) => {
      if (err) {
        return res.status(500).json({ msg: "Failed to delete article" })
      }
      commentModel.deleteMany({ articleId }, (err) => {
        if (err) {
          return res.status(500).json({ msg: "Failed to delete article comments"})
        }
        return res.status(200).json({
          msg: "Successfully deleted article"
        })
      })
    })
  })
}

module.exports = articleController