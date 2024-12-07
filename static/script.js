document.addEventListener('DOMContentLoaded', () => {
  const searchLawsInput = document.getElementById('search-laws');
  const lawButtons = document.querySelectorAll('.law-button');
  const lawContent = document.getElementById('law-content');
  const loginBtn = document.getElementById('login-btn');
  const searchTextInput = document.getElementById('search-text');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const iconMoon = document.getElementById('theme-icon-moon');
  const iconSun = document.getElementById('theme-icon-sun');
  const themeText = document.getElementById('theme-text');
  const fontToggleBtn = document.getElementById('font-toggle-btn');
  const fontDropdown = document.getElementById('font-dropdown');
  const bodyElement = document.body;
  const searchResultsContainer = document.getElementById('search-results');
  const lawCache = {};
  let currentLawId = null;
  let originalLawContent = null;

  // Elementos para Handles
  const leftHandle = document.querySelector('.left-handle');
  const rightHandle = document.querySelector('.right-handle');
  const leftSidebar = document.querySelector('.left-sidebar');
  const rightSidebar = document.querySelector('.right-sidebar');

  function showTemporaryMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'temporary-message';
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    setTimeout(() => {
      msgDiv.remove();
    }, 3000);
  }

  let debounceTimer;
  searchLawsInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = searchLawsInput.value.toLowerCase();
      lawButtons.forEach(button => {
        const text = button.textContent.toLowerCase();
        button.parentElement.style.display = text.includes(query) ? 'block' : 'none';
      });
    }, 300);
  });

  function getDepth(path) {
    return path.split('.').length;
  }

  function generateId(type, identifier) {
    let id = type.toLowerCase().replace(/\s+/g, '-');
    if (identifier) {
      id += `-${identifier.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`;
    }
    return id;
  }

  function displayLawContent(data) {
    let htmlContent = ``;
    const childTypes = new Set(['Artigo', 'Inciso', 'Parágrafo', 'Alínea', 'Item']);

    const pathsWithChildren = new Set();
    data.sections.forEach(section => {
      data.sections.forEach(child => {
        if (child.path.startsWith(section.path + '.') && child.path !== section.path && childTypes.has(child.type)) {
          pathsWithChildren.add(section.path);
        }
      });
    });

    data.sections.forEach(section => {
      const type = section.type;
      let identifier = section.identifier ? section.identifier : '';
      const content = section.content ? section.content : '';
      const path = section.path;

      const depth = getDepth(path);
      const indentClass = `indent-level-${depth}`;
      let groupingId = '';
      let headerText = '';
      let hasChildren = pathsWithChildren.has(path);

      switch(type) {
        case 'Epígrafe':
          groupingId = generateId(type, '');
          htmlContent += `<div id="${groupingId}" class="grouping-header epigrafe ${indentClass}" data-type="${type}">
            <span class="header-text">${content}</span>
          </div>`;
          break;
        case 'Ementa':
          htmlContent += `<p class="p-ementa">${content}</p>`;
          break;
        case 'Preâmbulo':
          groupingId = generateId(type, '');
          htmlContent += `<div id="${groupingId}" class="grouping-header preambulo-subtitle ${indentClass}" data-type="${type}">
            <span class="header-text">Preâmbulo</span>
          </div>`;
          htmlContent += `<p class="preambulo-content">${content}</p>`;
          break;
        case 'Disposições Preliminares':
        case 'Disposições Gerais':
        case 'Disposições Finais':
        case 'Disposições Transitórias':
          groupingId = generateId(type, '');
          headerText = `${type}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Parte':
          groupingId = generateId(type, identifier);
          headerText = `Parte ${identifier}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Livro':
          groupingId = generateId(type, identifier);
          headerText = `Livro ${identifier} - ${content}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Título':
          groupingId = generateId(type, identifier);
          headerText = `Título ${identifier} - ${content}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Capítulo':
          groupingId = generateId(type, identifier);
          headerText = `Capítulo ${identifier} - ${content}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Seção':
          groupingId = generateId(type, identifier);
          headerText = `Seção ${identifier} - ${content}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Subseção':
          groupingId = generateId(type, identifier);
          headerText = `Subseção ${identifier} - ${content}`;
          htmlContent += `<div id="${groupingId}" class="grouping-header ${indentClass} ${hasChildren ? 'expanded' : 'collapsed'}" data-type="${type}">
            <span class="header-text">${headerText}</span>
            ${hasChildren ? `
              <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            ` : ''}
          </div>`;
          break;
        case 'Artigo':
          htmlContent += `<p class="artigo"><strong>Art. ${identifier}</strong> ${content}</p>`;
          break;
        case 'Parágrafo':
          if (identifier.toLowerCase() === 'único') {
            htmlContent += `<p class="paragrafo"><strong>Parágrafo ${identifier}.</strong> ${content}</p>`;
          } else {
            identifier = identifier.replace(/^§+/, '').trim();
            const numberMatch = identifier.match(/\d+/);
            const number = numberMatch ? parseInt(numberMatch[0], 10) : 0;
            if (number >= 10) {
              htmlContent += `<p class="paragrafo"><strong>§ ${identifier}.</strong> ${content}</p>`;
            } else {
              htmlContent += `<p class="paragrafo"><strong>§ ${identifier}</strong> ${content}</p>`;
            }
          }
          break;
        case 'Inciso':
          htmlContent += `<p class="inciso ${indentClass}">${identifier} - ${content}</p>`;
          break;
        case 'Alínea':
          htmlContent += `<p class="alinea ${indentClass}">${identifier}) ${content}</p>`;
          break;
        case 'Item':
          htmlContent += `<p class="item ${indentClass}">${identifier}. ${content}</p>`;
          break;
        case 'Data de Promulgação':
        case 'Data de Publicação':
          htmlContent += `<p class="data-publicacao"><strong>${type}:</strong> ${content}</p>`;
          break;
        default:
          htmlContent += `<p>${content}</p>`;
          break;
      }
    });

    lawContent.innerHTML = htmlContent;
    originalLawContent = htmlContent; 
    initGroupingHeaderEvents();
  }

  lawButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lawId = button.dataset.lawId;
      currentLawId = lawId;

      lawButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');

      lawButtons.forEach(btn => btn.disabled = true);

      lawContent.innerHTML = `
        <div class="loader">
          <div class="spinner"></div>
          <p>Carregando...</p>
        </div>
      `;

      if (lawCache[lawId]) {
        displayLawContent(lawCache[lawId]);
        lawButtons.forEach(btn => btn.disabled = false);
      } else {
        fetch(`/api/laws/${lawId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            if (data.error) {
              lawContent.innerHTML = `<p>${data.error}</p>`;
            } else {
              lawCache[lawId] = data;
              displayLawContent(data);
            }
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            showTemporaryMessage('Erro ao carregar o conteúdo da lei.');
            lawContent.innerHTML = `<p>Erro ao carregar o conteúdo da lei.</p>`;
          })
          .finally(() => {
            lawButtons.forEach(btn => btn.disabled = false);
          });
      }
    });
  });

  loginBtn.addEventListener('click', () => {
    showTemporaryMessage('Função de login ainda não implementada.');
  });

  fontToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = fontDropdown.classList.contains('hidden');
    closeFontDropdown();
    if (isHidden) {
      fontDropdown.classList.remove('hidden');
      fontToggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      fontDropdown.classList.add('hidden');
      fontToggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  const fontOptions = document.querySelectorAll('.font-option');
  fontOptions.forEach(option => {
    option.addEventListener('click', () => {
      const selectedFont = option.dataset.font;
      applyFont(selectedFont);
      showTemporaryMessage(`Fonte alterada para ${selectedFont}.`);
      closeFontDropdown();
    });
  });

  function applyFont(fontName) {
    const content = document.querySelector('.content');
    if (content) {
      content.style.fontFamily = `'${fontName}', sans-serif`;
    }
  }

  function closeFontDropdown() {
    fontDropdown.classList.add('hidden');
    fontToggleBtn.setAttribute('aria-expanded', 'false');
  }

  document.addEventListener('click', (event) => {
    if (!fontDropdown.contains(event.target) && !fontToggleBtn.contains(event.target)) {
      closeFontDropdown();
    }
  });

  let searchDebounceTimer;
  searchTextInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      const query = searchTextInput.value.trim();
      handleSearchInLawContent(query);
    }, 300);
  });

  function handleSearchInLawContent(query) {
    if (!currentLawId || !originalLawContent) {
      return;
    }

    if (!query) {
      lawContent.innerHTML = originalLawContent;
      searchResultsContainer.innerHTML = '';
      initGroupingHeaderEvents();
      return;
    }

    const words = query.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) {
      lawContent.innerHTML = originalLawContent;
      searchResultsContainer.innerHTML = '';
      initGroupingHeaderEvents();
      return;
    }

    const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');

    const paragraphs = lawContent.querySelectorAll('p');
    const matches = [];

    paragraphs.forEach((p, pIndex) => {
      const text = p.textContent;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const snippetStart = Math.max(0, start - 30);
        const snippetEnd = Math.min(text.length, end + 30);
        const snippet = text.substring(snippetStart, snippetEnd).trim();
        matches.push({
          paragraphIndex: pIndex,
          start,
          end,
          word: match[0],
          snippet
        });
      }
    });

    if (matches.length === 0) {
      lawContent.innerHTML = originalLawContent;
      searchResultsContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>';
      initGroupingHeaderEvents();
      return;
    }

    // Atribuir um índice global a cada match
    matches.forEach((m, i) => {
      m.globalIndex = i;
    });

    matches.sort((a,b) => {
      if (a.paragraphIndex === b.paragraphIndex) {
        return a.start - b.start;
      }
      return a.paragraphIndex - b.paragraphIndex;
    });

    const newParagraphs = [];
    paragraphs.forEach((p, pIndex) => {
      const text = p.textContent;
      const pMatches = matches.filter(m => m.paragraphIndex === pIndex);
      if (pMatches.length === 0) {
        newParagraphs.push(p.innerHTML);
      } else {
        let lastIndex = 0;
        let highlightedText = '';
        pMatches.forEach((m) => {
          highlightedText += text.substring(lastIndex, m.start);
          highlightedText += `<mark class="highlight" data-match-index="${m.globalIndex}">${text.substring(m.start, m.end)}</mark>`;
          lastIndex = m.end;
        });
        highlightedText += text.substring(lastIndex);
        newParagraphs.push(highlightedText);
      }
    });

    let updatedContent = '';
    const allOriginalElements = lawContent.querySelectorAll('p, .grouping-header, .p-ementa, .preambulo-content, .preambulo-subtitle');
    let pCount = 0;
    allOriginalElements.forEach(el => {
      if (el.tagName.toLowerCase() === 'p') {
        updatedContent += `<p>${newParagraphs[pCount++]}</p>`;
      } else {
        updatedContent += el.outerHTML;
      }
    });

    lawContent.innerHTML = updatedContent;
    initGroupingHeaderEvents();

    searchResultsContainer.innerHTML = '';
    matches.forEach((m) => {
      const btn = document.createElement('button');
      btn.textContent = m.snippet + '...';
      btn.setAttribute('data-target', m.globalIndex);
      btn.addEventListener('click', () => {
        const highlightEl = lawContent.querySelector(`mark.highlight[data-match-index="${m.globalIndex}"]`);
        if (highlightEl) {
          highlightEl.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
      });
      searchResultsContainer.appendChild(btn);
    });
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      bodyElement.classList.add('dark-theme');
      iconMoon.style.display = 'none';
      iconSun.style.display = 'block';
      themeText.textContent = 'Tema claro';
      themeToggleBtn.setAttribute('aria-pressed', 'true');
      localStorage.setItem('theme', 'dark');
    } else {
      bodyElement.classList.remove('dark-theme');
      iconMoon.style.display = 'block';
      iconSun.style.display = 'none';
      themeText.textContent = 'Tema escuro';
      themeToggleBtn.setAttribute('aria-pressed', 'false');
      localStorage.setItem('theme', 'light');
    }
  }

  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = bodyElement.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  function initGroupingHeaderEvents() {
    const groupingHeaders = document.querySelectorAll('.grouping-header');

    groupingHeaders.forEach(header => {
      const expandIcon = header.querySelector('.expand-icon');

      if (expandIcon) {
        header.addEventListener('click', (event) => {
          if (event.target.classList.contains('expand-icon')) {
            event.stopPropagation();
          }

          if (header.classList.contains('is-sticky')) {
            const headerId = header.id;
            const originalHeader = document.getElementById(headerId);
            if (originalHeader) {
              originalHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else {
            const isExpanded = header.classList.contains('expanded');
            header.classList.toggle('expanded', !isExpanded);
            header.classList.toggle('collapsed', isExpanded);

            const nextElements = [];
            let nextSibling = header.nextElementSibling;

            while (nextSibling && !nextSibling.classList.contains('grouping-header')) {
              nextElements.push(nextSibling);
              nextSibling = nextSibling.nextElementSibling;
            }

            nextElements.forEach(element => {
              element.style.display = isExpanded ? 'none' : '';
            });
          }
        });
      }
    });
  }

  const sentinel = document.getElementById('sentinel');
  const observerOptions = {
    root: null,
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const headers = document.querySelectorAll('.grouping-header');
      headers.forEach(header => {
        if (!entry.isIntersecting && isElementAtTop(header)) {
          header.classList.add('is-sticky');
        } else {
          header.classList.remove('is-sticky');
        }
      });
    });
  }, observerOptions);

  observer.observe(sentinel);

  function isElementAtTop(element) {
    const rect = element.getBoundingClientRect();
    return rect.top <= 0 && rect.bottom > 0;
  }

  leftHandle.addEventListener('mouseenter', () => {
    leftSidebar.classList.add('open');
  });

  leftHandle.addEventListener('mouseleave', () => {
    leftSidebar.classList.remove('open');
  });

  leftSidebar.addEventListener('mouseenter', () => {
    leftSidebar.classList.add('open');
  });

  leftSidebar.addEventListener('mouseleave', () => {
    leftSidebar.classList.remove('open');
  });

  rightHandle.addEventListener('mouseenter', () => {
    rightSidebar.classList.add('open');
  });

  rightHandle.addEventListener('mouseleave', () => {
    rightSidebar.classList.remove('open');
  });

  rightSidebar.addEventListener('mouseenter', () => {
    rightSidebar.classList.add('open');
  });

  rightSidebar.addEventListener('mouseleave', () => {
    rightSidebar.classList.remove('open');
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      leftSidebar.classList.remove('open');
      rightSidebar.classList.remove('open');
    }
  });
});
