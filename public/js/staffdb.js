// Assuming progress percentage is available in variable 'progressPercentage'
const progressElement = document.querySelector('.progress-circle');

function updateProgress(progress) {
  const degrees = (progress / 100) * 360;
  if (progressElement) {
    progressElement.style.transform = `rotate(${degrees}deg)`;
    console.log('progresss element updated')
  } else {
    console.log('progresss element not updated')

  }
}

// Call the updateProgress function with the desired progress percentage
updateProgress(50); // Example: sets progress to 50%
// console.log('suck');
