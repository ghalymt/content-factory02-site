'use strict';

(function returnToLocalApp() {
  const status = document.getElementById('connection-status');
  const retry = document.getElementById('return-button');
  let destination = null;
  try {
    const query = window.location.search;
    const parameters = new URLSearchParams(query);
    const keys = [...parameters.keys()];
    const validValue = value => typeof value === 'string' && value.length > 0 && value.length <= 8192 && !/[^\x21-\x7e]/.test(value);
    if (query.length > 32768 || /%(?![0-9a-f]{2})/i.test(query) || keys.length !== 2 ||
        parameters.getAll('code').length !== 1 || parameters.getAll('state').length !== 1 ||
        keys.some(key => key !== 'code' && key !== 'state') ||
        !validValue(parameters.get('code')) || !validValue(parameters.get('state'))) {
      throw new Error('Invalid login return');
    }
    const target = new URL('http://localhost:5678/rest/oauth2-credential/callback');
    target.searchParams.set('code', parameters.get('code'));
    target.searchParams.set('state', parameters.get('state'));
    destination = target.href;
  } catch (_) {
    status.textContent = 'This connection was not completed. Return to the local app and start a fresh Instagram connection when ready.';
  }
  // Remove codes/state from the visible address before any navigation or click.
  try {
    window.history.replaceState(null, '', window.location.pathname);
  } catch (_) {
    destination = null;
    status.textContent = 'This browser could not prepare the return safely. Close this page and start a fresh connection from the local app.';
  }
  if (!destination) return;
  status.textContent = 'Returning to your local app. Keep n8n open on this computer.';
  retry.hidden = false;
  function navigate() {
    try {
      window.location.replace(destination);
    } catch (_) {
      status.textContent = 'Your browser stopped the return. Keep the local app open and use the return button, or restart the connection.';
    }
  }
  retry.addEventListener('click', navigate);
  navigate();
})();
