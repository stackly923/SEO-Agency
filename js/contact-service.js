/* Carry the service choice into the enquiry form. */
const serviceNames = {
  seo: "SEO",
  "technical-seo": "Technical SEO",
  "local-seo": "Local SEO",
  "ecommerce-seo": "eCommerce SEO",
  "content-marketing": "Content Marketing",
  ppc: "PPC",
  "social-media": "Social Media",
  "conversion-optimization": "CRO",
};
const service = new URLSearchParams(location.search).get("service");
const select = document.querySelector("#contact-form select");
if (select && serviceNames[service]) {
  const option = [...select.options].find(
    (option) => option.text.trim() === serviceNames[service],
  );
  if (option) select.value = option.value;
}

// Keep dropdown options inside the card, in the form's normal document flow.
document.querySelectorAll("#contact-form select").forEach((control) => {
  const field = control.closest(".field");
  const label = field.querySelector("label");
  const menu = document.createElement("details");
  menu.className = "auth-select contact-select";
  const trigger = document.createElement("summary");
  trigger.id = control.id + "-trigger";
  control.dataset.dropdownTrigger = trigger.id;
  label.id = control.id + "-caption";
  const value = document.createElement("span");
  value.id = control.id + "-value";
  trigger.setAttribute("aria-labelledby", label.id + " " + value.id);
  if (control.hasAttribute("aria-describedby")) {
    trigger.setAttribute("aria-describedby", control.getAttribute("aria-describedby"));
  }
  trigger.append(value);
  const options = document.createElement("div");
  options.className = "auth-select-options";
  options.setAttribute("role", "group");
  options.setAttribute("aria-labelledby", label.id);
  const choices = [];
  Array.from(control.options).filter((option) => !option.disabled && !option.hidden).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.textContent;
    button.addEventListener("click", () => {
      control.value = option.value;
      control.dispatchEvent(new Event("change", { bubbles: true }));
      menu.open = false;
      trigger.focus();
    });
    options.append(button);
    choices.push({ button, option });
  });
  function syncSelection() {
    value.textContent = control.selectedOptions[0]?.textContent || "Select an option";
    choices.forEach(({ button, option }) => {
      button.setAttribute("aria-pressed", String(option.value === control.value));
    });
  }
  menu.append(trigger, options);
  control.after(menu);
  control.hidden = true;
  label.addEventListener("click", (event) => {
    event.preventDefault();
    menu.open = true;
    trigger.focus();
  });
  control.addEventListener("change", () => {
    syncSelection();
    validateField(control);
  });
  trigger.addEventListener("blur", () => validateField(control));
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menu.open = false;
      trigger.focus();
    }
  });
  control.form.addEventListener("reset", () => {
    menu.open = false;
    trigger.removeAttribute("aria-invalid");
    setTimeout(syncSelection, 0);
  });
  syncSelection();
});
