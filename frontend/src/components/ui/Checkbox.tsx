import React, { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  helperText?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="font-medium text-gray-700">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        {helperText && <p className="text-gray-500">{helperText}</p>}
      </div>
    </div>
  );
};

export default Checkbox;
