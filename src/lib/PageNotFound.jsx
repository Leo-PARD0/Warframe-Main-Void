import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-4xl font-bold">Página não encontrada</h1>
      <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
    </main>
  );
}