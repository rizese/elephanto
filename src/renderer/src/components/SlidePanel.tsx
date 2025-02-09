import React, { useEffect } from 'react';

type Direction = 'left' | 'right';

interface SlideProps {
  isOpen: boolean;
  onClose?: () => void;
  direction?: Direction;
  children: React.ReactNode;
  className?: string;
}

const SlidePanel = ({
  isOpen,
  onClose,
  direction = 'left',
  children,
  className = '',
}: SlideProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const baseStyles =
    'fixed top-0 z-50 shadow-lg transition-transform duration-200 ease-in-out h-full bg-neutral-50 dark:bg-zinc-850';

  const positionStyles = {
    left: 'left-0',
    right: 'right-0',
  };

  const directionStyles = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
  };

  return (
    <>
      <div
        className={`${baseStyles} ${positionStyles[direction]} ${directionStyles[direction]} ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  );
};

export default SlidePanel;
