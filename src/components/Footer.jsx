import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">Esports<span>Hub</span></div>
            <div className="footer__desc">University-level esports tournament management. Built for players, managers, and organizers.</div>
          </div>
          <div>
            <div className="footer__col-title">Platform</div>
            <Link to="/tournaments" className="footer__link">Tournaments</Link>
            <Link to="/bracket"     className="footer__link">Brackets</Link>
            <Link to="/schedule"    className="footer__link">Schedule</Link>
            <Link to="/leaderboard" className="footer__link">Leaderboard</Link>
          </div>
          <div>
            <div className="footer__col-title">Account</div>
            <Link to="/signup"  className="footer__link">Sign Up</Link>
            <Link to="/login"   className="footer__link">Sign In</Link>
            <Link to="/profile" className="footer__link">Profile</Link>
          </div>
          <div>
            <div className="footer__col-title">Info</div>
            <a href="#" className="footer__link">Rules</a>
            <a href="#" className="footer__link">Contact</a>
            <a href="#" className="footer__link">GIKI Esports Club</a>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2025 EsportsHub · GIKI CS272 HCI Project</span>
          <span>Team: Qasim · Rehman · Huzaifa · Sohail</span>
        </div>
      </div>
    </footer>
  )
}
