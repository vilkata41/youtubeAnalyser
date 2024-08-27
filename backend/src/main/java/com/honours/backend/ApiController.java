package com.honours.backend;

import com.honours.backend.apiActions.ChannelActions;
import com.honours.backend.apiActions.VideoActions;
import com.honours.backend.receivedRequests.CustomTokenResponse;
import com.honours.backend.receivedRequests.VidPageTokenResponse;
import com.honours.backend.receivedRequests.VideoTokenResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * This class acts as the Controller for the REST API, connecting the front-end with the back-end of the application.
 * <br/>
 * Each of the methods is mapped to a specific URL that is then accessed by the front-end.
 * <br/>
 * Each method calls a specific action implemented in one of two classes - ChannelActions and VideoActions.
 * Further documentation can be found in the specific class containing each of the methods called.
 */
@RestController
@CrossOrigin(origins={"https://devweb2023.cis.strath.ac.uk", "http://localhost:3000"})
public class ApiController {

    @GetMapping("/test")
    ResponseEntity<Object> test(){
        return new ResponseEntity<>("This is a test.", HttpStatus.OK);
    }

    @PostMapping("/api/channelSubscribers")
    ResponseEntity<Object> channelSubs (@RequestBody CustomTokenResponse auth_object){
        return ChannelActions.getChannelSubs(auth_object);
    }

    @PostMapping("/api/channelBasics")
    ResponseEntity<Object> channelBasics(@RequestBody CustomTokenResponse auth_object){
        return ChannelActions.getChannelBasics(auth_object);
    }

    @PostMapping("/api/365watchtime")
    ResponseEntity<Object> watchTime365 (@RequestBody CustomTokenResponse auth_object){
        return ChannelActions.getWatchTime365(auth_object);
    }

    @PostMapping("/api/top20Subs")
    ResponseEntity<Object> top20Subs(@RequestBody CustomTokenResponse auth_object){
        return ChannelActions.getTop20Subs(auth_object);
    }

    @PostMapping("/api/earnings")
    ResponseEntity<Object> getEarnings(@RequestBody CustomTokenResponse auth_object){
        return ChannelActions.getEarningEstimations(auth_object);
    }

    @PostMapping("/api/lastVidAnalysis")
    ResponseEntity<Object> getLastVidAnalysis(@RequestBody CustomTokenResponse auth_object){
        return VideoActions.getLastVideoPerformance(auth_object);
    }

    @PostMapping("/api/vidAnalysis")
    ResponseEntity<Object> getVideoPerformance(@RequestBody VideoTokenResponse auth_object){
        return VideoActions.getVideoPerformance(auth_object.getTr(),auth_object.getVidID());
    }

    @PostMapping("/api/allVideos")
    ResponseEntity<Object> getAllVideos(@RequestBody VidPageTokenResponse auth_object){
        return VideoActions.getAllVideos(auth_object.getToken(), auth_object.getPage_token());
    }

    @PostMapping("/api/get200Comments")
    ResponseEntity<Object> get200Comments(@RequestBody VideoTokenResponse auth_object){
        return VideoActions.get200Comments(auth_object.getTr(), auth_object.getVidID());
    }

    @PostMapping("/api/top5LatestVideos")
    ResponseEntity<Object> getTop5Vids(@RequestBody CustomTokenResponse auth_object){
        return VideoActions.getTop5Vids(auth_object);
    }
}
