type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  required?: boolean;
  placeholder?: string;
  step?: string;
};

export function InputField({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
  step,
}: Props) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
