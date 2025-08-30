'use client'

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-8 shadow-2xl">
          <span className="text-4xl">✨</span>
        </div>

        {/* Heading */}
        <h2 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
          Ready to Invest?
        </h2>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
          Join Stotteyman Enterprises in building the future across multiple industries
        </p>
        
        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
          Schedule a personalized investment consultation to explore opportunities 
          in our innovative venture portfolio.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            type="button"
            className="group relative flex items-center px-10 py-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xl font-semibold rounded-full shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <span className="mr-3">📅</span>
            <span>Book Investment Call</span>
            <span className="ml-3 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}