import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import "../Styles/Pages/VideoAnalysis.scss";
import LoadingComponent from "../Components/LoadingComponent";
import RetentionGraph from "../Components/RetentionGraph";
import VidStatistics from "../Components/VidStatistics";

/**
 * The page routed to "/videos/:id", where :id is different for each video. That is usually specified from the
 * VideosPage component and the Dashboard component.
 * @returns {JSX.Element} - a component presenting information for a video with the id specified in the URL parameters.
 * Contains information such as retention, engagement statistics, watch time duration, improvement advice, and more.
 */
export default function VideoAnalysisPage(){

    // Initially, all the hooks needed are instantiated.
    const navigate = useNavigate();
    const [vidData, setVidData] = useState(null);
    /* Since there are 2 analysis components that are presented in the same div, and each of them is presented based on
    * what button has last been pressed, we need a state for that. The default box is video retention. */
    const [currentAnalysis, setCurrAnalysis] = useState("retention");
    // This parameter is the ":id" part from the URL.
    const {id} = useParams();


    useEffect(() =>{
        /* Since this page is only navigated by the application and users cannot navigate to it by url, use of the
        * isAuthenticated state hook is unnecessary. Authentication checks are performed by the query itself.
        * If a user has an invalid or expired token, the query will be unsuccessful. */
        if(!vidData){
            const fetchDetails = {
                method: "POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    token:JSON.parse(sessionStorage.getItem("token")),
                    video_id:id
                })
            }

            /* The URL for the fetch call is specified by the environment values which could be easily changed
                * upon back-end deployment location change and is also secure by not giving attackers sufficient
                * location information for the back-end.
                 */
            fetch(process.env.REACT_APP_BACKEND_ROOT+"/vidAnalysis",fetchDetails)
                .then(resp => {
                    if(resp.ok) return resp.json();
                })
                .then(data => {
                    // If the fetch was successful, the video data is stored and then generated appropriately.
                    setVidData(JSON.stringify(data));
                })
                .catch((err) => {
                    /* If an error occurred, the user is redirected to their videos page, and the current URL is not
                    * remembered by their browser. If there are any issues with their authentication or token,
                    * they will be checked on the videos page and dealt with appropriately. */
                    setTimeout(()=>{
                        navigate("/videos", {replace: true})
                    }, 5000)
                })
        }

    });

    /* The retentionHandle function is a button handler for the analysis box, specifically - for the retention button.
    * It changes the currentAnalysis state hook to the "retention" value, and deals with styling appropriately.
    * The currentAnalysis state is then used in the component render. */
    const retentionHandle = () => {
        if(currentAnalysis !== "retention"){
            setCurrAnalysis("retention");

            const rButton = document.getElementById("retentionButton");
            const sButton = document.getElementById("statsButton");

            rButton.style.backgroundColor = "#6495ed";
            rButton.style.color = "black";

            sButton.style.backgroundColor = "#2C3E50";
            sButton.style.color = "white";
        }
    }

    /* The statisticsHandle function is a button handler for the analysis box, specifically - for the statistics button.
    * It changes the currentAnalysis state hook to the "statistics" value, and deals with styling appropriately.
    * The currentAnalysis state is then used in the component render. */
    const statisticsHandle = () => {
        if(currentAnalysis !== "statistics"){
            setCurrAnalysis("statistics");

            const rButton = document.getElementById("retentionButton");
            const sButton = document.getElementById("statsButton");

            sButton.style.backgroundColor = "#6495ed";
            sButton.style.color = "black";

            rButton.style.backgroundColor = "#2C3E50";
            rButton.style.color = "white";
        }
    }

    return(
        <>
            {/* If the video data query has populated the vidData state hook, we present the analysis page. */}
            {vidData ?
                <div className={"videoAnalysisDiv"}>
                    {/* This header warning is only presented if the privacy of the video is not public. Otherwise,
                    nothing is generated in the spot for that warning.*/}
                    {JSON.parse(vidData).privacy !== "public" ?
                        <h1 id={"notPublicWarning"}>This video is not public, so take the analysis with a grain of salt!</h1>
                        : <></>}
                    <div>
                        {/* This container has general video data acting as an introduction to the video. It is
                         presented very similarly to the way the most recent video's performance is on the dashboard
                         page.*/}
                        <h1>{JSON.parse(vidData).title}</h1>
                        <p>View count: {JSON.parse(vidData).viewCount}</p>
                        <p>Average view duration: {Math.floor(JSON.parse(vidData).averageViewDuration/60)}
                            :{(JSON.parse(vidData).averageViewDuration%60)
                                .toLocaleString('en-UK', {minimumIntegerDigits: 2})}</p>
                    </div>
                    <img src={JSON.parse(vidData).thumbnailURL} alt={"thumbnail"}/>
                    <div className={"statsAndTips"}>
                        {/* The second container has 2 separate containers - the interactively changeable analyser box,
                         and the advice presented underneath.*/}
                        <h2>Video Analysis</h2>
                        <div id={"analyserBox"}>
                            {/* Buttons for content within the analyser box are instantiated. Each of them changes the
                             component rendered within that box. */}
                            <div className={"analysisButton"} id={"retentionButton"} onClick={retentionHandle}>Retention</div>
                            <div className={"analysisButton"} id={"statsButton"} onClick={statisticsHandle}>Statistics</div>
                            <div id={"analysisContainer"}> {
                                /* If the state hook currentAnalysis has been set to "retention", the retention graph
                                * component is presented to the user. Otherwise, it is set to "statistics", hence,
                                * the video statistics component is presented. */
                                currentAnalysis==="retention" ? RetentionGraph({vidData})
                                    : VidStatistics({vidData})}
                            </div>
                        </div>
                        <div className={"specificAdvice"}>
                            <h3>Improvement advice:</h3>
                            {/* If there is advice returned by the back-end, an unordered list is instantiated
                            and populated with the help of the map() function, which makes similar list elements with
                            the only varying bits being the actual data within them. */}
                            {JSON.parse(vidData).advice[0] ?
                                <ul>
                                    {JSON.parse(vidData).advice.map((piece,i) =>{
                                        return(<li key={i}>{piece}</li>);
                                    })}
                                </ul>
                                /* If there is no advice returned by the back-end, this means the video statistics
                                * do not cross any thresholds classifying the video as "needing improvement". */
                            : <h4>No advice, your video appears to be great!</h4>}

                        </div>
                    </div>
                </div>
                /* If the video data query has not yet populated the vidData state hook, we present a loader. */
                : <LoadingComponent/>}

        </>
    );
}