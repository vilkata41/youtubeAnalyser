import "../Styles/Components/VidStatistics.scss";

/**
 * A component that usually populates the statistics container in VideoAnalysisPage. Could be re-used elsewhere.
 * @param props - the needed prop here is an attribute vidData, which contains statistics for the video currently analysed.
 * It is a JSON object presented as a string.
 * @returns {JSX.Element} - a component containing engagement rate, average watch time, and card clicks for a given video.
 */
export default function VidStatistics(props){
    // The video data is parsed, so that it is easily accessible in the return statement of this component.
    const vidInfo = JSON.parse(props.vidData);

    return(
        <div className={"statsContainer"}>
            <div className={"statistic"}>
                {/* Converting engagement rate to the appropriate shape (e.g. from 0.54 to 54%) */}
                <h3>Engagement Rate</h3> <p>{Math.round(vidInfo.engagementCount/vidInfo.viewCount*100*100)/100}%</p>
            </div>
            <div className={"statistic"}>
                {/* Converting average watch time to the appropriate shape (e.g. 11:04) */}
                <h3>Average Watchtime</h3> <p>{Math.floor(vidInfo.averageViewDuration/60)}:{(vidInfo.averageViewDuration%60)
                    .toLocaleString('en-UK', {minimumIntegerDigits: 2})} ({Math.round(vidInfo.averageViewPercentage * 100)/100}%)</p>
            </div>
            <div className={"statistic"}>
                {/* Converting card click rate to the appropriate shape (e.g. from 0.02 to 2%) */}
                <h3>Card Clicks</h3> <p>{Math.round(vidInfo.cardClickRate*100*100)/100}%</p>
            </div>
        </div>

    );
}