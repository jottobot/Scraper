const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const axios = require('axios');
const cheerio = require('cheerio');

const db = require('./models');

var PORT = process.env.PORT || 3000;
var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/womenshealth';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Initialize Express
const app = express();
const exphbs = require("express-handlebars");
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Routes
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.womenshealthmag.com/beauty/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // grabbing each article
    $("div.simple-item.grid-simple-item.grid-simple-item-last-tablet").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(this)
        .children("a")
        .text()
      result.date = $(this)
        .children("a")
        .text();
      result.url = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("div")
        .children("p")
        .text();

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});

// main page
app.get('/', (req, res) => {
  // look for existing articles in database
  db.Article.find({})
    .then((dbArticle) => {
      console.log(dbArticle);
      res.render('index');
    })
    .catch((err) => {
      res.json(err);
    });
})

// Display all articles in JSON format
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// save article
app.post('/article/save', (req, res) => {
});

// Route for grabbing a specific Article by id, populate it with it's note
app.post("/article/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// get current notes
app.get('/article/:id', (req, res) => {
  let id = req.params.id;
  // cannot get notes associated with article, only the very first one
  db.Article.findById(id)
    .populate('note')
    .then((dbArticle) => {
      res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
});

// save new note
app.put('/note/:id', (req, res) => {
  let id = req.params.id;

  db.Note.create(req.body)
    .then((dbNote) => {
      return db.Article.findOneAndUpdate({
        _id: id
      }, {
          $push: {
            note: dbNote._id
          }
        }, {
          new: true, upsert: true
        });
    })
    .then((dbArticle) => {
      res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
});

// // Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// // Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
