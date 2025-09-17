'use client';

import { useEffect, useState } from 'react';

interface ContactPageProps {
  onBack: () => void;
  respectMotionPreference: boolean;
}

interface ContactMethod {
  type: string;
  value: string;
  label: string;
  action: () => void;
}

export default function ContactPage({ onBack, respectMotionPreference }: ContactPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const contactMethods: ContactMethod[] = [
    {
      type: 'email',
      value: 'hello@stotteyman.com',
      label: 'Email',
      action: () => window.open('mailto:hello@stotteyman.com', '_self')
    },
    {
      type: 'phone',
      value: '+1 (555) 123-4567',
      label: 'Phone',
      action: () => window.open('tel:+15551234567', '_self')
    },
    {
      type: 'linkedin',
      value: 'LinkedIn',
      label: 'LinkedIn',
      action: () => window.open('https://linkedin.com/in/stotteyman', '_blank')
    },
    {
      type: 'twitter',
      value: '@stotteyman',
      label: 'Twitter',
      action: () => window.open('https://twitter.com/stotteyman', '_blank')
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data
    console.log('Form submitted:', formData);
    // For now, just open email client
    const subject = encodeURIComponent(`Contact from ${formData.name}`);
    const body = encodeURIComponent(formData.message);
    window.open(`mailto:hello@stotteyman.com?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <div className="h-full w-full bg-black flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 relative z-10">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 text-gray-400 hover:text-white transition-colors duration-300 z-10"
          aria-label="Go back to menu"
        >
          ← Back
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={`max-w-4xl mx-auto px-8 py-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-wide">
            Contact
          </h1>
          <div className="w-24 h-px bg-white mx-auto"></div>
          <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
            Let's connect and create something amazing together
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-2xl text-white font-light mb-6">Get in Touch</h2>
            <div className="space-y-4">
              {contactMethods.map((method) => (
                <button
                  key={method.type}
                  onClick={method.action}
                  className="w-full text-left p-4 hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-light group-hover:text-gray-300 transition-colors">
                        {method.label}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">{method.value}</p>
                    </div>
                    <div className="text-gray-500 group-hover:text-white transition-colors">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl text-white font-light mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors"
                  required
                />
              </div>
              
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your Email"
                  className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors"
                  required
                />
              </div>
              
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your Message"
                  rows={6}
                  className="w-full px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-500 focus:border-white focus:outline-none transition-colors resize-none"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-6 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Press ESC to go back
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
