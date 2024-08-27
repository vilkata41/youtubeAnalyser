package com.honours.backend.receivedRequests;

import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.util.Key;

/**
 * This class is accepted by the HTTP request body and 2 different values are required in the shape of a
 * JSON object - a video ID and a token - CustomResponseToken.
 * It is passed by the front-end in requests (as a request body) for specific YouTube API data and analytics requests.
 */
public class VideoTokenResponse{
    // The json key is "video_id"
    @Key("video_id")
    private String video_id;

    // The json key is "token"
    @Key("token")
    private CustomTokenResponse token;

    // Getters and setters are set up for the request body being generated here.

    public VideoTokenResponse(CustomTokenResponse token, String video_id){
        this.token = token;
        this.video_id = video_id;

    }

    public String getVidID() {
        return video_id;
    }

    public TokenResponse getTr() {
        return token;
    }

    public void setVideID(String video_id) {
        this.video_id = video_id;
    }

    public void setTr(CustomTokenResponse token) {
        this.token = token;
    }
}
