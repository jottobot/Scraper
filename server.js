const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./models');

var PORT = process.env.PORT || 3000;
var MONGODB_URI = process.env.MONGODB_URI  || 'mongodb://localhost/womenshealth';
// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Initialize Express
const app = express();
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
// require('./routes/routes.js')(app);

// Routes
// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.womenshealthmag.com/beauty/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.simple-item.grid-simple-item.grid-simple-item-last-tablet").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(this)
        .children("a")
        .text() 
      result.url = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("div")
        .children("p")
        .text();

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

//GET requests to render Handlebars pages
module.exports = (app) => {
  // main page
  app.get('/', (req, res) => {
    // look for existing articles in database
    db.Article.find({})
      .then((dbArticle) => {
        res.render('index');
      })
      .catch((err) => {
        res.json(err);
      });
  });

// Saved API
app.get('/saved', (req, res) => {
  db.Article.find({ saved: true })
    .then((dbArticle) => {
      let articleObj = { article: dbArticle };

      // render page with articles found
      res.render('savedarticles', articleObj);
    })
    .catch((err) => {
      res.json(err);
    });
});

  // Route for getting all Articles from the db
  app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // save article
  app.put('/article/:id', (req, res) => {
    let id = req.params.id;

    db.Article.findByIdAndUpdate(id, { $set: { saved: true } })
      .then((dbArticle) => {
        res.json(dbArticle);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  // remove article from page 'saved'
  app.put('/article/remove/:id', (req, res) => {
    let id = req.params.id;

    db.Article.findByIdAndUpdate(id, { $set: { saved: false } })
      .then((dbArticle) => {
        res.json(dbArticle);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/article/:id", function (req, res) {
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
  app.post('/note/:id', (req, res) => {
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

  // delete note
  app.delete('/note/:id', (req, res) => {
    let id = req.params.id;

    db.Note.remove({ _id: id })
      .then((dbNote) => {
        res.json({ message: 'note removed!' });
      })
      .catch((err) => {
        res.json(err);
      });
  });
};

// // Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// // Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Save an article
app.post("/articles/save/:id", (req, res) => {
  // query by the article id to find and update its saved boolean
  Article.findOneAndUpdate({ _id: req.params.id }, { saved: true })
    // execute the above query
    .exec((err, doc) => {
      // log any errors
      if (err) {
        console.log(err);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});

// Delete an article
app.post("/articles/delete/:id", (req, res) => {
  // Use the article id to find and update its saved boolean
  Article.findOneAndUpdate({ _id: req.params.id }, { saved: false, notes: [] })
    // execute the above query
    .exec((err, doc) => {
      // log any errors
      if (err) {
        console.log(err);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});

// // Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
