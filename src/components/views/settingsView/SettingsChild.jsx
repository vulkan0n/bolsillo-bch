export default function SettingsChild({ icon, label, children }) {
  const Icon = icon || (() => null);
  return (
    <div className="form-control p-3">
      <label className="label">
        <span className="label-text flex-1">
          <Icon className="text-xl mr-1" />
          {label}
        </span>
        {children}
      </label>
    </div>
  );
}
