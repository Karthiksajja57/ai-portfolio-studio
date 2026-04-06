import { useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
  multiline?: boolean;
}

export default function InlineEditableText({
  value,
  onChange,
  placeholder = 'Type something…',
  className,
  as: Tag = 'p',
  multiline = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const lastValue = useRef(value);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
      lastValue.current = value;
    }
  }, [value]);

  const handleInput = () => {
    const text = ref.current?.textContent ?? '';
    if (text !== lastValue.current) {
      lastValue.current = text;
      onChange(text);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      className={cn(
        'outline-none rounded-md px-1.5 -mx-1.5 transition-colors duration-150',
        'hover:bg-muted/50 focus:bg-muted/60 focus:ring-1 focus:ring-primary/20',
        'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50',
        'overflow-wrap-break-word',
        className
      )}
    />
  );
}
