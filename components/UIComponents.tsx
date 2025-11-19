
import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-chakra border border-gray-100 dark:border-gray-700 p-5 transition-colors duration-300 ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-4">
        {title && <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  isLoading, 
  icon,
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-3",
    lg: "px-6 py-4 text-lg"
  };

  const variants = {
    primary: "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-lg shadow-primary-500/30",
    secondary: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500",
    outline: "border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500",
    ghost: "text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 focus:ring-primary-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-lg shadow-red-500/30"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
    <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
        <input 
            className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 ${className}`}
            {...props}
        />
    </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, className = '', ...props }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
        <select 
            className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all appearance-none ${className}`}
            {...props}
        >
            {children}
        </select>
    </div>
);

interface WheelPickerProps {
  items: { label: string, value: string | number }[];
  selectedValue: string | number;
  onValueChange: (val: any) => void;
  height?: number;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({ items, selectedValue, onValueChange, height = 200 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemHeight = 40; // px
    const isScrolling = useRef(false);

    useEffect(() => {
        if (containerRef.current) {
            const index = items.findIndex(i => i.value == selectedValue);
            if (index !== -1 && !isScrolling.current) {
                containerRef.current.scrollTop = index * itemHeight;
            }
        }
    }, [selectedValue, items]); 

    const handleScroll = () => {
        if (containerRef.current) {
             isScrolling.current = true;
             const scrollTop = containerRef.current.scrollTop;
             const index = Math.round(scrollTop / itemHeight);
             if (items[index] && items[index].value !== selectedValue) {
                 onValueChange(items[index].value);
             }
             // Reset scrolling flag after short delay
             setTimeout(() => isScrolling.current = false, 150);
        }
    };

    return (
        <div className="relative w-full overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300" style={{ height: `${height}px` }}>
            {/* Selection Highlight */}
            <div 
                className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-t border-b border-primary-300 dark:border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 pointer-events-none z-10"
                style={{ height: `${itemHeight}px` }}
            />
            
            <div 
                ref={containerRef}
                className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar py-[calc(50%-20px)]"
                onScroll={handleScroll}
            >
                {items.map((item, i) => (
                    <div 
                        key={i} 
                        className={`h-[40px] flex items-center justify-center snap-center text-sm transition-all duration-150 ${item.value == selectedValue ? 'font-bold text-primary-600 dark:text-primary-400 text-lg scale-110' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  percentage: number;
  color?: string;
  children?: ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  size = 180, 
  strokeWidth = 15, 
  percentage, 
  color = "text-primary-500",
  children 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full" width={size} height={size}>
        {/* Background Circle */}
        <circle
          className="text-gray-100 dark:text-gray-700 transition-colors duration-300"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export const MarkdownText: React.FC<{ text: string, className?: string }> = ({ text, className = '' }) => {
  // Simple parser for **bold** text
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
