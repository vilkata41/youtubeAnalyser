import "../Styles/Components/RetentionGraph.scss";
import {LineChart} from "@mui/x-charts";

/**
 * This component contains a retention graph after being provided the needed data. Done with the help of the MUI
 * library. There are several descriptions as to what each of the axes shows and what pieces of information are
 * being derived.
 * @param props - contains an attribute vidData which is a stringified JSON object containing overtime video data.
 * @returns {JSX.Element} - the retention graph component.
 */
export default function RetentionGraph(props){
    // Access the video data provided and turn it into an iterable and accessible JSON object.
    const vidInfo = JSON.parse(props.vidData);

    /* The back-end sends 2 lists with overtime data - relative retention performance and average watch duration.
    * Both of these are retention statistics. The overtime metrics are 1 piece of data per 1% of the video.
    * In our case, we are looking for every 5th percent for both the overtime metrics. So, we create two number arrays
    * of the data presented (in the form of fractions) and convert those to % by multiplying by 100.
    * The two of those arrays are then used by the chart component.*/
    const relativePerformanceRatio = [
        vidInfo.relativeRetentionPerformance[0]*100,vidInfo.relativeRetentionPerformance[5]*100,
        vidInfo.relativeRetentionPerformance[10]*100,vidInfo.relativeRetentionPerformance[15]*100,
        vidInfo.relativeRetentionPerformance[20]*100,vidInfo.relativeRetentionPerformance[25]*100,
        vidInfo.relativeRetentionPerformance[30]*100,vidInfo.relativeRetentionPerformance[35]*100,
        vidInfo.relativeRetentionPerformance[40]*100,vidInfo.relativeRetentionPerformance[45]*100,
        vidInfo.relativeRetentionPerformance[50]*100,vidInfo.relativeRetentionPerformance[55]*100,
        vidInfo.relativeRetentionPerformance[60]*100,vidInfo.relativeRetentionPerformance[65]*100,
        vidInfo.relativeRetentionPerformance[70]*100,vidInfo.relativeRetentionPerformance[75]*100,
        vidInfo.relativeRetentionPerformance[80]*100,vidInfo.relativeRetentionPerformance[85]*100,
        vidInfo.relativeRetentionPerformance[90]*100,vidInfo.relativeRetentionPerformance[95]*100,
        vidInfo.relativeRetentionPerformance[99]*100
    ];

    const averageWatchDuration = [
        vidInfo.averageWatchRatio[0]*100,vidInfo.averageWatchRatio[5]*100,
        vidInfo.averageWatchRatio[10]*100,vidInfo.averageWatchRatio[15]*100,
        vidInfo.averageWatchRatio[20]*100,vidInfo.averageWatchRatio[25]*100,
        vidInfo.averageWatchRatio[30]*100,vidInfo.averageWatchRatio[35]*100,
        vidInfo.averageWatchRatio[40]*100,vidInfo.averageWatchRatio[45]*100,
        vidInfo.averageWatchRatio[50]*100,vidInfo.averageWatchRatio[55]*100,
        vidInfo.averageWatchRatio[60]*100,vidInfo.averageWatchRatio[65]*100,
        vidInfo.averageWatchRatio[70]*100,vidInfo.averageWatchRatio[75]*100,
        vidInfo.averageWatchRatio[80]*100,vidInfo.averageWatchRatio[85]*100,
        vidInfo.averageWatchRatio[90]*100,vidInfo.averageWatchRatio[95]*100,
        vidInfo.averageWatchRatio[99]*100
    ];

    return(
        <>
            {/*If the overtime metrics are empty, there isn't enough data to make a chart.*/}
            {(vidInfo.averageWatchRatio.length === 0 && vidInfo.relativeRetentionPerformance.length === 0) ?
                <p id={"retentionWarning"}>Sorry, the video doesn't have enough data for proper retention analysis...</p>
                :
                <>
                    {/* Otherwise, create a line chart from MUI. */}
                    <div className={"chartContainer"}>
                        <LineChart
                            className={"custom-y-padding-bottom"}
                            xAxis={[{
                                // Setting up all the x-axis divisions, data, labels, and style.
                                data: ['0%','5%','10%','15%','20%','25%','30%','35%','40%','45%','50%','55%'
                                ,'60%','65%','70%','75%','80%','85%','90%','95%','100%'],
                                scaleType:'band',
                                label: "Percentage into Video",
                                labelStyle: {
                                    fontFamily: "Roboto",
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    fill: "#6495ED",
                                },
                            }]}
                            series={[
                                /* Those series are our two different overtime metrics. Adding them as two separate
                                * objects would make two different lines that are completely independent of one another
                                * visually. That is why specific labels are presented for those for farther details. */
                                {
                                    data: relativePerformanceRatio,
                                    label: "Relative Retention Performance",
                                    area: true
                                },
                                {
                                    data: averageWatchDuration,
                                    label: "Viewer Retention",
                                    area: true
                                },
                            ]}
                            yAxis={[{
                                // Setting up all the y-axis labels, and style.
                                label: "% Still Watching",
                                labelStyle: {
                                    fontFamily: "Roboto",
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    fill: "#6495ED",
                                },
                            }]}
                            // Set up sizes and colours used.
                            width={800}
                            height={400}
                            colors={["#2C3E50","rgb(100,149,237)"]}
                            sx={{
                                // Here, we add additional styling specifics.

                                //change left yAxis label styles
                                "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel":{
                                    strokeWidth:2,
                                    fill:"#ffffff",
                                },
                                // change bottom label styles
                                "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel":{
                                    fill:"#ffffff"
                                },
                                // bottomAxis Line Styles
                                "& .MuiChartsAxis-bottom .MuiChartsAxis-line":{
                                    stroke:"#FFFFFF",
                                    strokeWidth:5
                                },
                                // leftAxis Line Styles
                                "& .MuiChartsAxis-left .MuiChartsAxis-line":{
                                    stroke:"#FFFFFF",
                                    strokeWidth:5
                                }
                            }}
                        />
                    </div>
                    {/* Additionally to the chart, two tooltips that help users better understand it are provided. */}
                    <div className={"chartTooltip"}>
                        <h3>Relative Retention Performance</h3>
                        <h3>Viewer Retention</h3>
                        <p>Gives your video a rank from 0 to 100 and rates how well viewer retention performs relative to videos of the same length.
                            (0 being best and 100 being worst)</p>
                        <p>Shows what percentage (%) of viewers are still watching at a certain point of the video.</p>
                    </div>
                </>}
        </>
    );
}