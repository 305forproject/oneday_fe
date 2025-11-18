import React from 'react'

export const Avatar = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary ${className}`}
    {...props}
  />
))
Avatar.displayName = 'Avatar'

export const AvatarImage = React.forwardRef(({ className = '', ...props }, ref) => (
  <img ref={ref} className={`aspect-square h-full w-full object-cover ${className}`} {...props} />
))
AvatarImage.displayName = 'AvatarImage'

export const AvatarFallback = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-medium ${className}`}
    {...props}
  />
))
AvatarFallback.displayName = 'AvatarFallback'
