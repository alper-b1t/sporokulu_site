import { db } from '@/lib/db';

export const revalidate = 0;

export default async function SportsBranches() {
  const branches = await db.all('SELECT * FROM sports ORDER BY display_order ASC, name ASC');

  return (
    <section className="section branches-page">
      <div className="container">
        <h1 className="section-title">Spor Branşlarımız</h1>
        <p className="page-subtitle">
          Kulübümüzün aktif olarak mücadele ettiği, yerel ve uluslararası arenalarda şanlı tarihimizi temsil eden spor branşlarımız.
        </p>

        <div className="grid-3 branches-grid">
          {branches.map((branch) => (
            <div key={branch.id} className="card branch-card">
              <div className="card-img-wrapper">
                <img src={branch.image_url} alt={branch.name} className="card-img" />
              </div>
              <div className="card-body">
                <h3 className="card-title">{branch.name}</h3>
                <p className="card-text">{branch.description}</p>
              </div>
            </div>
          ))}
          {branches.length === 0 && (
            <p className="empty-state">Henüz branş bilgisi eklenmemiştir.</p>
          )}
        </div>
      </div>
    </section>
  );
}
