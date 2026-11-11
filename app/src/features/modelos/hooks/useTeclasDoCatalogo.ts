import { useEffect } from 'react';

const CAMPOS = ['INPUT', 'SELECT', 'TEXTAREA'];

/**
 * ← e → trocam de modelo, a menos que o foco esteja num campo ou na faixa de miniaturas (onde as
 * mesmas setas trocam a foto) ou que haja tecla de atalho junto.
 */
export function useTeclasDoCatalogo(aoVoltar: () => void, aoAvancar: () => void) {
  useEffect(() => {
    function aoApertar(evento: KeyboardEvent) {
      if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
      if (evento.altKey || evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
      const alvo = evento.target instanceof HTMLElement ? evento.target : null;
      if (alvo && (CAMPOS.includes(alvo.tagName) || alvo.isContentEditable)) return;
      if (alvo?.closest('[data-faixa-de-fotos]')) return;
      if (evento.key === 'ArrowLeft') aoVoltar();
      else aoAvancar();
    }
    document.addEventListener('keydown', aoApertar);
    return () => document.removeEventListener('keydown', aoApertar);
  }, [aoVoltar, aoAvancar]);
}
