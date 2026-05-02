'use client';

import SiteShell from '@/components/SiteShell';
import { supabase } from '@/lib/supabase';
import { useCallback, useState } from 'react';

type FormState = 'idle' | 'submitting' | 'sent' | 'error';

export default function ContactClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (formState === 'submitting') return;

      setFormState('submitting');
      setErrorMsg('');

      const { error } = await supabase.from('contact_submissions').insert({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || null,
        message: message.trim(),
      });

      if (error) {
        setFormState('error');
        setErrorMsg(error.message);
      } else {
        setFormState('sent');
      }
    },
    [formState, name, email, subject, message]
  );

  const reset = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setFormState('idle');
    setErrorMsg('');
  };

  return (
    <SiteShell
      eyebrow="Contact"
      title="Reach out directly without friction."
      intro="Send a message directly — it lands in the inbox. For the fastest reply, Discord and Kick chat are also monitored during streams."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">

        {/* Contact form */}
        <section>
          {formState === 'sent' ? (
            <div className="flex flex-col items-center gap-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-neon-cyan/40 bg-neon-cyan/10 text-2xl text-neon-cyan">✓</span>
              <h2 className="text-2xl font-light text-white">Message sent.</h2>
              <p className="text-sm leading-7 text-gray-400">
                Thanks for reaching out. I'll get back to you as soon as possible.
              </p>
              <button
                onClick={reset}
                className="mt-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.25em] text-gray-300 transition-all hover:border-neon-orange/60 hover:text-white"
              >
                Send another
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7"
            >
              <h2 className="mb-6 text-lg font-light uppercase tracking-[0.2em] text-white">Send a message</h2>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-[0.25em] text-gray-500">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      maxLength={100}
                      disabled={formState === 'submitting'}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-neon-orange/40 focus:ring-1 focus:ring-neon-orange/20 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-[0.25em] text-gray-500">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      maxLength={200}
                      disabled={formState === 'submitting'}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-neon-orange/40 focus:ring-1 focus:ring-neon-orange/20 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.25em] text-gray-500">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What's this about?"
                    maxLength={200}
                    disabled={formState === 'submitting'}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-neon-orange/40 focus:ring-1 focus:ring-neon-orange/20 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.25em] text-gray-500">
                    Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here…"
                    required
                    rows={6}
                    maxLength={2000}
                    disabled={formState === 'submitting'}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-neon-orange/40 focus:ring-1 focus:ring-neon-orange/20 disabled:opacity-50"
                  />
                  <p className="mt-1 text-right text-xs text-gray-600">{message.length}/2000</p>
                </div>

                {formState === 'error' && (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                    {errorMsg || 'Something went wrong. Please try again.'}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full rounded-full border border-neon-orange/60 bg-neon-orange/10 py-3 text-sm uppercase tracking-[0.25em] text-neon-orange transition-all hover:bg-neon-orange/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formState === 'submitting' ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Direct contact methods */}
        <aside className="space-y-4">
          <div className="card-neon">
            <p className="text-sm uppercase tracking-[0.35em] text-neon-pink/80">Direct channels</p>
            <div className="mt-5 space-y-3">
              {[
                { label: 'Email', value: 'contact@stotteyman.com', href: 'mailto:contact@stotteyman.com' },
                { label: 'Discord', value: 'Community server', href: 'https://discord.gg/9zbyfPyp3E' },
                { label: 'Kick', value: 'kick.com/stotteyman', href: 'https://kick.com/stotteyman' },
              ].map((m) => (
                <a
                  key={m.label}
                  href={m.href}
                  target={m.href.startsWith('http') ? '_blank' : undefined}
                  rel={m.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 transition-all hover:border-neon-cyan/40 hover:bg-white/5"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-neon-orange/80">{m.label}</p>
                    <p className="mt-1 text-sm text-white">{m.value}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Open</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">Response time</p>
            <p className="mt-4 text-sm leading-7 text-gray-400">
              Messages submitted through the form are stored directly. Typically replied to within 24–48 hours. For real-time conversation, Discord or Kick chat during streams is fastest.
            </p>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
