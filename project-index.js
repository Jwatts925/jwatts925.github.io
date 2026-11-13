const projectIndexData = [
  { name: "200 Mission", address: "San Francisco, CA", slug: "200-mission", images: 3 },
  { name: "405 Industrial", address: "San Carlos, CA", slug: "405-industrial", images: 3 },
  { name: "Samuel Merritt University", address: "Oakland, CA", slug: "samuel-merritt-university", images: 4 },
  { name: "Stanford Bridge", address: "Stanford, CA", slug: "stanford-bridge", images: 3 },
  { name: "490 South Mathilda", address: "Sunnyvale, CA", slug: "490-south-mathilda", images: 3 },
  { name: "777 Airport Boulevard", address: "Burlingame, CA", slug: "777-airport-boulevard", images: 3 },
  { name: "ACLS", address: "Millbrae, CA", slug: "acls", images: 3 },
  { name: "888 Ross", address: "Sunnyvale, CA", slug: "888-ross", images: 3 },
  { name: "IQHQ Aventine", address: "San Diego, CA", slug: "iqhq-aventine", images: 3 },
  { name: "City of Hope", address: "Duarte, CA", slug: "city-of-hope", images: 9 },
  { name: "1389 Moffett Park", address: "Sunnyvale, CA", slug: "1389-moffett-park", images: 3 },
  { name: "Project 63", address: "Las Vegas, NV", slug: "project-63", images: 5 },
  { name: "Project Nomar North", address: "Burlingame, CA", slug: "project-nomar-north", images: 3 },
  { name: "Project Nomar South", address: "Burlingame, CA", slug: "project-nomar-south", images: 3 },
  { name: "Pier 70A", address: "San Francisco, CA", slug: "pier-70a", images: 3 },
  { name: "Moffett Towers Building 6", address: "Sunnyvale, CA", slug: "moffett-towers-building-6", images: 3 },
  { name: "The Ranch Lot Studios", address: "Burbank, CA", slug: "the-ranch-lot-studios", images: 3 },
  { name: "Joint Venture Cancer Center", address: "Oakland, CA", slug: "joint-venture-cancer-center", images: 3 },
  { name: "UNLV", address: "Las Vegas, NV", slug: "unlv", images: 8 },
  { name: "UCSD Discovery", address: "La Jolla, CA", slug: "ucsd-discovery", images: 3 },
  { name: "UNR Mathewson", address: "Reno, NV", slug: "unr-mathewson", images: 3 },
  { name: "Saint Francis High School", address: "Mountain View, CA", slug: "saint-francis-high-school", images: 3 },
  { name: "UCSF Benioff Parking Structure", address: "San Francisco, CA", slug: "ucsf-benioff-parking-structure", images: 5 },
  { name: "UCSC Heller Housing", address: "Santa Cruz, CA", slug: "ucsc-heller-housing", images: 10 },
  { name: "East County Services Center", address: "Brentwood, CA", slug: "east-county-services-center", images: 5 },
  { name: "Sonoma Government Center", address: "Santa Rosa, CA", slug: "sonoma-government-center", images: 8 },
  { name: "UCB Heathcock", address: "Berkeley, CA", slug: "ucb-heathcock", images: 4 },
  { name: "SFO Guardrail", address: "San Francisco, CA", slug: "sfo-guardrail", images: 6 },
  { name: "SFO Icebox", address: "San Francisco, CA", slug: "sfo-icebox", images: 10 },
  { name: "SFUSD", address: "San Francisco, CA", slug: "sfusd", images: 6 },
  { name: "STEM - Mission College", address: "Santa Clara, CA", slug: "stem-mission-college", images: 4 },
  { name: "Gilead Technical Development Center", address: "Foster City, CA", slug: "gilead-technical-development-center", images: 5 },
  { name: "Workday Meeting Center", address: "Pleasanton, CA", slug: "workday-meeting-center", images: 6 },
  { name: "West Valley College", address: "Saratoga, CA", slug: "west-valley-college", images: 7 },
  { name: "SFO Cargo", address: "San Francisco, CA", slug: "sfo-cargo", images: 6 },
  { name: "Sutter MOB", address: "Roseville, CA", slug: "sutter-mob", images: 5 },
  { name: "Millbrae Yards Phase II", address: "Millbrae, CA", slug: "millbrae-yards-phase-ii", images: 5 },
  { name: "SLAC - National Accelerator Lab", address: "Menlo Park, CA", slug: "slac-national-accelerator-lab", images: 10 },
  {
    name: "San Quentin Rehabilitation Center", address: "San Quentin, CA", slug: "san-quentin-rehabilitation-center", images: 13,
    galleryImages: [
      { file: "site-01.jpg", alt: "San Quentin Rehabilitation Center courtyard and glazed building facades", width: 2000, height: 1181 },
      { file: "site-02.jpg", alt: "Glazing, metal cladding, and courtyard seating at San Quentin Rehabilitation Center", width: 1757, height: 1800 },
      { file: "site-03.jpg", alt: "San Quentin Rehabilitation Center rooftop terrace beside the glazed facade", width: 2000, height: 1334 },
    ],
  },
  {
    name: "Stanford Atrium", address: "Stanford, CA", slug: "stanford-atrium", images: 10,
    galleryImages: [
      { file: "site-01.jpg", alt: "Stanford Atrium facade with vertical perforated fins and glazing during construction", width: 2000, height: 1304 },
      { file: "site-02.jpg", alt: "Upward view of Stanford Atrium perforated fins, mounting arms, and glazing", width: 1658, height: 2000 },
      { file: "site-08.jpg", alt: "Interior scaffolding alongside Stanford Atrium glazing and perforated panels", width: 2000, height: 753 },
      { file: "site-07.jpg", alt: "Stanford Atrium walkway beside glazing installation", width: 2000, height: 1048 },
      { file: "site-05.jpg", alt: "Stanford Atrium lower facade glazing during construction", width: 2000, height: 1313 },
      { file: "site-06.jpg", alt: "Close view of Stanford Atrium perforated fins and their mounting details", width: 2000, height: 1546 },
    ],
  },
  { name: "YMCA - Redwood City", address: "Redwood City, CA", slug: "ymca-redwood-city", images: 79 },
  { name: "SSF Wellness", address: "South San Francisco, CA", slug: "ssf-wellness", images: 10 },
  {
    name: "SEP 7 - SFPUC", address: "San Francisco, CA", slug: "sep-7-sfpuc",
    galleryImages: [
      { file: "model-01.webp", alt: "Isometric façade model with color-coded glazing and vertical fins", width: 1812, height: 1105 },
      { file: "model-02.webp", alt: "Isometric model showing corner glazing, window openings, and the roof perimeter", width: 2048, height: 1107 },
      { file: "model-03.webp", alt: "Opposite isometric view of the glazing, window openings, and roof perimeter", width: 2048, height: 1259 },
      { file: "model-04.webp", alt: "Isometric façade model showing the long elevation with vertical fins", width: 1768, height: 1083 },
      { file: "site-7442.webp", alt: "Boom lifts beside two timber structures during façade installation", width: 1800, height: 1442 },
      { file: "site-7447.webp", alt: "Boom lifts reaching the roof edge and upper level of the timber building", width: 1800, height: 1200 },
      { file: "site-7455.webp", alt: "Vertical façade framing at a corner of the exposed timber structure", width: 1800, height: 1605 },
      { file: "site-7574.webp", alt: "Blue boom lift reaching the roof at a timber building corner", width: 1063, height: 1800 },
      { file: "site-7576.webp", alt: "Street view of the timber building under construction with a lift at the roof edge", width: 1800, height: 1200 },
      { file: "site-7585.webp", alt: "Lift platform alongside upper-floor façade framing beneath a timber roof", width: 1800, height: 1794 },
      { file: "site-7586.webp", alt: "Timber framing and diagonal steel braces at the building exterior", width: 906, height: 1800 },
      { file: "site-7592.webp", alt: "Steel framing and tall columns below the projecting timber roof", width: 1800, height: 1420 },
    ],
  },
];

const projectIndexList = document.querySelector("[data-project-index]");

if (projectIndexList) {
  const featuredWaltersWolfSlugs = [
    "samuel-merritt-university",
    "city-of-hope",
    "project-63",
    "unlv",
  ];
  const saintFrancisIndex = projectIndexData.findIndex(
    (project) => project.slug === "saint-francis-high-school",
  );
  const featuredOrder = new Map(
    featuredWaltersWolfSlugs.map((slug, index) => [slug, index]),
  );
  const waltersWolfProjects = projectIndexData
    .slice(0, saintFrancisIndex + 1)
    .sort((firstProject, secondProject) => {
      const firstPriority = featuredOrder.get(firstProject.slug);
      const secondPriority = featuredOrder.get(secondProject.slug);

      if (firstPriority !== undefined && secondPriority !== undefined) {
        return firstPriority - secondPriority;
      }
      if (firstPriority !== undefined) return -1;
      if (secondPriority !== undefined) return 1;
      return 0;
    });
  const csErectorsProjects = projectIndexData.slice(saintFrancisIndex + 1);
  const sanQuentin = csErectorsProjects.find((project) => project.slug === "san-quentin-rehabilitation-center");
  const stanfordAtrium = csErectorsProjects.find((project) => project.slug === "stanford-atrium");
  const companyGroups = [
    { name: "Walters & Wolf", logo: "walters-wolf", projects: waltersWolfProjects },
    {
      name: "C/S Erectors", logo: "cs-erectors",
      projects: [sanQuentin, stanfordAtrium, ...csErectorsProjects.filter((project) => project !== sanQuentin && project !== stanfordAtrium)],
    },
  ];

  const imageMarkup = ({ slug, name, images = 0, galleryImages = [] }) => {
    if (!slug) return "";

    const namedImages = galleryImages.map((image) => `
        <figure class="project-index-image">
          <img src="assets/project-index/${slug}/${image.file}" alt="${image.alt}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async" />
        </figure>`).join("");

    return namedImages + Array.from({ length: images }, (_, index) => {
      const number = String(index + 1).padStart(2, "0");
      return `
        <figure class="project-index-image">
          <img src="assets/project-index/${slug}/image-${number}.jpg" alt="${name} project view ${index + 1}" loading="lazy" decoding="async" />
        </figure>`;
    }).join("");
  };

  const createProjectItem = (project, index) => {
    const article = document.createElement("article");
    article.className = "project-index-item";
    article.dataset.projectOrder = String(index);

    const panelId = `project-panel-${index + 1}`;
    const buttonId = `project-trigger-${index + 1}`;
    const gallery = imageMarkup(project);
    const imageCount = (project.images || 0) + (project.galleryImages?.length || 0);
    const galleryLayout = imageCount > 3
      ? "gallery-many"
      : ["gallery-major-left", "gallery-row", "gallery-major-right"][index % 3];

    article.innerHTML = `
      <button class="project-index-trigger" id="${buttonId}" type="button" aria-expanded="false" aria-controls="${panelId}">
        <span class="project-index-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="project-index-title">${project.name}</span>
        <span class="project-index-address">${project.address}</span>
      </button>
      <div class="project-index-panel" id="${panelId}" role="region" aria-labelledby="${buttonId}" hidden>
        <div class="project-index-panel-inner ${gallery ? "has-images" : "no-images"}">
          ${gallery ? `<div class="project-index-gallery ${galleryLayout}">${gallery}</div>` : ""}
        </div>
      </div>`;

    return article;
  };

  let projectNumber = 0;
  companyGroups.forEach((company, companyIndex) => {
    const section = document.createElement("section");
    section.className = "project-company-group";
    const triggerId = `company-trigger-${companyIndex + 1}`;
    const panelId = `company-panel-${companyIndex + 1}`;

    section.innerHTML = `
      <button class="project-company-trigger" id="${triggerId}" type="button" aria-expanded="false" aria-controls="${panelId}">
        <span class="project-company-identity">
          <span class="project-company-title">${company.name}</span>
          <span class="project-company-meta">${company.projects.length} projects</span>
        </span>
        <span class="project-company-logo project-company-logo--${company.logo}" aria-hidden="true"></span>
      </button>
      <div class="project-company-panel" id="${panelId}" role="region" aria-labelledby="${triggerId}" hidden>
        <div class="project-company-projects"></div>
      </div>`;

    const companyProjectList = section.querySelector(".project-company-projects");
    company.projects.forEach((project) => {
      companyProjectList.appendChild(createProjectItem(project, projectNumber));
      projectNumber += 1;
    });
    projectIndexList.appendChild(section);
  });

  const closeItem = (item) => {
    if (!item) return;
    item.classList.remove("is-open");
    item.querySelector(".project-index-trigger")?.setAttribute("aria-expanded", "false");
    const panel = item.querySelector(".project-index-panel");
    if (panel) panel.hidden = true;
  };

  const closeCompany = (company) => {
    if (!company) return;
    company.classList.remove("is-open");
    company.querySelector(".project-company-trigger")?.setAttribute("aria-expanded", "false");
    const panel = company.querySelector(".project-company-panel");
    if (panel) panel.hidden = true;
    closeItem(company.querySelector(".project-index-item.is-open"));
  };

  const scrollItemToTop = (item) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 0;
          const top = item.getBoundingClientRect().top + window.scrollY - headerHeight;
          const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? "auto" : "smooth" });
        }, 0);
      });
    });
  };

  projectIndexList.addEventListener("click", (event) => {
    const companyTrigger = event.target.closest(".project-company-trigger");
    if (companyTrigger) {
      const selectedCompany = companyTrigger.closest(".project-company-group");
      const wasOpen = selectedCompany.classList.contains("is-open");
      closeCompany(projectIndexList.querySelector(".project-company-group.is-open"));

      if (wasOpen) return;

      selectedCompany.classList.add("is-open");
      companyTrigger.setAttribute("aria-expanded", "true");
      selectedCompany.querySelector(".project-company-panel").hidden = false;
      scrollItemToTop(selectedCompany);
      return;
    }

    const trigger = event.target.closest(".project-index-trigger");
    if (!trigger) return;

    const selectedItem = trigger.closest(".project-index-item");
    const wasOpen = selectedItem.classList.contains("is-open");
    closeItem(projectIndexList.querySelector(".project-index-item.is-open"));

    if (wasOpen) return;

    selectedItem.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    selectedItem.querySelector(".project-index-panel").hidden = false;
    scrollItemToTop(selectedItem);
  });
}
