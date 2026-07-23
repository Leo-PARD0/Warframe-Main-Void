import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Swords, LayoutDashboard, Map, BookOpen, Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApiLanguage } from '@/lib/ApiLanguageContext';

const NAV = [{ label: 'Dashboard', to: '/', icon: LayoutDashboard }, { label: 'Catálogo', to: '/catalog', icon: BookOpen }, { label: 'Roadmaps', to: '/roadmaps', icon: Map }, { label: 'Apoie', to: '/support', icon: Heart }];
const isRoadmapEditorPath = (pathname) => /^\/roadmaps\/[^/]+$/.test(pathname);
const shouldPromptAfterEditor = (pathname) => pathname === '/' || pathname === '/catalog' || pathname === '/roadmaps';

function SupportPrompt({ onClose }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="support-prompt-title" onMouseDown={(event) => event.stopPropagation()} className="relative w-full max-w-md rounded-2xl border border-amber-400/30 bg-card p-6 shadow-2xl">
      <button onClick={onClose} aria-label="Fechar" className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"><X className="h-4 w-4" /></button>
      <Heart className="h-7 w-7 fill-amber-400 text-amber-400" />
      <h2 id="support-prompt-title" className="mt-4 text-xl font-bold">Obrigado por usar o Main Void!</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Se o roadmap ajudou no seu farm, considere apoiar o projeto. Isso ajuda a manter novas melhorias chegando.</p>
      <div className="mt-5 flex items-center gap-3"><Link to="/support" onClick={onClose} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-300">Conhecer formas de apoio</Link><button onClick={onClose} className="px-2 py-2 text-sm text-muted-foreground hover:text-foreground">Agora não</button></div>
    </section>
  </div>;
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const { language, setLanguage, languages } = useApiLanguage();
  const previousPath = useRef(pathname);
  const [showSupportPrompt, setShowSupportPrompt] = useState(false);
  useEffect(() => { if (isRoadmapEditorPath(previousPath.current) && shouldPromptAfterEditor(pathname)) setShowSupportPrompt(true); previousPath.current = pathname; }, [pathname]);
  return <div className="min-h-screen bg-background text-foreground flex flex-col">
    <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" /><div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" /></div>
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl flex-shrink-0"><div className="mx-auto max-w-[1600px] px-4 sm:px-6 h-13 flex items-center gap-4">
      <Link to="/" className="flex items-center gap-2.5 flex-shrink-0"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20"><Swords className="h-4 w-4 text-black" /></div><div className="hidden sm:block"><h1 className="text-sm font-bold tracking-tight leading-none">Warframe Main Void</h1><p className="text-[10px] text-muted-foreground leading-none mt-0.5">Hub de progresso e conhecimento</p></div></Link>
      <nav className="flex items-center gap-1 ml-2">{NAV.map(({ label, to, icon: Icon }) => { const active = to === '/' ? pathname === '/' : pathname.startsWith(to); return <Link key={to} to={to} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors', active ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}><Icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{label}</span></Link>; })}</nav>
      <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground"><span className="hidden md:inline">Idioma</span><select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Idioma dos dados da API" className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">{languages.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}</select></label>
    </div></header>
    <main className="flex-1 relative"><Outlet /></main>{showSupportPrompt && <SupportPrompt onClose={() => setShowSupportPrompt(false)} />}
  </div>;
}