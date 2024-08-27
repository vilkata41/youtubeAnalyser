import {googleLogout} from "@react-oauth/google";
import {useNavigate} from "react-router-dom";

/**
 * The sign-out button which is a sub-component of the profile popup, but could be used elsewhere.
 * @param props - the props contain an attribute className, which specifies the CSS class name that would style this
 * sign-out button.
 * @returns {JSX.Element} - a button component which signs out the currently logged-in user from the system.
 */
export default function SignOutButton(props){

    // Setting up the navigate hook, and using the class name prop.
    const navigate = useNavigate();
    const cn = props.className;

    /* The signOut function handles the button's onclick by calling the googleLogout function from the
    * OAuth library, as well as clearing all session storage that may have been saved by the application.
    * This way, no tokens, or video data is stored on the browser.*/
    const signOut = () => {
        googleLogout();
        sessionStorage.clear();
        navigate("/signin");
    }

    return(
        <div className={cn} onClick={() => {signOut()}}>
            Sign Out
        </div>
    );
}