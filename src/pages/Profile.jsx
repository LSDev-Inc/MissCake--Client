import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="page-container py-10">
      <div className="mx-auto max-w-xl card p-6">
        <h1 className="mb-4 text-2xl font-bold">Profilo</h1>
        {user ? (
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Username:</span> {user.username}</p>
            <p><span className="font-semibold">Email:</span> {user.email}</p>
            <p><span className="font-semibold">Ruolo:</span> {user.role}</p>
          </div>
        ) : (
          <p>Utente non autenticato.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;