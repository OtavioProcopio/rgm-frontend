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
}: ComboboxProps) {
  const generatedId = useId();
  const comboboxId = id ?? generatedId;
  
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  // Encontra a opção selecionada
  const selectedOption = options.find((opt) => opt.value === value);

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
  const filteredOptions = options.filter((opt) => {
    const searchLower = search.toLowerCase();
    return (
      opt.label.toLowerCase().includes(searchLower) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div ref={containerRef} className={cn('relative space-y-2', className)}>
      <label
        htmlFor={comboboxId}
        className="block text-sm font-medium text-slate-800 dark:text-slate-100"
      >
        {label}
      </label>
      
      <div className="relative">
        <input
          id={comboboxId}
          type="text"
          value={isOpen ? search : (selectedOption ? selectedOption.label : search)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          onFocus={() => {
            setIsOpen(true);
            setSearch(''); // Limpa para mostrar todas as opções ao focar
          }}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'h-11 w-full rounded-md border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-950 outline-none transition-all placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10',
            'dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/10',
            error &&
              'border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-400 dark:focus:border-red-400',
          )}
        />
        
        {/* Ícone de Busca à Esquerda */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
          <Search size={16} />
        </div>

        {/* Botão de Limpar / Chevron à Direita */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {value ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setSearch('');
                setIsOpen(false);
              }}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-850 dark:hover:text-slate-350"
            >
              <X size={14} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-850 dark:hover:text-slate-350"
          >
            <ChevronDown
              size={16}
              className={cn('transition-transform duration-200', isOpen && 'rotate-185')}
            />
          </button>
        </div>
      </div>

      {/* Dropdown Flutuante com Efeito Glassmorphism e Rolagem */}
      {isOpen && (
        <div className={cn(
          'absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white/95 py-1 shadow-lg backdrop-blur-sm transition-all',
          'dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-slate-950/50'
        )}>
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
                    'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-900',
                    'flex flex-col gap-0.5 border-b border-slate-100/50 last:border-0 dark:border-slate-900/50',
                    isSelected && 'bg-slate-100 font-semibold text-slate-900 dark:bg-slate-900 dark:text-white'
                  )}
                >
                  <span className="text-slate-900 dark:text-slate-100">{option.label}</span>
                  {option.subLabel && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {option.subLabel}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400">
              Nenhum modelo encontrado
            </div>
          )}
        </div>
      )}

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
