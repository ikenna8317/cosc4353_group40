const table = document.getElementById('resultTable');
let deleteButtons = document.querySelectorAll('.delete-btn');

document.getElementById('modifyForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent default form submission
  
  const ticketNo = document.getElementById("ticketNo").value;
  const book_date = document.getElementById("book_date").value;
  const suite_choice = document.getElementById("suite_choice").value;
  const hours_choice = document.getElementById("hours_choice").value;
  
  showLoadingIndicator();
  hideContent();

  fetch('/pos/manage-resort', {
    method: 'POST',
    body: JSON.stringify({ book_date, ticketNo, suite_choice , hours_choice }),
    headers: {
      'Content-Type': 'application/json'
    },
   
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('error reloading data');
    }
    return response.json();
  }).then(data => location.reload())
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error fetching the table data');
    hideLoadingIndicator();
    showContent();
  });
});

// Add event listeners to each delete button
const registerDeleteButtons = () =>  { 
  deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
  button.addEventListener('click', function() {
    const rowId = this.getAttribute('data-id');
    const ticketNum = getColumnValues(rowId)[0];

    if (ticketNum === null) {
      console.error("Ticket number is invalid");
      return;
    }

    showLoadingIndicator();
    hideContent();

    fetch('/pos/manage-resort', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketNum }),
      })
      .then(response => {
        if (!response.ok)
          throw new Error('Unable to delete item');
        deleteRow(rowId);
        updateTableButtons();
        hideLoadingIndicator();
        showContent();
      })
      .catch(error => {
        alert('Unable to delete resort reservation');
        hideLoadingIndicator();
        showContent();
        // deleteRow(rowId);
        console.error(error);
      });

    console.log(`Deleting row with ID: ${rowId}`);
  });
});
}
registerDeleteButtons();

function updateTableButtons() {
  console.log('Updated buttons');
  const table = document.getElementById('resultTable');
  const rows = table.getElementsByTagName('tr');

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByClassName('remove-btn');
    cells[0].innerHTML = `<button class="btn btn-danger delete-btn" data-id=${i}>Remove</button>`;
  }
  registerDeleteButtons();
}

function deleteRow(rowNumber) {
  var table = document.getElementById('resultTable');
  if (rowNumber >= 0 && rowNumber < table.rows.length) {
    table.deleteRow(rowNumber); // Remove the row by row index
  }
}

function getColumnValues(rowNumber) {
    const table = document.getElementById('resultTable');
    if (rowNumber >= 0 && rowNumber < table.rows.length) {
      const row = table.rows[rowNumber];
      const cells = row.cells;
  
      const columnValues = [];
      for (let i = 0; i < cells.length; i++) {
        columnValues.push(cells[i].textContent);
      }
      return columnValues;
    } else {
      return null; 
    }
  }
  
function showLoadingIndicator() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  loadingIndicator.style.display = 'block';
}
function showContent() {
  const loadingIndicator = document.getElementById('load-finish');
  loadingIndicator.style.display = 'block';
}


function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  loadingIndicator.style.display = 'none';
}
function hideContent() {
  const loadingIndicator = document.getElementById('load-finish');
  loadingIndicator.style.display = 'none';
}