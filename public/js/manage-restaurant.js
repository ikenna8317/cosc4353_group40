const table = document.getElementById('resultTable');
let deleteButtons = document.querySelectorAll('.delete-btn');
// const modifyForm = document.getElementById('modifyForm');
// let formData;

document.getElementById('modifyForm').addEventListener('submit', async function (event) {
  event.preventDefault(); 
  
  showLoadingIndicator();
  hideContent();

  // console.log(formData)
  // return;

  const restaurantName = document.getElementById("restaurantName").value;

  // console.log(restaurantName);
  // return;
  const ticketNo = document.getElementById("ticketNo").value;
  const date = document.getElementById("date").value;
  const numOfSeats = document.getElementById("numOfSeats").value;

  if (restaurantName === '' || ticketNo === '' || date === '' || numOfSeats === '') {
    alert('All fields are required');
    return;
  }

  fetch('/pos/manage-restaurant', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ restaurantName, ticketNo, date, numOfSeats }) 
  })
  .then(response => {
    if (!response.ok) 
      throw new Error('error reloading data');
    
    return response.json();
  }).then(data => {
    //ticket_no, _date, num_of_people

    location.reload();
    return;
    const tableBody = document.getElementById('resultTable');
    tableBody.innerHTML = `
    <th scope="col">Ticket number</th>
    <th scope="col">Reservation date</th>
    <th scope="col">Seats</th>
    <th scope="col">-</th>
    `;

    let i = 1;
    //button.btn.btn-danger.delete-btn(data-id=i) Remove
    data.forEach(item => {
        const row = document.createElement('tr');
        // th(scope="col") Ticket number 
        //                         th(scope="col") Reservation date
        //                         th(scope="col") Seats
        //                         th(scope="col") -
  
        row.innerHTML = `
            <th scope="row">${item.ticket_no}</td>
            <td>${item._date}</td>
            <td>${item.num_of_people}</td>
            <td class="remove-btn">
              <button class="btn btn-danger delete-btn" data-id="${i}">Remove</button>
            </td>
        `;
        tableBody.appendChild(row); // Append row to table
        i++;
    });
    updateTableButtons();
    hideLoadingIndicator();
    showContent();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error fetching the table data');
    hideLoadingIndicator();
    showContent();
  });
});

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

    fetch('/pos/manage-restaurant', {
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
        alert('Unable to delete restaurant reservation');
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
      table.deleteRow(rowNumber);
    }
  }

function getColumnValues(rowNumber) {
    
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