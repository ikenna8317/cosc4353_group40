const registerDeleteButtons = () =>  { 
  const deleteButtons = document.querySelectorAll('.remove-btn');
  deleteButtons.forEach(button => {
  button.addEventListener('click', removeParkEvent);
});
}

const removeParkEvent = (event) => {
  // const rowId = this.getAttribute('data-id');
  const btn = event.target;
  const row = btn.closest('tr');
  let eventNo;

  if (row) {
    console.log(row.querySelector('th').textContent);
    eventNo = row.querySelector('th').textContent.trim();
  }
  else {
    console.error('Unable to read row');
    return;
  }  

  console.log(eventNo);
  // console.log('deleting row ' + rowId);
  // return;

  if (!eventNo) {
    console.error("event number is invalid");
    return;
  }

  showLoadingIndicator();
  hideContent();

  fetch('/mgr/manage-events', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ eventNo }),
    })
    .then(response => {
      if (!response.ok)
        throw new Error('Unable to delete item');

      const btn = event.target;
      const row = btn.closest('tr');

      if (row) {
        row.parentNode.removeChild(row);
      }
      // deleteRow(rowId);
      // updateTableButtons();
      hideLoadingIndicator();
      showContent();
    })
    .catch(error => {
      alert('Unable to delete event!');
      hideLoadingIndicator();
      showContent();
      console.error(error);
    });
}

document.addEventListener('DOMContentLoaded', registerDeleteButtons);


async function updateEvent(event) {
  event.preventDefault();

  const no = document.getElementById('no').value;
  const name = document.getElementById('name').value;
  const imgUrl = document.getElementById('imgUrl').value;
  const desc = document.getElementById('desc').value;
  const date = document.getElementById('date').value;


  showLoadingIndicator();
  hideContent();

  fetch('/mgr/manage-events', {
    method: 'POST',
    body: JSON.stringify({ no, name, imgUrl, desc, date }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('error reloading data');
    }

    return response.json();
  }).then(data => {
    document.getElementById('table-container').innerHTML = '';
    createTable(['Event no', 'Event name', 'Event date', '-'], ['event_no', '_name', 'event_date'], data);
    hideLoadingIndicator();
    showContent();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error fetching the table data');
    hideLoadingIndicator();
    showContent();
  });

}

//load event
async function loadAllEvents(event) {
  event.preventDefault();

  showLoadingIndicator();
  hideContent();
  // Load-All

  fetch('/mgr/manage-events', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Load-All': 'true'
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('error reloading data');
    }

    return response.json();
  }).then(data => {
    document.getElementById('table-container').innerHTML = '';
    //headers, colHeaders, data
    createTable(['Event no', 'Event name', 'Event date'], ['event_no', '_name', 'event_date'], data);
    hideLoadingIndicator();
    showContent();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error fetching the table data');
    hideLoadingIndicator();
    showContent();
  });

}


//modify form
document.getElementById('modifyForm').addEventListener('submit', (e) => updateEvent(e));

document.getElementById('loadAllBtn').addEventListener('click', (e) => loadAllEvents(e));

function createTable(headers, colHeaders, data) {
  var table = document.createElement('table');
  table.id = 'resultTable';
  table.className = 'table table-striped'

  // Create table header
  var headerRow = table.insertRow();
  headers.forEach(function(headerText) {
    var th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  })
  // Create table body
  // headers = ['staff_no', 'fname', 'lname'];
  data.forEach(function(obj) {
    var row = table.insertRow();
    colHeaders.forEach(function(header) {
      var cell = row.insertCell();
      cell.textContent = obj[header];
    });

    var deleteCell = row.insertCell();
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Cancel';
    deleteButton.className = 'btn btn-danger remove-btn';
    deleteButton.addEventListener('click', removeParkEvent);

    deleteCell.appendChild(deleteButton);

    
  });
  //button.btn.btn-danger.remove-btn Dismiss

  document.getElementById('table-container').appendChild(table);
  // registerDeleteButtons();
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
