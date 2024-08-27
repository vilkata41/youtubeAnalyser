import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import LoadingComponent from "../Components/LoadingComponent";
import "../Styles/Pages/Dashboard.scss";
import ProgressBar from "../Components/ProgressBar";

/**
 * This is the application's main page upon user authentication. It acts as a "home" page and contains general info
 * about the authenticated user's videos and channel.
 * @returns {JSX.Element} - A container that is either loading (if the fetch is not yet received), or the completed
 * Dashboard component.
 */
export default function DashboardPage(){
    // Initially, hooks in the shape of states that are used by the app are instantiated.
    const navigate = useNavigate();

    /* Some are initialised from sessionStorage to minimise requests and optimise API quota efficiency.
    * If session storage does not contain them, the request will be carried out anyway. */
    const [isLoading, setLoading] = useState(true);
    const [subCount, setSubCount] = useState(sessionStorage.getItem("subCount"));
    const [watchTime, setWatchTime] = useState(sessionStorage.getItem("watchTime"));
    const [lastVideo, setLastVideo] = useState(JSON.parse(sessionStorage.getItem("lastVideo")));
    const [latestVids, setLatestVids] = useState(JSON.parse(sessionStorage.getItem("latestVids")));

    useEffect(() => { // Only do upon component render.
        if(sessionStorage.getItem("isAuthenticated") === "true"){
            setLoading(false);
            // If at least one of the sessionStorage items is not present, we need to make the query to get the info.
            if(!subCount || !watchTime || !lastVideo || !latestVids){
                setLoading(true);
                /*
                * This executes all the fetches needed upon fresh load of the page. Instead of fetching one by one,
                * we fetch altogether which gives an even more pleasant experience because all the data appears at once.
                * */
                const fetchDetails = {
                    method: "POST",
                    headers:{"Content-Type":"application/json"},
                    body: sessionStorage.getItem("token")
                }

                /* The URL for the fetch call is specified by the environment values which could be easily changed
                * upon back-end deployment location change and is also secure by not giving attackers sufficient
                * location information for the back-end.
                 */
                Promise.all([
                    fetch(process.env.REACT_APP_BACKEND_ROOT+"/channelSubscribers", fetchDetails)
                        .then(resp1 =>{ if (resp1.ok) return resp1.json() }),

                    fetch(process.env.REACT_APP_BACKEND_ROOT+"/365watchtime", fetchDetails)
                        .then(resp2 =>{ if (resp2.ok) return resp2.json() }),

                    fetch(process.env.REACT_APP_BACKEND_ROOT+"/lastVidAnalysis", fetchDetails)
                        .then(resp3 => { if (resp3.ok) return resp3.json() }),

                    fetch(process.env.REACT_APP_BACKEND_ROOT+"/top5LatestVideos", fetchDetails)
                        .then(resp4 => { if (resp4.ok) return resp4.json() }),
                ])
                    .then(([subsData,watchTimeData, lastVideo,
                               top5LatestVideosData]) => {
                        /* The results received in the responses are stored both in the session storage, and
                        * the state hooks corresponding to that value.*/
                        sessionStorage.setItem("subCount", subsData.subscriberCount);
                        setSubCount(subsData.subscriberCount);

                        sessionStorage.setItem("watchTime", watchTimeData.minutesWatched);
                        setWatchTime(watchTimeData.minutesWatched);

                        sessionStorage.setItem("lastVideo", JSON.stringify(lastVideo));
                        setLastVideo(lastVideo);

                        sessionStorage.setItem("latestVids", JSON.stringify(top5LatestVideosData));
                        setLatestVids(top5LatestVideosData);

                        setLoading(false);
                    })
                    .catch((err) => {
                        // Upon any errors, the user is navigated to the error page (which notifies the user that
                        // something went wrong and redirects them to the sign-in page).
                        navigate("/error");
                        setLoading(false);
                    });
            }
        }
        else{
            // If the user is NOT authenticated, they are sent to the sign-in page.
            sessionStorage.clear();
            navigate("/signin", {replace:true});
        }

        // upon change of the dependencies mentioned, the DashboardPage component is re-rendered.
    }, [subCount, watchTime, lastVideo, navigate, latestVids]);

    return(
        <>
            {/* If the isLoading state hook is set to true, that means the app is awaiting responses from the
            back-end, so to provide context to the user, a Loading component is generated.*/}
            {isLoading? <LoadingComponent /> : /* Otherwise, the dashboard is presented. */
            <div id={"dashboard"}>
                <h1>Dashboard</h1>

                {/* The first part of the dashboard page contains information about the latest video. */}
                <div className={"nestedDiv"} id={"latestVid"}>
                    <h2>Latest Video Performance</h2>
                    <img src= {lastVideo.thumbnail_URL} alt={"Video Thumbnail"} />
                    <h3 id={"lastestVidTitle"}>{lastVideo.title}</h3>
                    <p className={"metric"}>View count: {lastVideo.views}</p>
                    {/* Since the back-end provides average view duration in seconds, it needs to be converted
                     to the proper format - in this case mm:ss (example: 11:02)*/}
                    <p className={"metric"}>Average View Duration: {Math.floor(lastVideo.AVD/60)}:{(lastVideo.AVD%60)
                        .toLocaleString('en-UK', {minimumIntegerDigits: 2})}</p>
                </div>

                {/* The second part of the dashboard page contains monetization goals for the currently
                authenticated channel. */}
                <div className={"nestedDiv"} id={"monetizationGoals"}>
                    <h2>Monetization Goals</h2>
                    {/* A custom component is created with a specific progress attribute passed. Based on
                     the percentage of the progress, that much of that bar is filled up. */}
                    <ProgressBar progress={((subCount/1000)*100)+"%"}/>
                    <p>{subCount} / 1000 Subscribers</p>
                    <br />
                    <ProgressBar progress={(((watchTime/60)/4000) * 100)+"%"}/>
                    {/* YouTube requires a minimum of 1000 subscribers, and 4000 watch time hours for a channel
                     to be monetizeable. We need to transform the watch time (in minutes) returned by the back-end
                      to watch tme in hours. */}
                    <p>{Math.floor(watchTime/60)} / 4000 Watch Time Hours</p>

                    {/* Based on whether the aforementioned criteria are met, the app presents different messages.
                     Either an encouraging message, or a "congratulations" message.*/}
                    <h3>{(subCount >= 1000 && (watchTime /60) >= 4000)
                        ? "Congratulations! Your channel is monetizable!"
                        : "Keep going, you're doing great!"}</h3>
                </div>

                {/* The third part of the dashboard page contains the 5 best performing videos out of the authenticated
                user's 25 most recently uploaded ones. */}
                <div className={"nestedDiv"} id={"top5"}>
                    <h2 id={"top5Title"}>Best Performing Videos Lately</h2>
                    {/*If the back-end returns an empty list of the top 5 latest videos, the user is presented a
                    meaningful message explaining why this may be happening. Otherwise, the videos are returned
                    in a proper manner.*/}
                    {latestVids.length == 0 ? <p className={"noTop5Warning"}>There seem to be no videos returned by YouTube.
                    Are you sure you have any videos uploaded? If yes, that may be because all your videos were
                    recently uploaded, so there is not enough data for a meaningful report!</p> :
                        latestVids.map(video => {
                        /* The returned by the back-end JSON object has the information regarding those top 5 videos.
                        * The application needs to present the different videos in the same formatting to the user, so
                        * the map() function is used. It allows to take different data but map it to the exact same
                        * structure. The return value is how each video should look based on the information provided.*/
                        return(
                            <div id={video.video_id} key={video.video_id} className={"videoDiv"}
                                 onClick={() => {navigate("/video/"+video.video_id)}}>
                                <img src={video.thumbnail_URL} alt={"Video Thumbnail"} />
                                <h3 className={"videoTitle"}>{video.title}</h3>
                            </div>
                        );
                    })}
                </div>
            </div>
            }
        </>
    );

}