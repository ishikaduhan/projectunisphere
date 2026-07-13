interface ErrorPageProps {
  message: string;
}

const ErrorPage = ({ message }: ErrorPageProps) => (
  <section className="page-center">
    <div className="card error-card">
      <h2>Something went wrong</h2>
      <p>{message}</p>
    </div>
  </section>
);

export default ErrorPage;
