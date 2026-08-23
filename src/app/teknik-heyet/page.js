import { db } from '@/lib/db';

export const revalidate = 10;

export default async function TechnicalStaff() {
  const staff = await db.all('SELECT * FROM technical_staff WHERE status = "active" ORDER BY display_order ASC, name ASC');

  return (
    <section className="section staff-page">
      <div className="container">
        <h1 className="section-title">Teknik Kadro</h1>
        <p className="page-subtitle">
          A takımımızı hedeflerine ulaştırmak için perde arkasında büyük özveri ile çalışan teknik heyetimiz.
        </p>

        <div className="grid-3 staff-grid">
          {staff.map((member) => (
            <div key={member.id} className="card staff-card">
              <div className="card-img-wrapper" style={{ aspectRatio: '1/1' }}>
                <img src={member.image_url} alt={member.name} className="card-img" style={{ objectPosition: 'top' }} />
              </div>
              <div className="card-body">
                <div className="staff-role-badge">
                  {member.role}
                </div>
                <h3 className="card-title staff-name">{member.name}</h3>
                {member.biography && (
                  <p className="card-text staff-bio">{member.biography}</p>
                )}
              </div>
            </div>
          ))}
          {staff.length === 0 && (
            <p className="empty-state">Teknik kadro bilgisi bulunmamaktadır.</p>
          )}
        </div>
      </div>
    </section>
  );
}
