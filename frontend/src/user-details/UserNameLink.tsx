// frontend/src/user-details/UserNameLink.tsx
import { useUserDetails } from "./UserDetailsContext";

type Props = {
    userId: string;
    username: string;
};

export function UserNameLink({ userId, username }: Props) {
    const { openUser } = useUserDetails();

    return (
        <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => openUser(userId)}
        >
            {username}
        </button>
    );
}