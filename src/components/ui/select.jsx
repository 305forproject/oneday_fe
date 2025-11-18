import React, { useState } from 'react'

export const Select = ({ children, ...props }) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  return <div {...props}>{React.Children.map(children, (child) => React.cloneElement(child, { open, setOpen, value, setValue }))}</div>
}

export const SelectTrigger = ({ open, setOpen, children, className = '', ...props }) => (
  <button
    onClick={() => setOpen(!open)}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
)

export const SelectValue = ({ placeholder = '', ...props }) => <span className="text-muted-foreground" {...props}>{placeholder}</span>

export const SelectContent = ({ open, children, className = '', ...props }) =>
  open ? (
    <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-input bg-popover text-popover-foreground shadow-md ${className}`} {...props}>
      {children}
    </div>
  ) : null

export const SelectItem = ({ value, setValue, children, className = '', ...props }) => (
  <div
    onClick={() => setValue(value)}
    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </div>
)
