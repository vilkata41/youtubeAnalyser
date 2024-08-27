package com.honours.backend.apiActions;


import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.services.youtube.model.Channel;
import com.google.api.services.youtube.model.ChannelStatistics;
import com.google.api.services.youtube.model.Subscription;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class ChannelActions extends Actions{

    /**
     * This method queries the YouTube data v3 api and returns the current number of
     * subscribers the authenticated channel has.
     *
     * @param tr token response object received by the front end
     * @return number of channel subscribers alongside a Http status of 200 if successful,
     * otherwise - a Http Status 500
     */
    public static ResponseEntity<Object> getChannelSubs(TokenResponse tr){
        try{
            // Instantiates all YouTube api variables for the system and gets the main channel's statistics
            makeYtObjects(tr);
            Channel defaultChannel = getDefaultChannel();
            ChannelStatistics stats = defaultChannel.getStatistics();
            BigInteger subs = stats.getSubscriberCount();

            return new ResponseEntity<>(Map.of("subscriberCount", subs.toString()),HttpStatus.OK);
        }
        catch(Exception ex){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This is a simple method that queries the YouTube api and returns the currently logged-in
     * channel's basic information.
     *
     * @param tr token response object received by the front end
     * @return an object that contains information about channel name,
     * the profile picture of a channel, its ID + Http code 200
     * OR
     * Http code 500
     */
    public static ResponseEntity<Object> getChannelBasics(TokenResponse tr){
        try{
            // Initializing all variables we need
            makeYtObjects(tr);
            Channel defaultChannel = getDefaultChannel();

            // Finding the already queried information in (getDefaultChannel())
            String channel_name = defaultChannel.getSnippet().getTitle();
            String profile_picture_URL = defaultChannel.getSnippet().getThumbnails().getMedium().getUrl();

            return new ResponseEntity<>(Map.of("channel_name",channel_name,
                    "profile_picture_URL", profile_picture_URL,
                    "channelID", defaultChannel.getId()),HttpStatus.OK);
        }
        catch(IOException ex){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This method queries the YouTube API and gets the watch time in minutes
     * for the default channel of the logged-in user for the past year.
     *
     * @param tr token response object received by the front end
     * @return total watch time for the channel in the last year + HTTP code 200
     * OR
     * HTTP code 500
     */
    public static ResponseEntity<Object> getWatchTime365(TokenResponse tr){
        try{
            // Setting up needed objects
            makeYtObjects(tr);
            Channel defaultChannel = getDefaultChannel();
            String channelID = defaultChannel.getId();

            // Calculating the time frame and converting it to the accepted format
            LocalDate now = LocalDate.now();
            LocalDate last_year = now.minusYears(1);
            String before365 = last_year.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String today = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            // Executing the query for VIDEOS only, excluding SHORTS
            String result = ytAnalytics.reports().query()
                    .set("ids", "channel==" + channelID)
                    .set("startDate",before365)
                    .set("endDate",today)
                    .set("metrics","estimatedMinutesWatched")
                    .set("filters","creatorContentType==video_on_demand")
                    .execute().getRows().get(0).get(0).toString();

            return new ResponseEntity<>(Map.of("minutesWatched", result), HttpStatus.OK);

        }
        catch(IOException ex){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * The query finds top 20 of the most RELEVANT (NOT SUBSCRIBED) channels for the logged-in user
     * and returns data about them.
     *
     * @param tr token response object received by the front end
     * @return ResponseEntity of type object (holds HTTP code 200 if success, otherwise HTTP code 500).
     * <br>On success, returns a list of objects (in the form of a map) holding information about a channel.
     * That is information such as channel name, ID, subscribers count, profile picture.
     */
    public static ResponseEntity<Object> getTop20Subs(TokenResponse tr) {
        makeYtObjects(tr);
        try{
            // Getting Subscription objects for top 20 most relevant channels.
            List <Subscription> subs = yt.subscriptions().list(List.of("subscriberSnippet"))
                    .set("mySubscribers",true)
                    .set("maxResults",(long) 20)
                    .setOrder("relevance")
                    .execute().getItems();

            // Storing their ID for a query in regard to their statistics.
            List<String> sub_ids = new ArrayList<>();
            List<Channel> top20 = new ArrayList<>();

            for (Subscription s:subs) {
                sub_ids.add(s.getSubscriberSnippet().getChannelId());
            }

            /* Gathering more information about the channels in question.
            * That would be done if and only if any relevant subscribers have been found!
            * If there are no relevant subscribers found, this will be empty, so no need to perform another query.
            * The top20 channels list has to stay empty in this situation. */
            if (!sub_ids.isEmpty()){
                top20 = yt.channels().list(List.of("snippet,statistics"))
                        .setId(sub_ids)
                        .execute().getItems();
            }


            // Sorting the top 20 most relevant channels by subscriber count in descending order.
            top20.sort(new Comparator<Channel>() {
                @Override
                public int compare(Channel o1, Channel o2) {
                    return o2.getStatistics().getSubscriberCount().compareTo(o1.getStatistics().getSubscriberCount());
                }
            });

            String channel_name;
            String channelID;
            String sub_count;
            String ppURL;
            List<Map<String,String>> result = new ArrayList<>();

            // Saving the result for each channel into the return object
            for (Channel c : top20){
                Map<String,String> channel_result = new HashMap<>();

                channel_name = c.getSnippet().getTitle();
                channelID = c.getId();
                sub_count = c.getStatistics().getSubscriberCount().toString();
                ppURL = c.getSnippet().getThumbnails().getMedium().getUrl();

                channel_result.put("channel_name", channel_name);
                channel_result.put("channelID", channelID);
                channel_result.put("sub_count", sub_count);
                channel_result.put("profile_picture_URL",ppURL);

                result.add(channel_result);
            }

            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        catch(IOException ex){
            System.out.println(ex.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * If a channel is monetized, this method returns data about its monetization.
     * <br>Otherwise, "FORBIDDEN" Http status is returned.
     *
     * @param tr token response object received by the front end
     * @return ResponseEntity of type object (holds HTTP code 200 if success, otherwise HTTP code 403).
     * <br>On success, returns monetization data about a channel.
     * <br>If a channel is not monetized, an error is thrown and access is forbidden.
     */
    public static ResponseEntity<Object> getEarningEstimations(TokenResponse tr){
        try{
            // Creating necessary objects
            makeYtObjects(tr);
            Channel defaultChannel = getDefaultChannel();
            String channelID = defaultChannel.getId();

            // Setting up date dimensions and converting to the proper format needed.
            LocalDate now = LocalDate.now();
            LocalDate last_month = now.minusMonths(1);
            String prevMonth = last_month.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String today = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

            // Executing query for Estimated Ad Revenue.
            String result = ytAnalytics.reports().query()
                    .set("ids", "channel==" + channelID)
                    .set("startDate",prevMonth)
                    .set("endDate",today)
                    .set("metrics","estimatedAdRevenue")
                    .execute().getRows().get(0).get(0).toString();

            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        catch(IOException ex){
            return new ResponseEntity<>("NOT_MONETIZED", HttpStatus.FORBIDDEN);
        }
    }

}
