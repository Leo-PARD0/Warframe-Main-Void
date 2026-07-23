import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RoadmapList from './pages/RoadmapList';
import RoadmapEditor from './pages/RoadmapEditor';
import ItemDetail from './pages/ItemDetail';
import AppLayout from './components/AppLayout';
import Support from './pages/Support';
import { ApiLanguageProvider } from '@/lib/ApiLanguageContext';

const LocalApp = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/catalog" element={<Home />} />
      <Route path="/roadmaps" element={<RoadmapList />} />
      <Route path="/roadmaps/:id" element={<RoadmapEditor />} />
      <Route path="/item/:itemId" element={<ItemDetail />} />
      <Route path="/support" element={<Support />} />
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <ApiLanguageProvider>
        <Router>
          <ScrollToTop />
          <LocalApp />
        </Router>
      </ApiLanguageProvider>
      <Toaster />
    </QueryClientProvider>
  );
}