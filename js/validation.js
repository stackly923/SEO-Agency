const form = document.querySelector("#contact-form");
function validateField(input) {
  let error = "";
  const v = input.value.trim();
  if (input.required && !v) error = "Please complete this field.";
  else if (
    ["first-name", "last-name"].includes(input.id) &&
    v &&
    !/^[\p{L}\p{M} ]+$/u.test(v)
  )
    error = "Use letters and spaces only.";
  else if (input.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    error = "Enter a valid email address.";
  else if (
    input.id === "phone" &&
    v &&
    !/^[0-9]{7,15}$/.test(v)
  )
    error = "Enter a valid phone number with 7–15 digits.";
  else if (input.id === "website" && v) {
    try {
      const u = new URL(v);
      if (!["http:", "https:"].includes(u.protocol))
        error = "Use an http or https website address.";
    } catch {
      error = "Enter a full URL such as https://example.com.";
    }
  }
  const msg = document.getElementById(input.id + "-error");
  if (msg) msg.textContent = error;
  input.setAttribute("aria-invalid", error ? "true" : "false");
  const dropdownTrigger = document.getElementById(input.dataset.dropdownTrigger);
  if (dropdownTrigger) dropdownTrigger.setAttribute("aria-invalid", error ? "true" : "false");
  return !error;
}
if (form) {
  const fields = [...form.querySelectorAll("input,select,textarea")];
  fields.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    const invalidCharacters = ["first-name", "last-name"].includes(input.id)
      ? /[^\p{L}\p{M} ]/gu
      : input.id === "phone" ? /[^0-9]/g : null;
    if (!invalidCharacters) return;
    const restrictInput = () => {
      const original = input.value;
      const cleaned = original.replace(invalidCharacters, "");
      if (original === cleaned) return;
      const caret = input.selectionStart;
      input.value = cleaned;
      if (caret !== null) {
        const position = original.slice(0, caret).replace(invalidCharacters, "").length;
        input.setSelectionRange(position, position);
      }
    };
    input.addEventListener("input", (event) => {
      if (!event.isComposing) restrictInput();
    });
    input.addEventListener("compositionend", restrictInput);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const valid = fields.map(validateField).every(Boolean);
    if (valid) {
      form.reset();
      fields.forEach((input) => {
        input.removeAttribute("aria-invalid");
        const error = document.getElementById(input.id + "-error");
        if (error) error.textContent = "";
      });
      const status = form.querySelector(".form-status");
      status.textContent = "";
      status.classList.remove("success");
      window.location.assign("404.html");
      return;
    }
    const status = form.querySelector(".form-status");
    status.classList.remove("success");
    status.textContent = "Please review the highlighted fields.";
    const firstInvalid = form.querySelector("[aria-invalid=true]");
    const dropdownTrigger = document.getElementById(firstInvalid.dataset.dropdownTrigger);
    if (dropdownTrigger) {
      dropdownTrigger.closest("details").open = true;
      dropdownTrigger.focus();
    } else firstInvalid.focus();
  });
}
document.querySelector("#newsletter")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = e.currentTarget.querySelector("input"),
    status = e.currentTarget.querySelector(".form-status");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
  input.setAttribute("aria-invalid", String(!valid));
  if (valid) {
    status.textContent = "";
    window.location.assign("404.html");
    return;
  }
  status.textContent = "Please enter a valid email address.";
  input.focus();
});
