type PageHeaderProps = {
  title: import("react").ReactNode;

  left?: React.ReactNode;
  right?: React.ReactNode;
  containerClassName?: string;
};


export default function PageHeader({
  title,
  left,
  right,
  containerClassName = "max-w-7xl mx-auto px-4 sm:px-6",
}: PageHeaderProps) {
  return (
    <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
      <div className={`${containerClassName} py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3 min-w-0">
          {left}
          <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}

