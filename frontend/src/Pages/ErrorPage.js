import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import "../Styles/Pages/ErrorPage.scss";
import wheel from "../Media/loading.png";

/**
 * This component acts as the error page specified in the App component's error mapping.
 * @returns {JSX.Element} - a component that when generated, notifies the user that something went wrong, and
 * redirects them to the sign-in page.
 */
export default function ErrorPage(){
    // setting up the navigate hook to navigate the user to the sign-in page
    const navigate = useNavigate();

    useEffect(() => {
        // After 5 seconds, return to sign in page with the app's session storage fully reset.
        sessionStorage.clear();

        setTimeout(()=>{
            navigate("/signin", {replace:true});
        }, 5000);
    });

    return(
        <div id={"errPage"}>
            <h1>Something went wrong...</h1>
            <p>Apologies for the inconvenience, please, log in again...</p>
            <p>Redirecting you to login page...</p>
            <img className={"rotating"} src={wheel} alt={"loading wheel"}/>
        </div>
    );
}