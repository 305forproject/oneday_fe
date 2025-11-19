import React, { useState } from "react";

export const Select = ({ children, value, onValueChange, ...props }) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = (newValue) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
    setOpen(false);
  };

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            open,
            setOpen,
            value,
            setValue: handleValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger = ({
  open,
  setOpen,
  value,
  children,
  className = "",
  // eslint-disable-next-line no-unused-vars
  setValue,
  ...props
}) => {
  // open, setOpen, value, setValue는 내부 로직용이므로 DOM에 전달하지 않음
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value });
        }
        return child;
      })}
    </button>
  );
};

export const SelectValue = ({ placeholder = "", value }) => {
  return (
    <span className={value ? "" : "text-muted-foreground"}>
      {value || placeholder}
    </span>
  );
};

export const SelectContent = ({
  open,
  children,
  className = "",
  // eslint-disable-next-line no-unused-vars
  setOpen,
  // eslint-disable-next-line no-unused-vars
  value,
  setValue,
  ...props
}) => {
  // open, setOpen, value, setValue는 DOM에 전달하지 않음
  return open ? (
    <div
      className={`absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border border-input bg-popover text-popover-foreground shadow-md ${className}`}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { setValue });
        }
        return child;
      })}
    </div>
  ) : null;
};

export const SelectItem = ({
  value: itemValue,
  setValue,
  children,
  className = "",
  ...props
}) => {
  // setValue, value는 DOM에 전달하지 않음
  return (
    <div
      onClick={() => setValue && setValue(itemValue)}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
