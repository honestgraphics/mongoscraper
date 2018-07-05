$(document).ready(function(){
  $(document).on("click", "#save_article", function() {
    var url  = $(this).attr("article-url")
    var title = $(this).attr("article-title")
    var summary = $(this).attr("article-summary")
    // var time = $(this).attr("article-time")
    var a = $(this).attr("article-a")
    console.log('a.title: ', a.title)
    var article = {url, title, summary, /*time*/}
    axios.post("/article", article)
      .then(res => {
        console.log("Article saved. res: ", res)
        $(this).parents(".card").remove()
      })
      .catch(err => {
        console.log("Failed to save article. err: ", err)
      })
  })
  $("#btn_scrape").on("click", function(){
    // make api call with axios, and append articles to the dom  // <p class="card-text time">${a.time}</p>
    axios.get("/scrape")
      .then(res => {
        console.log('res: ', res)
        var articles = res.data.articles
        if (articles) {
          articles.forEach(a => {
            $("#articles").prepend(
              `<div class="container">
                <div class="card article-item">
                  <h5 class="card-header title">${a.title}</h5>
                  <div class="card-body">
                    <p class="card-text summary">${a.summary}</p>
                    <p class="card-text url">${a.url}</p>
                  </div>
                  <button id="save_article"
                  article-url="${a.url}"
                  article-summary="${a.summary}"
                  article-title="${a.title}"
                  // article-time="${a.time}"
                  article-a="${a}"
                  type="button" class="btn btn-success index-btn">Save Article!</button>
                </div>
              </div>`
            )
          })
        }
        // show modal
        $("#scrape_results_label").text(`Added ${articles.length} new Articles!`)
        $('#scrape_results_modal').modal('show'); 
      })
      .catch(err => {
        // probably show dialog with error
        console.log('error occurred scraping articles. err: ', err)
      })
  })
})