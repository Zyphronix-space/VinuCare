import { useEffect } from 'react';
import TeamDetail from './TeamDetail';
import teamData from './teamData';
import '../../styles/services.css';
import '../../styles/team.css';

function Team({ onNavigate, selectedTeamId, isActive, onBook }) {
  // selectedTeamId comes from the URL (e.g. /team/1) as a string,
  // teamData ids are numbers — compare loosely.
  const activeMember = selectedTeamId
    ? teamData.find((m) => String(m.id) === String(selectedTeamId))
    : null;

  // No id, or an id that doesn't match anyone — there's no team grid
  // page (yet), so just send people back to the team section on Home
  // instead of showing a blank page.
  //
  // Guarded by `isActive`: this component shares the app-wide
  // selectedProductId with other detail pages (services/shop) and stays
  // mounted in the background briefly during navigation, so
  // `selectedTeamId` can flip to something team data doesn't resolve
  // while a *different* page is what's actually on screen. Without the
  // isActive check, that transient state force-navigates home and
  // clobbers whatever navigation the user actually just made (e.g.
  // clicking "Book Now" on a doctor's profile landing on Home instead of
  // Appointments).
  useEffect(() => {
    if (isActive && !activeMember) onNavigate('home');
  }, [isActive, activeMember, onNavigate]);

  if (!activeMember) return null;

  return (
    <div id="page-team" className="page active">
      <TeamDetail
        member={activeMember}
        onBack={() => onNavigate('home')}
        onBookClick={() => onBook(activeMember)}
      />
    </div>
  );
}

export default Team;