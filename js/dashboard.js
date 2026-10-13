/* Workspace behavior for server accounts and static-site previews. */
const role = document.body.dataset.role;
const message = document.getElementById("workspace-status");
let loaded = false;
const demoSession = JSON.parse(sessionStorage.getItem("stackly-demo-session") || "null");
const demoKey = demoSession
  ? "stackly-demo-" + demoSession.role + "-" + demoSession.email
  : null;
function demoApi(path, method, body) {
  if (path === "logout") {
    sessionStorage.removeItem("stackly-demo-session");
    return {};
  }
  const saved = JSON.parse(localStorage.getItem(demoKey) || "null");
  const workspace = saved || {
    user: {
      name: demoSession.email.split("@")[0],
      role: demoSession.role,
      company: "",
      goal: "",
    },
    items: [],
  };
  if (demoSession.role === "client" && workspace.items.length === 0) {
    const now = Math.floor(Date.now() / 1000);
    workspace.items = [
      { id: now + 1, kind: "request", title: "Improve service page conversions", detail: "Strengthen the call to action and enquiry path on priority service pages.", status: "Open", created: now - 86400 * 2 },
      { id: now + 2, kind: "request", title: "Expand local search coverage", detail: "Review location signals and priority regional search opportunities.", status: "Open", created: now - 86400 * 4 },
      { id: now + 3, kind: "request", title: "Analytics access confirmed", detail: "Measurement access and reporting scope are ready.", status: "Closed", created: now - 86400 * 6 },
      { id: now + 4, kind: "approval", title: "Technical SEO roadmap", detail: "Prioritised fixes for crawlability, performance and index coverage.", status: "Pending", created: now - 86400 * 3 },
      { id: now + 5, kind: "approval", title: "Content topic plan", detail: "Service-led topics mapped to audience search questions.", status: "Pending", created: now - 86400 },
      { id: now + 6, kind: "approval", title: "Campaign measurement plan", detail: "Primary conversion events and reporting cadence confirmed.", status: "Approved", created: now - 86400 * 5 },
      { id: now + 7, kind: "note", title: "Discovery workshop", detail: "Agreed priority services, audience needs and success measures.", status: "Saved", created: now - 86400 * 6 },
      { id: now + 8, kind: "note", title: "Content direction review", detail: "Confirmed page structure, tone and next production steps.", status: "Saved", created: now - 86400 * 2 },
    ];
  } else if (demoSession.role === "team" && workspace.items.length === 0) {
    const now = Math.floor(Date.now() / 1000);
    workspace.items = [
      { id: now + 11, kind: "task", title: "Resolve priority crawl issues", detail: "Apply and validate the technical fixes from the audit roadmap.", status: "To do", created: now - 86400 * 5 },
      { id: now + 12, kind: "task", title: "Prepare service page briefs", detail: "Map intent, headings and conversion actions for the priority pages.", status: "To do", created: now - 86400 * 3 },
      { id: now + 13, kind: "task", title: "Review local landing pages", detail: "Check location relevance, internal links and contact signals.", status: "To do", created: now - 86400 },
      { id: now + 14, kind: "task", title: "Implement analytics events", detail: "Configure and test the agreed enquiry conversion events.", status: "In progress", created: now - 86400 * 4 },
      { id: now + 15, kind: "task", title: "Optimise priority metadata", detail: "Rewrite titles and descriptions for high-opportunity pages.", status: "In progress", created: now - 86400 * 2 },
      { id: now + 16, kind: "task", title: "Complete keyword opportunity map", detail: "Cluster approved terms by service, intent and delivery phase.", status: "Done", created: now - 86400 * 6 },
      { id: now + 17, kind: "task", title: "Validate reporting dashboard", detail: "Confirm filters, conversion totals and reporting labels.", status: "Done", created: now - 86400 * 4 },
      { id: now + 18, kind: "task", title: "Publish technical audit summary", detail: "Share the prioritised findings and implementation sequence.", status: "Done", created: now - 86400 * 3 },
      { id: now + 19, kind: "quality", title: "Mobile layout validation", detail: "Check priority templates at common mobile widths.", status: "Open", created: now - 86400 * 2 },
      { id: now + 20, kind: "quality", title: "Conversion event verification", detail: "Confirm each enquiry path records the correct event.", status: "Open", created: now - 86400 },
      { id: now + 21, kind: "quality", title: "Metadata review", detail: "Confirm titles, descriptions and canonical signals.", status: "Checked", created: now - 86400 * 5 },
      { id: now + 22, kind: "quality", title: "Redirect testing", detail: "Validate redirect destinations and response codes.", status: "Checked", created: now - 86400 * 4 },
      { id: now + 23, kind: "quality", title: "Analytics baseline", detail: "Record the pre-release measurement baseline.", status: "Checked", created: now - 86400 * 3 },
      { id: now + 24, kind: "handoff", title: "Technical fixes release", detail: "Implementation record and validation evidence for client review.", status: "Ready", created: now - 86400 * 2 },
      { id: now + 25, kind: "handoff", title: "Content production pack", detail: "Approved briefs, source notes and next-owner instructions.", status: "Draft", created: now - 86400 },
    ];
  }
  if (path === "profile" && method === "PATCH") {
    workspace.user.company = body.company;
    workspace.user.goal = body.goal;
  } else if (path === "items" && method === "POST") {
    const initial = {
      request: "Open", approval: "Pending", note: "Saved",
      task: "To do", quality: "Open", handoff: "Draft",
    };
    workspace.items.unshift({
      id: Date.now(), kind: body.kind, title: body.title,
      detail: body.detail, status: initial[body.kind],
      created: Math.floor(Date.now() / 1000),
    });
  } else if (path.startsWith("items/") && method === "PATCH") {
    const item = workspace.items.find((entry) => entry.id === Number(path.slice(6)));
    if (item) item.status = body.status;
  }
  localStorage.setItem(demoKey, JSON.stringify(workspace));
  return workspace;
}
const transitions = {
  request: { Open: ["Close request", "Closed"], Closed: ["Reopen", "Open"] },
  approval: {
    Pending: ["Approve milestone", "Approved"],
    Approved: ["Reopen review", "Pending"],
  },
  note: {
    Saved: ["Archive note", "Archived"],
    Archived: ["Restore note", "Saved"],
  },
  task: {
    "To do": ["Start task", "In progress"],
    "In progress": ["Mark complete", "Done"],
    Done: ["Reopen task", "To do"],
  },
  quality: { Open: ["Mark checked", "Checked"], Checked: ["Recheck", "Open"] },
  handoff: {
    Draft: ["Mark ready", "Ready"],
    Ready: ["Return to draft", "Draft"],
  },
};
function notify(text, error = false) {
  message.textContent = text;
  message.className = "workspace-status" + (error ? " error" : "");
}
async function api(path, method = "GET", body) {
  if (demoSession) return demoApi(path, method, body);
  if (location.protocol === "file:")
    throw new Error(
      "Start python server.py and open http://localhost:8000 to use your workspace.",
    );
  const options = { method, headers: { "X-Requested-With": "Stackly" } };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  const response = await fetch("/api/" + path, options);
  const data = await response.json();
  if (response.status === 401) {
    location.replace("signin.html");
    throw new Error("Your session ended. Please sign in again.");
  }
  if (!response.ok)
    throw new Error(data.error || "Unable to save. Please try again.");
  return data;
}
function renderItem(item) {
  const article = document.createElement("article");
  article.className = "work-item";
  const top = document.createElement("div");
  top.className = "item-top";
  const title = document.createElement("h3");
  title.textContent = item.title;
  const tag = document.createElement("span");
  tag.className = "status-tag";
  tag.textContent = item.status;
  top.append(title, tag);
  article.append(top);
  const detail = document.createElement("p");
  detail.textContent = item.detail || "No additional details.";
  article.append(detail);
  const actions = document.createElement("div");
  actions.className = "item-actions";
  const [label, next] = transitions[item.kind][item.status];
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-label", label + ": " + item.title);
  button.addEventListener("click", async () => {
    if (["task", "handoff", "approval", "request"].includes(item.kind) ||
        (item.kind === "quality" && item.status === "Checked")) {
      location.assign("404.html");
      return;
    }
    button.disabled = true;
    try {
      await api("items/" + item.id, "PATCH", { status: next });
      await loadWorkspace();
      notify("Updated “" + item.title + "” to " + next + ".");
    } catch (error) {
      notify(error.message, true);
      button.disabled = false;
    }
  });
  actions.append(button);
  article.append(actions);
  return article;
}
function renderSectionBars(items, user) {
  document.querySelectorAll("[data-section-bars]").forEach((container) => {
    const kind = container.dataset.sectionBars;
    const rows = kind === "profile"
      ? [
          ["Name / workstream", Boolean(user.company)],
          ["Goals / priorities", Boolean(user.goal)],
        ]
      : (kind === "approval" ? ["Pending", "Approved"]
        : kind === "request" ? ["Open", "Closed"]
        : kind === "note" ? ["Saved", "Archived"]
        : kind === "quality" ? ["Open", "Checked"]
        : kind === "handoff" ? ["Draft", "Ready"]
        : ["To do", "In progress", "Done"])
          .map((state) => [state, items.filter((item) => item.kind === kind && item.status === state).length]);
    const max = Math.max(1, ...rows.map((row) => Number(row[1])));
    container.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "section-bar-row";
      const heading = document.createElement("div");
      heading.className = "section-bar-heading";
      const name = document.createElement("span");
      name.textContent = label;
      const count = document.createElement("strong");
      count.textContent = kind === "profile" ? (value ? "Complete" : "Add details") : String(value);
      heading.append(name, count);
      const track = document.createElement("div");
      track.className = "section-bar-track";
      const fill = document.createElement("div");
      fill.className = "section-bar-fill";
      fill.style.width = (kind === "profile" ? (value ? 100 : 0) : value / max * 100) + "%";
      track.append(fill);
      row.append(heading, track);
      container.append(row);
    });
  });
}
async function loadWorkspace() {
  const { user, items } = await api("workspace");
  if (user.role !== role) {
    location.replace(user.role + "-dashboard.html");
    return;
  }
  document.getElementById("account-name").textContent = user.name;
  document.getElementById("account-avatar").textContent = user.name
    .trim()
    .slice(0, 1)
    .toUpperCase();
  if (!loaded) {
    const company = document.getElementById("profile-company");
    const goal = document.getElementById("profile-goal");
    if (company) company.value = user.company;
    if (goal) goal.value = user.goal;
    loaded = true;
  }
  window.StacklyCharts?.render(role, items);
  renderSectionBars(items, user);
  const count = (kind, status) =>
    items.filter((i) => i.kind === kind && (!status || i.status === status))
      .length;
  const metrics =
    role === "client"
      ? {
          open: count("request", "Open"),
          pending: count("approval", "Pending"),
          approved: count("approval", "Approved"),
          notes: count("note", "Saved"),
        }
      : {
          active: count("task", "To do") + count("task", "In progress"),
          progress: count("task", "In progress"),
          completed: count("task", "Done"),
          checks: count("quality", "Open"),
        };
  document
    .querySelectorAll("[data-metric]")
    .forEach((el) => (el.textContent = metrics[el.dataset.metric]));
  document
    .querySelectorAll("[data-phase]")
    .forEach((el) => (el.textContent = count("task", el.dataset.phase)));
  document.querySelectorAll("[data-list]").forEach((list) => {
    list.replaceChildren();
    const filtered = items.filter((i) => i.kind === list.dataset.list);
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Nothing saved here yet. Add your first item below.";
      list.append(empty);
    } else filtered.forEach((item) => list.append(renderItem(item)));
  });
}
document.querySelectorAll("[data-item-form]").forEach((form) =>
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector(".form-status");
    button.disabled = true;
    status.className = "form-status";
    status.textContent = "Saving…";
    try {
      await api("items", "POST", {
        ...Object.fromEntries(new FormData(form)),
        kind: form.dataset.itemForm,
      });
      form.reset();
      await loadWorkspace();
      status.textContent = "Saved to your workspace.";
      status.classList.add("success");
    } catch (error) {
      status.textContent = error.message;
      status.classList.add("error");
    } finally {
      button.disabled = false;
    }
  }),
);
const profileForm = document.getElementById("profile-form");
if (profileForm) profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector(".form-status");
    button.disabled = true;
    status.className = "form-status";
    status.textContent = "Saving…";
    try {
      await api("profile", "PATCH", Object.fromEntries(new FormData(form)));
      await loadWorkspace();
      status.textContent = "Your updates are saved.";
      status.classList.add("success");
    } catch (error) {
      status.textContent = error.message;
      status.classList.add("error");
    } finally {
      button.disabled = false;
    }
  });
document.getElementById("signout").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    await api("logout", "POST", {});
    location.replace("signin.html");
  } catch (error) {
    notify(error.message, true);
    button.disabled = false;
  }
});
function prepareDashboardViews() {
  document.body.classList.add("dashboard-tabs");
  const main = document.querySelector(".workspace-main");
  const header = document.getElementById("overview");
  const analytics = document.getElementById("analytics");
  if (header && analytics && !document.querySelector('[data-view="overview"]')) {
    const overview = document.createElement("section");
    header.removeAttribute("id");
    overview.id = "overview";
    overview.className = "dashboard-view dashboard-overview";
    overview.dataset.view = "overview";
    main.insertBefore(overview, header);
    let current = header;
    while (current && current !== analytics) {
      const next = current.nextSibling;
      overview.append(current);
      current = next;
    }
  }
  document.querySelectorAll(".workspace-sidebar nav a").forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    const view = id === "overview"
      ? document.getElementById("overview")
      : document.getElementById(id);
    if (view) {
      view.classList.add("dashboard-view");
      view.dataset.view = id;
    }
  });
}
function updateActiveSection() {
  const current = (location.hash || "#overview").slice(1);
  let found = false;
  document.querySelectorAll(".dashboard-view").forEach((view) => {
    const active = view.dataset.view === current;
    view.hidden = !active;
    if (active) found = true;
  });
  const selected = found ? current : "overview";
  document.querySelectorAll(".workspace-sidebar nav a").forEach((link) => {
    const active = link.getAttribute("href") === "#" + selected;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  const view = document.querySelector('[data-view="' + selected + '"]');
  if (view) view.scrollIntoView({ block: "start" });
}
prepareDashboardViews();
addEventListener("hashchange", updateActiveSection);
updateActiveSection();
loadWorkspace().catch((error) => notify(error.message, true));

/* Keep every workspace destination reachable on narrow and short screens. */
const workspaceSidebar = document.querySelector('.workspace-sidebar');
const workspaceMenuToggle = document.querySelector('.workspace-menu-toggle');
const workspaceMenu = document.getElementById('workspace-menu');
function closeWorkspaceMenu(returnFocus = false) {
  workspaceSidebar.classList.remove('menu-expanded');
  document.body.classList.remove('workspace-menu-open');
  workspaceMenuToggle.setAttribute('aria-expanded', 'false');
  workspaceMenuToggle.setAttribute('aria-label', 'Open workspace navigation');
  if (returnFocus) workspaceMenuToggle.focus();
}
workspaceMenuToggle.addEventListener('click', () => {
  const open = workspaceMenuToggle.getAttribute('aria-expanded') !== 'true';
  workspaceSidebar.classList.toggle('menu-expanded', open);
  document.body.classList.toggle('workspace-menu-open', open);
  workspaceMenuToggle.setAttribute('aria-expanded', String(open));
  workspaceMenuToggle.setAttribute('aria-label', open ? 'Close workspace navigation' : 'Open workspace navigation');
});
workspaceMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  closeWorkspaceMenu();
  if (link.getAttribute('href').startsWith('#')) {
    const destination = document.getElementById(link.hash.slice(1));
    if (destination) {
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    }
  }
}));
document.addEventListener('keydown', event => {
  if (workspaceMenuToggle.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') closeWorkspaceMenu(true);
  if (event.key === 'Tab') {
    const controls = [workspaceMenuToggle, ...workspaceMenu.querySelectorAll('a, button')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
});
matchMedia('(min-width: 801px)').addEventListener('change', event => {
  if (event.matches) closeWorkspaceMenu();
});
