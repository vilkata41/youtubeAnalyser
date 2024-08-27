import AuthButton from "../Components/AuthButton";
import "../Styles/Pages/SignInPage.scss";
import React from "react";

/**
 * The page each user needs to bypass by authentication. It contains a warning about their data, and a big log-in
 * button.
 * @returns {JSX.Element} - the component described above.
 */
function SignInPage(){
    // The closeWarning() function is a handler that hides the warning upon click of the X of the warning container.
    const closeWarning = () => {
        const warningDiv = document.getElementById("dataWarning");
        if(warningDiv){
            warningDiv.style.display = "none";
        }

    }

    return(
        <div>
            <div id={"dataWarning"}>
                <h3>Important information about your data!</h3>
                <p>None of your data will be recorded or stored by this application. However, the data used
                    needs to be analyzed and presented to you. Upon signing in with Google,
                    you agree to share your YouTube data for analysis purposes.</p>
                <div id={"closeDataWarning"} onClick={closeWarning}>X</div>
            </div>
            <h1 className={"initSentence"}>
                Ready to analyse?
            </h1>
            <br/>
            {/* Other than purely informational display, there is a call to the custom component AuthButton,
             which uses the GoogleOauth library to authenticate securely. A className attribute is passed for
             styling purposes. */}
            <AuthButton className={"AuthButton"}/>
        </div>
    );
}

export default SignInPage;