package com.honours.backend.apiActions;

import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.Channel;
import com.google.api.services.youtube.model.ChannelListResponse;
import com.google.api.services.youtubeAnalytics.v2.YouTubeAnalytics;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Actions {
    private static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();
    private static final JsonFactory JSON_FACTORY = new JacksonFactory();
    protected static YouTube yt;
    protected static YouTubeAnalytics ytAnalytics;

    /**
     * This method gets the default channel for the logged-in user.
     * <br><b>A YouTube Data v3 object needs to be instantiated for this to work. It should be named "yt".</b>
     *
     * @return a Channel object of the default channel for the logged-in user.
     * @throws IOException if there has been a problem with querying the channel.
     */
    protected static Channel getDefaultChannel() throws IOException {

        // Querying to find the channel alongside its id, snippet, statistics, and contentDetails.
        ChannelListResponse channels = yt.channels()
                .list(List.of("id,snippet,statistics,contentDetails"))
                .setMine(true)
                .setFields("items(id,snippet,statistics,contentDetails)")
                .execute();

        // Listing all the channels associated with the user.
        List<Channel> listOfChannels = channels.getItems();

        // The user's default channel is the first item in the list.
        return listOfChannels.get(0);
    }

    /**
     * This method creates the two YouTube api objects that this entire backend application uses.
     * <br>It forms a credential based on the secure token from the authentication and builds
     * the API connections with YouTube.
     *
     * @param tr usually passed from the front end, used to instantiate the mentioned objects.
     */
    protected static void makeYtObjects(TokenResponse tr) {
        // Making a bearer credential from the token
        Credential credential = new Credential(BearerToken.authorizationHeaderAccessMethod());
        credential.setFromTokenResponse(tr);

        // Building the YouTube Data v3 API connection.
        yt = new YouTube.Builder(HTTP_TRANSPORT,JSON_FACTORY,credential)
                .setApplicationName("youtube-analyser")
                .build();

        // Building the YouTube Analytics v2 API connection.
        ytAnalytics = new YouTubeAnalytics.Builder(HTTP_TRANSPORT,JSON_FACTORY,credential)
                .setApplicationName("youtube-analyser")
                .build();
    }
}
