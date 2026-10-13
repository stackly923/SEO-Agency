/* Account form: the server verifies credentials and assigns the dashboard. */
const dashboards = { client: "/client-dashboard.html", team: "/team-dashboard.html" };
const form = document.getElementById("auth-form");
const status = document.getElementById("auth-status");
const role = document.getElementById("role");
const invitation = document.getElementById("invitation-field");
const password = document.getElementById("password");
const toggle = document.getElementById("show-password");
// Expand options in the form's normal flow so they cannot cover later fields.
form.querySelectorAll("select").forEach((select) => {
  const label = select.closest("label");
  if (!label) return;
  const field = document.createElement("div");
  field.className = "auth-select-field";
  const caption = document.createElement("span");
  caption.id = select.id + "-caption";
  caption.textContent = label.firstChild.textContent.trim();
  const menu = document.createElement("details");
  menu.className = "auth-select";
  const trigger = document.createElement("summary");
  const value = document.createElement("span");
  value.id = select.id + "-value";
  trigger.setAttribute("aria-labelledby", caption.id + " " + value.id);
  trigger.append(value);
  const options = document.createElement("div");
  options.className = "auth-select-options";
  options.setAttribute("role", "group");
  options.setAttribute("aria-labelledby", caption.id);
  const buttons = [];
  Array.from(select.options).filter((option) => !option.disabled && !option.hidden).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.textContent;
    button.addEventListener("click", () => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      menu.open = false;
      trigger.focus();
    });
    options.append(button);
    buttons.push({ button, option });
  });
  function syncSelection() {
    value.textContent = select.selectedOptions[0]?.textContent || "Select an option";
    buttons.forEach(({ button, option }) => {
      button.setAttribute("aria-pressed", String(option.value === select.value));
    });
    if (select.validity.valid) trigger.removeAttribute("aria-invalid");
  }
  menu.append(trigger, options);
  label.replaceWith(field);
  field.append(caption, select, menu);
  select.hidden = true;
  select.addEventListener("change", syncSelection);
  select.addEventListener("invalid", (event) => {
    event.preventDefault();
    menu.open = true;
    trigger.setAttribute("aria-invalid", "true");
    trigger.focus();
    status.textContent = "Select a role to continue.";
    status.className = "form-status error";
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menu.open = false;
      trigger.focus();
    }
  });
  form.addEventListener("reset", () => {
    menu.open = false;
    setTimeout(syncSelection, 0);
  });
  syncSelection();
});
function openDemoDashboard(payload) {
  const dashboard = dashboards[payload.role];
  if (!dashboard) throw new Error("Select a role to continue.");
  const email = payload.email.trim().toLowerCase();
  sessionStorage.setItem("stackly-demo-session", JSON.stringify({ email, role: payload.role }));
  status.textContent = "Opening your dashboard…";
  location.assign(dashboard.slice(1));
}
function updateInvitation() {
  if (!invitation) return;
  invitation.hidden = role.value !== "team";
  document.getElementById("invite").required = role.value === "team";
}
role.addEventListener("change", updateInvitation);
updateInvitation();
toggle.addEventListener("click", () => {
  const show = password.type === "password";
  password.type = show ? "text" : "password";
  const confirm = document.getElementById("confirm-password");
  if (confirm) confirm.type = password.type;
  toggle.textContent = show ? "Hide password" : "Show password";
  toggle.setAttribute("aria-pressed", String(show));
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector('[type="submit"]');
  if (button.disabled) return;
  status.className = "form-status";
  const payload = Object.fromEntries(new FormData(form));
  if (
    form.dataset.mode === "register" &&
    payload.password !== payload.confirm
  ) {
    status.textContent = "The passwords do not match.";
    status.classList.add("error");
    document.getElementById("confirm-password").focus();
    return;
  }
  delete payload.confirm;
  button.disabled = true;
  status.textContent = "Please wait…";
  try {
    if (location.protocol === "file:" && form.dataset.mode === "login") {
      openDemoDashboard(payload);
      return;
    }
    const response = await fetch("/api/" + form.dataset.mode, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "Stackly",
      },
      body: JSON.stringify(payload),
    });
    if (!(response.headers.get("Content-Type") || "").includes("application/json")) {
      if (form.dataset.mode === "login") {
        openDemoDashboard(payload);
        return;
      }
      throw new Error("Account creation requires the Python server.");
    }
    const data = await response.json();
    if (response.status === 404 && form.dataset.mode === "login") {
      openDemoDashboard(payload);
      return;
    }
    if (!response.ok)
      throw new Error(data.error || "Unable to continue. Please try again.");
    const dashboard = dashboards[payload.role];
    if (!dashboard || data.redirect !== dashboard)
      throw new Error(
        "The selected role does not match your account. Please try again.",
      );
    status.textContent =
      "Success. Opening your " +
      (payload.role === "client" ? "Client" : "Team") +
      " dashboard…";
    location.replace(dashboard);
  } catch (error) {
    status.textContent =
      error.message === "Failed to fetch"
        ? "Unable to reach the server. Start python server.py and try again."
        : error.message;
    status.classList.add("error");
  } finally {
    button.disabled = false;
  }
});
