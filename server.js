// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// // Set mongoose to leverage built in JavaScript ES6 Promises
// // Connect to the Mongo DB
// mongoose.Promise = Promise;
// mongoose.connect(MONGODB_URI);

//// Our scraping tools
var cheerio = require ("cheerio");
//// Axios is a promised-based http library, similar to jQuery's Ajax method
//// It works on the client and on the server
// var axios = require("axios");

//// 
var request = require("request");
var express = require("express");
var handlebars = require("express-handlebars")
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var articleController = require("./controller/articleController")
var commentController = require("./controller/commentController")

// Initialize Express
var app = express();

// Configure middleware
// Use morgan logger for logging requests
// app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

// view settings
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// configure app with article controller
articleController(app)
// configure app with comment controller
commentController(app)

app.get("/", (req, res) => {
  res.render("index")
})

app.get("/saved", (req, res) => {
  res.render("saved")
});

// Connect to the Mongo DB
const url = process.env.MONGODB_URI || "mongodb://localhost/mongoosescraper";
mongoose.connect(url);
var db = mongoose.connection

// show db errors 
db.on("error", (err) => {
  console.log("DB Error: ", err);
});

db.on("open", () => {
  console.log("DB Connection successful");
});

// Require all models
var articleModel = require("./models/article");
/*var commentModel = require("./models/comment")*/
// articleModel.create({
//   title: "hello",
//   summary: "articlesummary",
//   url: "sampleurl"
// }).then(function(placeholder){
//   console.log("thing we saved", placeholder)
// });

function comparer (arr1) {
  return function(item1) {
    return arr1.filter(item2 => {
      return item1.url === item2.url
    }).length === 0
  }
}


// Routes
// A GET route for scraping the wizs website
app.get("/scrape", (req, res) => {
  console.log("hittin route");
  // Make a request call to grab the HTML body from the site of your choice
  request("http://www.wizs.com", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var results = [];
    
    
    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works
    // console.log($("div.slide-content").children)
    $(".slide-content").each(function(i, element) {
      // var time = $(element).find(".slide-meta").find(".time.slide-meta-time .updated").contents();
      // console.log("time: ", time)
      var url = $(element).find("h3.slide-entry-title.entry-title").find("a").attr("href");
      var summary = $(element).find(".slide-entry-excerpt.entry-content").text() || 'No summary available!'
      // console.log("summarysibling", summary);
      var title = $(element).contents([1]).children("h3.slide-entry-title.entry-title").text();
      // var newTitle = $(element).children("header.entry-content-header").contents([1])
      // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        // time: 'This feature will be added in the near future!',
        title: title,
        summary: summary,
        url: url
      });
    });

    
    
    // console.log("entrysummary", $(".entry-content").html())
    // $(".entry-content").each(function(i, element) {
      //   var summary = $(this).text();
      //   // console.log("summary", summary);
      //   results[i].summary = summary;
      // })
      
      // Log the results once you've looped through each of the elements found with cheerio
      /*console.log("results", results);
      articleModel.insertMany(results, (err) => {
        if (err) {
          console.log('failed to save results. err: ', err)
          res.status(500).json({ msg: "Failed "})
        }
        console.log("Saved results")
      })*/
      // fetch already saved ones
      articleModel.find({}, (err, docs) => {
        if (err) {
          return res.status(200).json({ articles: docs })
        }
        var uniqueResults = []
        for (i = 0; i < results.length; i++) {
          var unique = true
          for(j = 0; j < docs.length; j++) {
            if (docs[j].url === results[i].url) {
              unique = false
              break
            }
          }
          if (unique) {
            uniqueResults.push(results[i])
          }
        }
        return res.status(200).json({ articles: uniqueResults })
      })
  });
});

var PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});