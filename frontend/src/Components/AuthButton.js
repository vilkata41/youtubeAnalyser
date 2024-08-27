import {useGoogleLogin} from "@react-oauth/google";
import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Components/AuthButton.scss";
import googleImg from "../Media/googlelogo.png";

/**
 * The button component used in SignInPage. It provides a secure authentication mechanism to users.
 * @param props - a CSS styling class name for that object.
 * @returns {JSX.Element} - the authentication button component.
 */
function AuthButton(props) {
    // setting up navigate hook and getting the className prop.
    const navigate = useNavigate();
    const cssClassName = props.className;

    // using google's oauth 2.0 by specifying scope, an on success function, and an on failure function.
    const login = useGoogleLogin({
        // IMPLICIT FLOW!
        scope: "https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/yt-analytics-monetary.readonly https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtubepartner-channel-audit https://www.googleapis.com/auth/youtube.force-ssl",
        // Scope specifies what API data points can be reached by this token.
        onSuccess: resp => {
            if (resp.access_token){
                /* If authentication was successful and the response has an access token,
                * we store that token and the authentication boolean. Then, the user is sent to the home page. In this
                * case, that is the dashboard page. */
                sessionStorage.setItem("token",JSON.stringify(resp));
                sessionStorage.setItem("isAuthenticated","true");
                navigate("/", {replace: true});

                /* Timers for token expiry and session renew reminders are set up appropriately.
                * Since the token lasts 60 minutes, we set it up for a little under that just to be sure we never use
                * an old token for requests. The reminder appears 50 seconds before the session expires.*/
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
                }, tokenTime)

                /*
                 * This generates a popup reminder that the user's session is about to expire.
                 * That's done 50 seconds before the token expiration.
                 */
                setTimeout(() => {
                    document.getElementById("sessionRenewerContainer").style.display = "grid";
                }, reminderTime);
            }
            else sessionStorage.setItem("isAuthenticated","false");

        },
        onError: errorResponse => sessionStorage.setItem("isAuthenticated","false"),
    });

    return(
        <div>
            {/* The body of the button is simple - it has text, the Google logo, and is styled with the
            prop-provided class name for the css class. The on click function allows a user to log in securely. */}
            <div className={cssClassName} onClick={() => login()}>
                <p>Sign in with</p> <img id={"googleSignInImage"} src={googleImg} alt={"google logo"}/>
            </div>
        </div>
    );
}

export default AuthButton;