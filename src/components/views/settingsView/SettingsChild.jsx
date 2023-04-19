export default function SettingsChild({ icon, label, children }) {
  const Icon = icon;
  return (
    <div className="form-control p-3">
      <label className="label">
        <span className="label-text">
          <Icon className="text-xl" />
          &nbsp;{label}
        </span>
        {children}
      </label>
    </div>
  );
}
