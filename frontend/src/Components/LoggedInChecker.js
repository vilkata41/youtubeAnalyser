import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

/**
 * <b>Try to avoid use of this component!</b> This component used to be an additional component which acted as
 * proof for authenticity of the token provided for API requests. However, it is not quota-efficient, so try to avoid
 * using it, unless avoidance is impossible.
 * @returns {JSX.Element} - an empty component which only has functionality checking whether the user is currently logged
 * in the application.
 */
export default function LoggedInChecker(){ // This component is empty. It only checks if a user is logged in.

    const navigate = useNavigate();

    useEffect(() => {
        if(sessionStorage.getItem("isAuthenticated") === "true"){
            /*
            If an attacker tries to fake authentication for system access, we make a basic
            back-end call to see if the token provided is valid.
            If it's not, we return to the sign-in page without allowing access to the system.
            * */

            const fetchParams = {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:sessionStorage.getItem("token")
            }
            // Here, the root is accessed from the environment variables, making it difficult for attackers to locate
            // the server.
            fetch(process.env.REACT_APP_BACKEND_ROOT+"/channelBasics", fetchParams)
                .then(resp => {
                    if(!resp.ok) {
                        navigate("/signin", {replace: true});
                        sessionStorage.clear();
                    }
                })
                .catch(() => {
                    navigate("/signin", {replace: true});
                    sessionStorage.clear();
                })
            // If there were any issues, sign in!
        }


        else{ // if not authenticated, go to sign in.
            navigate("/signin", {replace: true});
            sessionStorage.clear();
        }
    });
    return(
        // empty component.
        <></>
    );
}