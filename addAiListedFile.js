export default function addAiListedFile({ id, title, url, description = '', date = new Date(), tags = [] } = {}) {
  if (!id || !title || !url) return;

  let parsedUrl;
  try {
    parsedUrl = new URL(url, window.location.origin);
  } catch {
    return;
  }
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') return;

  const container = document.querySelector('#ai-file-list') || document.querySelector('[data-ai-file-list]');
  if (!container) return;

  // Prevent duplicates by checking existing dataset.id values
  const exists = Array.from(container.querySelectorAll('.ai-file-card'))
    .some(card => card.dataset.id === id);
  if (exists) return;

  const card = document.createElement('div');
  card.classList.add('ai-file-card', 'glass-card', 'fade-up');
  card.dataset.id = id;
  if (Array.isArray(tags) && tags.length > 0) {
    card.dataset.tags = tags.join(',');
  }

  // Format date
  const dateObj = date instanceof Date ? date : new Date(date);
  const formattedDate = isNaN(dateObj.valueOf()) ? '' : dateObj.toLocaleDateString();

  // Build card header
  const header = document.createElement('div');
  header.classList.add('card-header');

  const titleEl = document.createElement('h3');
  titleEl.classList.add('neon-text');
  titleEl.textContent = title;

  const dateEl = document.createElement('span');
  dateEl.classList.add('file-date');
  dateEl.textContent = formattedDate;

  header.appendChild(titleEl);
  header.appendChild(dateEl);

  // Description
  const descEl = document.createElement('p');
  descEl.classList.add('card-description');
  descEl.textContent = description;

  // Link
  const linkEl = document.createElement('a');
  linkEl.classList.add('neon-link');
  linkEl.href = parsedUrl.href;
  linkEl.target = '_blank';
  linkEl.rel = 'noopener noreferrer';
  linkEl.textContent = 'Open File';

  // Assemble card
  card.appendChild(header);
  card.appendChild(descEl);
  card.appendChild(linkEl);
  container.appendChild(card);

  requestAnimationFrame(() => {
    card.classList.add('visible');
  });
}