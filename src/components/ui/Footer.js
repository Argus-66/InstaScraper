export default function Footer() {
  return (
    <footer className="mt-16 pt-8 pb-6 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4">
          
          {/* Project Disclaimer */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">📚 Academic Project</h3>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              This project is developed for <span className="text-red-400 font-medium">educational and demonstration purposes only</span>. 
              InstaScope showcases advanced web scraping, AI analysis, and data visualization techniques using modern technologies.
            </p>
          </div>

          {/* Developer Info */}
          <div className="mb-6">
            <h4 className="text-base font-semibold text-white mb-3">👨‍💻 Developed by Ayush</h4>
            <div className="flex justify-center space-x-6">
              
              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/ayush-h-541948252/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 px-4 py-2 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-blue-400 font-medium group-hover:text-blue-300">LinkedIn</span>
              </a>

              {/* GitHub */}
              <a 
                href="https://github.com/Argus-66" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-600/20 hover:bg-gray-600/30 px-4 py-2 rounded-lg border border-gray-500/30 hover:border-gray-500/50 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-gray-400 font-medium group-hover:text-gray-300">GitHub</span>
              </a>

              {/* Twitter/X */}
              <a 
                href="https://x.com/Argus_Ayush" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gray-800/40 hover:bg-gray-700/40 px-4 py-2 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-gray-300 font-medium group-hover:text-white">Twitter</span>
              </a>

            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">Built with</p>
            <div className="flex justify-center space-x-4 text-xs">
              <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">Next.js</span>
              <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">AI Analysis</span>
              <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded border border-green-500/30">Web Scraping</span>
              <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded border border-yellow-500/30">TailwindCSS</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-4 border-t border-gray-700/30">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} InstaScope by Ayush. Educational project only.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}