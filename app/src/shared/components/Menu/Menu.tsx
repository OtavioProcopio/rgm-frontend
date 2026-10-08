import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib/cn';

const ITENS = '[role^="menuitem"]:not([disabled])';

const CLASSE_DO_ITEM =
  'flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-surface-muted focus:bg-surface-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:min-h-11';

const CLASSE_DO_BOTAO =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-surface-muted pointer-coarse:min-h-11';

const MenuContexto = createContext<{ fechar: () => void }>({ fechar: () => undefined });

type MenuProps = {
  /** Nome acessível do menu aberto. */
  rotuloDoMenu: string;
  /** Nome acessível do botão, quando o conteúdo dele não diz o que o menu é. */
  rotuloDoBotao?: string;
  titulo?: string;
  /** Conteúdo do botão que abre o menu. */
  botao: ReactNode;
  classeDoBotao?: string;
  /** Lado do botão em que o menu se alinha. */
  alinhamento?: 'direita' | 'esquerda';
  children: ReactNode;
};

/** Menu aberto por um botão: setas percorrem os itens, Esc fecha e devolve o foco ao botão. */
export function Menu({
  rotuloDoMenu,
  rotuloDoBotao,
  titulo,
  botao,
  classeDoBotao,
  alinhamento = 'direita',
  children,
}: MenuProps) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const itens = () => Array.from(menuRef.current!.querySelectorAll<HTMLElement>(ITENS));

  useEffect(() => {
    if (!aberto) return;

    const marcado = menuRef.current!.querySelector<HTMLElement>('[aria-checked="true"]');
    (marcado ?? itens()[0])?.focus();

    function fecharSeForFora(evento: MouseEvent) {
      if (!raizRef.current!.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener('mousedown', fecharSeForFora);
    return () => document.removeEventListener('mousedown', fecharSeForFora);
  }, [aberto]);

  function fechar() {
    setAberto(false);
    botaoRef.current!.focus();
  }

  function aoTeclarNoBotao(evento: KeyboardEvent<HTMLButtonElement>) {
    if (evento.key !== 'ArrowDown') return;
    evento.preventDefault();
    setAberto(true);
  }

  function aoTeclarNoMenu(evento: KeyboardEvent<HTMLDivElement>) {
    const lista = itens();
    const atual = lista.indexOf(document.activeElement as HTMLElement);

    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      const passo = evento.key === 'ArrowDown' ? 1 : -1;
      lista[(atual + passo + lista.length) % lista.length]?.focus();
    } else if (evento.key === 'Home') {
      evento.preventDefault();
      lista[0]?.focus();
    } else if (evento.key === 'End') {
      evento.preventDefault();
      lista[lista.length - 1]?.focus();
    } else if (evento.key === 'Escape') {
      evento.preventDefault();
      fechar();
    } else if (evento.key === 'Tab') {
      setAberto(false);
    } else if (evento.key === ' ' && (evento.target as HTMLElement).tagName === 'A') {
      // Espaço não aciona link sozinho; o menu o trata como botão.
      evento.preventDefault();
      (evento.target as HTMLElement).click();
    }
  }

  return (
    <MenuContexto.Provider value={{ fechar }}>
      <div ref={raizRef} className="relative inline-block">
        <button
          ref={botaoRef}
          type="button"
          aria-label={rotuloDoBotao}
          title={titulo}
          aria-haspopup="menu"
          aria-expanded={aberto}
          aria-controls={aberto ? menuId : undefined}
          onClick={() => setAberto((estava) => !estava)}
          onKeyDown={aoTeclarNoBotao}
          className={cn(CLASSE_DO_BOTAO, classeDoBotao)}
        >
          {botao}
        </button>

        {aberto ? (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={rotuloDoMenu}
            onKeyDown={aoTeclarNoMenu}
            className={cn(
              'absolute top-full z-50 mt-1 min-w-48 rounded-md border border-line bg-surface-raised p-1 shadow-lg',
              alinhamento === 'direita' ? 'right-0' : 'left-0',
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
    </MenuContexto.Provider>
  );
}

type MenuItemProps = {
  onSelect?: () => void;
  icone?: ReactNode;
  perigo?: boolean;
  desabilitado?: boolean;
  /** Item de escolha única: anuncia se está marcado. */
  escolhaUnica?: boolean;
  marcado?: boolean;
  children: ReactNode;
};

export function MenuItem({
  onSelect,
  icone,
  perigo = false,
  desabilitado = false,
  escolhaUnica = false,
  marcado,
  children,
}: MenuItemProps) {
  const { fechar } = useContext(MenuContexto);

  return (
    <button
      type="button"
      role={escolhaUnica ? 'menuitemradio' : 'menuitem'}
      aria-checked={escolhaUnica ? Boolean(marcado) : undefined}
      tabIndex={-1}
      disabled={desabilitado}
      onClick={() => {
        onSelect?.();
        fechar();
      }}
      className={cn(CLASSE_DO_ITEM, perigo ? 'text-danger-fg' : 'text-fg')}
    >
      {icone}
      <span className="flex-1">{children}</span>
      {escolhaUnica && marcado ? (
        <Check aria-hidden="true" size={16} className="text-accent" />
      ) : null}
    </button>
  );
}

type MenuLinkProps = { to: string; icone?: ReactNode; children: ReactNode };

export function MenuLink({ to, icone, children }: MenuLinkProps) {
  const { fechar } = useContext(MenuContexto);

  return (
    <Link
      to={to}
      role="menuitem"
      tabIndex={-1}
      onClick={fechar}
      className={cn(CLASSE_DO_ITEM, 'text-fg')}
    >
      {icone}
      <span className="flex-1">{children}</span>
    </Link>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 border-t border-line" />;
}

/** Texto que identifica o menu (por exemplo, quem está logado); não é item. */
export function MenuTitulo({ children }: { children: ReactNode }) {
  return <div className="px-2 py-2 text-sm text-fg">{children}</div>;
}
