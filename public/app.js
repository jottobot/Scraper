// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].headline + "<br />" + data[i].url + "<br />" + data[i].summary + "</p>");
  }
});

// Somehow broke this and still cannot get to work
// Clicking any "p" tag will give space to write note 
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h3>" + data.headline + "</h3>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.headline);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// Save article function but could not get
// "save article" button to append correctly
$(document).on("click", ".savedbutton", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "PUT",
    url: "/articles/" + thisId,
  })
    // With that done
    .then((data) => {
      location.reload();
  });
});















// // Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].headline + "<br />" + data[i].url + "<br />" + data[i].summary + "</p>");
//   }
// });


// const saveArticle = function () {
//   let id = $(this).data('id');

//   $.ajax({
//       url: `/article/${id}`,
//       method: 'PUT'
//   })
//       .then((data) => {
//           location.reload();
//       });
// };

// const removeArticle = function () {
//   let id = $(this).data('id');

//   $.ajax({
//       url: `/article/remove/${id}`,
//       method: 'PUT'
//   })
//       .then((data) => {
//           location.reload();
//       });
// };




// function addButton () {
//   var btn = $('<input type="button" value="Save Article" class="savedbutton" />');
//   btn.appendTo($("p"));
// }

// $('.savedbutton').on('click', saveArticle);
// $('.btn-remove').on('click', removeArticle);

// const viewNotes = function () {
//   let articleId = $(this).data('id');
//   // console.log(articleId)

//   // send request to get article's notes if exist
//   $.ajax({
//       url: `/article/${articleId}`,
//       method: 'GET'
//   })
//       .then((data) => {
//           // create modal with article id
//           $('.modal-content').html(`
//               <div class="modal-header">
//                   <h5 class="modal-title">${data.title}</h5>
//                   <button type="button" class="close" data-dismiss="modal" aria-label="Close">
//                   <span aria-hidden="true">&times;</span>
//                   </button>
//               </div>
//               <div class="modal-body">
//                   <ul class="list-group"></ul>
//                   <textarea name="note" class="note-content"></textarea>
//               </div>
//               <div class="modal-footer">
//                   <button type="button" data-id="${data._id}" class="btn btn-primary btn-save-note">Save Note</button>
//                   <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
//               </div>`
//           );

//           let totalNotes = data.note.length;

//           // if there is no note
//           if (totalNotes == 0) {
//               let message = `<small class="text-muted">This article doesn't have any note yet.</small>`;
//               $('.modal-body').prepend(message);
//           }
//           // if there is/are note(s)
//           else {
//               let notes = data.note;
//               // loop through notes and append to modal
//               notes.forEach(note => {
//                   $('.list-group').append(`
//                       <li class="list-group-item justify-content-between">
//                           ${note.body}
//                           <span><i class="material-icons" data-id="${note._id}">delete_forever</i></span>
//                       </li>
//                   `);
//               });
//           }

//           $('.modal').modal('show');
//       });
// };

// $('p').on('click', viewNotes);



// // // Whenever p tag is clicked the notes section pops up
// // $(document).on("click", "p", function() {
// //   // Empty the notes from the note section
// //   $("#notes").empty();
// //   // Save the id from the p tag
// //   var thisId = $(this).attr("data-id");

// //   addButton();

// //   // Now make an ajax call for the Article
// //   $.ajax({
// //     method: "GET",
// //     url: "/articles/" + thisId
// //   })
// //     // With that done, add the note information to the page
// //     .then(function(data) {
// //       console.log(data);
// //       // The title of the article
// //       $("#notes").append("<h3>" + data.headline + "</h3>");
// //       // An input to enter a new title
// //       $("#notes").append("<input id='titleinput' name='title' >");
// //       // A textarea to add a new note body
// //       $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
// //       // A button to submit a new note, with the id of the article saved to it
// //       $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

// //       // If there's a note in the article
// //       if (data.note) {
// //         // Place the title of the note in the title input
// //         $("#titleinput").val(data.note.title);
// //         // Place the body of the note in the body textarea
// //         $("#bodyinput").val(data.note.body);
// //       }
// //     });
// // });

// // When save note button is clicked...
// $(document).on("click", ".savedbutton", function() {
//   // Grab the id associated with the article from the submit button
//   var thisId = $(this).attr("data-id");

//   // Run a POST request to change the note, using what's entered in the inputs
//   $.ajax({
//     method: "POST",
//     url: "/articles/" + thisId,
//     data: {
//       // Value taken from title input
//       title: $("#titleinput").val(),
//       // Value taken from note textarea
//       body: $("#bodyinput").val()
//     }
//   })
//     // With that done
//     .then(function(data) {
//       // Log the response
//       console.log(data);
//       // Empty the notes section
//       $("#notes").empty();
//     });

//   // Also, remove the values entered in the input and textarea for note entry
//   $("#titleinput").val("");
//   $("#bodyinput").val("");
// });

// // const saveArticle = function () {
// //   let id = $(this).data('id');

// //   $.ajax({
// //       url: `/article/${id}`,
// //       method: 'PUT'
// //   })
// //       .then((data) => {
// //           location.reload();
// //       });
// // };

// // // function to remove an article
// // var removeArticle = function () {
// //   let id = $(this).data('id');

// //   $.ajax({
// //       url: `/article/remove/${id}`,
// //       method: 'PUT'
// //   })
// //       .then((data) => {
// //           location.reload();
// //       });
// // };