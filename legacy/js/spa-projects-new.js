// COMPLETELY REWRITTEN SPA PROJECTS JAVASCRIPT

// Project data with enhanced information
const projectData = {
  fightvision: {
    title: "Computer Vision Strike Detection System for MMA",
    description: "A computer vision project using SAM2 and MMAction2 to detect and classify MMA strikes. It leverages foundational segmentation models and Temporal Segment Networks (TSN) to provide a functional proof-of-concept for automated combat sports analysis using a custom, high-precision dataset.",
    tech: ["Python", "Computer Vision", "Deep Learning", "SAM2", "Label Studio", "MMAction2", "Temporal Segment Networks", "3D CNN"],
    image: "Images/ProjectPhotos/STR1KE1.gif",
    features: [
      { title: "Meta SAM2 Integration for Automated Segmentation", detail: "Leverages Meta's Segment Anything Model 2 as a backend for Label Studio, enabling semi-automated mask generation for fighter segmentation with significantly reduced manual annotation time" },
      { title: "Semi-Automated Annotation Pipeline", detail: "Integrated workflow combining SAM2's promptable visual segmentation with Label Studio's browser-based interface, achieving 60% reduction in manual annotation time through automated mask generation and refinement" },
      { title: "Temporal Segment Network (TSN) Architecture", detail: "Implemented pre-trained TSN model via MMAction2 framework for spatio-temporal feature extraction, enabling real-time action recognition across temporal sequences of fight footage" },
      { title: "Multi-Class Event Detection", detail: "Successfully detects and classifies multiple event types including fighter segmentation, strike events, significant strikes, and missed strike attempts with frame-level precision" },
      { title: "Custom Training Data Generation", detail: "Generated 200+ high-quality annotated frames representing 40 distinct fight sequences, each comprising 5-frame temporal windows to capture strike dynamics and motion patterns" },
      { title: "Proof-of-Concept for Sports Analytics", detail: "Demonstrates feasibility of automated quantitative analysis in combat sports, providing foundation for advanced fight statistics, performance metrics, and tactical insights" }
    ],
    technical: "The system architecture combines Meta's SAM2 for mask-based object segmentation with Label Studio's annotation interface, creating a semi-automated labeling workflow for generating training data. The detection pipeline utilizes a Temporal Segment Network (TSN) pre-trained model accessed through the MMAction2 computer vision framework, which processes spatio-temporal features across sequential frames. Initially explored 3D CNN architectures for direct spatio-temporal inference, but pivoted to TSN due to computational constraints. The model processes 5-frame temporal windows representing discrete fight moments, with each frame annotated for fighter masks, strike events, and miss classifications. Training was conducted on 200 labeled frames across 40 sequences using transfer learning from pre-trained TSN weights.",
    challenges: "Primary bottleneck was dataset size limitations - only 200 frames across 40 sequences were manually annotated due to Label Studio Premium subscription access issues, which would have enabled automated learning of labeling patterns after 3-4 examples. Initial 3D CNN architecture was abandoned due to excessive RAM requirements that exceeded Google Colab runtime capacity, even with batching optimizations. Manual mask refinement remained time-consuming despite SAM2 automation. Model accuracy remains below production standards due to limited training data, though results were impressive given the constraint of only 40 data points for transfer learning.",
    links: [
      { text: "GitHub Repository", url: "https://github.com/Smokeybear10/STR1KE", type: "github" },
      { text: "Project Documentation", url: "#", type: "docs", error: "Not publicly available" }
    ],
    gallery: ["Images/ProjectPhotos/STR1KE1.gif", "Images/ProjectPhotos/STR1KE4.gif", "Images/ProjectPhotos/STR1KE2.png", "Images/ProjectPhotos/STR1KE3.png"]
  },
  dj: {
    title: "AI-Powered DJ System",
    description: "A browser-based DJ system powered by Grok AI, built with Next.js, React, and the Web Audio API. Features a dual-deck engine with full mixer controls (3-band EQ, filters, reverb, delay, crossfader), voice and text command processing via natural language, and AI-generated transition plans with crossfade automation, EQ bass swapping, and phrase-aware tempo matching. Includes real-time BPM detection, audio-reactive 3D visualization via Three.js, and cloud-backed track management with automatic metadata analysis.",
    tech: ["Next.js", "React", "Web Audio API", "Grok AI", "Three.js", "TypeScript", "NLP"],
    image: "Images/ProjectPhotos/D4NCE.gif",
    features: [
      { title: "Dual-Deck Engine with Full Mixer Controls", detail: "3-band EQ, filters, reverb, delay, and crossfader provide complete mixing capability directly in the browser via the Web Audio API" },
      { title: "AI-Powered Natural Language Commands", detail: "Voice and text command processing via Grok AI allows DJs to control mixing through natural language instructions" },
      { title: "AI-Generated Transition Plans", detail: "Automated crossfade, EQ bass swapping, and phrase-aware tempo matching powered by AI-generated transition planning" },
      { title: "Real-Time BPM Detection", detail: "Automatic beat detection and tempo analysis for precise beat-matching and sync across decks" },
      { title: "Audio-Reactive 3D Visualization", detail: "Three.js-powered visualizations that respond to audio in real time for an immersive experience" },
      { title: "Cloud-Backed Track Management", detail: "Cloud storage with automatic metadata analysis for organizing and managing track libraries" }
    ],
    technical: "Built on Next.js and React with the Web Audio API handling all audio processing including EQ, filters, effects, and crossfading. Grok AI processes natural language commands for mixing control and generates intelligent transition plans. Three.js renders real-time audio-reactive 3D visualizations. BPM detection runs client-side for low-latency beat analysis. Cloud infrastructure handles track storage and automatic metadata extraction.",
    links: [
      { text: "Live Website", url: "https://d4-nce.vercel.app", type: "live" },
      { text: "Source Code", url: "https://github.com/Smokeybear10/D4NCE", type: "github" }
    ],
    gallery: ["Images/ProjectPhotos/D4NCE.gif"]
  },
  fightiq: {
    title: "Predictive Analysis of Fight Outcomes in MMA",
    description: "A machine learning project that predicts MMA fight outcomes using historical UFC fight data. Differential calculations across 100+ fighter attributes (striking, grappling, physical metrics, career performance) are used to train and compare multiple classification models including Random Forest, Gradient Boosting, SVM, and K-Nearest Neighbors. The system accepts two fighter inputs, standardizes their career statistics, and outputs win probability predictions across each model.",
    tech: ["Python", "Machine Learning", "scikit-learn", "Random Forest", "Gradient Boosting", "SVM", "K-Nearest Neighbors", "pandas", "NumPy"],
    image: "Images/ProjectPhotos/STRATOS.png",
    features: [
      { title: "Historical UFC Data & Differential Features", detail: "Builds pairwise differentials from 100+ attributes spanning striking, grappling, physical metrics, and career performance so models learn from relative matchup signals rather than raw solo stats" },
      { title: "Multi-Model Classification", detail: "Trains and compares Random Forest, Gradient Boosting, Support Vector Machine, and K-Nearest Neighbors classifiers on the same engineered feature set" },
      { title: "Standardized Fighter Inputs", detail: "Accepts two fighters, applies consistent preprocessing and standardization to career statistics, and aligns them with the training pipeline" },
      { title: "Per-Model Win Probabilities", detail: "Outputs win probability predictions from each model so you can compare agreement and uncertainty across approaches for the same matchup" }
    ],
    technical: "Historical UFC fight data is transformed into differential features across 100+ striking, grappling, physical, and career attributes. Career statistics are standardized before training and at inference so two selected fighters map to the same feature space as historical bouts. Random Forest, Gradient Boosting, SVM, and K-Nearest Neighbors are fit on the differential dataset and evaluated side by side. The prediction path takes two fighter inputs, recomputes standardized differentials, and returns win probability estimates from each classifier.",
    links: [
      { text: "GitHub Repository", url: "https://github.com/Smokeybear10/UFC-Analytics-Engine", type: "github" },
      { text: "Model Documentation", url: "#", type: "docs", error: "Not publicly available" },
      { text: "Feature Analysis Report", url: "#", type: "docs", error: "Not publicly available" }
    ],
    gallery: ["Images/ProjectPhotos/STRATOS.png"]
  },
  harboros: {
    title: "HarborOS — Maritime Defense Platform",
    description: "Maritime awareness and operator decision-support platform for contested littoral defense. HarborOS turns raw AIS vessel traffic into actionable operator decisions through a four-stage pipeline: detect suspicious behavior across 11 research-backed anomaly detectors, assess risk with a Mamdani fuzzy inference engine, recommend MARSEC-aligned actions, and verify with Sentinel-2 satellite imagery pulled directly from Copernicus. Every alert is explainable; every risk score shows its work.",
    tech: ["Python", "FastAPI", "Next.js", "TypeScript", "MapLibre GL", "SQLAlchemy", "Fuzzy Inference", "Sentinel-2"],
    image: "Images/ProjectPhotos/HARBOROS.gif",
    features: [
      { title: "11 Research-Backed Anomaly Detectors", detail: "AIS Gap (IMO Res. A.1106), Loitering (F(c) course-change intensity), Geofence Breach (ray-casting), Kinematic Implausibility (GPS spoofing), Type Mismatch (identity deception), Speed Anomaly, Heading Anomaly, Zone Lingering, Statistical Outlier (z-score vs. regional fleet), Collision Risk (Mou et al. 2021 CPA/TCPA), and Dark Ship optical detection. All vessel-type-aware — thresholds adjust per cargo, tanker, fishing, passenger, military, and high-speed craft." },
      { title: "Mamdani Fuzzy Risk Scoring", detail: "Three-input fuzzy inference engine (anomaly severity, metadata deficiency, inspection risk) evaluates 16 fuzzy rules and defuzzifies with a blended centroid + weighted-mean-of-maxima approach to produce a continuous 0–100 risk score. Design principle: anomaly drives risk; metadata gaps amplify but don't create suspicion on their own." },
      { title: "One-Click Sentinel-2 Satellite Verification", detail: "Click any vessel on the map → Request Satellite Imagery → the console pulls the latest Copernicus Sentinel-2 scene for the vessel's bounding box and overlays it on the map. No tab-switch, no handoff — verification happens inline." },
      { title: "Nine-Sector Global Watch", detail: "Heatmap rendering across nine contested waterways, drilling down into individual vessel tracks as you zoom. Every sector preseeded with geofences, traffic lanes, and sector-specific risk thresholds." },
      { title: "MARSEC-Aligned Action Tiers", detail: "Score 80–100 → ESCALATE (MARSEC 3, immediate interdiction). 60–79 → VERIFY (MARSEC 2, request satellite). 35–59 → MONITOR (MARSEC 1, log activity). 0–34 → NORMAL. Operator always knows what to do next." },
      { title: "Signal Aggregation with Diversity Bonus", detail: "Signals weighted by defense priority (Critical 1.00, High 0.85–0.95, Medium 0.70–0.80, Lower 0.40–0.60). Multiple distinct signal types trigger an 8%–18% diversity bonus — converging evidence from different detectors is far more suspicious than repeated signals of one kind." }
    ],
    technical: "FastAPI backend with SQLAlchemy + SQLite persists vessel domain models, anomaly signals, and fuzzy risk scores. The ingestion service streams live AIS data, passes position reports through the 11 detectors, then feeds aggregated signals into the fuzzy inference engine. Frontend is Next.js + TypeScript + Tailwind with MapLibre GL rendering the map, heatmap, and per-sector drill-downs. Data adapters integrate AISStream, Copernicus Sentinel-2, NWS weather, and USCG port state control records. The Sentinel-2 satellite verification path pulls the latest scene for a vessel's bounding box on demand.",
    links: [
      { text: "Source Code", url: "https://github.com/Smokeybear10/H4BOR", type: "github" },
      { text: "Algorithm Reference", url: "#", type: "docs", error: "See docs/ALGORITHM.md in repo" }
    ],
    gallery: [
      "Images/ProjectPhotos/HARBOROS.gif"
    ]
  },
  poker: {
    title: "Bayesian Poker Analysis Engine with Monte Carlo CFR",
    description: "A Rust library for solving No-Limit Texas Hold'em, built toward functional parity with Pluribus. Combines hierarchical k-means clustering over isomorphic hand abstractions, Earth Mover's Distance metrics via optimal transport, and Monte Carlo Counterfactual Regret Minimization (MCCFR) to converge on near-optimal poker strategies. Features nanosecond hand evaluation, exhaustive equity calculation, and efficient serialization of abstraction and blueprint data for persistent training pipelines.",
    tech: ["Rust", "MCCFR", "k-means Clustering", "Optimal Transport", "Hand Abstraction", "NLHE", "Serialization"],
    image: "Images/ProjectPhotos/R1VER1.gif",
    features: [
      { title: "Pluribus-Style NLHE Solver", detail: "Rust library targeting functional parity with Pluribus-style solving: abstractions, distances, and MCCFR training wired for near-optimal strategies in No-Limit Hold'em" },
      { title: "Hierarchical k-means on Isomorphic Abstractions", detail: "Clusters isomorphic hand abstractions hierarchically to compress the state space while preserving strategically meaningful structure" },
      { title: "Earth Mover's Distance & Optimal Transport", detail: "Uses EMD-style metrics via optimal transport to compare abstraction distributions and inform clustering and training" },
      { title: "MCCFR Training", detail: "Monte Carlo Counterfactual Regret Minimization drives iterative regret updates and strategy convergence toward strong blueprint policies" },
      { title: "Fast Evaluation & Equity", detail: "Nanosecond hand evaluation and exhaustive equity calculation keep the core loop practical for large-scale solving" },
      { title: "Persistent Training Pipelines", detail: "Efficient serialization of abstraction and blueprint data supports checkpointing and long-running, resumable training jobs" }
    ],
    technical: "The codebase is organized as a Rust library for NLHE: hand evaluation and equity sit in a fast path for nanosecond-level work; isomorphic abstractions feed hierarchical k-means; Earth Mover's Distance is computed through optimal transport between abstraction masses. MCCFR (external sampling and regret accumulation) trains blueprint strategies toward near-optimal play. Abstractions, distance structures, and learned strategies serialize cleanly so training can persist and resume without rebuilding state from scratch.",
    links: [
      { text: "GitHub Repository", url: "https://github.com/Smokeybear10/MontePokerG", type: "github" },
      { text: "Strategy Analyzer", url: "#", type: "demo", error: "Website is currently down" },
      { text: "Technical Documentation", url: "#", type: "docs", error: "Website is currently down" }
    ],
    gallery: ["Images/ProjectPhotos/R1VER1.gif", "Images/ProjectPhotos/R1VER2.gif"]
  },
  smartcv: {
    title: "AI-Powered Resume Optimizer",
    description: "An AI-powered resume optimization tool built with Python and Streamlit, leveraging Google Gemini for intelligent content analysis. Features ATS compatibility scoring, skills gap identification, keyword density analysis, and AI-driven content suggestions across 50+ target job roles. Includes a professional resume builder with four exportable templates (PDF/DOCX), multi-portal job search with LinkedIn integration, and a comprehensive analytics dashboard for tracking resume performance metrics.",
    tech: ["Python", "Streamlit", "Google Gemini", "ATS Optimization", "Selenium", "SQLite", "PDF/DOCX"],
    image: "Images/ProjectPhotos/PR0XIM.png",
    features: [
      { title: "Gemini-Powered Analysis", detail: "Google Gemini drives content analysis with ATS compatibility scoring, skills gap identification, keyword density insights, and AI suggestions tailored to 50+ target job roles" },
      { title: "Resume Builder & Exports", detail: "Four professional templates with export to PDF and DOCX for polished, shareable documents" },
      { title: "Multi-Portal Job Search", detail: "Aggregates opportunities across portals with LinkedIn integration for a unified search workflow" },
      { title: "Analytics Dashboard", detail: "Tracks resume performance metrics over time so users can see trends and iterate on their materials" }
    ],
    technical: "Streamlit provides the app shell in Python; the analysis layer calls Google Gemini for NLP-style review, ATS-oriented scoring, skills-gap and keyword-density signals, and role-aware suggestions across 50+ job profiles. The builder renders four templates and exports via PDF/DOCX libraries. Job discovery combines multi-portal logic with Selenium-backed LinkedIn workflows where needed. SQLite backs user data, resume versions, and analytics series for the dashboard.",
    links: [
      { text: "GitHub Repository", url: "https://github.com/Smokeybear10/SmartCV", type: "github" },
      { text: "Live Demo", url: "#", type: "demo", error: "Website is currently down" },
      { text: "Documentation", url: "#", type: "docs", error: "Website is currently down" }
    ],
    gallery: ["Images/ProjectPhotos/PR0XIM.png"]
  }
};

// Global variables
let currentRotation = 0;
let isDragging = false;
let startX = 0;
let velocity = 0.3;
let isModalOpen = false;
let isHovering = false; // Track if hovering over a card
let autoRotationSpeed = 0.3;
/** Fraction of auto speed while hovering a card */
const HOVER_ROTATION_FACTOR = 0.35;
let sectionCycleInterval = null;
let currentSectionIndex = 0;
let projectsInitTimeout = null;
let modalHideTimeout = null;
let wheelAnimationFrameId = null;
let wheelCleanupFns = [];
let modalCleanupFns = [];
/** Set in setupWheelRotation — used to snap the wheel before opening a project */
let projectsWheelEl = null;
let snapRafId = null;
let isSnappingToCard = false;

function stopSnapAnimation() {
  if (snapRafId !== null) {
    cancelAnimationFrame(snapRafId);
    snapRafId = null;
  }
  isSnappingToCard = false;
}

function getProjectCardAngleStep() {
  const n = projectsWheelEl
    ? projectsWheelEl.querySelectorAll('.project-card').length
    : 6;
  return 360 / Math.max(1, n);
}

function getNearestSnapRotationForCard(cardIndex) {
  const step = getProjectCardAngleStep();
  const ideal = -cardIndex * step;
  const cur = currentRotation;
  let bestAngle = ideal;
  let minAbs = Infinity;
  for (let k = -5; k <= 5; k += 1) {
    const cand = ideal + 360 * k;
    const dist = Math.abs(cand - cur);
    if (dist < minAbs) {
      minAbs = dist;
      bestAngle = cand;
    }
  }
  return { targetRotation: bestAngle, distanceDeg: minAbs };
}

/**
 * Rotates the wheel so the given card faces forward, then runs onComplete.
 * Matches init convention: card i is centered at rotateY(-i * step).
 */
function snapWheelToCardIndex(cardIndex, onComplete) {
  if (!projectsWheelEl) {
    onComplete();
    return;
  }
  stopSnapAnimation();
  const { targetRotation, distanceDeg } = getNearestSnapRotationForCard(cardIndex);
  const SNAP_THRESHOLD_DEG = 2.5;
  if (distanceDeg < SNAP_THRESHOLD_DEG) {
    currentRotation = targetRotation;
    projectsWheelEl.style.transform = `rotateX(-10deg) rotateY(${currentRotation}deg)`;
    requestAnimationFrame(() => {
      onComplete();
    });
    return;
  }

  const durationMs = Math.min(950, Math.max(320, distanceDeg * 2.8));
  const start = currentRotation;
  const delta = targetRotation - start;
  const startTime = performance.now();
  isSnappingToCard = true;
  velocity = 0;

  function tick(now) {
    const t = Math.min(1, (now - startTime) / durationMs);
    const eased = 1 - (1 - t) ** 3;
    currentRotation = start + delta * eased;
    projectsWheelEl.style.transform = `rotateX(-10deg) rotateY(${currentRotation}deg)`;
    if (t < 1) {
      snapRafId = requestAnimationFrame(tick);
    } else {
      currentRotation = targetRotation;
      projectsWheelEl.style.transform = `rotateX(-10deg) rotateY(${currentRotation}deg)`;
      snapRafId = null;
      isSnappingToCard = false;
      onComplete();
    }
  }
  snapRafId = requestAnimationFrame(tick);
}

function runCleanup(cleanupFns) {
  cleanupFns.forEach((cleanupFn) => cleanupFn());
  cleanupFns.length = 0;
}

// Initialize projects functionality
function initProjects() {
  cleanupProjects();
  
  // Force show projects content
  const projectsContent = document.getElementById('projects-content');
  if (projectsContent) {
    projectsContent.style.display = 'block';
    projectsContent.style.opacity = '1';
    projectsContent.style.visibility = 'visible';
    projectsContent.style.pointerEvents = 'auto';
    projectsContent.style.zIndex = '1000';
  } else {
    return;
  }
  
  // Wait a bit then setup functionality
  projectsInitTimeout = setTimeout(() => {
    setupWheelRotation();
    setupProjectModals();
  }, 100);
}

// Setup wheel rotation
function setupWheelRotation() {
  const wheelContainer = document.querySelector('.wheel-container');
  if (!wheelContainer) {
    projectsWheelEl = null;
    return;
  }
  projectsWheelEl = wheelContainer;
  
  // Wrap card content, create curved slices and 3D face elements
  const cards = wheelContainer.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.querySelectorAll('.card-face').forEach(f => f.remove());

    if (!card.querySelector('.card-content')) {
      const content = document.createElement('div');
      content.className = 'card-content';
      while (card.firstChild) {
        content.appendChild(card.firstChild);
      }
      card.appendChild(content);
    }

    const imageEl = card.querySelector('.project-image');
    const bgImage = imageEl ? imageEl.style.backgroundImage : '';
    const bgColor = imageEl ? (imageEl.style.backgroundColor || '') : '';

    ['right', 'left', 'top', 'bottom', 'back'].forEach(side => {
      const face = document.createElement('div');
      face.className = `card-face card-face-${side}`;
      if (bgImage) face.style.backgroundImage = bgImage;
      else if (bgColor) face.style.backgroundColor = bgColor;
      card.appendChild(face);
    });
  });

  // Pick a random card as the front-facing center card (instant, no transition)
  const cardCount = cards.length;
  const startIndex = Math.floor(Math.random() * cardCount);
  currentRotation = -(startIndex * 60);
  wheelContainer.style.transition = 'none';
  wheelContainer.style.transform = `rotateX(-10deg) rotateY(${currentRotation}deg)`;
  wheelContainer.offsetHeight; // force reflow so the position applies instantly
  wheelContainer.style.transition = '';

  // Staggered fade-in: start from center card, then go right (increasing index)
  let introComplete = false;
  const staggerDelayMs = 115;
  const cardFadeMs = 350; // keep in sync with cardFadeIn in projects-new.css
  for (let step = 0; step < cardCount; step++) {
    const cardIdx = (startIndex + step) % cardCount;
    setTimeout(() => {
      cards[cardIdx].classList.add('revealed');
      if (step === cardCount - 1) {
        setTimeout(() => {
          introComplete = true;
        }, cardFadeMs + 40);
      }
    }, step * staggerDelayMs);
  }

  // Auto rotation with hover slowdown
  function autoRotate() {
    let targetSpeed = autoRotationSpeed;
    if (isModalOpen) {
      targetSpeed = 0; // Stop completely when modal is open
    } else if (isHovering) {
      targetSpeed = autoRotationSpeed * HOVER_ROTATION_FACTOR;
    }

    if (!isDragging && !isSnappingToCard) {
      if (!introComplete) {
        targetSpeed = 0;
        velocity = 0;
      }
      // Smoothly transition velocity towards target speed
      if (Math.abs(velocity - targetSpeed) > 0.01) {
        velocity += (targetSpeed - velocity) * 0.1; // Smooth transition
      } else {
        velocity = targetSpeed;
      }
      currentRotation += velocity;
    }

    if (!isSnappingToCard) {
      wheelContainer.style.transform = `rotateX(-10deg) rotateY(${currentRotation}deg)`;
    }
    wheelAnimationFrameId = requestAnimationFrame(autoRotate);
  }
  autoRotate();
  
  // Mouse drag events
  wheelContainer.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  
  // Touch drag events
  wheelContainer.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', endDrag);
  wheelCleanupFns.push(
    () => wheelContainer.removeEventListener('mousedown', startDrag),
    () => document.removeEventListener('mousemove', drag),
    () => document.removeEventListener('mouseup', endDrag),
    () => wheelContainer.removeEventListener('touchstart', startDrag),
    () => document.removeEventListener('touchmove', drag),
    () => document.removeEventListener('touchend', endDrag)
  );
  
  let dragStarted = false;
  const DRAG_THRESHOLD = 5;

  function startDrag(e) {
    dragStarted = true;
    isDragging = false;
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    velocity = 0;
    if (e.type === 'mousedown') e.preventDefault();
  }

  function drag(e) {
    if (!dragStarted) return;

    const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const deltaX = currentX - startX;

    if (!isDragging && Math.abs(deltaX) > DRAG_THRESHOLD) {
      isDragging = true;
    }

    if (isDragging) {
      currentRotation += deltaX * 0.5;
      wheelContainer.style.transform = `rotateX(-10deg) rotateY(${currentRotation}deg)`;
      startX = currentX;
      e.preventDefault();
    }
  }

  function endDrag() {
    if (!dragStarted) return;
    dragStarted = false;
    isDragging = false;
    velocity = autoRotationSpeed; // Resume auto rotation
  }
}

// Setup project modals
function setupProjectModals() {
  const projectCards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('projectModal');
  const backBtn = document.getElementById('backToProjects');
  
  if (!modal) {
    return;
  }
  runCleanup(modalCleanupFns);
  
  // Add click handlers to project cards
  projectCards.forEach((card, index) => {
    const projectId = card.dataset.project;
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isDragging || isSnappingToCard) {
        return;
      }

      const project = projectData[projectId];
      if (!project) {
        return;
      }

      const openModal = () => {
        populateModalContent(project);
        isModalOpen = true;

        // Set transform-origin to the card's screen position
        const cardRect = card.getBoundingClientRect();
        const originX = cardRect.left + cardRect.width / 2;
        const originY = cardRect.top + cardRect.height / 2;
        modal.style.transformOrigin = `${originX}px ${originY}px`;

        modal.style.display = 'block';
        hideAllNavigation();
        setTimeout(() => {
          modal.classList.add('show');
        }, 10);
      };

      snapWheelToCardIndex(index, openModal);
    };
    
    // Add hover listeners to control wheel speed
    const handleMouseEnter = () => {
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };
    
    card.addEventListener('click', handleClick);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    modalCleanupFns.push(
      () => card.removeEventListener('click', handleClick),
      () => card.removeEventListener('mouseenter', handleMouseEnter),
      () => card.removeEventListener('mouseleave', handleMouseLeave)
    );
    
    // Force pointer events
    card.style.pointerEvents = 'auto';
    card.style.cursor = 'pointer';
  });
  
  // Close modal handlers
  if (backBtn) {
    backBtn.addEventListener('click', closeModal);
    modalCleanupFns.push(() => backBtn.removeEventListener('click', closeModal));
  }
  
  const handleModalClick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };
  
  const handleEscape = (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }
  };
  
  modal.addEventListener('click', handleModalClick);
  document.addEventListener('keydown', handleEscape);
  modalCleanupFns.push(
    () => modal.removeEventListener('click', handleModalClick),
    () => document.removeEventListener('keydown', handleEscape)
  );
  
  function closeModal() {
    if (sectionCycleInterval) {
      clearInterval(sectionCycleInterval);
      sectionCycleInterval = null;
    }
    isModalOpen = false;
    modal.classList.remove('show');
    
    // Show all navigation elements again
    showAllNavigation();
    
    if (modalHideTimeout) {
      clearTimeout(modalHideTimeout);
    }
    modalHideTimeout = setTimeout(() => {
      modal.style.display = 'none';
    }, 500);
  }
}

// Populate modal with project content
function populateModalContent(project) {
  const heroImage = document.getElementById('projectHeroImage');
  const heroContainer = document.getElementById('projectHeroImageContainer');
  const galleryPrev = document.getElementById('galleryPrev');
  const galleryNext = document.getElementById('galleryNext');
  const galleryDotsEl = document.getElementById('galleryDots');
  const title = document.getElementById('projectTitle');
  const techStack = document.getElementById('projectTechStack');
  const description = document.getElementById('projectDescription');
  const links = document.getElementById('projectLinks');
  const featuresGrid = document.getElementById('projectFeatures');

  // Gallery setup
  const gallery = project.gallery && project.gallery.length ? project.gallery : [project.image];
  let galleryIndex = 0;

  if (heroImage) {
    heroImage.src = gallery[0];
    heroImage.alt = project.title;
  }

  if (heroContainer) {
    heroContainer.classList.toggle('single-image', gallery.length <= 1);
  }

  if (galleryDotsEl) {
    galleryDotsEl.innerHTML = gallery.map((_, i) =>
      `<div class="gallery-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></div>`
    ).join('');
  }

  function setGalleryImage(idx) {
    galleryIndex = ((idx % gallery.length) + gallery.length) % gallery.length;
    if (heroImage) heroImage.src = gallery[galleryIndex];
    if (galleryDotsEl) {
      galleryDotsEl.querySelectorAll('.gallery-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === galleryIndex);
      });
    }
  }

  if (galleryPrev) galleryPrev.onclick = () => setGalleryImage(galleryIndex - 1);
  if (galleryNext) galleryNext.onclick = () => setGalleryImage(galleryIndex + 1);
  if (galleryDotsEl) {
    galleryDotsEl.querySelectorAll('.gallery-dot').forEach(dot => {
      dot.onclick = () => setGalleryImage(Number(dot.dataset.idx));
    });
  }

  if (title) {
    title.textContent = project.title;
  }

  if (techStack && project.tech) {
    techStack.innerHTML = project.tech.map(tech =>
      `<span class="tech-badge">${tech}</span>`
    ).join('');
  }

  if (description) {
    description.textContent = project.description;
  }

  if (links) {
    if (project.links) {
      links.innerHTML = project.links.map(link => {
        const icon = getLinkIcon(link.type);
        if (link.error) {
          return `<span class="project-link disabled" title="${link.error}">${icon} ${link.text}</span>`;
        } else {
          return `<a href="${link.url}" class="project-link" target="_blank">${icon} ${link.text}</a>`;
        }
      }).join('');
    } else {
      links.innerHTML = '';
    }
  }

  if (featuresGrid) {
    featuresGrid.innerHTML = '';
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('imageLightbox');

  if (lightbox) {
    // Add closing animation
    lightbox.classList.add('closing');

    // Wait for animation to complete before hiding
    setTimeout(() => {
      lightbox.classList.remove('active');
      lightbox.classList.remove('closing');
      document.body.style.overflow = '';
    }, 300); // Match animation duration
  }
}

// Initialize lightbox close handlers
document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('imageLightbox');

  if (lightbox) {
    lightbox.addEventListener('click', function(e) {
      if (e.target === this) {
        closeLightbox();
      }
    });
  }

  // Close lightbox with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
});

// Get appropriate icon for link type
function getLinkIcon(type) {
  const icons = {
    github: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    docs: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>',
    demo: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>',
    live: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" /></svg>',
    video: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" /></svg>',
    app: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.1 5.9,23 7,23H17C18.1,23 19,22.1 19,21V3C19,1.89 18.1,1 17,1Z" /></svg>',
    design: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z" /></svg>',
    data: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z" /></svg>'
  };
  return icons[type] || icons.docs;
}

// Cleanup function
function cleanupProjects() {
  
  if (projectsInitTimeout) {
    clearTimeout(projectsInitTimeout);
    projectsInitTimeout = null;
  }
  if (modalHideTimeout) {
    clearTimeout(modalHideTimeout);
    modalHideTimeout = null;
  }
  if (sectionCycleInterval) {
    clearInterval(sectionCycleInterval);
    sectionCycleInterval = null;
  }
  if (wheelAnimationFrameId) {
    cancelAnimationFrame(wheelAnimationFrameId);
    wheelAnimationFrameId = null;
  }
  stopSnapAnimation();
  projectsWheelEl = null;
  runCleanup(wheelCleanupFns);
  runCleanup(modalCleanupFns);
  const nextBtn = document.getElementById('sectionNext');
  const prevBtn = document.getElementById('sectionPrev');
  if (nextBtn) {
    nextBtn.onclick = null;
  }
  if (prevBtn) {
    prevBtn.onclick = null;
  }
  document.querySelectorAll('.section-dot').forEach((dot) => {
    dot.onclick = null;
  });
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
  }
  document.querySelectorAll('.project-card').forEach(card => {
    card.classList.remove('revealed');
  });
  showAllNavigation();
  isModalOpen = false;
  isHovering = false;
  isDragging = false;
  velocity = autoRotationSpeed;
}

// Global navigation control functions
function hideAllNavigation() {
  
  const navigationSelectors = [
    '.bottom-nav',
    '.mobile-menu-btn', 
    '.nav-buttons',
    '.hello-nav-btn',
    '.nav-btn',
    '.nav-link',
    '.spa-nav-btn',
    '.nav-close-btn'
  ];
  
  navigationSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      element.style.opacity = '0';
    });
  });
}

function showAllNavigation() {
  
  const navigationElements = [
    { selector: '.bottom-nav', display: 'flex' },
    { selector: '.mobile-menu-btn', display: 'flex' },
    { selector: '.nav-buttons', display: 'grid' },
    { selector: '.hello-nav-btn', display: 'inline-block' },
    { selector: '.nav-btn', display: 'block' },
    { selector: '.nav-link', display: 'block' },
    { selector: '.spa-nav-btn', display: 'block' },
    { selector: '.nav-close-btn', display: 'block' }
  ];
  
  navigationElements.forEach(nav => {
    const elements = document.querySelectorAll(nav.selector);
    elements.forEach(element => {
      element.style.display = nav.display;
      element.style.visibility = 'visible';
      element.style.opacity = '1';
    });
  });
}

// Export for SPA system
window.projectsRouteNew = {
  init: initProjects,
  cleanup: cleanupProjects
};

// Export navigation functions globally
window.hideAllNavigation = hideAllNavigation;
window.showAllNavigation = showAllNavigation;