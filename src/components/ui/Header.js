export default function Header() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-6xl font-black mb-4 text-white tracking-tight">
        <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-lg">InstaScope</span>
      </h1>
      <div className="max-w-3xl mx-auto">
        <p className="text-xl text-gray-300 font-medium leading-relaxed">
          Advanced Instagram intelligence with precision analytics and AI-driven content insights
        </p>
        <div className="mt-4 flex justify-center">
          <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 px-4 py-2 rounded-full border border-red-500/30">
            <span className="text-red-300 text-sm font-semibold">🔬 Precision • 🧠 Intelligence • 📊 Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
}