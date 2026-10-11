import { useId, useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export type ComboboxOption = {
  value: string;
  label: string;
  subLabel?: string;
};

type ComboboxProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  error?: string;
  className?: string;
  id?: string;
  /**
   * Busca externa: quem usa recebe o termo digitado e devolve `options` já filtradas (por
   * exemplo, buscando na API). Sem ela, o campo filtra as opções recebidas.
   */
  onSearchChange?: (termo: string) => void;
  /** Opção do valor selecionado, para quando ela não está entre as `options` da busca atual. */
  selectedOption?: ComboboxOption | null;
  /** Busca externa em andamento. */
  loading?: boolean;
};

export function Combobox({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  error,
  className,
  id,
  onSearchChange,
  selectedOption: selecionadaDeFora,
  loading = false,
}: ComboboxProps) {
  const generatedId = useId();
  const comboboxId = id ?? generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  // Encontra a opção selecionada
  const selectedOption = selecionadaDeFora ?? options.find((opt) => opt.value === value);

  function buscar(termo: string) {
    setSearch(termo);
    onSearchChange?.(termo);
  }

  // Fecha o dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reseta o texto para a opção selecionada
        if (selectedOption) {
          setSearch(selectedOption.label);
        } else {
          setSearch('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedOption]);

  // Filtra as opções com base no texto digitado
  const filteredOptions = onSearchChange
    ? options
    : options.filter((opt) => {
        const searchLower = search.toLowerCase();
        return (
          opt.label.toLowerCase().includes(searchLower) ||
          (opt.subLabel && opt.subLabel.toLowerCase().includes(searchLower))
        );
      });

  return (
    <div ref={containerRef} className={cn('relative space-y-2', className)}>
      <label htmlFor={comboboxId} className="block text-sm font-medium text-fg">
        {label}
      </label>

      <div className="relative">
        <input
          id={comboboxId}
          type="text"
          value={isOpen ? search : selectedOption ? selectedOption.label : search}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${comboboxId}-erro` : undefined}
          onFocus={() => {
            setIsOpen(true);
            buscar(''); // Limpa para mostrar todas as opções ao focar
          }}
          onChange={(e) => buscar(e.target.value)}
          className={cn(
            'h-11 w-full rounded-md border border-line-strong bg-surface pl-10 pr-10 text-sm pointer-coarse:pr-24 text-fg outline-none transition-all placeholder:text-fg-muted focus:border-accent focus:ring-2 focus:ring-accent/40',
            error && 'border-danger focus:border-danger focus:ring-danger/40',
          )}
        />

        {/* Ícone de Busca à Esquerda */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-fg-muted">
          <Search size={16} />
        </div>

        {/* Botão de Limpar / Chevron à Direita */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1 pointer-coarse:gap-0 pointer-coarse:pr-0">
          {value ? (
            <button
              type="button"
              aria-label="Limpar seleção"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setSearch('');
                setIsOpen(false);
              }}
              className="inline-flex items-center justify-center p-1 rounded-full text-fg-muted pointer-coarse:min-h-11 pointer-coarse:min-w-11 hover:bg-surface-muted hover:text-fg"
            >
              <X size={14} />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={isOpen ? 'Ocultar opções' : 'Mostrar opções'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center justify-center p-1 rounded-full text-fg-muted pointer-coarse:min-h-11 pointer-coarse:min-w-11 hover:bg-surface-muted hover:text-fg"
          >
            <ChevronDown
              size={16}
              className={cn('transition-transform duration-200', isOpen && 'rotate-185')}
            />
          </button>
        </div>
      </div>

      {/* Dropdown flutuante com rolagem */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-line bg-surface-raised py-1 shadow-lg transition-all',
          )}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setSearch(option.label);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm transition-colors pointer-coarse:min-h-11 hover:bg-surface-muted',
                    'flex flex-col gap-0.5 border-b border-line last:border-0',
                    isSelected && 'bg-surface-muted font-semibold text-fg',
                  )}
                >
                  <span className="text-fg">{option.label}</span>
                  {option.subLabel && (
                    <span className="text-xs text-fg-muted">{option.subLabel}</span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-3 text-center text-sm text-fg-muted">
              {loading ? 'Buscando...' : 'Nenhum modelo encontrado'}
            </div>
          )}
        </div>
      )}

      {error ? (
        <p id={`${comboboxId}-erro`} className="text-sm text-danger-fg">
          {error}
        </p>
      ) : null}
    </div>
  );
}
