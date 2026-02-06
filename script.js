const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const flipbook = document.getElementById("flipbook");
const pageLeft = document.getElementById("pageLeft");
const pageRight = document.getElementById("pageRight");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const pageIndicator = document.getElementById("pageIndicator");
const pageTotal = document.getElementById("pageTotal");
const loadingSpinner = document.getElementById("loadingSpinner");
const thumbnailList = document.getElementById("thumbnailList");
const editionTitle = document.getElementById("editionTitle");
const zoomBtn = document.getElementById("zoomBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");

const editions = {
  "feb-2026": {
    title: "February 2026 Edition",
    totalPages: 12,
    pdf: "assets/feb-2026.pdf",
    images: Array.from({ length: 12 }, (_, i) => `assets/feb-2026/${i + 1}.jpg`),
  },
  "jan-2026": {
    title: "January 2026 Edition",
    totalPages: 12,
    pdf: "assets/jan-2026.pdf",
    images: Array.from({ length: 12 }, (_, i) => `assets/jan-2026/page-${i + 1}.jpg`),
  },
  "dec-2025": {
    title: "December 2025 Edition",
    totalPages: 12,
    pdf: "assets/dec-2025.pdf",
    images: Array.from({ length: 12 }, (_, i) => `assets/dec-2025/${i + 1}.jpg`),
  },
  "nov-2025": {
    title: "November 2025 Edition",
    totalPages: 16,
    pdf: "assets/nov-2025.pdf",
    images: Array.from({ length: 16 }, (_, i) => `assets/nov-2025/${i + 1}.jpg`),
  },
};

let currentEdition = null;
let currentPage = 1;
let isZoomed = false;
const singlePageQuery = window.matchMedia("(max-width: 767px)");
let isSinglePageView = singlePageQuery.matches;

function getEditionFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("edition") || "jan-2026";
  return editions[key] || editions["jan-2026"];
}

function getMaxPage() {
  if (!currentEdition) return 1;
  if (isSinglePageView) return currentEdition.totalPages;
  return currentEdition.totalPages % 2 === 0 ? currentEdition.totalPages - 1 : currentEdition.totalPages;
}

function updatePages() {
  if (!currentEdition || !pageLeft || !pageRight) return;
  const leftIndex = currentPage;
  const rightIndex = isSinglePageView ? null : currentPage + 1;
  pageLeft.innerHTML = renderPageContent(leftIndex);
  pageRight.innerHTML = rightIndex ? renderPageContent(rightIndex) : "";

  pageIndicator.textContent = String(currentPage);
  pageTotal.textContent = String(currentEdition.totalPages);

  pageLeft.classList.add("page-flip");
  pageRight.classList.add("page-flip");
  setTimeout(() => {
    pageLeft.classList.remove("page-flip");
    pageRight.classList.remove("page-flip");
  }, 500);
}

function updateLayoutMode() {
  isSinglePageView = singlePageQuery.matches;
  const maxPage = getMaxPage();
  if (!isSinglePageView && currentPage % 2 === 0) {
    currentPage -= 1;
  }
  if (currentPage > maxPage) currentPage = maxPage;
  updatePages();
}

function renderPageContent(pageNumber) {
  if (pageNumber > currentEdition.totalPages) {
    return `<span>End of edition</span>`;
  }
  const imageSrc = currentEdition.images[pageNumber - 1];
  return `<img src="${imageSrc}" alt="Page ${pageNumber}" loading="lazy" />`;
}

function buildThumbnails() {
  if (!thumbnailList || !currentEdition) return;
  thumbnailList.innerHTML = "";
  currentEdition.images.forEach((image, index) => {
    const item = document.createElement("div");
    item.className = "thumbnail-item";
    item.textContent = `Page ${index + 1}`;
    item.addEventListener("click", () => {
      currentPage = index + 1;
      updatePages();
    });
    thumbnailList.appendChild(item);
  });
}

function setupViewer() {
  if (!flipbook) return;
  currentEdition = getEditionFromQuery();
  if (editionTitle) editionTitle.textContent = currentEdition.title;
  if (downloadBtn) downloadBtn.dataset.pdf = currentEdition.pdf;

  buildThumbnails();
  setTimeout(() => {
    if (loadingSpinner) loadingSpinner.style.display = "none";
    updateLayoutMode();
  }, 800);
}

if (prevPage) {
  prevPage.addEventListener("click", () => {
    const step = isSinglePageView ? 1 : 2;
    if (currentPage > 1) {
      currentPage -= step;
      if (currentPage < 1) currentPage = 1;
      updatePages();
    }
  });
}

if (nextPage) {
  nextPage.addEventListener("click", () => {
    const step = isSinglePageView ? 1 : 2;
    const maxPage = getMaxPage();
    if (currentPage < maxPage) {
      currentPage += step;
      updatePages();
    }
  });
}

if (zoomBtn) {
  zoomBtn.addEventListener("click", () => {
    if (!flipbook) return;
    isZoomed = !isZoomed;
    flipbook.style.transform = isZoomed ? "scale(1.05)" : "scale(1)";
  });
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", () => {
    const wrapper = document.querySelector('.flipbook-wrapper');
    if (!wrapper) return;
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  });
}

if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    const pdf = downloadBtn.dataset.pdf;
    if (pdf) {
      window.open(pdf, "_blank");
    }
  });
}

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const shareData = {
      title: currentEdition?.title || "Sandesh Newsletter",
      text: "Explore the latest Sandesh newsletter edition.",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error(error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    }
  });
}

if (flipbook) {
  let startX = 0;
  flipbook.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
  });

  flipbook.addEventListener("touchend", (event) => {
    const endX = event.changedTouches[0].clientX;
    if (startX - endX > 40) {
      nextPage?.click();
    }
    if (endX - startX > 40) {
      prevPage?.click();
    }
  });

  // Add keyboard navigation for fullscreen
  document.addEventListener("keydown", (event) => {
    if (document.fullscreenElement) {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        nextPage?.click();
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        prevPage?.click();
      }
      if (event.key === "Escape") {
        document.exitFullscreen();
      }
    }
  });
}

singlePageQuery.addEventListener("change", updateLayoutMode);

setupViewer();
