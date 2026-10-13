const ARTICLES = [
  [
    "Technical SEO Checklist for 2027",
    "Technical SEO",
    "Start with crawl access, index coverage and the pages that matter most to your business.",
    "Audit a representative set of templates before chasing individual warnings. Review robots directives, canonicals, XML sitemaps, redirects and internal links. Validate changes in your analytics and search tools. Treat this as a planning checklist, not a prediction of future search rules.",
  ],
  [
    "How Search Intent Shapes SEO Strategy",
    "Strategy",
    "Build a page around the decision a visitor needs to make.",
    "Separate informational, comparison and transactional needs. Read the current search results and speak with customers to understand language and expectations. Give each page a clear purpose and measure the next useful action.",
  ],
  [
    "Building Topical Authority",
    "Content",
    "Connect expertise, useful resources and a coherent site structure.",
    "Choose a topic your team can explain well. Answer the main questions with original examples, then link supporting resources so readers can explore deeper. Update content as your knowledge and customer needs evolve.",
  ],
  [
    "Local SEO Strategies for Growing Businesses",
    "Local SEO",
    "Make it easy for nearby customers to find accurate information.",
    "Keep names, addresses and opening hours consistent. Give each genuine location a useful page with services and directions. Ask customers for honest feedback and evaluate enquiries rather than raw profile views.",
  ],
  [
    "eCommerce SEO Best Practices",
    "eCommerce",
    "Improve discovery across categories, products and navigation.",
    "Start with category pages that reflect how customers shop. Write helpful product details, use descriptive links and control duplicate filter combinations. Track revenue and stock availability alongside visibility.",
  ],
  [
    "How Core Web Vitals Affect Search Performance",
    "Technical SEO",
    "A faster, more stable experience helps visitors use your website.",
    "Investigate loading, interaction responsiveness and layout movement on real devices. Resize images, reduce unnecessary scripts and reserve space for media. Performance is one part of a helpful website, so assess it alongside relevance and usability.",
  ],
  [
    "Content Refresh Strategies",
    "Content",
    "Keep useful pages accurate instead of constantly publishing more.",
    "Review pages with declining engagement or outdated information. Check examples, links, screenshots and customer questions. Preserve valuable URLs and document changes so their impact can be assessed.",
  ],
  [
    "Keyword Research Beyond Search Volume",
    "Strategy",
    "Choose opportunities using intent, fit and conversion potential.",
    "A small-volume query can matter when it closely matches your offering. Group related needs, evaluate the competition and identify the best page format. Prioritise topics your business can answer credibly.",
  ],
  [
    "Internal Linking Strategies",
    "Technical SEO",
    "Help readers and search engines discover related information.",
    "Use contextual links with descriptive anchor text. Connect supporting resources to relevant service or product pages and fix orphaned content. Avoid excessive repetitive links that make pages harder to read.",
  ],
  [
    "Measuring SEO ROI",
    "Analytics",
    "Connect visibility to qualified leads, sales and realistic attribution.",
    "Define primary conversions and validate tracking before reviewing return. Combine analytics with CRM outcomes when available. Explain attribution limits and distinguish leading indicators from realised revenue.",
  ],
  [
    "Organic Traffic vs Paid Traffic",
    "PPC",
    "Use both channels according to the question you need to answer.",
    "Paid campaigns can test messaging and reach defined audiences quickly. Organic content can support discovery over time but requires sustained work. Compare conversion quality and marginal cost rather than declaring one universal winner.",
  ],
  [
    "Conversion Optimization for SEO Landing Pages",
    "CRO",
    "Make the next step clear without interrupting the visitor\u2019s task.",
    "Match the headline to the query and offer the information needed to make a decision. Reduce unnecessary form fields, clarify expectations and make mobile interactions comfortable. Test changes with a specific hypothesis.",
  ],
];

let currentBlog = "All";
function updateBlog() {
  const q = (document.querySelector("#blog-search")?.value || "").toLowerCase();
  let count = 0;
  document.querySelectorAll(".article-card").forEach((c) => {
    const show =
      (currentBlog === "All" || c.dataset.category === currentBlog) &&
      c.dataset.search.includes(q);
    c.hidden = !show;
    if (show) count++;
  });
  const s = document.querySelector("#blog-results");
  if (s) s.textContent = count + " articles";
  const empty = document.querySelector("#no-articles");
  if (empty) empty.hidden = count > 0;
}
document.querySelectorAll(".filter-bar").forEach((bar) =>
  bar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (!b) return;
    bar.querySelectorAll("button").forEach((x) => {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-pressed", x === b ? "true" : "false");
    });
    if (bar.dataset.filterTarget === "article-card") {
      currentBlog = b.dataset.filter;
      updateBlog();
    } else {
      let n = 0;
      document.querySelectorAll(".case-card").forEach((c) => {
        c.hidden =
          b.dataset.filter !== "All" && c.dataset.category !== b.dataset.filter;
        if (!c.hidden) n++;
      });
      document.querySelector("#case-results").textContent =
        n + " example campaigns";
    }
  }),
);
document.querySelector("#blog-search")?.addEventListener("input", updateBlog);
document.querySelectorAll("[data-topic]").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelector(
        '.filter-bar[data-filter-target="article-card"] [data-filter="' +
          b.dataset.topic +
          '"]',
      )
      .click();
    document.querySelector("#articles").scrollIntoView({ behavior: "smooth" });
  }),
);
const dialog = document.querySelector("#article-dialog");
document.querySelectorAll(".article-open").forEach((b) =>
  b.addEventListener("click", () => {
    const a = ARTICLES[+b.dataset.article];
    document.querySelector("#article-category").textContent = a[1];
    document.querySelector("#article-title").textContent = a[0];
    const box = document.querySelector("#article-content");
    box.replaceChildren();
    [
      a[2],
      a[3],
      "Putting it into practice: choose one important page or customer journey, document its current performance, and define the question you want an improvement to answer. Review the result with context before expanding the change.",
    ].forEach((t) => {
      const p = document.createElement("p");
      p.textContent = t;
      box.append(p);
    });
    dialog.showModal();
  }),
);
dialog
  .querySelector(".dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
