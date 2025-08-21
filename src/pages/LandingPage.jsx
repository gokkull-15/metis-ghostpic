import { useState, useEffect } from "react";

const Header = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [currentTime, setCurrentTime] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Loading animation
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500);
  }, []);

  // Update time every second in IST 12-hour format
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeInIST = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );
      let hours = timeInIST.getHours();
      const minutes = timeInIST.getMinutes();
      const seconds = timeInIST.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const pad = (n) => n.toString().padStart(2, "0");
      const formatted = ` ${pad(hours)} : ${pad(minutes)} : ${pad(
        seconds
      )} ${ampm} `;
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev % 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExplore = () => {
    console.log("Navigate to register");
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Dynamic Background with Mouse Interaction */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${20 + mousePosition.x * 0.02}%`,
            top: `${10 + mousePosition.y * 0.01}%`,
            transform: "translate(-50%, -50%)",
          }}
        ></div>
        <div
          className="absolute w-64 h-64 bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-2xl animate-bounce"
          style={{
            right: `${15 + mousePosition.x * 0.015}%`,
            top: `${30 + mousePosition.y * 0.008}%`,
            transform: "translate(50%, -50%)",
          }}
        ></div>
        <div
          className="absolute w-80 h-80 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${30 + mousePosition.x * 0.01}%`,
            bottom: `${20 + mousePosition.y * 0.005}%`,
            transform: "translate(-50%, 50%)",
          }}
        ></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Header with Logo and Time */}

      {/* Main Content */}
      <div
        className={`flex flex-col items-center justify-center min-h-screen px-8 relative z-10 transition-all duration-1000 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Hero Title */}
        <div className="text-center mb-12">

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed font-light">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              Anonymous civic engagement
            </span>{" "}
            through zero-knowledge proofs on the{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
              Metis blockchain
            </span>
          </p>
        </div>

        {/* Description */}
        <div className="mb-10 max-w-4xl mx-auto">
          <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6">
            GhostPic is a{" "}
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-semibold">
              decentralized platform
            </span>{" "}
            that empowers individuals to anonymously voice real-world civic
            concerns while ensuring{" "}
            <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text font-semibold">
              data integrity and privacy
            </span>
            . With Alith AI, post content is enhanced and analyzed to assign
            urgency.
          </p>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center gap-8 mb-12">
          <button
            onClick={handleExplore}
            className="group relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative flex items-center gap-2">
              <svg
                className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1ZM10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
              </svg>
              Complete KYC
            </span>
          </button>

          <div className="relative group">
            <div className="relative bg-gradient-to-r from-gray-900/80 to-slate-900/80 backdrop-blur-lg border border-purple-300/20 rounded-xl px-8 py-3 shadow-xl group-hover:border-purple-300/40 transition-colors duration-300">
              <div className="flex items-center justify-center gap-3 mb-1">
                <svg
                  className="w-5 h-5 text-purple-400 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2ZM16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
                </svg>
                <div className="text-lg font-mono tracking-[0.15em] text-transparent bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text font-bold">
                  {currentTime}
                </div>
              </div>
              <div className="text-[10px] text-purple-400/80 text-center tracking-widest font-medium">
                INDIAN STANDARD TIME
              </div>
            </div>
          </div>
        </div>

        {/* Civic Issues as Cards */}
        <section className="max-w-5xl mx-auto text-left mb-16 px-4">
          <h3 className="text-2xl md:text-3xl font-semibold mb-8 text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-center">
            Common Civic Issues & Their Impacts
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-purple-600/30 p-6 hover:scale-105 transition-transform duration-300 shadow-lg">
              <h4 className="text-lg font-bold mb-2 text-purple-400">
                Poor Waste Management
              </h4>
              <p className="text-gray-300 mb-2">
                Overflowing garbage bins and lack of proper disposal pollute
                cities and contaminate water sources.
              </p>
              <p className="text-purple-300 italic">
                Impact: Increased disease risk, lower neighborhood value, and
                environmental harm.
              </p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-purple-600/30 p-6 hover:scale-105 transition-transform duration-300 shadow-lg">
              <h4 className="text-lg font-bold mb-2 text-purple-400">
                Public Transport Inadequacy
              </h4>
              <p className="text-gray-300 mb-2">
                Unreliable buses and trains cause congestion, long commutes,
                and limit access to opportunities.
              </p>
              <p className="text-purple-300 italic">
                Impact: More pollution, reduced productivity, and greater
                burden on low-income residents.
              </p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-purple-600/30 p-6 hover:scale-105 transition-transform duration-300 shadow-lg">
              <h4 className="text-lg font-bold mb-2 text-purple-400">
                Road Safety Hazards
              </h4>
              <p className="text-gray-300 mb-2">
                Unmarked crossings, potholes, and missing traffic signals
                endanger pedestrians and drivers.
              </p>
              <p className="text-purple-300 italic">
                Impact: Frequent accidents, hospitalizations, and eroded trust
                in civic planning.
              </p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-purple-600/30 p-6 hover:scale-105 transition-transform duration-300 shadow-lg">
              <h4 className="text-lg font-bold mb-2 text-purple-400">
                Limited Access to Clean Water
              </h4>
              <p className="text-gray-300 mb-2">
                Inconsistent plumbing and water supply infrastructure leave
                many without reliable drinking water.
              </p>
              <p className="text-purple-300 italic">
                Impact: Health risks, hygiene issues, and added costs for
                families.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Decorative Bottom */}
      <div className="flex justify-center items-center gap-12 opacity-50">
        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
        <svg
          className="w-4 h-4 text-purple-400 rotate-45 animate-spin-slow"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z" />
        </svg>
        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse delay-500"></div>
        <svg
          className="w-3 h-3 text-blue-400 animate-pulse delay-700"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12,2L13.09,8.26L22,9L14.74,13.74L17.18,22L12,17.27L6.82,22L9.26,13.74L2,9L10.91,8.26L12,2Z" />
        </svg>
        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse delay-1000"></div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Header;
