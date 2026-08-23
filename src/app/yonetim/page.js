import { db } from '@/lib/db';

export const revalidate = 10;

export default async function Management() {
  const managers = await db.all('SELECT * FROM management ORDER BY display_order ASC, name ASC');

  return (
    <section className="section management-page">
      <div className="container">
        <h1 className="section-title">Yönetim Kurulu</h1>
        <p className="page-subtitle">
          Kulübümüzün idari ve mali liderliğini üstlenen, geleceğe yön veren yönetim kurulu üyelerimiz.
        </p>

        <div className="grid-4 management-grid">
          {managers.map((manager) => (
            <div key={manager.id} className="card manager-card">
              <div className="card-img-wrapper" style={{ aspectRatio: '1/1' }}>
                <img src={manager.image_url} alt={manager.name} className="card-img" style={{ objectPosition: 'top' }} />
              </div>
              <div className="card-body text-center" style={{ textAlign: 'center' }}>
                <h3 className="card-title manager-name">{manager.name}</h3>
                <p className="manager-role" style={{ color: 'var(--secondary-color)', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>
                  {manager.role}
                </p>
              </div>
            </div>
          ))}
          {managers.length === 0 && (
            <p className="empty-state">Yönetim kurulu bilgisi bulunmamaktadır.</p>
          )}
        </div>
      </div>
    </section>
  );
}
