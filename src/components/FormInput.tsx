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
      className="w-full px-4 py-3 bg-bg-primary border-2 border-accent-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-secondary transition text-text-primary"
    />
  );
};

export default FormInput;
