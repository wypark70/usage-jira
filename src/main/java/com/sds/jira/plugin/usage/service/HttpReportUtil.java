package com.sds.jira.plugin.usage.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.apache.log4j.Logger;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HttpReportUtil {
    private static final Logger log = Logger.getLogger(HttpReportUtil.class);
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public static <T> void post(String apiUrl, String apiKey, T body) throws IOException {
        URL url = new URL(apiUrl);
        HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();

        httpURLConnection.setRequestMethod("POST");
        httpURLConnection.setRequestProperty("Authorization", apiKey);
        httpURLConnection.setRequestProperty("Content-Type", "application/json");
        httpURLConnection.setRequestProperty("Accept", "application/json");
        httpURLConnection.setDoInput(true);
        httpURLConnection.setDoOutput(true);

        try (OutputStream outputStream = httpURLConnection.getOutputStream()) {
            byte[] input = gson.toJson(body).getBytes(StandardCharsets.UTF_8);
            outputStream.write(input, 0, input.length);
        }

        try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(httpURLConnection.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder stringBuilder = new StringBuilder();
            String responseLine = null;
            while ((responseLine = bufferedReader.readLine()) != null) {
                stringBuilder.append(responseLine.trim());
            }
            log.debug(stringBuilder.toString());
        }
    }
}
