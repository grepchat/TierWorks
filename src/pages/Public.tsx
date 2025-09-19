import { Link } from 'react-router-dom'
import { publicTemplates } from '../publicTemplates'

export default function PublicTemplates() {
  function truncate(text: string, max = 28) {
    return text.length > max ? text.slice(0, max - 1) + '…' : text
  }
  return (
    <div>
      <h1>Публичные тир-листы</h1>
      <div className="tw-grid" style={{ marginTop: 12 }}>
        {publicTemplates.map(t => (
          <Link key={t.id} to={`/public/${t.id}`} className="tw-card-link">
            <div className="tw-card">
              <img
                src={t.coverUrl}
                alt={t.name}
                className="card-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/public/logo.svg' }}
              />
              <h2 title={t.name}>{truncate(t.name)}</h2>
              <p>{t.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

