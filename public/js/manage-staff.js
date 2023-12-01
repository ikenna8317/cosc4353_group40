const registerDeleteButtons = () =>  { 
  const deleteButtons = document.querySelectorAll('.remove-btn');
  deleteButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    // const rowId = this.getAttribute('data-id');
    const btn = event.target;
    const row = btn.closest('tr');
    let staffNo;
  
    if (row) {
      // console.log(row.querySelector('th').textContent);
      staffNo = row.querySelector('th').textContent.trim();
    }
    else {
      console.error('Unable to read row');
      return;
    }  
  
    console.log(staffNo);
    // console.log('deleting row ' + rowId);
    // return;
  
    if (!staffNo) {
      console.error("staff number is invalid");
      return;
    }
  
    showLoadingIndicator();
    hideContent();
  
    fetch('/mgr/manage-staff', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ staffNo }),
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
        alert('Unable to delete staff!');
        hideLoadingIndicator();
        showContent();
        console.error(error);
      });
  });
});
}

document.addEventListener('DOMContentLoaded', registerDeleteButtons);


async function updateStaff(event) {
  event.preventDefault();

  const no = document.getElementById('no').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const weekWage = document.getElementById('weekWage').value;
  const department = document.getElementById('department').value;


  showLoadingIndicator();
  hideContent();

  fetch('/mgr/manage-staff', {
    method: 'POST',
    body: JSON.stringify({ no, phone, address, weekWage, department }),
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
    createTable(['Staff no', 'First name', 'Last name', 'Phone number', 'Address', 'Week wage', 'Department', '-'], ['staff_no', 'fname', 'lname', 'phone_no', 'address', 'week_wage', 'd_name'], data);
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

//load staff
async function loadAllStaff(event) {
  event.preventDefault();

  showLoadingIndicator();
  hideContent();
  // Load-All

  fetch('/mgr/manage-staff', {
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
    createTable(['Staff no', 'First name', 'Last name', 'Phone', 'Address', 'Week wage', 'Department'], ['staff_no', 'fname', 'lname', 'phone_no', 'address', 'week_wage', 'd_name'], data);
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
document.getElementById('modifyForm').addEventListener('submit', (e) => updateStaff(e));

document.getElementById('loadAllBtn').addEventListener('click', (e) => loadAllStaff(e));

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
    deleteButton.textContent = 'Dismiss';
    deleteButton.className = 'btn btn-danger remove-btn';

    // deleteButton.addEventListener('click', registerDeleteBtn);

    deleteCell.appendChild(deleteButton);

    
  });
  //button.btn.btn-danger.remove-btn Dismiss

  document.getElementById('table-container').appendChild(table);
  registerDeleteButtons();
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
