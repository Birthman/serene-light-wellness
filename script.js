// Serene Light Wellness - demo booking site.
// Everything runs in the browser. No data is sent or stored anywhere.

const SERVICES = {
  reiki: "Reiki Session",
  cleansing: "Home Cleansing",
  consultation: "Free Consultation",
};
const TIMES = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("site-nav");
const form = document.getElementById("booking-form");
const dateInput = document.getElementById("date");
const slotsBox = document.getElementById("slots");
const errorBox = document.getElementById("form-error");
const confirmation = document.getElementById("confirmation");
const confirmText = document.getElementById("confirm-text");

let selectedTime = null;

// Mobile menu
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

// "Book" buttons on the service cards pre-select that service
document.querySelectorAll("[data-service]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const radio = form.querySelector(`input[name="service"][value="${btn.dataset.service}"]`);
    if (radio) radio.checked = true;
  })
);

// Dates: from tomorrow up to 60 days ahead
function toInputDate(d) {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const maxDate = new Date();
maxDate.setDate(maxDate.getDate() + 60);
dateInput.min = toInputDate(tomorrow);
dateInput.max = toInputDate(maxDate);

// Pretend some slots are already booked (same result for the same date)
function isTaken(dateStr, index) {
  const seed = dateStr.split("-").reduce((sum, n) => sum + Number(n), 0);
  return (seed + index * 7) % 5 === 0;
}

function renderSlots() {
  selectedTime = null;
  slotsBox.replaceChildren();
  const value = dateInput.value;
  if (!value) {
    slotsBox.appendChild(hint("Choose a date to see available times."));
    return;
  }
  const day = new Date(value + "T12:00:00").getDay();
  if (day === 0) {
    slotsBox.appendChild(hint("Closed on Sundays. Please choose another date."));
    return;
  }
  TIMES.forEach((time, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot";
    btn.textContent = time;
    btn.setAttribute("aria-pressed", "false");
    if (isTaken(value, i)) {
      btn.disabled = true;
      btn.setAttribute("aria-label", `${time} (already booked)`);
    }
    btn.addEventListener("click", () => {
      slotsBox.querySelectorAll(".slot").forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      selectedTime = time;
    });
    slotsBox.appendChild(btn);
  });
}

function hint(text) {
  const p = document.createElement("p");
  p.className = "hint";
  p.textContent = text;
  return p;
}

dateInput.addEventListener("change", renderSlots);

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorBox.hidden = true;

  const service = form.querySelector('input[name="service"]:checked');
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!service) return showError("Please choose a service.");
  if (!dateInput.value || dateInput.value < dateInput.min || dateInput.value > dateInput.max) {
    return showError("Please choose a date within the next 60 days.");
  }
  if (!selectedTime) return showError("Please choose an available time.");
  if (name.length < 2) return showError("Please enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("Please enter a valid email address.");

  const dateLabel = new Date(dateInput.value + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // textContent (not innerHTML) so typed input is never treated as code
  confirmText.textContent =
    `Thank you, ${name}. Your ${SERVICES[service.value]} is booked for ${dateLabel} at ${selectedTime}. ` +
    `A confirmation would be sent to ${email}.`;

  form.hidden = true;
  confirmation.hidden = false;
  confirmation.focus();
});

document.getElementById("book-another").addEventListener("click", () => {
  form.reset();
  renderSlots();
  confirmation.hidden = true;
  form.hidden = false;
});

document.getElementById("year").textContent = new Date().getFullYear();
// Clear the form when the page loads or is refreshed (browsers sometimes restore old values)
window.addEventListener("pageshow", () => {
  form.reset();
  renderSlots();
});
