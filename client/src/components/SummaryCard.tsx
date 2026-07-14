interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
}

const SummaryCard = ({ title, value, subtitle }: SummaryCardProps) => (
  <article className="glass-card rounded-[1.25rem] border border-outline-variant p-6 shadow-sm min-h-[150px] flex flex-col justify-between">
    <div>
      <p className="text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">{title}</p>
      <p className="text-3xl font-semibold text-primary">{value}</p>
    </div>
    <p className="text-sm text-on-surface-variant mt-4 leading-relaxed">{subtitle}</p>
  </article>
);

export default SummaryCard;
