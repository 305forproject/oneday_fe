import React from 'react'

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
}

const sizeVariants = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-8 text-base',
  icon: 'h-10 w-10',
}

export const Button = React.forwardRef(({ className = '', variant = 'default', size = 'default', ...props }, ref) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${buttonVariants[variant]} ${sizeVariants[size]} ${className}`}
    ref={ref}
    {...props}
  />
))
Button.displayName = 'Button'
