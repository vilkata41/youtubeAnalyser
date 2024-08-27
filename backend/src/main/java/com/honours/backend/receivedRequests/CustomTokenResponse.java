package com.honours.backend.receivedRequests;

import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.util.Key;

/**
 * This class is a simple extension of the HTTP body response accepted class TokenResponse.
 * It is passed by the front-end in requests for specific YouTube API data and analytics requests.
 */
public class CustomTokenResponse extends TokenResponse {
    /**
     * This is the additional key added on top of all TokenResponse fields.
     * A getter and setter have been implemented.
     */
    @Key("expires_in")
    private int expiresInSeconds;

    @Override
    public Long getExpiresInSeconds() {
        return (long) expiresInSeconds;
    }

    public TokenResponse setExpiresInSeconds(Integer expiresInSeconds) {
        this.expiresInSeconds = expiresInSeconds;
        return this;
    }
}
