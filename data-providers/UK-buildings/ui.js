import { processAndRenderProjectGeojson } from "./script.js";

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const processButton = document.getElementById('processButton');
  const statusMessageElement = document.getElementById('statusMessage');
  const storedApiKey = localStorage.getItem('apiKey');
  if (storedApiKey) {
    apiKeyInput.value = storedApiKey;
  }

  processButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      alert('Please enter an API key.');
      return;
    }
    localStorage.setItem('apiKey', apiKey);
    updateStatus('Processing...', 'inProgress');

    try {
      processAndRenderProjectGeojson(apiKey).then(() => {
        updateStatus('Data processing completed successfully. Please check Library', 'success');
      }).catch((error) => {
        updateStatus('Failed to process data: ' + error.message, 'failed');
      });
    } catch (error) {
      updateStatus('Failed to process data: ' + error.message, 'failed');
    }
  });

  function updateStatus(message, status) {
    statusMessageElement.innerHTML = message;
    switch (status) {
      case 'inProgress':
        statusMessageElement.style.color = 'blue';
        break;
      case 'success':
        statusMessageElement.style.color = 'green';
        break;
      case 'failed':
        statusMessageElement.style.color = 'red';
        break;
      default:
        statusMessageElement.style.color = 'black';
    }
  }
});
