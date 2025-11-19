import React, { useState, createContext, useContext } from "react";
import { cn } from "../../lib/utils";

const PopoverContext = createContext();

export const Popover = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger = ({ children, asChild, className, ...props }) => {
  const { open, setOpen } = useContext(PopoverContext);

  const handleClick = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ...props,
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export const PopoverContent = ({
  children,
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) => {
  const { open, setOpen } = useContext(PopoverContext);

  if (!open) return null;

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      {/* 팝오버 콘텐츠 */}
      <div
        className={cn(
          "absolute z-50 mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          alignmentClasses[align],
          className
        )}
        style={{ top: `calc(100% + ${sideOffset}px)` }}
        {...props}
      >
        {children}
      </div>
    </>
  );
};

export const PopoverAnchor = ({ children }) => {
  return <>{children}</>;
};
