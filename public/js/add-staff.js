
document.getElementById('addForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    showLoadingIndicator();
    hideContent();

    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const weekWage = document.getElementById('weekWage').value;
    const department = document.getElementById('department').value;

    fetch('/mgr/add-staff', {
        method: 'POST',
        body: JSON.stringify({ fname, lname, phone, address, weekWage, department }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok)
            throw new Error('Unable to add staff')
        alert('Successfully added new staff');
    })
    .catch(err => {
        console.error(err);
        alert('Unable to add new staff');
    });
    hideLoadingIndicator();
    showContent();
});


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
