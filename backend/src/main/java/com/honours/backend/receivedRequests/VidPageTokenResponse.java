package com.honours.backend.receivedRequests;

import com.google.api.client.util.Key;

/**
 * This class is accepted by the HTTP request body and 2 different values are required in the shape of a
 * JSON object - a page_token and an auth_token - CustomResponseToken.
 * It is passed by the front-end in requests (as a request body) for specific YouTube API data and analytics requests.
 */
public class VidPageTokenResponse {
    // The JSON key for the page token is specified in the shape "page_token":"1234sample_value1234"
    @Key("page_token")
    private String page_token;

    // The JSON key for the authentication token in the shape "auth_token":{OAUTH 2.0 AUTHENTICATION TOKEN HERE}
    @Key("auth_token")
    private CustomTokenResponse token;

    // Getters and setters for the customised body request object are set up here too.

    public VidPageTokenResponse(String page_token, CustomTokenResponse token) {
        this.page_token = page_token;
        this.token = token;
    }

    public String getPage_token() {
        return page_token;
    }

    public CustomTokenResponse getToken() {
        return token;
    }

    public void setPage_token(String page_token) {
        this.page_token = page_token;
    }

    public void setToken(CustomTokenResponse token) {
        this.token = token;
    }
}
