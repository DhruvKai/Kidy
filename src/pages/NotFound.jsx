import { Link } from 'react-router-dom'
import { img } from '../data/catalog'
import { EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <div className="container-x">
      <EmptyState
        image={img('1907001')}
        title="This page went out to play"
        body="The link may be old or the product may be sold out. Let's get you back to the good stuff."
        action={<div className="flex gap-3"><Link to="/" className="btn-primary">Go home</Link><Link to="/c/new" className="btn-secondary">New arrivals</Link></div>}
      />
    </div>
  )
}
