package com.lilim.ecotracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

@SpringBootApplication
public class EcoTrackerApplication {

    public static void main(String[] args) {
        try {
            Resource resource = new ClassPathResource("/static/index.html");
            System.out.println("Index.html exists: " + resource.exists());
            System.out.println("Path: " + resource.getURL());

            Resource resourceInBrowser = new ClassPathResource("/static/browser/index.html");
            System.out.println("Index.html in browser/ exists: " + resourceInBrowser.exists());
        } catch (Exception e) {
            e.printStackTrace();
        }

        SpringApplication.run(EcoTrackerApplication.class, args);
    }
}

