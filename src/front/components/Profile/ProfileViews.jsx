//  pinta la tarjeta del usuario
import "./ProfileViews.css";

//componente React que recibe un unico prop: user
export default function ProfileView({ user }) {
  const name  = user?.name  || "Invitado";
  const email = user?.email || "sin-email@example.com";
  const avatar =
    user?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff`;

  return (
    <div className="profile-card">
      <img className="profile-card__avatar" src={avatar} alt="avatar" />
      <div className="profile-card__content">
        <h2 className="profile-card__name">{name}</h2>
        <p className="profile-card__email">{email}</p>
        {user?.country && <span className="profile-card__tag">{user.country}</span>}
        {user?.bio && <p className="profile-card__bio">{user.bio}</p>}
      </div>
    </div>
  );
}
