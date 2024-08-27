import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import SignOutButton from "./SignOutButton";
import {PopupMenu} from "react-simple-widgets";
import "../Styles/Components/ProfileSettings.scss";
import undefinedPP from "../Media/Undefined_pp.png";

/**
 * This component appears as a picture and when clicked, a popup menu with profile data appears.
 * @returns {JSX.Element} - the profile settings popup component.
 */
export default function ProfileSettings(){
    // The navigate and isLoading hooks are needed.
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);

    /* Other hooks that have already been queried from the back-end are saved in session storage,
    * so we try to access any previously set information. If that is not present, these will be queried later. */
    const [subCount, setSubCount] = useState(sessionStorage.getItem("subCount"));
    const [channelBasics, setChannelBasics] = useState(JSON.parse(sessionStorage.getItem("basics")));

    /* The handleImageError is a handler function, such that if the profile picture (which is using a URL to access
    * the photo) does not load, an undefined profile picture is presented to the viewer. */
    const handleImageError = (err) => {
        err.target.src = undefinedPP;
    }

    /* Upon the component's initial render, proper authentication checks are performed, and if the data needed for this
    * component is not present yet, it is queried from the back-end.*/
    useEffect(() => {
        if(sessionStorage.getItem("isAuthenticated") === "true"){
            setLoading(false);
            if(!subCount || !channelBasics){
                setLoading(true);
                const fetchDetails = {
                    method: "POST",
                    headers:{"Content-type":"application/json"},
                    body: sessionStorage.getItem("token")
                }

                /* Important to note here is that the backend root URL is accessed with the help of environment variables
                * making it very difficult for attackers to track the back-end location. Data queries are done in
                * bulk (similarly to Dashboard queries) to provide an instant loading of the data, instead of bit-by-bit.*/
                Promise.all([
                    fetch(process.env.REACT_APP_BACKEND_ROOT + "/channelBasics", fetchDetails)
                        .then(resp1 => {if(resp1.ok) return resp1.json()}),
                    fetch(process.env.REACT_APP_BACKEND_ROOT + "/channelSubscribers", fetchDetails)
                        .then(resp2 =>{if(resp2.ok) return resp2.json()})
                ])
                    .then(([basicsData, subsData]) => {
                        /* If the query was successful, the proper data is stored adequately - in session storage
                        * to avoid farther queries, and as the state hooks to update the component's data. */
                        sessionStorage.setItem("subCount", subsData.subscriberCount);
                        setSubCount(subsData.subscriberCount);

                        sessionStorage.setItem("basics", JSON.stringify(basicsData));
                        setChannelBasics(basicsData);

                        setLoading(false);
                    })
                    .catch(err => {
                        // If an error had occurred, reset the app, and redirect the user to the sign-in page.
                        sessionStorage.clear();
                        navigate("/signin");
                        setLoading(false);
                    })
            }

        }
        else{
            // If the user is NOT properly authenticated, they are sent to the sign-in page.
            sessionStorage.clear();
            navigate("/signin", {replace:true});
        }
    }, [subCount, channelBasics, navigate]);

    return(
        <>
            {/* If still awaiting the query responses, do not generate the popup. */}
            {isLoading ? <div id={"imageButton"}></div> : // Otherwise, present the popup menu
                /* PopupMenu is a wrapper component defined in the used library react-simple-widgets. It takes in two
                * children - the initial button (in our case the div containing the profile picture), and another div
                * containing the popup menu after the button has been clicked. */
                <PopupMenu>
                    <div id={"imageButton"}>
                        <img src={channelBasics.profile_picture_URL} alt={"Channel Pic"}
                        onError={(err) => handleImageError(err)}/>
                    </div>
                    <div id={"optionsMenu"}>
                        {/* The options menu contains general profile basics like channel name, subscriber count,
                        and two buttons - one to the channel on YouTube, and one button to sign out. */}
                        <p className={"channelName"}>{channelBasics.channel_name}</p>
                        <p className={"subCount"}>{subCount} {subCount > 1 ? "Subscribers" : "Subscriber"}</p>
                        <div id={"viewChannel"} onClick={() =>{
                            window.open("https://youtube.com/channel/"+channelBasics.channelID,"_blank");
                        }}>
                            View Channel
                        </div>
                        {/* The sign-out button is a simple custom component that when pressed, signs out the user
                        from the system. */}
                        <SignOutButton className={"signOut"} />
                    </div>
                </PopupMenu>
            }
        </>
    );
}