interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export default function Card({ className = undefined, children }: CardProps) {
  return (
    <div
      className={`p-2 bg-primary-100 border border-primary-700 rounded-lg shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
