package com.honours.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

/**
 * This class acts as the initial startup class, launching the entire back-end application.
 */
@SpringBootApplication
public class BackendApplication{

    public static void main(String[] args){
        SpringApplication.run(BackendApplication.class, args);

    }

}
