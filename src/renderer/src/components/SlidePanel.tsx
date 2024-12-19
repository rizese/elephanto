import React, { useEffect } from 'react';

type Direction = 'left' | 'right' | 'top' | 'bottom';

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
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const baseStyles =
    'absolute inset-0 z-50 bg-white shadow-lg transition-transform duration-200 ease-in-out';

  const directionStyles = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    top: isOpen ? 'translate-y-0' : '-translate-y-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
  };

  return (
    <>
      <div
        className={`${baseStyles} ${directionStyles[direction]} ${className} dark:bg-zinc-850`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  );
};

export default SlidePanel;
