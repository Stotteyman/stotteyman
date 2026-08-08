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

      // anon holds no INSERT privilege anywhere in the schema; submissions go
      // through a security-definer RPC that validates before writing.
      const { error } = await supabase.rpc('submit_contact_message', {
        p_name: name.trim(),
        p_email: email.trim(),
        p_subject: subject.trim() || null,
        p_message: message.trim(),
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
            <div className="flex flex-col items-center gap-5 rounded-xl border border-line bg-surface p-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-accent-soft text-2xl text-accent">✓</span>
              <h2 className="text-2xl font-light text-fg">Message sent.</h2>
              <p className="text-sm leading-7 text-fg-subtle">
                Thanks for reaching out. I'll get back to you as soon as possible.
              </p>
              <button
                onClick={reset}
                className="mt-2 rounded-full border border-line bg-surface px-5 py-2 text-label uppercase text-fg-muted transition-all hover:border-accent-line hover:text-fg"
              >
                Send another
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-line bg-surface p-7"
            >
              <h2 className="mb-6 text-lg font-light uppercase tracking-[0.2em] text-fg">Send a message</h2>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-label uppercase text-fg-subtle">
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
                      className="w-full rounded-xl border border-line bg-bg-raised px-4 py-2.5 text-sm text-fg placeholder:text-fg-faint outline-none transition-colors focus:border-accent-line focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label uppercase text-fg-subtle">
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
                      className="w-full rounded-xl border border-line bg-bg-raised px-4 py-2.5 text-sm text-fg placeholder:text-fg-faint outline-none transition-colors focus:border-accent-line focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-label uppercase text-fg-subtle">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What's this about?"
                    maxLength={200}
                    disabled={formState === 'submitting'}
                    className="w-full rounded-xl border border-line bg-bg-raised px-4 py-2.5 text-sm text-fg placeholder:text-fg-faint outline-none transition-colors focus:border-accent-line focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-label uppercase text-fg-subtle">
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
                    className="w-full resize-none rounded-xl border border-line bg-bg-raised px-4 py-2.5 text-sm text-fg placeholder:text-fg-faint outline-none transition-colors focus:border-accent-line focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
                  />
                  <p className="mt-1 text-right text-xs text-fg-subtle">{message.length}/2000</p>
                </div>

                {formState === 'error' && (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                    {errorMsg || 'Something went wrong. Please try again.'}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full rounded-full border border-accent-line bg-accent-soft py-3 text-label uppercase text-accent transition-all hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formState === 'submitting' ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Direct contact methods */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-line bg-surface p-6">
            <p className="text-label uppercase text-danger">Direct channels</p>
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
                  className="flex items-center justify-between rounded-lg border border-line bg-bg-raised px-4 py-3 transition-all hover:border-line-strong hover:bg-surface"
                >
                  <div>
                    <p className="text-label uppercase text-accent">{m.label}</p>
                    <p className="mt-1 text-sm text-fg">{m.value}</p>
                  </div>
                  <span className="text-label uppercase text-fg-subtle">Open</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-6">
            <p className="text-label uppercase text-accent">Response time</p>
            <p className="mt-4 text-sm leading-7 text-fg-subtle">
              Messages submitted through the form are stored directly. Typically replied to within 24–48 hours. For real-time conversation, Discord or Kick chat during streams is fastest.
            </p>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
