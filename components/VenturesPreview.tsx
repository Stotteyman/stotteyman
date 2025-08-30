'use client'

import Link from 'next/link'

const ventures = [
  {
    id: 'orange-duck',
    name: 'Orange Duck Studios',
    description: 'Creative studio for media & production',
    icon: '🎨',
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    tags: ['Media', 'Production', 'Creative'],
    status: 'Active',
    founded: '2022'
  },
  {
    id: 'hella-fkn-gas',
    name: 'Hella Fkn Gas',
    description: 'Legal hemp products and lifestyle brand',
    icon: '🌿',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    tags: ['Hemp', 'Lifestyle', 'Wellness'],
    status: 'Scaling',
    founded: '2021'
  },
  {
    id: 'wage-society',
    name: 'Wage Society',
    description: 'Community and lifestyle platform',
    icon: '👥',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    tags: ['Community', 'Social', 'Platform'],
    status: 'Growing',
    founded: '2023'
  },
  {
    id: 'everyday-stoner-tech',
    name: 'Everyday Stoner Tech',
    description: 'Cannabis tech-inspired gear',
    icon: '📱',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    tags: ['Tech', 'Cannabis', 'Innovation'],
    status: 'Expanding',
    founded: '2022'
  },
  {
    id: 'irl-history',
    name: 'IRL History',
    description: 'Archive and ranking hub for IRL livestream culture',
    icon: '📹',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    tags: ['Livestream', 'Archive', 'Culture'],
    status: 'Innovating',
    founded: '2023'
  },
]

export function VenturesPreview() {
  return (
    <section id="ventures" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Ventures
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Building the future across multiple industries with innovative companies and disruptive technologies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ventures.map((venture) => (
            <div
              key={venture.id}
              className={`${venture.bgColor} ${venture.borderColor} border rounded-2xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer`}
            >
              <div className="flex items-center mb-4">
                <div className={`text-3xl mr-3`}>
                  {venture.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{venture.name}</h3>
                  <p className="text-sm text-gray-400">{venture.founded}</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{venture.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {venture.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 text-white text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  venture.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                  venture.status === 'Scaling' ? 'bg-blue-500/20 text-blue-400' :
                  venture.status === 'Growing' ? 'bg-purple-500/20 text-purple-400' :
                  venture.status === 'Expanding' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-pink-500/20 text-pink-400'
                }`}>
                  {venture.status}
                </span>
                
                <Link
                  href={`/ventures/${venture.id}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Learn More →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/ventures"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full hover:scale-105 transition-transform duration-300"
          >
            View All Ventures
          </Link>
        </div>
      </div>
    </section>
  )
}
