
let modal = null;
const openModal = function (e) {
  e.preventDefault();
  modal = document.querySelector(e.target.getAttribute("href"));
  modal.style.display = null;
  modal.removeAttribute("inert");
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-stop")
    .addEventListener("click", stopPropagation);

    
};
// Fonction générique pour fermer une modale
const closeModal = function (e) {
  if (modal === null) return;
  e.preventDefault();

  // Si c'est la modal d'ajout, supprimer l'aperçu
  if (modal.id === "modal2") {
    removePreviewImage();
  }

  // Donner le focus à la modale courante (plutôt que d'utiliser document.querySelector)
  modal.focus();
  
  modal.style.display = "none";
  modal.setAttribute("inert", "true");
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  
  // Suppression des écouteurs attachés
  modal.removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-close").removeEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);
  
  modal = null;
};

// Suppression de l'aperçu de l'image dans la modal d'ajout
function removePreviewImage() {
  const ajoutPhotoDiv = document.querySelector(".ajout-photo");
  if (ajoutPhotoDiv) {
    const previewImg = ajoutPhotoDiv.querySelector(".preview-img");
    if (previewImg) {
      previewImg.remove();
    }
    // Réafficher les autres éléments qui avaient été masqués
    Array.from(ajoutPhotoDiv.children).forEach(child => {
      if (child.id !== "image") {
        child.style.display = "";
      }
    });
  }
}

// Un seul écouteur pour ouvrir la modal d'ajout (modal2)
document.getElementById("open-add-photo-modal").addEventListener("click", (e) => {
  e.preventDefault();
  
  // Fermer la modal en cours (si nécessaire)
  if (modal) closeModal(e);
  
  // Ouvrir la modal2
  modal = document.getElementById("modal2");
  modal.style.display = null;
  modal.removeAttribute("inert");
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  
  // Attacher les écouteurs pour fermer la modal2
  modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
  
  // Par exemple, gestion du bouton "précédent"
  const previousBtn = modal.querySelector(".modal-previous");
  if (previousBtn) {
    previousBtn.addEventListener("click", function (e) {
      e.preventDefault();
      closeModal(e);
      openFirstModal();
    });
  }
});


const stopPropagation = function (e) {
  e.stopPropagation();
};
document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openModal);
});
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e);
  }
});
// Récupère les travaux dans l'API
async function fetchWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error(`Erreur : ${response.status}`);
    }
    const works = await response.json();
    return works;
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error);
  }
}
// Récupère les catégories dans l'API
async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
      throw new Error(`Erreur API : ${response.status} ${response.statusText}`);
    }
    const categories = await response.json();
    displayCategories(categories);
    populateCategorySelect(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
    alert(
      "Impossible de récupérer les catégories. Vérifiez que le serveur est en cours de fonctionnement."
    );
  }
}
// Fonction pour afficher la galerie
function displayGallery(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.setAttribute("data-id", work.id);
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    figure.appendChild(img);
    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}
// Fonction pour afficher la galerie modale
function displayModalGallery(works) {
  const gallery = document.querySelector(".container-photo");
  gallery.innerHTML = "";
  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.style.position = "relative";
    figure.setAttribute("data-id", work.id);
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    figure.appendChild(img);
    // Ajout du bouton poubelle
    const deleteButton = document.createElement("button-trash");
    deleteButton.classList.add("delete-photo");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteButton.setAttribute("aria-label", `Supprimer ${work.title}`);
    deleteButton.style.position = "absolute";
    deleteButton.style.top = "10px";
    deleteButton.style.right = "10px";
    deleteButton.addEventListener("click", () => {
      console.log(`Demande de suppression pour l'image avec l'ID : ${work.id}`);
      deletePhoto(work.id);
    });
    figure.appendChild(deleteButton);
    gallery.appendChild(figure);
  });
}
async function deletePhoto(photoId) {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    alert("Vous devez être connecté pour supprimer une photo.");
    return;
  }
  try {
    const response = await fetch(`http://localhost:5678/api/works/${photoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Erreur : ${response.status}`);
    }
    // Suppression dans la modal
    const modalFigure = document.querySelector(`.container-photo figure[data-id="${photoId}"]`);
    if (modalFigure) {
      modalFigure.remove();
    }
    // Suppression dans la galerie principale
    const galleryFigure = document.querySelector(`.gallery figure[data-id="${photoId}"]`);
    if (galleryFigure) {
      galleryFigure.remove();
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la photo :", error);
    alert("Impossible de supprimer la photo.");
  }
}
// Fonction pour afficher les catégories
function displayCategories(categories) {
  const categoryContainer = document.querySelector(".categories");
  if (!categoryContainer) {
    console.error("Le conteneur des catégories est introuvable!");
    return;
  }
  const token = sessionStorage.getItem("authToken");
  if (token) {
    categoryContainer.style.display = "none";
    return;
  }
  categoryContainer.innerHTML = "";
  // Bouton "tous"
  const allCategoriesButton = document.createElement("button");
  allCategoriesButton.textContent = "Tous";
  allCategoriesButton.classList.add("category-button");
  allCategoriesButton.classList.add("selected");
  allCategoriesButton.dataset.id = 0;
  allCategoriesButton.addEventListener("click", (event) => {
    document.querySelectorAll(".category-button").forEach((button) => {
      button.classList.remove("selected");
    });
    allCategoriesButton.classList.add("selected");
    filterGalleryByCategory(0, event.target);
  });
  categoryContainer.appendChild(allCategoriesButton);
  // Les autres boutons
  categories.forEach((category) => {
    const categoryElement = document.createElement("button");
    categoryElement.textContent = category.name;
    categoryElement.classList.add("category-button");
    categoryElement.dataset.id = category.id;
    categoryElement.addEventListener("click", (event) => {
      document.querySelectorAll(".category-button").forEach((button) => {
        button.classList.remove("selected");
      });
      categoryElement.classList.add("selected");
      filterGalleryByCategory(category.id, event.target);
    });
    categoryContainer.appendChild(categoryElement);
  });
}
// Fonction pour filtrer les images par catégorie
function filterGalleryByCategory(categoryId) {
  fetchWorks().then((works) => {
    const filteredWorks =
      categoryId === 0
        ? works
        : works.filter((work) => work.categoryId === categoryId);
    displayGallery(filteredWorks);
  });
}
// Fonction pour remplir le select des catégories dans la modal d'ajout de photo
function populateCategorySelect(categories) {
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Sélectionner une catégorie";
  defaultOption.value = "";
  categorySelect.appendChild(defaultOption);
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}
document.addEventListener("DOMContentLoaded", async () => {
  const works = await fetchWorks();
  if (works) {
    displayGallery(works);
    displayModalGallery(works);
  }
  fetchCategories();
});
// Ajout de photo************************************************
// Fonction pour vérifier la validité du formulaire
function validateForm() {
  const image = document.getElementById("image");
  const title = document.getElementById("title");
  const category = document.getElementById("category");
  const submitButton = document.querySelector("button[type='submit']");
  // Vérifier si tous les champs sont remplis
  const isValid = image.files.length > 0 && title.value.trim() !== "" && category.value !== "";
  // Activer/désactiver le bouton et changer la couleur
  submitButton.disabled = !isValid;
}
document.getElementById("image").addEventListener("change", validateForm);
document.getElementById("title").addEventListener("input", validateForm);
document.getElementById("category").addEventListener("change", validateForm);
// Ajoute les écouteurs d'événements aux champs
["image", "title", "category"].forEach(id => {
  document.getElementById(id).addEventListener("input", validateForm);
});
// Fonction pour ajouter une photo à la galerie
function addPhotoToGallery(photo) {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return console.error("Galerie introuvable.");
  const figure = document.createElement("figure");
  const img = document.createElement("img");
  const figcaption = document.createElement("figcaption");
  if (!photo.imageUrl) {
    console.error("L'image de la photo ajoutée est manquante :", photo);
    return;
  }
  img.src = photo.imageUrl;
  img.alt = photo.title;
  figcaption.textContent = photo.title;
  figure.appendChild(img);
  figure.appendChild(figcaption);
  gallery.appendChild(figure);
}
// Gestion du formulaire d'ajout de photo
document.getElementById("add-photo-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append("image", document.getElementById("image").files[0]);
  formData.append("title", document.getElementById("title").value);
  formData.append("category", document.getElementById("category").value);

  const token = sessionStorage.getItem("authToken");
  if (!token) {
    alert("Vous devez être connecté pour ajouter une photo.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) throw new Error(`Erreur : ${response.status}`);

    const newPhoto = await response.json();
    console.log("Nouvelle photo ajoutée :", newPhoto);

    // Ajouter la nouvelle photo dynamiquement
    addPhotoToGallery(newPhoto);
    addPhotoToModal(newPhoto);

    // Vider et mettre à jour la galerie modale
    const works = await fetchWorks();
    displayModalGallery(works);

    // Vider le formulaire
    document.getElementById("add-photo-form").reset();
    document.querySelector("button[type='submit']").disabled = true;
  

    // Fermer la modale
    closeModal(e);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la photo :", error);
    alert("Impossible d'ajouter la photo.");
  }
});


function addPhotoToModal(photo) {
  const modalGallery = document.querySelector(".container-photo"); // Assure-toi que la galerie de la modale a bien cette classe
  if (!modalGallery) return console.error("Galerie de la modale introuvable.");
  const figure = document.createElement("figure");
  const img = document.createElement("img");
  const figcaption = document.createElement("figcaption");
  const deleteButton = document.createElement("button");
  if (!photo.imageUrl) {
    console.error("L'image de la photo ajoutée est manquante :", photo);
    return;
  }
  img.src = photo.imageUrl;
  img.alt = photo.title;
  figcaption.textContent = photo.title;
 
  // Bouton de suppression
  deleteButton.textContent = "Supprimer";
  deleteButton.classList.add("delete-photo");
  deleteButton.dataset.id = photo.id;
  deleteButton.addEventListener("click", async () => {
    await deletePhoto(photo.id, figure);
  });

  figure.appendChild(img);
  figure.appendChild(figcaption);
  figure.appendChild(deleteButton);
  modalGallery.appendChild(figure);
}

// Gestion de la première modal
document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openModal);
});
// Gestion de la seconde modal
document.getElementById("open-add-photo-modal").addEventListener("click", (e) => {
  e.preventDefault();
  // Fermer la première modal
  closeModal(e);
  // Ouvrir la seconde modal
  modal = document.getElementById("modal2");
  modal.style.display = null;
  modal.removeAttribute("inert");
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  // Attacher l'événement pour fermer la seconde modal
  modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
});

// REMPLACEMENT ICONE IMAGE AJOUT PHOTO***********

const imageInput = document.getElementById("image");

imageInput.addEventListener("change", function (e) {
  // Sélectionner la div contenant l'ajout de photo
  const ajoutPhotoDiv = document.querySelector(".ajout-photo");

  // Masquer l'icône, le label et le paragraphe, tout en gardant l'input
  // On suppose que l'input possède l'id "image"
  Array.from(ajoutPhotoDiv.children).forEach(child => {
    if (child.id !== "image" && !child.classList.contains("preview-img")) {
      child.style.display = "none";
    }
  });

  // Créer ou mettre à jour l'image de prévisualisation
  let previewImg = ajoutPhotoDiv.querySelector(".preview-img");
  if (!previewImg) {
    previewImg = document.createElement("img");
    previewImg.classList.add("preview-img");
    // Vous pouvez personnaliser le style via CSS ou directement ici
    previewImg.style.maxWidth = "100%";
    previewImg.style.maxHeight = "169px";
    previewImg.style.display = "block";
    previewImg.style.margin = "auto";
    ajoutPhotoDiv.appendChild(previewImg);
  }

  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});


//FIN DU REMPLECEMENT**********

//FERMER MODALE 2 => MODALE 1***********
// Fonction pour fermer la modale courante (modal2)
function closeCurrentModal() {
  if (modal) {
    modal.style.display = "none";
    modal.setAttribute("inert", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    modal.removeEventListener("click", closeModal);
    const closeBtn = modal.querySelector(".js-modal-close");
    if (closeBtn) closeBtn.removeEventListener("click", closeModal);
    modal.querySelector(".js-modal-stop").removeEventListener("click", stopPropagation);
    modal = null;
  }
}

// Fonction pour ouvrir la première modale (modal1)
function openFirstModal() {
  const modal1 = document.getElementById("modal1");
  if (modal1) {
    modal1.style.display = null;
    modal1.removeAttribute("inert");
    modal1.removeAttribute("aria-hidden");
    modal1.setAttribute("aria-modal", "true");
    modal1.addEventListener("click", closeModal);
    modal1.querySelector(".js-modal-close").addEventListener("click", closeModal);
    modal1.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
    modal = modal1;
  }
}
// Gestion de la seconde modal (pour ajouter une photo)
document.getElementById("open-add-photo-modal").addEventListener("click", (e) => {
  e.preventDefault();

  closeModal(e);
  
  // Ouvrir la seconde modale (modal2)
  modal = document.getElementById("modal2");
  modal.style.display = null;
  modal.removeAttribute("inert");
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-stop").addEventListener("click", stopPropagation);
  
  
  modal.querySelector(".modal-previous").addEventListener("click", function (e) {
    e.preventDefault();
  
    closeCurrentModal();
   
    openFirstModal();
  });
});
//FIN DE FERMETURE ****************

//CONNEXION


document.addEventListener("DOMContentLoaded", async () => {
  const works = await fetchWorks();
  if (works) {
    displayGallery(works);
    displayModalGallery(works);
  }
  fetchCategories();
});
