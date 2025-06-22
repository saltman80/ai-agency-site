const ACCEPTED_TYPES = ['application/json', 'text/csv', 'text/plain', 'text/markdown'];
  const ACCEPTED_EXTENSIONS = ['.json', '.csv', '.txt', '.md'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const STORAGE_KEY = 'registeredAiFiles';

  let fileInput, dropZone, selectedListContainer, registeredListContainer, errorContainer, registerButton;
  let selectedFiles = [];

  function init() {
    fileInput = document.getElementById('ai-file-input');
    dropZone = document.getElementById('ai-file-dropzone');
    selectedListContainer = document.getElementById('ai-file-selected-list');
    registeredListContainer = document.getElementById('ai-file-registered-list');
    errorContainer = document.getElementById('ai-file-error');
    registerButton = document.getElementById('ai-file-register-btn');

    if (!fileInput || !dropZone || !selectedListContainer || !registeredListContainer || !errorContainer || !registerButton) {
      console.warn('AiFileRegister: Missing required DOM elements');
      return;
    }

    renderRegisteredFiles();

    fileInput.addEventListener('change', function(e) {
      clearError();
      handleFiles(e.target.files);
    });

    ['dragenter', 'dragover'].forEach(function(evt) {
      dropZone.addEventListener(evt, function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(function(evt) {
      dropZone.addEventListener(evt, function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
      });
    });

    dropZone.addEventListener('drop', function(e) {
      clearError();
      handleFiles(e.dataTransfer.files);
    });

    registerButton.addEventListener('click', function() {
      clearError();
      if (selectedFiles.length === 0) {
        showError('No files selected to register.');
        return;
      }
      registerSelectedFiles();
    });
  }

  function handleFiles(fileList) {
    const list = Array.from(fileList);
    list.forEach(function(file) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        showError('Unsupported file type: ' + file.name);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        showError('File too large (max ' + (MAX_FILE_SIZE/1024/1024) + 'MB): ' + file.name);
        return;
      }
      if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
        console.warn('Unrecognized MIME type for file, proceeding based on extension:', file.name);
      }
      const duplicate = selectedFiles.some(function(f) {
        return f.name === file.name && f.size === file.size;
      });
      if (duplicate) {
        console.warn('File already selected:', file.name);
        return;
      }
      selectedFiles.push(file);
    });
    renderSelectedFiles();
  }

  function renderSelectedFiles() {
    selectedListContainer.innerHTML = '';
    if (selectedFiles.length === 0) return;
    const ul = document.createElement('ul');
    ul.classList.add('ai-file-selected-ul');
    selectedFiles.forEach(function(file) {
      const li = document.createElement('li');
      li.textContent = file.name + ' (' + (file.size/1024).toFixed(1) + ' KB)';
      ul.appendChild(li);
    });
    selectedListContainer.appendChild(ul);
  }

  function registerSelectedFiles() {
    const readers = selectedFiles.map(function(file) {
      return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onload = function() {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            content: reader.result,
            registeredAt: new Date().toISOString()
          });
        };
        reader.onerror = function() {
          reject('Failed to read file: ' + file.name);
        };
        reader.readAsText(file);
      });
    });

    Promise.all(readers)
      .then(function(results) {
        const existing = getStoredFiles();
        const merged = existing.concat(results);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch (e) {
          if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            showError('Storage quota exceeded: unable to save files. Please remove some registered AI files before adding more.');
          } else {
            showError('Error saving files: ' + e.message);
          }
          return;
        }
        selectedFiles = [];
        renderSelectedFiles();
        renderRegisteredFiles();
      })
      .catch(function(err) {
        showError(err);
      });
  }

  function getStoredFiles() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function renderRegisteredFiles() {
    registeredListContainer.innerHTML = '';
    const files = getStoredFiles();
    if (files.length === 0) {
      registeredListContainer.textContent = 'No AI files registered.';
      return;
    }
    const ul = document.createElement('ul');
    ul.classList.add('ai-file-registered-ul');
    files.forEach(function(file) {
      const li = document.createElement('li');
      li.classList.add('ai-file-registered-li');
      const nameSpan = document.createElement('span');
      nameSpan.textContent = file.name;
      nameSpan.classList.add('ai-file-name');
      const dateSpan = document.createElement('span');
      dateSpan.textContent = new Date(file.registeredAt).toLocaleString();
      dateSpan.classList.add('ai-file-date');
      li.appendChild(nameSpan);
      li.appendChild(document.createTextNode(' ? '));
      li.appendChild(dateSpan);
      ul.appendChild(li);
    });
    registeredListContainer.appendChild(ul);
  }

  function clearError() {
    errorContainer.textContent = '';
    errorContainer.classList.remove('visible');
  }

  function showError(msg) {
    errorContainer.textContent = msg;
    errorContainer.classList.add('visible');
  }

  document.addEventListener('DOMContentLoaded', init);
})();