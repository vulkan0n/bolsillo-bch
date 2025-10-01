interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export default function Card({ className = undefined, children }: CardProps) {
  return (
    <div
      className={`p-2 bg-primary-100 dark:bg-primarydark-200 text-neutral- dark:text-neutral-100 border border-primary-700 dark:border-primarydark-700 rounded-lg shadow ${className}`}
    >
      {children}
    </div>
  );
}
