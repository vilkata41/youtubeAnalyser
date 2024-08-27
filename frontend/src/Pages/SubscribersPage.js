import {useEffect, useState} from "react";
import LoadingComponent from "../Components/LoadingComponent";
import {useNavigate} from "react-router-dom";
import "../Styles/Pages/Subscribers.scss";
import undefinedPP from "../Media/Undefined_pp.png";

/**
 * The subscribers page is usually navigated to from the React Browser Router specified in the App component. It shows
 * the most relevant subscribers for the currently authenticated channel.
 * @returns {JSX.Element} - a page component showing the 20 most relevant subscribers of the channel authenticated.
 */
export default function SubscribersPage(){
    // Initially, all hooks needed in the page are instantiated
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState(true);
    /* The subscribers hook is instantiated from sessionStorage, because if this request has already been
    * made, there would be no need to waste API quota. */
    const [subscribers, setSubscribers] = useState(JSON.parse(sessionStorage.getItem("subscribers")));

    /* Sometimes, when trying to access profile pictures of channels on YouTube, an error could occur and the
    * image would appear as empty. Hence, the handleImageError handles that issue by providing a pre-designed
    * "undefined profile picture." */
    const handleImageError = (err) => {
        err.target.src = undefinedPP;
    }

    /* Upon loading of the page component, all the necessary checks are performed (authentication, and whether
    * there would be a need to query data from the back-end), and if a query needs to be done, it is executed. */
    useEffect(() => {
        if(sessionStorage.getItem("isAuthenticated") === "true"){
            setLoading(false);
            if(!subscribers){
                setLoading(true);
                /* The URL for the fetch call is specified by the environment values which could be easily changed
                * upon back-end deployment location change and is also secure by not giving attackers sufficient
                * location information for the back-end.
                 */
                fetch(process.env.REACT_APP_BACKEND_ROOT+"/top20Subs", {
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:sessionStorage.getItem("token")
                })
                    .then(resp => {
                        if(resp.ok) return resp.json()
                        else{
                            navigate("/error");
                            setLoading(false);
                        }
                    })
                    .then(data => {
                        // Upon a successful query, the data is saved in sessionStorage and hooks appropriately.
                        sessionStorage.setItem("subscribers",JSON.stringify(data));
                        setSubscribers(data);
                        
                        setLoading(false);
                    })
                    .catch((err) => {
                        // If any errors occur, the user is navigated to the error page.
                        navigate("/error");
                        setLoading(false);
                    })
            }
        }
        else{
            // If the user is not authenticated, they are redirected to the sign-in page.
            navigate("/signin");
            setLoading(false);
        }
        // Upon change of navigate or subscribers, the component is re-rendered to make the needed changes.
    }, [navigate, subscribers]);

    return(
        <>
            {/* If still awaiting a response from the back-end, present the loading component to the user. */}
            {isLoading? <LoadingComponent /> : // Otherwise, show the subscribers page with relevant information.
            <div id={"subscribers"}>
                <h1>Most Relevant Subscribers</h1>
                {/*If the back-end returns no relevant subscribers, the message displayed is based around context.
                 If the back-end does return at least 1 relevant subscriber, the message is different.*/}
                {subscribers.length == 0 ? <p className={"noSubsWarning"}>Unfortunately, there seem to be no relevant
                subscribers to your channel. Try to expand your reach!</p>:
                    <p id={"subsSentence"}>Why not collab with some of them?</p>}
                    {
                        subscribers.map(sub => {
                            /* Each subscriber needs to appear identically in a visual manner. The only differences between
                            * subscriber objects would have to be specific channel data like profile picture, name, and
                            * subscriber counts. That is easily done with the help of the map function, which returns
                            * nearly identical objects, varying only in data contained within them.*/
                            return(
                                <a key={sub.channelID} href={"https://youtube.com/channel/"+sub.channelID} target={"_blank"} rel={"noreferrer"}>
                                    <div className={"subscriber"}>
                                        <img src={sub.profile_picture_URL} alt={"Channel Pic"}
                                             onError={(err) => {handleImageError(err)}}/>
                                        <p className={"listedChannelName"}>{sub.channel_name}</p>
                                        <p className={"listedSubCount"}>{sub.sub_count} subscribers</p>
                                    </div>
                                </a>
                            );
                        })
                    }
            </div>

            }
        </>
    );

}