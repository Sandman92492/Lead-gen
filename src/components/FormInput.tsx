import React from 'react';

interface FormInputProps {
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  ariaLabel,
  disabled = false,
  required = false,
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      aria-label={ariaLabel}
      className="w-full rounded-xl bg-bg-primary border border-border-subtle px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent disabled:opacity-60"
    />
  );
};

export default FormInput;
