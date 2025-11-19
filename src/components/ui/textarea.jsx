import React from 'react'

export const Textarea = React.forwardRef(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
