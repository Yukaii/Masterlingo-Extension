function saveOptions() {
  const autoAudio = document.getElementById('autoAudio').checked,
    activePages = document.getElementById('activePages').value,
    highlightElements = document.getElementById('highlightElements').value;
  modifier = document.getElementById('modifier').value;
  chrome.storage.sync.set(
    {
      autoAudio,
      activePages,
      highlightElements,
      modifier
    },
    function() {
      document.getElementById('save').style.display = 'none';
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get(
    {
      autoAudio: true,
      activePages: 'all',
      highlightElements: 'all',
      modifier: 'none'
    },
    function(settings) {
      document.getElementById('autoAudio').checked = settings.autoAudio;
      document.getElementById('activePages').value = settings.activePages;
      document.getElementById('highlightElements').value = settings.highlightElements;
      document.getElementById('modifier').value = settings.modifier;
      if (document.getElementById('highlightElements').value === 'all') {
        document.querySelector('#warning').style.display = 'block';
      }
    }
  );
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

[
  document.getElementById('autoAudio'),
  document.getElementById('activePages'),
  document.getElementById('highlightElements'),
  document.getElementById('modifier')
].forEach(el =>
  el.addEventListener('change', () => {
    document.getElementById('save').style.display = 'block';
    if (document.getElementById('highlightElements').value === 'all') {
      document.querySelector('#warning').style.display = 'block';
    } else {
      document.querySelector('#warning').style.display = 'none';
    }
  })
);
