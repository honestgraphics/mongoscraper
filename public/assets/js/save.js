// <p class="card-text time">${a.time}</p>
// use the above code to add time to app
$(document).ready(function(){
  function fetchSavedArticles() {
    axios.get("/articles")
    .then(res => {
        var articles = res.data.articles
        $("#saved_articles").html("")
        if (articles.length >= 1) {
          $("#empty_saved_articles").hide()
        } else {
          $("#empty_saved_articles").show()
        }
        articles.forEach(a => {
          $("#saved_articles").prepend(
            `<div class="container">
              <div class="card">
                <h5 class="card-header title">${a.title}</h5>
                <div class="card-body">
                  <p class="card-text summary">${a.summary}</p>
                  <p class="card-text url">${a.url}</p>
                  
                </div>
                <button id="view_notes"
                article-id="${a._id}"
                type="button" class="btn btn-success">Article Notes</button>
                <button id="delete_article"
                article-id="${a._id}"
                type="button" class="btn btn-danger">Delete From Saved</button>
              </div>
            </div>`
        )
      })
    })
    .catch(err => {
      console.log("Failed to get all saved articles. err: ", err)
    })
  }

  // when document ready, fetch all saved article and populate the dom
  fetchSavedArticles()

  // handle delete
  $(document).on("click", "#delete_article", function() {
    var id  = $(this).attr("article-id")
    axios.delete(`/article/${id}`)
      .then(res => {
        console.log("Article deleted res: ", res)
        fetchSavedArticles()
      })
      .catch(err => {
        console.log("Failed to delete article. err: ", err)
      })
  })

  // handle article notes
  $(document).on("click", "#view_notes", function(){
    // clear all texts:
    $("#modalCommentTextBox").val("")
    $("#commentsContainer").html("")

    $("#article_comments_modal").modal('show')
    var id  = $(this).attr("article-id")
    $("#article_comments_modal").data("articleId", id)
    $("#artile_modal_title").text(`Notes for Article: ${id}`)
    axios.get(`/article/${id}/comments`)
      .then(res => {
        var notes = res.data.comments
        console.log('notes', notes)
        notes.forEach((note, i) => {
          console.log('note.id: ', note._id)
          $("#commentsContainer").append(`
            <div class="container">
              <li class="comment-item">
                ${i + 1} - <strong>${note.body}</strong> <span id="delete-comment" class="delete-comment-button" note-id="${note._id}">&times</span>
              </li>
            </div>
          `)
        })
      })
      .catch(err => {
        console.log("Error when fetching notes for article. err: ", err)
      })
  })

    // delete comment
    $(document).on("click", "#delete-comment", function() {
      var id = $(this).attr("note-id")
      console.log('deleteId: ', id)
      axios.delete(`/comment/${id}`)
        .then(res => {
          console.log("Comment deleted", res)
        })
        .catch(err => {
          console.log("Failed to delete comment. err: ", err)
        })
        $("#article_comments_modal").modal('hide')
    })

    // add a comment
    $(document).on("click", "#saveComment", function() {
      var body = $("#modalCommentTextBox").val()
      var articleId = $("#article_comments_modal").data().articleId
      console.log("body: ", body, "articleId", articleId)
      axios.post("/comment", { body, articleId })
        .then(res => {
          console.log("saved comment. res: ", res)
        })
        .catch(err => {
          console.log("Failed to save comment. err: ", err)
        })
      $("#article_comments_modal").modal('hide')
    })
  })