var currentNote = 1; // Starting note number
var totalNotes = 7; // Total number of notes

var noteTitleElement = document.querySelector('.note-title');
var noteContentElement = document.querySelector('.note-content');
var previousButton = document.getElementById('previousButton');
var nextButton = document.getElementById('nextButton');

// Function to display the current note
function displayNote() {
  // Get the note based on the currentNote variable
  var note = getNote();

  // Set the note title and content in the HTML
  noteTitleElement.textContent = note.title;
  noteContentElement.innerHTML = note.content;

  // Disable/enable previous and next buttons based on the currentNote
  previousButton.disabled = (currentNote === 1);
  nextButton.disabled = (currentNote === totalNotes);
}

// Function to retrieve the note based on the currentNote
function getNote() {
  // Define the notes and their titles/content
  var notes = [
    {
      title: 'Relationship with God',
      content: 'The Bible emphasizes the importance of a personal relationship with God...'
    },
    // Add more notes here with title and content properties
    {
      title: 'Service and Generosity',
      content: 'The Bible teaches men to serve others and show generosity...'
    }
  ];

  // Return the note based on the currentNote index
  return notes[currentNote - 1];
}

// Event listener for the previous button
previousButton.addEventListener('click', function() {
  if (currentNote === 1) {
    currentNote = totalNotes;
  } else {
    currentNote--;
  }
  displayNote();
});

// Event listener for the next button
nextButton.addEventListener('click', function() {
  if (currentNote === totalNotes) {
    currentNote = 1;
  } else {
    currentNote++;
  }
  displayNote();
});

// Display the initial note
displayNote();
