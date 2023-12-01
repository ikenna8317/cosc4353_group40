
document.getElementById('addForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    showLoadingIndicator();
    hideContent();

    const name = document.getElementById('name').value;
    const imgUrl = document.getElementById('imgUrl').value;
    const desc = document.getElementById('desc').value;
    const date = document.getElementById('date').value;

    fetch('/mgr/add-event', {
        method: 'POST',
        body: JSON.stringify({ name, imgUrl, desc, date }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok)
            throw new Error('Unable to add event')
        alert('Successfully added new event');
    })
    .catch(err => {
        console.error(err);
        alert('Unable to add new event');
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
