
type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
};

export function ColorPicker({ label, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-gray-600">{label}</span>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
