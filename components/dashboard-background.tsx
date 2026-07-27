export default function DashboardBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050816]">
      {/* Purple glow */}
      <div className="absolute top-[-200px] left-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[150px] animate-float" />

      {/* Blue glow */}
      <div className="absolute bottom-[-150px] right-[5%] h-[450px] w-[450px] rounded-full bg-blue-500/15 blur-[140px] animate-float-delay" />

      {/* Green accent */}
      <div className="absolute top-[35%] left-[60%] h-[300px] w-[300px] rounded-full bg-lime-400/10 blur-[120px] animate-pulse-slow" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.1] bg-grid" />
    </div>
  )
}