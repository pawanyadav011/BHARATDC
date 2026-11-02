import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  helpText,
  error,
  children
}) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-[#94A3B8] tracking-wide">
        {label} {required && <span className="text-rose-400 font-bold">*</span>}
      </label>
      {children}
      {helpText && !error && <p className="text-[11px] text-[#64748B]">{helpText}</p>}
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
