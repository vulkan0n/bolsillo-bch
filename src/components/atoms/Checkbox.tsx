interface CheckboxProps {
  checked: boolean;
  onChange: (event) => void;
}

export default function Checkbox({ checked, onChange }: CheckboxProps) {
  return <input type="checkbox" checked={checked} onChange={onChange} />;
}
