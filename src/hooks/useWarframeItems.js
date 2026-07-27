import { useCallback, useEffect, useState } from 'react';
import { useApiLanguage } from '@/lib/ApiLanguageContext';
import { WarframeRepository } from '@/services/warframe';

export function useWarframeItems() {
  const { language } = useApiLanguage();
  const [state, setState] = useState({ 
    items: [], 
    loading: true, 
    error: null,
    failedCategories: []
  });

  const query = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const result = await WarframeRepository.queryCatalog(language);
      const { items, failedCategories } = result;
      
      // Se há itens válidos, não seta erro global - apenas categorias falhadas
      if (items.length > 0) {
        setState({ 
          items, 
          loading: false, 
          error: null,
          failedCategories: failedCategories || []
        });
      } else {
        // Catálogo completamente vazio = erro crítico
        setState({ 
          items: [], 
          loading: false, 
          error: 'Não foi possível carregar os dados do Warframe.',
          failedCategories: failedCategories || []
        });
      }
      return items;
    } catch (err) {
      setState((previous) => ({ 
        ...previous, 
        loading: false, 
        error: err.message || 'Não foi possível carregar os dados do Warframe.',
        failedCategories: []
      }));
      return [];
    }
  }, [language]);

  useEffect(() => { query(); }, [query]);
  
  return { ...state, language, refresh: query };
}
