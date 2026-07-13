import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <section className="page-section page-center">
    <div className="card">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="button button-link">
        Return home
      </Link>
    </div>
  </section>
);

export default NotFoundPage;
