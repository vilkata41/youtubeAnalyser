import "../Styles/Components/SessionRenewer.scss";
import {useGoogleLogin} from "@react-oauth/google";
import {useNavigate} from "react-router-dom";

/**
 * The session renewer popup window which appears 50 seconds before the user's session expires.
 * @returns {JSX.Element} - the session renewal window component.
 */
export default function SessionRenewer() {
    const navigate = useNavigate();

    // The login logic used here is the same as the one used in the AuthButton component.
    const renewSession = useGoogleLogin({
        // IMPLICIT FLOW!
        scope: "https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/yt-analytics-monetary.readonly https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtubepartner-channel-audit https://www.googleapis.com/auth/youtube.force-ssl",
        onSuccess: resp => {
            // Clearing all storage, because the user may choose to log in with a different account on the refresh.
            sessionStorage.clear();
            if (resp.access_token){
                sessionStorage.setItem("token",JSON.stringify(resp));
                sessionStorage.setItem("isAuthenticated","true");
                navigate("/", {replace: true});
                document.getElementById("sessionRenewerContainer").style.display = "none";

                const tokenTime = 3550*1000;
                const reminderTime = 3500*1000;

                const tokenExpiryTime = Date.now() + tokenTime;
                const reminderPopUpTime = Date.now() + reminderTime;

                sessionStorage.setItem("tokenExpiryTime", tokenExpiryTime);
                sessionStorage.setItem("reminderPopUpTime", reminderPopUpTime);

                /*
                * We need the user to re-authenticate every hour because the Google authentication
                * token lasts 3600 seconds (1 hour). We need to renew that to allow api queries for the backend.
                * */
                setTimeout(() => {
                    sessionStorage.clear();
                    navigate("/signin");
                }, tokenTime);

                /*
                 * This generates a popup reminder that the user's session is about to expire.
                 * That's done 50 seconds before the token expiration.
                 */
                setTimeout(() => {
                    document.getElementById("sessionRenewerContainer").style.display = "grid";
                }, reminderTime);

                // Refreshing the page so that the new data comes in the application.
                window.location.reload();
            }
            else sessionStorage.setItem("isAuthenticated","false");

        },
        onError: errorResponse => sessionStorage.clear(),
    });

    return(
        <div id={"sessionRenewerContainer"}>
            <p>Your session expires soon!</p>
            {/* The user can choose to either ignore the warning and close it, or extend their session. If the container
            is not closed, it will stay on the screen until either the session expires, or the user takes an action of
            the two that have been provided.*/}
            <div className={"renewerButton"} onClick={() =>{
                document.getElementById("sessionRenewerContainer").style.display = "none";
            }}>Close</div>
            <div className={"renewerButton"} onClick={renewSession}>Renew</div>
        </div>
    );
}