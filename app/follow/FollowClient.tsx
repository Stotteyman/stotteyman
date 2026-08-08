'use client';

import SiteShell from '@/components/SiteShell';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

type SocialLink = {
  id: string;
  platform: string;
  url: string;
  description: string;
};

export default function FollowClient() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('public_links')
      .select('id, platform, url, description')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setLinks(data as SocialLink[]);
        setLoading(false);
      });
  }, []);

  return (
    <SiteShell
      eyebrow="Follow"
      title="Everything worth following, in one place."
      intro="All the channels in one place so you don't have to hunt. Stream alerts, updates, community, code — the right link is here."
    >
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl border border-line bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line bg-surface p-6 transition-all duration-300 hover:border-line-strong hover:bg-surface-hover"
            >
              <p className="text-label uppercase text-accent">{link.platform}</p>
              <p className="mt-4 text-sm leading-7 text-fg-subtle">{link.description}</p>
              <span className="mt-6 inline-flex text-label uppercase text-fg">Open link</span>
            </a>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
