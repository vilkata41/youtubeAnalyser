package com.honours.backend.apiActions;

import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.services.youtube.model.*;
import com.google.api.services.youtubeAnalytics.v2.model.QueryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class VideoActions extends Actions{
    /**
     * A method that queries the latest video uploaded by the default channel of the
     * logged-in user and returns some basic data about it.
     *
     * @param tr the token from the front end
     * @return The latest video performance (alongside the appropriate HTTP code)
     * <br> This is just basic information such as average view duration, views, title, and thumbnail.
     */
    public static ResponseEntity<Object> getLastVideoPerformance(TokenResponse tr){
        makeYtObjects(tr);
        try{
            // Setting up and getting the latest video (it's the newest element in the uploads playlist)
            Channel defC = getDefaultChannel();
            String uploads = defC.getContentDetails().getRelatedPlaylists().getUploads();

            PlaylistItem latestVideo = yt.playlistItems().list(List.of("snippet"))
                    .set("channelID",defC.getId())
                    .setPlaylistId(uploads)
                    .setMaxResults(Long.valueOf("1"))
                    .set("order","date")
                    .set("type","video")
                    .execute().getItems().get(0);

            // Setting up a timeframe (from video upload (- 1 year) until now)

            LocalDate now = LocalDate.now();
            String uploaded_date = latestVideo.getSnippet().getPublishedAt().toString().substring(0,10);
            String today = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            // Getting the metrics for the timeframe
            QueryResponse response = ytAnalytics.reports().query()
                    .setIds("channel=="+defC.getId())
                    .setStartDate(uploaded_date)
                    .setEndDate(today)
                    .setMetrics("averageViewDuration,views")
                    .setFilters("video=="+latestVideo.getSnippet().getResourceId().getVideoId())
                    .execute();


            // Storing the results as a json object (e.g.: { "AVD": 56; ..... })
            String avd;
            String views;
            try{
                /* There is the following issue in the YT API.
                   Sometimes, a video exists but the metrics for it are not returned in the query.
                   Usually happens when a video is new, or there is not enough data for it yet.
                 */
                avd = response.getRows().get(0).get(0).toString();
                views = response.getRows().get(0).get(1).toString();
            }
            catch (IndexOutOfBoundsException ex){
                // if we encounter that error, set the metrics to 0.
                avd = "0";
                views = "0";
            }

            Map<String,String> results = new HashMap<>(
                    Map.of("AVD",avd,
                           "views", views,
                           "thumbnail_URL",latestVideo.getSnippet().getThumbnails().getHigh().getUrl(),
                           "title", latestVideo.getSnippet().getTitle())
            );

            return new ResponseEntity<>(results, HttpStatus.OK);
        }
        catch (IOException ex){
            return new ResponseEntity<>("A server error occurred.",HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Given a video, this method queries the YouTube API and gets multiple important metrics.
     *
     * @param tr the token from the authorisation
     * @param videoID video id provided in the request
     * @return Detailed information about a chosen video.
     * <br>That is information such as engagement, view duration, views, more detailed metrics.
     * <br><b>The returned value also includes the appropriate HTTP code.</b>
     */
    public static ResponseEntity<Object> getVideoPerformance(TokenResponse tr, String videoID){
        makeYtObjects(tr);
        try{
            // Getting the video
            Video current_video = yt.videos().list(List.of("snippet","statistics","status"))
                    .setId(List.of(videoID))
                    .execute().getItems().get(0);

            // Setting a timeframe for the entire existence of this video.
            LocalDate now = LocalDate.now();
            String uploaded_date = current_video.getSnippet().getPublishedAt().toString().substring(0,10);
            String today = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            // This query gets the overtime metrics during the video's execution.
            List<List<Object>> overtimeMetrics = ytAnalytics.reports().query()
                    .setIds("channel==MINE")
                    .setFilters("video==" + videoID)
                    .setDimensions("elapsedVideoTimeRatio")
                    .setStartDate(uploaded_date)
                    .setEndDate(today)
                    .setMetrics("audienceWatchRatio,relativeRetentionPerformance")
                    .execute().getRows();


            // Storing the two metrics into different variables to avoid confusion.
            List<Object> awr = new ArrayList<>();
            List<Object> rrp = new ArrayList<>();

            /* If there isn't enough overtime data for this video, the overtimeMetrics will be an empty array.
            * If that's the case , return an empty array that will be checked in the front-end.
            * Based on whether an array is empty or not, the analysis displayed will correspond.
            * */
            if(!overtimeMetrics.isEmpty()){
                for (List<Object> l : overtimeMetrics) {
                    awr.add(l.get(1));
                    rrp.add(l.get(2));
                }
            }
            // No need for an else here, because awr and rrp are created empty, we just don't add anything to them.


            // This query gets the overall metrics of the video.
            List<List<Object>> overallMetricsQueryResult = ytAnalytics.reports().query()
                    .setIds("channel==MINE")
                    .setFilters("video==" + videoID)
                    .setStartDate(uploaded_date)
                    .setEndDate(today)
                    .setMetrics("averageViewDuration,averageViewPercentage,subscribersGained,cardClickRate")
                    .execute().getRows();

            /* There is the same issue in the YT API that's described in getVideoPerformance.
             * Sometimes, a video exists but some metrics for it are not returned in the query.
             * Usually happens when a video is new, or there is not enough data for it yet.
             * If we have the data, use that. Otherwise, populate the data used with 0-s.
             */

            List<Object> overallMetrics;
            if(!overallMetricsQueryResult.isEmpty()) overallMetrics = overallMetricsQueryResult.get(0);
            else overallMetrics = new ArrayList<>(Arrays.asList(
               new BigInteger("0"),new BigDecimal("0"),new BigInteger("0"),new BigDecimal("0")
            ));


            // Getting tips based on certain video statistics
            List<Object> videoTips = getVideoAdvice(current_video, overallMetrics, awr);

            // Storing the needed information in a JSON-like format and returning.
            Map<String,Object> result = new HashMap<>(Map.of(
                    "thumbnailURL",current_video.getSnippet().getThumbnails().getHigh().getUrl(),
                    "title", current_video.getSnippet().getTitle(),
                    "viewCount", current_video.getStatistics().getViewCount(),
                    "engagementCount", current_video.getStatistics().getLikeCount()
                            .add(current_video.getStatistics().getDislikeCount())
                            .add(current_video.getStatistics().getCommentCount())
                            .add(new BigInteger(overallMetrics.get(2).toString())),
                    "averageViewDuration",overallMetrics.get(0),
                    "averageViewPercentage",overallMetrics.get(1),
                    "cardClickRate",overallMetrics.get(3),
                    "averageWatchRatio",awr,
                    "relativeRetentionPerformance",rrp,
                    "advice", videoTips
            ));

            /* This piece of data has to be put here because the limit of parameters
            *  in the function Map.of() appears to be a maximum of 10 items for the map.
            *  This just adds the privacy status of a video to the returned result.
            * */
            result.put("privacy", current_video.getStatus().getPrivacyStatus());

            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        catch(IOException ex){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Gets all videos uploaded by a channel for a given api response page (10 videos per page).
     *
     * @param tr The authentication token.
     * @param page_token The page token needed to keep track of the current page of the videos
     * @return A maximum of 10 videos for a specified page (with their information), alongside previous
     * and next page tokens.
     * <br><b>Also returns the appropriate HTTP code.</b>
     */
    public static ResponseEntity<Object> getAllVideos(TokenResponse tr, String page_token){
        makeYtObjects(tr);
        try{
            // Setting up necessary objects.
            Channel defC = getDefaultChannel();
            String uploads = defC.getContentDetails().getRelatedPlaylists().getUploads();
            PlaylistItemListResponse uploadsResponse;
            List<PlaylistItem> pageUploads;

            // If the page token is null, we assume it's the first page of the results
            if(page_token == null){
                uploadsResponse = yt.playlistItems().list(List.of("snippet", "status"))
                        .set("channelID",defC.getId())
                        .setPlaylistId(uploads)
                        .setMaxResults(Long.valueOf("10"))
                        .set("order","date")
                        .set("type","video")
                        .execute();
            }
            else{
                // Otherwise, we try to get the page specified by the page token identifier.
                uploadsResponse = yt.playlistItems().list(List.of("snippet", "status"))
                        .set("channelID",defC.getId())
                        .setPlaylistId(uploads)
                        .setMaxResults(Long.valueOf("10"))
                        .set("order","date")
                        .set("type","video")
                        .setPageToken(page_token)
                        .execute();
            }

            // Getting all the items, shaping them up in the proper MAP return shape, and returning.
            pageUploads = uploadsResponse.getItems();
            Map<String,Object> result = shapeMapResult(pageUploads,uploadsResponse);

            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (IOException ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Querying the API for a maximum of 200 comments for a specified video.
     *
     * @param tr The authentication token.
     * @param videoID The specific video we need the comments from.
     * @return a maximum of 200 comments for the video.
     * <br><b>Also returns the appropriate HTTP code.</b>
     */
    public static ResponseEntity<Object> get200Comments(TokenResponse tr, String videoID){
        makeYtObjects(tr);
        try{
            // Getting the first batch of up to 100 (that's the limit for the api) comments from that video.
            CommentThreadListResponse resp = yt.commentThreads().list(List.of("snippet"))
                    .setVideoId(videoID)
                    .setMaxResults(Long.valueOf("100"))
                    .execute();

            // Storing the first batch.
            List<CommentThread> comments = resp.getItems();


            // If there are more pages with responses, get the second one for another batch of (up to 100) comments.
            if(resp.getNextPageToken() != null){
                CommentThreadListResponse resp2 = yt.commentThreads().list(List.of("snippet"))
                        .setVideoId(videoID)
                        .setPageToken(resp.getNextPageToken())
                        .setMaxResults(Long.valueOf("100"))
                        .execute();

                comments.addAll(resp2.getItems());
            }

            // Shape up the result in the proper LIST return shape and returning.
            List<Map<String,String>> result = shapeCommentResult(comments);

            return new ResponseEntity<>(result,HttpStatus.OK);
        }
        catch(IOException ex){
            return new ResponseEntity<>(ex,HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    /**
     * Using an inner algorithm, gets the top 5 videos out of the 25 most recently uploaded.
     *
     * @param tr The authentication token.
     * @return A JSON-like object with basic information about the top 5 videos.
     * <br><b>Also returns the appropriate HTTP code.</b>
     */
    public static ResponseEntity<Object> getTop5Vids(TokenResponse tr){
        makeYtObjects(tr);
        try{
            // Setting up the necessary info - channel, the latest videos.
            Channel defChannel = getDefaultChannel();
            String uploads_playlistID = defChannel.getContentDetails().getRelatedPlaylists().getUploads();

            List<PlaylistItem> last25Vids = yt.playlistItems().list(List.of("snippet"))
                    .set("channelID",defChannel.getId())
                    .setPlaylistId(uploads_playlistID)
                    .setMaxResults(Long.valueOf("25"))
                    .set("order","date")
                    .set("type","video")
                    .execute().getItems();

            // Setting up the second query, which will return specific data the algorithm may need.
            List<String> ids25 = new ArrayList<>();
            for (PlaylistItem i: last25Vids) {
                ids25.add(i.getSnippet().getResourceId().getVideoId());
            }
            String videoIDS = String.join(",",ids25);

            // After getting the video IDs ready, the timeframe needs to pe specified.
            // That frame is from the moment the oldest video was uploaded until the moment of the query.
            LocalDate now = LocalDate.now();
            String oldest_vid = last25Vids.get(last25Vids.size()-1).getSnippet()
                    .getPublishedAt().toString().substring(0,10);
            String today = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            // Getting all the information we need as a response.
            List<List<Object>> vidsOverallMetrics = ytAnalytics.reports().query()
                    .setDimensions("video")
                    .setIds("channel==MINE")
                    .setMetrics("comments,likes,dislikes,shares,subscribersGained,averageViewPercentage,views,estimatedMinutesWatched")
                    .setStartDate(oldest_vid)
                    .setEndDate(today)
                    .setFilters("video=="+videoIDS)
                    .execute().getRows();

            Map<String,Double> scores = new HashMap<>();

            // Calculating the scores for each video based on the algorithm in calculateScore().
            for (List<Object> videoMetrics: vidsOverallMetrics) {
                String id = videoMetrics.get(0).toString();
                scores.put(id,calculateScore(videoMetrics.subList(1,videoMetrics.size())));
            }

            // Getting the top 5 results and returning their basic information for any further need in the frontend.
            Map<String,Double> top5 = findHighestScores(scores);

            List<Video> videoSnippets = yt.videos().list(List.of("id,snippet"))
                    .setId(top5.keySet().stream().toList())
                    .execute().getItems();

            List<Object> result = new ArrayList<>();
            int i = 0;
            for(Video v: videoSnippets){
                Map<String,String> video_info = new HashMap<>(Map.of(
                        "title",v.getSnippet().getTitle(),
                        "video_id",v.getId(),
                        "thumbnail_URL",v.getSnippet().getThumbnails().getHigh().getUrl()
                ));
                result.add(i,video_info);
            }

            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        catch(IndexOutOfBoundsException ex){
            /* This error occurs if there are 0 videos and the app tries to access them by index.
             Usually, if the videos are recently uploaded, or they are simply not returned by the YouTube API.
             Hence, we just return an empty list containing 0 objects. */
            return new ResponseEntity<>(List.of(),HttpStatus.OK);
        }
        catch(IOException ex){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This method contains the algorithm that decides what score each video will be assigned.
     *
     * @param metrics a response object (excluding video ID) of all the metrics like comments, likes,
     *                dislikes, etc. for a single video
     * @return the score for that video.
     */
    private static double calculateScore(List<Object> metrics){
        long comments = Long.parseLong(metrics.get(0).toString());
        long likes = Long.parseLong(metrics.get(1).toString());
        long dislikes = Long.parseLong(metrics.get(2).toString());
        long shares = Long.parseLong(metrics.get(3).toString());
        long subs_gained = Long.parseLong(metrics.get(4).toString());
        double avp = Double.parseDouble(metrics.get(5).toString());
        long views = Long.parseLong(metrics.get(6).toString());
        long watchtime = Long.parseLong(metrics.get(7).toString());

        // Engagement rate (in percentage) are all engagement actions / the number of views * 100 to convert to %
        double eng_rate = (double) (likes + dislikes + comments + shares) /views * 100;
        double subs_gained_percent = (double) subs_gained /views * 100;

        // Everything is linear (scaling appropriately), except for the views, which are logarithmic.
        return (9 * eng_rate + 10 * avp + 8 * subs_gained_percent + watchtime + 1000 * Math.log(views))/100;
    }

    /**
     * A helper method that returns a map of the top 5 scores.
     *
     * @param scores All the scores we have in the form of a map.
     * @return The map of just the top 5 scores.
     */
    private static Map<String,Double> findHighestScores(Map<String,Double> scores){
        List<Map.Entry<String, Double>> sortList = new ArrayList<>(scores.entrySet());

        // Sorting the map by the values of each entry (IN DESCENDING ORDER!)
        sortList.sort(new Comparator<Map.Entry<String, Double>>() {
            @Override
            public int compare(Map.Entry<String, Double> o1, Map.Entry<String, Double> o2) {
                return o2.getValue().compareTo(o1.getValue()); // Sorting in descending order
            }
        });

        return new HashMap<>(Map.of(sortList.get(0).getKey(),sortList.get(0).getValue(),
                sortList.get(1).getKey(),sortList.get(1).getValue(),
                sortList.get(2).getKey(),sortList.get(2).getValue(),
                sortList.get(3).getKey(),sortList.get(3).getValue(),
                sortList.get(4).getKey(),sortList.get(4).getValue()));
    }

    /**
     * A helper method to shape the map result of given videos.
     *
     * @param pageUploads A list of PlayListItem that is usually contained in the snippet of
     *                    a query to the Data v3 API.
     * @param resp The raw response to a Data v3 API query. It should contain the <b>page token</b>
     * @return A map of videos that contains all videos for the provided page (pageUploads).
     */
    private static Map<String,Object> shapeMapResult(List<PlaylistItem> pageUploads, PlaylistItemListResponse resp){
        Map<String,Object> organisedResponse = new HashMap<>();
        List<Object> videosList = new ArrayList<>();
        int n = 1;

        // Each video has its core data stored to an array of all videos for the page.
        for (PlaylistItem v: pageUploads) {

            /*
            * If a video is deleted or deprecated, it will exist in the api but there will be no data about it,
            * we just ignore that and store all other videos with their needed data.
            * */
            if(!v.getStatus().getPrivacyStatus().equals("privacyStatusUnspecified")){
                Map<String,String> videoInfo = new HashMap<>();
                videoInfo.put("title",v.getSnippet().getTitle());
                videoInfo.put("thumbnailURL",v.getSnippet().getThumbnails().getHigh().getUrl());
                videoInfo.put("videoID",v.getSnippet().getResourceId().getVideoId());
                videoInfo.put("privacy",v.getStatus().getPrivacyStatus());

                videosList.add(videoInfo);
            }
        }
        // Page tokens and all videos are added to the response.
        organisedResponse.put("prevPageToken",resp.getPrevPageToken());
        organisedResponse.put("nextPageToken",resp.getNextPageToken());
        organisedResponse.put("videos",videosList);

        return organisedResponse;
    }

    /**
     * A helper method to shape the result of a list of comments
     *
     * @param comments A list of CommentThread that should be properly shaped
     * @return A list of JSON-like objects containing comment information.
     */
    private static List<Map<String,String>> shapeCommentResult(List<CommentThread> comments){
        List<Map<String,String>> shaper = new ArrayList<>();
        // Each comment has its data (like body, author, author profile picture) shaped and returned.
        for(CommentThread c:comments){
            Map<String,String> comment = new HashMap<>();
            comment.put("comment_body",c.getSnippet().getTopLevelComment().getSnippet().getTextDisplay());
            comment.put("comment_author",c.getSnippet().getTopLevelComment().getSnippet().getAuthorDisplayName());
            comment.put("comment_author_profile_picture_URL",c.getSnippet().getTopLevelComment().getSnippet().getAuthorProfileImageUrl());
            shaper.add(comment);
        }

        return shaper;
    }

    /**
     * A helper method that takes specific video data and generates advice that was located in pre-populated files.
     * The advice is specific based on how well/poorly the video is performing.
     *
     * @param current_video A video object (returned by YouTube API) of the currently analysed video
     * @param overallMetrics Additional metrics for that video in the first parameter
     * @param overtimeRetention Retention metrics that are used for the video's evaluation.
     * @return A list of Strings that represent the advice for a video(or empty if the video needs no advice).
     */
    private static List<Object> getVideoAdvice(Video current_video, List<Object> overallMetrics, List<Object> overtimeRetention){
        List<Object> result = new ArrayList<>();


        // If the video being analysed has under 10 thousand views, choose a piece of advice from the
        // "low viewcount advice"
        if(current_video.getStatistics().getViewCount().compareTo(BigInteger.valueOf(10000)) < 1){
            try{
                result.add(adviceFromFile(VideoActions.class.getResource("/.viewCountAdvice").getPath()));
            }
            catch(Exception ex){
                // This only occurs if there's something wrong with the advice file.
                result.add("There seems to be room for improvement for your video's view count, " +
                        "but we can not fetch advice for now, sorry...");
            }
        }

        // Calculating engagement Rate
        double engRate = (current_video.getStatistics().getLikeCount()
                .add(current_video.getStatistics().getDislikeCount())
                .add(current_video.getStatistics().getCommentCount())).doubleValue()/
                current_video.getStatistics().getViewCount().doubleValue();

        // If the engagement Rate is lower than 10%, give engagement advice chosen from the preset
        if((engRate * 100) < 10){
            try{
                result.add(adviceFromFile(VideoActions.class.getResource("/.engagementAdvice").getPath()));
            }
            catch(Exception ex){
                // This only occurs if there's something wrong with the advice file.
                result.add("There seems to be room for improvement for your video's engagement rate, " +
                        "but we can not fetch advice for now, sorry...");
            }

        }

        // If the average view percentage for the video is lower than 20%, give view percent advice from the preset.
        if(((BigDecimal) overallMetrics.get(1)).compareTo(new BigDecimal((long) 20)) < 1){
            try{
                result.add(adviceFromFile(VideoActions.class.getResource("/.viewPercentAdvice").getPath()));
            }
            catch(Exception ex){
                // This only occurs if there's something wrong with the advice file.
                result.add("There seems to be room for improvement for your video's average view percentage, " +
                        "but we can not fetch advice for now, sorry...");
            }
        }

        // If the card click rate is under 2%, provide card click rate improvement advice from the preset.
        if(((BigDecimal) overallMetrics.get(3)).compareTo(new BigDecimal((long) 2)) < 1){
            try{
                result.add(adviceFromFile(VideoActions.class.getResource("/.cardClicksAdvice").getPath()));
            }
            catch(Exception ex){
                // This only occurs if there's something wrong with the advice file.
                result.add("There seems to be room for improvement for your video's card click rate, " +
                        "but we can not fetch advice for now, sorry...");
            }
        }

        /* We provide overtime advice if there is any overtime data at all, if not, we just skip overtime advice.
           Overtime advice is related to any declines in the video intro, as well as other declines throughout
           the video.
         */
        if(!overtimeRetention.isEmpty()){

            // Here, we check if there is a dip of over 30% in viewership in the introduction of the video (first 10%)
            // If there is, provide advice from the preset.
            if(((BigDecimal) overtimeRetention.get(0)).subtract((BigDecimal) overtimeRetention.get(9))
                    .compareTo(BigDecimal.valueOf(0.3)) >= 0){
                try{
                    result.add(adviceFromFile(VideoActions.class.getResource("/.introDeclineAdvice").getPath()));
                }
                catch(Exception ex){
                    // This only occurs if there's something wrong with the advice file.
                    result.add("There seems to be room for improvement for your video's intro retention, " +
                            "but we can not fetch advice for now, sorry...");
                }

            }

            // Here, we check for any big dips of viewership after the video introduction, if there is a viewership decline
            // of over 20%, provide advice from the preset.
            boolean existsBigDecline = false;

            for(int i = 10; i < overtimeRetention.size(); i+=10){
                if(((BigDecimal) overtimeRetention.get(i)).subtract((BigDecimal) overtimeRetention.get(i+9))
                        .compareTo(BigDecimal.valueOf(0.2)) >= 0){
                    existsBigDecline = true;
                    break;
                }
            }
            if(existsBigDecline){
                try{
                    result.add(adviceFromFile(VideoActions.class.getResource("/.bigDeclineAdvice").getPath()));
                }
                catch(Exception ex){
                    // This only occurs if there's something wrong with the advice file.
                    result.add("There seems to be room for improvement for your video's retention, " +
                            "but we can not fetch advice for now, sorry...");
                }
            }
        }

        // Return all the advice based on stats covered.
        return result;
    }

    /**
     * A helper method that is used in the getVideoAdvice method. It provides a random piece of advice
     * provided a filename for an advice container.
     *
     * @param filename The file with the pre-populated advice
     * @return One piece of randomly chosen advice from the file provided.
     * @throws FileNotFoundException if the file specified is not found.
     */
    private static String adviceFromFile(String filename) throws FileNotFoundException {
        File adviceFile = new File(filename);
        Scanner reader = new Scanner(adviceFile);
        List<String> lines = new ArrayList<>();
        while(reader.hasNextLine()){
            lines.add(reader.nextLine());
        }
        Random random = new Random();
        return lines.get(random.nextInt(lines.size()));
    }
}
