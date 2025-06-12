function getStarIcons(rating) {
  let rounded = Math.round(rating * 2) / 2;
  let fullStars = Math.floor(rounded);
  let halfStar = (rounded % 1 !== 0);
  let starsHtml = "";

  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<span class="star">★</span>';
  }
  if (halfStar) {
    starsHtml += '<span class="star">⯪</span>';
  }
  
  const maxStars = 5;
  const usedStars = fullStars + (halfStar ? 1 : 0);
  for (let i = usedStars; i < maxStars; i++) {
    starsHtml += '<span class="star">☆</span>';
  }
  return starsHtml;
}

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("scroll", function() {
    let navbar = document.querySelector(".navbar");
    if (navbar) {
      if (window.scrollY > 10) {
        navbar.classList.add("scrolled-v");
      } else {
        navbar.classList.remove("scrolled-v");
      }
    }
  });

  const scrollButton = document.getElementById('scrollButton');
  if (scrollButton) {
    scrollButton.addEventListener('click', function() {
      let nextContent = document.querySelector('#main');
      if (nextContent) {
        let contentPosition = nextContent.getBoundingClientRect().top + window.scrollY - 50;
        window.scrollTo({ top: contentPosition, behavior: 'smooth' });
      }
    });
  }

  fetch("data.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Fehler beim Laden der JSON: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      const cardContainer = document.getElementById("card-container");
      if (!cardContainer) {
        console.error("Element mit ID 'card-container' nicht gefunden.");
        return;
      }
      
      data.forEach((item, index) => {
        const modalId = `modal-${index}`;
        
        const modalHTML = `
          <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="${modalId}-label">${item.title}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
                </div>
                <div class="modal-body text-center">
                  <img src="${item.capImage}" alt="${item.title}" class="img-fluid mb-3" />
                  <table class="table table-borderless m-auto text-start" style="max-width: 300px;">
                    <tr>
                      <td><strong>Brauerei:</strong></td>
                      <td>${item.brewery}</td>
                    </tr>
                    <tr>
                      <td><strong>Kategorie:</strong></td>
                      <td>${item.category}</td>
                    </tr>
                    <tr>
                      <td><strong>Status:</strong></td>
                      <td>${item.status}</td>
                    </tr>
                    <tr>
                      <td><strong>Sammlerwert:</strong></td>
                      <td>${getStarIcons(item.rating)}</td>
                    </tr>
                  </table>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
                </div>
              </div>
            </div>
          </div>
        `;
        
        const cardHTML = `
          <div class="col-auto">
            <div class="hover-card">
              <div class="top-section">
                <img src="${item.image}" alt="${item.title}" />
                <div class="title-wrapper">
                  <h5>${item.title}</h5>
                </div>
              </div>
              <div class="hover-details">
                <p class="mb-1"><strong>Kategorie:</strong> ${item.category}</p>
                <p class="mb-2"><strong>Brauerei:</strong> ${item.brewery}</p>
                <a href="javascript:;" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#${modalId}">
                  Details ansehen
                </a>
              </div>
            </div>
          </div>
        `;
        
        cardContainer.insertAdjacentHTML("beforeend", cardHTML);
        document.body.insertAdjacentHTML("beforeend", modalHTML);
      });

      const searchInput = document.querySelector('.form-control[placeholder="Search"]');
      const searchButton = document.querySelector('.btn[type="button"]');
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.classList.add('suggestions-container');
      searchInput.parentNode.appendChild(suggestionsContainer);
      
      searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        suggestionsContainer.innerHTML = '';
        
        if (searchTerm) {
          const suggestions = data.filter(item => item.title.toLowerCase().includes(searchTerm));
          
          suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = suggestion.title;
            suggestionItem.addEventListener('click', () => {
              const modalId = `modal-${data.indexOf(suggestion)}`;
              const modal = new bootstrap.Modal(document.getElementById(modalId));
              modal.show();
              suggestionsContainer.innerHTML = '';
              searchInput.value = suggestion.title;
            });
            suggestionsContainer.appendChild(suggestionItem);
          });
        }
      });
      
      if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
          const searchTerm = searchInput.value.toLowerCase();
          const foundItem = data.find(item => item.title.toLowerCase().includes(searchTerm));
          
          if (foundItem) {
            const modalId = `modal-${data.indexOf(foundItem)}`;
            const modal = new bootstrap.Modal(document.getElementById(modalId));
            modal.show();
          } else {
            alert('Kein passendes Getränk gefunden.');
          }
        });
      }
    })
    .catch(error => {
      console.error("Fehler beim Datenladen:", error);
    });
});

