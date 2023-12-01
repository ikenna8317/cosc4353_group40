// const table = document.getElementById('resultTable');


document.getElementById('reportForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  //read in form data here
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const ride = document.getElementById('ride').value;

  showLoadingIndicator();
  hideContent();

  fetch('/pos/rp-report', {
    method: 'POST',
    body: JSON.stringify({ startDate, endDate, ride }),
    headers: {
      'Content-Type': 'application/json'
    },
   
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('error reloading data');
    }
    return response.json();
  }).then(data => {
    document.getElementById('table-container').innerHTML = '';
    createTable(['Ride name', 'Total visitors'], data);
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

// createTable(['name', 'age', 'class'], [{n: 'martha', age: 19, class: 22}, {n: 'martha', age: 19, class: 22}])

function createTable(headerList, jsonData) {
    const tableContainer = document.getElementById('table-container');
    const table = document.createElement('table');

    table.className = 'table table-striped';
    table.id = 'resultTable';

    const header = table.createTHead();
    const row = header.insertRow();
  
    headerList.forEach(headerData => {
      const th = document.createElement('th');
      th.textContent = headerData;
      row.appendChild(th);
    });
  
    jsonData.forEach(obj => {
      const row = table.insertRow();
      Object.values(obj).forEach(value => {
        const cell = row.insertCell();
        cell.textContent = value;
      });
    });
  
    tableContainer.appendChild(table);
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
