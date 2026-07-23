import { Heart, Coffee, ExternalLink } from 'lucide-react';

const SUPPORT_PLATFORMS = [
  {
    name: 'Apoia.se',
    description:
      'Apoie mensalmente meu trabalho e o desenvolvimento contínuo do Warframe Main Void.',
    href: 'https://apoia.se/ytclipper',
    tone: 'from-orange-500/25 to-amber-500/10',
    cta: 'Apoiar mensalmente',
  },
  {
    name: 'LivePix',
    description:
      'Envie uma contribuição pontual ou apoie durante as lives.',
    href: 'https://livepix.gg/leo1pardo',
    tone: 'from-pink-500/25 to-violet-500/10',
    cta: 'Enviar apoio',
  },
  {
    name: 'Buy Me a Coffee',
    description:
      'Um café ajuda a manter o projeto vivo e em constante evolução.',
    href: 'https://buymeacoffee.com/LeoPardo',
    tone: 'from-yellow-500/25 to-orange-500/10',
    cta: 'Comprar um café',
  },
];

export default function Support() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <section className="rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-card to-card p-7 text-center shadow-xl shadow-amber-950/10 sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
          <Heart className="h-7 w-7 fill-current" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Apoie o Warframe Main Void
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          O Warframe Main Void é um projeto gratuito criado para ajudar a
          comunidade a organizar farms, objetivos e roadmaps. Se ele já foi útil
          para você, considere apoiar seu desenvolvimento.
        </p>
      </section>

      <section className="mt-7 grid gap-4 md:grid-cols-3">
        {SUPPORT_PLATFORMS.map((platform) => (
          <a
            key={platform.name}
            href={platform.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group rounded-2xl border border-border/70 bg-gradient-to-br ${platform.tone} p-5 transition-all hover:-translate-y-1 hover:border-amber-300/50`}
          >
            <Coffee className="h-5 w-5 text-amber-300" />

            <h2 className="mt-4 flex items-center gap-2 font-semibold">
              {platform.name}
              <ExternalLink className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {platform.description}
            </p>

            <span className="mt-5 inline-block text-sm font-medium text-amber-300">
              {platform.cta} →
            </span>
          </a>
        ))}
      </section>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Toda contribuição é opcional e ajuda a manter o projeto gratuito para a
        comunidade.
      </p>
    </div>
  );
}