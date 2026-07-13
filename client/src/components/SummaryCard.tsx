interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
}

const SummaryCard = ({ title, value, subtitle }: SummaryCardProps) => (
  <article className="card summary-card organizer-summary-card">
    <h3>{title}</h3>
    <strong>{value}</strong>
    <p>{subtitle}</p>
  </article>
);

export default SummaryCard;
