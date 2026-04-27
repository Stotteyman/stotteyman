# Stotteyman

Multi-page portfolio built with Next.js and Tailwind CSS. The site is focused on public visibility: mindset, achievements, writing, livestream, events, follow links, and direct contact.

## What is included

- Static-first pages for Home, Mindset, Achievements, Writing, Follow, Events, Livestream, and Contact.
- Centralized portfolio content in `lib/site-content.ts` so it can move to Supabase later without changing page structure.
- SEO basics: metadata, sitemap, robots, Open Graph, and JSON-LD.
- Netlify-ready deployment configuration.

## Development

1. Install dependencies.

```bash
pnpm install
```

2. Create `.env.local` from `env.example`.

```bash
cp env.example .env.local
```

3. Start the dev server.

```bash
pnpm dev
```

4. Validate TypeScript when needed.

```bash
pnpm type-check
```

## Content updates

- Update shared copy, links, events, writing entries, and contact methods in `lib/site-content.ts`.
- Adjust shared page chrome in `components/SiteShell.tsx`.
- Update visual theme in `app/globals.css` and `tailwind.config.js`.

## Supabase later

The site does not require a database right now. When you are ready, the arrays in `lib/site-content.ts` are the natural place to replace with Supabase-backed content for posts, events, contact submissions, and live updates.
- Verify WebAudio API support

**Performance Issues**
- Check bundle size with `pnpm build`
- Run Lighthouse audit
- Verify lazy loading is working

### Debug Mode

Set `NODE_ENV=development` to enable:
- Debug info overlay
- Console logging
- Hot reloading
- Source maps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js** for 3D graphics
- **Next.js** for the React framework
- **Neon** for serverless Postgres
- **Netlify** for hosting and deployment
- **TailwindCSS** for styling
- **XState** for state management

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/stotteyman/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/stotteyman/discussions)
- **Email**: support@stotteyman.com

---

**Built with ❤️ by the Stotteyman team**
