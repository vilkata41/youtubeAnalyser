package com.honours.backend;

import com.honours.backend.apiActions.VideoActions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

@SpringBootTest
class BackendApplicationTests {
    static Method calcScore;

    /**
     * Since there are private methods tested, they have to be instantiated as accessible. This method is executed
     * before any tests, and sets up the testing suite.
     */
    @BeforeAll
    static void setUpPrivateMethods() {
        try{
            // Setting up a way to access the private method calculateScore in VideoActions.
            calcScore = VideoActions.class.getDeclaredMethod("calculateScore", List.class);
            calcScore.setAccessible(true);
        }
        catch (NoSuchMethodException e){
            // On error, fail this and ignore all tests.
            assert false : "One of the tested methods does not exist!";
        }

    }

    /**
     * The first test evaluates one of the edge cases for the scoring method of videos.
     * Two videos are compared by being given dummy data described below: <br/><br/>
     *
     * The first video has better performance metrics but the view count is lower with 1000. However,
     * if the scale is taken into consideration, that is barely any difference, so the first video
     * should be performing better than the second.
     */
    @Test
    void videoScoreCase1() {
        try{
            // Creating two values for scores of different videos (with dummy data) that need to be compared.
            double videoScore1 = (double) calcScore.invoke(null, new ArrayList<Object>(List.of(20,200,50,10,26,40,100000,400)));
            double videoScore2 = (double) calcScore.invoke(null, new ArrayList<Object>(List.of(15,180,40,8,23,35,101000,350)));

            assert videoScore1 > videoScore2 : "Edge case failed!";
        } catch (IllegalAccessException | InvocationTargetException e) {
            assert false : "There was an issue with the method invocation";
        }
    }

    /**
     * The second test evaluates another of the edge cases for the scoring method of videos.
     * Two videos are compared by being given dummy data described below: <br/><br/>
     *
     * The first video has better performance metrics but the view count is lower with 1000. However, the
     * scale here is larger since the second video has a much higher view count.
     */
    @Test
    void videoScoreCase2() {
        try{
            // Creating two values for scores of different videos (with dummy data) that need to be compared.
            double videoScore1 = (double) calcScore.invoke(null, new ArrayList<Object>(List.of(20,200,50,10,26,40,500,400)));
            double videoScore2 = (double) calcScore.invoke(null, new ArrayList<Object>(List.of(15,180,40,8,23,35,1500,350)));

            assert videoScore1 < videoScore2 : "Edge case failed!";
        } catch (IllegalAccessException | InvocationTargetException e) {
            assert false : "There was an issue with the method invocation";
        }
    }

    /**
     * The second test evaluates another of the edge cases for the scoring method of videos.
     * Two videos are compared by being given dummy data described below: <br/><br/>
     *
     * The first video has better performance metrics but the view count is lower with 1000. If the scale is
     * taken into account the second video has three times the views of the first one. Generally, that would
     * imply that the difference in scale is big between the two videos. However, the overall engagement statistics
     * of the second video are way worse than those for the first.
     * <br/><br/>
     * Hence, leading to the deduction that
     * even though the scale is way lower than, say, comparing 100 thousand to 101 thousand views, the application
     * would still take into account engagement if the difference is high enough!
     */
    @Test
    void videoScoreCase3() {
        try{
            // Creating two values for scores of different videos that need to be compared.
            double videoScore1 = (double) calcScore.invoke(null, new ArrayList<Object>(List.of(20,200,50,10,26,40,500,400)));
            double videoScore2 = (double) calcScore.invoke(null, new ArrayList<Object>(List.of(5,8,4,8,3,5,1500,30)));

            assert videoScore1 > videoScore2 : "Edge case failed!";
        } catch (IllegalAccessException | InvocationTargetException e) {
            assert false : "There was an issue with the method invocation";
        }
    }

}
