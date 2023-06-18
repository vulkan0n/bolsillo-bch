export default function SettingsChild({ icon, label, children }) {
  const Icon = icon || (() => null);
  return (
    <div className="p-3">
      <label className="flex items-center"> 
        <span className="label-text flex-1">
          <Icon className="text-xl mr-1" />
          {label}
        </span>
        {children}
      </label>
    </div>
  );
}
