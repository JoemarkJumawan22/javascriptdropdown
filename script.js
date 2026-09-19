// ---------- Dropdown menus ----------
// Select every dropdown wrapper on the page (Services, Projects, ...)
const dropdowns = document.querySelectorAll(".dropdown");

dropdowns.forEach((dropdown) => {
  const toggleBtn = dropdown.querySelector(".dropdown-toggle");
  const menu = dropdown.querySelector(".dropdown-menu");
  const arrow = dropdown.querySelector(".arrow");

  toggleBtn.addEventListener("click", function (event) {
    // Stop this click from being seen as an "outside click"
    event.stopPropagation();

    const isOpen = menu.classList.contains("show");

    // Close every other open dropdown first, so only one is open at a time
    closeAllDropdowns();

    if (!isOpen) {
      openDropdown(menu, toggleBtn, arrow);
    }
  });
});

function openDropdown(menu, toggleBtn, arrow) {
  menu.classList.toggle("show");
  toggleBtn.setAttribute("aria-expanded", "true");
  if (arrow) arrow.textContent = "▲";
}

function closeDropdown(menu, toggleBtn, arrow) {
  menu.classList.remove("show");
  toggleBtn.setAttribute("aria-expanded", "false");
  if (arrow) arrow.textContent = "▼";
}

function closeAllDropdowns() {
  dropdowns.forEach((dropdown) => {
    const toggleBtn = dropdown.querySelector(".dropdown-toggle");
    const menu = dropdown.querySelector(".dropdown-menu");
    const arrow = dropdown.querySelector(".arrow");
    closeDropdown(menu, toggleBtn, arrow);
  });
}

// Bonus 1 — close dropdown when clicking outside of it
document.addEventListener("click", function (event) {
  const clickedInsideDropdown = event.target.closest(".dropdown");
  if (!clickedInsideDropdown) {
    closeAllDropdowns();
  }
});

// Close dropdowns on Escape for keyboard users
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeAllDropdowns();
  }
});

// ---------- Bonus 4: responsive hamburger menu ----------
const menuToggle = document.querySelector("#menuToggle");
const navList = document.querySelector("#navList");

menuToggle.addEventListener("click", function () {
  navList.classList.toggle("open");
  menuToggle.classList.toggle("open");
  const isOpen = navList.classList.contains("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
});

// Close the mobile menu after a regular nav link is clicked
document.querySelectorAll(".nav-item > a").forEach((link) => {
  link.addEventListener("click", () => {
    navList.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Also close mobile menu when a dropdown item is chosen
document.querySelectorAll(".dropdown-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navList.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    closeAllDropdowns();
  });
});
