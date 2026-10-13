/* Accessible SVG charts derived only from the signed-in user's saved items. */
window.StacklyCharts = (() => {
  const NS = "http://www.w3.org/2000/svg";
  function node(tag, attrs = {}, text = "") {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    if (text) el.textContent = text;
    return el;
  }
  function svg(label, box = "0 0 640 280") {
    const s = node("svg", { viewBox: box, role: "img", "aria-label": label });
    s.append(node("title", {}, label));
    return s;
  }
  function text(s, x, y, value, extra = {}) {
    s.append(
      node(
        "text",
        {
          x,
          y,
          fill: "#bacede",
          "font-size": 20,
          "font-family": "Arial, sans-serif",
          ...extra,
        },
        String(value),
      ),
    );
  }
  function legend(host, entries, colors) {
    const list = document.createElement("ul");
    list.className = "chart-values";
    entries.forEach((e, i) => {
      const li = document.createElement("li");
      if (colors) {
        const swatch = document.createElement("span");
        swatch.className = "chart-swatch";
        swatch.style.backgroundColor = colors[i];
        swatch.setAttribute("aria-hidden", "true");
        li.append(swatch);
      }
      const label = document.createElement("span");
      label.textContent = e.label + ": ";
      const value = document.createElement("strong");
      value.textContent = e.value;
      li.append(label, value);
      list.append(li);
    });
    host.append(list);
  }
  function render(role, items) {
    const hosts = ["line", "bar", "pie"].map((k) =>
      document.getElementById("chart-" + k),
    );
    if (hosts.some((h) => !h)) return;
    hosts.forEach((h) => h.replaceChildren());
    const colors =
      role === "client"
        ? ["#63dfd4", "#739be9", "#f0c377"]
        : ["#b1bdff", "#67d6d0", "#f0c377"];
    const relevant =
      role === "team" ? items.filter((i) => i.kind === "task") : items;
    const now = new Date();
    const days = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - offset,
      );
      const end =
        new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() /
        1000;
      days.push({
        label: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        value: relevant.filter((i) => i.created < end).length,
      });
    }
    const max = Math.max(1, ...days.map((d) => d.value));
    const x = (i) => 65 + i * 88;
    const y = (v) => 215 - (v / max) * 160;
    const line = svg(
      (role === "client" ? "Saved records" : "Created delivery tasks") +
        " over the last seven days. " +
        days.map((d) => d.label + ": " + d.value).join("; "),
    );
    for (let i = 0; i < 3; i++) {
      const v = (max * i) / 2;
      line.append(
        node("line", {
          x1: 65,
          x2: 593,
          y1: y(v),
          y2: y(v),
          stroke: "#30495c",
          "stroke-width": 1,
        }),
      );
      text(line, 50, y(v) + 7, Number.isInteger(v) ? v : v.toFixed(1), {
        "text-anchor": "end",
      });
    }
    const points = days.map((d, i) => x(i) + "," + y(d.value)).join(" ");
    line.append(
      node("polygon", {
        points: "65,215 " + points + " 593,215",
        fill: colors[0],
        "fill-opacity": 0.09,
      }),
    );
    line.append(
      node("polyline", {
        points,
        fill: "none",
        stroke: colors[0],
        "stroke-width": 4,
        "stroke-linejoin": "round",
      }),
    );
    days.forEach((d, i) => {
      const mark = node("circle", {
        cx: x(i),
        cy: y(d.value),
        r: 5,
        fill: colors[0],
      });
      mark.append(node("title", {}, d.label + ": " + d.value));
      line.append(mark);
      if (i % 2 === 0)
        text(line, x(i), 250, d.label, { "text-anchor": "middle" });
    });
    hosts[0].append(line);
    legend(hosts[0], [
      {
        label: "Total saved " + (role === "team" ? "tasks" : "records"),
        value: relevant.length,
      },
    ]);
    const categories =
      role === "client"
        ? [
            ["request", "Requests"],
            ["approval", "Approvals"],
            ["note", "Notes"],
          ]
        : [
            ["task", "Tasks"],
            ["quality", "Checks"],
            ["handoff", "Handovers"],
          ];
    const bars = categories.map(([kind, label]) => ({
      label,
      value: items.filter((i) => i.kind === kind).length,
    }));
    const barMax = Math.max(1, ...bars.map((d) => d.value));
    const bar = svg(
      "Saved work by category. " +
        bars.map((d) => d.label + ": " + d.value).join("; "),
    );
    [0, barMax / 2, barMax].forEach((v) => {
      const yy = 215 - (v / barMax) * 160;
      bar.append(
        node("line", { x1: 65, x2: 600, y1: yy, y2: yy, stroke: "#30495c" }),
      );
      text(bar, 50, yy + 7, Number.isInteger(v) ? v : v.toFixed(1), {
        "text-anchor": "end",
      });
    });
    bars.forEach((d, i) => {
      const xx = 110 + i * 165,
        hh = (d.value / barMax) * 160;
      const rect = node("rect", {
        x: xx,
        y: 215 - hh,
        width: 90,
        height: hh,
        rx: 5,
        fill: colors[i],
      });
      rect.append(node("title", {}, d.label + ": " + d.value));
      bar.append(rect);
      text(bar, xx + 45, Math.max(35, 203 - hh), d.value, {
        "text-anchor": "middle",
        fill: "#f2f8ff",
      });
      text(bar, xx + 45, 250, d.label, { "text-anchor": "middle" });
    });
    hosts[1].append(bar);
    legend(hosts[1], bars, colors);
    const statuses =
      role === "client"
        ? ["Pending", "Approved"]
        : ["To do", "In progress", "Done"];
    const kind = role === "client" ? "approval" : "task";
    const slices = statuses.map((label) => ({
      label,
      value: items.filter((i) => i.kind === kind && i.status === label).length,
    }));
    const total = slices.reduce((sum, d) => sum + d.value, 0);
    const wrap = document.createElement("div");
    wrap.className = "pie-layout";
    const pie = svg(
      "Status distribution. " +
        slices.map((d) => d.label + ": " + d.value).join("; "),
      "0 0 260 260",
    );
    if (!total) {
      pie.append(node("circle", { cx: 130, cy: 130, r: 102, fill: "#243a4e" }));
      text(pie, 130, 135, "No items yet", {
        "text-anchor": "middle",
        "font-size": 18,
      });
    } else {
      let start = -Math.PI / 2;
      slices.forEach((d, i) => {
        if (!d.value) return;
        const angle = (d.value / total) * Math.PI * 2;
        let path;
        if (d.value === total) {
          path = node("circle", { cx: 130, cy: 130, r: 102, fill: colors[i] });
        } else {
          const end = start + angle;
          const x1 = 130 + 102 * Math.cos(start),
            y1 = 130 + 102 * Math.sin(start),
            x2 = 130 + 102 * Math.cos(end),
            y2 = 130 + 102 * Math.sin(end);
          path = node("path", {
            d: `M130 130 L${x1} ${y1} A102 102 0 ${angle > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`,
            fill: colors[i],
          });
        }
        path.append(
          node(
            "title",
            {},
            d.label +
              ": " +
              d.value +
              " (" +
              Math.round((d.value / total) * 100) +
              "%)",
          ),
        );
        pie.append(path);
        start += angle;
      });
    }
    wrap.append(pie);
    const side = document.createElement("div");
    legend(side, slices, colors);
    wrap.append(side);
    hosts[2].append(wrap);
    document.getElementById("insight-line").textContent =
      relevant.length +
      " " +
      (role === "client"
        ? "records are available to review."
        : "tasks are in your delivery workspace.");
    document.getElementById("insight-bar").textContent =
      role === "client"
        ? bars[0].value +
          " requests, " +
          bars[1].value +
          " milestones and " +
          bars[2].value +
          " notes."
        : bars[0].value +
          " tasks, " +
          bars[1].value +
          " checks and " +
          bars[2].value +
          " handovers.";
    document.getElementById("insight-pie").textContent =
      role === "client"
        ? slices[0].value + " milestones await your review."
        : slices[1].value + " tasks are currently in progress.";
  }
  return { render };
})();
