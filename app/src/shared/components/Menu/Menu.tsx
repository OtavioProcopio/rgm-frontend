import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib/cn';

const ITENS = '[role^="menuitem"]:not([disabled])';

const CLASSE_DO_ITEM =
  'flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-surface-muted focus:bg-surface-muted focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:min-h-11';

const CLASSE_DO_BOTAO =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-surface-muted pointer-coarse:min-h-11';

/** Destino de cada tecla de movimento: o índice do item que recebe o foco. */
const MOVIMENTOS: Record<string, (total: number, atual: number) => number> = {
  ArrowDown: (total, atual) => (atual + 1) % total,
  ArrowUp: (total, atual) => (atual - 1 + total) % total,
  Home: () => 0,
  End: (total) => total - 1,
};

/** Só `MenuItem` e `MenuLink` leem o contexto, e sempre dentro de um `Menu`. */
const MenuContexto = createContext<{ fechar: () => void } | null>(null);

function useFecharMenu(): () => void {
  return useContext(MenuContexto)!.fechar;
}

type MenuProps = {
  /** Nome acessível do menu aberto. */
  rotuloDoMenu: string;
  /** Nome acessível do botão, quando o conteúdo dele não diz o que o menu é. */
  rotuloDoBotao?: string;
  titulo?: string;
  /** Conteúdo do botão que abre o menu. */
  botao: ReactNode;
  classeDoBotao?: string;
  children: ReactNode;
};

/** Estado do menu: aberto ou fechado, foco ao abrir, fechar por clique fora e devolver o foco ao botão. */
function useMenuAberto() {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const marcado = menuRef.current!.querySelector<HTMLElement>('[aria-checked="true"]');
    (marcado ?? menuRef.current!.querySelector<HTMLElement>(ITENS))?.focus();

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

  return { aberto, setAberto, raizRef, botaoRef, menuRef, fechar };
}

/** Teclas do menu aberto: movimento entre itens, Esc e Tab fecham, Enter e Espaço escolhem. */
function useTecladoDoMenu(
  menuRef: RefObject<HTMLDivElement | null>,
  setAberto: (aberto: boolean) => void,
  fechar: () => void,
) {
  function moverFoco(tecla: string) {
    const lista = Array.from(menuRef.current!.querySelectorAll<HTMLElement>(ITENS));
    const atual = lista.indexOf(document.activeElement as HTMLElement);
    lista[MOVIMENTOS[tecla](lista.length, atual)]?.focus();
  }

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    const { key } = evento;

    if (Object.hasOwn(MOVIMENTOS, key)) {
      evento.preventDefault();
      moverFoco(key);
    } else if (key === 'Escape') {
      evento.preventDefault();
      fechar();
    } else if (key === 'Tab') {
      setAberto(false);
    } else if (key === 'Enter' || key === ' ') {
      // Enter e Espaço escolhem o item focado; o menu os trata no teclado para valer igual em todo item.
      evento.preventDefault();
      (evento.target as HTMLElement).click();
    }
  }

  /** Alguns navegadores clicam no Espaço ao soltar a tecla; a escolha já foi feita ao apertar. */
  function aoSoltar(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === ' ') evento.preventDefault();
  }

  return { aoTeclar, aoSoltar };
}

/** Menu aberto por um botão: setas percorrem os itens, Esc fecha e devolve o foco ao botão. */
export function Menu({
  rotuloDoMenu,
  rotuloDoBotao,
  titulo,
  botao,
  classeDoBotao,
  children,
}: MenuProps) {
  const { aberto, setAberto, raizRef, botaoRef, menuRef, fechar } = useMenuAberto();
  const teclado = useTecladoDoMenu(menuRef, setAberto, fechar);
  const menuId = useId();

  function aoTeclarNoBotao(evento: KeyboardEvent<HTMLButtonElement>) {
    if (evento.key !== 'ArrowDown') return;
    evento.preventDefault();
    setAberto(true);
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
            onKeyDown={teclado.aoTeclar}
            onKeyUp={teclado.aoSoltar}
            className="absolute right-0 top-full z-50 mt-1 min-w-48 rounded-md border border-line bg-surface-raised p-1 shadow-lg"
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
  const fechar = useFecharMenu();

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
  const fechar = useFecharMenu();

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
