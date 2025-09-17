#!/usr/bin/env node

/**
 * Initialize blog posts in the database
 * Run with: node scripts/init-blog.js
 */

import { neon } from '@neondatabase/serverless';

// Blog posts data
const blogPosts = [
  {
    slug: 'the-art-of-digital-minimalism',
    title: 'The Art of Digital Minimalism',
    excerpt: 'Exploring how simplicity in design can create more powerful and meaningful user experiences.',
    content: `
      <p>In a world saturated with visual noise and digital distractions, the art of digital minimalism emerges as a powerful philosophy that can transform not just our designs, but our entire approach to creating meaningful experiences.</p>

      <h2>The Power of Less</h2>
      <p>Digital minimalism isn't about removing everything until nothing remains. It's about removing everything until only the essential remains. This distinction is crucial—we're not subtracting for subtraction's sake, but for the sake of clarity, focus, and purpose.</p>

      <p>When we strip away the unnecessary, we create space for what truly matters. Users can focus on the content, the functionality, the experience itself, rather than being overwhelmed by competing visual elements.</p>

      <h2>Principles of Minimal Design</h2>
      <p>Several key principles guide effective digital minimalism:</p>

      <ul>
        <li><strong>Purposeful Reduction:</strong> Every element serves a specific function</li>
        <li><strong>Visual Hierarchy:</strong> Clear structure guides user attention</li>
        <li><strong>Whitespace as Design:</strong> Empty space is a powerful design tool</li>
        <li><strong>Typography as Voice:</strong> Font choices communicate personality</li>
        <li><strong>Color with Intent:</strong> Limited palettes create stronger impact</li>
      </ul>

      <h2>The User Experience Impact</h2>
      <p>Minimal design directly translates to better user experience. When users aren't distracted by unnecessary elements, they can:</p>

      <ul>
        <li>Complete tasks more efficiently</li>
        <li>Focus on content that matters</li>
        <li>Navigate with confidence</li>
        <li>Feel less overwhelmed</li>
        <li>Enjoy a sense of calm and clarity</li>
      </ul>

      <h2>Implementing Minimalism</h2>
      <p>Start by auditing your current design. Ask yourself:</p>

      <ul>
        <li>Does this element serve a specific purpose?</li>
        <li>Can this functionality be achieved more simply?</li>
        <li>What would happen if we removed this element entirely?</li>
        <li>How does this contribute to the user's goals?</li>
      </ul>

      <p>Remember, minimalism is not about creating empty spaces—it's about creating meaningful spaces. Every pixel, every interaction, every choice should be intentional and purposeful.</p>

      <h2>Conclusion</h2>
      <p>Digital minimalism is more than a design trend; it's a philosophy that can lead to more effective, more beautiful, and more meaningful digital experiences. By embracing the art of less, we create room for what truly matters.</p>

      <p>Life is what you make it—and in the digital realm, that means making every element count.</p>
    `,
    date: new Date().toISOString().split('T')[0],
    read_time: '5 min read',
    category: 'Design',
    tags: ['design', 'minimalism', 'ux', 'user-experience'],
    author: 'Gary Lee McCullouch Jr',
    featured: true,
    published: true
  },
  {
    slug: 'building-for-the-future',
    title: 'Building for the Future',
    excerpt: 'Thoughts on creating sustainable and forward-thinking digital products that stand the test of time.',
    content: `
      <p>In the rapidly evolving landscape of technology, building products that can adapt and thrive over time is both a challenge and an opportunity. How do we create digital experiences that remain relevant, functional, and beautiful as the world around them changes?</p>

      <h2>The Challenge of Technological Evolution</h2>
      <p>Technology moves fast. What's cutting-edge today becomes obsolete tomorrow. But great design and thoughtful architecture can transcend the limitations of any specific technology or framework.</p>

      <p>The key is to focus on principles that remain constant even as tools and platforms evolve. These include user needs, accessibility, performance, and maintainability.</p>

      <h2>Future-Proof Design Principles</h2>
      <p>Several principles guide the creation of sustainable digital products:</p>

      <ul>
        <li><strong>Modular Architecture:</strong> Build systems that can be updated piece by piece</li>
        <li><strong>Accessibility First:</strong> Design for all users, regardless of ability or device</li>
        <li><strong>Performance by Design:</strong> Optimize for speed and efficiency from the start</li>
        <li><strong>Scalable Systems:</strong> Plan for growth and change</li>
        <li><strong>Clean Code:</strong> Write code that future developers can understand and maintain</li>
      </ul>

      <h2>The Role of Standards</h2>
      <p>Following established web standards and best practices is crucial for longevity. Standards evolve slowly and thoughtfully, providing a stable foundation for innovation.</p>

      <p>When we build on solid foundations—semantic HTML, progressive enhancement, responsive design—we create products that can adapt to new devices, browsers, and user needs without complete rewrites.</p>

      <h2>Sustainable Development Practices</h2>
      <p>Beyond technical considerations, sustainable development requires:</p>

      <ul>
        <li><strong>Documentation:</strong> Clear documentation helps future maintainers</li>
        <li><strong>Testing:</strong> Comprehensive tests catch regressions and enable confident changes</li>
        <li><strong>Monitoring:</strong> Understanding how systems perform in production</li>
        <li><strong>Iteration:</strong> Regular updates and improvements based on real usage</li>
      </ul>

      <h2>Environmental Considerations</h2>
      <p>Building for the future also means considering environmental impact. Efficient code, optimized assets, and sustainable hosting practices contribute to a more sustainable web.</p>

      <p>Every kilobyte saved, every request optimized, every resource efficiently used makes a difference when multiplied across millions of users.</p>

      <h2>Conclusion</h2>
      <p>Building for the future isn't about predicting every possible change—it's about creating flexible, adaptable systems that can evolve with the world around them.</p>

      <p>By focusing on timeless principles and sustainable practices, we can create digital products that not only survive but thrive in an ever-changing technological landscape.</p>
    `,
    date: new Date().toISOString().split('T')[0],
    read_time: '8 min read',
    category: 'Technology',
    tags: ['technology', 'sustainability', 'architecture', 'future-proofing'],
    author: 'Gary Lee McCullouch Jr',
    featured: false,
    published: true
  },
  {
    slug: 'life-is-what-you-make-it',
    title: 'Life is What You Make It',
    excerpt: 'Reflections on the philosophy that drives my approach to both life and work.',
    content: `
      <p>This simple phrase—"Life is what you make it"—has become more than just a motto for me. It's a fundamental philosophy that shapes how I approach challenges, opportunities, and the creative process itself.</p>

      <h2>The Philosophy in Practice</h2>
      <p>At its core, this philosophy is about taking responsibility for your own experience. It's about recognizing that while we can't control everything that happens to us, we can control how we respond, how we adapt, and how we create meaning from our experiences.</p>

      <p>In the context of design and development, this translates to a proactive approach to problem-solving. Instead of waiting for perfect conditions or ideal circumstances, we create the conditions we need to succeed.</p>

      <h2>Embracing Constraints</h2>
      <p>One of the most powerful applications of this philosophy is in how we handle constraints. Every project has limitations—budget, time, resources, technology. Rather than seeing these as obstacles, we can view them as creative catalysts.</p>

      <p>Constraints force us to be more creative, more focused, more intentional. They push us to find innovative solutions we might never have discovered in unlimited circumstances.</p>

      <h2>The Creative Process</h2>
      <p>When approaching a new project, I start with the assumption that we can create something meaningful regardless of the constraints. This mindset opens up possibilities rather than closing them down.</p>

      <p>Some practical applications:</p>

      <ul>
        <li><strong>Limited Budget?</strong> Focus on core functionality and perfect execution</li>
        <li><strong>Tight Timeline?</strong> Prioritize the most impactful features</li>
        <li><strong>Technical Constraints?</strong> Find creative workarounds or embrace limitations as features</li>
        <li><strong>Resource Limitations?</strong> Leverage what you have more effectively</li>
      </ul>

      <h2>Personal Growth Through Projects</h2>
      <p>Every project is an opportunity for growth. Whether it succeeds or fails, whether it's well-received or criticized, there's always something to learn, some way to improve, some new skill to develop.</p>

      <p>This perspective transforms every challenge into an opportunity. Instead of fearing failure, we embrace it as a natural part of the learning process.</p>

      <h2>Building Resilience</h2>
      <p>When we take ownership of our experience, we build resilience. We become less dependent on external validation and more focused on internal growth and improvement.</p>

      <p>This resilience is crucial in creative fields, where rejection and criticism are common. When we know that our worth isn't determined by external factors, we can take risks, try new things, and push boundaries.</p>

      <h2>Creating Meaningful Work</h2>
      <p>Ultimately, this philosophy leads to more meaningful work. When we approach projects with intention and ownership, we create things that matter—not just to us, but to the people who use them.</p>

      <p>Every line of code, every design decision, every user interaction becomes an opportunity to create something that makes the world a little better, a little more beautiful, a little more functional.</p>

      <h2>Conclusion</h2>
      <p>"Life is what you make it" isn't about ignoring reality or pretending that everything is perfect. It's about recognizing our agency in creating our own experience and using that agency to create positive change.</p>

      <p>In work and in life, this philosophy guides us toward more intentional, more meaningful, and more fulfilling experiences. It's a reminder that we have the power to shape our world, one decision at a time.</p>
    `,
    date: new Date().toISOString().split('T')[0],
    read_time: '6 min read',
    category: 'Philosophy',
    tags: ['philosophy', 'mindset', 'creativity', 'personal-growth'],
    author: 'Gary Lee McCullouch Jr',
    featured: true,
    published: true
  },
  {
    slug: 'the-creative-process',
    title: 'The Creative Process',
    excerpt: 'A behind-the-scenes look at how I approach creative projects and overcome creative blocks.',
    content: `
      <p>Creativity isn't magic—it's a process. And like any process, it can be understood, refined, and improved. Over the years, I've developed a framework for approaching creative projects that helps me navigate from initial concept to finished work.</p>

      <h2>The Creative Cycle</h2>
      <p>My creative process typically follows four distinct phases, though they often overlap and cycle back on themselves:</p>

      <ul>
        <li><strong>Exploration:</strong> Gathering inspiration and understanding the problem</li>
        <li><strong>Incubation:</strong> Letting ideas develop subconsciously</li>
        <li><strong>Expression:</strong> Bringing ideas into tangible form</li>
        <li><strong>Refinement:</strong> Iterating and improving the work</li>
      </ul>

      <h2>Phase 1: Exploration</h2>
      <p>Every creative project begins with exploration. This is where I gather information, seek inspiration, and try to understand the problem I'm trying to solve.</p>

      <p>Key activities during exploration:</p>

      <ul>
        <li>Research similar projects and solutions</li>
        <li>Understand user needs and constraints</li>
        <li>Collect visual and conceptual inspiration</li>
        <li>Define the scope and objectives</li>
        <li>Identify potential challenges and opportunities</li>
      </ul>

      <h2>Phase 2: Incubation</h2>
      <p>After gathering information, I step away from the project. This isn't procrastination—it's a crucial part of the creative process. Our subconscious minds continue working on problems even when we're not actively thinking about them.</p>

      <p>Incubation activities:</p>

      <ul>
        <li>Taking breaks to do other activities</li>
        <li>Sleeping on problems (literally)</li>
        <li>Going for walks or engaging in physical activity</li>
        <li>Working on unrelated projects</li>
        <li>Allowing ideas to percolate without forcing them</li>
      </ul>

      <h2>Phase 3: Expression</h2>
      <p>This is where ideas start taking tangible form. I begin sketching, prototyping, writing, or building—whatever form the project requires.</p>

      <p>Key principles during expression:</p>

      <ul>
        <li><strong>Start rough:</strong> Don't worry about perfection initially</li>
        <li><strong>Iterate quickly:</strong> Make many small improvements rather than few large ones</li>
        <li><strong>Stay open:</strong> Be willing to change direction based on what emerges</li>
        <li><strong>Document everything:</strong> Keep track of ideas and iterations</li>
      </ul>

      <h2>Phase 4: Refinement</h2>
      <p>The final phase involves polishing, testing, and improving the work. This is where attention to detail becomes crucial.</p>

      <p>Refinement activities:</p>

      <ul>
        <li>Testing with real users or audiences</li>
        <li>Polishing details and interactions</li>
        <li>Optimizing performance and accessibility</li>
        <li>Gathering feedback and incorporating improvements</li>
        <li>Finalizing and preparing for launch</li>
      </ul>

      <h2>Overcoming Creative Blocks</h2>
      <p>Creative blocks are inevitable, but they're not insurmountable. Here are some strategies I use:</p>

      <ul>
        <li><strong>Change your environment:</strong> Work in a different space</li>
        <li><strong>Switch mediums:</strong> If you're stuck on code, try sketching</li>
        <li><strong>Set constraints:</strong> Sometimes limitations spark creativity</li>
        <li><strong>Collaborate:</strong> Get fresh perspectives from others</li>
        <li><strong>Take breaks:</strong> Sometimes the best solution is to step away</li>
      </ul>

      <h2>The Role of Constraints</h2>
      <p>Constraints are often seen as limitations, but they can be powerful creative catalysts. When we have unlimited options, we can become paralyzed by choice. Constraints force us to be more creative and focused.</p>

      <p>Common creative constraints:</p>

      <ul>
        <li>Time limitations (deadlines)</li>
        <li>Resource constraints (budget, tools)</li>
        <li>Technical limitations (platform capabilities)</li>
        <li>Design constraints (brand guidelines, accessibility)</li>
      </ul>

      <h2>Conclusion</h2>
      <p>The creative process is deeply personal, but understanding its patterns can help us work more effectively. By recognizing the different phases and learning to navigate them, we can become more productive and more creative.</p>

      <p>Remember, creativity is a skill that can be developed. The more we practice, the more we understand our own process, and the better we become at bringing ideas to life.</p>
    `,
    date: new Date().toISOString().split('T')[0],
    read_time: '7 min read',
    category: 'Creative',
    tags: ['creativity', 'process', 'design', 'workflow'],
    author: 'Gary Lee McCullouch Jr',
    featured: false,
    published: true
  }
];

async function initializeBlogPosts() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🚀 Initializing blog posts in database...');
    
    // Check if blog posts already exist
    const existingPosts = await sql`SELECT COUNT(*) as count FROM blog_posts`;
    if (existingPosts[0]?.count > 0) {
      console.log('✅ Blog posts already exist in database');
      return;
    }

    // Insert blog posts
    for (const post of blogPosts) {
      await sql`
        INSERT INTO blog_posts (
          slug, title, excerpt, content, date, read_time, 
          category, tags, author, featured, published
        ) VALUES (
          ${post.slug}, ${post.title}, ${post.excerpt}, ${post.content}, 
          ${post.date}, ${post.read_time}, ${post.category}, ${post.tags}, 
          ${post.author}, ${post.featured}, ${post.published}
        )
      `;
      console.log(`✅ Inserted: ${post.title}`);
    }
    
    console.log(`🎉 Successfully initialized ${blogPosts.length} blog posts!`);
  } catch (error) {
    console.error('❌ Error initializing blog posts:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeBlogPosts();
