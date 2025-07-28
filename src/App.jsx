import "./App.css";
import "./footer.css";
import {
  FaGhost,
  FaBullhorn,
  FaUserSecret,
  FaShieldAlt,
  FaArrowRight,
  FaCamera,
  FaCity,
  FaVoteYea,
  FaLock,
} from "react-icons/fa";
import { BiSolidReport } from "react-icons/bi";
import { MdPrivacyTip, MdSecurity } from "react-icons/md";
import { useState, useEffect } from "react";
import { initGA, logPageView, logEvent } from "./utils/analytics";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [animateCount, setAnimateCount] = useState(false);

  useEffect(() => {
    // Initialize Google Analytics with the Measurement ID from environment variables
    initGA(import.meta.env.VITE_GA_MEASUREMENT_ID);
    
    // Send pageview with a custom path
    logPageView(window.location.pathname);
    
    setIsLoaded(true);

    // Animate the stats counter after a short delay
    const timer = setTimeout(() => {
      setAnimateCount(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleJoinNow = () => {
    // Track the "Join Now" button click
    logEvent("User", "Clicked Join Now", "Join Now Button");
    
    window.location.href = "https://forum.ceg.vote/invites/fccyrwUhVc";
  };

  const toggleMobileMenu = () => {
    // Track mobile menu toggle
    logEvent("UI", "Toggled Mobile Menu", showMobileMenu ? "Close Menu" : "Open Menu");
    
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div
      className={`app-container ${isLoaded ? "loaded" : ""} ${
        darkMode ? "dark-mode" : "light-mode"
      }`}
    >
      <div className="glow-background"></div>

      <header>
        <div className="logo">
          <FaGhost className="icon pulse" />
          <h2>GhostPic</h2>
        </div>

        <div className="header-controls">
          <button
            className="theme-toggle"
            onClick={() => {
              // Track theme toggle
              logEvent("UI", "Toggled Theme", darkMode ? "Light Mode" : "Dark Mode");
              setDarkMode(!darkMode);
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <div className={`hamburger ${showMobileMenu ? "active" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <nav className={`main-nav ${showMobileMenu ? "show" : ""}`}>
            <ul>
              <li>
                <a href="#about" onClick={() => {
                  logEvent("Navigation", "Clicked Nav Link", "About");
                }}>About</a>
              </li>
              <li>
                <a href="#features" onClick={() => {
                  logEvent("Navigation", "Clicked Nav Link", "Features");
                }}>Features</a>
              </li>
              <li>
                <a href="#impact" onClick={() => {
                  logEvent("Navigation", "Clicked Nav Link", "Impact");
                }}>Impact</a>
              </li>
              <li>
                <a href="#" onClick={handleJoinNow} className="nav-cta">
                  Join Now
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="hero-banner">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <main className="main-content">
        <section id="about" className="section">
          <h1>
            <span className="highlight">Anonymous</span> Civic Reporting
            <div className="underline"></div>
          </h1>

          <p className="tagline">
            Empowering citizens to drive change while protecting their identity
          </p>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number coming-soon">
                <span className={animateCount ? "animate-number" : ""}>
                  {animateCount ? "Coming Soon" : ""}
                </span>
              </div>
              <div className="stat-label">User Community</div>
            </div>

            <div className="stat-card">
              <div className="stat-number coming-soon">
                <span className={animateCount ? "animate-number" : ""}>
                  {animateCount ? "Join Now" : ""}
                </span>
              </div>
              <div className="stat-label">Be an Early Reporter</div>
            </div>

            <div className="stat-card">
              <div className="stat-number coming-soon">
                <span className={animateCount ? "animate-number" : ""}>
                  {animateCount ? "Launching Soon" : ""}
                </span>
              </div>
              <div className="stat-label">Impact Tracking</div>
            </div>
          </div>

          <div className="description">
            <p>
              GhostPic is a decentralized platform that enables citizens to
              report civic issues anonymously. Our mission is to create
              transparent communities where everyone can participate in
              improving public services without fear of reprisal.
            </p>
          </div>
        </section>

        <section id="features" className="section">
          <h2 className="section-title">How It Works</h2>

          <div className="features-grid">
            <div
              className={`feature-card ${
                activeFeature === "anonymous" ? "active" : ""
              }`}
              onMouseEnter={() => {
                setActiveFeature("anonymous");
                logEvent("Feature", "Hovered Feature", "Anonymous Reporting");
              }}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div className="feature-icon">
                <MdPrivacyTip />
              </div>
              <h3>Anonymous Reporting</h3>
              <p>
                Report issues without revealing your identity through our secure
                platform
              </p>
            </div>

            <div
              className={`feature-card ${
                activeFeature === "secure" ? "active" : ""
              }`}
              onMouseEnter={() => {
                setActiveFeature("secure");
                logEvent("Feature", "Hovered Feature", "Secure Verification");
              }}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div className="feature-icon">
                <MdSecurity />
              </div>
              <h3>Secure Verification</h3>
              <p>
                Zero-knowledge proof technology ensures authenticity without
                exposing personal data
              </p>
            </div>

            <div
              className={`feature-card ${
                activeFeature === "community" ? "active" : ""
              }`}
              onMouseEnter={() => {
                setActiveFeature("community");
                logEvent("Feature", "Hovered Feature", "Community Action");
              }}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div className="feature-icon">
                <FaBullhorn />
              </div>
              <h3>Community Action</h3>
              <p>
                Collective verification and amplification of issues for greater
                impact
              </p>
            </div>

            <div
              className={`feature-card ${
                activeFeature === "impact" ? "active" : ""
              }`}
              onMouseEnter={() => {
                setActiveFeature("impact");
                logEvent("Feature", "Hovered Feature", "Civic Impact");
              }}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div className="feature-icon">
                <FaCity />
              </div>
              <h3>Civic Impact</h3>
              <p>
                Drive meaningful change in your community with transparent
                accountability
              </p>
            </div>
          </div>
        </section>

        <section id="impact" className="section">
          <h2 className="section-title">Real Impact</h2>

          <div className="impact-showcase">
            <div className="impact-image-container">
              <div className="impact-image-placeholder"></div>
              <div className="image-caption">
                Community impact visualization coming soon
              </div>
            </div>

            <div className="testimonials-slider">
              <div className="testimonial">
                <div className="quote">
                  "We're building GhostPic to give citizens a voice without fear
                  of retaliation."
                </div>
                <div className="author">- GhostPic Team</div>
              </div>
            </div>
          </div>
        </section>

        <div className="cta-container">
          <button className="join-button" onClick={handleJoinNow}>
            <span>Join The Movement</span>
            <FaArrowRight className="icon" />
          </button>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <FaGhost className="icon" />
            <h3>GhostPic</h3>
          </div>
          <p className="copyright">
            © 2025 GhostPic. Anonymous civic engagement platform.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
